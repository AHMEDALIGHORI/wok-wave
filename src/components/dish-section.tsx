"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import { site, formatPrice, type Dish, type Callout } from "@/site.config";
import type { FrameSet } from "@/lib/frame-store";
import { ScrubCanvas } from "./scrub-canvas";
import { useMotionPreference } from "@/lib/use-motion-preference";

function Ingredient({
  item,
  progress,
  reduced,
  ratio,
  sourceRatio,
}: {
  item: Callout;
  progress: MotionValue<number>;
  reduced: boolean;
  ratio: number;
  sourceRatio: number;
}) {
  const [visible, setVisible] = useState(reduced);
  useEffect(
    () => setVisible(reduced || progress.get() >= item.at),
    [reduced, progress, item.at],
  );
  const shown = useRef(reduced);
  useMotionValueEvent(progress, "change", (value) => {
    const next = reduced || value >= item.at;
    if (next !== shown.current) {
      shown.current = next;
      setVisible(next);
    }
  });
  // Convert source-frame coordinates to the actual cover-fit stage coordinates.
  const mediaRatio = ratio / 0.91;
  const targetX =
    mediaRatio < sourceRatio
      ? 50 + ((item.targetX - 50) * sourceRatio) / mediaRatio
      : item.targetX;
  const targetY =
    9 +
    0.91 *
      (mediaRatio > sourceRatio
        ? 50 + ((item.targetY - 50) * mediaRatio) / sourceRatio
        : item.targetY);
  return (
    <motion.div
      className="ingredient"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: "spring", stiffness: 230, damping: 24 }
      }
      aria-hidden={!visible}
    >
      <svg
        className="leader"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={`M ${item.x} ${item.y} L ${(item.x + targetX) / 2} ${item.y} L ${targetX} ${targetY}`}
        />
        <circle cx={targetX} cy={targetY} r=".28" />
      </svg>
      <span
        className="ingredient-label"
        style={{ "--x": `${item.x}%`, "--y": `${item.y}%` } as CSSProperties}
      >
        {item.label}
      </span>
    </motion.div>
  );
}

