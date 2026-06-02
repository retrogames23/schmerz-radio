import { DSA_LORE_BRIEF } from "../llmLore";
import { DSA_SCENE_TAGS } from "../sceneImages";
import { ENEMY_STATS } from "../combat";
import { getSetting, type DsaSettingId } from "../llmAdventure";
import { DSA_MOODS } from "@/audio/dsaMusic";
import { buildDsa3RulesBlock } from "../rules";
import { buildCoreLoreAppend, buildContextualLoreBlock } from "../lore";
import type { DsaCharacterSummary } from "@/game/types";
import { defaultGearFor, serializeGearForPrompt, serializeCompanionGearForPrompt, type HeroGear } from "../gear";

export interface GroupHero {
  userId: string;
  displayName: string;
  character: DsaCharacterSummary;
  gear: HeroGear | null;
  absent: boolean;
}

export interface BuildGroupPromptArgs {
  setting: DsaSettingId;
  heroes: GroupHero[];
  includeCompanions: boolean;
  summary: string;
  wishBrief?: string | null;
  assistantTurns: number;
}

/**
 * Master-Prompt für die Gruppen-Tafelrunde. Bewusst schlanker als der
 * Solo-Prompt: Tjark spricht für die Welt und (optional) für Brem/Yelva,
 * aber NIE für einen menschlichen Spielercharakter.
 */
export function buildGroupMasterSystemPrompt({
  setting,
  heroes,
  includeCompanions,
  summary,
  wishBrief = null,
  assistantTurns,
}: BuildGroupPromptArgs): string {
  const s = getSetting(setting);
  const isWish = setting === "wish";
  const isOpen = setting === "sandbox" || isWish;

  const heroBlock = heroes
    .map((h) => {
      const attrLine = (Object.entries(h.character.attrs) as [string, number][])
        .map(([k, v]) => `${k}:${v}`)
        .join(" ");
      const gear = h.gear ?? defaultGearFor(h.character.classId);
      return `─ ${h.character.name} (${h.character.className}, gespielt von ${h.displayName}${h.absent ? ", aktuell ABWESEND" : ""})
    Eigenschaften: ${attrLine}
    LE: ${h.character.le}/${h.character.leMax}${h.character.ae !== null ? `, AE: ${h.character.ae}` : ""}
    Ausrüstung/Inventar:
${serializeGearForPrompt(gear)
  .split("\n")
  .map((l) => `      ${l}`)
  .join("\n")}`;
    })
    .join("\n\n");

  const presentNames = heroes.filter((h) => !h.absent).map((h) => h.character.name).join(", ");
  const absentNames = heroes.filter((h) => h.absent).map((h) => h.character.name);

  const companionBlock = includeCompanions
    ? `
BEGLEITER (BREM und YELVA) — du verwaltest sie als Mitspieler:
${serializeCompanionGearForPrompt()}
  Sprich für Brem (Streuner, trocken, pragmatisch) und Yelva (Auelfen-Druidin, ironisch, gebildet) wie in der Solo-Runde — kurze, charakterstarke Beiträge mit [BREM] / [YELVA].
`
    : `
OHNE NSC-GEFÄHRTEN: In dieser Runde sind Brem und Yelva NICHT dabei. Erwähne sie nicht und sprich keine [BREM]/[YELVA]-Zeilen.
`;

  return `Du bist TJARK, der Spielleiter einer DSA3-Gruppenrunde. Am Tisch sitzen ${heroes.length} menschliche Spieler:

${heroBlock}

${DSA_LORE_BRIEF}

${buildCoreLoreAppend()}

${buildContextualLoreBlock({ setting, enemyIds: Object.keys(ENEMY_STATS) })}

${buildDsa3RulesBlock()}
${companionBlock}
${isWish && wishBrief ? `
SPIELERWUNSCH (PFLICHT BEACHTEN — vom Raumgründer formuliert):
  """
  ${wishBrief.trim()}
  """
` : ""}

SETTING DIESES ABENTEUERS — ${s?.title ?? "freie Wahl"}:
${s?.masterHint ?? "Setze einen passenden Auftakt."}

BISHER PASSIERT (Zusammenfassung, kann leer sein):
${summary || "— (Abenteuer beginnt jetzt)"}

GRUPPENSPIEL — REGELN:
  • Du sprichst NIE für einen menschlichen Spielercharakter (${heroes.map((h) => h.character.name).join(", ")}). Beschreibe nur, was ihnen widerfährt, frage sie, was sie tun.
  • Pro Runde reichen die Spieler PARALLEL Aktionen ein. Du bekommst sie als Liste „Diese Runde:" in der User-Nachricht. Verarbeite ALLE Aktionen in EINER Antwort: erzähle pro Held einen klaren Beat, würfle (intern) ggf. für jeden eigene Proben, beschreibe das Ergebnis.
  • Im Kampf: sortiere intern nach INI, beschreibe aber in einer flüssigen Erzählung.
  • Wenn ein Held als ABWESEND markiert ist (${absentNames.length ? absentNames.join(", ") : "aktuell niemand"}), schreibe ihn plausibel kurz aus der Szene (Wache halten, Pferde versorgen, beten) — keine Aktionen, kein Schaden.
  • Schließe deine Antwort IMMER mit einer offenen Frage „Was tut ihr?“ (oder situativ passender Variante), damit alle wieder einsteigen können.

AUSGABEFORMAT — STRIKT:
  Jede Zeile beginnt mit [TJARK]${includeCompanions ? ", [BREM] oder [YELVA]" : ""}.
  Erlaubte Marker (je in eigener Zeile, optional):
    [SCENE: <tag>]            Wechselt die Hintergrundillustration. Erlaubte Tags: ${DSA_SCENE_TAGS.join(", ")}.
                              Sehr sparsam einsetzen, nur bei echten Schauplatzwechseln.
    [CHECK: <ATTR> [+/-N]]    Eigenschaftsprobe für die Gruppe.
    [MOOD: <id>]              Musikstimmung. Erlaubt: ${DSA_MOODS.join(", ")}.
    [END: victory|defeat|aborted]  Beendet das Abenteuer (frühestens nach ~30 Meisterwenden).
  KEINE [COMBAT]-Marker in dieser Gruppenrunde — Kämpfe werden erzählt und mit [CHECK]-Proben (KK/GE/AT-Eigenschaft) entschieden; pro Treffer ggf. 1W6+2 LE-Verlust beschreiben.

AKTUELLER UMFANG: Bisher ${assistantTurns} Meisterwenden.
${isOpen ? "OFFENE RUNDE — kein Akt-Korsett, kein Pflicht-Showdown." : "PLANE in 5 Akten (~30–50 Wenden insgesamt). [END: victory] frühestens nach ~30 Wenden, wenn alle Fäden geschlossen sind."}

PRÄSENZ JETZT: ${presentNames || "—"}.
`;
}
