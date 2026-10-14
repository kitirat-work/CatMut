import { RATIOS, SIZE_LIMITS, type SetState, type State } from '../../lib/constants';
import { knownRatio } from '../../lib/generator';
import { Button, Chip, NumberField, Section } from '../ui';

export default function SizeSection({ S, set }: { S: State; set: SetState }) {
  const kr = knownRatio(S.cw, S.ch);

  // Keep the longer side, change the shorter one to match the ratio (portrait stays portrait).
  const pickRatio = (a: number, b: number) => {
    const long = Math.max(S.cw, S.ch);
    const short = Math.round((long * b) / a);
    set(S.ch > S.cw ? { cw: short, ch: long } : { cw: long, ch: short });
  };

  return (
    <Section title="ขนาดและอัตราส่วน">
      <div className="chips">
        {RATIOS.map(([label, a, b]) => (
          <Chip key={label} pressed={!!kr && kr[0] === a && kr[1] === b} onClick={() => pickRatio(a, b)}>
            {label}
          </Chip>
        ))}
      </div>
      <div className="dims">
        <NumberField label="ความกว้าง px" value={S.cw} {...SIZE_LIMITS} onValid={(cw) => set({ cw })} />
        <span className="x">×</span>
        <NumberField label="ความสูง px" value={S.ch} {...SIZE_LIMITS} onValid={(ch) => set({ ch })} />
        <span className="x">px</span>
        <Button size="sm" onClick={() => set({ cw: S.ch, ch: S.cw })}>
          สลับแนวตั้ง/นอน
        </Button>
      </div>
      <p className="hint">
        {kr ? 'พิมพ์ตัวเลขเองได้ที่ช่องกว้าง × สูง' : 'ขนาดกำหนดเอง ไม่ตรงกับอัตราส่วนสำเร็จรูป'}
      </p>
    </Section>
  );
}
