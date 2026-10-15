// =====================================================================
// Vined It – Edge Function "recognize"
// Leest een foto van een wijnetiket met Claude en maakt via scan_wine()
// de kaart aan. De API-sleutel staat als geheim in Supabase
// (ANTHROPIC_API_KEY) en komt nooit in de app.
//
// Optionele geheimen:
//   VINDIT_MODEL          – standaard claude-haiku-5-5
//   VINDIT_MONTH_CAP      – max. herkenningen per maand, alle gebruikers samen (standaard 20000)
//   VINDIT_USER_DAY_CAP   – max. herkenningen per gebruiker per dag (standaard 15; testers krijgen 5x hun dagelimiet)
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MODEL = Deno.env.get("VINDIT_MODEL") ?? "claude-haiku-5-5";
const MONTH_CAP = Number(Deno.env.get("VINDIT_MONTH_CAP") ?? "20000");
const USER_DAY_CAP = Number(Deno.env.get("VINDIT_USER_DAY_CAP") ?? "15");
const PUBLISHABLE_FALLBACK = "sb_publishable_vpOCr1D2DfYbpBEcAhdvSg_f1dcs5OA";

const SYSTEM = `You read photos of wine bottle labels for a Dutch wine-collecting app and return structured data via the "wijnetiket" tool.

Rules:
- is_wine_label: false if the photo does not clearly show a wine label (beer, spirits, a menu, no label, unreadable). Then fill the other fields as best you can or with empty strings.
- confidence: 0..1, how sure you are the producer and wine name are read correctly.
- naam: the wine/cuvée name WITHOUT vintage and without the producer. If the label has no separate cuvée name, use the appellation or grape as printed (e.g. "Chablis", "Sauvignon Blanc"). Keep original spelling and accents.
- maker: the producer/estate exactly as printed (e.g. "Domaine Laroche", "Château Lynch-Bages", "Bodegas Muga"). For négociant/supermarket brands use the brand.
- jaar: vintage as a 4-digit number, or null if non-vintage/not visible.
- druif: grape(s) as display text in Dutch-friendly form (e.g. "Merlot, Cabernet Franc"). Infer from the appellation if not printed (Chablis → Chardonnay, Sancerre → Sauvignon Blanc, Barolo → Nebbiolo, Rioja → Tempranillo).
- grape: the single MAIN grape only if it is a single-varietal wine or clearly dominant (≥75%), else "". Use international names: "Cabernet Sauvignon", "Merlot", "Pinot Noir", "Chardonnay", "Sauvignon Blanc", "Syrah" (also for Shiraz), "Riesling", "Grenache" (also Garnacha), "Tempranillo", "Sangiovese", "Nebbiolo", "Gamay", "Chenin Blanc", "Malbec", "Pinot Gris", "Gewurztraminer", "Pinot Blanc", "Muscat", etc.
- app: the official appellation / region of origin as printed, in its own language with correct accents (e.g. "Saint-Émilion Grand Cru", "Côtes du Rhône Villages", "Chianti Classico", "Rioja", "Ribera del Duero", "Mosel", "Marlborough", "Barossa Valley", "Western Cape", "Champagne", "Alsace", "Crémant d'Alsace", "Pays d'Oc", "Prosecco", "Cava"). For Etna use "Etna Rosso" or "Etna Bianco". For Burgundy villages use the village appellation (e.g. "Gevrey-Chambertin").
- regio: one of these codes when it applies, otherwise a short lowercase code of the wine region without spaces (e.g. "douro", "mosel", "mendoza"):
  bordeaux, bourgogne (NOT Beaujolais), beaujolais, jura, rhone, loire, champagne, elzas (Alsace), languedoc (incl. Roussillon), provence, zuidwest (South-West France: Cahors, Bergerac, Gascogne, Madiran…), toscane, piemonte, veneto, sicilie, rioja, nieuw-zeeland (any New Zealand wine), californie, oregon, washington.
- land: country in DUTCH: Frankrijk, Italië, Spanje, Portugal, Duitsland, Oostenrijk, Nederland, Verenigd Koninkrijk, Zuid-Afrika, Chili, Argentinië, Verenigde Staten, Australië, Nieuw-Zeeland, Griekenland, Hongarije, Georgië, Libanon, Uruguay, België, Zwitserland, Canada, Japan, Israël, Kroatië, Luxemburg, or another country name in Dutch.
- stijl: short Dutch style description, e.g. "Rood, vol", "Wit, fris", "Mousserend, droog", "Rosé, droog", "Wit, zoet".
- style: stil | mousserend | zoet | versterkt.
- color: rood | wit | rosé (sparkling white = wit).
- tags: only these lowercase values when they apply: joven, crianza, reserva, gran reserva, rioja alta, rioja alavesa, rioja oriental, crémant, brut, blanc de blancs, blanc de noirs, brut nature, millésime, prestige, récoltant, vin jaune, grand cru, vendanges tardives, pét-nat. ("crémant" for any Crémant; "récoltant" if the label shows RM / récoltant-manipulant; "prestige" for a house's top cuvée; "brut nature" also for Extra Brut / zero dosage.)
- Iconic wines: if the wine is one of these, use EXACTLY this naam / maker:
  Cloudy Bay Sauvignon Blanc / Cloudy Bay · Tignanello / Marchesi Antinori · Dom Pérignon / Moët & Chandon · Krug Grande Cuvée / Krug · Sassicaia / Tenuta San Guido · Vega Sicilia Único / Vega Sicilia · Château d'Yquem / Château d'Yquem · Penfolds Grange / Penfolds · Opus One / Opus One · Château Margaux / Château Margaux · Pétrus / Pétrus · Romanée-Conti / Domaine de la Romanée-Conti.
- Be consistent: the same wine photographed twice must give the same naam and maker.
- label_box: where the main front label is in the photo, in PERCENT of the image (0–100): x and y = top-left corner, w and h = width and height. Cover the whole paper label (all its edges), not the glass or the capsule. If several labels are visible, take the main one with the wine name.

Rarity signals (used to decide the card class; estimate honestly, prefer the lower option when unsure):
- price_eur_low / price_eur_high: typical retail price range in a Dutch shop for this exact wine and vintage, in euros (75 cl). Use your knowledge of the producer, appellation and vintage. Supermarket brands are usually €5–10.
- classification: "basis" (table/country wine, IGP, generic brand), "kwaliteit" (regular AOC/DOC/DO village or regional level), "premium" (Cru, Premier Cru, Riserva, Reserva/Gran Reserva, Grosses Gewächs, Cru Classé, single-vineyard), "top" (Grand Cru, Premier Grand Cru Classé, first growths and equivalent top tiers).
- producer_fame: "merk" (mass-market brand, e.g. Barefoot, Jacob's Creek, supermarket labels), "regionaal" (normal estate or co-op), "gerenommeerd" (well-known quality producer among wine lovers), "wereldberoemd" (world-famous house or estate).
- production: "massa" (millions of bottles), "gemiddeld", "klein" (small estate, single vineyard), "zeer klein" (tiny/numbered/cult).
- rarity_nl: how hard to find in the Netherlands: "algemeen" (common in shops), "ongewoon" (specialist shops, unusual region or grape), "zeldzaam" (rarely seen in NL: e.g. Georgia, Lebanon, Jura vin jaune, rare grapes).
- vintage_quality: quality of this vintage for this region: "top", "goed", "gemiddeld", "slecht", or "onbekend" if non-vintage or you don't know the region's vintages.
- large_format: true only if the label shows a magnum or larger (1,5 L+).
- iconic: true only for truly iconic, world-famous wines (e.g. Pétrus, Opus One, DRC, Sassicaia, Krug).
Do NOT count medals, stickers or competition awards.

Label design (label_style): describe the FRONT label so the app can draw a simplified, generic illustration of it in its own style. Describe what you see, do not copy logos exactly.
- paper / ink / accent: hex colors of the label paper, the main text and the most striking accent color (e.g. a red seal).
- metal: "gold", "silver" or "none" if the label has metallic foil.
- font: letter style of the wine name: "condensed" (tall narrow), "classic" (old-style serif), "didone" (high-contrast elegant serif), "script" (handwriting), "gothic" (blackletter), "modern" (clean sans-serif), "display" (decorative art-deco).
- upper: true if the name is in capitals.
- layout: where the name sits: "top", "center" or "bottom".
- emblem: the main picture: type "crest" (coat of arms, shield, crown), "castle" (château, building), "sun" (striped or round sun/circle), "abstract" (colourful shape), "bull" (animal), "grapes", "leaf", "stars" or "none"; color as hex, or "metal"; size "normal" or "large".
- mark: an optional second, smaller graphic element (same types), with color; omit if none.
- border: "none", "thin", "double", "frame" (thick) or "band" (colored band at the bottom); border_color as hex or "metal".
- name_color: hex or "metal" if the name is printed in foil, else omit.
- lines: name = wine name as printed most prominently; top = small line above (e.g. "Grand Vin de Bordeaux"); sub = appellation or cuvée line; bottom = producer or small line at the bottom. Keep each line short (max ~30 characters).`;

