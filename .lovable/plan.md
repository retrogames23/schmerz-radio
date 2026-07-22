# Resonanz als Weltbegriff verankern

Ziel: „Resonanz" wird zu einem eigenen, älteren, größeren Weltbegriff der Mandatsrats-Bürokratie. Das Schmerz-Radio bleibt eine obskure Randnische darin — nicht die Quelle des Begriffs.

## Kanon (neue Kurz-Definition)

**Resonanz** ist ein absichtlich schillernder Verwaltungsbegriff des Mandatsrats, offiziell seit den späten 1950ern in Gebrauch.

- **Technische Lesart (offiziell):** Ein bau-akustischer Messwert für Schwingungen in den Stahlbeton-Großkomplexen — Körperschall, tieffrequentes Brummen, Rückkopplungen zwischen Wohneinheiten. Wurde nach realen Schäden an frühen Wiederaufbau-Bauten eingeführt.
- **Soziale Lesart (inoffiziell, aber allgemein bekannt):** Das emotional-akustische Klima im Komplex — Streit hinter Wänden, Weinen im Aufzug, Krankmeldungen, kollektive Unruhe, Trauerspitzen nach Todesfällen. Alles, was sich in einem dichten Betonbau von Wohnung zu Wohnung „überträgt".
- **Der Trick:** Der Mandatsrat hält die beiden Lesarten mit Absicht unscharf. So kann man mit „Resonanz-Hygiene" formal über Bauakustik reden und faktisch Ruhezeiten, Türsiegel, Belegungsdichte, Krankmeldungen und Nachbarschafts-Konflikte regulieren, ohne je zugeben zu müssen, dass man Menschen reguliert.
- **Resonanzindex** (in TV/Wetterberichten) ist eine Mischgröße aus Bau-Messwerten und Krankmeldungen/Beschwerden. Niemand außerhalb der Statistik-Abteilung versteht die Formel, das ist Teil der Point.
- **Resonanz-Überlastung** ist die offizielle Diagnose der Sektorärztin — medizinischer Vorgang, nicht Sicherheitsvorgang. Kann jeden treffen, meist überarbeitete Bewohner, Trauerfälle, Konfliktparteien. Türsiegel folgen. Das hat mit dem Schmerz-Radio strukturell **nichts** zu tun.
- **Schmerz-Radio-Bezug (klein halten):** Ein paar wenige Bastler und Sonderlinge behaupten, man könne die soziale Resonanz mit einem Empfänger tatsächlich abhören. Für die Verwaltung ist das eine kuriose Fehldeutung des Begriffs, nicht mehr. Die meisten Bewohner haben nie einen solchen Empfänger gesehen.

## Was neu entsteht

- **`mem/features/resonanz.md`** — Feature-Memory mit dem Kanon oben, verlinkt aus `mem/index.md`.
- **Update `mem/constraints/schmerz-radio.md`** — Ergänzung: „Resonanz" und „Resonanz-Hygiene" sind ausdrücklich **erlaubte** Weltbegriffe (im Gegensatz zur früheren Fassung). Verboten bleibt nur, was das Schmerz-Radio ins Zentrum rückt.

## Audit vorhandener Vorkommen (nur Konsistenz-Checks, keine großen Rewrites)

Ich gehe die im Code gefundenen Fundstellen durch und prüfe/justiere sanft — nur wo es dem neuen Kanon widerspricht:

- `src/game/tv/channels.ts` — passt bereits sehr gut (Wetter- & Resonanzlage, Resonanzindex, unauffällige Auffälligkeiten). Nur einzelne Formulierungen glätten, damit klar wird, dass es um Komplex-Klima geht, nicht ums Radio.
- `src/game/e67Handbook.ts` §7 Resonanz-Hygiene — auf Doppelbegriff einnorden (Bau + soziales Klima).
- `src/game/quadrantenAlmanach.ts` — der Absatz erklärt aktuell Resonanz-Hygiene **über** das Schmerz-Radio. Umformulieren: Resonanz-Hygiene betrifft alle Bewohner, das Radio ist nur einer von mehreren möglichen Auslösern für Überlastung.
- `src/game/scenes/sectorAct1.ts` (Türsiegel-Erklärung, „Etikettenstreifen E67 — Resonanz — 1996–") — kleine Umschreibung: Türsiegel ist die generische medizinische Quarantäne-Kategorie, nicht speziell radiobezogen.
- `src/game/scenes/apartmentAct1.ts` — „Resonanz-Radio" als Item-Beschreibung ist okay, aber sollte klarstellen, dass es Layards spezielles Randgerät ist.
- `src/game/scenes/leitstelleE67.ts` + `corridorsE67.ts` + `elevatorE67.ts` (Aushänge) — Formulierung an Doppelbegriff angleichen (Pausen, Belegungsdichte, nicht: Hör-Diät).
- `src/game/dialogs/insa.ts` (N. Sertl, C. Marteau, 1978) und `dialogs/cafeteria.ts` (Tilla „zwei Jahre bei Resonanz-Hygiene") — bleiben inhaltlich, aber „Resonanz-Hygiene" ist jetzt klar als Verwaltungs-/Medizin-Ressort lesbar.
- `src/game/filesystemBodo.ts` — Bodos Essays bleiben (philosophische Umdeutung passt zum Doppelbegriff).
- `src/game/fastWebChat/personas.ts` — die Zeile „Resonanz gibt es in deiner Welt nicht" für Randpersonas rausnehmen bzw. differenzieren: Resonanz **kennen** sie (steht im Wetterbericht), das Schmerz-Radio **nicht**.

## Was NICHT passiert

- Kein Umbau der Radio-Mechanik, keine neuen Szenen, keine neuen Rätsel.
- Kein Rebranding von „Schmerz-Radio".
- Keine erfundenen Behörden oder Zusatz-Systeme rund um Resonanz — nur die Verwaltung, die es ohnehin schon gibt.

## Technisches

Reine Text- und Memory-Änderungen. Kein Code-Refactor, keine neuen Komponenten, keine Migration.
