## 1. Wartungskarte als Bodo-Gefälligkeit (entschieden: vor dem Gehen)

In `bodoLeavesForB3` (`src/game/dialogs.ts`, um `bc10`/`bc11`) zwei neue Lines vor dem Türschließen einfügen:

- Bodo zieht die abgegriffene blaue Karte aus der Schublade: „Wenn Sie eh hier sitzen, Worag — tun Sie mir einen Gefallen. 5610, Tech-Knoten Korridor 56. Ich war gestern dran, hab' aber meine Thermoskanne stehenlassen. Sichtprüfung mache ich selber, holen Sie nur das Ding raus."
- „Karte behalten Sie. An der Tür weiß keiner mehr, dass es die noch gibt. Mir lieber bei Ihnen als im Schubfach."
- `action`: vergibt `wartungsnotiz5610` und setzt einen neuen Flag `bodoGaveWartungskarte` (ersetzt `pickedWartungskarteAtBodoTerminal`).

Folgeänderungen:
- `src/components/game/Terminal.tsx` (Bodo-Modus, `maint list` ~Z. 2247): Auto-Pickup entfernen. Der Listing-Eintrag „5610 · OFFEN · letzte: 02.11.1997 · B. Marschke" bleibt — er bestätigt jetzt nur noch, dass Bodos Auftrag echt ist.
- `src/game/GameContext.tsx` `closeTerminal` (~Z. 628–645): Pickup-Overlay entfernen.
- `src/game/types.ts`: `pickedWartungskarteAtBodoTerminal` und `notedWartungskartePickup` entfernen, `bodoGaveWartungskarte` hinzufügen.

## 2. Vollmachts-/Kowalk-Rätsel

### 2A. Marteau-Nennung diegetisch absichern
In `kSideA1` Subtext ergänzen, dass Kowalk auf die Vollmacht in ihrer Hand tippt, bevor sie den Namen ausspricht — damit ist klar, dass sie Marteau gerade abliest, nicht aus dem Nichts kennt.

### 2B. Insa-Auftrag bei Kowalk + Brücke zu Philippe (entscheidender Punkt)

**Kern-Mechanik (neue Bürokratie-Pointe):** 4317 ist Philippes Bewohnervertretungs-Code aus Schicht A. 4317-K ist die K-Variante derselben Akte — dieselbe Nummer, weil Tilla Kowalk damals in derselben Schicht-A-Liste geführt wurde wie Philippe. Beide Vorgänge laufen historisch über dieselbe Aktennummer. Diese Tatsache ist die Brücke, die der Spieler bei Kowalk lernt.

Konkrete Dialog-Erweiterung in `cafeteriaKowalk` (`src/game/dialogs.ts`):

Neue Hub-Option in `k0`, sichtbar wenn `insaGaveTransferTask` und nicht `gotTillaTransferInfo`:
- „[ Insas Auftrag ] Insa hat mich geschickt. Quittung 4317-K — Transferbogen für Ihre Tochter."

Neuer Strang `kInsa1`–`kInsa4`:
1. Kowalk wird einen Moment still. „4317-K. Ja. Das ist ihre alte Nummer. Schicht A."
2. „Wir hatten damals fünf, sechs Leute auf der Liste. Tilla. Marteau. Ein paar andere. Alle 4317, mit Buchstabe hintendran. Heute ist Tilla die Einzige, die noch eine offene Akte hat. — Außer Marteau."
3. Setzt `gotTillaTransferInfo` und — entscheidend — `learnedMarteauPhilippeLink`.
4. Anweisung zum Mechanismus: Quittung-Schicht-B ans linke Pneumatikrohr, Antwort kommt zurück. „Ich darf das selber nicht abschicken. Aushang. Aber Sie können."
5. Bei Variante mit `metPhilippe` zusätzlich: „Wenn Sie Marteau mal sehen — der war das Pendant auf der Männer-Liste. Selbe Nummer, anderer Buchstabe. Er weiß, was 4317 heißt."

**Wirkung für die Dramaturgie:**
- Spieler*in erfährt explizit, dass Philippes Vollmachtsnummer (4317) und Insas Quittung (4317-K) **denselben Aktenursprung** haben.
- Wenn Spieler*in Philippe danach trifft, ergibt seine pinke Vollmacht 4317 plötzlich Sinn: er war auf derselben Schicht-A-Liste wie Tilla. Die Vollmacht ist nicht zufällig, sondern Erbe derselben Verwaltungsblase.
- Wenn Spieler*in Philippe schon getroffen hat: das Klick-Moment passiert sofort bei Kowalk — sie hört seinen Namen aus Kowalks Mund und versteht, warum Insas Auftrag und Philippes Notlage zusammenhängen.

### 2C. Pfad A verschärfen (entschieden)

Pfad A im `kAuth6`-Hub bleibt, bekommt aber kumulative Bedingungen:
- `residentId` im Inventar
- `kowalkToldHerDaughter` (Tilla-Gespräch geführt)
- `metPhilippe` (echtes Treffen in 2613, nicht nur die Begegnung im Gang)
- *Optional, falls 2B umgesetzt:* zusätzlich `learnedMarteauPhilippeLink`, damit der Vertrauenspfad voraussetzt, dass die Spieler*in den Aktenzusammenhang verstanden hat.

Pfad B (Handbuch §7.1) bleibt unverändert als alternative, bürokratische Lösung.

`requires` in der Wahlmöglichkeit `kAuth6 → kSideA1` entsprechend erweitern. Wenn die Spieler*in zwar Philippe getroffen, aber Tilla-Gespräch noch nicht geführt hat, wird Pfad A nicht angeboten — das schickt sie zurück in den Hub, um zuerst über Tilla zu reden, was dramaturgisch perfekt ist.

## Betroffene Dateien
- `src/game/dialogs.ts` — `bodoLeavesForB3` (Karten-Übergabe), `cafeteriaKowalk` (Insa-Strang `kInsa*`, `kSideA1`-Subtext, `kAuth6`-Requires)
- `src/components/game/Terminal.tsx` — Auto-Pickup entfernen
- `src/game/GameContext.tsx` — `closeTerminal`-Overlay entfernen
- `src/game/types.ts` — Flags aufräumen: `bodoGaveWartungskarte`, `insaGaveTransferTask` (falls fehlend), `gotTillaTransferInfo`, `learnedMarteauPhilippeLink`; alte Pickup-Flags entfernen

## Offene Frage
Ist die 4317 / 4317-K-Brücke (gemeinsame Schicht-A-Aktennummer) erzählerisch in Ordnung, oder soll der Zusammenhang anders gebaut werden — z. B. dass Philippe selbst schon einmal versucht hat, Tillas Akte zu schließen, und Kowalk ihn deshalb kennt? Beide Varianten lassen sich umsetzen; die Aktennummern-Brücke ist die ökonomischere und nutzt eine bereits bestehende Zahlenkollision im Spiel.