const TOOL = {
  name: "wijnetiket",
  description: "Gestructureerde gegevens van een wijnetiket",
  input_schema: {
    type: "object",
    properties: {
      is_wine_label: { type: "boolean" },
      confidence: { type: "number" },
      naam: { type: "string" },
      maker: { type: "string" },
      jaar: { type: ["integer", "null"] },
      druif: { type: "string" },
      grape: { type: "string" },
      app: { type: "string" },
      regio: { type: "string" },
      land: { type: "string" },
      stijl: { type: "string" },
      style: { type: "string", enum: ["stil", "mousserend", "zoet", "versterkt"] },
      color: { type: "string", enum: ["rood", "wit", "rosé"] },
      tags: { type: "array", items: { type: "string" } },
      price_eur_low: { type: "number" },
      price_eur_high: { type: "number" },
      classification: { type: "string", enum: ["basis", "kwaliteit", "premium", "top"] },
      producer_fame: { type: "string", enum: ["merk", "regionaal", "gerenommeerd", "wereldberoemd"] },
      production: { type: "string", enum: ["massa", "gemiddeld", "klein", "zeer klein"] },
      rarity_nl: { type: "string", enum: ["algemeen", "ongewoon", "zeldzaam"] },
      vintage_quality: { type: "string", enum: ["top", "goed", "gemiddeld", "slecht", "onbekend"] },
      large_format: { type: "boolean" },
      iconic: { type: "boolean" },
      label_style: {
        type: "object",
        properties: {
          paper: { type: "string" }, ink: { type: "string" }, accent: { type: "string" },
          metal: { type: "string", enum: ["gold", "silver", "none"] },
          font: { type: "string", enum: ["condensed", "classic", "didone", "script", "gothic", "modern", "display"] },
          upper: { type: "boolean" },
          layout: { type: "string", enum: ["top", "center", "bottom"] },
          emblem: { type: "object", properties: { type: { type: "string", enum: ["crest", "castle", "sun", "abstract", "bull", "grapes", "leaf", "stars", "none"] }, color: { type: "string" }, size: { type: "string", enum: ["normal", "large"] } } },
          mark: { type: "object", properties: { type: { type: "string", enum: ["crest", "castle", "sun", "abstract", "bull", "grapes", "leaf", "stars", "none"] }, color: { type: "string" } } },
          border: { type: "string", enum: ["none", "thin", "double", "frame", "band"] },
          border_color: { type: "string" },
          name_color: { type: "string" },
          lines: { type: "object", properties: { name: { type: "string" }, top: { type: "string" }, sub: { type: "string" }, bottom: { type: "string" } } },
        },
        required: ["paper", "ink", "accent", "font", "layout", "emblem"],
      },
      label_box: {
        type: "object",
        properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } },
        required: ["x", "y", "w", "h"],
      },
    },
    required: ["is_wine_label", "confidence", "naam", "maker", "app", "regio", "land", "style", "color", "price_eur_low", "price_eur_high", "classification", "producer_fame", "production", "rarity_nl", "vintage_quality"],
  },
};

