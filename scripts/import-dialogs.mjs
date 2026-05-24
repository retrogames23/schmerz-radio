#!/usr/bin/env node
/**
 * Imports a (possibly edited) dialogs.yaml back into src/game/dialogs.ts.
 *
 * Only updates these fields per dialog line:
 *   - text
 *   - subtext
 *   - speaker
 *   - choices[].text
 *
 * All logic (next, requires, hiddenWhen, action, onEnd, end) is left
 * untouched. Lines / trees that no longer exist in the YAML are skipped
 * with a warning — text is never silently deleted from the code file.
 *
 * Usage:  node scripts/import-dialogs.mjs <path-to-dialogs.yaml>
 */
import { Project, SyntaxKind, QuoteKind } from "ts-morph";
import YAML from "yaml";
import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";

const SRC_DIR = "src/game/dialogs";
const inPath = process.argv[2];
if (!inPath) {
  console.error("Usage: node scripts/import-dialogs.mjs <dialogs.yaml>");
  process.exit(1);
}

const yamlText = readFileSync(inPath, "utf8");
const data = YAML.parse(yamlText);
if (!Array.isArray(data)) {
  console.error("YAML root must be a list of dialog trees.");
  process.exit(1);
}

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  manipulationSettings: { quoteKind: QuoteKind.Double },
});

// Load all dialog source files (split by NPC / location).
const sourceFiles = readdirSync(SRC_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "_helpers.ts" && f !== "lookup.ts")
  .map((f) => project.addSourceFileAtPath(`${SRC_DIR}/${f}`));

const touchedFiles = new Set();

/**
 * Find a dialog tree by name across all dialog files. Trees live as object
 * literal values inside a record variable like `export const philippeDialogs:
 * Record<string, DialogTree> = { philippeInCorridor56: { ... }, ... }`.
 */
function findTree(name) {
  for (const sf of sourceFiles) {
    for (const v of sf.getVariableDeclarations()) {
      const init = v.getInitializer();
      if (!init || init.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;
      const prop = init
        .getProperties()
        .find(
          (p) =>
            p.getKind() === SyntaxKind.PropertyAssignment &&
            p.getName().replace(/['"]/g, "") === name,
        );
      if (prop) {
        touchedFiles.add(sf);
        return prop.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      }
    }
  }
  return null;
}

function findLine(treeObj, lineId) {
  const linesProp = treeObj.getProperty("lines");
  if (!linesProp) return null;
  const linesObj = linesProp.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
  const prop = linesObj
    .getProperties()
    .find(
      (p) =>
        p.getKind() === SyntaxKind.PropertyAssignment &&
        p.getName().replace(/['"]/g, "") === lineId,
    );
  if (!prop) return null;
  return prop.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
}

/** Wrap a string as a TS string literal. Use template if it contains both
 *  quotes, otherwise prefer double quotes. */
function tsLiteral(s) {
  if (typeof s !== "string") return JSON.stringify(s);
  // Use template literal for multi-line text (preserves newlines visually)
  if (s.includes("\n")) {
    const escaped = s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    return "`" + escaped + "`";
  }
  // Otherwise JSON.stringify gives a safe double-quoted literal
  return JSON.stringify(s);
}

function setOrInsertString(objLit, propName, value) {
  const existing = objLit.getProperty(propName);
  const literal = tsLiteral(value);
  if (existing) {
    if (existing.getKind() === SyntaxKind.PropertyAssignment) {
      existing.setInitializer(literal);
    }
  } else {
    objLit.addPropertyAssignment({ name: propName, initializer: literal });
  }
}

let stats = {
  treesUpdated: 0,
  linesUpdated: 0,
  fieldsChanged: 0,
  warnings: [],
};

for (const tree of data) {
  if (!tree || typeof tree !== "object") continue;
  const treeName = tree.tree ?? tree.id;
  if (!treeName) continue;
  const treeObj = findTree(treeName);
  if (!treeObj) {
    stats.warnings.push(`Tree not found in code: ${treeName}`);
    continue;
  }
  let treeTouched = false;

  const lines = Array.isArray(tree.lines) ? tree.lines : [];
  for (const line of lines) {
    if (!line || typeof line !== "object") continue;
    const lineId = line.id;
    if (!lineId) continue;
    const lineObj = findLine(treeObj, lineId);
    if (!lineObj) {
      stats.warnings.push(`Line not found: ${treeName}.${lineId}`);
      continue;
    }

    let lineTouched = false;

    for (const field of ["text", "subtext", "speaker"]) {
      if (typeof line[field] === "string") {
        const cur = (() => {
          const p = lineObj.getProperty(field);
          if (!p || p.getKind() !== SyntaxKind.PropertyAssignment) return null;
          const init = p.getInitializer();
          if (!init) return null;
          if (
            init.getKind() === SyntaxKind.StringLiteral ||
            init.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
          ) {
            return init.getLiteralText();
          }
          return null;
        })();
        if (cur !== line[field]) {
          setOrInsertString(lineObj, field, line[field]);
          stats.fieldsChanged++;
          lineTouched = true;
        }
      }
    }

    if (Array.isArray(line.choices)) {
      const choicesProp = lineObj.getProperty("choices");
      if (choicesProp) {
        const arr = choicesProp.getInitializer();
        if (arr && arr.getKind() === SyntaxKind.ArrayLiteralExpression) {
          const elements = arr.getElements();
          for (const yamlChoice of line.choices) {
            const idx =
              typeof yamlChoice.index === "number" ? yamlChoice.index : -1;
            if (idx < 0 || idx >= elements.length) {
              stats.warnings.push(
                `Choice index out of range: ${treeName}.${lineId}#${idx}`,
              );
              continue;
            }
            const ce = elements[idx];
            if (ce.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;
            if (typeof yamlChoice.text === "string") {
              const p = ce.getProperty("text");
              const cur =
                p && p.getKind() === SyntaxKind.PropertyAssignment
                  ? p.getInitializer()?.getLiteralText?.() ?? null
                  : null;
              if (cur !== yamlChoice.text) {
                setOrInsertString(ce, "text", yamlChoice.text);
                stats.fieldsChanged++;
                lineTouched = true;
              }
            }
          }
        }
      }
    }

    if (lineTouched) {
      stats.linesUpdated++;
      treeTouched = true;
    }
  }

  if (treeTouched) stats.treesUpdated++;
}

for (const sf of touchedFiles) sf.saveSync();

console.log(
  `✓ Re-Import abgeschlossen: ${stats.treesUpdated} Bäume, ${stats.linesUpdated} Zeilen, ${stats.fieldsChanged} Felder geändert.`,
);
if (stats.warnings.length) {
  console.log("\nWarnungen:");
  for (const w of stats.warnings) console.log("  - " + w);
}