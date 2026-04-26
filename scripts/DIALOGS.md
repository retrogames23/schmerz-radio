# Dialoge bearbeiten

Alle Dialogtexte des Spiels lassen sich als YAML-Datei exportieren,
offline editieren und anschließend wieder zurückspielen — ohne dass
die Spiellogik kaputtgeht.

## Export

```bash
node scripts/export-dialogs.mjs            # → /mnt/documents/dialogs.yaml
node scripts/export-dialogs.mjs out.yaml   # eigener Pfad
```

## Bearbeiten

Öffne die YAML-Datei in einem Texteditor.

| Feld | Bearbeitbar? |
|---|---|
| `text` | Ja |
| `subtext` (Schmerz-Radio-Einblendung) | Ja |
| `speaker` | Ja, nur aus erlaubter Liste (siehe `src/game/types.ts → DialogLine.speaker`) |
| `choices[].text` | Ja |
| `id`, `__next`, `__requires`, `__hiddenWhen`, `__end`, `__hasAction`, `__hasOnEnd`, `__requiresRadio`, `index` | **Nein** — werden ignoriert, dienen nur als Kontext |

Felder mit `__`-Präfix werden beim Re-Import nicht angefasst. Lass sie
drin, damit du beim nächsten Export weiterhin den Kontext siehst (z.B.
„diese Zeile zeigt sich nur, wenn `metPhilippeBefore` gesetzt ist“).

## Re-Import

```bash
node scripts/import-dialogs.mjs dialogs.yaml
```

Das Skript meldet:
- wie viele Zeilen / Felder geändert wurden
- Warnungen für Bäume oder Zeilen-IDs, die im Code nicht (mehr) existieren

`src/game/dialogs.ts` wird in-place überschrieben. Anschließend einmal
den Build laufen lassen, um sicherzugehen:

```bash
bun run build
```