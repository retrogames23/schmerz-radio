/**
 * Buskompositionen der Linie 28: fertige Gesamtbilder, Fensterflächen und
 * Zuordnung der sichtbaren Figuren zu Personas.
 *
 * Die Personas und ihre verzweigten Gesprächsbäume liegen in
 * `busPassengerDialogs.ts`.
 */

import { BUS_PASSENGERS, type BusSpriteId } from "./busPassengerDialogs";

export {
  BUS_PASSENGERS,
  pickBusPassengers,
  getBusPassenger,
} from "./busPassengerDialogs";
export type { BusPassenger, BusTopic, BusSpriteId } from "./busPassengerDialogs";

export type BusCompositionId = "a" | "b" | "c" | "d" | "e" | "f" | "g";

/** Sichtbare Scheibe im Gesamtbild (Prozent) inklusive Scheibenform. */
export interface BusWindowArea {
  left: number;
  top: number;
  width: number;
  height: number;
  /** CSS-clip-path: exakte Scheibenkontur innerhalb des Rechtecks. */
  clip: string;
}

/**
 * Fensterflächen je Buskomposition — direkt an den Scheiben der jeweiligen
 * Bilddatei ausgemessen und minimal nach innen versetzt, damit Rahmen und
 * Dichtung sichtbar bleiben.
 */
