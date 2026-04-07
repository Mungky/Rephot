'use client';

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

type OtpInputsProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export function OtpInputs({ value, onChange, disabled, idPrefix = 'otp' }: OtpInputsProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!disabled && value.length === 0) {
      refs.current[0]?.focus();
    }
  }, [disabled, value.length]);

  const slots = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const onChangeSlot = (index: number, inputVal: string) => {
    const d = inputVal.replace(/\D/g, '').slice(-1);
    if (!d) {
      onChange(value.slice(0, index));
      return;
    }
    if (index > value.length) {
      requestAnimationFrame(() => refs.current[value.length]?.focus());
      return;
    }
    const next = (value.slice(0, index) + d + value.slice(index + 1)).slice(0, 6);
    onChange(next);
    if (index < 5) {
      requestAnimationFrame(() => refs.current[index + 1]?.focus());
    }
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        e.preventDefault();
        onChange(value.slice(0, index) + value.slice(index + 1));
        return;
      }
      e.preventDefault();
      if (index > 0) {
        onChange(value.slice(0, index));
        refs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(raw);
    const focusIdx = Math.min(raw.length, 5);
    requestAnimationFrame(() => refs.current[focusIdx]?.focus());
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label="6-digit verification code">
      {slots.map((d, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={d}
          onPaste={i === 0 ? onPaste : undefined}
          onChange={(e) => onChangeSlot(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="h-12 w-10 sm:w-11 rounded-xl border border-neutral-200 bg-[#F9F9F9] text-center text-lg font-semibold tracking-tight text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
