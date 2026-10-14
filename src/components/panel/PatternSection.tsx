import { LAYERS, type LayerKey, type SetState, type State } from '../../lib/constants';
import { Chip, Row, Section, Segmented, Slider } from '../ui';

export default function PatternSection({ S, set, lastLayer, onToggleLayer }: {
  S: State; set: SetState; lastLayer: LayerKey; onToggleLayer: (k: LayerKey) => void;
}) {
  const hint = (LAYERS.find((l) => l[0] === lastLayer) || [])[2] || '';

  return (
    <Section title="ลวดลาย · เลเยอร์ล่าง ซ้อนได้หลายอัน">
      <div className="chips" role="group" aria-label="เลเยอร์ลวดลาย">
        {LAYERS.map(([key, label]) => (
          <Chip key={key} font="ui" pressed={!!S.layers[key]} onClick={() => onToggleLayer(key)}>
            {label}
          </Chip>
        ))}
      </div>
      <p className="hint">{hint}</p>

      {S.layers.fib && (
        <Row label="Fibonacci ด้านเล็กอยู่ทาง">
          <Segmented
            value={S.fibSide}
            onChange={(fibSide) => set({ fibSide })}
            options={[
              ['left', 'ซ้าย'],
              ['right', 'ขวา'],
            ]}
          />
        </Row>
      )}

      {S.layers.label && (
        <div className="blk">
          <span>ข้อความป้ายแนวตั้งมุมซ้ายบน</span>
          <textarea
            rows={2}
            aria-label="ข้อความป้ายแนวตั้ง"
            value={S.label}
            onChange={(e) => set({ label: e.target.value })}
          />
          <p className="hint">ใช้ {'{ratio}'} {'{year}'} {'{size}'} แทนค่าอัตโนมัติได้</p>
        </div>
      )}

      <Slider
        label="ขนาดช่อง"
        min={60}
        max={160}
        step={5}
        value={Math.round(S.cell * 100)}
        onChange={(v) => set({ cell: v / 100 })}
        format={(v) => v + '%'}
      />
    </Section>
  );
}
