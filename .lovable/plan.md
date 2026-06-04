
## Ziel

Steigerungs-Loop auf die beschriebenen Regeln bringen:

1. AP-Vergabe 0–250 nach Ermessen des LLM-Meisters, mit klarer Anweisung was belohnt/bestraft wird.
2. Manuelle Steigerung wie bisher, zusätzlich „KI steigert" als Ein-Klick-Alternative.
3. Werte aus dem Heldenbogen (aktuelle Attribute, Talente, Zauber) sind dem Meister bekannt und werden im laufenden Spiel genutzt.

Speicherung und Anzeige funktionieren bereits (cloudUpsertHero + Sheet-Anzeige) — wird nur dort angefasst, wo Felder dazukommen.

## Änderungen

### 1) AP-Spanne 0–250 (statt 50–300)

`src/game/dsa/advancement.ts`
- `AP_MIN = 0`, `AP_MAX = 250`.
- `AP_DEFAULTS`: `victory: 120`, `defeat: 40`, `aborted: 0`
  (Fallback nur, wenn der Meister keinen `[AP:…]`-Marker setzt — der Prompt fordert ihn aber immer ein).

`src/game/dsa/llmMasterPrompt.ts` (AP-Marker-Doku + Regelblock)
- `[AP: <0-250> | <begründung>]`-Spanne und Richtwerte neu formulieren:
  - **Gutes Rollenspiel & kreative Rätsel-/Konfliktlösungen** → hoher Wert (Sieg 150–250, Niederlage mit Stil 80–150).
  - **Solides Durchspielen** → mittlerer Wert (Sieg ~100–150).
  - **Aus der Rolle fallen / Meta-Geplapper / sinnlose Gewalt** → niedriger Wert oder 0 (auch bei Sieg möglich).
  - Abbruch durch Layard → 0–40.
- Bestehende „Mid-Adventure keine AP versprechen"-Klausel bleibt.

### 2) Master liest aktuelle Heldenwerte

Aktuell bekommt der Prompt nur `attrs`, `LE/AE` und `knownSpells`. Aktuelle Talentwerte fehlen, obwohl Layard sie steigert.

`src/game/dsa/llmMasterPrompt.ts`
- `BuildArgs` um `knownTalents?: Record<string, number> | null` erweitern.
- Neuer Block „TALENTE — PFLICHT BEACHTEN": kompakte Liste der gelernten Talente mit TaW und Probe (analog Spells-Block, Titel + Werte aus `TALENTS`). Hinweis im Prompt: „Bei Proben (`[CHECK: …]` oder Probenfragen Layards) berücksichtige diese TaW — niedrige Talente sind erschwert, hohe erleichtert; rufe für nicht-gelernte Fertigkeiten keine Talentprobe auf."
- Spell-Block bleibt, AsP wird wie gehabt aus `character.ae` gespeist.

`src/routes/api/public/dsa-master.ts`
- Neben `loadHeroSpells` analog `loadHeroTalents(admin, uid, slot)` ergänzen, das `hero.talents` aus `dsa_heroes.hero` liest.
- An beiden Build-Stellen (Opener + Folge-Turn, Zeilen ~685 und ~861) `knownTalents` mitgeben.
- `characterSnap.attrs` schon heute aus `dsa_heroes.hero` → bleibt: gesteigerte Attribute landen automatisch im Prompt.

### 3) KI-Auto-Steigern

Rein deterministisch im Client (kein LLM-Aufruf nötig, billig und nachvollziehbar). Nutzt die existierende `applyAdvancement`-Pipeline, damit Buchführung (`apSpent`, LE/AE-Folgen) konsistent bleibt.

`src/game/dsa/autoAdvance.ts` (neu)
- Reine Funktion `autoAdvance(hero: DsaHero): DsaHero`.
- Strategie (greedy, deterministisch):
  - Solange `availableAp(hero) > 0` und mind. eine bezahlbare Steigerung existiert:
    - Kandidatenset bilden: alle Attribute, alle gelernten Talente + sinnvolle Klassen-Talente (aus `defaultTalents`), bei Magierklassen Hauszauber.
    - Gewichtung: Klassen-Kernattribute (z. B. Krieger: KK/MU, Magier: KL/IN, Streuner: GE/FF, Elf: GE/IN, …) bevorzugt; Talente/Zauber der eigenen Schule vor Fremdzaubern.
    - Pro Iteration die Steigerung mit bestem Verhältnis `Gewicht / previewCost` wählen, die noch bezahlbar ist und unter weichen Caps bleibt (Attribut ≤ 16, Talent ≤ 12, Zauber ≤ 12), um Ausgewogenheit zu sichern.
    - Bei Klassen mit Magie ca. 30 % der AP für Zauber reservieren (Budget grob aufteilen, bis kein Kandidat mehr bezahlbar ist).
  - Abbruchschutz: maximal 200 Iterationen.

`src/components/game/DsaHeroAdvancement.tsx`
- Im Header neben „Fertig" zweiter Button **„KI steigern"**:
  - Bestätigungs-Dialog („Soll Tjark deinen Helden für dich steigern? Verfügbare AP: N").
  - Bei OK: `onChange(autoAdvance(hero))`, Overlay bleibt offen, damit Layard das Ergebnis sehen kann.
- Disabled, wenn `availableAp(hero) === 0`.

### 4) Sicherstellen, dass Speicherung greift

`StandaloneDsaHost.updateHero` schreibt bereits lokal + (eingeloggt) in `dsa_heroes`. AP werden durch `creditHeroAp` nach `[END]` gutgeschrieben. Nichts zu ändern — nur kurzes Verifizieren der Sheet-Anzeige (verfügbare AP / gesamt / ausgegeben).

## Technische Hinweise

- DB-Schema bleibt unverändert; gelernte Talente liegen schon in `dsa_heroes.hero.talents` (JSON).
- Keine neuen Secrets.
- `autoAdvance` ist pure TS — kein Server-Roundtrip, kein LLM-Credit-Verbrauch.
- Übersetzte AP-Beispiele im Prompt synchron zur neuen Spanne halten (`[AP: 180 | …]` → `[AP: 160 | …]`-Beispiel).

## Out of Scope

- Kein Umbau des Steigerungs-UI über das KI-Knopf-Add-on hinaus.
- Keine Änderungen an Kampf/Combat-Intent.
- Keine Multiplayer/Group-Anpassungen (Group nutzt weiterhin `AP_DEFAULTS` ohne `[AP:…]`-Marker — passt durch neue Defaults automatisch).
