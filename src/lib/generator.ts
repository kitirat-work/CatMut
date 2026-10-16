/**
 * CatMut wallpaper generator: pure functions that turn a settings object into an SVG string.
 * Extracted unchanged from the original cutmat.html (the GEN-START/GEN-END block),
 * with ES-module exports added. Text measurement uses a canvas, so it needs a browser.
 */
import type { LayerKey, ShadowStyle, State } from './constants';

type Pt = [number, number];
type Sq = { x: number; y: number; s: number };
type Arc = { C: Pt; S: Pt; E: Pt; sg: number; r: number };

export const FONT_EMBED: Record<string, string> = {}, FONT_GF: Record<string, string> = {};
export const FONTS: Record<string, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace"
};
let _mctx: CanvasRenderingContext2D | null = null;
function tw(text: string, size: number, fam: string) {
  if (!_mctx) _mctx = document.createElement('canvas').getContext('2d')!;
  _mctx.font = '400 ' + size + 'px ' + fam;
  return _mctx.measureText(text).width;
}
const f = (n: number | string) => +(+n).toFixed(2);
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const KNOWN: [number, number][] = [[16, 10], [16, 9], [21, 9], [3, 2], [4, 3], [1, 1], [19.5, 9]];
export function knownRatio(W: number, H: number): [number, number] | null {
  const r = Math.max(W, H) / Math.min(W, H);
  for (const [a, b] of KNOWN) if (Math.abs(r - a / b) < 0.012) return [a, b];
  return null;
}
export function ratioLabel(W: number, H: number) {
  const k = knownRatio(W, H);
  if (!k) return W + ' X ' + H + ' PX';
  return W >= H ? k[0] + ' X ' + k[1] : k[1] + ' X ' + k[0];
}
function wrapText(text: string, fs: number, fam: string, maxW: number) {
  const out: string[] = [];
  const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'word' }) : null;
  String(text).split('\n').forEach(par => {
    const toks = seg ? Array.from(seg.segment(par), x => x.segment) : par.split(/(\s+)/);
    let line = '';
    toks.forEach(tok => {
      const test = line + tok;
      if (!line.trim() || tw(test.trimEnd(), fs, fam) <= maxW) line = test;
      else { out.push(line.trimEnd()); line = tok.trimStart(); }
    });
    out.push(line.trimEnd());
  });
  return out;
}
function leavesSVG(W: number, H: number, seed: number, amt: number) {
  const rnd = mulberry32(seed * 7 + 3), b = Math.min(W, H), diag = Math.hypot(W, H), rad = Math.PI / 180;
  const leaf = (x: number, y: number, a: number, L: number, w: number) => {
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
    const P = (u: number, v: number) => f(x + dx * v + px * u) + ' ' + f(y + dy * v + py * u);
    return 'M' + P(0, 0) + 'C' + P(w, L * 0.25) + ' ' + P(w * 0.7, L * 0.75) + ' ' + P(0, L) +
      'C' + P(-w * 0.7, L * 0.75) + ' ' + P(-w, L * 0.25) + ' ' + P(0, 0) + 'Z';
  };
  const branch = (Lmax: number) => {
    const left = rnd() < 0.7;
    const ox = (left ? -0.08 + rnd() * 0.5 : 1.08 - rnd() * 0.5) * W, oy = (-0.08 + rnd() * 0.15) * H;
    let ang = 32 + rnd() * 40; if (!left) ang = 180 - ang; ang *= rad;
    const len = diag * (0.65 + rnd() * 0.35), curv = (rnd() - 0.5) * len * 0.4;
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const P0 = [ox, oy], P1 = [ox + dx * len * 0.5 + nx * curv, oy + dy * len * 0.5 + ny * curv], P2 = [ox + dx * len, oy + dy * len];
    const pt = (t: number) => [0, 1].map(k => (1 - t) * (1 - t) * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]);
    const tan = (t: number) => Math.atan2(2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]), 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]));
    const stem = 'M' + f(P0[0]) + ' ' + f(P0[1]) + 'Q' + f(P1[0]) + ' ' + f(P1[1]) + ' ' + f(P2[0]) + ' ' + f(P2[1]);
    let d = '';
    const n = 16 + Math.floor(rnd() * 6);
    for (let i = 1; i <= n; i++) {
      const t = i / n * 0.95, p = pt(t), a = tan(t);
      [1, -1].forEach(side => {
        const la = a + side * (48 + rnd() * 24) * rad + (rnd() - 0.5) * 0.2;
        const L = Lmax * (1 - 0.6 * t) * (0.75 + rnd() * 0.5);
        d += leaf(p[0], p[1], la, L, L * (0.2 + rnd() * 0.1));
      });
    }
    const pe = pt(0.97);
    d += leaf(pe[0], pe[1], tan(0.97), Lmax * 0.3, Lmax * 0.08);
    return { d, stem };
  };
  const layer = (count: number, Lmax: number, stemW: number) => {
    let st = '', lv = '';
    for (let i = 0; i < count; i++) { const r = branch(Lmax); st += r.stem; lv += r.d; }
    return '<path d="' + st + '" fill="none" stroke="#000" stroke-width="' + f(stemW) + '" stroke-linecap="round"/><path d="' + lv + '" fill="#000"/>';
  };
  const far = layer(2, 0.24 * b, 0.008 * b), near = layer(3, 0.13 * b, 0.004 * b);
  const sdA = b * 0.016, sdB = b * 0.005;
  const flt = (id: string, sd: number) => '<filter id="' + id + '" filterUnits="userSpaceOnUse" x="' + f(-sd * 3) + '" y="' + f(-sd * 3) + '" width="' + f(W + sd * 6) + '" height="' + f(H + sd * 6) + '"><feGaussianBlur stdDeviation="' + f(sd) + '"/></filter>';
  const defs = flt('cmBlurA', sdA) + flt('cmBlurB', sdB) +
    '<linearGradient id="cmFadeG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="' + H + '"><stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#bdbdbd"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>' +
    '<mask id="cmFade" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="url(#cmFadeG)"/></mask>';
  return '<defs>' + defs + '</defs><g mask="url(#cmFade)">' +
    '<g filter="url(#cmBlurA)" opacity="' + f(amt / 100 * 0.62) + '">' + far + '</g>' +
    '<g filter="url(#cmBlurB)" opacity="' + f(amt / 100 * 0.5) + '">' + near + '</g></g>';
}
function shadowSVG(W: number, H: number, seed: number, amt: number, style: ShadowStyle) {
  if (style === 'leaves') return leavesSVG(W, H, seed, amt);
  const rnd = mulberry32(seed), b = Math.min(W, H), diag = Math.hypot(W, H);
  let shapes = '', sd = W * 0.011, fade = true, defs = '', center = f(W / 2) + ' ' + f(H / 2);
  if (style === 'blinds') {
    const sp = H * (0.06 + rnd() * 0.04), th = sp * 0.5, ang = -(4 + rnd() * 14);
    sd = sp * 0.1;
    let g = '';
    for (let y = -diag; y < diag * 2; y += sp) g += '<rect x="' + f(-diag) + '" y="' + f(y) + '" width="' + f(diag * 3) + '" height="' + f(th) + '"/>';
    // ladder cords run across the slats
    const cw = sp * (0.07 + rnd() * 0.03), cs = W * (0.26 + rnd() * 0.14);
    for (let x = -rnd() * cs; x < W * 1.25; x += cs) g += '<rect x="' + f(x - cw / 2) + '" y="' + f(-diag) + '" width="' + f(cw) + '" height="' + f(diag * 3) + '"/>';
    shapes = '<g transform="rotate(' + f(ang) + ' ' + center + ')" fill="#000" opacity="0.6">' + g + '</g>';
  } else if (style === 'window') {
    const cols = 2 + Math.floor(rnd() * 2), rows = 2 + Math.floor(rnd() * 2);
    const gap = b * 0.03, pw = W * (0.7 + rnd() * 0.15), ph = H * 0.85;
    const cw = (pw - gap * (cols - 1)) / cols, rh = (ph - gap * (rows - 1)) / rows;
    const x0 = W * (0.08 + rnd() * 0.12), y0 = -H * 0.05, skew = -(14 + rnd() * 14);
    let d = 'M' + f(-3 * W) + ' ' + f(-3 * H) + 'H' + f(3 * W) + 'V' + f(3 * H) + 'H' + f(-3 * W) + 'Z';
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = x0 + c * (cw + gap), y = y0 + r * (rh + gap);
      d += 'M' + f(x) + ' ' + f(y) + 'h' + f(cw) + 'v' + f(rh) + 'h' + f(-cw) + 'Z';
    }
    sd = b * 0.006; fade = false;
    shapes = '<g transform="translate(0 ' + f(H * 0.02) + ') skewX(' + f(skew) + ')" fill="#000"><path d="' + d + '" fill-rule="evenodd" fill-opacity="0.62"/></g>';
  } else if (style === 'gradient') {
    const a = rnd() * 0.3;
    return '<defs><linearGradient id="cmShG" gradientUnits="userSpaceOnUse" x1="' + f(W * a) + '" y1="0" x2="' + f(W * (1 - a * 0.5)) + '" y2="' + H + '"><stop offset="0" stop-color="#000" stop-opacity="0.8"/><stop offset="0.5" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#cmShG)" opacity="' + f(amt / 100) + '"/>';
  } else {
    const n = 11, step = 2.2 * W / n;
    let g = '';
    for (let i = 0; i < n; i++) {
      const w = (0.025 + rnd() * 0.075) * W;
      const cx = -0.6 * W + i * step + rnd() * step * 0.6;
      const o = 0.38 + rnd() * 0.42;
      g += '<rect x="' + f(cx - w / 2) + '" y="' + f(-diag) + '" width="' + f(w) + '" height="' + f(diag * 3) + '" fill-opacity="' + f(o) + '"/>';
    }
    shapes = '<g transform="rotate(-24 ' + center + ')" fill="#000">' + g + '</g>';
  }
  const pad = sd * 3;
  defs = '<filter id="cmBlur" filterUnits="userSpaceOnUse" x="' + f(-pad) + '" y="' + f(-pad) + '" width="' + f(W + pad * 2) + '" height="' + f(H + pad * 2) + '"><feGaussianBlur stdDeviation="' + f(sd) + '"/></filter>';
  if (fade) defs += '<linearGradient id="cmFadeG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="' + H + '"><stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#bdbdbd"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>' +
    '<mask id="cmFade" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="url(#cmFadeG)"/></mask>';
  const inner = '<g filter="url(#cmBlur)" opacity="' + f(amt / 100) + '">' + shapes + '</g>';
  return '<defs>' + defs + '</defs>' + (fade ? '<g mask="url(#cmFade)">' + inner + '</g>' : inner);
}

