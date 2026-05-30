
## Worum geht's

Die Duell-Mechanik selbst nennt sich intern längst **„Phrasen-Dreschen"** — Brust wirft Behörden-Phrasen, Layard kontert. Aber die Hinführungs-Dialoge mit **Kowalk** und **Brust** (und ein paar Sätze bei Vossbeck) sprechen noch durchgängig von **„Paragraphen"** / **„paragraphenfest"**. Das passt nicht mehr zur Mechanik und nimmt der Szene den Witz.

Gleichzeitig liest sich die ganze Hinführung aktuell sehr trocken-amtlich. Die Welt verträgt eine **Prise Monkey-Island-Schlagabtausch**, wenn er aus der **Behörden-Logik selbst** kommt (Kowalk seufzt routiniert, Brust nimmt seine eigene Wichtigkeit todernst, Vossbeck bleibt der gefährlich höfliche Endgegner). Slapstick wäre falsch. Augenzwinkernde Hyper-Bürokratie ist richtig.

## Neue Grundidee in einem Satz

> **Vossbeck verhandelt grundsätzlich nur noch mit Bewohnern, die sich im Bürokratie-Alltag als schlagfertig erwiesen haben. Brust ist der Türsteher, der das prüft — am Tresen, an erfundenen Kantinenfällen. Kowalk hat das hundertmal gesehen, sie übersetzt für Layard.**

Das macht aus „Paragraphen lernen" ein **„den Bürokratie-Tonfall lernen"** — und genau das wird beim Spielen gemacht: Behörden-Phrasen mit der richtigen Floskel entwerten.

## Was geändert wird (Code-Locations)

Reine Text-Eingriffe, keine Mechanik-Änderung, keine neuen Flags.

### 1. `src/game/dialogs/cafeteria.ts` — Kowalk (`cafeteriaKowalk`)

