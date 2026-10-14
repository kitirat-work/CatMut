import { PRESETS, type SetState, type State } from '../../lib/constants';
import { HexField, PresetSwatch, Row, Section, Segmented, Slider } from '../ui';

export default function ColorSection({ S, set }: { S: State; set: SetState }) {
  return (
    <Section title="สี">
      <div className="swatches">
        {PRESETS.map((p) => (
          <PresetSwatch
            key={p.bg}
            preset={p}
            pressed={p.bg === S.bg.toLowerCase()}
            onSelect={() => set({ bg: p.bg, ink: 'auto', intensity: p.intensity })}
          />
        ))}
      </div>
      <Row label="สีพื้น">
        <div className="ctl">
          <input
            type="color"
            aria-label="สีพื้น"
            value={S.bg}
            onChange={(e) => set({ bg: e.target.value.toLowerCase() })}
          />
          <HexField label="รหัสสีพื้น" value={S.bg} onValid={(bg) => set({ bg })} />
        </div>
      </Row>
      <Row label="สีเส้น">
        <div className="ctl">
          {S.ink !== 'auto' && (
            <input
              type="color"
              aria-label="สีเส้น"
              value={S.inkCustom}
              onChange={(e) => set({ inkCustom: e.target.value })}
            />
          )}
          <Segmented
            value={S.ink}
            onChange={(ink) => set({ ink })}
            options={[
              ['auto', 'อัตโนมัติ'],
              ['custom', 'กำหนดเอง'],
            ]}
          />
        </div>
      </Row>
      <Slider
        label="ความเข้มเส้น"
        min={20}
        max={160}
        step={5}
        value={S.intensity}
        onChange={(intensity) => set({ intensity })}
        format={(v) => v + '%'}
      />
    </Section>
  );
}
