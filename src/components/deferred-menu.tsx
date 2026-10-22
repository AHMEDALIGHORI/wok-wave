"use client";
import { useEffect, useRef, useState } from "react";
import { FullMenu } from "./menu";
import { site } from "@/site.config";

/** Prepare the interactive menu before it enters view, without hydrating fourteen
 * offscreen cards during the hero's first paint. Menu data remains in JSON-LD. */
export function DeferredMenu() {
  const placeholder = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = placeholder.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "100% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return ready ? <FullMenu /> : (
    <section id="menu" ref={placeholder} className="menu-placeholder" aria-label={site.ui.menuLabel} />
  );
}