const WINDOWS_BASE: Record<"a" | "b" | "c", BusWindowArea[]> = {
  a: [
    {
      left: 2.91,
      top: 9.38,
      width: 19.19,
      height: 39.45,
      clip:
        "polygon(3.4% 0.0%, 0.4% 4.0%, 0.0% 7.9%, 0.0% 11.9%, 0.0% 15.9%, 0.0% 19.9%, 0.0% 23.8%, 0.0% 28.1%, 0.0% 32.1%, 0.0% 36.1%, 0.0% 40.1%, 0.0% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.0% 56.0%, 0.0% 59.9%, 0.0% 63.9%, 0.0% 67.9%, 0.0% 71.9%, 0.0% 76.2%, 0.0% 80.1%, 0.4% 84.1%, 0.4% 88.1%, 0.4% 92.1%, 1.1% 96.0%, 22.1% 100.0%, 87.8% 100.0%, 92.0% 96.0%, 96.2% 92.1%, 95.4% 88.1%, 95.1% 84.1%, 94.7% 80.1%, 94.3% 76.2%, 95.1% 71.9%, 96.2% 67.9%, 99.2% 63.9%, 99.6% 59.9%, 99.6% 56.0%, 100.0% 52.0%, 100.0% 48.0%, 99.6% 44.0%, 97.0% 40.1%, 88.2% 36.1%, 79.1% 32.1%, 70.0% 28.1%, 60.1% 23.8%, 51.0% 19.9%, 41.8% 15.9%, 32.7% 11.9%, 23.6% 7.9%, 14.4% 4.0%, 4.2% 0.0%)",
    },
    {
      left: 78.85,
      top: 9.9,
      width: 18.68,
      height: 38.93,
      clip:
        "polygon(96.1% 0.0%, 85.9% 4.0%, 77.0% 8.1%, 67.2% 12.1%, 57.8% 16.1%, 48.4% 20.1%, 39.1% 24.2%, 30.1% 27.9%, 20.7% 31.9%, 10.9% 35.9%, 2.3% 39.9%, 0.4% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.4% 56.0%, 0.4% 60.1%, 0.4% 64.1%, 0.4% 68.1%, 0.4% 72.1%, 0.8% 75.8%, 0.8% 79.9%, 0.8% 83.9%, 0.8% 87.9%, 0.8% 91.9%, 1.2% 96.0%, 5.9% 100.0%, 59.0% 100.0%, 99.6% 96.0%, 100.0% 91.9%, 100.0% 87.9%, 100.0% 83.9%, 100.0% 79.9%, 100.0% 75.8%, 100.0% 72.1%, 100.0% 68.1%, 100.0% 64.1%, 99.6% 60.1%, 99.6% 56.0%, 99.6% 52.0%, 99.6% 48.0%, 99.6% 44.0%, 99.6% 39.9%, 99.6% 35.9%, 99.6% 31.9%, 99.6% 27.9%, 99.2% 24.2%, 99.2% 20.1%, 99.2% 16.1%, 99.2% 12.1%, 99.2% 8.1%, 98.8% 4.0%, 96.9% 0.0%)",
    },
  ],
  b: [
    {
      left: 2.91,
      top: 9.38,
      width: 19.19,
      height: 39.45,
      clip:
        "polygon(3.4% 0.0%, 0.4% 4.0%, 0.0% 7.9%, 0.0% 11.9%, 0.0% 15.9%, 0.0% 19.9%, 0.0% 23.8%, 0.0% 28.1%, 0.0% 32.1%, 0.0% 36.1%, 0.0% 40.1%, 0.0% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.0% 56.0%, 0.0% 59.9%, 0.0% 63.9%, 0.0% 67.9%, 0.0% 71.9%, 0.0% 76.2%, 0.0% 80.1%, 0.0% 84.1%, 0.0% 88.1%, 0.0% 92.1%, 0.8% 96.0%, 6.8% 100.0%, 96.6% 100.0%, 99.2% 96.0%, 99.2% 92.1%, 99.2% 88.1%, 99.2% 84.1%, 99.2% 80.1%, 99.6% 76.2%, 99.6% 71.9%, 99.6% 67.9%, 99.6% 63.9%, 100.0% 59.9%, 100.0% 56.0%, 100.0% 52.0%, 100.0% 48.0%, 99.6% 44.0%, 97.3% 40.1%, 88.2% 36.1%, 79.1% 32.1%, 70.0% 28.1%, 60.5% 23.8%, 51.0% 19.9%, 41.8% 15.9%, 32.7% 11.9%, 23.6% 7.9%, 14.4% 4.0%, 4.9% 0.0%)",
    },
    {
      left: 78.85,
      top: 9.9,
      width: 18.75,
      height: 38.93,
      clip:
        "polygon(95.3% 0.0%, 85.6% 4.0%, 76.3% 8.1%, 66.9% 12.1%, 57.6% 16.1%, 48.2% 20.1%, 38.5% 24.2%, 30.0% 27.9%, 20.6% 31.9%, 10.9% 35.9%, 2.3% 39.9%, 0.4% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.0% 56.0%, 0.4% 60.1%, 0.4% 64.1%, 0.4% 68.1%, 0.4% 72.1%, 0.4% 75.8%, 0.8% 79.9%, 0.8% 83.9%, 0.8% 87.9%, 0.8% 91.9%, 1.2% 96.0%, 3.1% 100.0%, 95.3% 100.0%, 99.2% 96.0%, 100.0% 91.9%, 99.6% 87.9%, 99.6% 83.9%, 99.6% 79.9%, 99.6% 75.8%, 99.6% 72.1%, 99.6% 68.1%, 99.6% 64.1%, 99.6% 60.1%, 99.6% 56.0%, 99.6% 52.0%, 99.2% 48.0%, 99.2% 44.0%, 99.2% 39.9%, 99.2% 35.9%, 99.2% 31.9%, 99.2% 27.9%, 99.2% 24.2%, 98.8% 20.1%, 98.8% 16.1%, 98.8% 12.1%, 98.8% 8.1%, 98.8% 4.0%, 96.5% 0.0%)",
    },
  ],
  c: [
    {
      left: 2.91,
      top: 9.38,
      width: 19.19,
      height: 39.45,
      clip:
        "polygon(3.4% 0.0%, 0.4% 4.0%, 0.0% 7.9%, 0.0% 11.9%, 0.0% 15.9%, 0.0% 19.9%, 0.0% 23.8%, 0.0% 28.1%, 0.0% 32.1%, 0.0% 36.1%, 0.0% 40.1%, 0.0% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.0% 56.0%, 0.0% 59.9%, 0.0% 63.9%, 0.0% 67.9%, 0.0% 71.9%, 0.0% 76.2%, 0.0% 80.1%, 0.0% 84.1%, 0.0% 88.1%, 0.0% 92.1%, 0.8% 96.0%, 6.8% 100.0%, 96.6% 100.0%, 99.2% 96.0%, 99.2% 92.1%, 99.2% 88.1%, 99.2% 84.1%, 99.2% 80.1%, 99.6% 76.2%, 99.6% 71.9%, 99.6% 67.9%, 99.6% 63.9%, 100.0% 59.9%, 100.0% 56.0%, 100.0% 52.0%, 100.0% 48.0%, 99.6% 44.0%, 97.3% 40.1%, 88.2% 36.1%, 79.1% 32.1%, 70.0% 28.1%, 60.5% 23.8%, 51.0% 19.9%, 41.8% 15.9%, 32.7% 11.9%, 23.6% 7.9%, 14.4% 4.0%, 4.9% 0.0%)",
    },
    {
      left: 78.85,
      top: 9.9,
      width: 18.75,
      height: 38.93,
      clip:
        "polygon(95.3% 0.0%, 85.6% 4.0%, 76.3% 8.1%, 66.9% 12.1%, 57.6% 16.1%, 48.2% 20.1%, 38.5% 24.2%, 30.0% 27.9%, 20.6% 31.9%, 10.9% 35.9%, 2.3% 39.9%, 0.4% 44.0%, 0.0% 48.0%, 0.0% 52.0%, 0.0% 56.0%, 0.4% 60.1%, 0.4% 64.1%, 0.4% 68.1%, 0.4% 72.1%, 0.4% 75.8%, 0.8% 79.9%, 0.8% 83.9%, 0.8% 87.9%, 0.8% 91.9%, 1.2% 96.0%, 3.1% 100.0%, 95.3% 100.0%, 99.2% 96.0%, 100.0% 91.9%, 99.6% 87.9%, 99.6% 83.9%, 99.6% 79.9%, 99.6% 75.8%, 99.6% 72.1%, 99.6% 68.1%, 99.6% 64.1%, 99.6% 60.1%, 99.6% 56.0%, 99.6% 52.0%, 99.2% 48.0%, 99.2% 44.0%, 99.2% 39.9%, 99.2% 35.9%, 99.2% 31.9%, 99.2% 27.9%, 99.2% 24.2%, 98.8% 20.1%, 98.8% 16.1%, 98.8% 12.1%, 98.8% 8.1%, 98.8% 4.0%, 96.5% 0.0%)",
    },
  ],
};

