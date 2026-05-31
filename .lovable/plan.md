## Ziel

Helden und Abenteuer werden zu zwei unabhängigen Konzepten. Ein Held lebt in einem von drei Slots, sammelt Abenteuerpunkte (AP) aus beendeten Runden und kann diese in Eigenschaften, Talente und (für Magier) Zauber investieren. Derselbe Held kann nacheinander beliebig viele Abenteuer spielen – sowohl im Hauptspiel als auch standalone, mit getrennten Pools je Modus.

## 1. Datenmodell

**Held (Slot 1/2/3)**
- bisher: `DsaCharacterSummary` (Snapshot mit `attrs`, `le`, `leMax`, `ae`).
- neu zusätzlich: `apTotal`, `apSpent`, `talents: Record<talentId, number>`, `spells: string[]` (gelernte Zauber-IDs, nur Magier), `adventuresPlayed`, `adventuresWon`, `createdAt`.
- gespeichert pro Slot in `localStorage` (`dsa.standalone.hero-N`) und – wenn eingeloggt – in neuer Tabelle `dsa_heroes` (PK `user_id + slot`).

**Abenteuer (beliebig viele pro Held)**
- bisher: `dsa_llm_adventures` mit `session_id` pro Slot.
- neu: `hero_slot smallint` und `status` (`active`/`finished`/`aborted`) bleiben, aber pro Held kann es mehrere Zeilen geben. Neuer Index `(user_id|anon_id, hero_slot, created_at desc)`. Die bisherige stabile Slot-UUID wird zur „aktiven" Session des Helden; abgeschlossene Abenteuer bekommen jeweils eine neue UUID und bleiben als Archiv erhalten.

**Trennung Hauptspiel ↔ Standalone**
- Hauptspiel-Held lebt weiterhin im Save-Slot (`GameContext`-Persistenz) und ist eine eigene `DsaHero`-Instanz. Standalone-Helden leben in den 3 Slots der `/dsa`-Route. Kein gemeinsamer Pool, kein Cross-Sync.

## 2. AP-Vergabe durch den Meister

- Neuer Marker im LLM-Master-Prompt: `[AP: <50-300> | <Begründung>]`, ausschließlich erlaubt zusammen mit `[END: victory|defeat|aborted]`.
- Parser in `src/game/dsa/llmAdventure.ts` extrahiert `ap` + `reason` in `ParsedMasterTurn`.
- Server (`/api/public/dsa-master.ts`) clamped auf 50–300, schreibt `ap_awarded` + `ap_reason` ins Abenteuer und addiert auf `hero.apTotal`. Fehlt der Marker bei `[END]`, vergibt der Server einen Default (Sieg 150 / Niederlage 60 / Abbruch 0).
- `EndBanner` zeigt vergebene AP + Begründung; Knopf „Held steigern" öffnet das neue Steigerungs-Overlay.

## 3. Steigerungs-Overlay

Neues Overlay `DsaHeroAdvancement.tsx` (öffenbar aus Charakterbogen und EndBanner). Inhalt:
- **Eigenschaften** (MU/KL/CH/FF/GE/IN/KK): DSA-typische steigende Kosten (z. B. neuer Wert × 15 AP); LE/AE werden bei KK/IN automatisch nachgezogen.
- **Talente** aus `src/game/dsa/rules/talents.ts`: Steigerung in Klasse erlaubter Talente; Kosten nach Spalte (A=15, B=30, C=45 …).
- **Zauber** (nur wenn `cls.magic`): Lernen neuer klassen­passender Sprüche aus `rules/spells.ts` (Kosten Faktor × neuer Wert) und Steigern bekannter.
- Anzeige: verfügbare AP (`apTotal - apSpent`), Vorschau der Veränderung, „Bestätigen" persistiert in den Slot.

Charakterbogen (`DsaCharacterSheet.tsx`) zeigt zusätzlich: AP-Stand, gespielte/gewonnene Abenteuer, gelernte Talente, Zauber.

## 4. UI-Flow

**Standalone (`/dsa`)**
- Landing-Seite zeigt pro Slot: Heldenname, Klasse, LE/AE, AP, Stand & Knopf „Steigern" wenn freie AP. Zusätzlich „Neues Abenteuer starten" (wenn kein aktives offen) und „Weiterspielen" (wenn `status=active`).
- Neue Unterroute `/dsa/$slot/archiv` listet beendete Abenteuer (Setting, Datum, Ausgang, AP, DOCX/PDF-Download wie bisher).
- „Held löschen" entfernt Held + alle zugehörigen Abenteuer; einzelne Abenteuer separat löschbar.

**Hauptspiel**
- Im Charakterbogen-Overlay (Gemeinschaftsraum E67) erscheint der gleiche „Steigern"-Knopf, sobald AP vorhanden.
- Nach beendetem Abenteuer kann Tjark eine neue Runde mit demselben Helden anbieten (Setting-Auswahl); bisheriges Verhalten („selber Held bleibt") wird zur expliziten Wahl.

## 5. Migration

- Beim ersten Laden: bestehendes `dsa.standalone.slot-N` (alter `DsaCharacterSummary`) wird zu `dsa.standalone.hero-N` mit `apTotal=0`, `apSpent=0`, leeren Talenten/Zaubern aufgewertet.
- Bestehende `dsa_llm_adventures`-Zeilen bekommen `hero_slot` per Default aus der bekannten Slot-UUID-Zuordnung; `status` bleibt wie gehabt.

## Technische Details

Geänderte/neue Dateien:
- `src/game/types.ts` – neuer Typ `DsaHero` (erweitert `DsaCharacterSummary`).
- `src/components/dsa-standalone/slotStorage.ts` – `loadHero/saveHero`, Liste der Abenteuer pro Slot, separate Session-ID pro Abenteuer.
- `src/game/dsa/llmAdventure.ts` – Parser für `[AP:…]`, Typen `ParsedMasterTurn.ap`.
- `src/game/dsa/llmMasterPrompt.ts` – Marker-Doku für den Meister.
- `src/routes/api/public/dsa-master.ts` – Hero-Tabelle hochzählen, AP clampen, mehrere Abenteuer pro Slot zulassen, `list`/`finish`-Aktionen.
- Neue Migration: Tabelle `dsa_heroes (user_id, slot, hero jsonb, ap_total, ap_spent, updated_at)` mit GRANTs + RLS (user-scoped), plus Spalte `hero_slot` + `ap_awarded` + `ap_reason` auf `dsa_llm_adventures`.
- Neue Komponente `src/components/game/DsaHeroAdvancement.tsx`.
- `DsaCharacterSheet.tsx` – AP-Block + Talent-/Zauberliste mit aktuellem Wert.
- `DsaLlmAdventureScene.tsx` – EndBanner zeigt AP, Knopf „Steigern" + „Neues Abenteuer".
- `routes/dsa.index.tsx`, `routes/dsa.$slot.tsx`, neue `routes/dsa.$slot.archiv.tsx`.
- `DsaHostContext.tsx` + `StandaloneDsaHost.tsx` + `GameContext.tsx` – Hero-CRUD-API (`updateHero`, `spendAp`, `startNewAdventure`, `listAdventures`).

Regeltabellen (`rules/talents.ts`, `rules/spells.ts`) bekommen Steigerungskosten als zusätzliche Felder, falls nicht vorhanden.

## Offen für später (nicht Teil dieser Iteration)
- Cloud-Sync der Helden zwischen Geräten via `dsa_heroes` (Server-Endpunkte werden zwar mit­erstellt, UI bleibt minimal).
- Export/Import einzelner Helden als JSON.
