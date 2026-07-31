"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";

import { IMAGE_ASSETS } from "@/lib/assets";
import { cn } from "@/lib/cn";

type HeroTile = {
  id: string;
  alt: string;
  src: string;
};

const HERO_IMAGE_SIZES = "(max-width: 1023px) 256px, 400px";

/** Kolejność jak w bento na desktopie: górny rząd L→P, dolny rząd L→P. */
const HERO_MARQUEE_TILES: HeroTile[] = [
  {
    id: "tile-3",
    alt: "Pomoce naukowe do nauki matematyki",
    src: IMAGE_ASSETS.hero.bookshelf,
  },
  {
    id: "tile-1",
    alt: "Zajęcia grupowe z matematyki",
    src: IMAGE_ASSETS.hero.main,
  },
  {
    id: "tile-2",
    alt: "Zadania i arkusze maturalne",
    src: IMAGE_ASSETS.hero.exerciseCloseUp,
  },
  {
    id: "tile-4",
    alt: "Indywidualne podejście na zajęciach",
    src: IMAGE_ASSETS.hero.closeUp,
  },
];

/** Czas jednego pełnego przebiegu pętli (jak dawniej 32s CSS). */
const AUTO_LOOP_MS = 32_000;
/** Wygaszanie prędkości inertia (wyższe = szybsze hamowanie). */
const INERTIA_DECAY = 0.0045;
/** Poniżej tego (px/ms) kończymy inertię i wracamy do auto. */
const INERTIA_STOP_PX_PER_MS = 0.025;
const VELOCITY_HISTORY = 5;

type Phase = "auto" | "dragging" | "inertia";

type VelocitySample = { t: number; x: number };

function wrapOffset(offset: number, loopWidth: number): number {
  if (loopWidth <= 0) {
    return 0;
  }

  const wrapped = offset % loopWidth;
  return wrapped < 0 ? wrapped + loopWidth : wrapped;
}

function MarqueeGroup({
  tiles,
  ariaHidden = false,
  groupRef,
}: {
  tiles: HeroTile[];
  ariaHidden?: boolean;
  groupRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={groupRef}
      className="hero-marquee-group"
      aria-hidden={ariaHidden || undefined}
    >
      {tiles.map((tile) => (
        <div
          key={ariaHidden ? `${tile.id}-dup` : tile.id}
          className="relative h-56 w-64 shrink-0"
        >
          <div className="relative h-full overflow-hidden rounded-3xl shadow-soft">
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              priority
              draggable={false}
              sizes={HERO_IMAGE_SIZES}
              className="pointer-events-none object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroMobileMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const phaseRef = useRef<Phase>("auto");
  const velocityRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const samplesRef = useRef<VelocitySample[]>([]);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => {
      reducedMotionRef.current = media.matches;
      if (media.matches && phaseRef.current === "auto") {
        phaseRef.current = "inertia";
        velocityRef.current = 0;
      }
    };
    syncReduced();
    media.addEventListener("change", syncReduced);

    const measure = () => {
      const width = groupRef.current?.offsetWidth ?? 0;
      loopWidthRef.current = width;
      autoSpeedRef.current = width > 0 ? width / AUTO_LOOP_MS : 0;
      offsetRef.current = wrapOffset(offsetRef.current, width);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (groupRef.current) {
      resizeObserver.observe(groupRef.current);
    }

    const applyTransform = () => {
      const track = trackRef.current;
      if (!track) {
        return;
      }
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const tick = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(ts - last, 64);
      lastTsRef.current = ts;

      const loopWidth = loopWidthRef.current;
      const phase = phaseRef.current;

      if (phase === "auto" && !reducedMotionRef.current && loopWidth > 0) {
        offsetRef.current = wrapOffset(
          offsetRef.current + autoSpeedRef.current * dt,
          loopWidth,
        );
      } else if (phase === "inertia" && loopWidth > 0) {
        const v = velocityRef.current;
        offsetRef.current = wrapOffset(offsetRef.current + v * dt, loopWidth);
        velocityRef.current = v * Math.exp(-INERTIA_DECAY * dt);

        if (Math.abs(velocityRef.current) < INERTIA_STOP_PX_PER_MS) {
          velocityRef.current = 0;
          phaseRef.current = reducedMotionRef.current ? "inertia" : "auto";
        }
      }

      applyTransform();
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      media.removeEventListener("change", syncReduced);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function recordSample(clientX: number) {
    const samples = samplesRef.current;
    const now = performance.now();
    samples.push({ t: now, x: clientX });
    if (samples.length > VELOCITY_HISTORY) {
      samples.shift();
    }
  }

  function velocityFromSamples(): number {
    const samples = samplesRef.current;
    if (samples.length < 2) {
      return 0;
    }

    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    if (dt <= 0) {
      return 0;
    }

    // Palec w prawo → offset maleje → velocity ujemna w przestrzeni offsetu.
    return -(last.x - first.x) / dt;
  }

  function applyTransform() {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }

    phaseRef.current = "dragging";
    velocityRef.current = 0;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    samplesRef.current = [{ t: performance.now(), x: event.clientX }];
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    if (phaseRef.current !== "dragging") {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    offsetRef.current = wrapOffset(
      dragStartOffsetRef.current - deltaX,
      loopWidthRef.current,
    );
    recordSample(event.clientX);
    applyTransform();
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // capture mógł już zostać zwolniony
    }

    const releaseVelocity = velocityFromSamples();
    // Ogranicz fling — premium, bez „odlotu”.
    velocityRef.current = Math.max(-2.8, Math.min(2.8, releaseVelocity));
    samplesRef.current = [];
    phaseRef.current = "inertia";
  }

  return (
    <div className="min-w-0 lg:hidden">
      <div
        className={cn("hero-marquee-viewport", dragging && "is-dragging")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="hero-marquee-track">
          <MarqueeGroup tiles={HERO_MARQUEE_TILES} groupRef={groupRef} />
          <MarqueeGroup tiles={HERO_MARQUEE_TILES} ariaHidden />
        </div>
      </div>
    </div>
  );
}
