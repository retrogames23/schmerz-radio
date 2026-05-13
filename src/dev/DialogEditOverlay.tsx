import { useState } from "react";
import {
  clearAllPatches,
  getAllPatches,
  isEditActive,
  patchStats,
  setEditActive,
  useDialogPatchTick,
  useEditActive,
} from "./dialogPatchState";
import { dialogs } from "@/game/dialogs";
import { applyPatch } from "./dialogPatchState";
import {
  clearAllTextPatches,
  getAllTextPatches,
  textPatchStats,
  useTextPatchTick,
} from "./textPatchState";

/**
 * Dev-only Inline-Dialog-Editor.
 *
 * Toggle-Button blendet im laufenden DialogOverlay editierbare Felder ein.
 * „Report kopieren" baut aus allen Overrides einen Markdown-Block:
 *  - YAML-Block für reine Text-/Subtext-/Speaker-/Choice-Edits
 *    (kompatibel zu `scripts/import-dialogs.mjs`).
 *  - Strukturierte Anweisungen für Splits / Merges / Inserts.
 */
export function DialogEditOverlay() {
  useDialogPatchTick();
  useTextPatchTick();
  const editing = useEditActive();
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const all = getAllPatches();
  const stats = patchStats(all);
  const textAll = getAllTextPatches();
  const tStats = textPatchStats(textAll);

  const buildReport = () => {
    const lines: string[] = [];
    lines.push(
      `# Dialog-Edit-Report (${stats.trees} Dialoge · ${stats.fields} Felder · ${stats.splits} Splits · ${stats.merges} Merges · ${stats.inserts} Inserts)`,
    );
    lines.push("");

    // YAML-kompatibler Block für Field-Edits (text / subtext / speaker /
    // choices[].text). Reicht für `node scripts/import-dialogs.mjs`.
    const yamlTrees: string[] = [];
    yamlTrees.push("## YAML-Edits (für scripts/import-dialogs.mjs)");
    yamlTrees.push("```yaml");
    let anyYaml = false;
    for (const treeId of Object.keys(all)) {
      const p = all[treeId];
      const fieldLineIds = Object.keys(p.fields);
      if (fieldLineIds.length === 0) continue;
      anyYaml = true;
      yamlTrees.push(`- tree: ${treeId}`);
      yamlTrees.push(`  lines:`);
      for (const lid of fieldLineIds) {
        const f = p.fields[lid];
        yamlTrees.push(`    - id: ${lid}`);
        if (typeof f.text === "string")
          yamlTrees.push(`      text: ${JSON.stringify(f.text)}`);
        if (typeof f.subtext === "string")
          yamlTrees.push(`      subtext: ${JSON.stringify(f.subtext)}`);
        if (f.speaker)
          yamlTrees.push(`      speaker: ${f.speaker}`);
        if (f.choices) {
          yamlTrees.push(`      choices:`);
          for (const idx of Object.keys(f.choices)) {
            yamlTrees.push(`        - index: ${idx}`);
            yamlTrees.push(
              `          text: ${JSON.stringify(f.choices[Number(idx)].text)}`,
            );
          }
        }
      }
    }
    yamlTrees.push("```");
    if (anyYaml) lines.push(...yamlTrees, "");

    // Strukturelle Änderungen menschenlesbar.
    let anyStruct = false;
    const structOut: string[] = [];
    structOut.push("## Strukturelle Änderungen");
    for (const treeId of Object.keys(all)) {
      const p = all[treeId];
      if (p.ops.length === 0) continue;
      anyStruct = true;
      const original = dialogs[treeId];
      structOut.push("");
      structOut.push(`### ${treeId}`);
      // Vorher → Nachher pro Op.
      for (const op of p.ops) {
        if (op.kind === "split") {
          structOut.push(
            `- SPLIT \`${op.at}\` → ${op.parts.length} Teile:`,
          );
          op.parts.forEach((t, i) => {
            const newId =
              i === 0 ? op.at : `${op.at}__split_${i + 1}`;
            structOut.push(
              `    - \`${newId}\`: ${JSON.stringify(t)}`,
            );
          });
          structOut.push(
            `    Routing: ${op.parts
              .map((_, i) => (i === 0 ? op.at : `${op.at}__split_${i + 1}`))
              .join(" → ")}`,
          );
        } else if (op.kind === "merge") {
          const fromText = original?.lines[op.from]?.text ?? "?";
          structOut.push(
            `- MERGE \`${op.from}\` → \`${op.into}\` (Text angehängt: ${JSON.stringify(fromText)}, Zeile entfernt, next umgebogen).`,
          );
        } else if (op.kind === "insertAfter") {
          structOut.push(
            `- INSERT nach \`${op.after}\`: speaker=${op.speaker}, text=${JSON.stringify(op.text)}`,
          );
        }
      }

      // Endzustand der Lines (nach allen Ops + Field-Overrides) als Referenz.
      if (original) {
        const patched = applyPatch(original, p);
        structOut.push("");
        structOut.push(`  Endzustand der Lines (nach allen Ops + Edits):`);
        for (const lid of Object.keys(patched.lines)) {
          const l = patched.lines[lid];
          const next = l.next ? ` → ${l.next}` : l.end ? " · end" : "";
          structOut.push(
            `    - \`${lid}\` [${l.speaker}]${next}: ${JSON.stringify(l.text)}`,
          );
        }
      }
    }
    if (anyStruct) lines.push(...structOut);

    if (!anyYaml && !anyStruct) lines.push("_(keine Änderungen)_");

    // showText-Edits: pro Eintrag Original → Replacement, damit man im
    // Quellcode per Search-Replace patchen kann.
    const textKeys = Object.keys(textAll);
    if (textKeys.length > 0) {
      lines.push("");
      lines.push("## showText-Edits (api.showText-Overlays)");
      for (const k of textKeys) {
        const p = textAll[k];
        const dirty = p.replacement
          .map((r, i) => (r !== p.original[i] ? i : -1))
          .filter((i) => i >= 0);
        if (dirty.length === 0) continue;
        lines.push("");
        lines.push(`### showText \`${k}\` (${dirty.length} geänderte Zeile(n))`);
        for (const i of dirty) {
          lines.push(`- Zeile ${i + 1}:`);
          lines.push(`  - vorher:  ${JSON.stringify(p.original[i])}`);
          lines.push(`  - nachher: ${JSON.stringify(p.replacement[i])}`);
        }
      }
    }

    return lines.join("\n");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard?.writeText(buildReport());
    } catch {
      /* ignore */
    }
  };

  const total =
    stats.fields + stats.splits + stats.merges + stats.inserts + tStats.lines;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Dev: Dialog-Editor"
        className="fixed bottom-4 left-64 z-[9998] flex h-10 items-center justify-center rounded-full border border-amber-glow/60 bg-background/80 px-3 font-mono-crt text-xs text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        DLG{editing ? " · an" : ""}
        {total > 0 ? ` · ${total}` : ""}
      </button>

      {open && (
        <div className="fixed bottom-16 left-4 z-[9999] w-[360px] rounded-sm border border-amber-glow/60 bg-background p-3 shadow-[0_0_60px_rgba(0,0,0,0.85)] font-mono-crt text-xs text-foreground">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-glow">
              Dialog-Editor
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-amber-glow"
            >
              ✕
            </button>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditActive(!isEditActive())}
              className={
                "rounded-sm border px-2 py-1 " +
                (editing
                  ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                  : "border-amber-glow/40 hover:bg-amber-glow/10")
              }
            >
              {editing ? "Edit aktiv" : "Edit starten"}
            </button>
            <span className="text-[10px] text-muted-foreground">
              {stats.trees} Dialoge · {stats.fields}F · {stats.splits}S ·{" "}
              {stats.merges}M · {stats.inserts}I · {tStats.lines}T
            </span>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              {showReport ? "Report aus" : "Report"}
            </button>
            <button
              type="button"
              onClick={copyReport}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              Report kopieren
            </button>
            <button
              type="button"
              onClick={() => {
                if (!confirm("Alle Dialog-Patches verwerfen?")) return;
                clearAllPatches();
                clearAllTextPatches();
              }}
              className="ml-auto rounded-sm border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
            >
              Reset
            </button>
          </div>

          {showReport && (
            <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-sm border border-amber-glow/30 bg-black/40 p-2 text-[10px] leading-tight">
              {buildReport()}
            </pre>
          )}

          <div className="mt-2 text-[10px] text-muted-foreground">
            Tipp: „Edit starten" → im laufenden Dialog Text/Sprecher/Choice
            direkt ändern, mit ✂ 1/2 · 1/3 · 2/3 splitten oder ⨯ in die
            Vorgängerzeile mergen. Caret im Textfeld hat Vorrang. Änderungen
            persistieren (localStorage), Report als Commit für den Chat
            kopieren.
          </div>
        </div>
      )}
    </>
  );
}