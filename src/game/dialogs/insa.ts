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
        subtext: "Erschöpfung. Routine. Etwas darunter.",
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
        text: "Ich bin in 2613, bei meinem Nachbarn Philippe. Aus der Nebenwohnung — 2615 — hören wir seit Stunden ein Klopfen. Niemand öffnet. Auf Rufe keine Reaktion.",
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
            text: "Ich brauche einen Code für die Sektor-Tür.",
            next: "idCode1",
          },
        ],
      },
      // ── Pfad A: Layard meldet die Störung → Stegmann (Standardweg).
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
        text: "Hier ist die technische Unterstützung des Zentralen Netzes, Stegmann am Apparat. — Bauerfeind hat Sie wegen einer Netzstörung durchgestellt. Error-Nummer, bitte. Und in einem Satz: Was wollten Sie übers Netz erledigen, bevor es klemmte?",
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
        text: "[ Hörer eingehängt. Stegmann hatte denselben monotonen Tonfall wie die automatischen Ansagen der B2-Kantine. ]",
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
        text: "Den Code. — Eine Sekunde, Herr Worag. Ich schaue auf Ihre Vorgangsspur. — Es ist da eine Sache.",
        subtext: "Tastenklacken. Sie liest etwas, das ihr nicht gefällt.",
        next: "idCode2",
      },
      idCode2: {
        id: "idCode2",
        speaker: "INSA",
        text: "Den Verantwortlichen fürs Zentrale Netz kann ich Ihnen geben, falls noch etwas hängt. Aber egal was — ohne sauberen Status komme ich an Ihren Code nicht heran.",
        choices: [
          {
            text: "Verbinden Sie mich. Ich versuche es noch.",
            next: "idNet1",
          },
          {
            text: "Lassen wir das Netz. Was hängt bei mir?",
            // Engine resolved nach Sichtbarkeit:
            //  - Vorgang erledigt (receivedTillaTransfer) → idPflichtSkip
            //    sichtbar → idCode4 (Code-Ausgabe).
            //  - Vorgang offen → idPflichtSkip hidden, Engine läuft über
            //    idPflichtCheck → idPflicht1..4 (4317-Hinweis).
            next: "idPflichtSkip",
          },
        ],
      },
      // Verzweigung: Ist Layards Stamm-Vorgang 4317 sauber abgeschlossen
      // (receivedTillaTransfer)? Dann gibt Insa den Code heraus. Wenn nicht,
      // weist sie auf die offene Akte hin und verweist auf Frau Kowalk.
      idPflichtCheck: {
        id: "idPflichtCheck",
        speaker: "SYSTEM",
        text: "[ Insa scrollt durch eine Liste, dreht den Bildschirm leicht weg. ]",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idPflicht1",
      },
      // Hinweis-Pfad — nur wenn Vorgang 4317 noch offen ist.
      idPflicht1: {
        id: "idPflicht1",
        speaker: "INSA",
        text: "Bei Ihnen ist ein Vorgang als offen markiert, Herr Worag. Stamm-Vorgang Vier-Drei-Eins-Sieben. An Ihrer Adresse mitverknüpft, weil 2613 und 2611 in einer Sammelakte hängen.",
        subtext: "Sie sagt das ohne Schärfe. Es ist eine Standzeile aus ihrem Pult.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idPflicht2",
      },
      idPflicht2: {
        id: "idPflicht2",
        speaker: "INSA",
        text: "Solange das so bleibt, läuft Ihr Protokoll bei der Annahme nicht durch. Der Code für die Sektor-Tür ist bei mir aus dem gleichen Grund gesperrt — Vorgangsblock auf Ihrem Datensatz.",
        subtext: "Sie sagt »gesperrt«, als wäre es ein Wetterbericht.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idPflicht2b",
      },
      idPflicht2b: {
        id: "idPflicht2b",
        speaker: "INSA",
        text: "Ich habe Ihnen die Vorgangs-Notiz schon ins Terminal gelegt — kommt automatisch, sobald ein Block auftaucht. Da steht alles drin, was Sie wissen müssen, um es zu räumen.",
        subtext: "»Kommt automatisch.« Sie betont es so, als wollte sie sagen: nicht von mir.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idPflicht3",
      },
      idPflicht3: {
        id: "idPflicht3",
        speaker: "INSA",
        text: "Praktisch: gehen Sie in die Kantine 3602, Etage 3. Frau Kowalk am linken Tresen kennt die Akte 4317. Sie weiß, was zu tun ist, damit der Block fällt.",
        subtext: "Sie sagt »Kowalk« mit einem Hauch Respekt, der ihr selbst auffällt.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idPflicht4",
      },
      idPflicht4: {
        id: "idPflicht4",
        speaker: "INSA",
        text: "Sobald Frau Kowalk den Bogen für Sie ans Rohr gibt und die Antwort aus E70-K zurückkommt, ist Ihr Status sauber. Rufen Sie mich dann noch einmal an — ich gebe Ihnen den Code direkt. Auf Wiederhören, Herr Worag.",
        subtext: "Kein Tonfall von Auftrag. Eher: jemand, der einen Bearbeitungsstand vorliest.",
        hiddenWhen: ["receivedTillaTransfer"],
        next: "idCode4",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            action: (api) => {
              // Insa hat Layard auf Vorgang 4317 / Kowalk hingewiesen.
              // Flag bleibt aus Legacy-Gründen `insaGaveTransferTask` —
              // gated jetzt die Kowalk-Einstiegs-Choice in der Kantine.
              api.setFlag("insaGaveTransferTask");
              api.setFlag("skippedExitReport");
            },
          },
        ],
      },
      // Wenn Vorgang 4317 erledigt ist, geht es nahtlos zum Code-Pfad.
      idPflichtSkip: {
        id: "idPflichtSkip",
        speaker: "SYSTEM",
        text: "[ Insa schaut auf den Bildschirm, hebt eine Augenbraue. Nickt einmal. ]",
        requires: ["receivedTillaTransfer"],
        next: "idPflichtCheck",
      },
      idCode4: {
        id: "idCode4",
        speaker: "INSA",
        text: "Vier-Drei-Eins-Sieben — sauber raus. Sehr ordentlich, Worag. Den Code lege ich Ihnen jetzt ins Terminal. Sie wissen schon: das Datum.",
        subtext: "Eine Spur Anerkennung. Sie tippt schon, während sie es sagt.",
        requires: ["receivedTillaTransfer"],
        next: "idCode5",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            next: "idCode7",
            action: (api) => {
              api.setFlag("skippedExitReport");
              api.setFlag("calledForCode");
            },
          },
          {
            text: "Ich verstehe das mit dem Datum nicht.",
            next: "idCode5",
            action: (api) => {
              api.setFlag("skippedExitReport");
              api.setFlag("calledForCode");
            },
          },
        ],
      },
      idCode5: {
        id: "idCode5",
        speaker: "INSA",
        text: "Sie öffnen Ihr Terminal. Im Posteingang liegt eine Nachricht von der Leitstelle. Lesen Sie das Datum darin — und tippen Sie es ohne Punkte ein. Acht Ziffern. Nicht mehr, nicht weniger.",
        subtext: "Sie spricht langsam. Wie zu jemandem, der lange nichts gelesen hat.",
        requires: ["receivedTillaTransfer"],
        next: "idCode6",
      },
      idCode6: {
        id: "idCode6",
        speaker: "INSA",
        text: "Beispiel — wenn da steht 14.03.1985, dann tippen Sie 14031985. Verstanden, Herr Worag?",
        requires: ["receivedTillaTransfer"],
        next: "idCode7",
      },
      idCode7: {
        id: "idCode7",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt jetzt eine Nachricht. Datum: 06.11.1997. Code-Format: ohne Punkte. Acht Ziffern. ]",
        requires: ["receivedTillaTransfer"],
        end: true,
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
        text: "Ich brauche jetzt einen Code für die Sektor-Tür.",
        next: "x4pflicht1",
      },
      // Sicherheits-Fallback: sollte Layard hier landen, ohne dass der
      // Vorgang sauber ist, weist Insa noch einmal auf 4317 hin. Im
      // Standardfluss ist `receivedTillaTransfer` zu diesem Zeitpunkt
      // gesetzt (Phone-Hotspot routet sonst nicht auf insa2).
      x4pflicht1: {
        id: "x4pflicht1",
        speaker: "INSA",
        text: "Worag — Ihr Vorgang Vier-Drei-Eins-Sieben hängt noch. Solange der Block auf Ihrem Datensatz steht, kann ich den Code nicht herausgeben.",
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
            action: (api) => {
              api.setFlag("insaGaveTransferTask");
            },
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
        text: "Hören Sie. — Bringen Sie es mir vorbei. Persönlich. Sektor-Leitstelle E67, Eingang an der Sektorgrenze. Fragen Sie nach Bauerfeind. Heute. Morgen. Wann Sie wollen.",
        next: "ar12",
      },
      ar12: {
        id: "ar12",
        speaker: "INSA",
        text: "Ich möchte einfach jemanden treffen, der eine Kapsel zwei Sektoren weit getragen hat, ohne sie unterwegs „zu verlieren“.",
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
        text: "[ Klick. Stille. Layard legt den Hörer zurück und hält die Hand einen Moment darauf. Die Datenkapsel liegt neben dem Telefon. Sie ist immer noch warm. ]",
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
        text: "Worag. — Hier ist gerade ein Träger ausgefallen. Komplett. Wir haben das auf dem Pult als Alarm 4-7-7. Sagt Ihnen das was?",
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
        text: "Gut. Dann sind wir wenigstens ehrlich. — Hören Sie. Was Sie kaputt gemacht haben, war nicht meines. Es war auch nicht das Ihrer Nachbarn. Wem es gehörte, finde ich noch heraus.",
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
        text: "Der Code für die Sektor-Tür liegt in Ihrem Terminal. Datum, ohne Punkte. Sie wissen, wie. Kommen Sie trotzdem rüber, Worag. Es ist heute kein guter Tag, allein zu bleiben.",
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
    onEnd: (api) => {
      api.setFlag("insaGaveTransferTask");
    },
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
      api.setFlag("marteauTrailOpened");
      if (!api.hasItem("akte1978Sertl")) {
        api.addItem({
          id: "akte1978Sertl",
          name: "Akte 1978 · N. Sertl",
          description:
            "Eine dünne, vergilbte Mappe. Aufdruck: »Resonanz-Überlastung 1978 · Quadrant E12 · Hörer N. Sertl · Gutachten: C. Marteau«. Die Mappe enthält nur einen Aktendeckel — der Inhalt fehlt. Insa sagt: liegt im Archiv 5710. Wenn er noch da ist.",
        });
      }
    },
    lines: {
      ip1: {
        id: "ip1",
        speaker: "SYSTEM",
        text: "[ Insa schiebt einen zweiten Becher über den Tisch. Drei Apparate. Zwei davon abgehoben. Sie sieht ihn an — keine Vermittlungs-Stimme jetzt. ]",
        next: "ip2",
      },
      ip2: {
        id: "ip2",
        speaker: "INSA",
        text: "Worag. Setzen Sie sich. Ich habe Sie mir größer vorgestellt.",
        subtext: "Es ist kein Witz. Eher eine Notiz.",
        next: "ip3",
      },
      ip3: {
        id: "ip3",
        speaker: "INSA",
        text: "Adaeze hat mir Bescheid gegeben, dass Sie sieben Tage pausieren sollen. Ich frage nicht nach.",
        subtext: "Sie sagt das, damit er weiß, dass sie es weiß — nicht, damit er antwortet.",
        next: "ip4",
      },
      ip4: {
        id: "ip4",
        speaker: "INSA",
        text: "Was haben Sie auf dem Herzen, Herr Worag? Ich habe eine Stunde, bevor das Pult mich wieder zurückruft.",
        choices: [
          {
            text: "Warum bin ich so, wie ich bin?",
            next: "ip5",
          },
          {
            text: "Warum ist das hier ein Krankheitsbild — und keine Frage?",
            next: "ip5",
          },
          {
            text: "Wer hat das Schmerz-Radio eigentlich erfunden — und warum?",
            next: "ip5",
          },
        ],
      },
      ip5: {
        id: "ip5",
        speaker: "INSA",
        text: "Ich habe gehofft, Sie fragen so etwas. Sonst hätte ich es Ihnen aufgedrängt.",
        next: "ip6",
      },
      ip6: {
        id: "ip6",
        speaker: "SYSTEM",
        text: "[ Sie öffnet eine Schublade ohne Beschriftung. Holt eine dünne, vergilbte Mappe heraus. Schiebt sie über den Tisch. ]",
        next: "ip7",
      },
      ip7: {
        id: "ip7",
        speaker: "INSA",
        text: "1978. Quadrant E12. Hörer Nikolaus Sertl — vielleicht auch Nora, in den Akten steht nur N. Resonanz-Überlastung. Gutachten von einem externen Berater: C. Marteau.",
        subtext: "Marteau. Layard kennt den Namen. Aus einem ganz anderen Mund.",
        next: "ip8",
      },
      ip8: {
        id: "ip8",
        speaker: "INSA",
        text: "Vor zwanzig Jahren hat schon einmal jemand das gehört, was Sie heute hören. Marteau hat aufgeschrieben, was er davon hielt. Das Gutachten ist verschwunden.",
        next: "ip9",
      },
      ip9: {
        id: "ip9",
        speaker: "INSA",
        text: "Im Archiv 5710 steht nur der Aktendeckel im Regal. Den Inhalt hat jemand mitgenommen. Nirgends notiert, wer. Niemand vermisst ihn — außer mir, und jetzt vielleicht Ihnen.",
        subtext: "»Vielleicht Ihnen.« — Sie wirft ihm einen langen, ruhigen Blick zu.",
        next: "ip10friendly",
      },
      // Mira-State-Splitter — eine Zeile, der Rest läuft identisch.
      ip10friendly: {
        id: "ip10friendly",
        speaker: "INSA",
        text: "Ihre Bekannte aus dem 4. — die kennt vielleicht den Weg in 5710, ohne dass jemand einen Stempel sieht. Falls Sie noch mit ihr reden.",
        requires: ["miraEndFriendly"],
        next: "ip11",
      },
      ip10skeptical: {
        id: "ip10skeptical",
        speaker: "INSA",
        text: "Sie werden 5710 nicht über mich öffnen. Ich kenne nur einen, der das kann. Sie mögen ihn nicht. Er Sie auch nicht.",
        requires: ["miraEndSkeptical"],
        next: "ip11",
      },
      ip11: {
        id: "ip11",
        speaker: "LAYARD",
        text: "Warum geben Sie mir das?",
        next: "ip12",
      },
      ip12: {
        id: "ip12",
        speaker: "INSA",
        text: "Weil ich Ihnen keinen Auftrag geben kann, Herr Worag. Ich gebe Ihnen die Genehmigung, etwas zu suchen, was offiziell niemand verloren hat.",
        subtext: "Sie sagt »Genehmigung«, als hätte sie das Wort gerade erfunden.",
        next: "ip13",
      },
      ip13: {
        id: "ip13",
        speaker: "INSA",
        text: "Den Tee schaffen Sie nicht mehr — er ist zu heiß und Sie zu nervös. Trinken Sie ihn drüben. Und sagen Sie mir, wenn Sie etwas finden. Auch wenn Sie nichts finden.",
        next: "ip14",
      },
      ip14: {
        id: "ip14",
        speaker: "SYSTEM",
        text: "[ Layard nimmt die Mappe. Sie ist leichter, als er gedacht hat. ]",
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
        text: "Worag. — Wenn Sie nichts Neues haben, lassen Sie mich an die drei Hörer hier. Es klingelt sonst gleich.",
        subtext: "Sie meint es nicht unfreundlich. Aber sie meint es.",
        next: "ipa2",
      },
      ipa2: {
        id: "ipa2",
        speaker: "INSA",
        text: "Die Mappe haben Sie. Den Rest finden nur Sie. Auf Wiederhören.",
        end: true,
      },
    },
  },
};