- **`kInsa6c`** („durchkommen heißt: erst Brust … Vossbeck nimmt nur Bewohner an, die paragraphenfest sind") → neu formuliert als **„schlagfertig im Behörden-Ton"**. Konkreter Vorschlag:

  > KOWALK: „Und durchkommen heißt: erst Brust. Drei Trainingsfälle in Folge. Vossbeck verhandelt nur noch mit Bewohnern, die sich im Bürokratie-Alltag als schlagfertig erwiesen haben — und Brust ist heute mal wieder dran zu prüfen, wer das ist."
  > KOWALK (Untertext): „Brust hält das für eine ehrenvolle Aufgabe. Lass ihn in dem Glauben, Worag — du brauchst ihn."

- **`kAuth8`** („Vossbeck redet nur mit Leuten, die Paragraphen können …") → neu:

  > KOWALK: „Vossbeck redet nur mit Leuten, die im Bürokratie-Alltag mitreden können. Brust trainiert die Bewohner manchmal — erfundene Kantinenfälle, drei in Folge gewonnen, und du gilst bei Vossbeck als satisfaktionsfähig. Wer das nicht ist, läuft bei ihm gegen eine Wand. Eine sehr höfliche Wand."

- **`kRecap`** („Brust. Trainingsfall. Drei in Folge. Dann Vossbeck") bleibt fast wörtlich, aber Schluss-Satz wird wärmer:

  > KOWALK: „Brust testet, Vossbeck entscheidet. Drei Trainingsfälle in Folge — und du darfst rein. Den Rest mache ich von hier aus."

- **Neue Mini-Option im Hub `k0`** (nur sichtbar nach erstem Sieg, vor dem dritten — damit die Hinführung Atem hat und Kowalk Layard explizit anfeuert):

  > Choice: „Brust ist anstrengend." → kBrustVent
  > KOWALK: „Brust ist die strengste Form von Loyalität, die ich kenne — gegenüber einem Aushang, den niemand sonst noch liest. Lass ihn gewinnen wollen. Er gewinnt nur, wenn du verlierst."

### 2. `src/game/dialogs/cafeteria.ts` — Brust (`cafeteriaBrust`)

Hier liegt der größte Hebel. Brust soll **todernst seinen Witz nicht merken** — daraus entsteht der Monkey-Island-Ton.

- **`bAuth3`** („Vossbeck nimmt aber nur Vorgänge von Bewohnern an, die paragraphenfest sind …") → neu:

  > BRUST: „Oberinspektor Vossbeck nimmt Vorgänge nur von Bewohnern entgegen, die im Bürokratie-Alltag schlagfertig sind. Das ist mir die Aufgabe, das zu prüfen. — Trainingsfall. Erfundene Konstellation aus dem Kantinenbetrieb. Drei in Folge bei mir, dann sind Sie für Vossbeck satisfaktionsfähig."
  > BRUST (Untertext): „Er sagt »satisfaktionsfähig« mit der Ehrfurcht eines Mannes, der das Wort jeden Morgen einmal vor dem Spiegel übt."

- **`bDuelOffer` & `bDuelOffer2`** („Ich eröffne mit einem Paragraphen, Sie kontern …") → neu:

  > BRUST: „Trainingsfall. Erfundene Konstellation aus dem Kantinenbetrieb. Ich eröffne mit einer typischen Bewohner-Phrase — Sie kontern. Zwei Treffer mehr als Fehler: bestanden. Drei Fehler: für heute schließen wir."
  > BRUST: „Was Sie aus jedem Fall mitnehmen, landet in Ihrem Phrasenbuch. Drei gewonnene Trainingsfälle in Folge — und Vossbeck nimmt Sie ernst. Ich darf das beurkunden."
  > BRUST (Untertext): „»Beurkunden« sagt er, als wäre es ein Ehrentitel."

- **`bVossbeckHint`** bleibt fast wie er ist, kleiner Witz dazu:

  > BRUST: „Drei in Folge. Korrekt notiert. — Direkt nebenan, Tür 3603. Klopfen Sie nicht. Vossbeck hört auf Aushänge, nicht auf Hände."

- **`bHyg1` / `bHyg2`** (Aushang-Konflikt mit Kowalk) bleibt — passt schon, ist Brusts eigener kleiner Selbstmord am Regelwerk. Nur kosmetisch: „Das ist … unschön" → „Das ist … nicht ganz aushangkonform." (trockener)

### 3. `src/game/dialogs/cafeteria.ts` — Vossbeck (`cafeteriaVossbeck`)

- **`v6`** („Ich verwende ausschließlich Paragraphen, die in Ihrem Notizbuch stehen sollten …") → neu:

  > VOSSBECK: „Ich verwende ausschließlich Phrasen, gegen die Brust Sie geübt haben sollte. Wenn Ihr Phrasenbuch lückenhaft ist — ist das Ihr Versäumnis. Nicht meines."

- **`vAfter`** („Sie kennen Ihre Paragraphen …") → neu:

  > VOSSBECK: „Herr Worag, Respekt. Sie sind im Behörden-Ton zu Hause. Haben Sie eine Fallnummer? Nein? Dann bitte ich Sie, mich meine Arbeit machen zu lassen."

- **`vossbeckUnready` (`u3`)** („Trainingssiege bei Herrn Brust: keine dokumentiert — Sie brauchen drei …") bleibt sinngemäß, aber:

  > VOSSBECK: „Trainingssiege bei Herrn Brust: keine dokumentiert. Drei brauchen Sie — sonst sind Sie hier nicht satisfaktionsfähig. Ich verhandle nicht mit Bewohnern, die mir noch im selben Satz aus der Hand fressen."
  > VOSSBECK: „Drei in Folge bei Brust. Vorher nicht. — Tür ist da."

  (`vossbeckUnreadyOne` / `vossbeckUnreadyTwo` analog im Tonfall — Witz darf in der Zwischenstufen-Variante stärker werden, weil Vossbeck dort minimal genervter wird.)

### 4. `src/game/dialogs/vossbeckAct2.ts`

- **`vossbeckAct2Skeptical.s1`** („Manche Bewohner halten meine Paragraphen für ein Hindernis …") → neu:

  > VOSSBECK: „Manche Bewohner halten meine Phrasen für ein Hindernis. Andere für ein Werkzeug. Sie scheinen mir zur zweiten Sorte zu gehören."

### 5. `src/components/game/BureaucracyDuelOverlay.tsx`

- **Kowalk-Tutorial-Hinweis (Zeile 80)** („du hast noch nicht viele Paragraphen …") → neu:

  > KOWALK (halblaut): „Worag — dein Phrasenbuch ist noch dünn. Wähl irgendwas. Brust korrigiert dich, dann hast du einen Konter mehr."

- **Streak-Abschluss-Text (Zeile 243)** („Drei in Folge, Bewohner Worg. Das ist … selten.") bleibt, kleiner Witz weiter unten ergänzen:

  > „Wenn Sie meinen, einen echten Vorgang führen zu können — kommen Sie zu mir. Tür 3603. Vor neunzehn Uhr. Nach neunzehn Uhr bin ich auch dort, aber dann ist es offiziell nicht mehr ich."

- **Item-Description nach Endsieg (Zeile 223)** („Argument für Argument, Paragraph für Paragraph") → neu:

  > „Eine grau-amber lackierte Konservendose … Vossbeck hat sie freigegeben — Phrase um Phrase, Floskel um Floskel. Es war fast schön anzusehen."

### 6. `src/game/hints.ts`

Zwei Zeilen umformulieren:

- Z. 273 („Er nimmt nur Bewohner an, die paragraphenfest sind …") → „… die im Behörden-Ton schlagfertig sind — Brust trainiert dich am Tresen vorher."
- Z. 378 („Jeder Fall lehrt dich Paragraphen fürs Notizbuch …") → „Jeder Trainingsfall ergänzt dein Phrasenbuch — verlierst du, lernst du den Konter trotzdem (Brust nennt ihn dir selbst)."

### 7. Kommentare (low priority)

Code-Kommentare wie `// Trainingsfall — fiktive Kantinenfälle, lehrt Paragraphen.` werden in „lehrt Konter fürs Phrasenbuch" geändert. Reine Lesbarkeit für die nächste Iteration; keine User-Wirkung.

## Was bewusst NICHT geändert wird

- **Mechanik des Duells.** PHRASES, COUNTERS, FICTIONAL_COUNTERS, Pool-Logik, Streak-Zählung, Notausgang über Kowalks Fälschung — alles bleibt wie es ist.
- **Das Phrasenbuch-Overlay** (`ParagraphenNotizbuchOverlay.tsx`). Dateiname und interne Variable `learnedParagraphs` bleiben als reine Code-Aliasse (siehe vorhandener Kommentar im Code) — sonst müsste man zu viele Stellen umbenennen, ohne dass es der Spieler je sieht. Die **UI-Strings** im Overlay sind bereits neutral genug.
- **`bAuth1` / `bAuth2`** (Brust verweist auf Aushang 4.2). Das sind echte Aushänge, keine Duell-Paragraphen — die Wortwahl bleibt.
- **Tjark / DSA-Block** am Ende der Datei — nicht betroffen.

## Tonalitäts-Leitplanken (für die Umsetzung)

Damit der Humor nicht ins Albernkippt:

1. **Brust nimmt sich todernst.** Witz entsteht durch _Untertext_ („sagt »beurkunden«, als wäre es ein Ehrentitel"), nicht durch flapsige Brust-Sätze.
2. **Kowalk ist die einzige Figur, die offen über Brust schmunzelt** — und auch nur halblaut, im Aside. Das macht ihren Witz wertvoll.
3. **Vossbeck wird trockener, nicht witziger.** Sein einziger Humor ist die selbstverständliche Höflichkeit, mit der er Layard rauswirft. Kein Augenzwinkern, niemals.
4. **Layard antwortet im Duell wie bisher** — die fertigen Konter aus `COUNTERS` sind schon im richtigen Ton („Das sieht man dem Sektor auch an"). Hier wird nichts geändert.
5. **Keine Brüche mit der Welt:** kein Pop-Culture-Witz, kein „Schwertmeister"-Wink. Der Insider-Witz bleibt _bürokratisch_.

## Aufwand

- Reine Text-Patches in 4 Dateien (`cafeteria.ts`, `vossbeckAct2.ts`, `BureaucracyDuelOverlay.tsx`, `hints.ts`) — überschaubar, eine Iteration.
- Kein Mechanik-Test nötig, weil keine Flags / kein Game-State berührt werden. Sichtprüfung der Dialoge im Spiel reicht.
