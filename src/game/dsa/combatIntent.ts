/**
 * Parser für freie Kampfbefehle aus den letzten Spieler-/Gefährten-Zeilen.
 *
 * Zweck: Wenn der LLM-Meister [COMBAT: …] setzt, soll das Kampf-Overlay die
 * unmittelbar davor formulierten Wünsche („Yelva, bleib hinten und leg
 * Pfeile auf", „Ich wirke Ignifaxius", „Blende den Anführer") in
 * deterministische Effekte übersetzen — statt die LLM darüber rätseln zu
 * lassen, was im interaktiven Kampf-Overlay tatsächlich passiert.
 *
 * Bewusst klein und konservativ: erkennen wir keinen Befehl, bleibt alles
 * beim alten Verhalten.
 */

import { SPELLS } from "./rules/spells";

export interface CompanionIntent {
  /** Bleibt aus der ersten Reihe; Gegner zielen seltener auf diese Figur. */
  backline: boolean;
  /** Kämpft auf Distanz (Bogen, Wurfwaffe). */
  ranged: boolean;
  /** Versucht zu Rundenbeginn einen Gegner zu blenden/abzulenken. */
  blind: boolean;
  /** Bleibt nah am Helden / deckt die Gruppe — leichte PA-Stärkung. */
  protect: boolean;
  /** Flankiert / nutzt Hinterhalt — leichter AT-Bonus, weniger PA. */
  flank: boolean;
}

export interface CombatIntent {
  /** Spruch, den Layard ausdrücklich gewünscht hat (Zauber-ID). */
  layardSpellId: string | null;
  yelva: CompanionIntent;
  brem: CompanionIntent;
  /** Menschlich lesbare Notizen, die das Overlay anzeigen kann. */
  notes: string[];
}

export const EMPTY_COMPANION_INTENT: CompanionIntent = {
  backline: false,
  ranged: false,
  blind: false,
  protect: false,
  flank: false,
};

export const EMPTY_COMBAT_INTENT: CombatIntent = {
  layardSpellId: null,
  yelva: { ...EMPTY_COMPANION_INTENT },
  brem: { ...EMPTY_COMPANION_INTENT },
  notes: [],
};

export function mergeCombatIntents(
  base?: CombatIntent | null,
  override?: CombatIntent | null,
): CombatIntent | null {
  if (!base && !override) return null;
  const b = base ?? EMPTY_COMBAT_INTENT;
  const o = override ?? EMPTY_COMBAT_INTENT;
  return {
    layardSpellId: o.layardSpellId ?? b.layardSpellId,
    yelva: {
      backline: b.yelva.backline || o.yelva.backline,
      ranged: b.yelva.ranged || o.yelva.ranged,
      blind: b.yelva.blind || o.yelva.blind,
      protect: b.yelva.protect || o.yelva.protect,
      flank: b.yelva.flank || o.yelva.flank,
    },
    brem: {
      backline: b.brem.backline || o.brem.backline,
      ranged: b.brem.ranged || o.brem.ranged,
      blind: b.brem.blind || o.brem.blind,
      protect: b.brem.protect || o.brem.protect,
      flank: b.brem.flank || o.brem.flank,
    },
    notes: [...b.notes, ...o.notes],
  };
}

const COMPANION_ALIASES: Record<"yelva" | "brem", string[]> = {
  yelva: ["yelva", "yelvanyel", "elfe", "elfin", "auelfe", "elf "],
  brem: ["brem", "brendan", "streuner", "halbgroschen"],
};

const BACKLINE_RE = /(hinten|hintergrund|zur(?:ü|ue)ck|deckung|distanz|abseits|nicht in (?:die )?erste reihe)/i;
const RANGED_RE = /(pfeil|pfeile|bogen|fernkampf|auflegen|aus der distanz|wurfmesser|schleuder)/i;
const BLIND_RE = /(blend(?:e|en|et|est)?|geblend|sand in die augen|augen[- ]?streich|verblend)/i;
const PROTECT_RE = /(besch(?:ü|ue)tz|decke(?:n|t)?(?: mich)?|verteid(?:ig)?|deckung halt|halt(?:e|en) frei)/i;
const FLANK_RE = /(flank|umkreis|umgeh|hinterhalt|von hinten|in den r(?:ü|ue)cken)/i;

