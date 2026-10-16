// =====================================================================
// Vined It – Edge Function "reassess"
// Beoordeelt bestaande wijnen (zonder signalen) opnieuw met Claude, op basis
// van de opgeslagen gegevens (geen foto nodig), en voert de nieuwe klasse door
// op alle kaarten van die wijn. Alleen voor beheerders (ADMIN_EMAILS).
// Per aanroep een beperkt aantal wijnen; de app roept herhaald aan tot alles klaar is.
// Body: { force?: boolean }  – force: ook wijnen die al signalen hebben opnieuw doen
// Body: { mode: "label", force?: boolean, model?: "opus"|"sonnet" } – etiketten zelf laten tekenen (met de bewaarde foto als die er is)
// Body: { mode: "draw", wine, model?|models?, dry? } – één wijn tekenen of vergelijken · { mode: "save", wine, style } · { mode: "lock", wine, locked }
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

const LABEL_SYSTEM = `You describe wine labels for a Dutch wine-collecting app that draws a simplified, generic illustration of each label in its own style. Return the design via the "etiket" tool. If a photo is given, describe what you see. Without a photo, describe the real label as you remember it; if you don't know the wine, invent a tasteful, plausible design that fits its region, price level and style. Do not copy logos exactly.
- paper / ink / accent: hex colors. metal: "gold", "silver" or "none".
- font: "condensed" (tall narrow), "classic" (old-style serif), "didone" (elegant high-contrast serif), "script", "gothic" (blackletter), "modern" (sans-serif), "display" (art-deco).
- upper: name in capitals? layout: name at "top", "center" or "bottom".
- emblem: type "chateau" (classic château façade), "castle" (fortress/tower), "church", "farmhouse", "winery" (modern), "crest", "sun", "abstract" (only non-figurative), "bull" (other animals), "horse", "bird", "flower", "tree", "grapes", "leaf", "stars" or "none" (a building is always one of the five building types); color hex or "metal"; size "normal"/"large"; frame "oval"/"circle"/"square"/"arch"/"none" (the visible frame around the picture on the real label). Goal: the drawn label must be recognisable next to the real one (paper colour, order of elements, coloured lines, picture and frame). mark: optional second small element.
- border: "none", "thin", "double", "frame", "band"; border_color hex or "metal". name_color: hex or "metal" for foil names. sub_color: hex if the appellation line is in a striking colour.
- lines: name (as printed), top, sub, bottom; max ~30 characters each. Copy every text EXACTLY as printed (same words, language, spelling, accents; never translate or rephrase).`;
const STYLE_SCHEMA = {
  type: "object",
  properties: {
    paper: { type: "string" }, ink: { type: "string" }, accent: { type: "string" },
    metal: { type: "string", enum: ["gold", "silver", "none"] },
    font: { type: "string", enum: ["condensed", "classic", "didone", "script", "gothic", "modern", "display"] },
    upper: { type: "boolean" }, layout: { type: "string", enum: ["top", "center", "bottom"] },
    emblem: { type: "object", properties: { type: { type: "string", enum: ["chateau", "castle", "church", "farmhouse", "winery", "crest", "sun", "abstract", "bull", "horse", "bird", "flower", "tree", "grapes", "leaf", "stars", "none"] }, color: { type: "string" }, size: { type: "string", enum: ["normal", "large"] }, frame: { type: "string", enum: ["none", "oval", "circle", "square", "arch"] } } },
    mark: { type: "object", properties: { type: { type: "string", enum: ["chateau", "castle", "church", "farmhouse", "winery", "crest", "sun", "abstract", "bull", "horse", "bird", "flower", "tree", "grapes", "leaf", "stars", "none"] }, color: { type: "string" } } },
    border: { type: "string", enum: ["none", "thin", "double", "frame", "band"] }, border_color: { type: "string" }, name_color: { type: "string" }, sub_color: { type: "string" },
    lines: { type: "object", properties: { name: { type: "string" }, top: { type: "string" }, sub: { type: "string" }, bottom: { type: "string" } } },
  },
  required: ["paper", "ink", "accent", "font", "layout", "emblem"],
};
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

function b64(buf: ArrayBuffer) {
  const u = new Uint8Array(buf); let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}

// Na het samenvoegen van dubbele wijnen staan etiketfoto's nog onder het oude wijn-id.
// Verplaats ze naar de bewaarde wijn (alleen als daar nog geen foto staat).
// deno-lint-ignore no-explicit-any
async function movePhotos(admin: any) {
  const { data: merges } = await admin.from("wine_merges").select("id,kept_id,dropped_id").not("dropped_id", "is", null).eq("photos_moved", false);
  for (const m of merges ?? []) {
    const { data: owners } = await admin.from("cards").select("user_id").eq("wine_id", m.kept_id);
    for (const o of owners ?? []) {
      const from = `${o.user_id}/${m.dropped_id}.label.jpg`, to = `${o.user_id}/${m.kept_id}.label.jpg`;
      const { data: there } = await admin.storage.from("card-art").list(o.user_id, { search: `${m.kept_id}.label.jpg` });
      if (there && there.length) continue;
      const { error } = await admin.storage.from("card-art").move(from, to);
      if (error && !/not.?found/i.test(error.message ?? "")) console.warn("move", from, error.message);
    }
    await admin.from("wine_merges").update({ photos_moved: true }).eq("id", m.id);
  }
}

