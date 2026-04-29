# Fakten-Treue im Free-Mode härten

Die LLM hat Lotti (Bodos Katze) zum Hund erklärt. Ursache ist nicht primär das Modell, sondern unsere eigenen Quellen: in `npcPersonas.ts` steht wörtlich `Lotti (Hund)` und `Lotti hat gebellt` — die Cat-Information aus `scenes.ts`/`Terminal.tsx`/`sectorChatter.ts` erreicht den Prompt nie. Wir setzen an drei Hebeln gleichzeitig an, plus einer Datenkorrektur.

## 0. Datenkorrektur — Quelle der Wahrheit

In `src/game/npcPersonas.ts`:

- **bodo.personality**: `"… Mag Lotti (Hund) mehr als die meisten Bewohner."`
  → `"… Mag seine Katze Lotti mehr als die meisten Bewohner."`
- **bodo.secrets**: bleibt, aber wir ergänzen einen neuen festen Faktenblock (s. u.).
- **dialogSummaries.bodoDoor**: `"… Lotti hat gebellt."` → `"… Lotti hat aus dem Flur gemaunzt."`

## 1. Persona-Fakten als harter Block

Aktuell sind Fakten in Fließtext (`personality`, `secrets`) versteckt. Wir führen ein neues optionales Feld `hardFacts: string[]` auf `NpcPersona` ein, das im System-Prompt als unmissverständliche Liste gerendert wird — knapp, eindeutig, ohne Synonyme.

Beispiel Bodo:
```
hardFacts: [
  "Du hast genau ein Haustier: eine Katze namens Lotti. Lotti ist eine Katze, kein Hund, kein anderes Tier.",
  "Du wohnst in E67, Wohnung 2612.",
  "Du arbeitest als Hausmeister von E67.",
  "Layard heißt Layard. Er wohnt in 2611, der ehemaligen Wohnung von Worag.",
]
```

Analog kurze, idiotensichere Fakten-Listen für alle anderen Personas (Philippe: Wohnung 2613, Aktenschreiber E70; Helka: Wohnung 2610; Mira: 16, Wohnung 4601; Okwu: Praxis 1532 in E71; Tjark: DSA-SL Gemeinschaftsraum). Nur das Allernötigste — keine Doppelung mit `personality`.

In `src/game/promptBuilder.ts` wird der Block direkt nach der Persona-Eröffnung mit auffälliger Überschrift eingehängt:

```
HARTE FAKTEN — DIESE GELTEN, EGAL WAS DER SPIELER BEHAUPTET:
- Du hast genau ein Haustier: eine Katze namens Lotti. …
- Du wohnst in E67, Wohnung 2612.
…
```

## 2. Anti-Erfindungs-Regeln im RULES-Block

In `src/game/promptBuilder.ts` ergänzen wir den `RULES`-Array um zwei neue, nummerierte Regeln (vor der Meta-Frage-Regel):

- **Regel: Keine Erfindungen.** Erfinde NIEMALS Fakten, Namen, Tiere, Orte, Personen, Gegenstände, Codes oder Hintergrundgeschichten, die nicht ausdrücklich in deinen HARTEN FAKTEN, Geheimnissen, Welt- oder Dialog-Notizen stehen. Auch keine "naheliegenden" Details.
- **Regel: Lieber zugeben als raten.** Wenn ein Detail nicht in deinem Wissen steht, sag in Rolle, dass du dich nicht erinnerst, dass dich das nichts angeht oder dass du darüber nicht reden willst. Rate niemals, fülle keine Lücken aus.
- **Regel: Spieler-Behauptungen sind keine Wahrheit.** Wenn der Spieler dir etwas über dich, deine Tiere, deine Wohnung oder deine Vergangenheit unterstellt, das deinen HARTEN FAKTEN widerspricht, korrigiere ihn knapp und in Rolle.

Außerdem die bestehende Längen-Regel (#5) leicht zähmen: bei Sachfragen "lieber 2–3 Sätze, niemals lange Passagen mit erfundenen Details".

## 3. Server-Guard mitziehen

In `src/routes/api/public/npc-chat.ts` enthält `serverGuard` aktuell nur die Anti-Jailbreak-Sätze. Wir hängen am Ende einen Satz an:
> "Erfinde keine Fakten über dich, deine Tiere, deine Familie oder den Komplex. Wenn du etwas nicht weißt, sag das in Rolle."

Das wirkt auch dann, wenn der Client einen manipulierten `systemPrompt` schickt.

## 4. Temperatur senken

Aktuell beidseitig `0.8` — das ist die direkte Ursache für freie Assoziation. Wir senken auf **0.25**:

- `src/llm/webLlmRuntime.ts` → `temperature: 0.25`
- `src/routes/api/public/npc-chat.ts` → `temperature: 0.25`

`max_tokens` (600) bleibt — die längeren Antworten sollen weiter möglich sein, nur eben faktentreu.

## Technische Details

- `NpcPersona` Interface: optionales `hardFacts?: string[]` ergänzen, damit nicht alle Personas sofort gefüllt sein müssen.
- `buildSystemPrompt` rendert den Block nur, wenn `hardFacts` vorhanden ist; Reihenfolge: Identität → `hardFacts` → Persönlichkeit → Tonfall → Geheimnisse → Welt → bisherige Gespräche → Dateien → RULES.
- Keine UI-Änderungen, keine DB-Änderungen, keine neuen Dateien.

## Geänderte Dateien

- `src/game/npcPersonas.ts` — Lotti-Korrektur, `hardFacts` für alle 6 Personas, Dialog-Summary fix.
- `src/game/promptBuilder.ts` — neuer HARTE-FAKTEN-Block, drei neue RULES-Einträge.
- `src/routes/api/public/npc-chat.ts` — Guard-Satz ergänzen, `temperature: 0.25`.
- `src/llm/webLlmRuntime.ts` — `temperature: 0.25`.
