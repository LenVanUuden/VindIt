/* =====================================================================
   Vin’d It – tekenmotor voor de reisposters
   Elke regio heeft een palet (c) en kenmerken (art):
     mount    – 'alps' | 'andes' | 'volcano' | 'table' | 'mesa' | null
     water    – 'river' | 'sea' | 'lake' | null
     landmark – 'chateau' | 'church' | 'cathedral' | 'timber' | 'papal' | 'walled' |
                'campanile' | 'windmill' | 'gable' | 'abbey' | 'barn' | 'castle' |
                'bodega' | 'farmhouse' | 'village'
     flora    – 'cypress' | 'poplar' | 'pines' | 'gum' | 'redwood'
     terraces – true voor steile terrassen (Douro, Mosel, Rhône)
     lavender – true voor lavendelvelden (Provence)
   Vier composities: 0 panorama · 1 wijngaard · 2 water of dorp · 3 avond
   ===================================================================== */

let ARTID = 0;
const _rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const _hex = a => '#' + a.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = _rgb(a), B = _rgb(b); return _hex(A.map((x, i) => x + (B[i] - x) * t)); };
const f1 = n => (+n).toFixed(1);

const MOTIF2ART = {
  chateau: { landmark: 'chateau' }, village: { landmark: 'village' }, church: { landmark: 'church' },
  windmill: { landmark: 'windmill' }, pines: { flora: 'pines' }, cypress: { flora: 'cypress' },
  farmhouse: { landmark: 'farmhouse' }, mesa: { mount: 'mesa' }, mountains: { mount: 'alps' }
};
function artSpec(A) {
  const base = { landmark: 'village', flora: 'poplar' };
  (A.motifs || []).forEach(m => Object.assign(base, MOTIF2ART[m] || {}));
  return Object.assign(base, A.art || {});
}

/* ---------- elementen ---------- */
function skyBands(H, hz, top, light) {
  let s = `<rect width="200" height="${H}" fill="${top}"/>`;
  [[.42, .25], [.62, .5], [.8, .75]].forEach(([p, t]) => { s += `<rect y="${f1(hz * p)}" width="200" height="${f1(H)}" fill="${mix(top, light, t)}"/>`; });
  return s;
}
function sunEl(x, y, r, col, sky, rays, stripes) {
  let s = '';
  if (rays) for (let i = 0; i < 16; i++) {
    const a1 = i / 16 * Math.PI * 2, a2 = a1 + Math.PI / 32;
    s += `<polygon points="${f1(x)},${f1(y)} ${f1(x + 320 * Math.cos(a1))},${f1(y + 320 * Math.sin(a1))} ${f1(x + 320 * Math.cos(a2))},${f1(y + 320 * Math.sin(a2))}" fill="${col}" opacity=".08"/>`;
  }
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"/>`;
  if (stripes) [.25, .5, .72].forEach((p, i) => { s += `<rect x="${f1(x - r)}" y="${f1(y + r * p)}" width="${f1(2 * r)}" height="${f1(r * (.07 + i * .03))}" fill="${sky}"/>`; });
  return s;
}
const cloud = (x, y, s, col) => `<g fill="${col}"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(15 * s)}" ry="${f1(4 * s)}"/><ellipse cx="${f1(x - 6 * s)}" cy="${f1(y - 3 * s)}" rx="${f1(7 * s)}" ry="${f1(5 * s)}"/><ellipse cx="${f1(x + 4 * s)}" cy="${f1(y - 4.5 * s)}" rx="${f1(8 * s)}" ry="${f1(6 * s)}"/></g>`;
const birds = (x, y, s, col) => [[0, 0], [9, -4], [17, 2]].map(([dx, dy]) => `<path d="M${f1(x + dx * s)} ${f1(y + dy * s)} q${f1(2.5 * s)} ${f1(-2.5 * s)} ${f1(5 * s)} 0 q${f1(2.5 * s)} ${f1(-2.5 * s)} ${f1(5 * s)} 0" fill="none" stroke="${col}" stroke-width="${f1(.9 * s)}" stroke-linecap="round"/>`).join('');
const hill = (y0, y1, y2, y3, H, col) => `<path d="M0 ${f1(y0)} Q50 ${f1(y1)} 100 ${f1(y2)} T200 ${f1(y3)} V${H} H0Z" fill="${col}"/>`;

