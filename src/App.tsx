import { useCallback, useEffect, useMemo, useState } from 'react';
import { build } from './lib/generator';
import { DEFAULT_STATE, type LayerKey, type State } from './lib/constants';
import type { FontAdded } from './lib/fonts';
import { useToast } from './components/Toast';
import MatPreview from './components/MatPreview';
import ExportBar from './components/ExportBar';
import ColorSection from './components/panel/ColorSection';
import SizeSection from './components/panel/SizeSection';
import PatternSection from './components/panel/PatternSection';
import ShadowSection from './components/panel/ShadowSection';
import TextSection from './components/panel/TextSection';
import FontSection from './components/panel/FontSection';

export default function App() {
  const [S, setS] = useState<State>(DEFAULT_STATE);
  const [lastLayer, setLastLayer] = useState<LayerKey>('grid');
  const [customFonts, setCustomFonts] = useState<{ id: string; label: string }[]>([]);
  const [fontTick, setFontTick] = useState(0);
  const [toast, toastNode] = useToast();

  const set = useCallback((patch: Partial<State>) => setS((s) => ({ ...s, ...patch })), []);
  const bumpFonts = useCallback(() => setFontTick((t) => t + 1), []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLastLayer(key);
    setS((s) => ({ ...s, layers: { ...s.layers, [key]: !s.layers[key] } }));
  }, []);

  // Text is measured with the live font, so redraw whenever a web font finishes loading.
  useEffect(() => {
    if (!document.fonts) return undefined;
    document.fonts.addEventListener('loadingdone', bumpFonts);
    Promise.all([document.fonts.load('400 24px Newsreader'), document.fonts.ready]).then(bumpFonts).catch(() => {});
    return () => document.fonts.removeEventListener('loadingdone', bumpFonts);
  }, [bumpFonts]);

  const svg = useMemo(() => build(S), [S, fontTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFontAdded = useCallback(
    ({ id, label, existing }: FontAdded) => {
      if (!existing) setCustomFonts((list) => [...list, { id, label }]);
      set({ font: id });
      if (!existing) toast('ใช้ฟอนต์ "' + label + '" กับข้อความทั้งหมดแล้ว');
    },
    [set, toast],
  );

  return (
    <>
      <div className="app">
        <main className="stage">
          <header className="top">
            <h1>CatMut</h1>
            <p>สร้างวอลเปเปอร์ลาย cutting mat เป็นไฟล์ SVG</p>
          </header>
          <MatPreview svg={svg} aspect={S.cw / S.ch} />
          <ExportBar S={S} toast={toast} />
        </main>

        <aside className="panel" aria-label="ตัวเลือก">
          <ColorSection S={S} set={set} />
          <SizeSection S={S} set={set} />
          <PatternSection S={S} set={set} lastLayer={lastLayer} onToggleLayer={toggleLayer} />
          <ShadowSection S={S} set={set} />
          <TextSection S={S} set={set} customFonts={customFonts} onFontReady={bumpFonts} />
          <FontSection S={S} onFontAdded={onFontAdded} toast={toast} />
        </aside>
      </div>
      {toastNode}
    </>
  );
}