/**
 * d/f entstehen als Bildbearbeitung aus Komposition a, e/g aus b — Innenraum
 * und Scheiben sind dort pixelgleich, daher dieselben Fensterflächen.
 */
export const COMPOSITION_WINDOWS: Record<BusCompositionId, BusWindowArea[]> = {
  ...WINDOWS_BASE,
  d: WINDOWS_BASE.a,
  e: WINDOWS_BASE.b,
  f: WINDOWS_BASE.a,
  g: WINDOWS_BASE.b,
};

export interface BusCompositionPassenger {
  passengerId: string;
  /** Ankerpunkte für fortlaufende Sprechblasen (nur beim streitenden Paar). */
  chatterAnchors?: { sie: { x: number; y: number }; er: { x: number; y: number } };
  /** Unsichtbare Gesprächsfläche in Prozent des Gesamtbildes. */
  hotspot: { x: number; y: number; w: number; h: number };
}

export interface BusCompositionSelection {
  id: BusCompositionId;
  passengers: BusCompositionPassenger[];
}

const COMPOSITION_SLOTS: Record<
  BusCompositionId,
  {
    sprite: BusSpriteId;
    hotspot: BusCompositionPassenger["hotspot"];
    chatterAnchors?: BusCompositionPassenger["chatterAnchors"];
  }[]
> = {
  a: [
    { sprite: "woman", hotspot: { x: 16, y: 31, w: 24, h: 65 } },
    { sprite: "youth", hotspot: { x: 46, y: 42, w: 12, h: 28 } },
    { sprite: "worker", hotspot: { x: 61, y: 31, w: 24, h: 67 } },
  ],
  c: [
    {
      sprite: "couple",
      hotspot: { x: 19, y: 35, w: 24, h: 62 },
      chatterAnchors: { sie: { x: 23, y: 36 }, er: { x: 33, y: 35 } },
    },
    { sprite: "woman", hotspot: { x: 62, y: 34, w: 20, h: 63 } },
  ],
  b: [
    { sprite: "worker", hotspot: { x: 25, y: 34, w: 20, h: 61 } },
    { sprite: "woman", hotspot: { x: 47, y: 43, w: 11, h: 26 } },
    { sprite: "elder", hotspot: { x: 60, y: 34, w: 21, h: 62 } },
  ],
  d: [
    { sprite: "elder", hotspot: { x: 17, y: 33, w: 22, h: 62 } },
    { sprite: "girl", hotspot: { x: 46, y: 40, w: 11, h: 26 } },
    { sprite: "worker", hotspot: { x: 62, y: 34, w: 21, h: 63 } },
  ],
  e: [
    { sprite: "youth", hotspot: { x: 25, y: 38, w: 21, h: 55 } },
    { sprite: "elder", hotspot: { x: 46, y: 39, w: 11, h: 27 } },
    { sprite: "worker", hotspot: { x: 59, y: 36, w: 21, h: 53 } },
  ],
  f: [
    { sprite: "elder", hotspot: { x: 19, y: 35, w: 21, h: 61 } },
    { sprite: "woman", hotspot: { x: 63, y: 35, w: 20, h: 61 } },
  ],
  g: [
    { sprite: "woman", hotspot: { x: 25, y: 37, w: 20, h: 54 } },
    { sprite: "youth", hotspot: { x: 47, y: 40, w: 9, h: 27 } },
    { sprite: "elder", hotspot: { x: 60, y: 41, w: 18, h: 49 } },
  ],
};

/** Wählt eine vollständige Bildkomposition und genau eine passende Persona je Figur. */
export function pickBusComposition(): BusCompositionSelection {
  const ids: BusCompositionId[] = ["a", "b", "c", "d", "e", "f", "g"];
  const id = ids[Math.floor(Math.random() * ids.length)];
  const used = new Set<string>();
  const passengers = COMPOSITION_SLOTS[id].map(({ sprite, hotspot, chatterAnchors }) => {
    const candidates = BUS_PASSENGERS.filter(
      (passenger) => passenger.sprite === sprite && !used.has(passenger.id),
    );
    const passenger = candidates[Math.floor(Math.random() * candidates.length)];
    if (!passenger) {
      throw new Error(`Keine Bus-Persona für Figurentyp ${sprite}`);
    }
    used.add(passenger.id);
    return { passengerId: passenger.id, hotspot, chatterAnchors };
  });
  return { id, passengers };
}
