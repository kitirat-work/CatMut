import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { State } from '../../lib/constants';
import { addGoogleFont, addUploadedFont, type FontAdded } from '../../lib/fonts';
import type { ShowToast } from '../Toast';
import { Button, Section } from '../ui';

export default function FontSection({ S, onFontAdded, toast }: { S: State; onFontAdded: (f: FontAdded) => void; toast: ShowToast }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const addGoogle = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    const res = await addGoogleFont(name, (S.quote + S.body + S.label).slice(0, 400));
    setBusy(false);
    if (!res.ok) {
      toast('ไม่พบฟอนต์ "' + res.name + '" ใน Google Fonts ลองตรวจการสะกด');
      return;
    }
    setName('');
    onFontAdded(res);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onFontAdded(await addUploadedFont(file));
    } catch (err) {
      toast((err as Error).message);
    }
  };

  return (
    <Section title="ฟอนต์เพิ่มเติม">
      <div className="blk">
        <span>จาก Google Fonts</span>
        <div className="ctl">
          <input
            type="text"
            placeholder="เช่น Playfair Display"
            style={{ flex: 1 }}
            spellCheck={false}
            aria-label="ชื่อฟอนต์ Google Fonts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoogle()}
          />
          <Button size="sm" onClick={addGoogle} disabled={busy}>
            เพิ่ม
          </Button>
        </div>
        <p className="hint">
          พิมพ์ชื่อตามที่เห็นบน fonts.google.com ในไฟล์ SVG จะใส่ลิงก์ฟอนต์ให้ เปิดในเบราว์เซอร์ตอนออนไลน์จะเห็นฟอนต์นี้ แต่โปรแกรมออกแบบบางตัวไม่โหลดให้
        </p>
      </div>
      <div className="blk">
        <span>อัปโหลดไฟล์ฟอนต์</span>
        <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={onFile} aria-label="อัปโหลดไฟล์ฟอนต์" />
        <p className="hint">ฝังฟอนต์ไว้ในไฟล์ SVG และ PNG ให้เลย เปิดที่ไหนก็เห็นเหมือนกัน (ไม่เกิน 6 MB)</p>
      </div>
    </Section>
  );
}
