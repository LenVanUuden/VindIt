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
import { mergeSignals, verifySignals } from "../_shared/verify.ts";

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
- real_bottle: true only if the photo shows a real, physical bottle or label held in front of the camera (glass, curvature, light reflections, a real-world background). false if it is a photo of a SCREEN (pixels, moiré stripes, screen glare, phone or monitor bezels, app or website interface, browser bars), a SCREENSHOT or webshop image (perfectly flat, studio-white background, watermarks such as wine-searcher), a printout, magazine, menu or catalogue page. When unsure, true.
- naam: the wine/cuvée name WITHOUT vintage and without the producer. If the label has no separate cuvée name, use the appellation or grape as printed (e.g. "Chablis", "Sauvignon Blanc"). Keep original spelling and accents.
  If the main wine simply carries the estate name (typical for a Bordeaux château or a domaine's grand vin), naam = the full estate name exactly as printed, including "Château"/"Domaine" (e.g. naam "Château Rozier", maker "Château Rozier"), never a shortened "Rozier".
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
- Legendary and famous wines: if the wine is one of these, use EXACTLY this naam / maker (only for that exact wine, not for second wines such as Carruades de Lafite, Pavillon Rouge or Le Petit Mouton):
  Romanée-Conti / Domaine de la Romanée-Conti · Échezeaux / Domaine de la Romanée-Conti · Musigny / Comte Georges de Vogüé · Pétrus / Pétrus · Le Pin / Le Pin · Château Lafite Rothschild / Château Lafite Rothschild · Château Mouton Rothschild / Château Mouton Rothschild · Château Margaux / Château Margaux · Château Cheval Blanc / Château Cheval Blanc · Château d'Yquem / Château d'Yquem · Salon Le Mesnil / Salon · Château Rayas / Château Rayas · Masseto / Masseto · Brunello di Montalcino Riserva / Biondi-Santi · Barolo Monfortino Riserva / Giacomo Conterno · Vega Sicilia Único / Vega Sicilia · Pingus / Dominio de Pingus · Scharzhofberger Riesling Trockenbeerenauslese / Egon Müller · Screaming Eagle Cabernet Sauvignon / Screaming Eagle · Penfolds Grange / Penfolds · Quinta do Noval Nacional / Quinta do Noval · Cloudy Bay Sauvignon Blanc / Cloudy Bay · Tignanello / Marchesi Antinori · Dom Pérignon / Moët & Chandon · Krug Grande Cuvée / Krug · Sassicaia / Tenuta San Guido · Opus One / Opus One.
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
- iconic: true only for truly iconic, world-famous wines (e.g. Pétrus, Lafite, DRC, Screaming Eagle).
Do NOT count medals, stickers or competition awards.

Label design (label_style): describe the FRONT label so the app can draw a simplified illustration of it in its own style. Goal: someone holding the real bottle must immediately recognise the drawn label. So copy the overall look faithfully: the paper colour, the order of the elements from top to bottom (layout), which lines are in colour, capitals or not, the kind of picture and the frame around it, the border. Do not copy logos exactly.
- paper / ink / accent: hex colors of the label paper, the main text and the most striking accent color (e.g. a red seal).
- metal: "gold", "silver" or "none" if the label has metallic foil.
- font: letter style of the wine name: "condensed" (tall narrow), "classic" (old-style serif), "didone" (high-contrast elegant serif), "script" (handwriting), "gothic" (blackletter), "modern" (clean sans-serif), "display" (decorative art-deco).
- upper: true if the name is in capitals.
- layout: where the name sits: "top", "center" or "bottom".
- emblem: the main picture. type: "chateau" (classic château façade, the usual Bordeaux engraving), "castle" (fortress or tower castle), "church" (church, abbey, monastery), "farmhouse" (country house, farm, mas, cascina, finca), "winery" (modern building), "crest" (coat of arms, shield, crown), "sun" (striped or round sun/circle), "abstract" (only a non-figurative colourful shape), "bull" (bull, cow or other animal), "horse", "bird", "flower", "tree", "grapes", "leaf", "stars" or "none". Pick the type that matches what is really drawn: a bird is "bird", a flower is "flower". A drawing, engraving or photo of a building is always one of the five building types, never "abstract". color as hex (an engraving in grey ink: use that grey), or "metal"; size "normal" or "large"; frame: the shape around the picture on the real label: "oval", "circle", "square", "arch" or "none" (only if there really is a visible frame or medallion).
- mark: an optional second, smaller graphic element (same types), with color; omit if none.
- border: "none", "thin", "double", "frame" (thick) or "band" (colored band at the bottom); border_color as hex or "metal".
- name_color: hex or "metal" if the name is printed in foil, else omit.
- sub_color: hex if the appellation line is printed in a striking colour (e.g. red capitals), else omit.
- layout "top" means: name at the top, picture below it, appellation below the picture.
- lines: name = wine name as printed most prominently; top = small line above (e.g. "Grand Vin de Bordeaux"); sub = appellation or cuvée line; bottom = producer or small line at the bottom. Copy every text EXACTLY as printed on the label (same words, same language, same spelling and accents; do not translate or rephrase). Keep each line short (max ~30 characters); if a line is longer, take the most prominent part word for word.`;

const TOOL = {
  name: "wijnetiket",
  description: "Gestructureerde gegevens van een wijnetiket",
  input_schema: {
    type: "object",
    properties: {
      is_wine_label: { type: "boolean" },
      real_bottle: { type: "boolean" },
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
          emblem: { type: "object", properties: { type: { type: "string", enum: ["chateau", "castle", "church", "farmhouse", "winery", "crest", "sun", "abstract", "bull", "horse", "bird", "flower", "tree", "grapes", "leaf", "stars", "none"] }, color: { type: "string" }, size: { type: "string", enum: ["normal", "large"] }, frame: { type: "string", enum: ["none", "oval", "circle", "square", "arch"] } } },
          mark: { type: "object", properties: { type: { type: "string", enum: ["chateau", "castle", "church", "farmhouse", "winery", "crest", "sun", "abstract", "bull", "horse", "bird", "flower", "tree", "grapes", "leaf", "stars", "none"] }, color: { type: "string" } } },
          border: { type: "string", enum: ["none", "thin", "double", "frame", "band"] },
          border_color: { type: "string" },
          name_color: { type: "string" },
          sub_color: { type: "string" },
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
    required: ["is_wine_label", "real_bottle", "confidence", "naam", "maker", "app", "regio", "land", "style", "color", "price_eur_low", "price_eur_high", "classification", "producer_fame", "production", "rarity_nl", "vintage_quality"],
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
    emblem: { type: str(e.type, 12) ?? "none", color: col(e.color), size: str(e.size, 8), frame: str(e.frame, 8) },
    mark: m.type && m.type !== "none" ? { type: str(m.type, 12), color: col(m.color) } : undefined,
    border: str(s.border, 8), border_color: col(s.border_color), name_color: col(s.name_color), sub_color: col(s.sub_color),
    lines: { name: str(l.name), top: str(l.top), sub: str(l.sub), bottom: str(l.bottom) },
  };
}


// ---------- Etiket zelf tekenen (vrije opbouw) ----------
// Een sterker model bekijkt het etiket, noemt de herkenbare elementen en tekent ze
// zelf op een leeg etiket van 300 × 400. De app tekent het na (alleen eenvoudige vormen).
const DRAW_MODELS: Record<string, string> = {
  opus: Deno.env.get("LABEL_MODEL_OPUS") ?? "claude-opus-5-5",
  sonnet: Deno.env.get("LABEL_MODEL_SONNET") ?? "claude-sonnet-5-5",
  fable: Deno.env.get("LABEL_MODEL_FABLE") ?? "claude-fable-5-1",
};
const DRAW_SYSTEM = `You redraw wine labels for a Dutch wine-collecting app. The app shows a simplified illustration of the FRONT label; someone holding the real bottle must recognise it at a glance. Return the drawing via the "tekening" tool.

Step 1 – key: list the 2 to 5 most recognisable elements of this label (e.g. "tall narrow black name", "red striped sun lower centre", "gold coat of arms under the year", "mountain range along the top edge").
Step 2 – draw the label on an empty label of 300 wide × 400 high (y = 0 at the top). Place every element where it really is, with its real size, colour and capitals. Leave out small print; show a block of small text as "lines".

Elements (els), in drawing order:
- {"t":"text","s":"…","y":baseline,"size":font size,"font":"condensed|classic|didone|script|gothic|modern|display","weight":400-900,"color":"#hex" or "metal","ls":letter spacing,"italic":bool,"upper":bool,"w":optional exact width,"x":optional,"align":"center|left|right"}. Copy text EXACTLY as printed (same words, language, accents). Use "{year}" for the vintage.
- {"t":"art","x":…,"y":…,"w":…,"h":…,"svg":"…"}: your own simplified drawing of a picture, emblem, crest, building, animal, sun, mountains etc. The svg uses a 0–100 × 0–100 coordinate box that is stretched to w × h, so choose w:h close to the real proportions. Allowed: path, circle, ellipse, rect, polygon, polyline, line, g with fill, stroke, stroke-width, opacity, fill-opacity, stroke-opacity, transform, stroke-linecap, stroke-linejoin. Colours as hex, "none" or "metal" (gold or silver foil). No text inside svg, no gradients, no images. Keep it clean: 3 to 40 shapes. Draw a recognisable simplified version, not an exact copy of a logo or artwork.
- {"t":"lines","x":…,"y":…,"w":…,"h":…,"cols":1-3,"color":"#hex"}: a block of small print.
- {"t":"rule","y":…,"w":…,"thick":…,"color":"#hex"}: a horizontal line or colour band.

Also: paper (label colour, hex), ink (main text colour), metal ("gold","silver","none"), border ("none","thin","double","frame") and border_color. Typical sizes: main name 26–44, small lines 6–10. Keep everything inside the label.
Always answer by calling the "tekening" tool exactly once (no other text).`;
const DRAW_SCHEMA = {
  type: "object",
  properties: {
    key: { type: "array", items: { type: "string" } },
    paper: { type: "string" }, ink: { type: "string" },
    metal: { type: "string", enum: ["gold", "silver", "none"] },
    border: { type: "string", enum: ["none", "thin", "double", "frame"] }, border_color: { type: "string" },
    els: { type: "array", items: { type: "object", properties: {
      t: { type: "string", enum: ["text", "art", "lines", "rule"] },
      s: { type: "string" }, x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" },
      size: { type: "number" }, font: { type: "string" }, weight: { type: "number" }, color: { type: "string" },
      ls: { type: "number" }, italic: { type: "boolean" }, upper: { type: "boolean" }, align: { type: "string" },
      svg: { type: "string" }, cols: { type: "number" }, thick: { type: "number" } }, required: ["t"] } },
  },
  required: ["key", "paper", "ink", "els"],
};
function cleanDraw(s: Record<string, unknown>) {
  const col = (v: unknown) => (typeof v === "string" && (/^#[0-9a-fA-F]{6}$/.test(v) || v === "metal") ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? Math.round(v * 10) / 10 : undefined);
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  const els = (Array.isArray(s.els) ? s.els : []).slice(0, 24).map((e: Record<string, unknown>) => ({
    t: str(e.t, 6), s: str(e.s, 48), x: num(e.x), y: num(e.y), w: num(e.w), h: num(e.h), size: num(e.size),
    font: str(e.font, 12), weight: num(e.weight), color: col(e.color), ls: num(e.ls), italic: e.italic === true || undefined,
    upper: e.upper === true || undefined, align: str(e.align, 6), svg: str(e.svg, 6000), cols: num(e.cols), thick: num(e.thick),
  })).filter((e) => ["text", "art", "lines", "rule"].includes(e.t ?? ""));
  if (!els.length) return null;
  return { v: 2, key: (Array.isArray(s.key) ? s.key : []).slice(0, 6).map((k) => String(k).slice(0, 80)),
    paper: col(s.paper), ink: col(s.ink), metal: str(s.metal, 8), border: str(s.border, 8), border_color: col(s.border_color), els };
}
let LAST_DRAW_ERR = "";
async function drawLabel(model: string, img: string | null, mediaType: string, desc: string) {
  const content: unknown[] = img ? [{ type: "image", source: { type: "base64", media_type: mediaType, data: img } }, { type: "text", text: desc }] : [{ type: "text", text: desc + "\nGeen foto: teken het echte etiket zoals je het kent; ken je de wijn niet, ontwerp dan een passend, geloofwaardig etiket." }];
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: DRAW_MODELS[model] ?? DRAW_MODELS.opus, max_tokens: 8000, system: DRAW_SYSTEM,
      tools: [{ name: "tekening", description: "Tekening van het etiket. Roep deze tool altijd precies één keer aan.", input_schema: DRAW_SCHEMA }], tool_choice: { type: "auto" },
      messages: [{ role: "user", content }] }),
  });
  if (!r.ok) { const t = await r.text(); console.error("draw", r.status, t); LAST_DRAW_ERR = `api ${r.status}: ${t.slice(0, 160)}`; return null; }
  const out = await r.json();
  await logAI("tekenen", DRAW_MODELS[model] ?? DRAW_MODELS.opus, out.usage);
  // Nieuwere modellen ondersteunen geen verplichte tool-keuze: neem de tool-aanroep, of anders JSON uit de tekst
  let st = out.content?.find((c: { type: string }) => c.type === "tool_use")?.input;
  if (!st) {
    const txt = (out.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) { try { st = JSON.parse(m[0]); } catch (_) { /* geen geldige JSON */ } }
  }
  if (!st) { LAST_DRAW_ERR = `geen tekening (stop: ${out.stop_reason})`; return null; }
  const clean = cleanDraw(st);
  if (!clean) LAST_DRAW_ERR = `leeg (stop: ${out.stop_reason}, elementen: ${Array.isArray(st.els) ? st.els.length : typeof st.els})`;
  return clean;
}

// AI-gebruik vastleggen voor het beheerderscentrum (kosten per maand); fouten hier mogen nooit iets breken
async function logAI(kind: string, model: string, u: { input_tokens?: number; output_tokens?: number } | undefined) {
  try {
    const a = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await a.from("ai_usage").insert({ kind, model, input_tokens: u?.input_tokens ?? 0, output_tokens: u?.output_tokens ?? 0 });
  } catch (_) { /* negeren */ }
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// ---------- Legende: tweede foto (achterkant van dezelfde fles) ----------
const BACK_SYSTEM = `You verify a second photo for a Dutch wine-collecting app. The user claims a legendary wine and must show the BACK (or side) of the same physical bottle. You get the details read from the front label and a new photo. Answer via the "achterkant" tool.
- real_bottle: true only if this is a real, physical bottle in front of the camera (glass, curvature, light, real background). false for a screen, screenshot, webshop image, printout or magazine. When unsure, true.
- is_back_side: true if the photo shows another side of the bottle than the front label: the back label, the side, the neck label, the capsule or cork top, or simply the bare back of the bottle. Many older or prestigious bottles have NO back label at all: a photo of the bare glass back, the capsule or the neck is then fine. false only if it shows the same front label again (straight on).
- same_wine: true if what you see fits the claimed producer and wine (producer name, address, château, importer sticker for that wine, matching capsule or seal, the front label visible through the glass). false only if it clearly belongs to a different wine. If the photo shows little or no text (bare glass, plain capsule) but nothing contradicts, true.
- vintage_seen: the vintage year if visible on this photo, else "".
- reason: one short sentence in Dutch explaining a rejection (empty when everything is fine).`;
const BACK_TOOL = { name: "achterkant", description: "Controle van de achterkant", input_schema: { type: "object", properties: {
  real_bottle: { type: "boolean" }, is_back_side: { type: "boolean" }, same_wine: { type: "boolean" }, vintage_seen: { type: "string" }, reason: { type: "string" } },
  required: ["real_bottle", "is_back_side", "same_wine", "vintage_seen", "reason"] } };
async function checkBack(image: string, mediaType: string, p: Record<string, unknown>) {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST",
    headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 400, system: BACK_SYSTEM, tools: [BACK_TOOL], tool_choice: { type: "tool", name: "achterkant" },
      messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType, data: image } },
        { type: "text", text: `Voorkant gelezen: wijn "${p.naam}", maker "${p.maker}", jaargang ${p.jaar ?? "onbekend"}, ${p.app || ""} ${p.land || ""}. Is dit de achterkant van dezelfde fles?` }] }] }) });
  if (!r.ok) { console.error("back", r.status, await r.text()); return null; }
  const out = await r.json();
  await logAI("achterkant", MODEL, out.usage);
  return out.content?.find((c: { type: string }) => c.type === "tool_use")?.input ?? null;
}

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
    const isAdminUser = (user.email ?? "").toLowerCase() === "l.v.uuden3@gmail.com";

    // Tweede stap bij een Legende: de achterkant
    if (body.mode === "back") {
      const { data: chk } = await admin.from("legend_checks").select("*").eq("id", String(body.check ?? "")).eq("user_id", user.id).maybeSingle();
      if (!chk || chk.used || Date.now() - new Date(chk.created_at).getTime() > 5 * 60 * 1000) return json({ status: "back_expired" });
      const p = chk.payload as Record<string, unknown>;
      const v = await checkBack(image, mediaType, p);
      if (!v) return json({ status: "ai_error" }, 502);
      const vs = String(v.vintage_seen ?? "").match(/(18|19|20)\d\d/)?.[0];
      const yearOk = !vs || !p.jaar || Number(vs) === Number(p.jaar);
      const ok = (v.real_bottle !== false || isAdminUser) && v.is_back_side && v.same_wine && yearOk;
      if (!ok) {
        const reason = !yearOk ? `Op de achterkant staat ${vs}, op de voorkant ${p.jaar}. Dat moet dezelfde fles zijn.`
          : v.real_bottle === false ? "Dit lijkt een foto van een scherm of drukwerk." : !v.is_back_side ? "Dit lijkt weer de voorkant. Draai de fles om." : (v.reason || "Deze achterkant past niet bij de wijn van de voorkant.");
        return json({ status: "back_failed", reason });
      }
      await admin.from("legend_checks").update({ used: true }).eq("id", chk.id);
      const { data: result, error: scanErr } = await userClient.rpc("scan_wine", { p_wine: p });
      if (scanErr) throw scanErr;
      return json({ status: "ok", recognized: p, confidence: 1, result, label_box: chk.label_box, verified: true });
    }

    // temperature 0: dezelfde foto geeft zo vaker dezelfde schatting (en dus dezelfde klasse).
    // Weigert het model dat, dan nog één keer zonder.
    const ask = (withTemp: boolean) => fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1300,
        ...(withTemp ? { temperature: 0 } : {}),
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
    let r = await ask(true);
    if (r.status === 400) {
      const t = await r.text();
      if (/temperature/i.test(t)) { console.warn("temperature geweigerd, opnieuw zonder"); r = await ask(false); }
      else { console.error("anthropic", 400, t); return json({ status: "ai_error" }, 502); }
    }
    if (!r.ok) {
      console.error("anthropic", r.status, await r.text());
      return json({ status: "ai_error" }, 502);
    }
    const out = await r.json();
    await logAI("herkenning", MODEL, out.usage);
    const w = out.content?.find((c: { type: string }) => c.type === "tool_use")?.input;
    // Geen kaart voor een foto van een scherm, screenshot of drukwerk (beheerder mag testen)
    if (w && w.is_wine_label && w.real_bottle === false && !isAdminUser) {
      return json({ status: "not_real", wine: { naam: w.naam ?? "" } });
    }
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
    // Legende of Ultra die je nog niet hebt? Eerst een foto van de achterkant (twee-stapscontrole)
    {
      type W = { id: string; is_icon: boolean; tier: string | null; tier_override: string | null; signals: unknown };
      let lw: W | null = null;
      const key = `${payload.maker.toLowerCase()}|${payload.naam.toLowerCase()}`;
      const { data: ex } = await admin.from("wines").select("id,is_icon,tier,tier_override,signals").eq("wine_key", key).maybeSingle();
      lw = (ex as W) ?? null;
      if (!lw) { const { data: sm } = await admin.rpc("find_same_wine", { p_wine: payload }); if (sm && sm.id) lw = sm as W; }
      // Nieuwe wijn (nog geen klasse)? Eerst de echte gegevens opzoeken: prijs van dit jaar, NL-webshops, critici (max. 15 s)
      // Standaard aan (±6 cent per nieuwe wijn); uitzetten met het geheim VERIFY_ON_SCAN=0
      if (Deno.env.get("VERIFY_ON_SCAN") !== "0" && !lw?.is_icon && !(lw && lw.signals)) {
        const ver = await verifySignals({ naam: payload.naam, maker: payload.maker, jaar: payload.jaar, app: payload.app, regio: payload.regio, land: payload.land, color: payload.color }, 15000);
        if (ver) payload.signals = mergeSignals(payload.signals, ver) as typeof payload.signals;
      }
      // Klasse zoals scan_wine hem zou geven
      let tierNext: string | null = null;
      if (lw?.is_icon) tierNext = "icon";
      else if (lw && (lw.tier_override || (lw.signals && lw.tier))) tierNext = lw.tier_override || lw.tier;
      else { const { data: t } = await admin.rpc("wine_tier", { p_s: payload.signals, p_jaar: payload.jaar, p_color: payload.color || null, p_is_icon: false }); tierNext = (t as { tier?: string })?.tier ?? null; }
      if (tierNext === "icon" || tierNext === "ultra") {
        const own = lw ? (await admin.from("cards").select("id").eq("user_id", user.id).eq("wine_id", lw.id).maybeSingle()).data : null;
        if (!own) {
          const lbx = w.label_box && ["x", "y", "w", "h"].every((k) => typeof w.label_box[k] === "number") ? w.label_box : null;
          const { data: chk, error: ce } = await admin.from("legend_checks").insert({ user_id: user.id, payload, label_box: lbx }).select("id").single();
          if (ce) throw ce;
          return json({ status: "need_back", check: chk.id, recognized: payload, tier: tierNext });
        }
      }
    }
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
    // Daarna: het etiket in de achtergrond zelf laten tekenen (standaard Sonnet; Len vond Sonnet even goed als Opus, half zo duur)
    const curStyle = result?.wine?.label_style as Record<string, unknown> | null | undefined;
    // Alleen vanaf Rare: Commons tonen de reisposter, geen etiket
    const tierNow = (result?.card?.tier ?? result?.wine?.tier_override ?? result?.wine?.tier) as string | undefined;
    if (result?.wine?.id && tierNow && tierNow !== "common" && !(curStyle && (curStyle.v === 2 || curStyle.locked))) {
      const wid = result.wine.id;
      const desc = `Wijn: ${payload.naam}\nMaker: ${payload.maker || "onbekend"}\nJaargang: ${payload.jaar ?? "geen"}\nHerkomst: ${payload.app || ""} (${payload.regio}, ${payload.land || ""})\nStijl: ${payload.stijl || ""}\nDe foto toont de hele fles; teken het hoofdetiket.`;
      const job = drawLabel(Deno.env.get("LABEL_SCAN_MODEL") ?? "sonnet", image, mediaType, desc).then(async (st) => {
        if (st) { const { error: de } = await admin.rpc("set_label_style", { p_wine: wid, p_style: st, p_force: true }); if (de) console.error("draw save", de); }
      }).catch((e) => console.error("draw", e));
      // @ts-ignore EdgeRuntime bestaat in Supabase Edge Functions
      if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(job);
    }
    const lb = w.label_box && ["x", "y", "w", "h"].every((k) => typeof w.label_box[k] === "number") ? w.label_box : null;
    return json({ status: "ok", recognized: payload, confidence: w.confidence, result, label_box: lb, label_style: labelStyle });
  } catch (e) {
    console.error(e);
    return json({ status: "error", message: String((e as Error)?.message ?? e) }, 500);
  }
});
