"use client";
import { useSyncExternalStore } from "react";
const subscribe = (onChange: () => void) => {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
/** Keep the server and hydration snapshots identical; CSS covers the initial reduced-motion paint. */
export const useMotionPreference = () =>
  useSyncExternalStore(
    subscribe,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
