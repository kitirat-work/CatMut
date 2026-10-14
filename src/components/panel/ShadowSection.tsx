import { SHADOWS, type SetState, type State } from '../../lib/constants';
import { Button, Chip, Section, Slider, Switch } from '../ui';

export default function ShadowSection({ S, set }: { S: State; set: SetState }) {
  return (
    <Section title="เงา">
      <Switch label="ใส่เงาทาบ" checked={S.shadow} onChange={(shadow) => set({ shadow })} />
      <div className={'body' + (S.shadow ? '' : ' off')} style={S.shadow ? undefined : { opacity: 0.45, pointerEvents: 'none' }}>
        <div className="chips" role="group" aria-label="รูปแบบเงา">
          {SHADOWS.map(([key, label]) => (
            <Chip key={key} font="ui" pressed={S.shadowStyle === key} onClick={() => set({ shadowStyle: key, shadow: true })}>
              {label}
            </Chip>
          ))}
        </div>
        <Slider
          label="ความเข้ม"
          min={10}
          max={100}
          step={5}
          value={S.shadowAmt}
          onChange={(shadowAmt) => set({ shadowAmt })}
          format={(v) => v + '%'}
        />
        <div>
          <Button size="sm" onClick={() => set({ seed: (Math.random() * 1e6) | 0, shadow: true })}>
            สุ่มรูปทรงเงาใหม่
          </Button>
        </div>
      </div>
    </Section>
  );
}
