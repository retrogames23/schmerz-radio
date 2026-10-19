import type { DialogTree } from "../types";

export const insaDialogs: Record<string, DialogTree> = {
  insa1: {
    id: "insa1",
    start: "i1",
    lines: {
      i1: {
        id: "i1",
        speaker: "SYSTEM",
        text: "[ Layard hebt den Hörer. Wählt 001. Eine Frauenstimme. ]",
        next: "i2",
      },
      i2: {
        id: "i2",
        speaker: "INSA",
        text: "Hier ist die Leitstelle E67, Sie sprechen mit Insa Bauerfeind. Ihr Anliegen?",
        subtext: "Erschöpfung. Routine.",
        next: "i3",
      },
      i3: {
        id: "i3",
        speaker: "LAYARD",
        text: "Mein Name ist Layard Worag, Zimmer 2611. Es könnte sich um einen medizinischen Notfall handeln.",
        next: "i4",
      },
      i4: {
        id: "i4",
        speaker: "INSA",
        text: "Bleiben Sie bitte in der Leitung, ich verbinde Sie gleich. Haben Sie mehr Angaben?",
        next: "i5",
      },
      i5: {
        id: "i5",
        speaker: "LAYARD",
        text: "Ich bin in 2613, bei meinem Nachbarn Philippe. Aus der Nebenwohnung — 2615 — hören wir seit Tagen ein Klopfen. Niemand öffnet. Auf Rufe keine Reaktion.",
        next: "i6",
      },
      i6: {
        id: "i6",
        speaker: "INSA",
        text: "Ich verstehe. Ich schicke ein Technik-Team und den diensthabenden Block-Sanitäter. Er kann weitere Kräfte mobilisieren, falls notwendig.",
        next: "i7",
      },
      i7: {
        id: "i7",
        speaker: "SYSTEM",
        text: "[ Hörer eingehängt. Ruhe stellt sich ein. Gleichzeitig: peinliche Stille zwischen Layard und Philippe. Worüber jetzt noch reden? ]",
        end: true,
      },
    },
  },
  insa2a: {
    id: "insa2a",
    start: "ia1",
    lines: {
      ia1: {
        id: "ia1",
        speaker: "SYSTEM",
        text: "[ Vermittlung: „Worum geht es, Herr Worag?“ — „Ich muss ein Protokoll dem Abschnittsverantwortlichen aushändigen. Er ist nicht da.“ ]",
        next: "ia2",
      },
      ia2: {
        id: "ia2",
        speaker: "INSA",
        text: "Bauerfeind. — Worag, Sie schon wieder.",
        subtext: "Sie wartet auf etwas. Nicht auf den Feierabend.",
        next: "ia3",
      },
      ia3: {
        id: "ia3",
        speaker: "LAYARD",
        text: "Der Abschnittsverantwortliche von E67 ist nicht da. Ich habe das Protokoll.",
        next: "ia4",
      },
      ia4: {
        id: "ia4",
        speaker: "INSA",
        text: "Der Dienst ist heute in E67 nicht besetzt. Es gibt Engpässe im Dienstplan wegen Krankheiten und …",
        subtext: "Den Satz beendet sie nicht.",
        next: "ia5",
      },
      ia5: {
        id: "ia5",
        speaker: "INSA",
        text: "Gehen Sie bitte zu E71, Zimmer 1534. Sie haben heute die Abschnittsverantwortung auch für E67 übernommen.",
        next: "ia6",
      },
      ia6: {
        id: "ia6",
        speaker: "LAYARD",
        text: "E71. Ich war noch nie dort.",
        next: "ia7",
      },
      ia7: {
        id: "ia7",
        speaker: "INSA",
        text: "Bitte melden Sie zuvor Ihren Ausgang elektronisch beim ZENTRAL.NETZ. Nutzer-Verzeichnis → LEITSTELLE25@ZENTRAL.NETZ. Standardprotokoll.",
        next: "ia8",
      },
      ia8: {
        id: "ia8",
        speaker: "SYSTEM",
        text: "[ Hörer eingehängt. Im Terminal: Eingang einer Nachricht der Leitstelle E67 mit der Anweisung. ]",
        end: true,
      },
    },
  },
  insaDispatch: {
    id: "insaDispatch",
    start: "id1",
    lines: {
      id1: {
        id: "id1",
        speaker: "SYSTEM",
        text: "[ Layard hebt den Hörer. Wählt 001. Vermittlung. Insa, schon wieder. ]",
        next: "id2",
      },
      id2: {
        id: "id2",
        speaker: "INSA",
        text: "Bauerfeind. — Worag, schon wieder. Was brauchen Sie?",
        subtext: "Keine Genervtheit. Eher: Aufmerksamkeit.",
        choices: [
          {
            text: "Ich komme nicht durchs Netz. Error 4567.",
            next: "idNet1",
            hiddenWhen: ["calledStegmann"],
          },
          {
            text: "Ich brauche einen Code für die Quadrantenschleuse.",
            next: "idCode1",
          },
        ],
      },
      // ── Pfad A: Layard meldet die Störung → Pallasch (Netz-Hotline) (Standardweg).
      idNet1: {
        id: "idNet1",
        speaker: "INSA",
        text: "Ich verstehe. Ich stelle Sie durch zum Verantwortlichen für das Zentralnetz.",
        subtext: "Sie merkt nicht an, dass das ungewöhnlich ist. Es ist es nicht.",
        next: "idNet2",
      },
      idNet2: {
        id: "idNet2",
        speaker: "SYSTEM",
        text: "[ Wartetonschleife. Acht Sekunden. Ein Knacken. Eine Männerstimme. ]",
        next: "idNet3",
      },
      idNet3: {
        id: "idNet3",
        speaker: "STEGMANN",
        text: "Hier ist die technische Unterstützung des Zentralen Netzes, Pallasch am Apparat. — Bauerfeind hat Sie wegen einer Netzstörung durchgestellt. Error-Nummer, bitte. Und in einem Satz: Was wollten Sie übers Netz erledigen, bevor es klemmte?",
        next: "idNet4",
      },
      idNet4: {
        id: "idNet4",
        speaker: "LAYARD",
        text: "Ich muss mich mit dem Zentralen Netz verbinden, um einen Ausgang zu melden. Verbindung gestört. Error 4567.",
        next: "idNet5",
      },
      idNet5: {
        id: "idNet5",
        speaker: "STEGMANN",
        text: "Verstanden. Bitte tippen Sie im Terminal: »sysupdate«. Damit wird CentralOS über das lokale E67-Netz aktualisiert.",
        next: "idNet6",
      },
      idNet6: {
        id: "idNet6",
        speaker: "STEGMANN",
        text: "Danach tippen Sie: »trouble net«. Die automatische Problemermittlung leitet Ihren Fehler an die Gateway-Verantwortlichen weiter. Details schicke ich Ihnen ins Terminal-Postfach.",
        next: "idNet7",
      },
      idNet7: {
        id: "idNet7",
        speaker: "LAYARD",
        text: "Verstanden.",
        next: "idNet8",
      },
      idNet8: {
        id: "idNet8",
        speaker: "SYSTEM",
        text: "[ Hörer eingehängt. Pallasch hatte denselben monotonen Tonfall wie die automatischen Ansagen der B2-Kantine. ]",
        choices: [
          {
            text: "▣ Beenden",
            action: (api) => {
              api.setFlag("calledStegmann");
            },
          },
        ],
      },
      // ── Pfad B: Layard fragt direkt nach dem Code.
      idCode1: {
        id: "idCode1",
        speaker: "INSA",
        text: "Den Code. — Da muss ich Sie enttäuschen, Worag: Schleusen-Codes gibt die Leitstelle nicht heraus. Nicht mehr seit '95. Das macht Oberverwalter Vossbeck persönlich, Etage 3, Tür 3603 — direkt neben der Kantine 3602.",
        subtext: "Sie sagt es, als hätte sie den Satz schon hundertmal aufgesagt. Vermutlich hat sie das.",
        next: "idCode2",
      },
      idCode2: {
        id: "idCode2",
        speaker: "INSA",
        text: "Ein Insider-Tipp, Worag: gehen Sie nicht stur durch Tür 3603. Vossbeck winkt jeden ab, der ohne Formblatt 17/V kommt. Sprechen Sie vorher mit Frau Kowalk — linker Tresen, Kantine 3602. Die weiß, wie man bei Vossbeck reinkommt.",
        subtext: "Sie sagt »Kowalk« mit einem Hauch Respekt, der ihr selbst auffällt.",
        next: "idCode3",
      },
      idCode3: {
        id: "idCode3",
        speaker: "INSA",
        text: "Sobald Vossbeck den Code freigibt, landet er direkt in Ihrem Terminal-Postfach. Sie müssen mich nicht zurückrufen. Auf Wiederhören, Worag.",
        subtext: "Kein Tonfall von Auftrag. Eher: jemand, der einen Ablauf vorliest.",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            action: (api) => {
              api.setFlag("insaSentToKowalkForCode");
            },
          },
          {
            text: "Eine Frage noch — was ist mit dem Netz?",
            next: "idNet1",
            action: (api) => {
              api.setFlag("insaSentToKowalkForCode");
            },
          },
        ],
      },
    },
  },
  insa2: {
    id: "insa2",
    start: "x1",
    lines: {
      x1: {
        id: "x1",
        speaker: "SYSTEM",
        text: "[ Erneuter Anruf. Vermittlung. Insa, zum dritten Mal heute. ]",
        next: "x2",
      },
      x2: {
        id: "x2",
        speaker: "INSA",
        text: "Worag. Sie haben den Gateway-Fehler gemeldet. Sehr korrekt. Die meisten ignorieren so etwas.",
        // Diese Variante nur, wenn Layard tatsächlich „trouble net" abgeschickt
        // hat. Sonst überspringt die Engine die Zeile und nimmt x2alt.
        requires: ["troubleReported"],
        next: "x2alt",
      },
      // Alternative Eröffnung: Layard ist über den Tap-Pfad zurück und hat
      // nie eine Gateway-Meldung gemacht. Insa registriert nur, dass er
      // die Probe geliefert hat.
      x2alt: {
        id: "x2alt",
        speaker: "INSA",
        text: "Worag. Vier-Drei-Eins-Sieben ist sauber raus. Sie haben sich da nicht beirren lassen. Das fällt auf.",
        subtext: "Sie sagt »fällt auf«, als wäre es das Höchste, was sie zu vergeben hat.",
        hiddenWhen: ["troubleReported"],
        next: "x3",
      },
      x3: {
        id: "x3",
        speaker: "LAYARD",
        text: "Ich brauche jetzt einen Code für die Quadrantenschleuse.",
        next: "x4pflicht1",
      },
      // Sicherheits-Fallback: sollte Layard hier landen, ohne dass der
      // Vorgang sauber ist, weist Insa noch einmal auf 4317 hin. Im
      // Standardfluss ist `receivedTillaTransfer` zu diesem Zeitpunkt
      // gesetzt (Phone-Hotspot routet sonst nicht auf insa2).
      x4pflicht1: {
        id: "x4pflicht1",
        speaker: "INSA",
        text: "Worag — Ihr Vorgang hängt noch. Casenummer Vier-Drei-Eins-Sieben. Solange der Block auf Ihrem Datensatz steht, kann ich den Code nicht herausgeben.",
        subtext: "Sachlich. Es ist keine Drohung, es ist eine Reihenfolge.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "x4pflicht2",
      },
      x4pflicht2: {
        id: "x4pflicht2",
        speaker: "INSA",
        text: "Frau Kowalk in 3602 weiß, was zu tun ist. Sobald die Antwort aus E70-K bei Ihnen aus dem Rohr fällt, rufen Sie mich noch einmal an.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "x4",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
          },
        ],
      },
      x4: {
        id: "x4",
        speaker: "INSA",
        text: "Sie haben das wirklich durchgezogen, Worag. Den Code lege ich Ihnen jetzt ins Terminal. Sie wissen schon: das Datum.",
        subtext: "Eine Spur Bewunderung, sauber unterdrückt.",
        requires: ["receivedTillaTransfer"],
        next: "x5",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            next: "x7",
          },
          {
            text: "Ich verstehe nicht.",
            next: "x4help1",
          },
          {
            text: "Pause … [Schmerz-Radio aktiv lassen]",
            requiresRadio: true,
            next: "x6radio",
          },
        ],
      },
      x4help1: {
        id: "x4help1",
        speaker: "INSA",
        text: "Sie öffnen Ihr Terminal. Im Posteingang liegt eine Nachricht von der Leitstelle. Lesen Sie das Datum darin — und tippen Sie es ohne Punkte ein. Acht Ziffern. Nicht mehr, nicht weniger.",
        subtext: "Sie spricht langsam. Wie zu jemandem, der lange nichts gelesen hat.",
        next: "x4help2",
      },
      x4help2: {
        id: "x4help2",
        speaker: "INSA",
        text: "Beispiel — wenn da steht 14.03.1985, dann tippen Sie 14031985. Verstanden, Herr Worag?",
        next: "x4help3",
      },
      x4help3: {
        id: "x4help3",
        speaker: "LAYARD",
        text: "Verstanden. Auf Wiederhören.",
        next: "x7",
      },
      x6radio: {
        id: "x6radio",
        speaker: "INSA",
        text: "[Pause] … Herr Worag. Haben Sie eigentlich schon mal E67 verlassen?",
        subtext: "Sie fragt das nicht aus Höflichkeit.",
        next: "x6b",
      },
      x6b: {
        id: "x6b",
        speaker: "LAYARD",
        text: "… Nein.",
        next: "x6c",
      },
      x6c: {
        id: "x6c",
        speaker: "INSA",
        text: "Heute könnten Sie. Auf Wiederhören.",
        next: "x7",
      },
      x7: {
        id: "x7",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt jetzt eine Nachricht. Datum: 06.11.1997. Code-Format: ohne Punkte. Acht Ziffern. ]",
        end: true,
      },
    },
  },
  insaReminder5610: {
    id: "insaReminder5610",
    start: "r1",
    lines: {
      r1: {
        id: "r1",
        speaker: "SYSTEM",
        text: "[ Vermittlung. Insa hebt nach dem zweiten Klingeln ab. ]",
        next: "r2",
      },
      r2: {
        id: "r2",
        speaker: "INSA",
        text: "Worag. Vier-Drei-Eins-Sieben hängt noch. Ich sehe das hier auf dem Pult, ohne nachzuschauen.",
        subtext: "Kein Vorwurf. Eine Feststellung.",
        next: "r3",
      },
      r3: {
        id: "r3",
        speaker: "INSA",
        text: "Frau Kowalk, Kantine 3602, linker Tresen. Sobald der Bogen aus E70-K bei Ihnen aus dem Rohr fällt, ist Ihr Status sauber. Dann rufen Sie mich an — Code kommt ins Postfach.",
        next: "r4",
      },
      r4: {
        id: "r4",
        speaker: "INSA",
        text: "Auf Wiederhören.",
        end: true,
      },
    },
  },
  insaAct2Return: {
    id: "insaAct2Return",
    start: "ar1",
    onEnd: (api) => {
      // Akt II ist hiermit zu Ende. Übergang zum Akt-II-Endbildschirm.
      api.setFlag("ending");
      api.setEnding();
    },
    lines: {
      ar1: {
        id: "ar1",
        speaker: "SYSTEM",
        text: "[ Layard hebt den Hörer. Wählt 001. Vermittlung. Knacken. Insa. ]",
        next: "ar2",
      },
      ar2: {
        id: "ar2",
        speaker: "INSA",
        text: "Bauerfeind. — Worag. Schon zurück aus E71?",
        subtext: "Sie klingt nicht erstaunt. Sie hat den Aufzug-Log auf dem Schirm.",
        next: "ar3",
      },
      ar3: {
        id: "ar3",
        speaker: "LAYARD",
        text: "Stegmann nimmt das Protokoll nicht. Er hat … es ist alles voll bei ihm. Er sagt, ich soll es zurückbringen. Sie sollen es richtig zuweisen.",
        next: "ar4",
      },
      ar4: {
        id: "ar4",
        speaker: "INSA",
        text: "[ … ]",
        subtext: "Zwei Sekunden Stille. Drei. Dann ein Atemzug.",
        next: "ar5",
      },
      ar5: {
        id: "ar5",
        speaker: "INSA",
        text: "Das überrascht mich nicht.",
        subtext: "Zum ersten Mal heute kein Dienstton. Nur eine Stimme.",
        next: "ar6",
      },
      ar6: {
        id: "ar6",
        speaker: "LAYARD",
        text: "Wem soll ich es dann geben?",
        next: "ar7",
      },
      ar7: {
        id: "ar7",
        speaker: "INSA",
        text: "Heute — niemandem. Morgen vielleicht jemandem, den ich noch nicht kenne. — Herr Worag …",
        next: "ar8",
      },
      ar8: {
        id: "ar8",
        speaker: "INSA",
        text: "Ich vermittle seit elf Monaten Protokolle, die niemand annimmt. Sie sind heute der erste, der eines zurückbringt, statt es als „verloren“ zu melden.",
        subtext: "Sie sagt es leise. Wie etwas, das sie noch nie laut gesagt hat.",
        next: "ar9",
      },
      ar9: {
        id: "ar9",
        speaker: "LAYARD",
        text: "Ich wusste nicht, dass das eine Option ist. „Verloren melden“.",
        next: "ar10",
      },
      ar10: {
        id: "ar10",
        speaker: "INSA",
        text: "Es ist die häufigste. Sie ist im Standardprotokoll auf Seite vier. Niemand liest Seite vier.",
        subtext: "Ein Hauch von etwas, das fast wie ein Lachen klingt. Aber nur fast.",
        next: "ar10burnA",
      },
      // Wenn Layard heute den Knoten 5610 zerstört hat, kommt Insa hier
      // einmal kurz darauf zurück. Sie weiß es längst — der Sektor ist
      // still. Der Tonfall hängt davon ab, wie Layard es vorhin am
      // Telefon benannt hat (Owned/Dodged). Ohne burn entfallen beide
      // Beats, Engine läuft direkt zu ar11.
      ar10burnA: {
        id: "ar10burnA",
        speaker: "INSA",
        text: "Übrigens — der Sektor ist still. Das ist, was Sie wollten. Und es ist trotzdem nicht weniger schwer.",
        subtext: "Sie sagt es ohne Vorwurf. Eher: als Befund.",
        requires: ["burnedAndOwned"],
        next: "ar10burnB",
      },
      ar10burnB: {
        id: "ar10burnB",
        speaker: "INSA",
        text: "Übrigens — der Sektor ist still. Niemand weiß, warum es Ihnen leichter geworden ist. Sie auch nicht.",
        subtext: "Sie sagt es so leise, dass Layard nicht sicher ist, ob er es richtig gehört hat.",
        requires: ["burnedAndDodged"],
        next: "ar11",
      },
      ar11: {
        id: "ar11",
        speaker: "INSA",
        text: "Hören Sie. — Bringen Sie es mir vorbei. Persönlich. Sektor-Leitstelle E67, Korridor 46, Tür 4602. Fragen Sie nach Bauerfeind. Heute. Morgen. Wann Sie wollen.",
        next: "ar12",
      },
      ar12: {
        id: "ar12",
        speaker: "INSA",
        text: "Ich möchte einfach jemanden treffen, der ein Protokoll zwei Sektoren weit getragen hat, ohne es unterwegs „zu verlieren“.",
        subtext: "Bitte. Sie hat noch nicht „bitte“ gesagt. Aber es ist einer.",
        next: "ar13",
      },
      ar13: {
        id: "ar13",
        speaker: "LAYARD",
        text: "Ich überlege es mir.",
        subtext: "Er hat es sich schon überlegt. Er weiß es nur noch nicht.",
        next: "ar14",
      },
      ar14: {
        id: "ar14",
        speaker: "INSA",
        text: "Gut. — Auf Wiederhören, Herr Worag.",
        next: "ar15",
      },
      ar15: {
        id: "ar15",
        speaker: "SYSTEM",
        text: "[ Klick. Stille. Layard legt den Hörer zurück und hält die Hand einen Moment darauf. Das Protokoll liegt neben dem Telefon. Es ist immer noch warm. ]",
        end: true,
      },
    },
  },
  insaCallbackAfterBurn: {
    id: "insaCallbackAfterBurn",
    start: "ic1",
    onEnd: (api) => {
      api.setFlag("insaCallbackBurnDone");
      // Nach dem burn-Anruf hat Insa den Code NUR DANN übergeben, wenn
      // Layard vorher beim Abschnittsverantwortlichen war (sawEmptyOffice).
      // Sonst weiß er gar nicht, wohin mit dem Protokoll — und Insa
      // kann ihm den Code nicht „einfach so“ geben. In dem Fall setzen
      // wir die Flags nicht; Layard muss erst zum leeren Büro gehen
      // und dann über das normale Telefon-Geflecht (insa2a → insa2)
      // den Code anfordern.
      if (api.hasFlag("sawEmptyOffice")) {
        api.setFlag("calledInsa2");
        api.setFlag("calledForCode");
      }
    },
    lines: {
      ic1: {
        id: "ic1",
        speaker: "SYSTEM",
        text: "[ Das Telefon klingelt. Einmal. Layard hebt ab. Insa, ohne Vorrede. ]",
        next: "ic2",
      },
      ic2: {
        id: "ic2",
        speaker: "INSA",
        text: "Worag. — In E67 ist gerade ein Vorgangsknoten ausgefallen. Der ganze Bestand des Hauses, weg. Wir haben das auf dem Pult als Alarm 4-7-7. Sagt Ihnen das was?",
        subtext: "Sie weiß die Antwort. Sie fragt trotzdem.",
        choices: [
          {
            text: "Ich habe es ausgeschaltet, weil es uns kaputtgemacht hat.",
            next: "ic4a",
            action: (api) => {
              api.setFlag("burnedAndOwned");
            },
          },
          {
            text: "Ich weiß es nicht. Ich war wütend.",
            next: "ic4b",
            action: (api) => {
              api.setFlag("burnedAndDodged");
            },
          },
        ],
      },
      ic4a: {
        id: "ic4a",
        speaker: "INSA",
        text: "Gut. Dann sind wir wenigstens ehrlich. — Hören Sie. In diesem Bestand stand, wie oft Ihr Haus gemeldet hat und wie oft man es weggeschrieben hat. Jetzt steht es nirgends mehr. Ob das Schutz war oder Vernichtung, entscheiden nicht Sie und nicht ich.",
        next: "ic5",
      },
      ic4b: {
        id: "ic4b",
        speaker: "INSA",
        text: "Doch. Sagt es. Sie waren zur richtigen Zeit am richtigen Ort. — Schon gut. Wir reden nicht weiter darüber.",
        next: "ic5",
      },
      ic5: {
        id: "ic5",
        speaker: "INSA",
        text: "Der Code für die Quadrantenschleuse liegt in Ihrem Terminal. Datum, ohne Punkte. Sie wissen, wie. Kommen Sie trotzdem rüber, Worag. Es ist heute kein guter Tag, allein zu bleiben.",
        requires: ["sawEmptyOffice"],
        next: "ic5b",
      },
      // Variante, wenn Layard noch gar nicht beim Abschnittsverantwortlichen
      // war: Insa kann ihm keinen Code geben — er weiß ja nicht einmal,
      // wohin er das Protokoll bringen soll. Sie schickt ihn erst dorthin.
      // ic5 ist dann durch `requires` versteckt; resolveVisible springt
      // entlang `next` weiter zu ic5b.
      ic5b: {
        id: "ic5b",
        speaker: "INSA",
        text: "Sie haben heute noch nicht einmal an Tür 3601 geklopft, oder? — Gehen Sie zuerst dort vorbei, Worag. Zum Abschnittsverantwortlichen E67. Ich kann Ihnen keinen Code geben für eine Tür, von der Sie nicht wissen, warum Sie sie aufmachen.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "ic5bOk",
      },
      ic5bOk: {
        id: "ic5bOk",
        speaker: "LAYARD",
        text: "Tür 3601. Verstanden.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "ic6",
      },
      ic6: {
        id: "ic6",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt eine Nachricht der Leitstelle. Datum: 06.11.1997. Acht Ziffern, ohne Punkte. ]",
        requires: ["sawEmptyOffice"],
        end: true,
      },
    },
  },
  insaLobbyEscalation: {
    id: "insaLobbyEscalation",
    start: "le1",
    lines: {
      le1: {
        id: "le1",
        speaker: "SYSTEM",
        text: "[ Aus dem winzigen Lautsprecher der Schleuse: ein Klacken. Eine Verbindung. Insa, am anderen Ende. ]",
        next: "le2",
      },
      le2: {
        id: "le2",
        speaker: "INSA",
        text: "Bauerfeind. — Worag, das war jetzt der dritte Versuch. Standardprotokoll sagt: ich rufe Sie an, bevor die Anlage es tut.",
        subtext: "Keine Genervtheit. Eher: Routine, die sich Mühe gibt.",
        next: "le3",
      },
      le3: {
        id: "le3",
        speaker: "INSA",
        text: "Ihr Bewohner-Code ist die Wohnungsnummer modulo zehntausend. Steht im Handbuch, §2 Abs. 7. — Ich gebe Ihnen für heute frei. Aber lesen Sie das Kapitel, ja?",
        next: "le4",
      },
      le4: {
        id: "le4",
        speaker: "LAYARD",
        text: "Verstanden. Danke, Frau Bauerfeind.",
        next: "le5",
      },
      le5: {
        id: "le5",
        speaker: "SYSTEM",
        text: "[ Ein Summen, dann ein hörbares Klacken in der Verriegelung. Die Schleuse ist offen. ]",
        end: true,
      },
    },
  },
  insaWaitingForTransfer: {
    id: "insaWaitingForTransfer",
    start: "iw1",
    lines: {
      iw1: {
        id: "iw1",
        speaker: "SYSTEM",
        text: "[ Vermittlung. Insa. Im Hintergrund: das stete Klacken einer Tastatur. ]",
        next: "iw2",
      },
      iw2: {
        id: "iw2",
        speaker: "INSA",
        text: "Worag. Bevor Sie fragen — der Code liegt fertig. Aber Ihr Datensatz hat einen Vorgangsblock. Stamm Vier-Drei-Eins-Sieben, mitverknüpft an Ihrer Adresse. Solange der offen ist, gibt das Pult keinen Code raus.",
        subtext: "Sie sagt das ruhig. Es ist keine Drohung. Es ist eine Reihenfolge im System.",
        next: "iw3",
      },
      iw3: {
        id: "iw3",
        speaker: "INSA",
        text: "Praktisch: am Vorgang hängt Frau Kowalks Tochter — 4317-K. Solange diese Quittung nicht durch ist, bleibt der Stamm offen. Sie wissen, wie das geht: Ausgabestelle, Quittung Schicht B, Rohrpost.",
        next: "iw3b",
      },
      iw3b: {
        id: "iw3b",
        speaker: "INSA",
        text: "Frau Kowalk steht unten an der Nährstoffausgabe — Kantine 3602, E67, Schicht B. Graue Haare, Kittel, immer am linken Tresen. Sie kennt den Vorgang. Reden Sie mit ihr, nicht mit Brust.",
        subtext: "»Reden Sie mit ihr, nicht mit Brust.« — eine kleine Warnung, ruhig hingelegt.",
        next: "iw3c",
      },
      iw3c: {
        id: "iw3c",
        speaker: "INSA",
        text: "Eins noch, Worag: E70-K nimmt die Quittung nur an, wenn die Stamm-Vollmacht frisch gegengezeichnet ist. Wer das gerade entscheidet, sagt Ihnen Frau Kowalk. Es wird Ihnen nicht gefallen.",
        next: "iw4",
      },
      iw4: {
        id: "iw4",
        speaker: "INSA",
        text: "Sobald der Bogen bei Ihnen aus dem Rohr fällt, ist Ihr Status sauber. Dann rufen Sie mich noch einmal an — Code kommt ins Postfach. Auf Wiederhören, Worag.",
        end: true,
      },
    },
  },
  // ── Akt II · Erste persönliche Begegnung in der Leitstelle (4602) ──
  insaAct2InPerson: {
    id: "insaAct2InPerson",
    start: "ip1",
    onEnd: (api) => {
      api.setFlag("insaAct2BriefingDone");
      api.removeItem("protocol");
    },
    lines: {
      ip1: {
        id: "ip1",
        speaker: "SYSTEM",
        text: "[ Layard ist gekommen, wie sie ihn gebeten hat. Drei Apparate, einer abgehoben. Insa schiebt einen zweiten Becher über den Tisch und wartet, bis er sitzt. ]",
        next: "ip2",
      },
      ip2: {
        id: "ip2",
        speaker: "INSA",
        text: "Worag. Sie sind gekommen. Gut. — Dann legen Sie es hin.",
        subtext: "Sie sagt es ohne Nachdruck, als wäre es das Selbstverständlichste der Welt.",
        next: "ip3",
      },
      ip3: {
        id: "ip3",
        speaker: "SYSTEM",
        text: "[ Layard legt das Einsatzprotokoll auf den Tisch. Insa dreht es einmal, liest das Etikett, legt es auf ihren Stapel. Nicht darunter. Darauf. ]",
        next: "ip4",
      },
      ip4: {
        id: "ip4",
        speaker: "LAYARD",
        text: "Stegmann hat es nicht angenommen.",
        next: "ip5",
      },
      ip5: {
        id: "ip5",
        speaker: "INSA",
        text: "Ich weiß. Das ist nicht Ihr Fehler und nicht Ihre Zuständigkeit. Ich weise es richtig zu.",
        subtext: "Es klingt nicht nach Trost. Es klingt nach einem Vorgang, der endlich in der richtigen Hand liegt.",
        choices: [
          {
            text: "Was passiert jetzt damit?",
            next: "ip6",
          },
          {
            text: "Ich hätte es auch einfach liegen lassen können.",
            next: "ip6b",
          },
          {
            text: "Danke. Dann bin ich fertig.",
            next: "ip7",
          },
        ],
      },
      ip6: {
        id: "ip6",
        speaker: "INSA",
        text: "Es bekommt eine Nummer, eine Frist und einen Namen, der nicht Ihrer ist. Mehr passiert nicht. Das ist keine Enttäuschung — das ist der Sinn der Sache.",
        next: "ip7",
      },
      ip6b: {
        id: "ip6b",
        speaker: "INSA",
        text: "Hätten Sie. Haben Sie aber nicht. — Ich schreibe das nirgends hin, aber ich merke es mir.",
        subtext: "Der erste Satz heute, der nicht nach Vermittlung klingt.",
        next: "ip7",
      },
      ip7: {
        id: "ip7",
        speaker: "INSA",
        text: "Trinken Sie den Tee drüben aus, Worag. Sie sehen aus, als hätten Sie einen langen Tag gehabt. Und morgen ist auch noch einer.",
        subtext: "Sie greift schon nach dem abgehobenen Hörer. Der Rest des Sektors wartet.",
        end: true,
      },
    },
  },
  insaAct2InPersonAfter: {
    id: "insaAct2InPersonAfter",
    start: "ipa1",
    lines: {
      ipa1: {
        id: "ipa1",
        speaker: "INSA",
        text: "Worag. Das Protokoll liegt, wo es hingehört. Wenn Sie nichts Neues haben, lassen Sie mich an die drei Hörer — es klingelt sonst gleich.",
        subtext: "Sie meint es nicht unfreundlich. Aber sie meint es.",
        choices: [
          {
            text: "Eine Frage noch. — Warum bin ich so, wie ich bin?",
            next: "ipaQ",
          },
          {
            text: "Nichts Neues. Ich gehe weiter.",
            endsDialog: true,
          },
        ],
      },
      ipaQ: {
        id: "ipaQ",
        speaker: "INSA",
        text: "Darauf habe ich keine Antwort, die auf ein Formblatt passt. Und andere habe ich hier nicht.",
        subtext: "Es ist keine Ausflucht. Sie meint genau das.",
        end: true,
      },
      ipa2: {
        id: "ipa2",
        speaker: "INSA",
        text: "Gehen Sie nach Hause. Auf Wiederhören, Worag.",
        end: true,
      },
    },
  },
};