function mountains(kind, hz, s, col, snow, haze) {
  const peaks = (pts, cap) => {
    let p = `<polygon points="-10,${f1(hz)} ${pts.map(([x, h]) => `${x},${f1(hz - h * s)}`).join(' ')} 210,${f1(hz)}" fill="${col}"/>`;
    pts.forEach(([x, h], i) => { if (i % 2 === 0 && h * s > 18) { const y = hz - h * s, c = cap * s; p += `<polygon points="${f1(x - c)},${f1(y + c * 1.4)} ${x},${f1(y)} ${f1(x + c)},${f1(y + c * 1.4)} ${f1(x + c * .3)},${f1(y + c)} ${f1(x - c * .4)},${f1(y + c * 1.6)}" fill="${snow}"/>`; } });
    return p;
  };
  if (kind === 'alps') return peaks([[22, 34], [44, 20], [70, 46], [92, 26], [118, 40], [146, 18], [172, 36], [194, 22]], 6);
  if (kind === 'andes') return `<g opacity=".8">${peaks([[10, 30], [30, 20], [52, 44], [70, 30], [96, 54], [120, 32], [144, 50], [168, 28], [190, 40]], 8)}</g>`;
  if (kind === 'volcano') {
    const x = 128, w = 58 * s, t = 12 * s, h = 50 * s;
    return `<polygon points="${f1(x - w)},${f1(hz)} ${f1(x - t)},${f1(hz - h)} ${f1(x + t)},${f1(hz - h)} ${f1(x + w)},${f1(hz)}" fill="${col}"/>` +
      `<path d="M${f1(x - t)} ${f1(hz - h)} q${f1(t)} ${f1(4 * s)} ${f1(2 * t)} 0" fill="none" stroke="${snow}" stroke-width="${f1(1.4 * s)}"/>` +
      [[0, 8, 6], [7, 16, 8], [16, 25, 10], [28, 33, 11]].map(([dx, dy, r]) => `<ellipse cx="${f1(x + dx * s)}" cy="${f1(hz - h - dy * s)}" rx="${f1(r * s)}" ry="${f1(r * .62 * s)}" fill="${haze}" opacity=".85"/>`).join('');
  }
  if (kind === 'table') {
    const x = 95;
    return `<polygon points="${f1(x - 70 * s)},${f1(hz)} ${f1(x - 52 * s)},${f1(hz - 34 * s)} ${f1(x + 46 * s)},${f1(hz - 36 * s)} ${f1(x + 70 * s)},${f1(hz)}" fill="${col}"/>` +
      `<path d="M${f1(x - 52 * s)} ${f1(hz - 34 * s)} L${f1(x + 46 * s)} ${f1(hz - 36 * s)} L${f1(x + 40 * s)} ${f1(hz - 29 * s)} Q${f1(x + 20 * s)} ${f1(hz - 25 * s)} ${f1(x)} ${f1(hz - 30 * s)} Q${f1(x - 20 * s)} ${f1(hz - 24 * s)} ${f1(x - 46 * s)} ${f1(hz - 29 * s)}Z" fill="${snow}" opacity=".92"/>`;
  }
  if (kind === 'mesa') return `<path d="M-10 ${f1(hz)} L${f1(22 * s)} ${f1(hz - 26 * s)} L${f1(88 * s)} ${f1(hz - 28 * s)} L${f1(100 * s)} ${f1(hz - 16 * s)} L${f1(130 * s)} ${f1(hz - 17 * s)} L${f1(150 * s)} ${f1(hz)}Z" fill="${col}"/>`;
  return '';
}
function water(kind, hz, H, col, hi) {
  if (kind === 'sea') return `<rect y="${f1(hz - 1)}" width="200" height="${f1(H * .14)}" fill="${col}"/>` +
    [0, 1, 2].map(i => `<path d="M${10 + i * 60} ${f1(hz + 4 + i * 3)} h18 M${40 + i * 55} ${f1(hz + 9 + i * 2)} h12" stroke="${hi}" stroke-width=".9" stroke-linecap="round"/>`).join('');
  if (kind === 'lake') return `<path d="M0 ${f1(hz + 4)} Q100 ${f1(hz - 3)} 200 ${f1(hz + 4)} V${f1(hz + H * .12)} Q100 ${f1(hz + H * .17)} 0 ${f1(hz + H * .12)}Z" fill="${col}"/>` +
    `<path d="M60 ${f1(hz + 6)} h28 M110 ${f1(hz + 10)} h20 M30 ${f1(hz + 11)} h14" stroke="${hi}" stroke-width=".9" stroke-linecap="round"/>`;
  if (kind === 'river') return `<path d="M96 ${f1(hz)} C84 ${f1(hz + H * .1)} 132 ${f1(hz + H * .2)} 92 ${f1(H)} L158 ${f1(H)} C178 ${f1(hz + H * .22)} 108 ${f1(hz + H * .1)} 103 ${f1(hz)}Z" fill="${col}"/>` +
    `<path d="M101 ${f1(hz + H * .1)} h7 M110 ${f1(hz + H * .2)} h12 M118 ${f1(hz + H * .32)} h16" stroke="${hi}" stroke-width="1" stroke-linecap="round"/>`;
  return '';
}
function vineRows(vx, vy, top, H, a, b, n, line) {
  let s = '';
  const xs = Array.from({ length: n + 1 }, (_, i) => -60 + i * (320 / n));
  const k = (top - vy) / (H - vy);
  for (let i = 0; i < n; i++) {
    const x0 = xs[i], x1 = xs[i + 1], t0 = vx + (x0 - vx) * k, t1 = vx + (x1 - vx) * k;
    s += `<polygon points="${f1(x0)},${H} ${f1(x1)},${H} ${f1(t1)},${f1(top)} ${f1(t0)},${f1(top)}" fill="${i % 2 ? b : a}"/>`;
    s += `<line x1="${f1(x0)}" y1="${H}" x2="${f1(t0)}" y2="${f1(top)}" stroke="${line}" stroke-width=".7" opacity=".55"/>`;
  }
  return s;
}
function terraces(top, H, col) {
  let s = '';
  for (let i = 0; i < 7; i++) { const y = top + (H - top) * (i / 7); s += `<path d="M-5 ${f1(y + 4)} Q60 ${f1(y - 3)} 120 ${f1(y + 1)} T205 ${f1(y - 2)}" fill="none" stroke="${col}" stroke-width="1.8" opacity=".5"/><path d="M-5 ${f1(y + 6)} Q60 ${f1(y - 1)} 120 ${f1(y + 3)} T205 ${f1(y)}" fill="none" stroke="#ffffff" stroke-width=".7" opacity=".18"/>`; }
  return s;
}
function tree(kind, x, y, h, col, trunk) {
  if (kind === 'cypress') return `<rect x="${f1(x - .6)}" y="${f1(y - 2)}" width="1.2" height="3" fill="${trunk}"/><ellipse cx="${f1(x)}" cy="${f1(y - h / 2)}" rx="${f1(h * .17)}" ry="${f1(h / 2)}" fill="${col}"/>`;
  if (kind === 'poplar') return `<rect x="${f1(x - .5)}" y="${f1(y - 3)}" width="1" height="3" fill="${trunk}"/><ellipse cx="${f1(x)}" cy="${f1(y - h * .55)}" rx="${f1(h * .2)}" ry="${f1(h * .5)}" fill="${col}"/>`;
  if (kind === 'pines') return `<rect x="${f1(x - .7)}" y="${f1(y - 3)}" width="1.4" height="3" fill="${trunk}"/><polygon points="${f1(x - h * .3)},${f1(y - 2)} ${f1(x)},${f1(y - h * .65)} ${f1(x + h * .3)},${f1(y - 2)}" fill="${col}"/><polygon points="${f1(x - h * .22)},${f1(y - h * .45)} ${f1(x)},${f1(y - h)} ${f1(x + h * .22)},${f1(y - h * .45)}" fill="${col}"/>`;
  if (kind === 'redwood') return `<rect x="${f1(x - .8)}" y="${f1(y - 4)}" width="1.6" height="4" fill="${trunk}"/><polygon points="${f1(x - h * .14)},${f1(y - 3)} ${f1(x)},${f1(y - h)} ${f1(x + h * .14)},${f1(y - 3)}" fill="${col}"/>`;
  if (kind === 'gum') return `<path d="M${f1(x)} ${f1(y)} q${f1(-h * .05)} ${f1(-h * .3)} ${f1(h * .04)} ${f1(-h * .55)}" stroke="${trunk}" stroke-width="${f1(Math.max(.8, h * .06))}" fill="none"/>` +
    [[-.18, -.62, .2], [.12, -.72, .22], [.02, -.85, .18], [-.05, -.55, .16]].map(([dx, dy, r]) => `<circle cx="${f1(x + dx * h)}" cy="${f1(y + dy * h)}" r="${f1(r * h)}" fill="${col}"/>`).join('');
  return '';
}
function landmark(kind, x, y, s, k) {
  const W = k.wall, R = k.roof, D = k.win;
  const r = (x0, y0, w, h, f) => `<rect x="${f1(x + x0 * s)}" y="${f1(y + y0 * s)}" width="${f1(w * s)}" height="${f1(h * s)}" fill="${f}"/>`;
  const p = (pts, f) => `<polygon points="${pts.map(([a, b]) => `${f1(x + a * s)},${f1(y + b * s)}`).join(' ')}" fill="${f}"/>`;
  const win = (pts) => pts.map(([a, b]) => r(a, b, 2.4, 3.2, D)).join('');
  switch (kind) {
    case 'chateau': return r(-16, -18, 32, 18, W) + r(-24, -28, 9, 28, W) + r(15, -28, 9, 28, W) + p([[-26, -28], [-19.5, -42], [-13, -28]], R) + p([[13, -28], [19.5, -42], [26, -28]], R) + p([[-17, -18], [0, -27], [17, -18]], R) + r(-2, -9, 4, 9, D) + win([[-11, -14], [7, -14], [-21, -21], [18, -21]]);
    case 'church': return r(-18, -14, 24, 14, W) + p([[-20, -14], [-6, -23], [8, -14]], R) + r(6, -30, 9, 30, W) + p([[4, -30], [10.5, -48], [17, -30]], R) + r(9, -24, 3, 4, D) + win([[-14, -9], [-6, -9]]);
    case 'cathedral': return r(-22, -18, 44, 18, W) + r(-24, -40, 12, 40, W) + r(12, -40, 12, 40, W) + p([[-24, -40], [-18, -50], [-12, -40]], R) + p([[12, -40], [18, -50], [24, -40]], R) + p([[-12, -18], [0, -28], [12, -18]], R) + `<circle cx="${f1(x)}" cy="${f1(y - 11 * s)}" r="${f1(4 * s)}" fill="${D}"/>` + r(-20, -32, 2.6, 6, D) + r(17.4, -32, 2.6, 6, D) + r(-3, -6, 6, 6, D);
    case 'timber': return [[-24, 15, 18], [-7, 13, 22], [8, 16, 16]].map(([dx, w, h]) =>
      r(dx, -h, w, h, W) + p([[dx - 1, -h], [dx + w / 2, -h - w * .7], [dx + w + 1, -h]], R) +
      `<path d="M${f1(x + dx * s)} ${f1(y - h * .55 * s)} h${f1(w * s)} M${f1(x + (dx + w * .33) * s)} ${f1(y - h * s)} v${f1(h * s)} M${f1(x + (dx + w * .66) * s)} ${f1(y - h * s)} v${f1(h * s)} M${f1(x + dx * s)} ${f1(y - h * s)} l${f1(w * .33 * s)} ${f1(h * .45 * s)}" stroke="${R}" stroke-width="${f1(1.1 * s)}" fill="none"/>`).join('');
    case 'papal': { let c = r(-26, -16, 40, 16, W) + r(10, -30, 12, 30, W); for (let i = 0; i < 5; i++) c += r(-26 + i * 8, -19, 4, 3, W); for (let i = 0; i < 3; i++) c += r(10 + i * 4.5, -33, 3, 3, W); c += p([[-26, -16], [-26, -10], [-20, -16]], k.bg || R); return c + win([[-20, -11], [-10, -11], [0, -11], [14, -24]]); }
    case 'walled': { let c = r(-32, -12, 64, 12, W); [-32, -14, 4, 22].forEach(tx => { c += r(tx, -22, 10, 22, W) + p([[tx - 1, -22], [tx + 5, -31], [tx + 11, -22]], R); }); for (let i = 0; i < 8; i++) c += r(-30 + i * 8, -15, 4, 3, W); return c + r(-3, -8, 6, 8, D); }
    case 'campanile': return r(-22, -10, 14, 10, W) + p([[-23, -10], [-15, -15], [-7, -10]], R) + r(14, -10, 12, 10, W) + p([[13, -10], [20, -14], [27, -10]], R) + r(-4, -40, 11, 40, W) + p([[-5, -40], [1.5, -49], [8, -40]], R) + r(-1.5, -35, 6, 5, D) + win([[-18, -7], [18, -7]]);
    case 'windmill': return p([[-8, 0], [8, 0], [5, -30], [-5, -30]], W) + p([[-7, -30], [0, -38], [7, -30]], R) +
      `<g transform="rotate(20 ${f1(x)} ${f1(y - 32 * s)})" fill="${R}">` + r(-1.4, -62, 2.8, 60, R) + r(-30, -33.4, 60, 2.8, R) + r(1.4, -60, 6, 24, W) + r(-7.4, -29, 6, 24, W) + '</g>' + r(-2.5, -8, 5, 8, D);
    case 'gable': return r(-30, -13, 60, 13, W) + p([[-32, -13], [-26, -21], [26, -21], [32, -13]], R) + `<path d="M${f1(x - 9 * s)} ${f1(y - 13 * s)} V${f1(y - 22 * s)} Q${f1(x - 9 * s)} ${f1(y - 27 * s)} ${f1(x - 4 * s)} ${f1(y - 27 * s)} Q${f1(x)} ${f1(y - 33 * s)} ${f1(x + 4 * s)} ${f1(y - 27 * s)} Q${f1(x + 9 * s)} ${f1(y - 27 * s)} ${f1(x + 9 * s)} ${f1(y - 22 * s)} V${f1(y - 13 * s)}Z" fill="${W}"/>` + r(-2, -9, 4, 9, D) + win([[-22, -9], [-14, -9], [11, -9], [19, -9], [-1.2, -22]]);
    case 'abbey': return r(-30, -16, 60, 16, W) + p([[-31, -16], [0, -22], [31, -16]], R) + r(-26, -30, 9, 30, W) + r(17, -30, 9, 30, W) + `<ellipse cx="${f1(x - 21.5 * s)}" cy="${f1(y - 31 * s)}" rx="${f1(5 * s)}" ry="${f1(5 * s)}" fill="${R}"/><ellipse cx="${f1(x + 21.5 * s)}" cy="${f1(y - 31 * s)}" rx="${f1(5 * s)}" ry="${f1(5 * s)}" fill="${R}"/>` + r(-22.2, -40, 1.4, 5, R) + r(20.8, -40, 1.4, 5, R) + win([[-12, -11], [-5, -11], [2, -11], [9, -11], [-23, -24], [20, -24]]);
    case 'barn': return p([[-16, 0], [-16, -14], [-12, -22], [0, -27], [12, -22], [16, -14], [16, 0]], k.accent || W) + `<path d="M${f1(x - 6 * s)} ${f1(y)} V${f1(y - 10 * s)} H${f1(x + 6 * s)} V${f1(y)} M${f1(x - 6 * s)} ${f1(y - 10 * s)} L${f1(x + 6 * s)} ${f1(y)} M${f1(x + 6 * s)} ${f1(y - 10 * s)} L${f1(x - 6 * s)} ${f1(y)}" stroke="${W}" stroke-width="${f1(1 * s)}" fill="none"/>` + r(-2, -20, 4, 4, W) + r(20, -8, 10, 8, W) + p([[19, -8], [25, -12], [31, -8]], R);
    case 'castle': return r(-20, -12, 34, 12, W) + r(-6, -34, 12, 34, W) + p([[-7, -34], [0, -44], [7, -34]], R) + r(14, -18, 8, 18, W) + p([[13, -18], [18, -25], [23, -18]], R) + win([[-1.2, -28], [-15, -8], [-8, -8], [16.8, -13]]);
    case 'bodega': return r(-26, -16, 52, 16, W) + p([[-28, -16], [0, -23], [28, -16]], R) + [-16, 0, 16].map(ax => `<path d="M${f1(x + (ax - 5) * s)} ${f1(y)} V${f1(y - 7 * s)} A${f1(5 * s)} ${f1(5 * s)} 0 0 1 ${f1(x + (ax + 5) * s)} ${f1(y - 7 * s)} V${f1(y)}Z" fill="${D}"/>`).join('') + r(-24, 0, 48, 1.2, R);
    case 'farmhouse': return r(-18, -16, 30, 16, W) + p([[-21, -16], [-3, -26], [15, -16]], k.accent || R) + r(12, -11, 12, 11, W) + p([[11, -11], [18, -16], [25, -11]], k.accent || R) + win([[-12, -11], [-5, -11], [16, -7]]) + r(-1, -7, 4, 7, D);
    default: return [[-22, 0, 12], [-8, -5, 14], [8, -2, 12], [21, 2, 10]].map(([dx, dy, w]) => r(dx, dy - 11, w, 12, W) + p([[dx - 1, dy - 11], [dx + w / 2, dy - 19], [dx + w + 1, dy - 11]], R) + r(dx + w / 2 - 1.2, dy - 7, 2.4, 3, D)).join('') + r(-3, -36, 6, 26, W) + p([[-4, -36], [0, -46], [4, -36]], R);
  }
}
function vineBranch(x, y, s, leaf, vein, grape, hi) {
  const lf = (lx, ly, sc, rot) => `<g transform="translate(${f1(lx)} ${f1(ly)}) rotate(${rot}) scale(${f1(sc)})"><path d="M0 0 C-7 -1 -13 -7 -11 -15 C-8 -13 -7 -18 -3 -21 C-1 -17 1 -20 4 -21 C6 -17 10 -17 12 -14 C11 -7 6 -1 0 0Z" fill="${leaf}"/><path d="M0 0 L-6 -13 M0 0 L1 -17 M0 0 L8 -12" stroke="${vein}" stroke-width=".8" fill="none" opacity=".7"/></g>`;
  let g = `<path d="M${f1(x + 48 * s)} ${f1(y - 30 * s)} C${f1(x + 30 * s)} ${f1(y - 30 * s)} ${f1(x + 18 * s)} ${f1(y - 20 * s)} ${f1(x + 8 * s)} ${f1(y - 4 * s)}" stroke="${vein}" stroke-width="${f1(1.8 * s)}" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M${f1(x + 30 * s)} ${f1(y - 28 * s)} q${f1(4 * s)} ${f1(-8 * s)} ${f1(-2 * s)} ${f1(-10 * s)} q${f1(-5 * s)} ${f1(-1 * s)} ${f1(-3 * s)} ${f1(4 * s)}" stroke="${vein}" stroke-width="${f1(.8 * s)}" fill="none"/>`;
  g += lf(x + 26 * s, y - 24 * s, .95 * s, -35) + lf(x + 40 * s, y - 28 * s, .75 * s, 25);
  const pts = [[0, 0], [5.4, 0], [10.8, 0], [2.7, 4.8], [8.1, 4.8], [13.5, 4.8], [5.4, 9.6], [10.8, 9.6], [8.1, 14.4]];
  pts.forEach(([dx, dy]) => {
    const cx = x + dx * s, cy = y + dy * s;
    g += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(3 * s)}" fill="${grape}"/><circle cx="${f1(cx - 1 * s)}" cy="${f1(cy - 1 * s)}" r="${f1(.9 * s)}" fill="${hi}" opacity=".5"/>`;
  });
  return g;
}

