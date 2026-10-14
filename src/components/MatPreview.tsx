import { useMemo, type CSSProperties } from 'react';

/** Renders the generated SVG string, scaled to fill a box that keeps the wallpaper's aspect ratio. */
export default function MatPreview({ svg, aspect }: { svg: string; aspect: number }) {
  const html = useMemo(
    () => svg.replace(/^<svg ([^>]*?)width="\d+" height="\d+"/, '<svg $1width="100%" height="100%"'),
    [svg],
  );
  return (
    <div className="canvasWrap">
      <div
        className="mat"
        style={{ '--ar': aspect } as CSSProperties}
        role="img"
        aria-label="ตัวอย่างวอลเปเปอร์"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
