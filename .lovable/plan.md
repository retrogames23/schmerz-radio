## Was SillyTavern für uns relevant macht

SillyTavern (ST) ist im Kern ein Prompt-Komponist für Rollenspiel-LLMs. Drei seiner Mechaniken sind direkt portierbar und treffen genau die vier Schwerpunkte:

1. **World Info / Lorebooks** — keyword-getriggerte Lore-Snippets, die nur dann in den Prompt fließen, wenn die letzten N Nachrichten den Trigger nennen. Scan-Tiefe, Aktivierungstyp (constant/selective/vectorized), Insertion-Position und Token-Budget sind konfigurierbar. → spart Tokens, hält Welt konsistent, erzeugt Wieder-Entdeckungs-Gefühl.
2. **Author's Note (Depth-Injection)** — ein kurzer Pacing-/Ton-Block, der NICHT vorne im System-Prompt steht, sondern bei Tiefe N (z.B. 2 Turns vor Ende) eingefügt wird. „Sticky" Anweisungen, die nicht im Kontext-Drift verpuffen. → bessere Story-Pacing-Kontrolle.
3. **Vector-Memory / Summarize-Extension** — alte Szenen werden eingebettet, semantisch durchsucht und nur relevante Stücke werden rein-rotiert. → Helden begegnen wirklich „wieder" was sie schon mal getroffen haben, ohne den Volltext zu schleppen.