export function build(S: State, opts?: { embed?: boolean; imports?: boolean }) {
  const W = S.cw, H = S.ch, b = Math.min(W, H), t = b / 1600;
  // safe area keeps the mat clear of the menu bar / status bar and home indicator; background still fills the whole screen
  const sTop = H * (S.safeTop || 0) / 100, sBot = H * (S.safeBottom || 0) / 100;
  const mx = 0.045 * b, tp = 0.06 * b + sTop, bt = 0.097 * b + sBot;
  const x0 = mx, y0 = tp, x1 = W - mx, y1 = H - bt, fw = x1 - x0, fh = y1 - y0;
  let cell = 0.153 * b * S.cell;
  cell = Math.min(cell, fw / 3, fh / 3);
  const famAll = FONTS[S.font] || FONTS.sans;
  const strip = 0.4 * cell, ox = x0 + strip, oy = y1 - strip;
  const bg = S.bg;
  const ink = S.ink === 'auto' ? (lum(bg) > 0.5 ? '#2b2926' : '#ffffff') : S.inkCustom;
  const k = S.intensity / 100;
  const op = (v: number) => f(Math.min(1, v * k));
  const q = Math.max(1, t);
  const L: Partial<Record<LayerKey, boolean>> = S.layers || {};
  const eps = 0.5;
  const sub = (L.mm && !L.grid) ? 10 : 5, m = cell / sub;
  const i0 = -Math.floor(strip / m + 1e-6);

  const clip = (px: number, py: number, dx: number, dy: number) => {
    let t0 = -1e9, t1 = 1e9;
    const ax = (p: number, d: number, lo: number, hi: number) => {
      if (Math.abs(d) < 1e-9) return p >= lo - eps && p <= hi + eps;
      let a = (lo - p) / d, c = (hi - p) / d;
      if (a > c) { const w = a; a = c; c = w; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, c); return true;
    };
    if (!ax(px, dx, x0, x1) || !ax(py, dy, y0, y1) || t0 >= t1) return '';
    return 'M' + f(px + dx * t0) + ' ' + f(py + dy * t0) + 'L' + f(px + dx * t1) + ' ' + f(py + dy * t1);
  };
  const vLine = (x: number) => 'M' + f(x) + ' ' + f(y0) + 'V' + f(y1);
  const hLine = (y: number) => 'M' + f(x0) + ' ' + f(y) + 'H' + f(x1);
  const path = (d: string, w: number, o: number, extra?: string) => d ? '<path d="' + d + '" stroke-width="' + f(w * q) + '" stroke-opacity="' + op(o) + '"' + (extra || '') + '/>' : '';
  const lat = (n: number, withMid: boolean) => {
    const mm = cell / n, k0 = -Math.floor(strip / mm + 1e-6);
    let minor = '', mid = '';
    for (let i = k0; ox + i * mm < x1 - eps; i++) {
      const x = ox + i * mm;
      if (x <= x0 + eps || i % n === 0) continue;
      if (withMid && i % (n / 2) === 0) mid += vLine(x); else minor += vLine(x);
    }
    for (let i = k0; oy - i * mm > y0 + eps; i++) {
      const y = oy - i * mm;
      if (y >= y1 - eps || i % n === 0) continue;
      if (withMid && i % (n / 2) === 0) mid += hLine(y); else minor += hLine(y);
    }
    return { minor, mid };
  };

  let layerSvg = '', defsSvg = '', fibText = '';

  if (L.mm) { const r = lat(10, true); layerSvg += path(r.minor, 0.8, 0.12) + path(r.mid, 1.3, 0.3); }
  if (L.grid) { const r = lat(5, false); layerSvg += path(r.minor, 1, 0.16); }

  if (L.iso) {
    const sd = cell * 0.5, hd = sd * Math.sin(Math.PI / 3);
    let d = '';
    for (let j = -Math.ceil(strip / hd); oy - j * hd > y0 + eps; j++) { const y = oy - j * hd; if (y < y1 - eps) d += hLine(y); }
    const nk = Math.ceil((fw + fh) / sd) + 2;
    for (let kk = -nk; kk <= nk; kk++) { const bx = ox + kk * sd; d += clip(bx, oy, 0.5, -0.866025) + clip(bx, oy, -0.5, -0.866025); }
    layerSvg += path(d, 1, 0.3);
  }

  if (L.quilt) {
    let d = '';
    const nk = Math.ceil(fh / cell) + Math.ceil(fw / cell) + 2;
    for (let kk = -nk; kk <= nk; kk++) { const bx = ox + kk * cell; d += clip(bx, oy, 1, -1) + clip(bx, oy, 1, 1); }
    layerSvg += path(d, 1.2, 0.26);
  }

  if (L.circle) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rmax = Math.hypot(fw, fh) / 2, step = cell / 2;
    let a = '', c2 = '';
    for (let n = 1; n * step <= rmax + step; n++) {
      const c = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(n * step) + '"/>';
      if (n % 2 === 0) c2 += c; else a += c;
    }
    defsSvg += '<clipPath id="cmFrame"><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(fw) + '" height="' + f(fh) + '"/></clipPath>';
    layerSvg += '<g clip-path="url(#cmFrame)"><g stroke-width="' + f(1 * q) + '" stroke-opacity="' + op(0.35) + '">' + a + '</g><g stroke-width="' + f(1.8 * q) + '" stroke-opacity="' + op(0.6) + '">' + c2 + '</g></g>';
    layerSvg += path(hLine(cy) + vLine(cx), 1.8, 0.6) + path(clip(cx, cy, 1, 1) + clip(cx, cy, 1, -1), 1.2, 0.45);
  }

  if (L.grid || L.mm) {
    let d = '';
    for (let i = 0; ox + i * cell < x1 - eps; i++) d += vLine(ox + i * cell);
    for (let i = 0; oy - i * cell > y0 + eps; i++) d += hLine(oy - i * cell);
    layerSvg += path(d, 2.2, 0.62);
  }

  if (L.dots || L.cross) {
    const a = m * 0.14, A = m * 0.3;
    let dots = '', dotsBig = '', cr = '', crBig = '';
    for (let i = i0; ox + i * m < x1 - eps; i++) {
      const x = ox + i * m;
      if (x <= x0 + eps) continue;
      for (let j = i0; oy - j * m > y0 + eps; j++) {
        const y = oy - j * m;
        if (y >= y1 - eps) continue;
        const isMaj = i % sub === 0 && j % sub === 0;
        if (L.dots) { const seg = 'M' + f(x) + ' ' + f(y) + 'h0.01'; if (isMaj) dotsBig += seg; else dots += seg; }
        if (L.cross) {
          if (isMaj) crBig += 'M' + f(x - A) + ' ' + f(y) + 'h' + f(2 * A) + 'M' + f(x) + ' ' + f(y - A) + 'v' + f(2 * A);
          else cr += 'M' + f(x - a) + ' ' + f(y) + 'h' + f(2 * a) + 'M' + f(x) + ' ' + f(y - a) + 'v' + f(2 * a);
        }
      }
    }
    layerSvg += path(dots, 2.4, 0.5, ' stroke-linecap="round"') + path(dotsBig, 3.8, 0.7, ' stroke-linecap="round"') + path(cr, 1, 0.42) + path(crBig, 1.4, 0.6);
  }

  if (L.fib) {
    const N = 11, dirs = ['r', 't', 'l', 'b'];
    let sq: Sq[] = [{ x: 0, y: 0, s: 1 }], bx0 = 0, by0 = 0, bx1 = 1, by1 = 1;
    for (let n = 1; n < N; n++) {
      const d = dirs[(n - 1) % 4], w = bx1 - bx0, h = by1 - by0;
      let s: number, x: number, y: number;
      if (d === 'r') { s = h; x = bx1; y = by0; bx1 += s; }
      else if (d === 't') { s = w; x = bx0; y = by0 - s; by0 -= s; }
      else if (d === 'l') { s = h; x = bx0 - s; y = by0; bx0 -= s; }
      else { s = w; x = bx0; y = by1; by1 += s; }
      sq.push({ x, y, s });
    }
    // orient: wide frame gets a wide spiral, small end toward the bottom-left corner
    if (((bx1 - bx0) > (by1 - by0)) !== (fw > fh)) sq = sq.map(a => ({ x: a.y, y: a.x, s: a.s }));
    const ext = (): number[] => {
      const xs0 = Math.min(...sq.map(a => a.x)), xs1 = Math.max(...sq.map(a => a.x + a.s));
      const ys0 = Math.min(...sq.map(a => a.y)), ys1 = Math.max(...sq.map(a => a.y + a.s));
      return [xs0, ys0, xs1, ys1];
    };
    let e = ext();
    const smallRight = sq[0].x + 0.5 > (e[0] + e[2]) / 2;
    if (smallRight !== (S.fibSide === 'right')) sq = sq.map(a => ({ x: -(a.x + a.s), y: a.y, s: a.s }));
    e = ext();
    if (sq[0].y + 0.5 < (e[1] + e[3]) / 2) sq = sq.map(a => ({ x: a.x, y: -(a.y + a.s), s: a.s }));
    e = ext();
    // chain quarter arcs so the spiral is continuous
    const cands = (a: Sq) => {
      const cs: Pt[] = [[a.x, a.y], [a.x + a.s, a.y], [a.x + a.s, a.y + a.s], [a.x, a.y + a.s]], out: Arc[] = [];
      for (let c = 0; c < 4; c++) {
        const A = cs[(c + 1) % 4], B = cs[(c + 3) % 4], C = cs[c];
        ([[A, B], [B, A]] as [Pt, Pt][]).forEach(([S0, E0]) => {
          const sg = Math.sign((S0[0] - C[0]) * (E0[1] - C[1]) - (S0[1] - C[1]) * (E0[0] - C[0]));
          out.push({ C, S: S0, E: E0, sg, r: a.s });
        });
      }
      return out;
    };
    const tang = (P: Pt, a: Arc) => [-(P[1] - a.C[1]) * a.sg / a.r, (P[0] - a.C[0]) * a.sg / a.r];
    const same = (P: Pt, Q: Pt) => Math.abs(P[0] - Q[0]) < 1e-6 && Math.abs(P[1] - Q[1]) < 1e-6;
    const all = sq.map(cands), arcs: Arc[] = [];
    const dfs = (i: number): boolean => {
      if (i === sq.length) return true;
      for (const a of all[i]) {
        if (i > 0) {
          const p = arcs[i - 1];
          if (!same(p.E, a.S)) continue;
          const t1 = tang(p.E, p), t2 = tang(a.S, a);
          if (t1[0] * t2[0] + t1[1] * t2[1] < 0.99) continue;
        }
        arcs[i] = a;
        if (dfs(i + 1)) return true;
      }
      return false;
    };
    if (!dfs(0)) arcs.length = 0;
    const bw = e[2] - e[0], bh = e[3] - e[1], sc = Math.min(fw / bw, fh / bh);
    const offx = x0 + (fw - bw * sc) / 2 - e[0] * sc, offy = y0 + (fh - bh * sc) / 2 - e[1] * sc;
    const X = (v: number) => offx + v * sc, Y = (v: number) => offy + v * sc;
    let sqD = '', arcD = '', lab = '';
    const lf = 11 * t;
    sq.forEach(a => {
      sqD += 'M' + f(X(a.x)) + ' ' + f(Y(a.y)) + 'h' + f(a.s * sc) + 'v' + f(a.s * sc) + 'h' + f(-a.s * sc) + 'Z';
      if (a.s * sc >= 3 * lf) lab += '<text x="' + f(X(a.x) + 7 * t) + '" y="' + f(Y(a.y) + lf + 5 * t) + '">' + a.s + '</text>';
    });
    arcs.forEach(a => {
      arcD += 'M' + f(X(a.S[0])) + ' ' + f(Y(a.S[1])) + 'A' + f(a.r * sc) + ' ' + f(a.r * sc) + ' 0 0 ' + (a.sg > 0 ? 1 : 0) + ' ' + f(X(a.E[0])) + ' ' + f(Y(a.E[1]));
    });
    layerSvg += path(sqD, 2.8, 0.9, ' stroke-linejoin="miter"') + path(arcD, 2.8, 0.9, ' stroke-linecap="round"');
    if (lab) fibText = '<g font-family="' + famAll + '" font-size="' + f(lf) + '" fill="' + ink + '" fill-opacity="' + op(0.5) + '">' + lab + '</g>';
  }

  // angle lines from the bottom-left corner of the mat
  let angLabels = '';
  if (L.angles) {
    const end = (th: number) => {
      const r = th * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      const tt = Math.min(fw / c, fh / s);
      return [x0 + c * tt, y1 - s * tt];
    };
    let dashed = '';
    [15, 30, 60, 75].forEach(d => { const e = end(d); dashed += 'M' + f(x0) + ' ' + f(y1) + 'L' + f(e[0]) + ' ' + f(e[1]); });
    const e45 = end(45), solid = 'M' + f(x0) + ' ' + f(y1) + 'L' + f(e45[0]) + ' ' + f(e45[1]);
    layerSvg += path(dashed, 1, 0.38, ' stroke-dasharray="' + f(6 * t) + ' ' + f(5 * t) + '"') + path(solid, 1.6, 0.85);
    const lf = Math.max(6, 0.045 * cell), dist = 1.1 * cell;
    [15, 30, 45, 60, 75].forEach(d => {
      const r = d * Math.PI / 180;
      angLabels += '<text x="' + f(x0 + Math.cos(r) * dist + 3 * t) + '" y="' + f(y1 - Math.sin(r) * dist + lf * 0.35) + '">' + d + '°</text>';
    });
    angLabels = '<g font-family="' + famAll + '" font-size="' + f(lf) + '" fill="' + ink + '" fill-opacity="' + op(0.5) + '">' + angLabels + '</g>';
  }

  // ruler ticks and numbers outside the frame
  let ticks = '', nums = '';
  if (L.ruler) {
    const gap = 16 * t, lmin = 5 * t, lmaj = 11 * t, fsz = 8.5 * t, pad = 4 * t;
    for (let i = i0; ox + i * m <= x1 + eps; i++) {
      const x = ox + i * m;
      if (x < x0 - eps) continue;
      const mj = i % sub === 0;
      ticks += 'M' + f(x) + ' ' + f(y0 - gap) + 'v' + f(-(mj ? lmaj : lmin));
      if (mj && i >= 0) nums += '<text x="' + f(x) + '" y="' + f(y0 - gap - lmaj - pad) + '" text-anchor="middle">' + (i / sub) + '</text>';
    }
    for (let i = i0; oy - i * m >= y0 - eps; i++) {
      const y = oy - i * m;
      if (y > y1 + eps) continue;
      const mj = i % sub === 0, len = mj ? lmaj : lmin;
      ticks += 'M' + f(x0 - gap) + ' ' + f(y) + 'h' + f(-len) + 'M' + f(x1 + gap) + ' ' + f(y) + 'h' + f(len);
      if (mj && i >= 0) {
        nums += '<text x="' + f(x0 - gap - lmaj - pad) + '" y="' + f(y + fsz * 0.35) + '" text-anchor="end">' + (i / sub) + '</text>';
        nums += '<text x="' + f(x1 + gap + lmaj + pad) + '" y="' + f(y + fsz * 0.35) + '" text-anchor="start">' + (i / sub) + '</text>';
      }
    }
    nums = '<g font-family="' + famAll + '" font-size="' + f(fsz) + '" fill="' + ink + '" fill-opacity="' + op(0.55) + '">' + nums + '</g>';
  }

  // text layer: drawn above every grid layer and placed on its own, not snapped to the lattice
  let masks = '', texts = '', labelSvg = '';
  const plate = S.plate !== false;
  const cxF = (x0 + x1) / 2, cyF = (y0 + y1) / 2;
  // plate edges sit exactly on grid lines (never cut through them)
  const snX = (v: number, up: boolean) => ox + (up ? Math.ceil : Math.floor)((v - ox) / m - 1e-6) * m;
  const ie = 1.2 * q; // inset so the plate edge stops at the line's edge instead of covering half its stroke
  const snY = (v: number, up: boolean) => oy + (up ? Math.floor : Math.ceil)((v - oy) / m + 1e-6) * m;

  if (S.quoteOn && S.quote.trim()) {
    const lines = S.quote.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 4);
    const fam = famAll;
    const fs = cell * 0.24 * S.quoteSize;
    const maxW = Math.max(...lines.map(l => tw(l, fs, fam)));
    const lh = fs * 1.02, textH = lh * lines.length;
    const n = Math.max(2, Math.ceil((maxW + cell * 0.7) / cell));
    const r = Math.max(1, Math.ceil((textH + cell * 0.5) / cell));
    const needW = maxW + cell * 0.7, needH = textH + cell * 0.5;
    const px0 = snX(cxF - needW / 2, false), px1 = snX(cxF + needW / 2, true);
    const py0 = snY(cyF - needH / 2, true), py1 = snY(cyF + needH / 2, false);
    if (plate) {
      masks += '<rect x="' + f(px0 + ie) + '" y="' + f(py0 + ie) + '" width="' + f(px1 - px0 - 2 * ie) + '" height="' + f(py1 - py0 - 2 * ie) + '"/>';
    }
    const cx = cxF, cy = cyF;
    let tsp = '';
    lines.forEach((l, i) => {
      tsp += '<tspan x="' + f(cx) + '" y="' + f(cy - textH / 2 + lh * (i + 0.5) + fs * 0.33) + '">' + esc(l) + '</tspan>';
    });
    texts += '<text font-family="' + fam + '" font-size="' + f(fs) + '" text-anchor="middle" letter-spacing="' + f(-fs * 0.01) + '" fill="' + ink + '" fill-opacity="' + op(0.95) + '">' + tsp + '</text>';
  }

  if (S.bodyOn && S.body.trim()) {
    const fam = famAll, fs = cell * 0.095, lh = fs * 1.38;
    const left = Math.max(ox, snX(x1 - S.bodyCols * cell, false));
    const maxW = Math.max(cell * 0.8, x1 - left - cell * 0.7);
    const lines = wrapText(S.body, fs, fam, maxW);
    const textH = lines.length * lh;
    const by = Math.max(y0, snY(y1 - (textH + cell * 0.44), true)), bh = y1 - by;
    if (plate) {
      masks += '<rect x="' + f(left + ie) + '" y="' + f(by + ie) + '" width="' + f(x1 - left - ie) + '" height="' + f(bh - ie) + '"/>';
    }
    const top = by + (bh - textH) / 2;
    let tsp = '';
    lines.forEach((l, i) => {
      tsp += '<tspan x="' + f(left + cell * 0.35) + '" y="' + f(top + lh * (i + 0.5) + fs * 0.33) + '">' + esc(l) + '</tspan>';
    });
    texts += '<text font-family="' + fam + '" font-size="' + f(fs) + '" fill="' + ink + '" fill-opacity="' + op(0.85) + '">' + tsp + '</text>';
  }

  if (L.label && S.label.trim()) {
    const raw = S.label.replace(/\{ratio\}/g, ratioLabel(W, H)).replace(/\{year\}/g, String(new Date().getFullYear())).replace(/\{size\}/g, W + '×' + H);
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3);
    const fs = Math.max(7, cell * 0.058), lh = fs * 1.4;
    const fam = famAll;
    const len = Math.max(...lines.map(l => tw(l.toUpperCase(), fs, fam) * 1.07));
    const lh2 = Math.min(fh, snY(y0 + len + cell * 0.45, false) - y0);
    if (plate) {
      labelSvg += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(strip - ie) + '" height="' + f(lh2 - ie) + '" fill="' + bg + '" stroke="none"/>';
    }
    const bx = x0 + strip * 0.5 + (lines.length - 1) * lh * 0.5, by = y0 + cell * 0.22;
    let tsp = '';
    lines.forEach((l, i) => { tsp += '<tspan x="0" y="' + f(i * lh) + '">' + esc(l.toUpperCase()) + '</tspan>'; });
    labelSvg += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(90)"><text font-family="' + fam + '" font-size="' + f(fs) + '" letter-spacing="' + f(fs * 0.07) + '" fill="' + ink + '" fill-opacity="' + op(0.85) + '">' + tsp + '</text></g>';
  }

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
  if (opts && opts.embed) {
    const used = [S.font];
    const uniq = Array.from(new Set(used));
    let css = '';
    if (opts.imports) uniq.forEach(id => { if (FONT_GF[id]) css += '@import url(' + FONT_GF[id] + ');'; });
    uniq.forEach(id => { if (FONT_EMBED[id]) css += FONT_EMBED[id]; });
    if (css) svg += '<defs><style><![CDATA[' + css + ']]></style></defs>';
  }
  svg += '<rect width="' + W + '" height="' + H + '" fill="' + bg + '"/>';
  svg += '<g fill="none" stroke="' + ink + '">' + (defsSvg ? '<defs>' + defsSvg + '</defs>' : '') + layerSvg + '</g>' + labelSvg;
  if (masks) svg += '<g fill="' + bg + '">' + masks + '</g>';
  if (L.frame) svg += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(fw) + '" height="' + f(fh) + '" fill="none" stroke="' + ink + '" stroke-opacity="' + op(0.8) + '" stroke-width="' + f(2.4 * q) + '"/>';
  if (ticks) svg += '<path d="' + ticks + '" fill="none" stroke="' + ink + '" stroke-opacity="' + op(0.5) + '" stroke-width="' + f(1 * q) + '"/>';
  svg += nums + angLabels + fibText + texts;
  if (S.shadow) svg += shadowSVG(W, H, S.seed, S.shadowAmt, S.shadowStyle);
  svg += '</svg>';
  return svg;
}
