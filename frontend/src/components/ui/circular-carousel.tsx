import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 130;
const RADIUS_Y = 40;

function getItemPosition(index: number, activeIndex: number, total: number) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0.7, 1 - (distance / maxDistance) * 0.25);
  const opacity = Math.max(0.35, 1 - (distance / maxDistance) * 0.65);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 3500,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="3D Feature Deck Carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative flex flex-col items-center justify-center py-5 px-3 w-full bg-zinc-950/90 text-white rounded-2xl border border-zinc-800/80 outline-none select-none overflow-hidden shadow-xl",
        className,
      )}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

      {/* 3D Arc Card Deck Track */}
      <div className="relative h-[130px] w-full flex items-center justify-center">
        {items.map((item, i) => {
          const pos = getItemPosition(i, activeIndex, total);
          const isActive = i === activeIndex;

          const transformX = pos ? pos.x : 0;
          const transformY = pos ? pos.y : 0;
          const scaleVal = pos ? pos.scale : 0;
          const opacityVal = pos ? pos.opacity : 0;
          const zIndexVal = pos ? pos.zIndex : 0;

          return (
            <button
              key={item.id}
              onClick={() => goTo(i)}
              aria-label={item.title}
              aria-selected={isActive}
              className={cn(
                "absolute flex h-26 w-44 flex-col items-center justify-center text-center rounded-xl p-3 cursor-pointer border transition-all duration-300",
                isActive
                  ? "bg-zinc-900 border-white/20 shadow-lg ring-1 ring-white/10"
                  : "bg-zinc-900/40 border-zinc-800/60 shadow-md hover:border-zinc-700"
              )}
              style={{
                transform: `translate3d(${transformX}px, ${transformY}px, 0) scale(${scaleVal})`,
                opacity: opacityVal,
                zIndex: zIndexVal,
                willChange: "transform, opacity",
                transformOrigin: "center center",
                visibility: pos ? "visible" : "hidden",
              }}
            >
              {item.tag && (
                <span className="mb-1 rounded-full bg-white/10 px-2 py-0.2 text-[9px] font-mono font-bold uppercase text-neutral-300">
                  {item.tag}
                </span>
              )}
              <h3
                className={cn(
                  "font-bold leading-tight truncate w-full px-1",
                  isActive ? "text-white text-xs" : "text-neutral-400 text-[11px]"
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "mt-1 line-clamp-2 text-[10px] leading-snug max-w-[150px]",
                  isActive ? "text-neutral-300" : "text-neutral-500"
                )}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Compact Counter & Navigation Controls */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-[260px] pt-2 border-t border-white/10 mt-1">
        <button
          onClick={prev}
          aria-label="Previous item"
          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Compact Text Counter */}
        <div className="text-[11px] font-mono font-bold text-neutral-300">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="text-neutral-500 mx-1">/</span>
          <span className="text-neutral-500">{String(total).padStart(2, "0")}</span>
        </div>

        {/* Dot / Pill Indicators */}
        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                i === activeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next item"
          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default CircularCarousel;
