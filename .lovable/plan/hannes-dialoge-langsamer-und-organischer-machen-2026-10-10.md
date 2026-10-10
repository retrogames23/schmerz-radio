# Hannes Dialoge langsamer und organischer machen

## Ziel
Hanne bleibt sehr gesprächig, warm und gedanklich schnell, aber das Gespräch fühlt sich nicht mehr wie eine Folge von Kurzreferaten an. Gedanken entstehen im Austausch mit Layard, Begriffe werden erst eingeführt und danach vertieft, und jeder Themenwechsel wächst aus dem zuvor Gesagten.

## Festgestellte Probleme
- Hanne hat derzeit etwa 95 eigene Repliken, Layard nur sieben. Er dient meist als Stichwortgeber statt als echter Gesprächspartner.
- Mehrere Antwortoptionen setzen Wissen voraus, das auf dem jeweiligen Pfad noch nicht vorkam: unter anderem Fuller im ersten Themenmenü, Synergie nach der Kuppel, Mumford nach der Ephemeralisierung, das „Pentagon der Macht“ und Ginsberg/Moloch.
- Viele Äste bestehen aus zwei bis vier dichten Erklärblöcken hintereinander. Wahlmöglichkeiten kommen erst danach und öffnen oft sofort das nächste Großthema.
- Die vorhandenen Ausstiege sind technisch zuverlässig, liegen aber häufig erst hinter einem vollständigen Vortragsblock.

## Überarbeitung

### 1. Small Talk wirklich ausspielen
- Die Erstbegegnung bei Brot, Hamburg, Amerika, Rückkehr und ihrer modernen Wohnung länger verweilen lassen.
- Fuller, Mumford und andere Namen nicht schon als beiläufig bekannte Größen behandeln.
- Hanne zunächst über konkrete Erinnerungen und Gegenstände sprechen lassen; die Theorie wächst erst daraus.
- Layard reagiert zurückhaltend, skeptisch oder persönlich, statt sofort die nächste Fachfrage zu stellen.

### 2. Begriffe sauber einführen
- Jede Spielerfrage darf nur Wörter und Personen aufgreifen, die Hanne auf diesem konkreten Gesprächspfad bereits genannt oder sichtbar erklärt hat.
- Vorweggenommene Fragen umformulieren: erst eine alltagssprachliche Nachfrage, danach Hannes Benennung des Begriffs, erst anschließend eine mögliche Vertiefung.
- Querverweise zwischen Fuller, Mumford, Ginsberg, Bateson, Wiener, Illich, Brand und Burroughs erst freischalten, wenn der Ausgangsgedanke verständlich geworden ist.
- Vorhandenes Wissen aus früheren Hanne-Gesprächen darf bei Wiederbesuchen in kürzeren, passenden Wiedereinstiegen anklingen.

### 3. Jeden Themenstrang entschleunigen
Die bestehenden Themen bleiben erhalten: USA/Rückkehr, Fuller, Mumford, Whole Earth Catalog, Beats/Dylan, Macintosh und Psychologie.

Jeder Strang erhält denselben ruhigeren Rhythmus:
```text
konkrete Beobachtung oder Erinnerung
→ kurze Reaktion Layards
→ Hanne präzisiert oder widerspricht
→ Wahl: nachfragen / zweifeln / anderes Thema / gehen
→ erst dann die nächste theoretische Ebene
```
- Dichte Vortragszeilen in kürzere Gedanken teilen.
- Pro Vertiefung nur einen neuen Hauptbegriff einführen.
- Layard häufiger eine eigene Deutung, einen Einwand oder ein persönliches Unbehagen äußern lassen.
- Hanne auf genau diesen Einwurf reagieren lassen, statt nur mit der nächsten Pointe fortzufahren.
- Kurze Pausen, Gesten und Beobachtungen im Raum als Atemstellen einsetzen.

### 4. Mehr Tiefe statt mehr Schlagwörter
- Theorien nicht als Namenslisten referieren, sondern an einem anschaulichen Beispiel entwickeln und auf das Mandatsgebiet 1997 zurückführen.
- Widersprüche in Hannes Haltung sichtbar machen: Sehnsucht nach Technik und Angst vor Kontrolle, deutsche Präzision und Verwaltungssprache, Gemütlichkeit und Betäubung, individuelle Freiheit und gesellschaftliche Verantwortung.
- Layards frühere Tätigkeit als Autor und seine heutige Verwaltungsrolle behutsam als Reibungsfläche nutzen, ohne daraus einen neuen Queststrang zu machen.
- Die vorhandenen Pointen behalten, aber ihnen Vorbereitung und Nachhall geben.

### 5. Spieler behält jederzeit die Kontrolle
- Nach jeder überschaubaren Gedankenstufe eine natürliche Möglichkeit anbieten, nachzufragen, das Thema ruhen zu lassen oder die Wohnung zu verlassen.
- „Zurück“ und „Ich muss los“ sprachlich an die jeweilige Situation anpassen, statt überall gleich zu klingen.
- Wiederbesuche führen zu vertrauten, knappen Einstiegen und nicht erneut durch die komplette Einführung.

## Technische Umsetzung
- Den Dialogbaum in `src/game/dialogs/hanne.ts` neu takten und die starre Folge aus langen `chain()`-Blöcken teilweise durch kleine Zwischenmenüs ersetzen.
- Bestehende Themen-Flags weiterverwenden; zusätzliche Fortschritts-Flags nur dort ergänzen, wo eine gestaffelte Vertiefung über mehrere Besuche sonst nicht zuverlässig funktioniert.
- Keine Änderungen an Hannes Wohnung, Bild, Hotspots oder Questfunktion vornehmen.
- Alle Verweise im Dialogbaum auf Erreichbarkeit prüfen; anschließend die vorhandenen Dialog-, Lore- und Lösbarkeitsprüfungen ausführen.

## Ergebnis
Ein deutlich längeres, langsameres Gespräch, in dem Hanne weiterhin gern und viel redet, Layard aber wirklich beteiligt ist. Der Spieler begegnet Ideen in nachvollziehbarer Reihenfolge, kann ihnen Tiefe geben oder jederzeit höflich aussteigen.
