// =====================================================================
// Vined It – Edge Function "reassess"
// Beoordeelt bestaande wijnen (zonder signalen) opnieuw met Claude, op basis
// van de opgeslagen gegevens (geen foto nodig), en voert de nieuwe klasse door
// op alle kaarten van die wijn. Alleen voor beheerders (ADMIN_EMAILS).
// Per aanroep een beperkt aantal wijnen; de app roept herhaald aan tot alles klaar is.
// Body: { force?: boolean }  – force: ook wijnen die al signalen hebben opnieuw doen
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MODEL = Deno.env.get("VINDIT_MODEL") ?? "claude-haiku-5-5";
const ADMINS = (Deno.env.get("ADMIN_EMAILS") ?? "l.v.uuden3@gmail.com").toLowerCase().split(",").map((x) => x.trim());
const BATCH = 12;
const PUBLISHABLE_FALLBACK = "sb_publishable_vpOCr1D2DfYbpBEcAhdvSg_f1dcs5OA";

const SYSTEM = `You assess wines for a Dutch wine-collecting app and return rarity signals via the "signalen" tool. Estimate honestly from your knowledge; prefer the lower option when unsure.
- price_eur_low / price_eur_high: typical retail price range in a Dutch shop for this exact wine and vintage, in euros (75 cl). Supermarket brands are usually €5–10.
- classification: "basis" (table/country wine, IGP, generic brand), "kwaliteit" (regular AOC/DOC/DO village or regional level), "premium" (Cru, Premier Cru, Riserva, Reserva/Gran Reserva, Grosses Gewächs, Cru Classé, single-vineyard), "top" (Grand Cru, Premier Grand Cru Classé, first growths and equivalent).
- producer_fame: "merk" (mass-market brand or supermarket label), "regionaal" (normal estate or co-op), "gerenommeerd" (well-known quality producer), "wereldberoemd" (world-famous house or estate).
- production: "massa", "gemiddeld", "klein", "zeer klein".
- rarity_nl: "algemeen" (common in Dutch shops), "ongewoon" (specialist shops, unusual region or grape), "zeldzaam" (rarely seen in NL).
- vintage_quality: "top", "goed", "gemiddeld", "slecht" or "onbekend".
- large_format: false unless the data says magnum.
- iconic: true only for truly iconic, world-famous wines.
Do not count medals or awards.`;

const TOOL = {
  name: "signalen",
  description: "Zeldzaamheidssignalen van een wijn",
  input_schema: {
    type: "object",
    properties: {
      price_eur_low: { type: "number" },
      price_eur_high: { type: "number" },
      classification: { type: "string", enum: ["basis", "kwaliteit", "premium", "top"] },
      producer_fame: { type: "string", enum: ["merk", "regionaal", "gerenommeerd", "wereldberoemd"] },
      production: { type: "string", enum: ["massa", "gemiddeld", "klein", "zeer klein"] },
      rarity_nl: { type: "string", enum: ["algemeen", "ongewoon", "zeldzaam"] },
      vintage_quality: { type: "string", enum: ["top", "goed", "gemiddeld", "slecht", "onbekend"] },
      large_format: { type: "boolean" },
      iconic: { type: "boolean" },
    },
    required: ["price_eur_low", "price_eur_high", "classification", "producer_fame", "production", "rarity_nl", "vintage_quality"],
  },
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? PUBLISHABLE_FALLBACK, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ status: "not_authenticated" }, 401);
    if (!ADMINS.includes((user.email ?? "").toLowerCase())) return json({ status: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cols = "id,naam,maker,jaar,druif,stijl,regio,land,appellation,color,is_icon";
    const q = body.force
      ? admin.from("wines").select(cols).order("created_at").range(body.offset ?? 0, (body.offset ?? 0) + BATCH - 1)
      : admin.from("wines").select(cols).is("signals", null).order("created_at").limit(BATCH);
    const { data: wines, error } = await q;
    if (error) throw error;

    const results: unknown[] = [];
    for (const w of wines ?? []) {
      const desc = `Wijn: ${w.naam}\nMaker: ${w.maker || "onbekend"}\nJaargang: ${w.jaar ?? "geen"}\nHerkomst: ${w.appellation || ""} (${w.regio}, ${w.land || ""})\nDruif: ${w.druif || "onbekend"}\nStijl: ${w.stijl || ""}`;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, tools: [TOOL], tool_choice: { type: "tool", name: "signalen" }, messages: [{ role: "user", content: desc }] }),
      });
      if (!r.ok) { console.error("anthropic", r.status, await r.text()); results.push({ id: w.id, error: "ai" }); continue; }
      const out = await r.json();
      const s = out.content?.find((c: { type: string }) => c.type === "tool_use")?.input;
      if (!s) { results.push({ id: w.id, error: "leeg" }); continue; }
      const signals = { ...s, large_format: !!s.large_format, iconic: !!s.iconic, vintage_quality: s.vintage_quality ?? "onbekend" };
      const { data: t, error: e2 } = await admin.rpc("set_wine_signals", { p_wine: w.id, p_signals: signals });
      if (e2) { console.error(e2); results.push({ id: w.id, error: "db" }); continue; }
      results.push({ id: w.id, naam: w.naam, ...t });
    }
    let remaining = 0;
    if (!body.force) {
      const { count } = await admin.from("wines").select("id", { count: "exact", head: true }).is("signals", null);
      remaining = count ?? 0;
    } else {
      remaining = (wines?.length ?? 0) < BATCH ? 0 : 1;
    }
    return json({ status: "ok", done: results.length, remaining, results });
  } catch (e) {
    console.error(e);
    return json({ status: "error", message: String((e as Error)?.message ?? e) }, 500);
  }
});
