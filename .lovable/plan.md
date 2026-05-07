## Ziel

1. Layard startet mit **3 Reichsmark** im Inventar.
2. Im Kondomautomat („Zum stillen Funk") sind alle drei Reihen klickbar — Kondom, Pfefferminz, OP-Maske.
3. Jeder Kauf kostet **1 RM**. Reicht das Geld nicht, bleibt der Knopf gesperrt mit kurzem Hinweis.
4. Pfefferminz und Kondom landen als eigene Items im Inventar (zunächst ohne weitere Spielfunktion).
5. Ein paar NPCs bekommen je eine kleine zusätzliche Dialog-Option, wenn Layard Pfefferminz oder Kondom dabei hat — reines Flavor.

---

## Änderungen im Detail

### Geld als zählbares Inventar-Item

Inventar-Items sind aktuell unique (per `id`). Für Münzen braucht es eine Stückzahl. Saubere Lösung:

- `InventoryItem` bekommt optionales `count?: number` (Default: 1).
- `api.addItem` merged Counts, wenn das Item schon liegt.
- Neue API `api.removeItem(id, n=1)` zieht ab und entfernt den Eintrag bei 0.
- `api.getItemCount(id)` für „habe ich noch genug?".
- `Inventory.tsx`: zeigt bei `count > 1` ein kleines Zähler-Badge unten rechts auf dem Slot.
- `ItemIcon`: neues Reichsmark-Icon (Münzstapel, Bernstein/Kupfer-Töne).

### Neue Items

In `types.ts` `InventoryItemId` erweitern um:
- `reichsmark` — „Reichsmark" / „Drei Münzen aus Aluminiumbronze, abgegriffen. Reichswährung der zentralen Verwaltung."
- `peppermint` — „Pfefferminzkaugummi" / „Verstaubte Schachtel aus dem Kondomautomaten. Drei Streifen, papiertrocken."
- `condom` — „Kondom" / „Zellophanverpackt, Aufdruck »ELASTIC FORTUNA«. Aus dem Kondomautomaten im stillen Funk."

### Start-Inventar

In `GameContext.tsx` (gleicher `useEffect` wie Handbuch/Ausweis): bei Spielstart einmalig
`addItem({ id: "reichsmark", name: "Reichsmark", count: 3, description: ... })` — nur wenn noch nicht vorhanden (Save-kompatibel).

### Persistenz

`InventoryItem.count` wird automatisch persistiert, weil `inventory` schon komplett gespeichert wird. Keine zusätzliche Migration nötig — alte Saves haben einfach keinen `reichsmark`-Eintrag und kein `count`-Feld.

### CondomAutomatOverlay

Drei Reihen werden eigenständige Buttons mit derselben Optik wie die bestehende Reihe 3:

- Reihe 1 — **Kondom** · 1 RM → Item `condom`, Flag `tookCondomFromAutomat`
- Reihe 2 — **Pfefferminzkaugummi** · 1 RM → Item `peppermint`, Flag `tookPeppermintFromAutomat`
- Reihe 3 — **OP-Maske** · 1 RM → unverändert (nutzt vorhandene `tookMedMaskFromAutomat`-Flag/Item)

Gemeinsame Logik:
- `disabled`, wenn schon gekauft („Reihe X ist leer").
- `disabled`, wenn `getItemCount("reichsmark") < 1` mit Hinweis-Text „Keine Reichsmark mehr".
- Beim Kauf: `removeItem("reichsmark", 1)`, `addItem(...)`, Flag setzen, Overlay schließen, kurzes `showText` wie bisher („Layard wirft eine Reichsmark ein, dreht den Knopf von Reihe X. Es klackt …").

Neue Flags in `types.ts`:
- `tookCondomFromAutomat`
- `tookPeppermintFromAutomat`

### NPC-Dialog-Optionen (Flavor)

Klein und beiläufig, ohne Spielmechanik. Konkret:

- **Bram** (Kneipe, `dialogs/_helpers.ts`/Pub-Dialog): wenn `peppermint` im Inventar, Choice „Pfefferminz?" → Bram lehnt ab, kurzer Witz über Bier und Minze. Wenn `condom`, Choice „Soll ich dir ein Kondom hierlassen?" → Bram trocken: „Stell's neben das Schild ›Bitte nicht‹." Beide Choices verschwinden nach einmaligem Anwählen (`hiddenWhen`).
- **MARV-9** (Vorraum): wenn `peppermint`, Choice „Kaugummi?" → MARV: „Mein Schlund ist Bronze, Layard." Reines Flavor.

Die bestehenden Dialog-Trees werden minimal ergänzt; keine bestehenden Pfade verändert. Wenn weitere NPCs gewünscht sind, lassen sie sich später symmetrisch ergänzen.

---

## Geänderte/neue Dateien

- `src/game/types.ts` — neue `InventoryItemId`s, neue Flags, `InventoryItem.count?`, `GameApi.removeItem` / `getItemCount`.
- `src/game/GameContext.tsx` — `addItem` mit Count-Merge, `removeItem`, `getItemCount`, Start-Inventar.
- `src/components/game/Inventory.tsx` — Count-Badge.
- `src/components/game/ItemIcon.tsx` — Icons für `reichsmark`, `peppermint`, `condom`.
- `src/components/game/CondomAutomatOverlay.tsx` — drei Kauf-Buttons, gemeinsame Kauf-Logik.
- `src/game/dialogs/misc.ts` (oder die Datei mit Bram/MARV) — kleine Choice-Ergänzungen.

Keine DB-/Migrations-Änderung, keine neuen Bilder nötig.