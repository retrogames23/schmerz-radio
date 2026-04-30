#!/usr/bin/env bun
/**
 * Quest-Logik-Linter für E67.
 *
 *   bun scripts/quest-check.mjs            # statische Checks
 *   bun scripts/quest-check.mjs --llm      # zusätzlich LLM-Lore-Review
 *
 * Was es prüft (siehe .lovable/plan.md, Abschnitt »Quest-Logik-Test«):
 *   1. Tote / unerreichbare Story-Flags und Items.
 *   2. Reachability zum Ende (insaAct2Return → setEnding).
 *   3. requires/hiddenWhen-Konflikte und Tippfehler-Flags.
 *   4. Item-Producer/Consumer-Konsistenz.
 *   5. Optional: LLM-Lore-Review (Dialogtext vs. Biografie/HardFacts).
 *
 * Output:
 *   - Konsole: knappe Pass/Fail pro Kategorie, exit != 0 bei HARD-Funden.
 *   - /mnt/documents/quest-check-report.md
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
// Quest-Logik lebt nicht nur in src/game/* — viele Setter sitzen in
// UI-Komponenten (RadioPanel, NodeTerminal, Terminal, ParamedicsCutscene
// etc.) und im GameContext. Wir scannen alles unter src/game und
// src/components/game, plus den GameContext.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) listFiles(p, out);
    else if (/\.(ts|tsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const SOURCES = [
  ...listFiles(ROOT + "src/game"),
  ...listFiles(ROOT + "src/components/game"),
]
  .map((p) => p.replace(ROOT, ""))
  // types.ts NICHT scannen — sonst werden die Union-Literale als Reader gewertet.
  .filter((p) => p !== "src/game/types.ts");

const REPORT_PATH = "/mnt/documents/quest-check-report.md";

const args = process.argv.slice(2);
const useLlm = args.includes("--llm");

// ── Severity-Buckets ──────────────────────────────────────────────
const findings = { HARD: [], SOFT: [], INFO: [] };
function add(severity, category, msg) {
  findings[severity].push({ category, msg });
}

// ── Quellcode laden ───────────────────────────────────────────────
const files = Object.fromEntries(
  SOURCES.map((p) => [p, readFileSync(ROOT + p, "utf8")]),
);
const typesSrc = readFileSync(ROOT + "src/game/types.ts", "utf8");

// ── 1. StoryFlag-Wahrheitsmenge aus types.ts extrahieren ─────────
function extractUnion(src, typeName) {
  const re = new RegExp(`export type ${typeName}\\s*=\\s*([\\s\\S]*?);`);
  const m = src.match(re);
  if (!m) throw new Error(`Union ${typeName} nicht gefunden`);
  const block = m[1];
  // Kommentare entfernen
  const clean = block
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const literals = [...clean.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return new Set(literals);
}

const STORY_FLAGS = extractUnion(typesSrc, "StoryFlag");
const ITEM_IDS = extractUnion(typesSrc, "InventoryItemId");
const KNOWLEDGE_FLAGS = extractUnion(typesSrc, "KnowledgeFlag");

console.log(
  `Loaded ${STORY_FLAGS.size} StoryFlags, ${ITEM_IDS.size} InventoryItemIds, ` +
    `${KNOWLEDGE_FLAGS.size} KnowledgeFlags from types.ts`,
);

// ── 2. Producer / Consumer scannen ────────────────────────────────
// Producer: setFlag("X"), addItem({ id: "X", ... })
// Consumer: hasFlag("X"), requires: ["X", ...], hiddenWhen: ["X", ...]

const flagWriters = new Map(); // flag -> [{file, line}]
const flagReaders = new Map(); // flag -> [{file, line, kind}]
const itemWriters = new Map();
const itemReaders = new Map();
const flagClears = new Map();

function note(map, key, entry) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(entry);
}

function lineOf(src, idx) {
  return src.slice(0, idx).split("\n").length;
}

for (const [file, src] of Object.entries(files)) {
  // setFlag("X")
  for (const m of src.matchAll(/\bsetFlag\(\s*"([^"]+)"\s*\)/g)) {
    note(flagWriters, m[1], { file, line: lineOf(src, m.index) });
  }
  // clearFlag("X")
  for (const m of src.matchAll(/\bclearFlag\(\s*"([^"]+)"\s*\)/g)) {
    note(flagClears, m[1], { file, line: lineOf(src, m.index) });
  }
  // hasFlag("X")
  for (const m of src.matchAll(/\bhasFlag\(\s*"([^"]+)"\s*\)/g)) {
    note(flagReaders, m[1], {
      file,
      line: lineOf(src, m.index),
      kind: "hasFlag",
    });
  }
  // Variante: flags.has("X") — wird in vielen Komponenten benutzt.
  for (const m of src.matchAll(/\bflags\.has\(\s*"([^"]+)"\s*\)/g)) {
    note(flagReaders, m[1], {
      file,
      line: lineOf(src, m.index),
      kind: "flags.has",
    });
  }
  // requires: ["X", "Y"]   /   hiddenWhen: ["X", "Y"]
  for (const m of src.matchAll(
    /\b(requires|hiddenWhen)\s*:\s*\[([^\]]*)\]/g,
  )) {
    const kind = m[1];
    const list = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    for (const flag of list) {
      note(flagReaders, flag, {
        file,
        line: lineOf(src, m.index),
        kind,
      });
    }
  }
  // addItem({ id: "X", ... })
  for (const m of src.matchAll(/\baddItem\(\s*\{[^}]*\bid\s*:\s*"([^"]+)"/g)) {
    note(itemWriters, m[1], { file, line: lineOf(src, m.index) });
  }
  // hasItem("X")
  for (const m of src.matchAll(/\bhasItem\(\s*"([^"]+)"\s*\)/g)) {
    note(itemReaders, m[1], { file, line: lineOf(src, m.index) });
  }
}

// ── 3. Tippfehler-Detektor ────────────────────────────────────────
// DSA-Subsystem (Adventure-Engine) hat eigene Flag-Map und teilt sich
// die generischen setFlag/hasFlag-Helper nicht mit der Story-Engine.
const DSA_FILES = new Set([
  "src/game/adventureGame.ts",
  "src/game/dsa/adventure.ts",
  "src/game/dsa/chatter.ts",
  "src/game/dsa/classes.ts",
  "src/game/dsa/combat.ts",
  "src/game/dsa/dice.ts",
  "src/components/game/DsaAdventureScene.tsx",
  "src/components/game/DsaCombatOverlay.tsx",
  "src/components/game/DsaCharacterCreator.tsx",
  "src/components/game/DsaCharacterSheet.tsx",
]);
function isDsaOnlyUsage(flag) {
  const sites = [
    ...(flagWriters.get(flag) ?? []),
    ...(flagReaders.get(flag) ?? []),
    ...(flagClears.get(flag) ?? []),
  ];
  return sites.length > 0 && sites.every((s) => DSA_FILES.has(s.file));
}
for (const flag of [
  ...flagWriters.keys(),
  ...flagReaders.keys(),
  ...flagClears.keys(),
]) {
  if (!STORY_FLAGS.has(flag)) {
    if (isDsaOnlyUsage(flag)) continue; // DSA-Engine hat eigene Flag-Map
    const writes = flagWriters.get(flag) ?? [];
    const reads = flagReaders.get(flag) ?? [];
    const sample = writes[0] ?? reads[0];
    add(
      "HARD",
      "unbekannter Flag",
      `Flag "${flag}" wird benutzt, ist aber nicht in StoryFlag deklariert (z. B. ${sample?.file}:${sample?.line})`,
    );
  }
}
for (const item of [...itemWriters.keys(), ...itemReaders.keys()]) {
  if (!ITEM_IDS.has(item)) {
    const sample = itemWriters.get(item)?.[0] ?? itemReaders.get(item)?.[0];
    add(
      "HARD",
      "unbekanntes Item",
      `Item "${item}" benutzt, aber nicht in InventoryItemId deklariert (${sample?.file}:${sample?.line})`,
    );
  }
}

// Whitelist: Flags, die per Mechanik (Cutscene, Wartelogik etc.) bewusst
// ohne Pendant existieren — sie sind in scenes.ts/dialogs.ts setbar via
// Mechaniken oder Cutscene-Hooks und brauchen keinen statischen Reader.
const FLAG_NO_READER_OK = new Set([
  // ending wird via setEnding() konsumiert, nicht via hasFlag
  "ending",
]);
const FLAG_NO_WRITER_OK = new Set([]);

// ── 4. Tote Flags / Items ─────────────────────────────────────────
for (const flag of STORY_FLAGS) {
  const writes = flagWriters.get(flag) ?? [];
  const reads = flagReaders.get(flag) ?? [];
  if (writes.length === 0 && !FLAG_NO_WRITER_OK.has(flag)) {
    add(
      "HARD",
      "Flag nie gesetzt",
      `"${flag}" wird gelesen (${reads.length}×), aber nirgends gesetzt → unerreichbares Gate.`,
    );
  }
  if (reads.length === 0 && !FLAG_NO_READER_OK.has(flag)) {
    add(
      "SOFT",
      "Flag nie gelesen",
      `"${flag}" wird gesetzt (${writes.length}×), aber nirgends gelesen → toter Schreib-Flag.`,
    );
  }
}
for (const item of ITEM_IDS) {
  const writes = itemWriters.get(item) ?? [];
  const reads = itemReaders.get(item) ?? [];
  if (writes.length === 0) {
    add(
      "HARD",
      "Item nie vergeben",
      `Item "${item}" hat keinen addItem-Producer → Spieler kann es nie kriegen.`,
    );
  }
  if (reads.length === 0) {
    add(
      "INFO",
      "Item nie via hasItem gelesen",
      `Item "${item}" wird vergeben, aber nie via hasItem geprüft (vielleicht reines Lese-/Inventarobjekt).`,
    );
  }
}

// ── 5. requires ∩ hiddenWhen Konflikte ────────────────────────────
for (const [file, src] of Object.entries(files)) {
  // Wir matchen NUR Paare im SELBEN Object-Literal: das Fenster
  // zwischen den beiden Feldern darf KEIN Object-Boundary enthalten
  // (heuristisch: kein "},\n" und kein "{ id:" / "{ \n  id:").
  const blockRe =
    /(requires|hiddenWhen)\s*:\s*\[([^\]]*)\][^]{0,300}?(requires|hiddenWhen)\s*:\s*\[([^\]]*)\]/g;
  for (const m of src.matchAll(blockRe)) {
    const [full, k1, l1, k2, l2] = m;
    if (k1 === k2) continue;
    // Bereich zwischen beiden Feldern auf Object-Grenze prüfen.
    const between = full.slice(
      full.indexOf("]") + 1,
      full.lastIndexOf(k2),
    );
    if (/\}\s*,/.test(between)) continue; // anderes Object dazwischen
    const a = new Set([...l1.matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    const b = new Set([...l2.matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    for (const flag of a) {
      if (b.has(flag)) {
        add(
          "HARD",
          "requires ∩ hiddenWhen",
          `${file}:${lineOf(src, m.index)} — Flag "${flag}" steht in requires UND hiddenWhen desselben Blocks (Element ist nie sichtbar).`,
        );
      }
    }
  }
}

// ── 6. Producer hinter eigenem hiddenWhen? ────────────────────────
// Heuristik: Wenn ein Flag F seinen einzigen Producer in einer Datei hat,
// und in einem 800-Zeichen-Fenster davor ein "hiddenWhen: [..., F, ...]"
// steht, dann blockiert sich der Producer womöglich selbst.
for (const [flag, writes] of flagWriters) {
  if (!STORY_FLAGS.has(flag)) continue;
  if (writes.length !== 1) continue;
  const w = writes[0];
  const src = files[w.file];
  if (!src) continue;
  // Position grob: zurück auf Zeilenindex
  const idx = nthLineIndex(src, w.line);
  const window = src.slice(Math.max(0, idx - 1200), idx);
  const hwRe = /hiddenWhen\s*:\s*\[([^\]]*)\]/g;
  for (const m of window.matchAll(hwRe)) {
    const arr = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    if (arr.includes(flag)) {
      add(
        "INFO",
        "Selbst-Blockade möglich",
        `Flag "${flag}" wird in ${w.file}:${w.line} gesetzt, aber im selben Container (~Zeilen davor) steht hiddenWhen: ["${flag}"]. Bitte prüfen, ob der Producer noch erreichbar ist, nachdem der Flag gesetzt wurde.`,
      );
      break;
    }
  }
}

function nthLineIndex(src, n) {
  let idx = 0;
  for (let i = 1; i < n; i++) {
    const next = src.indexOf("\n", idx);
    if (next === -1) return src.length;
    idx = next + 1;
  }
  return idx;
}

// ── 7. Reachability zum Ende ──────────────────────────────────────
// Der einzige setEnding-Trigger ist im Dialog `insaAct2Return`. Wir
// laufen rückwärts: welche Flags benötigt der Trigger-Hotspot, der diesen
// Dialog startet? Heuristik: Wir finden alle startDialog("insaAct2Return")
// und schauen den umgebenden requires-Block davor an.
function findStartDialogContexts(dialogId) {
  const hits = [];
  for (const [file, src] of Object.entries(files)) {
    const re = new RegExp(`startDialog\\(\\s*"${dialogId}"\\s*\\)`, "g");
    for (const m of src.matchAll(re)) {
      const idx = m.index;
      const before = src.slice(Math.max(0, idx - 600), idx);
      const reqs = [...before.matchAll(/requires\s*:\s*\[([^\]]*)\]/g)].pop();
      const flags = reqs
        ? [...reqs[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
        : [];
      hits.push({ file, line: lineOf(src, idx), requires: flags });
    }
  }
  return hits;
}

const endTriggers = findStartDialogContexts("insaAct2Return");
if (endTriggers.length === 0) {
  add(
    "HARD",
    "Kein Endtrigger",
    "startDialog(\"insaAct2Return\") wurde nicht gefunden — Spiel hat keinen erreichbaren Endtrigger.",
  );
} else {
  // Für jeden requires-Flag des Endtriggers prüfen wir, dass es einen
  // Producer gibt.
  for (const t of endTriggers) {
    for (const flag of t.requires) {
      if (!STORY_FLAGS.has(flag)) continue;
      const w = flagWriters.get(flag) ?? [];
      if (w.length === 0) {
        add(
          "HARD",
          "Ende unerreichbar",
          `Endtrigger ${t.file}:${t.line} verlangt "${flag}", aber kein setFlag dafür existiert.`,
        );
      }
    }
  }
}

// ── 8. Combine.ts Cross-Check ─────────────────────────────────────
const combineSrc = files["src/game/combine.ts"];
for (const m of combineSrc.matchAll(
  /pairKey\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g,
)) {
  for (const id of [m[1], m[2]]) {
    if (!ITEM_IDS.has(id)) {
      add(
        "HARD",
        "combine.ts kennt unbekanntes Item",
        `pairKey("${m[1]}", "${m[2]}") referenziert unbekanntes InventoryItemId "${id}".`,
      );
    }
  }
}

// ── 9. Optionaler LLM-Lore-Pass ───────────────────────────────────
if (useLlm) {
  await runLlmLoreReview();
}

async function runLlmLoreReview() {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    add(
      "INFO",
      "LLM übersprungen",
      "LOVABLE_API_KEY nicht gesetzt — überspringe LLM-Pass.",
    );
    return;
  }
  const { npcPersonas, dialogSummaries } = await import(
    "../src/game/npcPersonas.ts"
  );
  const dialogsSrc = files["src/game/dialogs.ts"];
  // Pro NPC die Texte aller seiner staticDialogIds aus dialogs.ts ziehen.
  for (const persona of Object.values(npcPersonas)) {
    const speaker = persona.speaker;
    // Pull alle Zeilen, in denen dieser Speaker spricht.
    const re = new RegExp(
      `speaker:\\s*"${speaker}"[^}]*?text:\\s*"([^"]+)"`,
      "g",
    );
    const lines = [...dialogsSrc.matchAll(re)].map((m) => m[1]);
    if (lines.length === 0) continue;
    const sample = lines.slice(0, 30); // Token-Budget
    const summaries = persona.staticDialogIds
      .map((id) => dialogSummaries[id])
      .filter(Boolean);
    const prompt = [
      "Du bist ein strenger Lore-Prüfer für ein Videospiel.",
      `NPC: ${persona.displayName} (${persona.job}).`,
      "BIOGRAFIE (gilt als wahr):",
      ...(persona.biography ?? []).map((b) => `- ${b}`),
      "HARTE FAKTEN:",
      ...(persona.hardFacts ?? []).map((f) => `- ${f}`),
      "DIALOG-ZUSAMMENFASSUNGEN:",
      ...summaries.map((s) => `- ${s}`),
      "",
      "Hier sind Sätze, die dieser NPC im Spiel SAGT:",
      ...sample.map((l, i) => `${i + 1}. ${l}`),
      "",
      "Gibt es eine harte Lore-Inkonsistenz zwischen diesen Sätzen und",
      "BIOGRAFIE/HARTE FAKTEN? Ignoriere stilistische Abweichungen.",
      "Antworte NUR als JSON:",
      '{"verdict":"PASS"|"FAIL","issues":["<satz, was kollidiert>", ...]}',
    ].join("\n");
    try {
      const r = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 600,
          }),
        },
      );
      if (!r.ok) {
        add(
          "INFO",
          "LLM-Fehler",
          `Judge für ${persona.id} HTTP ${r.status}`,
        );
        continue;
      }
      const j = await r.json();
      const raw = j.choices?.[0]?.message?.content?.trim() ?? "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) {
        add(
          "INFO",
          "LLM-Fehler",
          `Judge für ${persona.id} unparsbar: ${raw.slice(0, 200)}`,
        );
        continue;
      }
      const parsed = JSON.parse(m[0]);
      if (parsed.verdict === "FAIL") {
        for (const issue of parsed.issues ?? []) {
          add(
            "SOFT",
            `Lore-Konflikt (${persona.id})`,
            issue,
          );
        }
      }
    } catch (e) {
      add(
        "INFO",
        "LLM-Exception",
        `${persona.id}: ${String(e).slice(0, 200)}`,
      );
    }
    await new Promise((r) => setTimeout(r, 600));
  }
}

// ── 10. Report ────────────────────────────────────────────────────
const order = ["HARD", "SOFT", "INFO"];
const counts = Object.fromEntries(order.map((k) => [k, findings[k].length]));

const report = [];
report.push("# Quest-Check Report");
report.push(`Generated: ${new Date().toISOString()}`);
report.push(`Mode: ${useLlm ? "static + LLM" : "static only"}`);
report.push("");
report.push(
  `**Summary:** ${counts.HARD} HARD · ${counts.SOFT} SOFT · ${counts.INFO} INFO`,
);
report.push("");

for (const sev of order) {
  if (findings[sev].length === 0) {
    report.push(`## ${sev}: clean ✅`);
    report.push("");
    continue;
  }
  report.push(`## ${sev} (${findings[sev].length})`);
  // gruppieren nach category
  const byCat = new Map();
  for (const f of findings[sev]) {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category).push(f.msg);
  }
  for (const [cat, msgs] of byCat) {
    report.push(`### ${cat}`);
    for (const m of msgs) report.push(`- ${m}`);
    report.push("");
  }
}

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, report.join("\n"));

console.log(
  `\nQuest-Check: ${counts.HARD} HARD, ${counts.SOFT} SOFT, ${counts.INFO} INFO`,
);
console.log(`Report: ${REPORT_PATH}`);

process.exit(counts.HARD > 0 ? 1 : 0);