# Aufräumen: Abhängigkeiten, Versionen, Assets

Geprüft: Paketliste, tatsächliche Verwendung im Code, Versionsstand, Bild-/Audio-Größen, Sicherheitsscan (keine hohen/kritischen Lücken).

## 1. Überflüssige Pakete entfernen (risikoarm)

- `nitro` und `vite-tsconfig-paths` stehen in der Paketliste, werden aber nirgends im Projekt aufgerufen. Beide bringt die Lovable-Vite-Konfiguration selbst mit. Entfernen, danach ein Build zur Kontrolle.
- Alles andere ist tatsächlich in Gebrauch: `docx`, `jspdf`, `blueimp-md5`, `framer-motion`, `@mlc-ai/web-llm`, `ts-morph`, `yaml`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`, Stripe- und E-Mail-Pakete. Nichts davon streichen.

## 2. Versions-Updates (in drei Stufen, jeweils mit Build-Prüfung)

Stufe A — unkritische Patch-/Minor-Sprünge, sofort:
React 19.3, `@supabase/supabase-js` 2.116, Tailwind 4.3, Stripe 22.6, `tailwind-merge` 3.6, `@types/*`, Prettier 3.9, `@mlc-ai/web-llm` 0.2.85, `@lovable.dev/cloud-auth-js` 1.2.

Stufe B — Plattform-Pakete, einzeln und nacheinander:
`@lovable.dev/vite-tanstack-config` 2.13 → 2.21, danach TanStack Router/Start auf den zugehörigen Stand. Diese drei hängen zusammen; erst die Konfiguration, dann Router und Start, nach jedem Schritt Build und ein Klick durch Spielstart, Terminal, Karte, DSA-Runde.

Stufe C — größere Hauptversionen, bewusst später oder gar nicht:
`framer-motion` 13, `lucide-react` 1.x, ESLint 10 samt Plugins, `@vitejs/plugin-react` 6, `globals` 17. Diese ändern Schnittstellen. Empfehlung: nur die Linter-Kette (ESLint 10 + Plugins) angehen, `framer-motion` und `lucide-react` auf dem jetzigen Stand lassen, solange sie funktionieren.

## 3. Bilder und Medien

`src/assets` liegt bei 51 MB. Auffällig:

- `src/assets/unused` (4,8 MB) — Entwurfsbilder, die im Spiel nicht vorkommen. Aus dem Projekt nehmen, Beschreibung in der README des Ordners sichern.
- Einzelbilder mit 1,4–1,5 MB (`scene-passage.jpg`, `scene-corridor-21.jpg`) und ein 688 KB großes PNG (`item-oil-can-scene.png`). Szenenbilder auf sinnvolle Breite verkleinern; erwartete Ersparnis grob die Hälfte des Bildvolumens ohne sichtbaren Qualitätsverlust.
- Mögliche Karteileichen, vor dem Löschen einzeln bestätigen (können dynamisch geladen sein): `bus/passenger-1..4.png`, `dsa/dsa-npc-tjark.jpg`, `npc-vossbeck.png`, `scene-bus-28.jpg`.

## 4. Sehr große Quelldateien (optional)

`Terminal.tsx` (99 KB), `libraryBooks.ts` (79 KB), `dsa/adventure.ts` (75 KB), `AmigaWorkbench.tsx` (64 KB), `dsa/combat.ts` (59 KB), `dsa-master.ts` (54 KB). Kein Fehler, aber jede Änderung dort wird teuer. Vorschlag: nur aufteilen, wenn ohnehin an der Stelle gearbeitet wird — keine eigene Großaktion.

## Reihenfolge

1. Punkt 1 (zwei Pakete raus)
2. Punkt 2 Stufe A
3. Punkt 3 (Bilder)
4. Punkt 2 Stufe B
5. Stufe C und Punkt 4 nur nach Absprache

Sag mir, ob ich alles bis Schritt 4 machen soll oder nur einzelne Punkte.
