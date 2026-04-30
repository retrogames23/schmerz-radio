## Vorgehen

Ich präsentiere unten 6 Biografien für alle Free-Mode-NPCs (Philippe, Bodo, Helka, Mira, Dr. Okwu, Tjark). Du sagst pro NPC „ok" oder änderst Details — erst danach bauen wir sie ins Spiel ein.

**Verankerung später** (nach Approval, in Phase 2):
- Pro NPC ein neuer Block `BIOGRAFIE` in `src/game/npcPersonas.ts` (rendert in `promptBuilder.ts` oben unter HARTE FAKTEN, damit das LLM ihn beim Rollenspiel kennt).
- Wo ein Filesystem existiert (Bodo, Mira), 1–2 zusätzliche Dateien als biografische Spuren (z. B. alte Bewerbung, Brief von Mutter, Dienstausweis-Scan).
- Für NPCs ohne Filesystem (Philippe, Helka, Okwu, Tjark) gibt es indirekte Spuren: Bodos Mieterakte enthält Notizen zu allen Bewohnern; Miras Briefe können auf Onkel Roald / Eltern verweisen.

**Varianz-Prinzip**: 2 NPCs in E67 geboren (Mira als Komplex-Kind, Bodo als Spät-Hinzugezogener-mit-Wurzeln im Norden), 4 von außen (Philippe aus E70, Helka aus altem Stadtkern, Okwu aus E14-Süd / Migrationshintergrund, Tjark aus Vorort-Quadrant E92).

---

## Biografien (Vorschlag)

### 1. Philippe Marteau (2613, Anfang 40, Aktenschreiber E70)
- **Geboren** in Sektor E70, dem Verwaltungs-Quadranten — Plattenbau-Etage 18.
- **Eltern**: Vater Édouard Marteau (Akten-Archivar, gestorben mit 58 an Herzversagen, als Philippe 19 war), Mutter Liane Marteau geb. Vasseur (Schulhilfskraft, lebt noch in E70-1812 in Rente).
- **Geschwister**: Eine ältere Schwester, **Béatrice**, 47, Kassiererin in der Kantine E70 — Kontakt seit Mutters 65. Geburtstag abgekühlt, weil Philippe nicht kam.
- **Kindheit**: Stilles Kind, hat in der Schule selten gesprochen. Hat als Teenager angefangen, alles aufzuschreiben — Tagebücher, Listen, Wetterbeobachtungen. Lehrer haben das für „Begabung" gehalten, in Wahrheit war es Angst vor mündlichen Antworten.
- **Werdegang**: Mit 17 Verwaltungslehre, mit 22 fester Aktenschreiber. Hat E70 nie verlassen, bis er mit 31 nach E67-2613 zog — günstigere Miete, weiter weg von Mutter.
- **Bezug zum Komplex**: 11 Jahre in 2613. Hat in dieser Zeit mit niemandem im Haus mehr als drei Sätze geredet, bis Layard.
- **Eigenheiten**: Trägt immer dieselben zwei Hemden im Wechsel. Sammelt alte Quittungen in einer Schuhschachtel.

### 2. Bodo Marschke (2612, Mitte 50, Hausmeister E67)
- **Geboren** in einem Fischerdorf bei **Heelsund** (Norden, weit außerhalb der Quadranten-Verwaltung). Plattdeutsch zu Hause.
- **Eltern**: Vater Karl Marschke (Fernmeldetechniker bei der alten Küstenwache, gestorben als Bodo 14 war — Schlaganfall auf einem Sendemast), Mutter Greta Marschke (Krankenschwester, lebt mit 79 in einem Heim in Heelsund). Bodo telefoniert einmal im Monat, immer sonntags.
- **Geschwister**: Ein jüngerer Bruder, **Henning**, 49, Kapitän auf einem Versorgungsschiff. Sehen sich alle 2–3 Jahre.
- **Kindheit/Jugend**: Hat dem Vater bei Sendemast-Wartungen geholfen, daher die Liebe zu Kabeln und Schaltkästen. Hat mit 18 die Lehre als Fernmeldetechniker gemacht — 26 Jahre im Beruf (siehe sein Essay `freiheit.txt`).
- **Bruch**: Mit 47 wegrationalisiert, als die Quadranten-Telefonnetze auf CentralOS umgestellt wurden. Zog nach E67, weil ein alter Kollege ihm den Hausmeister-Posten zusteckte.
- **Privates**: War 12 Jahre verheiratet mit **Inge Marschke** (Krankenpflegerin) — sie ging zurück nach Heelsund, weil sie den Komplex nicht aushielt. Keine Kinder. Lotti die Katze hat er ein Jahr nach der Trennung im Hinterhof aufgelesen.
- **Bezug zum Komplex**: 9 Jahre Hausmeister in E67. Kennt jede Leitung, jeden Schalter, jede Mieterakte.

