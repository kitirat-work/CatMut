import type { ReactNode } from 'react';
import type { SetState, State } from '../../lib/constants';
import { GF_GROUPS, ensureFont } from '../../lib/fonts';
import { Row, Section, Slider, Switch } from '../ui';

function FontSelect({ value, customFonts, onChange }: { value: string; customFonts: { id: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select aria-label="ฟอนต์ของข้อความทั้งหมด" value={value} onChange={(e) => onChange(e.target.value)}>
      <optgroup label="ระบบ">
        <option value="sans">Helvetica / Arial</option>
        <option value="serif">Georgia</option>
        <option value="mono">Mono</option>
      </optgroup>
      {GF_GROUPS.map(([label, , names]) => (
        <optgroup key={label} label={label}>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </optgroup>
      ))}
      {customFonts.length > 0 && (
        <optgroup label="เพิ่มเอง">
          {customFonts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

function TextBlock({ on, onToggle, label, children }: { on: boolean; onToggle: (v: boolean) => void; label: string; children: ReactNode }) {
  return (
    <div className={'blk' + (on ? '' : ' off')}>
      <Switch label={label} checked={on} onChange={onToggle} />
      <div className="body">{children}</div>
    </div>
  );
}

export default function TextSection({ S, set, customFonts, onFontReady }: {
  S: State; set: SetState; customFonts: { id: string; label: string }[]; onFontReady: () => void;
}) {
  const pickFont = async (font: string) => {
    set({ font });
    await ensureFont(font, (S.quote + S.body + S.label).slice(0, 400));
    onFontReady();
  };

  return (
    <Section title="ข้อความ · เลเยอร์บน">
      <Row label="ฟอนต์ (ใช้กับข้อความทั้งหมด)">
        <FontSelect value={S.font} customFonts={customFonts} onChange={pickFont} />
      </Row>
      <Switch label="พื้นกล่องหลังข้อความ (บังเส้นกริด)" checked={S.plate} onChange={(plate) => set({ plate })} />

      <TextBlock on={S.quoteOn} onToggle={(quoteOn) => set({ quoteOn })} label="Quote กลางภาพ">
        <textarea
          rows={2}
          aria-label="ข้อความ Quote"
          placeholder="พิมพ์ข้อความ (ขึ้นบรรทัดใหม่ได้)"
          disabled={!S.quoteOn}
          value={S.quote}
          onChange={(e) => set({ quote: e.target.value })}
        />
        <Slider
          label="ขนาดตัวอักษร"
          min={50}
          max={180}
          step={5}
          value={Math.round(S.quoteSize * 100)}
          onChange={(v) => set({ quoteSize: v / 100 })}
          format={(v) => v + '%'}
        />
      </TextBlock>

      <TextBlock on={S.bodyOn} onToggle={(bodyOn) => set({ bodyOn })} label="ย่อหน้ามุมขวาล่าง">
        <textarea
          rows={4}
          aria-label="ข้อความย่อหน้า"
          placeholder="ข้อความย่อหน้า"
          disabled={!S.bodyOn}
          value={S.body}
          onChange={(e) => set({ body: e.target.value })}
        />
        <Slider
          label="ความกว้างกล่อง (ช่อง)"
          min={2}
          max={6}
          step={1}
          value={S.bodyCols}
          onChange={(bodyCols) => set({ bodyCols })}
        />
      </TextBlock>
    </Section>
  );
}