// Alleen bekende velden en geldige kleuren doorlaten
const HEX = /^#[0-9a-fA-F]{6}$/;
function cleanStyle(s: Record<string, unknown>) {
  const col = (v: unknown) => (typeof v === "string" && (HEX.test(v) || v === "metal") ? v : undefined);
  const str = (v: unknown, n = 40) => (typeof v === "string" ? v.slice(0, n) : undefined);
  const obj = (v: unknown) => (v && typeof v === "object" ? v as Record<string, unknown> : {});
  const e = obj(s.emblem), m = obj(s.mark), l = obj(s.lines);
  return {
    paper: col(s.paper), ink: col(s.ink), accent: col(s.accent), metal: str(s.metal, 8),
    font: str(s.font, 12), upper: s.upper !== false, layout: str(s.layout, 8),
    emblem: { type: str(e.type, 12) ?? "none", color: col(e.color), size: str(e.size, 8) },
    mark: m.type && m.type !== "none" ? { type: str(m.type, 12), color: col(m.color) } : undefined,
    border: str(s.border, 8), border_color: col(s.border_color), name_color: col(s.name_color),
    lines: { name: str(l.name), top: str(l.top), sub: str(l.sub), bottom: str(l.bottom) },
  };
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? PUBLISHABLE_FALLBACK, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ status: "not_authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const image: string = body.image ?? "";
    const mediaType: string = body.mediaType ?? "image/jpeg";
    if (!image || image.length > 5_000_000) return json({ status: "bad_image" }, 400);

    // Budget en daglimiet (alleen de server kan dit aanpassen)
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: claim, error: claimErr } = await admin.rpc("claim_recognition", {
      p_user: user.id, p_month_cap: MONTH_CAP, p_day_cap: USER_DAY_CAP,
    });
    if (claimErr) throw claimErr;
    if (claim !== "ok") return json({ status: claim });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1300,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "wijnetiket" },
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: "Lees dit wijnetiket." },
          ],
        }],
      }),
    });
    if (!r.ok) {
      console.error("anthropic", r.status, await r.text());
      return json({ status: "ai_error" }, 502);
    }
    const out = await r.json();
    const w = out.content?.find((c: { type: string }) => c.type === "tool_use")?.input;
    if (!w || !w.is_wine_label || (w.confidence ?? 0) < 0.5 || !w.naam) {
      return json({ status: "not_recognized", wine: w ?? null });
    }

    const payload = {
      naam: String(w.naam).trim(),
      maker: String(w.maker ?? "").trim(),
      jaar: Number.isInteger(w.jaar) ? w.jaar : null,
      druif: w.druif ?? "",
      stijl: w.stijl ?? "",
      regio: String(w.regio || "overig").toLowerCase().replace(/\s+/g, "-"),
      land: w.land ?? "",
      app: w.app ?? "",
      grape: w.grape ?? "",
      style: w.style ?? "stil",
      color: w.color ?? "",
      tags: Array.isArray(w.tags) ? w.tags.map((t: string) => String(t).toLowerCase()) : [],
      signals: {
        price_eur_low: Number(w.price_eur_low) || null,
        price_eur_high: Number(w.price_eur_high) || null,
        classification: w.classification ?? null,
        producer_fame: w.producer_fame ?? null,
        production: w.production ?? null,
        rarity_nl: w.rarity_nl ?? null,
        vintage_quality: w.vintage_quality ?? "onbekend",
        large_format: !!w.large_format,
        iconic: !!w.iconic,
      },
    };
    const { data: result, error: scanErr } = await userClient.rpc("scan_wine", { p_wine: payload });
    if (scanErr) throw scanErr;
    // Etiketontwerp bewaren bij de wijn (alleen als die er nog geen heeft)
    let labelStyle = null;
    if (w.label_style && typeof w.label_style === "object" && result?.wine?.id) {
      labelStyle = cleanStyle(w.label_style);
      if (!result.wine.label_style) {
        const { error: lsErr } = await admin.rpc("set_label_style", { p_wine: result.wine.id, p_style: labelStyle });
        if (lsErr) console.error("label_style", lsErr); else result.wine.label_style = labelStyle;
      }
    }
    const lb = w.label_box && ["x", "y", "w", "h"].every((k) => typeof w.label_box[k] === "number") ? w.label_box : null;
    return json({ status: "ok", recognized: payload, confidence: w.confidence, result, label_box: lb, label_style: labelStyle });
  } catch (e) {
    console.error(e);
    return json({ status: "error", message: String((e as Error)?.message ?? e) }, 500);
  }
});
