'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

interface TextScrambleProps {
  text: string;
  className?: string;
  autoScramble?: boolean;
}

export function TextScramble({ text, className = '', autoScramble = false }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef(0);

  const scramble = useCallback(() => {
    setIsScrambling(true);
    frameRef.current = 0;
    const duration = text.length * 3;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      frameRef.current++;

      const progress = frameRef.current / duration;
      const revealedLength = Math.floor(progress * text.length);

      const newText = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < revealedLength) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplayText(newText);

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 30);
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    scramble();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    if (autoScramble) {
      scramble();
    }
  }, [autoScramble, scramble]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={cn('group relative inline-flex flex-col cursor-pointer select-none', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative font-mono tracking-widest uppercase">
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            className={cn(
              'inline-block transition-all duration-150',
              isScrambling && char !== text[i]
                ? 'text-cyan-400 scale-125 font-black text-shadow-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'text-white'
            )}
            style={{
              transitionDelay: `${i * 10}ms`,
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* Animated underline */}
      <span className="relative h-[2px] w-full mt-1.5 overflow-hidden rounded-full">
        <span
          className={cn(
            'absolute inset-0 bg-cyan-400 transition-transform duration-500 ease-out origin-left',
            isHovering ? 'scale-x-100' : 'scale-x-0'
          )}
        />
        <span className="absolute inset-0 bg-zinc-800" />
      </span>

      {/* Subtle glow on hover */}
      <span
        className={cn(
          'absolute -inset-3 rounded-xl bg-cyan-500/10 transition-opacity duration-300 -z-10 blur-sm',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
