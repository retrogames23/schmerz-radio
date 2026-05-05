import type { FsNode } from "@/game/filesystemWorag";
import type { StoryFlag } from "@/game/types";

export interface Line {
  text: string;
  kind?: "in" | "out" | "system";
}

/** Aktuelle CentralOS-Versionsbezeichnung, abhängig vom Update-Flag.
 *  Bodos Rechner läuft vor dem Update auf altem v2.0; das sysupdate hebt
 *  beide Maschinen auf die gleiche Sektor-Version v2.3.1. */
export function osVersion(updated: boolean, bodo = false): string {
  if (updated) return "2.3.1";
  return bodo ? "2.0" : "2.3";
}

/**
 * Ersetzt statische Versions-Strings in Datei-/Banner-Texten durch die
 * aktuell installierte CentralOS-Version. Greift nur, wenn das Update
 * eingespielt wurde — vorher bleiben die Originaltexte unverändert.
 */
export function applyOsVersion(text: string, updated: boolean): string {
  if (!updated) return text;
  return text
    .replace(/CentralOS v2\.3(?!\.\d)/g, "CentralOS v2.3.1")
    .replace(/CENTRALOS v2\.3(?!\.\d)/g, "CENTRALOS v2.3.1");
}

/** Filter children by visibility (hidden files only with -a, locked files only when flag is set). */
export function visibleChildren(
  node: FsNode,
  showAll: boolean,
  hasFlag: (f: StoryFlag) => boolean,
): FsNode[] {
  if (node.type !== "dir") return [];
  return node.children.filter((c) => {
    if (c.type === "file" && c.requires && !hasFlag(c.requires as StoryFlag))
      return false;
    if (!showAll && c.name.startsWith(".")) return false;
    return true;
  });
}

export function formatLs(children: FsNode[]): Line[] {
  if (!children.length) return [{ text: "  (leer)", kind: "out" }];
  return children.map((c) => {
    if (c.type === "dir") {
      return { text: `  ${c.name.padEnd(28)} <DIR>`, kind: "system" } as Line;
    }
    const size = (c.size ?? 0).toString().padStart(6, " ");
    const date = (c.date ?? "—").padEnd(12, " ");
    return {
      text: `  ${c.name.padEnd(28)} ${size}  ${date}`,
      kind: "out",
    } as Line;
  });
}

export function buildTree(
  node: FsNode,
  hasFlag: (f: StoryFlag) => boolean,
  prefix = "",
): string[] {
  const out: string[] = [];
  if (node.type !== "dir") return [`${prefix}${node.name}`];
  const kids = visibleChildren(node, false, hasFlag);
  kids.forEach((child, i) => {
    const last = i === kids.length - 1;
    const branch = last ? "└── " : "├── ";
    const label = child.type === "dir" ? `${child.name}/` : child.name;
    out.push(`${prefix}${branch}${label}`);
    if (child.type === "dir") {
      const nextPrefix = prefix + (last ? "    " : "│   ");
      out.push(...buildTree(child, hasFlag, nextPrefix));
    }
  });
  return out;
}

/** Longest common string prefix across all candidates. */
export function commonPrefix(strs: string[]): string {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}
