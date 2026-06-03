import type { DsaClassId } from "./classes";
import type { Geschlecht } from "./creator/data";

import kriegerM from "@/assets/dsa/portraits/krieger-m.jpg";
import kriegerW from "@/assets/dsa/portraits/krieger-w.jpg";
import streunerM from "@/assets/dsa/portraits/streuner-m.jpg";
import streunerW from "@/assets/dsa/portraits/streuner-w.jpg";
import magierM from "@/assets/dsa/portraits/magier-m.jpg";
import magierW from "@/assets/dsa/portraits/magier-w.jpg";
import elfM from "@/assets/dsa/portraits/elf-m.jpg";
import elfW from "@/assets/dsa/portraits/elf-w.jpg";
import zwergM from "@/assets/dsa/portraits/zwerg-m.jpg";
import zwergW from "@/assets/dsa/portraits/zwerg-w.jpg";
import gauklerM from "@/assets/dsa/portraits/gaukler-m.jpg";
import gauklerW from "@/assets/dsa/portraits/gaukler-w.jpg";
import thorwalerM from "@/assets/dsa/portraits/thorwaler-m.jpg";
import thorwalerW from "@/assets/dsa/portraits/thorwaler-w.jpg";
import druideM from "@/assets/dsa/portraits/druide-m.jpg";
import druideW from "@/assets/dsa/portraits/druide-w.jpg";

const PORTRAITS: Record<DsaClassId, { m: string; w: string }> = {
  krieger: { m: kriegerM, w: kriegerW },
  streuner: { m: streunerM, w: streunerW },
  magier: { m: magierM, w: magierW },
  elf: { m: elfM, w: elfW },
  zwerg: { m: zwergM, w: zwergW },
  gaukler: { m: gauklerM, w: gauklerW },
  thorwaler: { m: thorwalerM, w: thorwalerW },
  druide: { m: druideM, w: druideW },
};

/**
 * Liefert die Porträt-URL für eine Klasse + Geschlecht. Fällt auf das
 * männliche Porträt zurück, wenn das Geschlecht unbekannt ist oder die
 * Klasse nicht im Katalog steht (dann Krieger-männlich als Default).
 */
export function portraitFor(
  classId: DsaClassId | string,
  geschlecht?: Geschlecht | string | null,
): string {
  const key = (PORTRAITS as Record<string, { m: string; w: string }>)[
    String(classId)
  ] ?? PORTRAITS.krieger;
  const isW = String(geschlecht ?? "").toLowerCase().startsWith("w");
  return isW ? key.w : key.m;
}