### 3. Helka Vint (2610, Ende 60, ehemalige Verwaltungsangestellte)
- **Geboren** im **Alten Stadtkern** (vor Quadranten-Reform) — heute ist das die unsanierte Zone südlich von E40.
- **Eltern**: Vater Ottmar Vint (Buchhalter im Rathaus des alten Stadtkerns, gestorben 1989), Mutter Edda Vint (Hausfrau, gestorben 2002). Beide lange tot, Helka hat sie als Einzelkind bis zuletzt gepflegt.
- **Geschwister**: Keine.
- **Werdegang**: Verwaltungslehre mit 16, dann **41 Jahre** in der Quadranten-Zentralverwaltung — zuletzt im Referat „Bewohnermeldewesen E60–E80". Hat mitgeholfen, das Aktensystem aufzubauen, das heute CentralOS speist. Weiß sehr genau, **wie** Bewohner kategorisiert werden.
- **Verlust**: War 30 Jahre verlobt mit **Karsten Vint** (sie hat seinen Namen behalten, obwohl sie nie geheiratet haben — seine Familie hat es verboten). Karsten starb 2014 an einer Lungensache, die in keiner Akte stand. Seitdem öffnet sie ihre Tür nicht mehr.
- **Bezug zum Komplex**: 22 Jahre in 2610. Kam als „dienstältere Mieterin mit Vergünstigung" — eine Form der Verwaltungs-Pension.

