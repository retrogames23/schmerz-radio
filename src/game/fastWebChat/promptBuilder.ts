import {
  FASTWEB_LORE_GUARD,
  FASTWEB_PERSONAS,
  FASTWEB_TOPICS,
  type FastWebPersonaId,
} from "./personas";

export function buildFastWebSystemPrompt(allowed: FastWebPersonaId[]): string {
  const personaBlock = allowed
    .map((id) => `- ${id}: ${FASTWEB_PERSONAS[id].bio}`)
    .join("\n");
  const topicHints = FASTWEB_TOPICS.slice(0, 12).join(" · ");

  return [
    "SETTING: IRC-artiger Chatraum #amiga-zone auf chat.fastweb.us. Spätabends, November 1997. Heimcomputer-Szene-Smalltalk. Gemütlich, leicht ironisch, kein Drama.",
    "",
    "AKTIVE PERSONAS IN DIESEM RAUM:",
    personaBlock,
    "",
    "Du sollst GENAU EINE neue Chat-Zeile von GENAU EINER dieser Personas erzeugen. Wähle, wer am natürlichsten als nächstes spricht: jemand, der eine Frage beantworten kann, jemand, der schon länger nichts gesagt hat, oder jemand, der zum aktuellen Thema etwas Konkretes beizutragen hat.",
    "",
    "STIL:",
    "- Eine kurze IRC-Zeile, 5 bis 140 Zeichen, klein/locker geschrieben.",
    "- Kein eigener Name als Präfix, kein Zeitstempel — nur der Text.",
    "- Keine Anführungszeichen drumherum.",
    "- Bleib in der gewählten Persona-Stimme (siehe bio).",
    "- Reagiere konkret auf die letzten 2-4 Zeilen. Wiederhole nichts wörtlich.",
    "- Wenn das Thema müde wirkt, darf die gewählte Persona ein neues anstoßen aus diesem Pool: " +
      topicHints +
      ".",
    "",
    "LORE-REGELN (HART):",
    FASTWEB_LORE_GUARD,
  ].join("\n");
}

export const FASTWEB_BYE_LINES: ReadonlyArray<{ persona: FastWebPersonaId; text: string }> = [
  { persona: "amiga4ever", text: "so, ich mach feierabend. n8 zusammen." },
  { persona: "zak_mckracken_92", text: "ich auch, bye. morgen wieder." },
  { persona: "kassettenkind", text: "schlaft gut, leute. *winkt*" },
  { persona: "piratin42", text: "cu, ich pack mal die disks weg." },
  { persona: "nightowl_tor", text: "n8." },
];

export const FASTWEB_WAKE_LINES: ReadonlyArray<{ persona: FastWebPersonaId; text: string }> = [
  { persona: "amiga4ever", text: "guten morgen. kaffee läuft." },
  { persona: "zak_mckracken_92", text: "moin. wer ist schon da?" },
  { persona: "kassettenkind", text: "hallo wieder, raum war ja schön ruhig." },
];