/** Zerteilt einen Befehlstext in Klauseln und liefert nur die, die einen
 *  bestimmten Gefährten beim Namen / per Rolle ansprechen. */
function clausesMentioning(text: string, aliases: string[]): string[] {
  const parts = text.split(/(?<=[.!?])\s+|,|—|–|;|\n/);
  const out: string[] = [];
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (aliases.some((a) => lower.includes(a))) out.push(lower);
  }
  return out;
}

function buildCompanionIntent(
  text: string,
  who: "yelva" | "brem",
  notes: string[],
): CompanionIntent {
  const intent: CompanionIntent = { ...EMPTY_COMPANION_INTENT };
  const fragments = clausesMentioning(text, COMPANION_ALIASES[who]);
  if (fragments.length === 0) return intent;
  const blob = fragments.join(" | ");
  if (BACKLINE_RE.test(blob)) intent.backline = true;
  if (RANGED_RE.test(blob)) {
    intent.ranged = true;
    intent.backline = true;
  }
  if (BLIND_RE.test(blob)) intent.blind = true;
  if (PROTECT_RE.test(blob)) intent.protect = true;
  if (FLANK_RE.test(blob)) intent.flank = true;

  const parts: string[] = [];
  if (intent.backline) parts.push("bleibt hinten");
  if (intent.ranged) parts.push("Fernkampf");
  if (intent.blind) parts.push("blendet einen Gegner");
  if (intent.protect) parts.push("deckt die Gruppe");
  if (intent.flank) parts.push("flankiert");
  if (parts.length > 0) {
    const label = who === "yelva" ? "Yelva" : "Brem";
    notes.push(`${label}: ${parts.join(", ")}`);
  }
  return intent;
}

/** Erkennt einen explizit benannten Zauberwunsch des Spielers. */
function detectLayardSpell(
  text: string,
  knownSpells: Record<string, number> | null | undefined,
): string | null {
  if (!knownSpells) return null;
  const lower = text.toLowerCase();
  // Direkte Treffer per Spruchname / -ID / Alltagsname.
  for (const id of Object.keys(knownSpells)) {
    const zfw = knownSpells[id];
    if (typeof zfw !== "number") continue;
    const def = SPELLS.find((s) => s.id === id);
    if (!def) continue;
    if (lower.includes(def.name.toLowerCase())) return id;
    if (lower.includes(id.replace(/_/g, " "))) return id;
    switch (id) {
      case "ignifaxius":
        if (/(ignifaxius|feuerstoß|feuerstoss|feuerstrahl)/i.test(text)) return id;
        break;
      case "blitz_dich_find":
        if (/blitz/i.test(text)) return id;
        break;
      case "fulminictus":
        if (/(fulminictus|druckwelle)/i.test(text)) return id;
        break;
      case "balsam_salabunde":
        if (/(balsam|heilzauber|heile? mich|salabunde)/i.test(text)) return id;
        break;
      case "horriphobus":
        if (/(horriphobus|furcht|panik)/i.test(text)) return id;
        break;
      case "armatrutz":
        if (/(armatrutz|magischer schild|magisches schild|schutzzauber)/i.test(text)) return id;
        break;
      case "axxeleratus":
        if (/(axxeleratus|hast)/i.test(text)) return id;
        break;
      case "bannbaladin":
        if (/(bannbaladin|beschwichtig)/i.test(text)) return id;
        break;
    }
  }
  return null;
}

/**
 * Wertet die letzten Spieler-/Master-Zeilen aus, bevor der Kampf startet.
 * Nicht erkannte Eingaben liefern `EMPTY_COMBAT_INTENT` (No-Op).
 */
export function parseCombatIntent(
  recentText: string,
  knownSpells?: Record<string, number> | null,
): CombatIntent {
  const text = (recentText ?? "").trim();
  if (!text) return EMPTY_COMBAT_INTENT;
  const notes: string[] = [];
  const yelva = buildCompanionIntent(text, "yelva", notes);
  const brem = buildCompanionIntent(text, "brem", notes);
  const layardSpellId = detectLayardSpell(text, knownSpells ?? null);
  if (layardSpellId) {
    const def = SPELLS.find((s) => s.id === layardSpellId);
    if (def) notes.unshift(`Layard wirkt: ${def.name}`);
  }
  return { layardSpellId, yelva, brem, notes };
}