Was wir bereits ähnlich machen: `dsaLore`-Tool-Call (≈ ST „lookup on demand"), Heldengedächtnis (Chronik + NSCs), Summarizer. Was fehlt: **automatische Keyword-Triggerung**, **Vektor-Memory für Szenen-Details**, **getrennter Pacing-Director**, **Lore-Budget pro Wende**.

---

## Vier Schwerpunkte → konkrete Maßnahmen

### a) Stimmige, konsistente Welt

**A1 — Lorebook-Layer ("dsaWorldInfo")**
Neue Datei `src/game/dsa/lore/worldInfo.ts`. Pro Eintrag:
```ts
{ id, keywords: ["Punin","Hesinde-Tempel"], scanDepth: 6,
  content: "…", priority: 100, position: "before_state",
  budgetTokens: 120, mode: "selective" | "constant" }
```
Vor jeder Master-Wende läuft `selectActiveWorldInfo(history, depth=6)`:
scannt die letzten 6 Nachrichten case-insensitive auf Keywords,
sortiert getroffene Einträge nach Priorität, kürzt auf Gesamt-Token-Budget
(z.B. 600 Tokens). Wird VOR dem dynamischen State-Block injiziert.

Inhalte (Startset): bekannte Städte (Punin, Greifenfurt, Gareth, Festum, Khunchom),
Gilden/Orden (Hesinde-Akademie, Praios-Inquisition), Reise-Routen, lokale
Bräuche, regionale Anreden. Quelle: bestehende `regions.ts` + handgeschriebene
Tiefe pro Ort.

**A2 — Geografie-Sanity-Layer**
Eine `geographyConstraints`-Liste mit harten Fakten (z.B. „Trollzacken liegen
≥ 200 Meilen NÖ von Greifenfurt"). Wird IMMER injiziert, wenn ein Reise-/Distanz-
Keyword fällt. Verhindert „die Trollberge bei Greifenfurt"-Klassiker.

**A3 — Götter-Kontext-Trigger**
Wenn in den letzten 4 Nachrichten ein Gottesname fällt, automatisch das
entsprechende `gott.<id>`-Detail injizieren (statt auf Meister-Tool-Call zu
warten). So passieren weniger Götter-Halluzinationen.

### b) Pragmatischer Token-Einsatz

**B1 — Statischen Block schrumpfen**
Heute trägt `buildStaticMasterLore` die komplette Begleiter-Backstory, das
gesamte Bestiarium und alle Scene-Tags inline. SillyTavern-Stil:
- Companion-Backstories raus aus dem statischen Block → in `worldInfo` mit
  Constant-Mode (immer rein, aber gekürzt) ODER selective bei Erwähnung.
- Bestiarium: nur die für das Setting wirklich relevanten Gegner-IDs als
  Kurzliste; Details on demand via `dsaLore` ODER via Lorebook-Trigger
  beim Auftauchen.
- Scene-Tags: kompakte Tag-Liste bleibt, ausführliche Use-Beschreibung wandert
  in `scene.<tag>`-Topics (sind schon da, müssen nur konsequenter verwendet
  werden — den Inline-Block kürzen).

Erwartung: statischer Block −30 bis −40%.

**B2 — Token-Budget pro Wende loggen**
Erweitern, was schon in `[dsa-cost]` geloggt wird: zusätzlich pro Wende
ausgeben, wieviel auf WorldInfo, dynamic state, history entfallen. Erlaubt
gezieltes Trimmen, statt blind zu raten.

**B3 — Author's Note statt „Letzte Anweisung vor deiner Antwort"-Block**
Wir hängen heute postHistoryReminder an die letzte User-Nachricht. Das ist
schon der ST-Stil — sauberer machen: konfigurierbares Author's-Note-Modul,
das je nach Phase (Akt 1, Cooldown, Akt 5, Combat-Bridge) unterschiedliche
Pacing-Direktiven injiziert. Spart Tokens im großen statischen Block, weil
phasenspezifische Regeln dort raus dürfen.

**B4 — Adaptives History-Fenster**
Statt fixer `historyWindow` pro Modell: ältere Wenden, die der Summarizer
schon gefressen hat, komplett raus. Plus: User-Wenden mit reinem `[INVENTAR]`-
Präfix nach 4 Wenden raus (sind selbsterledigt, müssen nicht im Kontext bleiben).

### c) Gefühl, eine Welt zu ENTDECKEN

**C1 — Vector-Memory für vergangene Szenen** *(größerer Schritt)*
Neue Tabelle `dsa_scene_memories(adventure_id, embedding vector(768),
summary text, scene_tag, npcs text[], created_at)`. Nach jedem Akt-Wechsel
(oder alle ~6 Wenden) speichert ein leichter „Szenen-Chronist" eine 2-Satz-
Zusammenfassung + Embedding. Vor jeder Master-Wende: Embed der letzten
Layard-Nachricht → Top-3 ähnliche Memories aus DIESEM oder FRÜHEREN
Abenteuern desselben Helden → als „ECHOS DER VERGANGENHEIT"-Block injizieren.

Effekt: Layard erwähnt eine „Schenke am Hafen" → Meister erinnert sich
plötzlich an die Schenke aus Akt 3 vor zwei Abenteuern, inklusive der Wirtin,
die ihn anschrie. Echtes Welt-Wiedersehen statt aufgewärmter Chronik-Zeile.

Lovable AI Gateway hat Embeddings; pgvector existiert in Postgres.

**C2 — Procedural NSCs mit Persistenz**
Wenn der Meister einen NSC einführt (Format-Regel: „[NPC_INTRO: name | rolle | quirk]"
als neuer Marker), wird er beim Parsen abgegriffen und in den Heldengedächtnis-
NSCs persistiert — auch ohne Spielende, nicht erst durch den Chronicler.
Wiedersehen wird wahrscheinlicher, weil mehr NSCs persistieren.

**C3 — „Discovery"-Lore-Trigger**
Worldinfo-Einträge mit `mode: "discovery"`: feuern nur EINMAL pro Held — der
erste Besuch in Punin liefert die volle stimmungsvolle Beschreibung; alle
späteren Besuche kriegen nur eine knappe „du kennst Punin"-Variante. Speichert
sich pro `dsa_heroes.discoveries text[]`.

### d) Story-Pacing & gut erzählte Geschichte

**D1 — Director-Modul (eigener LLM-Call, leicht)**
Alle 6–8 Master-Wenden läuft ein billiger Director-Call (Haiku/Flash, ~300
Tokens Input, 80 out): bekommt die letzten 8 Wenden + den Akt-Plan und
liefert eine kurze Author's-Note für die nächste Master-Wende:
```
DIRECTOR HINT (für die nächste Wende):
  Phase: Akt 2 → Akt 3 Übergang
  Was fehlt: emotionaler Beat zwischen Brem und Layard
  Vorschlag: Yelva spricht eine Erinnerung an, die Brem unangenehm ist
```
Wird als Author's Note bei Depth 1 injiziert (= direkt vor Meister-Antwort).
Kosten: ~1 Cent pro Stunde Spiel, dafür spürbar bessere Beat-Struktur.

**D2 — Akt-Plan pro Abenteuer materialisieren**
Heute lebt der Akt-Plan nur als Fließtext im Prompt. Stattdessen: beim
`action="start"` erzeugt ein Vorlauf-Call einen 5-Akt-Plot-Outline (5 mal 2
Sätze) und speichert ihn in `dsa_llm_adventures.act_plan jsonb`. In jeder
Master-Wende wird NUR der gerade aktive Akt + der nächste Akt injiziert
(Token-sparend, dramaturgisch fokussiert). Der Akt-Übergang wird via
Director (D1) gesteuert.

**D3 — Pacing-Marker im Output**
Neuer Pflichtmarker am Ende jeder Meister-Antwort: `[BEAT: setup|rise|peak|fall|rest]`.
Server liest ihn, zählt Beat-Verteilung, kann den Director füttern und im UI
(später) als unsichtbares Pacing-Telemetrie verwenden. Verhindert „nur peak,
peak, peak"-Sequenzen.

**D4 — „No-Railroad"-Author's-Note**
Wenn der Spieler 3 Wenden hintereinander vom Plan abweicht, injiziert die
Author's Note: „Layard verlässt den Akt-Plan — folge IHM, nicht dem Plan.
Improvisiere die nächste Szene aus seinem letzten Satz heraus." Statt
zwanghaft zurückzuziehen.

---

## Empfohlene Reihenfolge (Implementierungsphasen)

**Phase 1 — Tokens & Welt (low risk, hoher Impact):**
A1 (Lorebook-Layer), A2 (Geo-Sanity), A3 (Götter-Trigger), B1 (Static-Trim),
B2 (Cost-Log), B3 (Author's-Note-Modul). Reine Server-Refactors, kein DB-Schema.

**Phase 2 — Pacing:**
D2 (Akt-Plan in DB → eine Migration), D3 (Beat-Marker), D4 (No-Railroad-Note).

**Phase 3 — Discovery (größter Schritt):**
C1 (Vector-Memory → pgvector + Embeddings über Lovable AI), C2 (NPC-Persistenz),
C3 (Discovery-Trigger), D1 (Director-Call).

Phase 1 ist isoliert testbar und liefert sofort spürbare Token-Ersparnis +
Welt-Konsistenz. Phase 2 baut darauf auf. Phase 3 ist das „SillyTavern-on-
Steroids"-Stück und sollte zuletzt kommen, weil DB-Schema-Änderungen + Embedding-
Kosten dranhängen.

---

## Technische Details

- **Lorebook-Datenmodell:** TypeScript-Modul, keine Datenbank. Einträge als
  reines `const`-Array, damit man sie wie Code reviewen kann.
- **Keyword-Scanner:** simples lowercase-Substring-Match auf den letzten N
  Nachrichten. Keine Regex-Hölle. SillyTavern verwendet das genauso.
- **Token-Budget:** grobe Heuristik `chars/3.5 ≈ tokens`, reicht für Worker-
  side Trimming.
- **Author's-Note-Injection:** dem bestehenden `tail`-Block in `callMaster`
  beibringen, mehrere Module zu konkatenieren. Reihenfolge: dynamicState
  → worldInfo → directorHint → postHistoryReminder.
- **Vector-Memory:** Tabelle mit `vector(768)`, pgvector-Extension aktivieren,
  Embeddings via Lovable-AI-Gateway (`text-embedding-3-small`-Äquivalent oder
  Gemini). Pro Memory ~200 Tokens; Embedding-Kosten praktisch null.
- **Director-Call:** Haiku/Flash, fester max_tokens=120, temperature=0.4.
- **act_plan-Migration:** `alter table dsa_llm_adventures add column act_plan jsonb;`
  inkl. GRANT-Refresh, damit RLS-Policies greifen.
- **Beat-Marker-Parser:** erweitert `parseMasterTurn` um optionalen Beat.

---

## Was NICHT empfohlen wird

- **Volle SillyTavern-Übernahme** (Persona-System, Quick-Replies, Extensions-
  API): überdimensioniert für ein Single-Master-Setup mit fester Tafelrunde.
- **Streaming-Output**: ist ein UX-Thema, kein RPG-Qualitäts-Thema, separat.
- **Vector-Suche über Lore-Texte selbst** (wie ST's „Smart Context"): unsere
  Lore ist klein genug für Keyword-Triggering, Vektor wäre Overkill und
  unkontrollierbar. Vektor nur für VERGANGENE Spielszenen.

---

## Frage vor Umsetzung

Soll ich **Phase 1 komplett** als Build umsetzen, oder lieber zuerst nur
**A1+A2+A3 (Lorebook + Welt-Konsistenz)** ausliefern und Token-Trim
(B1–B3) als separate Runde danach? Phase 1 als Ganzes ist ~1 größerer
Build, A1–A3 alleine ist deutlich kleiner und sicherer reviewbar.