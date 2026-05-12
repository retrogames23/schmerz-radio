#!/usr/bin/env bun
/**
 * Hints-Check: prüft, ob jeder HINT_QUESTS-Eintrag in src/game/hints.ts
 *  - nur existierende StoryFlags und InventoryItemIds verwendet
 *  - Flags referenziert, die irgendwo im Code per setFlag() gesetzt werden
 *  - Items referenziert, die irgendwo per addItem({ id: ... }) erzeugt werden
 *  - in den Tipp-Texten Türnummern / NPC-Namen / Item-Schlüsselwörter
 *    nennt, die im Codebestand tatsächlich vorkommen.
 *
 * Output: /mnt/documents/hints-check-report.md
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

function listFiles(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) listFiles(p, out);
    else if (/\.(ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

const SRC_FILES = [
  ...listFiles(ROOT + "src/game"),
  ...listFiles(ROOT + "src/components/game"),
];
const ALL_SRC = SRC_FILES
  .filter((p) => !p.endsWith("hints.ts") && !p.endsWith("types.ts"))
  .map((p) => ({ path: p.replace(ROOT, ""), text: readFileSync(p, "utf8") }));

const typesText = readFileSync(ROOT + "src/game/types.ts", "utf8");

// ── Bekannte Flags & Items aus types.ts extrahieren ───────────────
function extractUnion(name) {
  const re = new RegExp(`export type ${name}\\s*=\\s*([^;]+);`, "m");
  const m = typesText.match(re);
  if (!m) return new Set();
  return new Set(
    [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
  );
}
const KNOWN_FLAGS = extractUnion("StoryFlag");
const KNOWN_ITEMS = extractUnion("InventoryItemId");

// ── Setter-Index aufbauen: welcher Flag wird wo gesetzt? ──────────
const setterIndex = new Map(); // flag -> [paths]
const itemProducerIndex = new Map(); // itemId -> [paths]
for (const { path, text } of ALL_SRC) {
  for (const m of text.matchAll(/setFlag\(\s*"([^"]+)"/g)) {
    if (!setterIndex.has(m[1])) setterIndex.set(m[1], []);
    setterIndex.get(m[1]).push(path);
  }
  for (const m of text.matchAll(/addItem\(\s*\{\s*id:\s*"([^"]+)"/g)) {
    if (!itemProducerIndex.has(m[1])) itemProducerIndex.set(m[1], []);
    itemProducerIndex.get(m[1]).push(path);
  }
}

// ── HINT_QUESTS aus hints.ts laden (regex-Parser, ausreichend) ───
const hintsText = readFileSync(ROOT + "src/game/hints.ts", "utf8");
// jede Quest ist ein Objekt mit id: "...", isActive: ..., isResolved: ..., hints: [...]
const questBlocks = [...hintsText.matchAll(
  /\{\s*id:\s*"([^"]+)",[\s\S]*?hints:\s*\[([\s\S]*?)\]\s*,?\s*\}/g,
)];

const findings = { HARD: [], SOFT: [], INFO: [] };
function add(sev, qid, msg) { findings[sev].push({ qid, msg }); }

const SECTIONS = [];

for (const m of questBlocks) {
  const id = m[1];
  const block = m[0];
  const hintsBody = m[2];

  // Flags / Items, die in isActive/isResolved auftauchen
  const flags = new Set(
    [...block.matchAll(/hasFlag\(\s*"([^"]+)"\s*\)/g)].map((x) => x[1]),
  );
  const items = new Set(
    [...block.matchAll(/hasItem\(\s*"([^"]+)"\s*\)/g)].map((x) => x[1]),
  );

  for (const f of flags) {
    if (!KNOWN_FLAGS.has(f)) {
      add("HARD", id, `Unbekanntes StoryFlag "${f}" — nicht in types.ts deklariert.`);
    } else if (!setterIndex.has(f)) {
      add("HARD", id, `Flag "${f}" wird nirgendwo per setFlag() gesetzt — Quest unauflösbar/unauslösbar.`);
    }
  }
  for (const it of items) {
    if (!KNOWN_ITEMS.has(it)) {
      add("HARD", id, `Unbekanntes InventoryItem "${it}" — nicht in types.ts deklariert.`);
    } else if (!itemProducerIndex.has(it)) {
      add("HARD", id, `Item "${it}" wird nirgendwo per addItem() erzeugt.`);
    }
  }

  // Tipp-Texte: Türnummern und NPC-Namen heuristisch gegenchecken
  const tipTexts = [...hintsBody.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)].map((x) => x[1]);
  const allText = tipTexts.join(" \u2022 ");

  // 4-stellige "Türnummern" / Aktenzeichen
  const numbers = new Set([...allText.matchAll(/\b(\d{4})\b/g)].map((x) => x[1]));
  for (const n of numbers) {
    const present = ALL_SRC.some((f) => f.text.includes(n));
    if (!present) {
      add("SOFT", id, `Tipp nennt Nummer "${n}", die im Code nicht vorkommt — Tipp evtl. veraltet.`);
    }
  }

  // NPC-Namen (im Tipp-Text genannt) gegen Dialog-Speaker-Liste
  const NPCs = ["Insa","Philippe","Bodo","Helka","Ennis","Kowalk","Vossbeck","Brust","Mira","Mikael","Okwu","Lotti","Tilla","Stegmann","Bram","Marv","Tjark","Yelva"];
  for (const npc of NPCs) {
    if (!new RegExp("\\b" + npc + "\\b").test(allText)) continue;
    const present = ALL_SRC.some((f) => f.text.includes(npc));
    if (!present) {
      add("SOFT", id, `Tipp nennt NPC "${npc}", der im Code nicht referenziert ist.`);
    }
  }

  SECTIONS.push({ id, flags: [...flags], items: [...items], numbers: [...numbers] });
}

// ── Markdown-Report ──────────────────────────────────────────────
const lines = [];
lines.push("# Hints-Check Report");
lines.push("");
lines.push(`Quests geprüft: ${questBlocks.length}`);
lines.push(`Flags bekannt: ${KNOWN_FLAGS.size}, Items bekannt: ${KNOWN_ITEMS.size}`);
lines.push("");
for (const sev of ["HARD", "SOFT", "INFO"]) {
  lines.push(`## ${sev} (${findings[sev].length})`);
  if (findings[sev].length === 0) lines.push("_keine Funde_");
  for (const f of findings[sev]) {
    lines.push(`- **${f.qid}** — ${f.msg}`);
  }
  lines.push("");
}
lines.push("## Quest-Index");
for (const s of SECTIONS) {
  lines.push(`### ${s.id}`);
  lines.push(`- Flags: ${s.flags.join(", ") || "—"}`);
  lines.push(`- Items: ${s.items.join(", ") || "—"}`);
  lines.push(`- Nummern in Tipps: ${s.numbers.join(", ") || "—"}`);
}

writeFileSync("/mnt/documents/hints-check-report.md", lines.join("\n"));

console.log(`HARD: ${findings.HARD.length}  SOFT: ${findings.SOFT.length}  INFO: ${findings.INFO.length}`);
for (const f of findings.HARD) console.log("HARD", f.qid, f.msg);
for (const f of findings.SOFT) console.log("SOFT", f.qid, f.msg);
process.exit(findings.HARD.length > 0 ? 1 : 0);
