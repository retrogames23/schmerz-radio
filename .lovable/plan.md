
# Kantinen-Quest streamlinen

## Was momentan verwirrt

Wer in der Kantine steht, jongliert vier verschachtelte Stränge gleichzeitig:

1. **Insa-Auftrag**: „Quittung 4317-K für Tilla“ — kritischer Pfad.
2. **Philippe-Gefallen**: B3-Ration besorgen, dafür Vollmacht 4317 — optional.
3. **Vossbeck-Pfad**: Brust-Trainingsfälle → Bürokratie-Duell.
4. **Forgery-Pfad**: Fallback nach drei Niederlagen, mit *vier* Zutaten (Bleistift, Quittungsblanko, Siegelabdruck, Original-Aushang E71) und einem Bastelschritt an Bodos Terminal.

Die beiden Aktennummern **4317** (Philippe/Marteau) und **4317-K** (Tilla) heißen fast gleich, hängen mechanisch zusammen, werden aber in zwei verschiedenen Dialogen erklärt. Dazu kommt: Der Spieler erfährt erst *nach* dem Duell-Verlust, dass es überhaupt eine Notlösung gibt — und die führt plötzlich quer durch den Sektor (E71, Bodo).

Ergebnis: Man weiß weder, warum man gerade duelliert, noch warum man auf einmal einen Aushang holen soll.

## Designziele

- **Ein aktuelles Ziel zur Zeit.** Im Tipp-System wie im Spielablauf.
- **„Warum tue ich das?“ jederzeit aus dem Kontext beantwortbar** — ohne LORE.md zu lesen.
- **Bürokratiewahnsinn bleibt erlebbar**, aber als Komik, nicht als Hausaufgabe.
- **Kein Spielfortschritt hängt am Verstehen der Aktennummern.** Die Nummern dürfen kryptisch klingen, das *Vorgehen* muss klar sein.

## Vorschlag: Die zwei Stränge sauber trennen und stapeln

### Strang A — Tilla (kritischer Pfad, Insa)

Reihenfolge wird linear erzwungen, jeder Schritt erklärt sich aus dem Vorhergehenden:

```text
Insa: "Bring Quittung 4317-K rüber zu Frau Kowalk in der Kantine."
   ↓
Kowalk: "4317-K geht nur durch, wenn Stamm-Vorgang 4317 freigegeben ist.
         Den hat Vossbeck. Nebenan, Tür 3603."
   ↓
Vossbeck (durch Brust gefiltert): Bürokratie-Duell.
   ↓ gewonnen                            ↓ dreimal verloren
Vossbeck stempelt 4317.            Kowalk: "Lassen Sie mich das regeln."
                                   → Forgery-Pfad (siehe unten, vereinfacht)
   ↓
Kowalk schickt 4317-K per Rohrpost. Tillas Transferbogen kommt zurück.
```

Jeder dieser Knoten hat im Dialog **einen einzigen** „Was ist gerade dran?“-Satz, den Kowalk/Brust am Anfang des Dialogs sagen, wenn der Spieler zurückkommt.

### Strang B — Philippes B3-Ration (optional, separat ausgespielt)

Aktuell teilt sich Strang B den ganzen Vossbeck-Apparat mit Strang A — das ist ein Großteil der Verwirrung. Vorschlag:

- Wenn Strang A bereits gewonnen ist (4317 gestempelt), **gibt der gestempelte Vorgang automatisch B3 frei**. Kowalk drückt Layard die Dose über die Theke: „Marteau hat heute Glück, Sie haben den Vorgang sowieso freigemacht.“
- Wenn Strang A noch offen ist und Spieler trotzdem mit Vollmacht von Philippe kommt → bisheriger Pfad bleibt, ist aber als „nettes Extra“ erkennbar, nicht als Pflichtaufgabe.

Dadurch wird Philippes B3 zu einer **Belohnung** für den kritischen Pfad, nicht zu einer parallelen Pflicht. Kein Spieler muss zwei Mal duellieren.

### Forgery-Pfad — radikal vereinfachen

Aktuell: 4 Zutaten, 2 Orte, 1 fremdes Terminal. Vorschlag:

