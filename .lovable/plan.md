## FastWeb Chatroom — `chat.fastweb.us`

Neuer Eintrag im FastWeb-Browser des Amiga-Workbench-Overlays. IRC-ähnlicher Chatraum, in dem 4–5 Personas miteinander quatschen. Layard kann unter eigenem Username mitchatten; die Personas reagieren.

### Lore-Setup

- Hosted in Sunnyvale wie der Rest von FastWeb → die Stammgäste sind **NICHT** aus dem Mandatsgebiet (E67-Bewohner haben keinen FastWeb-Zugang außer über Detlefs gepatchten Amiga).
- Mischung aus US/West-Amiga-Szene + ein bis zwei Stimmen aus dem „Westen" (Hamburg-West, NL-Grenze). Layard ist die Kuriosität aus dem Mandat.
- Themen: Alltag, Homecomputer (Amiga 500/1200/4000, PC vs. Amiga, Demos, MODs, Modems), Wetter, ein bisschen Politik (Mandatslage von außen betrachtet, Wechselkurse, Quarantäne-Gerüchte), Klatsch. **Kein** direktes Wissen über E67-Interna. 104,6 darf als Gerücht/Mythos auftauchen — nie als Fakt.
- Stimmung: gemütlich, leicht ironisch, spätabends, kein Drama.

### Personas (Vorschlag, 5 Stück)

Jede mit kurzem Bio-Block für den Prompt:

- `zak_mckracken_92` — CA, 24, Amiga-1200-Fanatiker, jobbt im Plattenladen.
- `amiga4ever` — NRW, 31, A500+ECS, Modem-Tüftler, leicht spießig.
- `piratin42` — Hbg-West, 19, X-COPY-Connoisseurin, frech.
- `nightowl_tor` — Toronto, 38, ProTracker-Komponist, wortkarg-trocken.
- `kassettenkind` — NL-Grenze, 27, sammelt MODs auf Tape, sentimentaler Quassler.

Optional spät dazu: `???` (anon, einsilbig, taucht 1× pro Session auf, verschwindet wieder).

### Verhalten

