// =====================================================================
// Klasse controleren met echte gegevens van internet (Claude + web search)
// Gebruikt door recognize (eerste scan van een nieuwe wijn, max. ±15 s)
// en reassess (beheer: bestaande wijnen herzien).
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

export const VERIFY_MODEL = Deno.env.get("VERIFY_MODEL") ?? "claude-sonnet-5-5";
const SEARCH_TOOL_TYPE = Deno.env.get("WEB_SEARCH_TOOL") ?? "web_search_20250305";

const VERIFY_SYSTEM = `You verify rarity data for ONE specific wine for a Dutch wine-collecting app. Use web search, at most 3 searches, for example:
 1. "<producer> <wine> <vintage> price" (wine-searcher, vivino, critics)
 2. "<producer> <wine> kopen" to find Dutch webshops (.nl domains)
Keep your text between searches very short. Then call the "klasse_check" tool exactly once. Never invent ratings, scores or shops: use null / empty when you could not find them. The price is the exception: always give one; if you found nothing concrete, give your best realistic estimate for this vintage and set price_basis to "schatting".

Fields:
- price_eur_low / price_eur_high: typical price in euros for a 75 cl bottle of THIS vintage. For current vintages: Dutch or EU retail. For older vintages (> 10 years) use what this vintage actually sells for now (shops, auctions, wine-searcher average). An old bottle of a simple wine is NOT worth more because it is old; most wine does not improve with age.
- price_basis: "winkel" (shop prices found), "veiling" (auction/secondary market found), "schatting" (nothing concrete found, your estimate).
- nl_shop_urls: URLs of Dutch webshops (.nl) that you actually saw offering this wine (any vintage), one per shop, max 10. Empty if you found none.
- vivino_rating (e.g. 4.1) and vivino_count (number of ratings), null if not found.
- critic_max: highest professional score on a 100-point scale you found for this wine/vintage (Parker, Suckling, Wine Spectator, Decanter, Gambero Rosso converted), null if none.
- ageworthy: true only if this is a wine made for long ageing (great Bordeaux/Burgundy, Barolo, Brunello, vintage Port, top Riesling, vintage Champagne, etc.). false for everyday wines meant to drink young.
- past_peak: true if a bottle of this vintage is most likely past its drinking window.
- classification: "top" (Grand Cru, Premier Grand Cru Classé, 1855 classed growth, Super Tuscan of top standing, DOCG riserva of top producers), "premium" (cru, reserva, Premier Cru, good classified wines), "kwaliteit" (normal appellation wine), "basis" (table wine, generic). Judge actual STANDING, not only the legal category (Tignanello is IGT but "top").
- producer_fame: "wereldberoemd", "gerenommeerd", "regionaal", "merk" (large commercial brand).
- production: "zeer klein" (< 10.000 bottles), "klein", "gemiddeld", "massa".
- iconic: true only for globally iconic wines collectors chase.
- sources: up to 5 URLs you actually used for price, rating or scores (required when you give those).
- note: one short Dutch sentence summarising what you found (no prices in euros).`;

const VERIFY_TOOL = {
  name: "klasse_check",
  description: "Gecontroleerde gegevens over de wijn. Roep deze tool precies één keer aan, na het zoeken.",
  input_schema: {
    type: "object",
    properties: {
      price_eur_low: { type: "number" }, price_eur_high: { type: "number" },
      price_basis: { type: "string", enum: ["winkel", "veiling", "schatting"] },
      nl_shop_urls: { type: "array", items: { type: "string" } },
      vivino_rating: { type: ["number", "null"] }, vivino_count: { type: ["integer", "null"] },
      critic_max: { type: ["integer", "null"] },
      ageworthy: { type: "boolean" }, past_peak: { type: "boolean" },
      classification: { type: "string", enum: ["top", "premium", "kwaliteit", "basis"] },
      producer_fame: { type: "string", enum: ["wereldberoemd", "gerenommeerd", "regionaal", "merk"] },
      production: { type: "string", enum: ["zeer klein", "klein", "gemiddeld", "massa"] },
      iconic: { type: "boolean" },
      sources: { type: "array", items: { type: "string" } },
      note: { type: "string" },
    },
    required: ["price_eur_low", "price_eur_high", "price_basis", "nl_shop_urls", "ageworthy", "past_peak", "classification", "producer_fame", "production", "iconic", "sources", "note"],
  },
};

