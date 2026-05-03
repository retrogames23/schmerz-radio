# Bürokratie-Duell als Pflichtteil von Akt I

## 0. Vorab-Fix: Sprechblasen Kantine 3602
`src/game/scenes/communalE67.ts`:
- `kowalkSpot`: x von 13 → ~30 (Figur ist im neuen Bild deutlich rechter).
- `brustSpot`: x von 77 → ~65.
- `vossbeckSpot`: Position gegen das aktuelle Hintergrundbild prüfen, ggf. nachjustieren.

## 1. Verzahnung in den Hauptstrang

Insas **Tilla-Quittung 4317-K** wird über die Rohrpost in 3602 nur akzeptiert bei:
- `duelEndgameWon` (Vossbeck geschlagen) **oder**
- `usedForgeryRoute` (Kowalks Notausgang nach 3 Niederlagen).

`gotB3Authorization` ist **kein** gültiger Weg für 4317-K. Damit muss jeder Spieler das Duell mindestens versuchen.

## 2. Versuchs-Logik

Drei Endduell-Versuche bei Vossbeck. Jeder verlorene Versuch übernimmt den Konter-Paragraph ins Notizbuch. Erst nach dem dritten verlorenen Versuch:
- `duelLost = true`
- Vossbeck zieht sich endgültig zurück
- Kowalk tritt an Layard heran, bietet die Fälschung an (`kowalkOfferedForgery`).

## 3. Notausgang & sein Preis

- Combine zur gefälschten Quittung (Bleistift-Stummel + Blanko + Siegelabdruck + Aushang E71) erst möglich, wenn `kowalkOfferedForgery` gesetzt ist. Erfolgreiches Combine setzt `usedForgeryRoute`.
- Notausgang löst **nur** Insas 4317-K. Philippes B3-Ration bleibt verloren — Layard muss Philippe absagen.
- Optionaler Akt-II-Halbsatz Insas, falls `usedForgeryRoute`: leise, kein Vorwurf.

## 4. Geänderte Dateien

- `src/game/scenes/communalE67.ts` — Hotspot-Fix
- `src/game/types.ts` — neue Flags: `needsMarteauAuthForTilla`, `vossbeckAttempts`, `duelLost`, `kowalkOfferedForgery`, `usedForgeryRoute`
- `src/game/bureaucracyDuel.ts` — Versuchszähler, Lerngewinn, `duelLost`-Trigger
- `src/game/dialogs/cafeteria.ts` — Vossbeck-Abschiedszeilen pro Versuch, Kowalk-Notausgang-Dialog, Pneumatik-Gate
- `src/game/dialogs/insa.ts` — Auftrags-Erklärung präziser, optionaler Akt-II-Halbsatz
- `src/game/dialogs/philippe.ts` — neue Frage-Option bei `needsMarteauAuthForTilla`
- `src/game/combine.ts` — Forgery-Combine an `kowalkOfferedForgery` koppeln
- `src/game/hints.ts` — Schritt 13 in 13a/13b, Duell-Hints entoptionalisieren, `act1.duelLostFallback`

## 5. Reihenfolge

1. Hotspot-Fix Kantine
2. Flags & Counter
3. `bureaucracyDuel.ts`
4. Dialoge (cafeteria, philippe, insa)
5. Combine
6. Hints