/* ---------- compositie ---------- */
function posterLayers(A, v, H) {
  const c = A.c, f = artSpec(A), s = H / 140, big = H > 140 ? 1.35 : 1;
  const dusk = v === 3, sil = dusk;
  const skyTop = dusk ? mix(c.sky, c.sun, .55) : mix(c.sky, c.far, .12);
  const skyLight = dusk ? mix(c.sun, '#ffffff', .35) : mix(c.sky, '#ffffff', .35);
  const far = dusk ? mix(c.far, c.dark, .45) : c.far, near = dusk ? mix(c.near, c.dark, .6) : c.near;
  const mountCol = dusk ? mix(c.far, c.dark, .3) : mix(c.far, c.sky, .35);
  const snow = dusk ? mix(c.m, c.sun, .35) : c.m, haze = mix(c.m, c.far, .25);
  const waterCol = dusk ? mix(c.sun, c.dark, .35) : mix(c.sky, c.far, .4), waterHi = dusk ? c.sun : mix(c.sky, '#ffffff', .6);
  const lk = sil ? { wall: c.dark, roof: c.dark, win: c.sun, accent: c.dark, bg: far } : { wall: c.m, roof: c.dark, win: c.dark, accent: c.sun, bg: far };
  const floraCol = sil ? c.dark : c.dark, trunk = c.dark;
  const hz = H * [.52, .44, .5, .56][v];
  let back = '', mid = '', front = '';

  back += skyBands(H, hz, skyTop, skyLight);
  if (v === 0) back += sunEl(152, H * .2, 13 * s * big, c.sun, skyLight, true, true) + cloud(52, H * .2, 1.1 * s, mix(c.m, c.sky, .2)) + birds(78, H * .3, s, c.dark);
  if (v === 1) back += sunEl(44, H * .2, 11 * s * big, c.sun, skyLight, true, false) + cloud(140, H * .16, s, mix(c.m, c.sky, .2));
  if (v === 2) back += sunEl(100, H * .17, 9 * s * big, c.sun, skyLight, false, false) + cloud(40, H * .14, .9 * s, mix(c.m, c.sky, .15)) + cloud(160, H * .22, 1.1 * s, mix(c.m, c.sky, .15));
  if (dusk) back += sunEl(100, hz - 2 * s, 24 * s * big, c.sun, skyTop, true, true) + birds(120, H * .22, s, c.dark) + birds(44, H * .3, .8 * s, c.dark);
  if (f.water === 'sea' && v !== 1) back += water('sea', hz - 1 * s, H, waterCol, waterHi);
  if (f.mount) back += mountains(f.mount, hz + 2 * s, s * (f.mount === 'mesa' ? 1 : big), mountCol, snow, haze);

  // middengrond
  const farY = [hz + 4 * s, hz - 6 * s, hz, hz + 4 * s][v] + (f.water === 'sea' && v !== 1 ? 9 * s : 0);
  mid += hill(farY + 6 * s, farY - 8 * s, farY + 2 * s, farY - 4 * s, H, far);
  if (f.water === 'lake' && (v === 0 || v === 2)) mid += water('lake', farY + 6 * s, H, waterCol, waterHi);

  const L = f.landmark;
  if (v === 0) {
    mid += landmark(L, 112, farY + 4 * s, 1.05 * s * big, lk);
    if (f.flora) [[78, 14], [86, 18], [146, 16]].forEach(([tx, th]) => { mid += tree(f.flora, tx, farY + 5 * s, th * s, floraCol, trunk); });
  }
  if (v === 1) mid += landmark(L, 150, farY + 2 * s, .62 * s * big, lk);
  if (v === 2) {
    if (f.water === 'river') mid += water('river', farY + 6 * s, H, waterCol, waterHi);
    const lx = f.water ? 52 : 100;
    mid += landmark(f.water ? L : (L === 'village' ? 'church' : L), lx, farY + 8 * s, 1.0 * s * big, lk);
    if (!f.water && L !== 'village') mid += landmark('village', 150, farY + 8 * s, .7 * s, lk);
    if (f.flora) [16, 26, 168, 182].forEach((tx, i) => { mid += tree(f.flora, tx, farY + (10 + i % 2 * 3) * s, (16 + i % 2 * 5) * s, floraCol, trunk); });
  }
  if (dusk) {
    mid += landmark(L, 60, farY + 6 * s, 1.0 * s * big, lk);
    if (f.flora) [[140, 18], [150, 24], [160, 16]].forEach(([tx, th]) => { mid += tree(f.flora, tx, farY + 7 * s, th * s, c.dark, c.dark); });
  }

  // voorgrond
  const rowsTop = [H * .8, H * .58, H * .86, H * .8][v];
  const rowA = f.lavender ? mix('#9B7BC8', near, .25) : near, rowB = f.lavender ? mix('#6E4E9E', c.dark, .2) : mix(near, c.dark, .3);
  if (v === 2) {
    front += `<path d="M0 ${f1(rowsTop - 6 * s)} Q30 ${f1(rowsTop - 12 * s)} 70 ${f1(rowsTop)} L70 ${H} H0Z" fill="${near}"/><path d="M200 ${f1(rowsTop - 8 * s)} Q160 ${f1(rowsTop - 14 * s)} 130 ${f1(rowsTop)} L130 ${H} H200Z" fill="${near}"/>`;
  } else {
    front += hill(rowsTop - 6 * s, rowsTop - 14 * s, rowsTop - 4 * s, rowsTop - 10 * s, H, near);
    if (f.terraces && v !== 1) front += terraces(rowsTop - 8 * s, H, c.dark);
    else front += vineRows(v === 1 ? 70 : 100, hz, rowsTop - 4 * s, H, rowA, rowB, v === 1 ? 14 : 10, c.dark);
  }
  if (v === 1) front += vineBranch(150, H * .64, 1.05 * s * big, mix(c.near, c.m, .22), c.dark, mix(c.dark, '#4B2560', .5), c.m);
  return { back, mid, front, hz };
}