- **Streichen**: „Original-Aushang 7.1 aus E71“. Das war der Hauptauslöser des Frusts und narrativ ohnehin wackelig.
- **Streichen**: Bastelschritt an Bodos Terminal. Kowalk macht das selbst hinter der Theke.
- **Bleibt** (2 Zutaten, 1 Ort):
  - Bleistiftstummel (Bodos Tisch, 2612)
  - Quittungsblanko (Kantinentresen, holt Spieler im Dialog mit)
  - Siegelabdruck nimmt der Spieler im Inventar von Philippes Vollmacht 4317 ab.
- Kowalk sagt explizit: „Geben Sie mir die drei Sachen, ich schicke das ab. Niemand fragt nach.“
- Übergabe via Inventar-Drag oder Dialog-Choice „[ Sachen übergeben ]“.

Das hält das Forgery-Gefühl (es ist eine Fälschung, sie wird heimlich gemacht), nimmt aber die Schnitzeljagd raus.

### Aktennummern entdramatisieren

- Im UI/Tipps konsequent **„Tillas Transfer“** und **„Philippes Vollmacht“** statt 4317 / 4317-K verwenden.
- In Dialogen dürfen die Nummern fallen — als Geräusch der Bürokratie.
- Inventar-Items entsprechend benennen, damit Spieler beim Hovern sieht, wofür der Zettel gut ist.

## Tipps-System (`hints.ts`) anpassen

Die kritisch-Pfad-Quest `act1.quittung4317` wird in **drei kleine, sequenzielle** Quests aufgeteilt, von denen immer nur eine gleichzeitig „aktiv“ ist:

1. **`act1.kowalkBrief`** — „Bring Insas Auftrag zu Kowalk“ (aktiv: `insaGaveTransferTask`, gelöst: `gotTillaTransferInfo`).
   Tipp 3 nennt nur: Aufzug ins 3. OG, Korridor 36, Kantine 3602, mit Frau Kowalk reden.
2. **`act1.stamp4317`** — „Vossbeck soll 4317 stempeln“ (aktiv: `knowsVossbeckPath`, gelöst: `duelEndgameWon || kowalkOfferedForgery`).
   Verweist auf bestehende Sub-Quests `bureaucracyDuel` / `vossbeckEndgame`.
3. **`act1.send4317K`** — „Quittung 4317-K abschicken“ (aktiv: Stempel oder Forgery-OK, gelöst: `hasItem('tillaTransfer')`).
   Nach Forgery: Tipp 3 sagt nur „Bleistiftstummel + Quittungsblanko + Siegelabdruck Kowalk übergeben“ — kein E71, kein Bodo-Terminal.

Die optionale `act1.b3Authorization` wird umformuliert: „Wenn du Vossbecks Stempel hast, holt Kowalk automatisch die B3-Ration für Philippe nach. Optional vorher: direkt mit Philippe sprechen.“

## Technische Skizze (für später)

- **Dialoge**: `cafeteriaKowalk` bekommt einen neuen Eingangs-Recap-Knoten, der je nach Flag-Stand genau einen Satz Ziel ausspricht (`kRecapDynamic`).
- **Forgery**: Nodes `kForge4`/`kForge5`/`kForge6` werden auf eine Choice „[ Bleistift, Blanko und Siegelabdruck übergeben ]“ kollabiert mit `requires: ['hasPencilStub','hasBlankoQuittung','hasSealRubbing']`. Terminal-Code in `Terminal.tsx` (1646–1696) für die Forgery-Kombination wird entfernt; statt dessen setzt der Übergabe-Knoten `usedForgeryRoute` und `addItem('tillaTransfer', …)` direkt.
- **B3 als Belohnung**: In `BureaucracyDuelOverlay.tsx` setzt der Sieg zusätzlich `gotB3Ration` und addet die `b3Ration` in Layards Inventar (mit kurzem Floater „Kowalk drückt dir die Dose in die Hand.“).
- **Hints**: `act1.quittung4317` wird in drei neue Einträge gesplittet, alte Quest-ID bleibt für Save-Kompatibilität, wird aber nie mehr `isActive`.
- **Items/Flags**: `tillaTransfer` und `b3Ration` bestehen weiter; `gotB3Authorization` wird optional aber nicht mehr benötigt für Tilla.

## Was bleibt unverändert

- Bürokratie-Duell-Mechanik selbst (haben wir gerade gestreamlined).
- Insas Auftrag-Dialog.
- Philippes Charakter und Smalltalk-Notizen.
- Kowalks Tonfall, ihre Tochter-Geschichte, Brusts Paragraphen-Pedanterie.
