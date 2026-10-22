"use client";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { site } from "@/site.config";

export function ProgressRail() {
  const { scrollY } = useScroll();
  const [active, setActive] = useState(0);
  const [show, setShow] = useState(true);
  const activeRef = useRef(0);
  const positions = useRef<{ top: number; height: number }[]>([]);
  useEffect(() => {
    const update = () => {
      positions.current = site.dishes.map((d) => {
        const el = document.getElementById(d.id)!;
        return { top: el.offsetTop, height: el.offsetHeight };
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useMotionValueEvent(scrollY, "change", (y) => {
    const index = positions.current.findIndex(
      (p) =>
        y + innerHeight / 2 >= p.top && y + innerHeight / 2 < p.top + p.height,
    );
    if (activeRef.current !== index) {
      activeRef.current = index;
      setActive(index);
      setShow(index >= 0);
    }
  });
  return (
    <nav
      className={`progress-rail ${show ? "" : "rail-hidden"}`}
      aria-label={site.ui.railLabel}
    >
      {site.dishes.map((dish, i) => (
        <a
          key={dish.id}
          href={`#${dish.id}`}
          className={i === active ? "current" : ""}
          aria-label={dish.name}
          aria-current={i === active ? "location" : undefined}
          style={{ color: dish.color }}
        >
          <span className="rail-dot" />
          <span className="rail-label">{dish.name}</span>
        </a>
      ))}
    </nav>
  );
}

export function PageBackdrop() {
  const { scrollY } = useScroll();
  const from = useMotionValue(site.dishes[0].backdropStart);
  const to = useMotionValue(site.dishes[0].backdropEnd);
  const blend = useMotionValue(0);
  const positions = useRef<{ top: number; height: number }[]>([]);
  useEffect(() => {
    const update = () => {
      positions.current = site.dishes.map((d) => {
        const el = document.getElementById(d.id)!;
        return { top: el.offsetTop, height: el.offsetHeight };
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useMotionValueEvent(scrollY, "change", (y) => {
    let index = positions.current.findIndex(
      (p) => y >= p.top && y < p.top + p.height,
    );
    if (index < 0) index = y <= 0 ? 0 : site.dishes.length - 1;
    const position = positions.current[index];
    if (!position) return;
    const dish = site.dishes[index];
    const local = y - position.top;
    const scrubLength = position.height - innerHeight;
    // Paint each endpoint once; the compositor blends the fixed layers.
    // Updating a full-screen background colour on every scroll frame forces paint.
    if (local <= scrubLength) {
      from.set(dish.backdropStart);
      to.set(dish.backdropEnd);
      blend.set(Math.min(1, Math.max(0, local / scrubLength)));
    } else {
      from.set(dish.backdropEnd);
      to.set(site.dishes[index + 1]?.backdropStart || site.colors.cream);
      blend.set(Math.min(1, (local - scrubLength) / innerHeight));
    }
  });
  return (
    <div className="page-backdrop" aria-hidden="true">
      <motion.div style={{ backgroundColor: from }} />
      <motion.div style={{ backgroundColor: to, opacity: blend }} />
    </div>
  );
}
