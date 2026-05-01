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
            hiddenWhen: ["reportedExit"],
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
        text: "Hier ist die technische Unterstützung des Zentralen Netzes, Stegmann am Apparat. — Sie haben den Ausgang nicht gemeldet. Standardprotokoll, Herr Worag. Beim nächsten Mal bitte zuerst melden. Was brauchen Sie?",
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
        text: "Den Code. — Eine Sekunde, Herr Worag. Bevor ich den heute rausgebe, brauche ich noch etwas von Ihnen. Es gibt da eine Sache.",
        subtext: "Kein Skript. Sie zögert kurz, bevor sie weiterspricht.",
        next: "idCode2",
      },
      idCode2: {
        id: "idCode2",
        speaker: "INSA",
        text: "Den Verantwortlichen fürs Zentrale Netz kann ich Ihnen geben, falls noch etwas hängt. Sonst …",
        choices: [
          {
            text: "Verbinden Sie mich. Ich versuche es noch.",
            next: "idNet1",
          },
          {
            text: "Lassen wir das. Geben Sie mir bitte direkt den Code.",
            // Engine resolved nach Sichtbarkeit:
            //  - Getappt → idPflichtSkip (sichtbar, requires erfüllt) → idCode4
            //  - Nicht getappt → idPflichtSkip hidden, Engine folgt
            //    next-Pointer zu idPflichtCheck → idPflicht1..4.
            next: "idPflichtSkip",
          },
        ],
      },
      // Verzweigung: Hat Layard die Quelle der Sendung (radioOrigin) bereits
      // verstanden? Dann gibt Insa den Code wie gehabt heraus. Wenn nicht,
      // schickt sie ihn vorher zwingend zum Knoten 5610.
      idPflichtCheck: {
        id: "idPflichtCheck",
        speaker: "SYSTEM",
        text: "[ Insa zögert einen Moment, klickt durch ihre Maske. ]",
        hiddenWhen: ["tappedNode5610"],
        next: "idPflicht1",
      },
      // Pflicht-Pfad — nur wenn Layard noch nicht 'tap' am Knoten 5610 gemacht hat.
      idPflicht1: {
        id: "idPflicht1",
        speaker: "INSA",
        text: "Herr Worag — bevor ich Ihnen den Code gebe, brauche ich etwas von Ihnen. Es ist nicht ganz Standardprotokoll. Aber Sie waren heute selbst in 1534. Sie wissen, dass der Abschnittsverantwortliche E67 nicht da ist.",
        subtext: "Sie sagt das nicht als Vorwurf. Eher: als geteilte Beobachtung.",
        hiddenWhen: ["tappedNode5610"],
        next: "idPflicht2",
      },
      idPflicht2: {
        id: "idPflicht2",
        speaker: "INSA",
        text: "Seit Wochen läuft im Knoten 5610 — Korridor 56, Wartungstür hinter der „Technik“-Plakette — etwas, das in keinem Wartungsplan steht. Mehr Datenverkehr, als E67 erzeugen kann. Falsche Quell-Routen. Ich vermute eine Installation, die nicht genehmigt ist.",
        subtext: "Sie hat das schon oft formuliert. Nur nie laut.",
        hiddenWhen: ["tappedNode5610"],
        next: "idPflicht2b",
      },
      idPflicht2b: {
        id: "idPflicht2b",
        speaker: "INSA",
        text: "Was Sie auf 104,6 hören, kommt von dort. Aus 5610. Die Antenne auf dem Dach E67 streut es bis nach E71 hinüber — deshalb hören es die Patienten dort auch, obwohl sie es offiziell gar nicht dürfen. Es gibt keine zweite Quelle. Wenn der Knoten still ist, ist 104,6 still.",
        subtext: "Sie sagt das so präzise, als hätte sie es schon einmal in einen Bericht geschrieben, der nie gelesen wurde.",
        hiddenWhen: ["tappedNode5610"],
        next: "idPflicht3",
      },
      idPflicht3: {
        id: "idPflicht3",
        speaker: "INSA",
        text: "Ich habe einen Antrag auf Inspektion gestellt. Er liegt seit elf Tagen beim Sektorbeauftragten E67. Heute hätte er ihn unterschreiben sollen. Er ist nicht da. Und morgen ist er auch nicht da.",
        subtext: "Sie hat bis 18:00 gewartet, bevor sie das eingestanden hat.",
        hiddenWhen: ["tappedNode5610"],
        next: "idPflicht4",
      },
      idPflicht4: {
        id: "idPflicht4",
        speaker: "INSA",
        text: "Sie sind ohnehin in E67 unterwegs. Gehen Sie zur Wartungstür 5610. Am Terminal tippen Sie »tap« — Read-only-Mitschnitt, nichts, was auffällt. Danach rufen Sie mich an. Erst dann kann ich Ihnen den Code geben — als Gegenleistung sozusagen. Falls die Tür nicht aufgeht: Ich gebe von hier den Wartungs-Override frei. Aber das wissen Sie nicht von mir.",
        subtext: "Sie sagt »Gegenleistung«, als würde sie das Wort selbst zum ersten Mal verwenden.",
        hiddenWhen: ["tappedNode5610"],
        // Wenn getappt: hidden → Engine folgt next nach idCode4.
        // Wenn nicht getappt: sichtbar mit Choice „Auf Wiederhören"
        //   die den Dialog beendet (kein next auf der Choice).
        next: "idCode4",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            action: (api) => {
              api.setFlag("insaSentTo5610");
              api.setFlag("skippedExitReport");
              // Insa schaltet den Wartungs-Override scharf — die Tür
              // 5610 öffnet beim nächsten Versuch ohne Karte/Code.
              api.setFlag("serverRoom5610OverrideArmed");
            },
          },
        ],
      },
      // Wenn Layard die Quelle bereits verstanden hat, geht es nahtlos weiter
      // zum bisherigen Code-Pfad.
      idPflichtSkip: {
        id: "idPflichtSkip",
        speaker: "SYSTEM",
        text: "[ Insa wirft einen Blick auf etwas, das Layard nicht sieht — und nickt knapp. ]",
        requires: ["tappedNode5610"],
        // Engine-Strategie:
        //  - Getappt → idPflichtSkip ist sichtbar → SYSTEM-Beat,
        //    danach läuft die Engine via next durch idPflichtCheck
        //    (hidden bei getappt) und idPflicht1..4 (alle hidden bei
        //    getappt) bis zu idCode4 (sichtbar) — Code wird ausgegeben.
        //  - Nicht getappt → idPflichtSkip ist hidden, Engine springt
        //    weiter zu idPflichtCheck (sichtbar) → idPflicht1..4 zeigen
        //    die Pflicht-Anweisungen, Choice beendet den Dialog.
        next: "idPflichtCheck",
      },
      idCode4: {
        id: "idCode4",
        speaker: "INSA",
        text: "[ … ] Gut. Ich vermerke es als „nicht gemeldet“. Den Code lege ich Ihnen trotzdem ins Terminal — Sie wissen schon: das Datum.",
        subtext: "Sie zögert kurz. Dann tippt sie. Sie tut es trotzdem.",
        // Code-Mail darf NUR ausgeliefert werden, wenn Layard tatsächlich
        // am Knoten 5610 getappt hat. Sonst beendet die Engine den Dialog
        // hier (resolveVisible findet keinen sichtbaren Folge-Schritt),
        // und Insa hängt an genau der Stelle auf, an der sie eigentlich
        // die Probe abwartet.
        requires: ["tappedNode5610"],
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
        requires: ["tappedNode5610"],
        next: "idCode6",
      },
      idCode6: {
        id: "idCode6",
        speaker: "INSA",
        text: "Beispiel — wenn da steht 14.03.1985, dann tippen Sie 14031985. Verstanden, Herr Worag?",
        requires: ["tappedNode5610"],
        next: "idCode7",
      },
      idCode7: {
        id: "idCode7",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt jetzt eine Nachricht. Datum: 06.11.1997. Code-Format: ohne Punkte. Acht Ziffern. ]",
        requires: ["tappedNode5610"],
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
        text: "Worag. Die Probe ist durch. Sie haben sauber gearbeitet — keine Spuren im Wartungsprotokoll. Danke.",
        subtext: "Sie sagt »danke«, als würde sie das Wort selbst sortieren müssen.",
        hiddenWhen: ["troubleReported"],
        next: "x3",
      },
      x3: {
        id: "x3",
        speaker: "LAYARD",
        text: "Ich brauche jetzt einen Code für die Sektor-Tür.",
        next: "x4pflicht1",
      },
      // Pflicht-Variante: solange Layard nicht 'tap' am Knoten 5610 ausgeführt
      // hat, schickt Insa ihn dorthin. Sobald getappt, läuft x4 wie gehabt.
      x4pflicht1: {
        id: "x4pflicht1",
        speaker: "INSA",
        text: "Worag — bevor ich Ihnen den Code gebe: Ich brauche die Probe aus 5610. Sie wissen, warum — der Abschnittsverantwortliche, der mein Inspektionsformular unterschreiben müsste, ist heute nicht im Dienst. Korridor 56, Wartungstür. »tap« am Terminal, danach rufen Sie mich noch einmal an.",
        subtext: "Sie spricht leiser als sonst. Das ist kein Standardprotokoll.",
        hiddenWhen: ["tappedNode5610"],
        next: "x4pflicht2",
      },
      x4pflicht2: {
        id: "x4pflicht2",
        speaker: "INSA",
        text: "Die Tür kennt Sie schon — und falls nicht, gebe ich von hier aus den Wartungs-Override frei. Geben Sie mir zwanzig Sekunden, dann sind die Riegel offen. Aber das wissen Sie nicht von mir.",
        hiddenWhen: ["tappedNode5610"],
        next: "x4",
        choices: [
          {
            text: "Verstanden. Auf Wiederhören.",
            action: (api) => {
              api.setFlag("insaSentTo5610");
              // Insa schaltet den Wartungs-Override scharf — die Tür
              // 5610 öffnet beim nächsten Versuch ohne Karte/Code.
              api.setFlag("serverRoom5610OverrideArmed");
            },
          },
        ],
      },
      x4: {
        id: "x4",
        speaker: "INSA",
        text: "Ich habe den Code extra für Sie geändert. Direkt herausgeben darf ich ihn trotzdem nicht — er steht in der Mail, die ich Ihnen gerade ins Terminal lege. Sie wissen schon: das Datum.",
        subtext: "Extra für ihn. Sie sagt es so beiläufig, als wäre es Teil des Standardprotokolls. Ist es nicht.",
        requires: ["tappedNode5610"],
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
        text: "Worag. Sie haben noch nichts für mich. Ich höre es an Ihrer Stimme.",
        subtext: "Kein Vorwurf. Eine Feststellung.",
        next: "r3",
      },
      r3: {
        id: "r3",
        speaker: "INSA",
        text: "Korridor 56, Wartungstür 5610. Am Terminal »tap«. Read-only. Danach rufen Sie mich noch einmal an, dann bekommen Sie Ihren Code. Den Override habe ich Ihnen schon scharfgeschaltet.",
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
        text: "Worag. Bevor Sie fragen — der Code liegt fertig. Aber ich gebe ihn heute nicht raus, solange auf meinem Tisch noch ein offener Vorgang aus E67 liegt.",
        subtext: "Sie sagt das ruhig. Es ist keine Drohung. Es ist eine Reihenfolge.",
        next: "iw3",
      },
      iw3: {
        id: "iw3",
        speaker: "INSA",
        text: "Frau Kowalks Tochter. 4317-K. Ich brauche eine saubere Antwort von E70-K — Transferbogen, Bewohnernummer, Heim. Sie wissen, wie das geht: Ausgabestelle, Quittung Schicht B, Rohrpost.",
        next: "iw3b",
      },
      iw3b: {
        id: "iw3b",
        speaker: "INSA",
        text: "Frau Kowalk steht unten an der Nährstoffausgabe — Kantine 3602, E67, Schicht B. Graue Haare, Kittel, immer am linken Tresen. Sie kennt den Vorgang. Reden Sie mit ihr, nicht mit Brust.",
        subtext: "»Reden Sie mit ihr, nicht mit Brust.« — eine kleine Warnung, ruhig hingelegt.",
        next: "iw4",
      },
      iw4: {
        id: "iw4",
        speaker: "INSA",
        text: "Sobald der Bogen bei Ihnen aus dem Rohr fällt, rufen Sie mich noch einmal an. Dann bekommen Sie Ihren Code. Auf Wiederhören, Worag.",
        end: true,
      },
    },
  },
};
