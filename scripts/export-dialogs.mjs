#!/usr/bin/env node
/**
 * Exports all dialog text from src/game/dialogs.ts into a human-readable
 * YAML file. Only text-bearing fields are exported; logic (callbacks,
 * requires, hiddenWhen, next, action, onEnd) is preserved as comments
 * for context but ignored on re-import.
 *
 * Usage:  node scripts/export-dialogs.mjs [outPath]
 * Default outPath: /mnt/documents/dialogs.yaml
 */
import { Project, SyntaxKind } from "ts-morph";
import YAML from "yaml";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SRC = "src/game/dialogs.ts";
const OUT = process.argv[2] ?? "/mnt/documents/dialogs.yaml";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sf = project.addSourceFileAtPath(SRC);

function getStringProp(obj, name) {
  const p = obj.getProperty(name);
  if (!p || p.getKind() !== SyntaxKind.PropertyAssignment) return undefined;
  const init = p.getInitializer();
  if (!init) return undefined;
  const k = init.getKind();
  if (
    k === SyntaxKind.StringLiteral ||
    k === SyntaxKind.NoSubstitutionTemplateLiteral
  ) {
    return init.getLiteralText();
  }
  return undefined;
}

function getBoolProp(obj, name) {
  const p = obj.getProperty(name);
  if (!p) return undefined;
  const init = p.getInitializer();
  if (!init) return undefined;
  if (init.getKind() === SyntaxKind.TrueKeyword) return true;
  if (init.getKind() === SyntaxKind.FalseKeyword) return false;
  return undefined;
}

function getArrayPropAsStrings(obj, name) {
  const p = obj.getProperty(name);
  if (!p) return undefined;
  const init = p.getInitializer();
  if (!init || init.getKind() !== SyntaxKind.ArrayLiteralExpression)
    return undefined;
  return init
    .getElements()
    .map((e) =>
      e.getKind() === SyntaxKind.StringLiteral ? e.getLiteralText() : null,
    )
    .filter(Boolean);
}

function extractChoices(linesObj) {
  // For each line, look for `choices: [...]` and extract `text` of each.
  // Returns choice text only (logic stays in code).
}

function parseLine(lineProp) {
  const obj = lineProp.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
  const id = getStringProp(obj, "id") ?? lineProp.getName().replace(/['"]/g, "");
  const speaker = getStringProp(obj, "speaker");
  const text = getStringProp(obj, "text");
  const subtext = getStringProp(obj, "subtext");
  const next = getStringProp(obj, "next");
  const end = getBoolProp(obj, "end");
  const requires = getArrayPropAsStrings(obj, "requires");
  const hiddenWhen = getArrayPropAsStrings(obj, "hiddenWhen");

  // Choices
  let choices;
  const choicesProp = obj.getProperty("choices");
  if (choicesProp) {
    const arr = choicesProp.getInitializer();
    if (arr && arr.getKind() === SyntaxKind.ArrayLiteralExpression) {
      choices = arr.getElements().map((el, idx) => {
        if (el.getKind() !== SyntaxKind.ObjectLiteralExpression) {
          return { index: idx, text: "<non-literal choice>" };
        }
        const cText = getStringProp(el, "text") ?? "";
        const cNext = getStringProp(el, "next");
        const cReq = getArrayPropAsStrings(el, "requires");
        const cHid = getArrayPropAsStrings(el, "hiddenWhen");
        const cRadio = getBoolProp(el, "requiresRadio");
        const hasAction = !!el.getProperty("action");
        const out = { index: idx, text: cText };
        if (cNext) out.__next = cNext;
        if (cReq) out.__requires = cReq;
        if (cHid) out.__hiddenWhen = cHid;
        if (cRadio) out.__requiresRadio = true;
        if (hasAction) out.__hasAction = true;
        return out;
      });
    }
  }

  const out = { id };
  if (speaker) out.speaker = speaker;
  if (text !== undefined) out.text = text;
  if (subtext !== undefined) out.subtext = subtext;
  if (next) out.__next = next;
  if (end) out.__end = true;
  if (requires) out.__requires = requires;
  if (hiddenWhen) out.__hiddenWhen = hiddenWhen;
  if (choices) out.choices = choices;
  return out;
}

function parseTree(treeProp) {
  const treeName = treeProp.getName().replace(/['"]/g, "");
  const obj = treeProp.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
  const id = getStringProp(obj, "id") ?? treeName;
  const start = getStringProp(obj, "start");
  const hasOnEnd = !!obj.getProperty("onEnd");

  const linesProp = obj.getPropertyOrThrow("lines");
  const linesObj = linesProp.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  const lines = linesObj
    .getProperties()
    .filter((p) => p.getKind() === SyntaxKind.PropertyAssignment)
    .map(parseLine);

  return {
    tree: treeName,
    id,
    start,
    __hasOnEnd: hasOnEnd,
    lines,
  };
}

// Find: export const dialogs: Record<string, DialogTree> = { ... }
const dialogsVar = sf
  .getVariableDeclarations()
  .find((v) => v.getName() === "dialogs");
if (!dialogsVar) {
  console.error("Could not find `dialogs` export in", SRC);
  process.exit(1);
}
const dialogsObj = dialogsVar.getInitializerIfKindOrThrow(
  SyntaxKind.ObjectLiteralExpression,
);

const trees = dialogsObj
  .getProperties()
  .filter((p) => p.getKind() === SyntaxKind.PropertyAssignment)
  .map(parseTree);

// Build YAML — keep "__"-prefixed fields as read-only context for the editor.
const doc = new YAML.Document();
doc.commentBefore = [
  " Dialog-Export für Adventure Whisper Quest",
  "",
  " Bearbeitbar: text, subtext, choices[].text, speaker",
  " Read-only (mit __ prefix): __next, __requires, __hiddenWhen, __end,",
  "                            __requiresRadio, __hasAction, __hasOnEnd",
  " Diese Felder werden beim Re-Import ignoriert. Nicht entfernen — sie",
  " geben dir den Kontext (z.B. unter welcher Bedingung eine Zeile zeigt).",
  "",
  " Re-Import:  node scripts/import-dialogs.mjs <pfad-zur-bearbeiteten-datei>",
].join("\n");
doc.contents = trees;

const yamlText = String(doc);

mkdirSync(dirname(resolve(OUT)), { recursive: true });
writeFileSync(OUT, yamlText, "utf8");

const lineCount = trees.reduce((n, t) => n + t.lines.length, 0);
console.log(
  `✓ Exportiert: ${trees.length} Dialogbäume, ${lineCount} Zeilen → ${OUT}`,
);