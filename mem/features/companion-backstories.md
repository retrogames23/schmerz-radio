---
name: Brem & Yelva Backstories
description: Kern-Fakten der Hintergrundgeschichten von Brem und Yelva (e67-Modus) plus standalone-Variante ohne E67-Rahmen.
type: feature
---

Vollständige Lore-Blöcke leben in `src/game/dsa/lore/companions.ts`
(`DSA_BREM_BACKSTORY`, `DSA_YELVA_BACKSTORY`) und sind aufgeteilt in
`*_E67_FRAME` (Spieler-am-Tisch / Namens-Dualität) und `*_CORE_BACKSTORY`
(reiner Aventurien-Charakter). `getBremShort(mode)` / `getYelvaShort(mode)`
liefern die modusabhängige Variante. Eingespeist via
`buildCompanionBackstoriesBlock(mode)` in Solo- (`llmMasterPrompt.ts`) und
Gruppen-Prompt (`group/prompt.ts`, nur wenn `includeCompanions=true`).

## Runtime-Modus
- `e67` (Default) — klassischer Rahmen: Spieler „Layard" + Mitspieler
  Brem/Yelva am Tisch in Komplex E67, 1997. Outtime/Intime-Dualität aktiv.
  Tjark ist der erfahrene Spielleiter mit eigener Persönlichkeit.
- `standalone` — pure DSA3-Tafelrunde. Kein E67, kein Layard, keine
  Alter-Ego-Dualität. Brem/Yelva sind reine Aventurien-NSCs. Tjark ist
  nur "erfahrener Spielleiter mit perfekter DSA3-Kenntnis", ohne weitere
  Persönlichkeit. Outtime-Konzept bleibt nur für Regelfragen erhalten.
  Wird von `StandaloneDsaHost` gesetzt, via `DsaHostContext.dsaRuntimeMode`
  durchgereicht und vom Client an `/api/public/dsa-master` als `mode`
  mitgeschickt. Server reicht ihn an `buildStaticMasterLore(setting, mode)`
  und `buildDynamicMasterState({ ..., mode })` weiter.
  `localizeForMode()` in `llmMasterPrompt.ts` ersetzt zudem im statischen
  Lore-Block Begriffe wie "Layard", "Komplex E67", "Pizza", "Schule" durch
  neutrale Aventurien-Begriffe.

## Brem Halbgroschen — Kern-Fakten
- NAMENS-DUALITÄT: Spieler „Brem" (~16, E67, 1997) spielt Charakter
  „Brendan ‚Brem' Halbgroschen" (Streuner, ~28). Gleicher Spitzname,
  bewusst so gewählt. Outtime = Jugendlicher am Tisch, intime = Streuner.
- Festum, Hafenviertel, ~28, Mutter Mira Halbgroschen (Beutelschneiderin),
  Vater unbekannter thorwalscher Seefahrer.
- War in Festumer Phex-naher Diebes-„Zunft".
- Bruch mit 22: sollte verbotenes schwarzmagisches Pakt-Manuskript aus
  der Zeit der Magierkriege stehlen, ließ es liegen. Mira deckte ihn →
  von Zunft verraten → sitzt in Festumer Kerkern.
  HINWEIS: KEIN Borbarad-Manuskript (Borbarads Rückkehr erst 22 Hal,
  *Alptraum ohne Ende*) und KEINE Heptarchenzeit (beginnt erst 28 Hal /
  1021 BF). Setting läuft 20 Hal — also pre-Heptarchen, post-Magierkriege.
- Brem sammelt heimlich Bestechungsgeld für Miras Freikauf.
- Schwarzmagie-Allergie (Pakt-Sigillen, Magierkriegs-Reliquien),
  Phex-Sprüche aber kein Tempelbesuch, Hesinde-nervös.
- Mutter-Witz hat doppelten Boden.
- Alles davon ist GEHEIMNIS, nicht von selbst erzählen.

## Yelva nin' Salwiel — Kern-Fakten
- NAMENS-DUALITÄT: Spielerin „Yelva" (~16, E67, 1997) spielt Charakter
  „Yelvanyel nin' Salwiel" (Auelfe, ~135), Kurzform Yelva. Outtime =
  Jugendliche am Tisch, intime = Auelfe.
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