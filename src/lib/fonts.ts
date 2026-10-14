import { FONTS, FONT_GF, FONT_EMBED } from './generator';

export const GENERIC: Record<string, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: 'Menlo, Consolas, monospace',
  thai: 'Tahoma, sans-serif',
  hand: "'Comic Sans MS', cursive",
};

// [group label, generic fallback, family names]
export const GF_GROUPS: [string, string, string[]][] = [
  ['Serif', 'serif', ['Newsreader', 'Playfair Display', 'Cormorant Garamond', 'DM Serif Display', 'Libre Baskerville', 'Lora', 'Fraunces', 'Source Serif 4', 'Instrument Serif']],
  ['Sans', 'sans', ['Inter', 'DM Sans', 'Work Sans', 'Manrope', 'Space Grotesk', 'Poppins', 'Montserrat', 'Archivo', 'Bebas Neue']],
  ['ภาษาไทย', 'thai', ['IBM Plex Sans Thai', 'Noto Sans Thai', 'Noto Serif Thai', 'Sarabun', 'Prompt', 'Kanit', 'Mitr', 'Pridi', 'Krub', 'Mali']],
  ['Mono', 'mono', ['IBM Plex Mono', 'JetBrains Mono', 'Space Mono']],
  ['ลายมือ / โชว์', 'hand', ['Caveat', 'Pacifico', 'Abril Fatface']],
];

export const gfUrl = (name: string) =>
  'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + '&display=swap';

// Register every listed Google font so the generator can resolve its font-family stack.
GF_GROUPS.forEach(([, generic, names]) =>
  names.forEach((n) => {
    FONTS[n] = "'" + n + "', " + GENERIC[generic];
    FONT_GF[n] = gfUrl(n);
  }),
);

// Already linked from index.html
const loaded = new Set(['Newsreader', 'IBM Plex Mono', 'IBM Plex Sans Thai']);

function loadSheet(href: string) {
  return new Promise<boolean>((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    const timer = setTimeout(() => resolve(false), 8000);
    link.onload = () => { clearTimeout(timer); resolve(true); };
    link.onerror = () => { clearTimeout(timer); resolve(false); };
    document.head.appendChild(link);
  });
}

/** Load a listed Google font on demand (no-op for system fonts and already loaded ones). */
export async function ensureFont(id: string, sample = 'Abc') {
  if (!FONT_GF[id] || loaded.has(id)) return;
  await loadSheet(FONT_GF[id]);
  loaded.add(id);
  try { await document.fonts.load('400 24px ' + FONTS[id], sample); } catch { /* ignore */ }
}

/**
 * Add a Google font by name. Resolves to
 *  { ok: true, id, label, existing } or { ok: false }.
 */
export type FontAdded = { id: string; label: string; existing?: boolean };
type GoogleFontResult = ({ ok: true } & FontAdded) | { ok: false; name?: string; empty?: boolean };

export async function addGoogleFont(rawName: string, sample: string): Promise<GoogleFontResult> {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, empty: true };
  if (FONTS[name]) {
    await ensureFont(name, sample);
    return { ok: true, id: name, label: name, existing: true };
  }
  FONTS[name] = "'" + name + "', " + GENERIC.sans;
  FONT_GF[name] = gfUrl(name);
  let ok = await loadSheet(FONT_GF[name]);
  if (ok) {
    try { ok = (await document.fonts.load('400 24px ' + FONTS[name], 'Abc')).length > 0; } catch { ok = false; }
  }
  if (!ok) {
    delete FONTS[name];
    delete FONT_GF[name];
    return { ok: false, name };
  }
  loaded.add(name);
  return { ok: true, id: name, label: name + ' (Google)', existing: false };
}

const FORMATS: Record<string, [string, string]> = {
  ttf: ['truetype', 'font/ttf'],
  otf: ['opentype', 'font/otf'],
  woff: ['woff', 'font/woff'],
  woff2: ['woff2', 'font/woff2'],
};
const MAX_FONT_BYTES = 6 * 1024 * 1024;

/** Register an uploaded font file; it is embedded into exported SVG/PNG. Throws Error(thaiMessage). */
export async function addUploadedFont(file: File): Promise<FontAdded> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const fmt = FORMATS[ext];
  if (!fmt) throw new Error('รองรับไฟล์ .ttf .otf .woff .woff2');
  if (file.size > MAX_FONT_BYTES) throw new Error('ไฟล์ฟอนต์ใหญ่เกิน 6 MB');

  const buf = await file.arrayBuffer();
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w\- ฀-๿]/g, '').trim() || 'Custom';
  const family = 'UP ' + base;
  try {
    const face = new FontFace(family, buf.slice(0));
    await face.load();
    document.fonts.add(face);
  } catch {
    throw new Error('อ่านไฟล์ฟอนต์ไม่ได้');
  }

  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  FONTS[family] = "'" + family + "', " + GENERIC.sans;
  FONT_EMBED[family] =
    "@font-face{font-family:'" + family + "';src:url(data:" + fmt[1] + ';base64,' + btoa(bin) + ") format('" + fmt[0] + "');}";
  return { id: family, label: base + ' (อัปโหลด)' };
}