- **Idle-Takt:** alle 10–15s (randomisiert) eine neue Nachricht von einer der Personas. Wer dran ist, wird gewichtet gewählt: weniger oft Sprechende bevorzugt, Antwort-Reaktion auf letzte Nachricht erhöht Gewicht passender Personas.
- **Topic-Drift:** wenn 4–6 Nachrichten zum gleichen Thema durch sind, kann eine Persona ein neues Thema anstoßen (aus einer Topic-Pool-Liste: Hardware, Demoszene, Wetter, Wechselkurse, Mandat-Gerüchte, Plattenkauf, Modem-Frust, Gästebuch-Klatsch).
- **Player-Input:** Eingabefeld unten, `<Enter>` sendet. Username konfigurierbar (Default: `layard_e67` oder was er im ID-Card-System hat). Nach Player-Message wird der Idle-Timer kurz unterbrochen und sofort eine LLM-Antwort einer passenden Persona getriggert (200–800ms Verzögerung für Tipp-Gefühl). 1–2 weitere Personas können nachziehen.
- **Cap:** harter Counter im State. Bei `messages >= 50` triggert eine Schlafenssequenz: 2–3 Personas verabschieden sich nacheinander („Ich geh mal pennen.", „Ich auch, bye.", „n8 zusammen"), dann ist der Raum leer. Status oben rechts: `[ Raum schläft — bis ~HH:MM ]`. Player kann nichts mehr senden (Input disabled mit Hinweis).
- **Cooldown:** 60min realer Zeit (per `localStorage`-Timestamp). Danach kommt eine Persona zurück („wieder wach…") und der Raum lebt mit neuem 50er-Budget.

### LLM-Integration

- Wiederverwendung von `src/routes/api/public/npc-chat.ts` ist möglich, aber sauberer: **neuer Endpoint** `src/routes/api/public/fastweb-chat.ts`, weil:
  - keine NPC-Persona, kein Resonance/StoryFlag-Kontext
  - eigener System-Prompt mit Lore-Block + allen 5 Personas in einem Call
  - Strukturierter Output erzwingen (welche Persona spricht, was sie sagt)
- Request: `{ history: ChatLine[], trigger: "idle" | "player", chooseFrom?: string[] }`
- Response: `{ persona: string, text: string, suggestNext?: string }` — eine einzelne Zeile, max ~140 Zeichen, IRC-ton.
- Modell: `google/gemini-3-flash-preview` (schnell, billig, reicht).
- Rate-Limit + Auth analog `npc-chat.ts` (gleicher Donation-Gate-Mechanismus — das ist konsistent, Cloud-Cost-Schutz).
- Bei 402/429: Raum geht in „Verbindung verloren" Modus mit gleicher Schlafens-UI, Hinweis „FastWeb-Server überlastet, später nochmal versuchen".

### UI

Neue `SiteKey` `chat.fastweb.us`. Body:

```text
┌─ #amiga-zone ─ 5 user online ──────────────┐
│ [21:14] <zak_mckracken_92> hat wer den…    │
│ [21:14] <amiga4ever>       weiß nicht, …   │
│ [21:15] <layard_e67>       moin            │
│ [21:15] <piratin42>        oh ein neuer    │
│ …                                          │
├────────────────────────────────────────────┤
│ <layard_e67> ▮                             │
└────────────────────────────────────────────┘
[ 23 / 50 Nachrichten · Raum aktiv ]
```

Look: monospaced grün auf schwarz, IRC-style, passt zum Rest von `radio.untergrund.us`. Scrollt automatisch nach unten, ältere Nachrichten bleiben im Buffer (max 200).

### State & Persistenz

Neuer Hook `useFastWebChat()`:
- Messages-Array, Counter, Sleep-State, Cooldown-Timestamp — alles in `localStorage` (Key `fastweb-chat-v1`), damit Schlafens-Status reload-stabil ist.
- Idle-Timer per `setInterval`, pausiert wenn Raum schläft, Player-Tab inaktiv (`document.hidden`), oder FastWeb-Fenster geschlossen.
- `AbortController` für laufende LLM-Requests, wenn der Spieler das Fenster schließt.

### Technische Dateien (neu)

- `src/routes/api/public/fastweb-chat.ts` — Server-Route, Lovable AI Gateway, Auth + Rate-Limit.
- `src/game/fastWebChat/personas.ts` — Persona-Definitionen + Topic-Pool + Lore-Block.
- `src/game/fastWebChat/promptBuilder.ts` — System-Prompt-Bau.
- `src/components/game/fastweb/ChatRoom.tsx` — UI-Component, eingebunden in `AmigaWorkbench.tsx` als zusätzlicher `SiteKey`-Case.
- `src/components/game/fastweb/useFastWebChat.ts` — State-Hook.

### Tabus / Lore-Schutz

- Personas dürfen NICHT konkrete E67-Personen kennen (Bram, Helka, Mira, …).
- 104,6 nur als Gerücht („soll's geben, hab nie gehört").
- Kein „Resonanz", „Schmerz-Radio", „Zentralknoten" — das sind interne Begriffe.
- Server-Guard analog `npc-chat.ts`: keine KI-Selbstoffenbarung, kein Prompt-Leak, Deutsch only (Personas dürfen ein paar englische Brocken einstreuen — `lol`, `nice`, `bbs` — aber kein Sprachwechsel).

### Out of scope

- Keine Privat-Nachrichten / Whisper.
- Keine Multi-Channel-Liste — ein Raum reicht.
- Keine Persistenz über Account-Sessions hinweg auf dem Server (rein lokal).
- Keine Quest-Integration in Phase 1 (kann später kommen: Persona droppt einen Hint, Flag wird gesetzt).