### 4. Mira (4601, 16, Schülerin & Lehrling Sektor-Wartung)
- **Geboren in E67**, in genau diesem Komplex, Etage 38 — eine der wenigen, die hier zur Welt gekommen sind. „Komplex-Kind".
- **Eltern**: Vater **Ilan** (Sektor-Elektriker, lebte in E67-3804, gestorben bei einem Trafo-Unfall im Schacht 56, als Mira 11 war — der Unfall steht in der Komplex-Akte als „menschliches Versagen", Mira glaubt das nicht), Mutter **Yael** (Sozialarbeiterin im Jugendzentrum E54, lebt heute in E54-2207 — hat Mira mit 14 zur Tante-Familie geschickt, weil sie selbst „nicht mehr konnte"; brieflicher Kontakt, kein Besuch seit 8 Monaten).
- **Geschwister**: Keine leiblichen. **Onkel Roald** (Wohnung 4604, Vaters jüngerer Bruder) ist ihre Bezugsperson — bei ihm hat sie 2 Jahre gewohnt, bevor sie mit 15 in 4601 alleine zog.
- **Schulzeit**: Klasse 10, Sektorenschule E67-Süd. Beste in Mathe und Politik, durchgefallen in Betragen. Hat mit 13 den ersten Flyer gedruckt („Warum ist 104,6 immer an?").
- **Politisierung**: Vaters Tod war der Auslöser. Mit 14 hat sie sich zum ersten Mal in den Drucker-Port am Korridor 56 eingeklinkt — derselbe Schacht, in dem ihr Vater starb.
- **Bezug zum Komplex**: Ihr ganzes Leben hier. Kennt Etagen 1–60 wie ihre Westentasche.

### 5. Dr. Adaeze Okwu (Praxis 1532, E71, Anfang 50, Allgemeinärztin)
- **Geboren** in Sektor **E14-Süd**, einem Migranten-Quadranten — ihre Familie kam in den 70ern aus dem Süden (außerhalb der Quadranten-Verwaltung; Kindheit zweisprachig: Igbo und Hochdeutsch).
- **Eltern**: Vater Dr. Chibuzo Okwu (Apotheker in E14, gestorben 2018), Mutter Ngozi Okwu (Hebamme, lebt mit 76 noch in E14-Süd, hat mit Adaeze regelmäßigen Telefonkontakt — strenges Sonntagsritual).
- **Geschwister**: Bruder **Emeka** (47, Unfallchirurg in der Zentralklinik E20), Schwester **Chioma** (44, Lehrerin in E14). Familie sieht sich zu Weihnachten und zum Jahrestag von Vaters Tod.
- **Werdegang**: Medizinstudium an der Akademie E20 (2 Jahre älter als ihre Kommilitonen — als erste Frau aus E14-Süd in dem Jahrgang). Promotion in Allgemeinmedizin. War 8 Jahre an einer Klinik in E20, dann eigene Praxis.
- **Wechsel nach E71**: 2019 hat sie die Praxis 1532 übernommen — der Vorgänger, **Dr. Hauke Brink**, ist „in den Vorruhestand" gegangen, nachdem er bei einer Catatonic-Diagnose Akten unterschlagen haben soll. Sie hat den Posten genommen, weil ihr klar war, **was** dort vor sich ging — und blieb, weil sie es nicht laut sagen darf.
- **Privates**: Geschieden. Ein erwachsener Sohn, **Ikenna**, 24, studiert Bauingenieurwesen in E20. Lebt allein im Praxis-Nebenraum.

### 6. Tjark (Gemeinschaftsraum E67, Mitte 20, DSA-Spielleiter)
- **Geboren** in Sektor **E92** — einem Vorort-Quadranten mit Reihenhäusern und überraschend viel Grün, am Rand der Verwaltung. „Wo die Quadranten-Nummerierung aufhört."
- **Eltern**: Vater **Magnus** (Postsortierer, lebt noch in E92), Mutter **Britt** (Bibliothekarin, lebt noch in E92). Bürgerliches, ruhiges Elternhaus. Beide gesund. Tjark ruft jeden Mittwoch an.
- **Geschwister**: Eine ältere Schwester, **Inga**, 31, Logopädin in E92 — verheiratet, ein Kind (Tjarks Patenkind „der kleine Bo", 4).
- **Kindheit**: Mit 12 vom Cousin Magnus jr. zu DSA gebracht. Hat seit 12 Jahren **dieselbe Kampagne** geleitet — die ist mit ihm umgezogen.
- **Werdegang**: Abitur in E92, dann Ausbildung zum Sozialassistenten — arbeitet halbtags im Jugendzentrum E67-Süd (Gleitzeit, deshalb tagsüber im Gemeinschaftsraum). Den Spieltisch hat er selbst aus Restholz vom Jugendzentrum gezimmert.
- **Wechsel nach E67**: Vor 3 Jahren wegen einer Beziehung mit **Lasse** hergezogen. Beziehung ging vor 18 Monaten in die Brüche, Tjark blieb wegen der Spielgruppe.
- **Bezug zum Komplex**: Wohnt in 5708 (oberes Drittel, sonniger). Ist im Komplex bekannt als „der Tisch-Junge", grüßt jeden.

---

## Filesystem-Spuren (Phase 2 — falls Biografien approved)

**Bodo (`filesystemBodo.ts`)** — neue Dateien:
- `~/private/heelsund_briefe.txt` — kurzer Brief der Mutter Greta („Bodo, Henning war wieder hier, fragt nach dir…")
- `~/private/inge_2017.txt` — letzter Brief der Ex-Frau Inge, 2 Sätze, schmerzhaft kurz
- `/home/bodo/akten/mieterliste.txt` — Hausmeister-Notizen zu jedem Bewohner (verrät Layard indirekt Helkas Witwen-Status, Philippes Schweigsamkeit, Miras Onkel Roald)

**Mira (`filesystemMira.ts`)** — neue Dateien:
- `~/briefe/an_mama.md` — unverschickter Entwurf an Mutter Yael in E54
- `~/briefe/von_roald.txt` — kurze Notiz vom Onkel („Mira, der Schalter im 38er ist wieder durch, dein Vater hätte gelacht.")
- `~/papa/ilan_unfallakte.txt` — gestohlene Kopie der Unfall-Akte von 2021

**Andere NPCs**: Keine eigenen Filesysteme — ihre Biografien werden nur dem LLM übergeben und kommen über die Mieterliste in Bodos Akten ins Spiel.

---

**Bitte gib pro NPC kurz Feedback** (z. B. „Philippe ok, bei Bodo Bruder umbenennen, Helka Beruf passt nicht, …"). Sobald approved, baue ich Personas + Filesystem-Spuren in einem Rutsch ein.