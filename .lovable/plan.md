## Ziel

Brem und Yelva bekommen je eine knappe, aber tragfähige Hintergrundgeschichte mit einem klaren **Bruch** im Lebenslauf. Die Storys speisen Tjarks Erzählung und ihre eigenen [BREM]/[YELVA]-Beiträge, ohne den lockeren Tisch-Ton zu kippen.

## Vorschlag 1 — Brem

**Name:** Brem Halbgroschen, Streuner, ~28, geboren in Festum (Nordmarken-Hafenviertel).

**Kurzbiographie:**
- Sohn einer Phex-gefälligen Beutelschneiderin („Mira Halbgroschen“) und eines unbekannten thorwalschen Seefahrers. Wuchs in einer Schmugglerschenke nahe der Festumer Hafenmauer auf, lernte Würfeln vor dem Lesen.
- Mit 14 in eine Gauner-„Zunft“ aufgenommen, die im Schatten der echten Phex-Kirche operierte. Spezialität: Markt-Beutelschnitt und „Botengänge“ für einen Hesinde-nahen Antiquar, der gestohlene Bücher umschlug.
- **Der Bruch:** Mit 22 sollte Brem einen schlafenden Hesinde-Geweihten bestehlen, der ein verbotenes Borbarad-Manuskript hütete. Brem nahm das Buch — und ließ es im letzten Moment am Altar liegen, weil ihm beim Lesen der ersten Zeile schlecht wurde. Seine Zunft erfuhr es. Seine Mutter deckte ihn, wurde dafür von den eigenen Leuten verraten und sitzt seither in den Festumer Kerkern.
- Seitdem zieht Brem südwärts, nimmt kleine Aufträge, sucht heimlich nach dem Bestechungsgeld, das seine Mutter freikaufen würde — und tut nach außen so, als sei ihm alles egal.

**Brüche & Spielbarkeit:**
- *Pragmatiker mit Schuldkonto:* Trocken, geldgierig wirkend — in Wahrheit spart er für eine Frau, von der er nie spricht.
- *Phex ja, aber leise:* Er flucht bei Phex, betritt aber keine Tempel. Mit Hesinde-Geweihten geht er um wie mit heißem Brei.
- *Borbarad-Allergie:* Bei Andeutungen über Schwarze Magie wird er sonst nicht zickig — hier schon. Yelva merkt das und neckt ihn dafür, ohne den Grund zu kennen.
- *Mutter-Witz:* Yelvas „Deine Mutter war Diebin, Brem.“ bekommt einen doppelten Boden — Brem grinst und antwortet, aber innerlich trifft es.

## Vorschlag 2 — Yelva

**Name:** Yelva nin' Salwiel („vom singenden Wasser“), Auelfe, ~135 Jahre (für eine Elfe Mitte 30), aus der Sippe der Salwiel am Großen Fluss zwischen Donnerbach und Honingen.

**Kurzbiographie:**
- Aufgewachsen in einer Auenelfen-Sippe, die nach dem Trallop-Vertrag in losen Sommerlagern am Großen Fluss zog. Lernte Bogen, Heilen und das Lied wie alle anderen — galt aber früh als die *Neugierige*, die in Honinger Tavernen verschwand und mit menschlichen Gassenkindern Reime tauschte.
- Mit ~80 verliebte sich Yelva in einen menschlichen Praios-Adepten, der sie heimlich mit ins Tempelarchiv nahm. Sie las dort von ihrer eigenen Sippe in einer alten Chronik — und stieß auf einen Eintrag, den Elfen nicht lesen sollen: Ihre Sippenältesten hatten vor 200 Jahren ein menschliches Dorf verdursten lassen, weil es einen Flussarm umleitete. Schweigen wurde als „Harmonie“ verkauft.
- **Der Bruch:** Sie stellte die Ältesten zur Rede. Diese verlangten Schweigen im Namen des Liedes. Yelva sang stattdessen die Wahrheit in einem Heimat-Lied — vor versammelter Sippe. Sie wurde nicht verstoßen, sondern *fortgesungen*: eine sanfte, aber endgültige Bitte, zu gehen. Der Praios-Adept hat sie nie wieder gesehen; sie nimmt an, dass die Sippe ihn auf dem Heimweg verschwinden ließ. Beweisen kann sie es nicht.
- Seitdem hält sie sich an Menschen, weil sie unter Elfen nicht mehr klar sieht — fürchtet aber, dass die Trauer um den Adepten und der Hass auf die eigenen Ältesten sie *badoc* werden lassen.

**Brüche & Spielbarkeit:**
- *Sippe-Thema:* Wenn jemand naiv von „den Elfen“ schwärmt, wird Yelva spitz. Sie verteidigt Elfen nach außen, glaubt selbst aber nicht mehr alles.
- *Praios-Reflex:* Praios-Geweihte machen sie still. Sie redet nicht darüber, aber wer sie kennt, merkt es.
- *Brem necken als Selbstschutz:* Brems lockere Art ist ihr Anker gegen das eigene Grübeln. Daher die Frotzelei.
- *Magie mit Risiko:* Jeder größere Zauber ist für sie ein leiser Test, ob das Lied sie noch trägt — sie sagt es nicht, aber Tjark darf gelegentlich andeuten, dass sie nach einem starken Zauber einen Moment lauscht.

## Umsetzung im Code

Neue Datei `src/game/dsa/lore/companions.ts` mit zwei Exporten:
- `DSA_BREM_BRIEF` — Kompakter Lore-Block (~25 Zeilen) im Stil der bestehenden Lore-Dateien: Herkunft, der Bruch, Spielleitplanken (was Tjark/Brem sagt / nicht sagt), 3–4 Beispielzeilen.
- `DSA_YELVA_BACKSTORY` — Analog für Yelva. Wird **zusätzlich** zum bestehenden `DSA_AUELFEN_BRIEF` eingebunden, nicht statt.

Einbindung:
- `src/game/dsa/llmMasterPrompt.ts` — beide Briefs in den Solo-Master-Prompt einfügen, dort wo schon `DSA_LORE_BRIEF` referenziert wird.
- `src/game/dsa/group/prompt.ts` — selbe Briefs nur einfügen, wenn `includeCompanions === true`.
- `src/game/dsa/lore/index.ts` — Re-Export beider Konstanten.

Memory:
- Neuer Eintrag unter `mem/features/companion-backstories.md` mit den Kern-Fakten (Brems Mutter in Festumer Kerker, Yelvas „fortgesungen“, Praios-Adept, Borbarad-Allergie), damit spätere Änderungen die Storys nicht aus Versehen brechen. Im Index unter „Memories“ verlinken.

## Offene Frage

Brems Hintergrund verankert ihn in **Festum / Nordmarken** mit Phex-Zunft + Borbarad-Touch. Yelva bekommt eine **Praios-Liebes-Episode** und einen moralischen Bruch mit ihrer Sippe.

Soll ich diese beiden Storys so umsetzen, oder willst du an einer der beiden noch schrauben (z.B. anderer Bruch für Brem, andere Region für Yelvas Sippe, keine Liebesgeschichte)?