export type Wine = { naam: string; maker?: string | null; jaar?: number | null; app?: string | null; appellation?: string | null; regio?: string | null; land?: string | null; color?: string | null };
export let LAST_VERIFY_ERR = "";

async function logUsage(model: string, u: Record<string, any> | undefined) {
  try {
    const a = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await a.from("ai_usage").insert({ kind: "opzoeken", model, input_tokens: u?.input_tokens ?? 0, output_tokens: u?.output_tokens ?? 0,
      web_searches: u?.server_tool_use?.web_search_requests ?? 0 });
  } catch (_) { /* negeren */ }
}

function shopCount(urls: unknown): number | null {
  if (!Array.isArray(urls)) return null;
  const doms = new Set<string>();
  for (const u of urls) { try { const h = new URL(String(u)).hostname.replace(/^www\./, ""); if (h.endsWith(".nl")) doms.add(h); } catch (_) { /* geen url */ } }
  return doms.size ? doms.size : null;
}
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);

// Zoekt de wijn op en geeft gecontroleerde signalen terug (of null bij fout/time-out)
export async function verifySignals(w: Wine, timeoutMs = 15000, model = VERIFY_MODEL): Promise<Record<string, unknown> | null> {
  LAST_VERIFY_ERR = "";
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const desc = `Wijn: ${w.naam}\nMaker: ${w.maker || "onbekend"}\nJaargang: ${w.jaar ?? "geen (NV)"}\nHerkomst: ${w.app || w.appellation || ""} (${w.regio || ""}, ${w.land || ""})\nKleur: ${w.color || ""}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctl.signal,
      headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: model, max_tokens: 4000, system: VERIFY_SYSTEM,
        tools: [{ type: SEARCH_TOOL_TYPE, name: "web_search", max_uses: 3, user_location: { type: "approximate", country: "NL" } }, VERIFY_TOOL],
        messages: [{ role: "user", content: desc }],
      }),
    });
    if (!r.ok) { const t = await r.text(); LAST_VERIFY_ERR = `api ${r.status}: ${t.slice(0, 200)}`; console.error("verify", LAST_VERIFY_ERR); return null; }
    const out = await r.json();
    await logUsage(model, out.usage);
    const v = out.content?.find((c: { type: string; name?: string }) => c.type === "tool_use" && c.name === "klasse_check")?.input;
    if (!v) { LAST_VERIFY_ERR = `geen resultaat (stop: ${out.stop_reason})`; return null; }
    const lo = num(v.price_eur_low), hi = num(v.price_eur_high);
    return {
      price_eur_low: lo ?? hi, price_eur_high: hi ?? lo,
      price_basis: v.price_basis ?? "schatting",
      // Aantal NL-webshops zelf tellen (unieke .nl-domeinen); niets gevonden = onbekend, nooit "0 = zeldzaam"
      nl_shops: shopCount(v.nl_shop_urls),
      vivino_rating: num(v.vivino_rating), vivino_count: Number.isInteger(v.vivino_count) ? v.vivino_count : null,
      critic_max: Number.isInteger(v.critic_max) ? v.critic_max : null,
      ageworthy: !!v.ageworthy, past_peak: !!v.past_peak,
      classification: v.classification, producer_fame: v.producer_fame, production: v.production,
      iconic: !!v.iconic,
      sources: Array.isArray(v.sources) ? v.sources.filter((s: unknown) => typeof s === "string" && /^https?:\/\//.test(s)).slice(0, 5) : [],
      note: typeof v.note === "string" ? v.note.slice(0, 300) : "",
      verified: true, verified_at: new Date().toISOString(),
    };
  } catch (e) {
    LAST_VERIFY_ERR = (e as Error)?.name === "AbortError" ? "time-out" : String((e as Error)?.message ?? e);
    console.warn("verify", LAST_VERIFY_ERR);
    return null;
  } finally { clearTimeout(timer); }
}

// Schatting (herkenning) + gecontroleerde gegevens samenvoegen; gecontroleerd gaat voor als het er is
export function mergeSignals(est: Record<string, unknown> | null, ver: Record<string, unknown> | null) {
  const base = { ...(est ?? {}) };
  if (!ver) return base;
  for (const [k, v] of Object.entries(ver)) if (v !== null && v !== undefined) base[k] = v;
  return base;
}