function posterSVG(A, v, label) {
  const H = 140, id = 'ht' + (++ARTID), L = posterLayers(A, v % 4, H), c = A.c;
  const name = (label || A.naam || '').toUpperCase(), fs = name.length > 14 ? Math.max(6.5, 150 / name.length) : 10.5, ls = name.length > 14 ? 1 : 3;
  return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reisposter ${name.replace(/[<>&"]/g, '')}">` +
    `<defs><pattern id="${id}" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".5" fill="#000" opacity=".1"/></pattern></defs>` +
    L.back + L.mid + L.front +
    `<rect width="200" height="140" fill="url(#${id})"/>` +
    `<rect x="3.5" y="3.5" width="193" height="113" fill="none" stroke="${c.m}" stroke-width=".8" opacity=".55"/>` +
    `<rect y="120" width="200" height="20" fill="${c.dark}"/><rect y="120" width="200" height="1.2" fill="${c.sun}"/>` +
    `<text x="100" y="133.8" text-anchor="middle" font-family="Limelight, Georgia, serif" font-size="${f1(fs)}" letter-spacing="${ls}" fill="${c.sky}">${name.replace(/[<>&"]/g, '')}</text></svg>`;
}
function posterTallLayers(A, v) {
  const L = posterLayers(A, v % 4, 280), id = 'ht' + (++ARTID);
  const vb = 'viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"';
  const tex = `<defs><pattern id="${id}" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".5" fill="#000" opacity=".1"/></pattern></defs>`;
  return [`<svg ${vb}>${L.back}</svg>`, `<svg ${vb}>${L.mid}</svg>`, `<svg ${vb}>${tex}${L.front}<rect width="200" height="280" fill="url(#${id})"/></svg>`];
}
if (typeof module !== 'undefined') module.exports = { posterSVG, posterTallLayers, mix };
