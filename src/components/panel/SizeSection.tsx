import { CORNER_MAX, CORNER_PRESETS, RATIOS, SAFE_MAX, SAFE_PRESETS, SIZE_LIMITS, type SetState, type State } from '../../lib/constants';
import { knownRatio } from '../../lib/generator';
import { Button, Chip, NumberField, Section, Slider } from '../ui';

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

      <div className="chips" role="group" aria-label="พื้นที่ปลอดภัย">
        {SAFE_PRESETS.map(([key, label, top, bottom]) => (
          <Chip key={key} font="ui" pressed={S.safeTop === top && S.safeBottom === bottom} onClick={() => set({ safeTop: top, safeBottom: bottom })}>
            {label}
          </Chip>
        ))}
      </div>
      <Slider
        label="เว้นขอบบน"
        min={0}
        max={SAFE_MAX}
        step={0.5}
        value={S.safeTop}
        onChange={(safeTop) => set({ safeTop })}
        format={(v) => v + '% · ' + Math.round((S.ch * v) / 100) + ' px'}
      />
      <Slider
        label="เว้นขอบล่าง"
        min={0}
        max={SAFE_MAX}
        step={0.5}
        value={S.safeBottom}
        onChange={(safeBottom) => set({ safeBottom })}
        format={(v) => v + '% · ' + Math.round((S.ch * v) / 100) + ' px'}
      />
      <p className="hint">เลื่อนลายแผ่นรองตัดให้พ้นแถบเมนูของ Mac หรือแถบสถานะและแถบโฮมของมือถือ พื้นหลังยังเต็มจอ</p>

      <div className="chips" role="group" aria-label="มุมจอ">
        {CORNER_PRESETS.map(([key, label, corner]) => (
          <Chip key={key} font="ui" pressed={S.corner === corner} onClick={() => set({ corner })}>
            {label}
          </Chip>
        ))}
      </div>
      <Slider
        label="มุมโค้งตามจอ"
        min={0}
        max={CORNER_MAX}
        step={0.5}
        value={S.corner}
        onChange={(corner) => set({ corner })}
        format={(v) => v + '% · ' + Math.round((Math.min(S.cw, S.ch) * v) / 100) + ' px'}
      />
      <p className="hint">ใส่รัศมีมุมจอ กรอบและลายจะโค้งขนานไปกับขอบจอ</p>
    </Section>
  );
}
