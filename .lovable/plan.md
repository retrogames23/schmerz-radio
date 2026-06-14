## Ziel

Markenname **Whisper Quest / WHISPER·QUEST / WhisperQuest** verschwindet komplett aus dem Projekt. Neuer Name überall: **Schmerz-Radio** (Display) bzw. **SCHMERZ·RADIO** in Display-Caps-Kontexten (Titelscreen, Mail-Header), passend zum bisherigen Schriftbild. Kanonische Domain wird **schmerz-radio.com**.

GitHub-Repo-URL (`github.com/retrogames23/adventure-whisper-quest`) bleibt unverändert, weil das Repo selbst nicht umbenannt wird — nur der angezeigte Linktext wird auf „Schmerz-Radio (GitHub-Repo)" geändert.

## Naming-Schema

| Kontext | Alt | Neu |
|---|---|---|
| Display, normal | Whisper Quest | Schmerz-Radio |
| Display, Caps mit Mittelpunkt | WHISPER·QUEST | SCHMERZ·RADIO |
| Slug / einwort | WhisperQuest | SchmerzRadio |
| Domain | whisperquest.app | schmerz-radio.com |
| E-Mail SITE_NAME | WHISPER·QUEST | SCHMERZ·RADIO |
| Asset-Prefix | whisper-quest-v* | schmerz-radio-v* |

## Änderungen — Texte & Meta

**SEO / Routing**
- `src/routes/__root.tsx` — title, og:title, og:site_name, twitter:title, JSON-LD `name` + `url` (→ `https://schmerz-radio.com/`).
- `src/routes/index.tsx` — title, og:title, og:url, canonical → `https://schmerz-radio.com/`.
- `src/routes/unsubscribe.tsx` — title, description, og:title, og:description, og:url, canonical, Body-Text.
- `src/routes/dsa.index.tsx` — CANONICAL, FAQ-Antwort, og:site_name, JSON-LD `author.name`, sichtbare Texte, Fußzeilen-Link → `https://schmerz-radio.com/`.
- `src/routes/dsa.helden.tsx` — CANONICAL, sichtbarer Markenname.
- `src/routes/sitemap[.]xml.tsx` — `SITE` → `https://schmerz-radio.com`.
- `public/robots.txt` — Sitemap-URL → schmerz-radio.com.
- `public/llms.txt` — Titel, Beschreibung, URL.

**Game-UI**
- `src/components/game/TitleScreen.tsx` — Subtitle „WHISPER·QUEST – …" → „SCHMERZ·RADIO – …".
- `src/components/game/CreditsOverlay.tsx` — 3 Stellen Fließtext.
- `src/components/game/OpenSourceOverlay.tsx` — 3 Stellen Fließtext, Linktext für Repo (URL bleibt).
- `src/components/game/ImpressumOverlay.tsx` — „WhisperQuest" → „Schmerz-Radio".
- `src/components/donation/DonationModal.tsx` — Fließtext.

**E-Mail / Server**
- `src/lib/email-templates/donation-confirmation.tsx` — `SITE_NAME`, Subject, Body.
- `src/lib/email-templates/weekly-signup-summary.tsx` — `SITE_NAME`, Subject.
- `src/lib/email/sendTransactional.server.ts` — `SITE_NAME`.
- `src/routes/api/public/hooks/weekly-signup-summary.ts` — `SITE_NAME`.
- `src/routes/lovable/email/transactional/send.ts` — `SITE_NAME` → `"schmerz-radio"`.

**API / Backend**
- `src/lib/aiModel.ts` — `OPENROUTER_APP_URL` → `https://schmerz-radio.com`, `OPENROUTER_APP_TITLE` → `"SchmerzRadio"`.
- `src/routes/api/public/dsa-group.ts`, `dsa-master.ts`, `fastweb-chat.ts` — CORS-Hostname-Whitelist: `whisperquest.app` / `www.whisperquest.app` → `schmerz-radio.com` / `www.schmerz-radio.com`.
- `src/game/dsa/adventureExport.ts` — `creator: "WhisperQuest DSA"` → `"Schmerz-Radio DSA"`.

**Docs**
- `README.md` — Titel, Play-URL, alle Vorkommen.
- `LORE.md` — Titel-Header.
- `src/assets/unused/README.md` — Asset-Notizen (Dateinamen-Erwähnungen werden mit umbenannt, siehe unten).

## Änderungen — Asset-Dateien

Folgende Assets umbenennen (Datei + Imports):

| Alt | Neu |
|---|---|
| `src/assets/title/whisper-quest-v1.jpg` | `src/assets/title/schmerz-radio-v1.jpg` |
| `src/assets/title/whisper-quest-v1-rain-mask.png` | `src/assets/title/schmerz-radio-v1-rain-mask.png` |

Imports anpassen in:
- `src/components/game/TitleScreen.tsx`
- `src/components/game/RainOverlay.tsx`

Ungenutzte Assets unter `src/assets/unused/` (`whisper-quest-v2-courtyard.jpg`, `whisper-quest-v3-desk.jpg`) ebenfalls umbenennen, plus README-Eintrag.

## Was nicht angefasst wird

- GitHub-Repo-URL `adventure-whisper-quest` (Anzeigetext wird aber neutralisiert).
- `routeTree.gen.ts` (auto-generiert).
- DB-Daten, vorhandene gespeicherte Spielstände (keine schemaverändernden Migrationen).
- `whisperquest.app` als CORS-Alias — wird **entfernt**, nicht als Übergang behalten (gemäß User-Wahl „komplett umstellen"). Falls noch jemand auf der alten Domain landet, schlägt die API stillschweigend mit CORS-Fehler fehl — vertretbar, da Cloud-DNS bereits auf schmerz-radio.com zeigt.

## Technische Details

- Alle URL-Ersetzungen prüfen sowohl `whisperquest.app` als auch `https://whisperquest.app/`-Varianten (mit/ohne Slash).
- Asset-Renames erfolgen via `mv` (Git erkennt Rename automatisch).
- Nach Renames werden die zwei Import-Statements (`TitleScreen.tsx`, `RainOverlay.tsx`) und die README-Notizen angepasst, damit der strikte Vite-Resolve nicht bricht.
- E-Mail-Templates: `SITE_NAME`-Konstanten sind die einzige Stelle pro Datei — Subject-Strings müssen separat angepasst werden (sie enthalten den Namen literal).
- SEO-Hinweis an dich: Such-Crawler werden den Titel-Wechsel und neuen Canonical erst beim nächsten Crawl übernehmen. Geteilte Links zeigen die alte OG-Vorschau, bis die jeweilige Plattform neu fetcht.

## Verifikation

Nach den Edits:
1. `grep -ri "whisper" src/ public/ README.md LORE.md` muss leer sein (außer evtl. Repo-URL).
2. Build muss laufen (Imports der umbenannten Assets korrekt).
3. Visuell: TitleScreen-Subtitle, Impressum-Overlay, Credits-Overlay, Donation-Modal kurz prüfen.
