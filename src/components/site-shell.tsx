"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { site } from "@/site.config";
import { MotionProvider, onAnimationFrame } from "./motion-provider";
import { DishSection } from "./dish-section";
import manifest from "../../public/frames/manifest.json";
import { Vibes, Visit, Footer } from "./menu";
import { DeferredMenu } from "./deferred-menu";
import { PageBackdrop, ProgressRail } from "./progress-rail";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { DeferredDish } from "./deferred-dish";

function Nav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open) {
      node.showModal();
      document.documentElement.style.overflow = "hidden";
    } else {
      node.close();
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <header className="nav-wrap">
        <nav className="pill-nav" aria-label={site.ui.navigation}>
          <a href="#" className="wordmark">
            {site.name}
            <span aria-hidden="true">✳</span>
          </a>
          <div className="desktop-links">
            {site.nav.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={i === 0 ? "active" : ""}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={site.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button nav-order"
          >
            {site.ui.order}
            <span aria-hidden="true">↗</span>
          </a>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={site.ui.menuOpen}
            ref={toggle}
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
          </button>
        </nav>
      </header>
      <dialog
        id="mobile-navigation"
        className="mobile-navigation"
        ref={dialog}
        onCancel={() => setOpen(false)}
        aria-label={site.ui.navigation}
      >
        <button
          className="menu-close"
          onClick={() => setOpen(false)}
          aria-label={site.ui.menuClose}
        >
          ×
        </button>
        <span className="mobile-wordmark">{site.name}</span>
        {site.nav.map((link, i) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            <small>0{i + 1}</small>
            {link.label}
            <span>↗</span>
          </a>
        ))}
        <a
          className="button"
          href={site.orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
        >
          {site.ui.order}
        </a>
        <p>{site.hours}</p>
      </dialog>
    </>
  );
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !matchMedia("(pointer:fine) and (prefers-reduced-motion:no-preference)")
        .matches
    )
      return;
    let x = -100,
      y = -100;
    let moved = false;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      moved = true;
    };
    window.addEventListener("pointermove", move);
    const unsubscribe = onAnimationFrame(() => {
      if (dot.current && moved) {
        dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
        moved = false;
      }
    });
    return () => {
      window.removeEventListener("pointermove", move);
      unsubscribe();
    };
  }, []);
  return <div className="chili-cursor" ref={dot} aria-hidden="true" />;
}

export function SiteShell() {
  const [loading, setLoading] = useState(0);
  const reduced = useMotionPreference();
  useEffect(() => {
    // A direct menu/visit link can dispose the distant hero's frame request.
    // Its loading overlay must not block an already visible anchor destination.
    const releaseOffscreenLoader = () => {
      const hero = document.getElementById(site.dishes[0].id);
      if (hero && hero.getBoundingClientRect().bottom <= 0) {
        setLoading(100);
        window.removeEventListener("scroll", releaseOffscreenLoader);
      }
    };
    window.addEventListener("scroll", releaseOffscreenLoader, { passive: true });
    releaseOffscreenLoader();
    return () => window.removeEventListener("scroll", releaseOffscreenLoader);
  }, []);
  const onLoad = useCallback(
    (percent: number) =>
      setLoading((previous) => (previous >= 100 ? previous : percent)),
    [],
  );
  // Loading-byte updates should only render the counter, not reconcile the full menu.
  const content = useMemo(
    () => (
      <>
        <PageBackdrop />
        <Nav />
        <Cursor />
        <ProgressRail />
        <main id="main">
          {site.dishes.map((dish, index) =>
            index === 0 ? (
              <DishSection
                key={dish.id}
                dish={dish}
                sets={manifest[dish.id as keyof typeof manifest]}
                hero
                onLoad={onLoad}
              />
            ) : (
              <DeferredDish
                key={dish.id}
                dish={dish}
                sets={manifest[dish.id as keyof typeof manifest]}
              />
            ),
          )}
          <DeferredMenu />
          <Vibes />
          <Visit />
        </main>
        <Footer />
      </>
    ),
    [onLoad],
  );
  return (
    <MotionProvider>
      {content}
      <AnimatePresence>
        {loading >= 0 && loading < 100 && !reduced && (
          <motion.div
            className="preloader"
            key="loader"
            initial={false}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            role="status"
            aria-label={site.ui.loading}
          >
            <svg viewBox="0 0 90 90" aria-hidden="true">
              <path d="M26 74c-28-24 28-22 0-52M46 67c-25-22 25-28 0-56M67 74c-27-24 27-22 0-52" />
            </svg>
            <strong>
              {loading}
              <span>%</span>
            </strong>
            <span>{site.ui.loading}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionProvider>
  );
}