export function DishSection({
  dish,
  sets,
  hero = false,
  onLoad,
}: {
  dish: Dish;
  sets: { desktop: FrameSet; mobile: FrameSet };
  hero?: boolean;
  onLoad: (percent: number) => void;
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress, scrollY } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const sectionTop = useMotionValue(0);
  const sectionHeight = useMotionValue(3600);
  const screenHeight = useMotionValue(900);
  // Reuse the same target's absolute scroll position for the extended handoff.
  // Its geometry changes on resize, not on every scroll event.
  const handoff = useTransform(() =>
    (scrollY.get() - sectionTop.get() + screenHeight.get()) /
    (sectionHeight.get() + screenHeight.get()),
  );
  const [viewportHeight, setViewportHeight] = useState(900);
  const [interactive, setInteractive] = useState(hero || reduced);
  const interactiveRef = useRef(hero || reduced);
  const stageOpacity = useTransform(() => {
    if (reduced) return 1;
    const p = handoff.get();
    if (p < 0.2) return hero ? 1 : Math.max(0, (p - 0.12) / 0.08);
    return Math.min(1, Math.max(0, 1 - (p - 0.8) / 0.08));
  });
  const stageY = useTransform(() => {
    if (reduced) return 0;
    const p = handoff.get();
    return p < 0.2
      ? hero
        ? 0
        : (p * 5 - 1) * viewportHeight
      : p > 0.8
        ? (p - 0.8) * 5 * viewportHeight
        : 0;
  });
  useMotionValueEvent(handoff, "change", (p) => {
    const next = reduced || (p >= 0.12 && p <= 0.88);
    if (next !== interactiveRef.current) {
      interactiveRef.current = next;
      setInteractive(next);
    }
  });
  // Functional transforms avoid native ScrollTimeline fill-mode edge cases at section ends.
  const titleOpacity = useTransform(() =>
    Math.max(0, Math.min(1, 1 - (scrollYProgress.get() - 0.25) / 0.28)),
  );
  const titleY = useTransform(
    () => -Math.min(1, scrollYProgress.get() / 0.6) * 50,
  );
  const ghostY = useTransform(() => 12 - scrollYProgress.get() * 44);
  const ghostOpacity = useTransform(() => 0.13 - scrollYProgress.get() * 0.06);
  const mask = useTransform(() => scrollYProgress.get());
  const [ratio, setRatio] = useState(1.6);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setRatio(entry.contentRect.width / entry.contentRect.height);
      setViewportHeight(innerHeight);
      screenHeight.set(innerHeight);
      if (section.current) {
        sectionTop.set(section.current.getBoundingClientRect().top + window.scrollY);
        sectionHeight.set(section.current.offsetHeight);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [screenHeight, sectionTop, sectionHeight]);
  const firstMask = { maskImage: `url(/masks/${dish.id}-first.png)` };
  const lastMask = { maskImage: `url(/masks/${dish.id}-last.png)` };
  const firstOpacity = useTransform(mask, (value) => 1 - value);
  const number = `${String(site.dishes.findIndex((d) => d.id === dish.id) + 1).padStart(2, "0")} / ${String(site.dishes.length).padStart(2, "0")}`;
  return (
    <section
      id={dish.id}
      ref={section}
      data-ink={dish.ink}
      data-hero={hero}
      data-headline-layout={dish.headlineLayout}
      className={`dish-section ${reduced ? "reduced-motion" : ""}`}
      style={
        {
          "--dish-color": dish.color,
          "--headline-size": dish.displaySize,
          "--mobile-headline-size": dish.mobileDisplaySize,
          "--focal-x": `${dish.focalX * 100}%`,
        } as CSSProperties
      }
      aria-labelledby={`${dish.id}-heading`}
    >
      <motion.div
        className="dish-stage"
        ref={stage}
        style={{ opacity: stageOpacity, y: stageY }}
        inert={!interactive && !reduced}
      >
        <ScrubCanvas
          dish={dish}
          sets={sets}
          progress={scrollYProgress}
          section={section}
          hero={hero}
          reduced={reduced}
          onLoad={onLoad}
        />
        <div className="stage-shade" aria-hidden="true" />
        <motion.div
          className="ghost-mask ghost-first"
          style={{ ...firstMask, opacity: reduced ? 0 : firstOpacity }}
          aria-hidden="true"
        >
          <motion.div
            className="chinese-ghost"
            style={{ y: ghostY, opacity: ghostOpacity }}
            lang="zh-Hans"
          >
            {dish.chinese}
          </motion.div>
        </motion.div>
        <motion.div
          className="ghost-mask ghost-last"
          style={{ ...lastMask, opacity: reduced ? 1 : mask }}
          aria-hidden="true"
        >
          <motion.div
            className="chinese-ghost"
            style={{ y: ghostY, opacity: ghostOpacity }}
            lang="zh-Hans"
          >
            {dish.chinese}
          </motion.div>
        </motion.div>
        <div className="eyebrow">
          <span className="tiny-star">✳</span>
          {site.ui.eyebrow}
          <span className="edition">{site.ui.edition}</span>
        </div>
        {!reduced && (
          <motion.div
            className="headline-mask"
            style={{ opacity: titleOpacity }}
          >
            {hero ? (
              <motion.h1
                id={`${dish.id}-heading`}
                className="hero-headline"
                style={{ y: titleY }}
              >
                <span>{dish.headline[0]}</span>
                <span>{dish.headline[1]}</span>
              </motion.h1>
            ) : (
              <motion.h2
                id={`${dish.id}-heading`}
                className="hero-headline"
                style={{ y: titleY }}
              >
                <span>{dish.headline[0]}</span>
                <span>{dish.headline[1]}</span>
              </motion.h2>
            )}
          </motion.div>
        )}
        {reduced &&
          (hero ? (
            <h1 className="static-title" id={`${dish.id}-heading`}>
              {dish.name}
            </h1>
          ) : (
            <h2 className="static-title" id={`${dish.id}-heading`}>
              {dish.name}
            </h2>
          ))}
        <motion.div
          className="round-badge"
          role="img"
          style={{ opacity: reduced ? 0 : titleOpacity }}
          aria-label={site.ui.badge}
        >
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path
                id={`badge-${dish.id}`}
                d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0"
              />
            </defs>
            <text>
              <textPath href={`#badge-${dish.id}`} textLength="282">
                {site.ui.badge}
              </textPath>
            </text>
          </svg>
          <span>
            {site.ui.badgeCenter}
            <small>✦</small>
          </span>
        </motion.div>
        <motion.div
          className="hand-sticker"
          style={{ opacity: reduced ? 0 : titleOpacity }}
        >
          <span>{dish.sticker}</span>
          <svg viewBox="0 0 90 45" aria-hidden="true">
            <path d="M8 9C36 2 66 4 77 22M64 20l16 7-1-16" />
          </svg>
        </motion.div>
        <div
          className="ingredients"
          role="group"
          aria-label={site.ui.ingredients}
        >
          {dish.callouts.map((item) => (
            <Ingredient
              key={item.label}
              item={item}
              progress={scrollYProgress}
              reduced={reduced}
              ratio={ratio}
              sourceRatio={sets.desktop.w / sets.desktop.h}
            />
          ))}
        </div>
        <div className="dish-details">
          <div className="dish-index">
            {number}
            <span />
            {dish.portion}
          </div>
          <h2>
            {dish.name}
            <span lang="zh-Hans">{dish.chinese}</span>
          </h2>
          <p>
            {hero ? site.ui.heroNote : dish.description}
            <br />
            {hero ? site.ui.heroSubnote : ""}
          </p>
          <span
            className="heat-note"
            role="img"
            aria-label={`${site.ui.spiceLabel}: ${dish.spice}/3`}
          >
            {Array.from({ length: Math.max(1, dish.spice) }, (_, i) => (
              <svg key={i} viewBox="0 0 32 32" aria-hidden="true">
                <path d="M22 9c-2 12-8 15-18 14 8-3 9-11 11-14 2-3 6-3 7 0Z" />
                <path d="M19 8c0-5 4-5 6-4" />
              </svg>
            ))}
            {site.ui.spicyLabels[dish.spice]}
          </span>
        </div>
        <motion.a
          className="scroll-cue"
          href={`#${dish.id}-end`}
          style={{ opacity: reduced ? 0 : titleOpacity }}
        >
          <span>{site.ui.scroll}</span>
          <svg viewBox="0 0 40 55" aria-hidden="true">
            <path d="M20 2c-7 13 7 26 0 43M7 33l12 15 14-14" />
          </svg>
        </motion.a>
        <div className="order-corner">
          <div className="price-sticker">
            <small>{dish.portion}</small>
            <strong>{formatPrice(dish.price)}</strong>
            <span>✦</span>
          </div>
          <a
            className="button order-button"
            href={site.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.ui.add}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="stage-bottom">
          <span>{site.tagline}</span>
          <span>
            {number} <span aria-hidden="true">↘</span>
          </span>
        </div>
      </motion.div>
      <div id={`${dish.id}-end`} className="section-end" />
    </section>
  );
}
