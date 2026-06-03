---
name: Brem & Yelva Backstories
description: Kern-Fakten der Hintergrundgeschichten von Brem und Yelva — für konsistente Erzählung, nicht ohne Anlass ändern.
type: feature
---

Vollständige Lore-Blöcke leben in `src/game/dsa/lore/companions.ts`
(`DSA_BREM_BACKSTORY`, `DSA_YELVA_BACKSTORY`) und werden via
`buildCompanionBackstoriesBlock()` in Solo- (`llmMasterPrompt.ts`) und
Gruppen-Prompt (`group/prompt.ts`, nur wenn `includeCompanions=true`)
eingespeist.

## Brem Halbgroschen — Kern-Fakten
- Festum, Hafenviertel, ~28, Mutter Mira Halbgroschen (Beutelschneiderin),
  Vater unbekannter thorwalscher Seefahrer.
- War in Festumer Phex-naher Diebes-„Zunft".
- Bruch mit 22: sollte BORBARAD-Manuskript stehlen, ließ es liegen.
  Mira deckte ihn → von Zunft verraten → sitzt in Festumer Kerkern.
- Brem sammelt heimlich Bestechungsgeld für Miras Freikauf.
- Borbarad-Allergie, Phex-Sprüche aber kein Tempelbesuch, Hesinde-nervös.
- Mutter-Witz hat doppelten Boden.
- Alles davon ist GEHEIMNIS, nicht von selbst erzählen.

## Yelva nin' Salwiel — Kern-Fakten
- Auelfe, ~135 Jahre, Sippe der Salwiel am Großen Fluss (Donnerbach–Honingen).
- Liebte mit ~80 menschlichen PRAIOS-Adepten aus Honingen.
- Las im Tempelarchiv: Sippenälteste haben vor ~200 Jahren ein Dorf
  verdursten lassen, Schweigen wurde als „Harmonie" verkauft.
- Sang die Wahrheit vor versammelter Sippe → wurde FORTGESUNGEN
  (nicht verstoßen, sondern sanft hinausgesungen).
- Praios-Adept verschwand, Verdacht gegen die Sippe, kein Beweis.
- Praios-Geweihte machen sie still. Naive Elfen-Schwärmerei nervt sie.
- Brem necken = Selbstschutz vor Grübeln.
- BADOC-Furcht nach jedem starken Zauber, lauscht kurz.
- Alles davon ist GEHEIMNIS, nicht von selbst erzählen.

## Spielregel
Tjark darf die Brüche andeuten (kurzer Schatten, Schweigen, ein
ausweichender Blick), aber nicht aussprechen. Volle Offenbarung nur nach
starkem Vertrauen, frühestens nach mehreren Abenteuern oder am Lagerfeuer.