"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { type MotionValue, useMotionValueEvent } from "motion/react";
import { FrameStore, type FrameSet } from "@/lib/frame-store";
import { onAnimationFrame } from "./motion-provider";
import { site, type Dish } from "@/site.config";

export function holdCurve(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.06) / 0.88));
  return t * t * (3 - 2 * t);
}

export function ScrubCanvas({
  dish,
  sets,
  progress,
  section,
  hero = false,
  reduced,
  onLoad,
}: {
  dish: Dish;
  sets: { desktop: FrameSet; mobile: FrameSet };
  progress: MotionValue<number>;
  section: RefObject<HTMLElement | null>;
  hero?: boolean;
  reduced: boolean;
  onLoad: (percent: number) => void;
}) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const [painted, setPainted] = useState(false);
  const ready = useRef(onLoad);
  ready.current = onLoad;
  useMotionValueEvent(progress, "change", (value) => {
    target.current = holdCurve(value);
  });
  useEffect(() => {
    if (reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ready.current(100);
      return;
    }
    const host = canvasHost.current;
    if (!host || !section.current) return;
    // Own the transferred element inside this effect so Strict Mode's cleanup /
    // setup cycle and live motion-preference changes can create a fresh canvas.
    const element = document.createElement("canvas");
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", `${site.ui.canvasLabel} ${dish.name}`);
    host.append(element);
    // Decoding AND drawing stay off the UI thread. The shared Motion RAF still
    // owns progress/lerp timing; the worker receives only changed frame commands.
    const offscreen = element.transferControlToOffscreen();
    const worker = new Worker("/workers/frame-decoder.js");
    worker.postMessage({ type: "canvas", canvas: offscreen }, [offscreen]);
    let store: FrameStore | undefined;
    let mobile = innerWidth < 768;
    let near = hero;
    let visible = hero;
    let dirty = true;
    let last = -1;
    let width = 0;
    let height = 0;
    let drawCount = 0;
    const start = () => {
      if (store) return;
      const set = mobile ? sets.mobile : sets.desktop;
      store = new FrameStore(
        dish.id,
        mobile ? "m" : "d",
        set,
        (value) => ready.current(value),
        () => {
          dirty = true;
        },
        worker,
        (index, drawMs, pixelWidth, pixelHeight) => {
          if (!store) return;
          drawCount++;
          if (drawCount === 1) {
            element.classList.add("is-painted");
            setPainted(true);
          }
          element.dataset.frame = String(index);
          element.dataset.drawMs = drawMs.toFixed(3);
          element.dataset.cached = String(store.bitmaps.size);
          element.dataset.budget = String(store.maxFrames);
          element.dataset.errors = String(store.errorCount);
          element.dataset.pixelWidth = String(pixelWidth);
          element.dataset.pixelHeight = String(pixelHeight);
        },
      );
      void store.start();
    };
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = Math.round(bounds.width * dpr);
      height = Math.round(bounds.height * dpr);
      dirty = true;
      const nextMobile = innerWidth < 768;
      if (nextMobile !== mobile) {
        store?.dispose();
        store = undefined;
        mobile = nextMobile;
        last = -1;
        if (near) start();
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) start();
      },
      { rootMargin: "200% 0px" },
    );
    const freeObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          store?.dispose();
          store = undefined;
          last = -1;
        }
      },
      { rootMargin: "300% 0px" },
    );
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "10% 0px" },
    );
    loadObserver.observe(section.current);
    freeObserver.observe(section.current);
    visibilityObserver.observe(section.current);
    if (hero) start();
    const unsubscribe = onAnimationFrame(() => {
      if (!visible || !store || !width || !height) return;
      current.current += (target.current - current.current) * 0.14;
      if (Math.abs(target.current - current.current) < 0.0001)
        current.current = target.current;
      const desired = current.current * (store.set.count - 1);
      store.seek(desired);
      const found = store.nearest(desired);
      if (!found) return;
      const [index] = found;
      if (index === last && !dirty) return;
      store.paint(index, width, height, mobile ? dish.focalX : 0.5);
      last = index;
      dirty = false;
      // Lightweight, inspectable telemetry used by the reproducible Checkpoint A test.
      element.dataset.target = String(Math.round(desired));
    });
    return () => {
      unsubscribe();
      store?.dispose();
      worker.terminate();
      element.remove();
      resizeObserver.disconnect();
      loadObserver.disconnect();
      freeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [dish.id, dish.focalX, hero, reduced, section, sets]);
  return (
    <div className="media-plane">
      <picture
        className={`dish-poster ${painted && !reduced ? "is-painted" : ""}`}
      >
        <source
          media="(prefers-reduced-motion: reduce) and (max-width: 767px)"
          srcSet={`/posters/${dish.id}-exploded-mobile.webp`}
        />
        <source
          media="(prefers-reduced-motion: reduce)"
          srcSet={`/posters/${dish.id}-exploded.webp`}
        />
        <source
          media="(max-width: 767px)"
          srcSet={`/posters/${dish.id}${reduced ? "-exploded" : ""}-mobile.webp`}
        />
        <img
          src={`/posters/${dish.id}${reduced ? "-exploded" : ""}.webp`}
          width={sets.desktop.w}
          height={sets.desktop.h}
          fetchPriority={hero ? "high" : "low"}
          loading={hero ? "eager" : "lazy"}
          alt={`${dish.name} — ${reduced ? site.ui.ingredients : site.ui.ready}`}
        />
      </picture>
      {!reduced && <div className="canvas-host" ref={canvasHost} />}
    </div>
  );
}