// De nieuwste etiketfoto van deze wijn, van wie hem ook heeft
// deno-lint-ignore no-explicit-any
async function newestPhoto(admin: any, wid: string): Promise<string | null> {
  const { data: owners } = await admin.from("cards").select("user_id").eq("wine_id", wid).limit(20);
  let best: { path: string; t: string } | null = null;
  // Eerst uitgesneden etiketfoto's (.label.jpg); anders de oudere kaartfoto (.jpg)
  for (const ext of [".label.jpg", ".jpg"]) {
    for (const o of owners ?? []) {
      const { data: f } = await admin.storage.from("card-art").list(o.user_id, { search: wid });
      const hit = (f ?? []).find((x: { name: string }) => x.name === `${wid}${ext}`);
      const t = String(hit?.updated_at ?? hit?.created_at ?? "");
      if (hit && (!best || t > best.t)) best = { path: `${o.user_id}/${wid}${ext}`, t };
    }
    if (best) break;
  }
  if (!best) return null;
  const { data: file } = await admin.storage.from("card-art").download(best.path);
  return file ? b64(await file.arrayBuffer()) : null;
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

    // Eén wijn: opnieuw tekenen, vergelijken (dry), opslaan of vastzetten
    if (body.mode === "draw" || body.mode === "save" || body.mode === "lock") {
      const { data: w, error: we } = await admin.from("wines").select("id,naam,maker,jaar,regio,land,appellation,stijl,tier,label_style").eq("id", body.wine).single();
      if (we || !w) return json({ status: "not_found" }, 404);
      if (body.mode === "lock") {
        const st = { ...(w.label_style ?? {}), locked: !!body.locked };
        const { error: e3 } = await admin.rpc("set_label_style", { p_wine: w.id, p_style: st, p_force: true });
        return json({ status: e3 ? "error" : "ok", style: st });
      }
      if (body.mode === "save") {
        const st = body.style && typeof body.style === "object" ? (body.style.v === 2 ? cleanDraw(body.style) : cleanStyle(body.style)) : null;
        if (!st) return json({ status: "bad_style" }, 400);
        const { error: e3 } = await admin.rpc("set_label_style", { p_wine: w.id, p_style: st, p_force: true });
        return json({ status: e3 ? "error" : "ok", style: st });
      }
      try { await movePhotos(admin); } catch (e) { console.warn("movePhotos", e); }
      const img = await newestPhoto(admin, w.id);
      const desc = `Wijn: ${w.naam}\nMaker: ${w.maker || "onbekend"}\nJaargang: ${w.jaar ?? "geen"}\nHerkomst: ${w.appellation || ""} (${w.regio}, ${w.land || ""})\nStijl: ${w.stijl || ""}`;
      const models: string[] = Array.isArray(body.models) ? body.models : [body.model ?? "sonnet"];
      const styles: Record<string, unknown> = {};
      const errors: Record<string, string> = {};
      await Promise.all(models.slice(0, 2).map(async (m) => { styles[m] = await drawLabel(m, img, "image/jpeg", desc); if (!styles[m]) errors[m] = LAST_DRAW_ERR; }));
      if (!body.dry) {
        const st = styles[models[0]];
        if (st) await admin.rpc("set_label_style", { p_wine: w.id, p_style: st, p_force: true });
      }
      return json({ status: "ok", foto: !!img, styles, errors });
    }

    if (body.mode === "label") {
      const LB = 2;
      const cols = "id,naam,maker,jaar,regio,land,appellation,stijl,tier,label_style";
      const q = body.force
        ? admin.from("wines").select(cols).not("tier", "is", null).neq("tier", "common").order("created_at").order("id").range(body.offset ?? 0, (body.offset ?? 0) + LB - 1)
        : admin.from("wines").select(cols).is("label_style", null).not("tier", "is", null).neq("tier", "common").order("created_at").order("id").limit(LB);
      const { data: wines, error } = await q;
      if (error) throw error;
      const results: unknown[] = [];
      for (const w of wines ?? []) {
        // een bewaarde etiketfoto zoeken bij iemand die deze wijn heeft
        const img = await newestPhoto(admin, w.id);
        const desc = `Wijn: ${w.naam}\nMaker: ${w.maker || "onbekend"}\nJaargang: ${w.jaar ?? "geen"}\nHerkomst: ${w.appellation || ""} (${w.regio}, ${w.land || ""})\nStijl: ${w.stijl || ""}\nKlasse: ${w.tier || ""}`;
        const content: unknown[] = img ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } }, { type: "text", text: desc }] : [{ type: "text", text: desc }];
        if (w.label_style && (w.label_style as Record<string, unknown>).locked) { results.push({ id: w.id, naam: w.naam, overgeslagen: "vast" }); continue; }
        const st = await drawLabel(body.model ?? "sonnet", img, "image/jpeg", desc);
        if (!st) { results.push({ id: w.id, error: "leeg" }); continue; }
        const { error: e2 } = await admin.rpc("set_label_style", { p_wine: w.id, p_style: st, p_force: !!body.force });
        if (e2) { console.error(e2); results.push({ id: w.id, error: "db" }); continue; }
        results.push({ id: w.id, naam: w.naam, foto: !!img });
      }
      let remaining = 0;
      if (!body.force) {
        const { count } = await admin.from("wines").select("id", { count: "exact", head: true }).is("label_style", null).not("tier", "is", null).neq("tier", "common");
        remaining = count ?? 0;
      } else remaining = (wines?.length ?? 0) < LB ? 0 : 1;
      return json({ status: "ok", done: results.length, remaining, results });
    }
    const cols = "id,naam,maker,jaar,druif,stijl,regio,land,appellation,color,is_icon";
    const q = body.force
      ? admin.from("wines").select(cols).order("created_at").order("id").range(body.offset ?? 0, (body.offset ?? 0) + BATCH - 1)
      : admin.from("wines").select(cols).is("signals", null).order("created_at").order("id").limit(BATCH);
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
      await logAI("klasse", MODEL, out.usage);
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
