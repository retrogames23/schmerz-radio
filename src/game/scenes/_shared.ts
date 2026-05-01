import { playSound } from "@/lib/sound";
import type { GameApi, SceneId } from "../types";

export const ELEVATOR_DING = "/audio/elevator-ding.mp3";

/** Spielt das klassische Aufzug-„Ding-Dong" und wechselt danach die Szene. */
export function rideElevator(api: GameApi, target: SceneId) {
  playSound(ELEVATOR_DING, 0.7);
  // Kurze Verzögerung, damit der erste Ton noch im Aufzug zu hören ist.
  window.setTimeout(() => api.goTo(target), 350);
}
