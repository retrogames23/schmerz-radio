import { useEffect, useState } from "react";

/**
 * Liefert true, wenn das primäre Eingabegerät grob ist (Touch/Stylus).
 * Reagiert reaktiv auf Änderungen (z. B. Tablet-Modus, externe Maus
 * angeschlossen). Auf Servern (SSR) wird false zurückgegeben.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(pointer: coarse)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
