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
  /** Spruch, den Yelva ausdrücklich gewirkt hat (Zauber-ID). */
  yelvaSpellId: string | null;
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
  yelvaSpellId: null,
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
    yelvaSpellId: o.yelvaSpellId ?? b.yelvaSpellId,
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

/**
 * Yelvas Standard-Repertoire (Auelfen-Hauszauber). Wird auch im Parser
 * verwendet, damit „Yelva wirkt Bannbaladin" überhaupt als Befehl ankommt,
 * selbst wenn Yelva am Tisch noch keinen expliziten Zauberbogen hat.
 */
export const YELVA_DEFAULT_SPELLS: Record<string, number> = {
  flim_flam: 5,
  balsam_salabunde: 6,
  bannbaladin: 5,
  adlerauge: 6,
  odem_arcanum: 5,
  blitz_dich_find: 5,
};

const BACKLINE_RE = /(hinten|hintergrund|zur(?:ü|ue)ck|deckung|distanz|abseits|nicht in (?:die )?erste reihe)/i;
const RANGED_RE = /(pfeil|pfeile|bogen|fernkampf|auflegen|aus der distanz|wurfmesser|schleuder)/i;
const BLIND_RE = /(blend(?:e|en|et|est)?|geblend|sand in die augen|augen[- ]?streich|verblend)/i;
const PROTECT_RE = /(besch(?:ü|ue)tz|decke(?:n|t)?(?: mich)?|verteid(?:ig)?|deckung halt|halt(?:e|en) frei)/i;
const FLANK_RE = /(flank|umkreis|umgeh|hinterhalt|von hinten|in den r(?:ü|ue)cken)/i;

/**
 * Schlüsselwörter pro Zauber-ID. Greift sowohl den Spruchnamen selbst als
 * auch die alltagssprachlichen Umschreibungen ab, die Spieler im Prompt
 * tatsächlich nutzen („Heile mich", „Beschwichtige ihn", „Adlerblick").
 */
const SPELL_KEYWORDS: Record<string, RegExp> = {
  ignifaxius: /(ignifaxius|feuerstoß|feuerstoss|feuerstrahl)/i,
  blitz_dich_find: /(blitz dich find|blitz)/i,
  fulminictus: /(fulminictus|druckwelle)/i,
  balsam_salabunde: /(balsam(?: salabunde)?|salabunde|heilzauber|heile? (?:mich|ihn|sie|uns|layard|brem))/i,
  horriphobus: /(horriphobus|furcht|panik)/i,
  armatrutz: /(armatrutz|magischer schild|magisches schild|schutzzauber)/i,
  axxeleratus: /(axxeleratus|hast)/i,
  bannbaladin: /(bannbaladin|beschwichtig|besänftig|besaenftig|befried(?:e|en|et|ige|igen)|singt? sie? ruhig)/i,
  flim_flam: /(flim ?flam|magisches? licht|leuchtkugel)/i,
  adlerauge: /(adlerauge|adlerblick|scharfes? sehen)/i,
  odem_arcanum: /(odem(?: arcanum)?|magie aufsp(?:ü|ue)ren|magische aura)/i,
};

/** Sucht in einem (kleingeschriebenen) Textfragment nach einer Spruch-ID. */
function findSpellInText(
  fragment: string,
  allowed: Iterable<string>,
): string | null {
  for (const id of allowed) {
    const def = SPELLS.find((s) => s.id === id);
    if (!def) continue;
    if (fragment.includes(def.name.toLowerCase())) return id;
    if (fragment.includes(id.replace(/_/g, " "))) return id;
    const re = SPELL_KEYWORDS[id];
    if (re && re.test(fragment)) return id;
  }
  return null;
}

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

/**
 * Erkennt Zauberwünsche und ordnet sie dem richtigen Zauberer zu:
 *   - Wird Yelva in derselben Klausel namentlich angesprochen, gilt der
 *     Spruch als ihrer (sofern er zu ihrem Elfen-Repertoire passt).
 *   - Sonst fällt der Spruch auf Layard zurück, sofern er ihn kennt.
 *
 * Bewusst klauselbasiert, damit „Yelva singt Bannbaladin, ich wirke
 * Ignifaxius" beide Caster gleichzeitig zulässt.
 */
function detectSpells(
  text: string,
  layardKnown: Record<string, number> | null | undefined,
): { layardSpellId: string | null; yelvaSpellId: string | null } {
  const layardIds = Object.keys(layardKnown ?? {}).filter(
    (id) => typeof (layardKnown as Record<string, number>)[id] === "number",
  );
  const yelvaIds = Object.keys(YELVA_DEFAULT_SPELLS);
  let layardSpellId: string | null = null;
  let yelvaSpellId: string | null = null;
  const clauses = text.split(/(?<=[.!?])\s+|,|—|–|;|\n/);
  for (const raw of clauses) {
    const cl = raw.toLowerCase();
    const mentionsYelva = COMPANION_ALIASES.yelva.some((a) => cl.includes(a));
    if (mentionsYelva && !yelvaSpellId) {
      const hit = findSpellInText(cl, yelvaIds);
      if (hit) yelvaSpellId = hit;
    }
    if (!mentionsYelva && !layardSpellId && layardIds.length > 0) {
      const hit = findSpellInText(cl, layardIds);
      if (hit) layardSpellId = hit;
    }
  }
  // Fallback: keine Klausel hat Layard direkt erwischt? Dann scannt der
  // Gesamttext, damit ein knappes „Ich wirke Ignifaxius!" weiter geht.
  if (!layardSpellId && layardIds.length > 0) {
    const hit = findSpellInText(text.toLowerCase(), layardIds);
    if (hit) layardSpellId = hit;
  }
  return { layardSpellId, yelvaSpellId };
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
  const { layardSpellId, yelvaSpellId } = detectSpells(text, knownSpells ?? null);
  if (yelvaSpellId) {
    const def = SPELLS.find((s) => s.id === yelvaSpellId);
    if (def) notes.unshift(`Yelva wirkt: ${def.name}`);
  }
  if (layardSpellId) {
    const def = SPELLS.find((s) => s.id === layardSpellId);
    if (def) notes.unshift(`Layard wirkt: ${def.name}`);
  }
  return { layardSpellId, yelvaSpellId, yelva, brem, notes };
}