import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { jsPDF } from "jspdf";
import { resolveSceneImage } from "./sceneImages";
import type { SpokenLine } from "./llmAdventure";
import type { DsaCharacterSummary } from "@/game/types";

/**
 * Eine Wende im Transkript — entweder eine Meister-Wende mit
 * Sprechzeilen und optionalem Szenenbild, oder eine Spieler-Wende.
 */
export type ExportTurn =
  | { kind: "master"; lines: SpokenLine[]; sceneTag: string | null }
  | { kind: "player"; text: string };

export interface ExportPayload {
  character: DsaCharacterSummary;
  settingTitle: string;
  endingLabel: string;
  turns: ExportTurn[];
}

function speakerLabel(s: SpokenLine["speaker"]): string {
  if (s === "TJARK") return "Tjark (Meister)";
  if (s === "BREM") return "Brem";
  return "Yelva";
}

function baseFilename(p: ExportPayload): string {
  const safe = p.character.name.replace(/[^a-z0-9_-]+/gi, "_");
  const date = new Date().toISOString().slice(0, 10);
  return `dsa-${safe}-${date}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface LoadedImage {
  bytes: Uint8Array;
  width: number;
  height: number;
  dataUrl: string;
}

async function loadImage(tag: string): Promise<LoadedImage | null> {
  const src = resolveSceneImage(tag);
  if (!src) return null;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // Bilddimensionen über ein temporäres <img>.
    const dataUrl = await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.readAsDataURL(new Blob([buf], { type: "image/jpeg" }));
    });
    const { width, height } = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );
    return { bytes, width, height, dataUrl };
  } catch {
    return null;
  }
}

/** Lädt einmalig jedes vorkommende Szenenbild. */
async function loadImagesForTurns(
  turns: ExportTurn[],
): Promise<Map<string, LoadedImage>> {
  const tags = new Set<string>();
  for (const t of turns) {
    if (t.kind === "master" && t.sceneTag) tags.add(t.sceneTag);
  }
  const entries = await Promise.all(
    [...tags].map(async (tag) => [tag, await loadImage(tag)] as const),
  );
  const map = new Map<string, LoadedImage>();
  for (const [tag, img] of entries) {
    if (img) map.set(tag, img);
  }
  return map;
}

// ────────────────────────────────────────────────────────────────────
// DOCX
// ────────────────────────────────────────────────────────────────────

export async function exportAdventureAsDocx(p: ExportPayload): Promise<void> {
  const images = await loadImagesForTurns(p.turns);

  const children: Paragraph[] = [];
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `Tafelrunde: ${p.character.name}` })],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${p.character.className} · ${p.settingTitle}`, italics: true }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: p.endingLabel, bold: true })],
    }),
    new Paragraph({ children: [new TextRun({ text: "" })] }),
  );

  let lastTag: string | null = null;
  for (const t of p.turns) {
    if (t.kind === "master") {
      if (t.sceneTag && t.sceneTag !== lastTag) {
        const img = images.get(t.sceneTag);
        if (img) {
          // Auf ~480px Breite skalieren, Höhe proportional.
          const targetW = 480;
          const targetH = Math.round((img.height / img.width) * targetW);
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  type: "jpg",
                  data: img.bytes,
                  transformation: { width: targetW, height: targetH },
                  altText: {
                    title: t.sceneTag,
                    description: `Szene: ${t.sceneTag}`,
                    name: t.sceneTag,
                  },
                }),
              ],
            }),
          );
          lastTag = t.sceneTag;
        }
      }
      for (const line of t.lines) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${speakerLabel(line.speaker)}: `, bold: true }),
              new TextRun({ text: line.text }),
            ],
          }),
        );
      }
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${p.character.name}: `, bold: true, italics: true }),
            new TextRun({ text: t.text, italics: true }),
          ],
        }),
      );
    }
    children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  }

  const doc = new Document({
    creator: "Schmerz-Radio DSA",
    title: `Tafelrunde ${p.character.name}`,
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${baseFilename(p)}.docx`);
}

// ────────────────────────────────────────────────────────────────────
// PDF
// ────────────────────────────────────────────────────────────────────

export async function exportAdventureAsPdf(p: ExportPayload): Promise<void> {
  const images = await loadImagesForTurns(p.turns);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`Tafelrunde: ${p.character.name}`, margin, y);
  y += 24;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text(`${p.character.className} · ${p.settingTitle}`, margin, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(p.endingLabel, margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let lastTag: string | null = null;
  for (const t of p.turns) {
    if (t.kind === "master") {
      if (t.sceneTag && t.sceneTag !== lastTag) {
        const img = images.get(t.sceneTag);
        if (img) {
          const w = contentW;
          const h = (img.height / img.width) * w;
          ensureSpace(h + 10);
          doc.addImage(img.dataUrl, "JPEG", margin, y, w, h);
          y += h + 10;
          lastTag = t.sceneTag;
        }
      }
      for (const line of t.lines) {
        const label = `${speakerLabel(line.speaker)}: `;
        const full = `${label}${line.text}`;
        const wrapped = doc.splitTextToSize(full, contentW);
        const lineH = 14;
        for (const w of wrapped) {
          ensureSpace(lineH);
          doc.text(w, margin, y);
          y += lineH;
        }
        y += 4;
      }
    } else {
      doc.setFont("helvetica", "italic");
      const full = `${p.character.name}: ${t.text}`;
      const wrapped = doc.splitTextToSize(full, contentW);
      const lineH = 14;
      for (const w of wrapped) {
        ensureSpace(lineH);
        doc.text(w, margin, y);
        y += lineH;
      }
      doc.setFont("helvetica", "normal");
      y += 6;
    }
  }

  const blob = doc.output("blob");
  triggerDownload(blob, `${baseFilename(p)}.pdf`);
}