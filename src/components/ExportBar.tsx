import { useEffect, useRef, useState } from 'react';
import { knownRatio } from '../lib/generator';
import { copySvg, downloadPng, downloadSvg, svgCode } from '../lib/download';
import type { State } from '../lib/constants';
import type { ShowToast } from './Toast';
import { Button } from './ui';

export function ratioText(S: State) {
  const kr = knownRatio(S.cw, S.ch);
  const orient = S.cw === S.ch ? 'จัตุรัส' : S.cw > S.ch ? 'แนวนอน' : 'แนวตั้ง';
  const rl = kr ? (S.cw >= S.ch ? kr[0] + ':' + kr[1] : kr[1] + ':' + kr[0]) : 'กำหนดเอง';
  return rl + ' · ' + orient;
}

export default function ExportBar({ S, toast }: { S: State; toast: ShowToast }) {
  const [busy, setBusy] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const codeRef = useRef<HTMLTextAreaElement>(null);

  // Keep the visible code in sync while the panel is open.
  useEffect(() => {
    if (codeOpen) setCode(svgCode(S));
  }, [codeOpen, S]);

  const onCopy = async () => {
    if (await copySvg(S)) {
      toast('คัดลอกโค้ด SVG แล้ว');
      return;
    }
    setCodeOpen(true);
    setCode(svgCode(S));
    setTimeout(() => {
      codeRef.current?.focus();
      codeRef.current?.select();
    }, 0);
    toast('เลือกโค้ดไว้แล้ว กด Ctrl/⌘+C เพื่อคัดลอก');
  };

  const onSvg = () => {
    try {
      toast('บันทึก ' + downloadSvg(S) + ' แล้ว');
    } catch {
      toast('ดาวน์โหลดไม่สำเร็จ ลองกด "คัดลอกโค้ด SVG" แทน');
    }
  };

  const onPng = async () => {
    setBusy(true);
    try {
      toast('บันทึก ' + (await downloadPng(S)) + ' แล้ว');
    } catch {
      toast('สร้าง PNG ไม่สำเร็จ ลองลดขนาดภาพแล้วลองใหม่');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bar">
        <div className="readout">
          <span>
            <b>
              {S.cw} × {S.ch}
            </b>{' '}
            px
          </span>
          <span>{ratioText(S)}</span>
        </div>
        <Button onClick={onCopy}>คัดลอกโค้ด SVG</Button>
        <Button onClick={onPng} disabled={busy}>
          ดาวน์โหลด PNG
        </Button>
        <Button variant="primary" onClick={onSvg}>
          ดาวน์โหลด SVG
        </Button>
      </div>
      <details className="code" open={codeOpen} onToggle={(e) => setCodeOpen(e.currentTarget.open)}>
        <summary>ดูโค้ด SVG</summary>
        <textarea ref={codeRef} readOnly spellCheck={false} value={code} aria-label="โค้ด SVG" />
      </details>
    </>
  );
}
