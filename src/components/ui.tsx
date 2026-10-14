// Design-system primitives: Button, Switch, Chip (LayerChip), PresetSwatch, Segmented, plus form helpers.
// Class names and states follow design-system/components/*.md.
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Preset } from '../lib/constants';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'; size?: 'sm' };

export function Button({ variant, size, className = '', children, ...rest }: ButtonProps) {
  const cls = ['btn', variant === 'primary' && 'primary', size === 'sm' && 'sm', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/** Boolean option. For a choice between two named options use Chip/Segmented instead. */
export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="sw">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span>{label}</span>
    </label>
  );
}

/** Toggle chip. `font="ui"` for Thai labels, default is the mono chip style. */
export function Chip({ pressed, font, onClick, children }: { pressed: boolean; font?: 'ui'; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={'chip' + (font === 'ui' ? ' ui' : '')} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

export function PresetSwatch({ preset, pressed, onSelect }: { preset: Preset; pressed: boolean; onSelect: () => void }) {
  return (
    <button type="button" className="sw-btn" aria-pressed={pressed} onClick={onSelect}>
      <i style={{ background: preset.bg }} />
      <span>{preset.name}</span>
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="row">
      <span>{label}</span>
      {children}
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, format = (v) => v }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => ReactNode;
}) {
  return (
    <Row label={label}>
      <div className="ctl">
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
        />
        <output>{format(value)}</output>
      </div>
    </Row>
  );
}

/** Text input that keeps its own draft while focused, so partial input is never overwritten. */
function useDraft<T>(value: T) {
  const [draft, setDraft] = useState<string | null>(null);
  return [draft ?? value, setDraft] as const;
}

export function HexField({ value, onValid, label }: { value: string; onValid: (v: string) => void; label: string }) {
  const [shown, setDraft] = useDraft(value);
  return (
    <input
      type="text"
      className="hex"
      maxLength={7}
      spellCheck={false}
      aria-label={label}
      value={shown}
      onChange={(e) => {
        const v = e.target.value.trim();
        setDraft(e.target.value);
        if (/^#[0-9a-f]{6}$/i.test(v)) onValid(v.toLowerCase());
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

export function NumberField({ value, min, max, onValid, label }: { value: number; min: number; max: number; onValid: (v: number) => void; label: string }) {
  const [shown, setDraft] = useDraft(value);
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={1}
      aria-label={label}
      value={shown}
      onChange={(e) => {
        setDraft(e.target.value);
        const v = Math.round(+e.target.value);
        if (v >= min && v <= max) onValid(v);
      }}
      onBlur={(e) => {
        const v = Math.min(max, Math.max(min, Math.round(+e.target.value) || value));
        onValid(v);
        setDraft(null);
      }}
    />
  );
}
