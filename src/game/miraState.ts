import type { GameApi } from "./types";

/**
 * Drei kanonische Mira-States für Akt II.
 *
 * - friendly:  Layard hat Mira den Verstärker geliefert und mit ihr
 *              gemeinsam auf 104,0 gesendet.
 * - skeptical: Layard hat Mira aktiv abgewiesen oder die Vertrauensprobe
 *              verloren (miraSystemic ODER miraTrustWithheld).
 * - neutral:   Alles dazwischen — inkl. „nie mit Mira gesprochen".
 */
export type MiraEndState = "friendly" | "neutral" | "skeptical";

/** Berechnet (ohne zu speichern) den Mira-State aus den aktuellen Akt-I-Flags. */
export function computeMiraEndState(api: GameApi): MiraEndState {
  if (api.hasFlag("miraSentAnger")) return "friendly";
  if (api.hasFlag("miraSystemic") || api.hasFlag("miraTrustWithheld")) {
    return "skeptical";
  }
  return "neutral";
}

/** Liest den persistierten Mira-State. Default: neutral (z. B. vor Akt II). */
export function getMiraEndState(api: GameApi): MiraEndState {
  if (api.hasFlag("miraEndFriendly")) return "friendly";
  if (api.hasFlag("miraEndSkeptical")) return "skeptical";
  return "neutral";
}

/**
 * Persistiert den Mira-State als Flag. Setzt nur das passende Flag und
 * räumt die anderen beiden nicht aktiv ab — die Flags werden so gesetzt,
 * dass nur eines davon je gilt. Falls später ein Wechsel nötig ist
 * (skeptical → neutral durch späten Mira-Kontakt), bitte explizit das
 * alte Flag-Feld leeren — derzeit gibt es nur das Setzen.
 */
export function persistMiraEndState(api: GameApi, state: MiraEndState): void {
  if (state === "friendly" && !api.hasFlag("miraEndFriendly")) {
    api.setFlag("miraEndFriendly");
  } else if (state === "neutral" && !api.hasFlag("miraEndNeutral")) {
    api.setFlag("miraEndNeutral");
  } else if (state === "skeptical" && !api.hasFlag("miraEndSkeptical")) {
    api.setFlag("miraEndSkeptical");
  }
}