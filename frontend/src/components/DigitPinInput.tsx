'use client';

import React, { useRef, useState } from 'react';

interface DigitPinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function DigitPinInput({ length = 6, value, onChange, onComplete }: DigitPinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newDigits = value.split('');
    // Handle single character or last typed digit
    newDigits[idx] = val.substring(val.length - 1);
    const combined = newDigits.join('').slice(0, length);
    onChange(combined);

    // Auto-focus next box
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (!value[idx] && idx > 0) {
        // Move to previous input on backspace
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const pastedDigits = pasteData.slice(0, length);
    onChange(pastedDigits);

    // Focus last filled box
    const nextIdx = Math.min(pastedDigits.length, length - 1);
    inputsRef.current[nextIdx]?.focus();

    if (pastedDigits.length === length && onComplete) {
      onComplete(pastedDigits);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] || '';
        const isFilled = Boolean(char);

        return (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={char}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`w-10 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 transition-all outline-none ${
              isFilled
                ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-950 focus:bg-white'
            }`}
          />
        );
      })}
    </div>
  );
}
