import { build } from './generator';
import { EXPORT_PNG, EXPORT_SVG, type State } from './constants';

const baseName = (S: State) => 'catmut-' + S.cw + 'x' + S.ch;

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function svgCode(S: State) {
  return build(S, EXPORT_SVG);
}

export function downloadSvg(S: State) {
  const filename = baseName(S) + '.svg';
  saveBlob(new Blob([svgCode(S)], { type: 'image/svg+xml' }), filename);
  return filename;
}

export async function downloadPng(S: State) {
  const filename = baseName(S) + '.png';
  const svg = build(S, EXPORT_PNG);
  const img = new Image();
  await new Promise<unknown>((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const canvas = document.createElement('canvas');
  canvas.width = S.cw;
  canvas.height = S.ch;
  canvas.getContext('2d')!.drawImage(img, 0, 0, S.cw, S.ch);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png'),
  );
  saveBlob(blob, filename);
  return filename;
}

/** Resolves true when copied, false when the clipboard is unavailable (caller shows the code instead). */
export async function copySvg(S: State) {
  try {
    await navigator.clipboard.writeText(svgCode(S));
    return true;
  } catch {
    return false;
  }
}
