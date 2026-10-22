"use client";
import { useEffect, type ReactNode } from "react";
import { frame, cancelFrame } from "motion/react";
import Lenis from "lenis";

type Tick = (time: number) => void;
const subscribers = new Set<Tick>();
export const onAnimationFrame = (callback: Tick) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: !reduced.matches,
      lerp: 0.12,
      anchors: true,
    });
    // Motion's single requestAnimationFrame clock drives Lenis AND every canvas.
    // useScroll observes Lenis's native scroll events; no additional progress spring.
    const advanceScroll = ({ timestamp }: { timestamp: number }) => {
      lenis.raf(timestamp);
    };
    const tick = ({ timestamp }: { timestamp: number }) => {
      for (const callback of subscribers) callback(timestamp);
    };
    // Write Lenis's scroll position before Motion measures target geometry.
    // Both phases belong to the same RAF scheduler, with no second clock.
    frame.setup(advanceScroll, true);
    frame.update(tick, true);
    const preference = () => {
      lenis.options.smoothWheel = !reduced.matches;
    };
    reduced.addEventListener("change", preference);
    return () => {
      cancelFrame(tick);
      cancelFrame(advanceScroll);
      reduced.removeEventListener("change", preference);
      lenis.destroy();
    };
  }, []);
  return children;
}
