"use client";
import { useEffect, useRef, useState } from "react";
import { DishSection } from "./dish-section";
import { useMotionPreference } from "@/lib/use-motion-preference";
import type { Dish } from "@/site.config";
import type { FrameSet } from "@/lib/frame-store";
export function DeferredDish({
  dish,
  sets,
}: {
  dish: Dish;
  sets: { desktop: FrameSet; mobile: FrameSet };
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!wrapper.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200% 0px" },
    );
    observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={wrapper}>
      {near || reduced ? (
        <DishSection dish={dish} sets={sets} onLoad={() => {}} />
      ) : (
        <section
          id={dish.id}
          className="dish-section dish-placeholder"
          aria-label={dish.name}
        />
      )}
    </div>
  );
}
