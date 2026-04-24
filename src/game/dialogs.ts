import type { DialogTree } from "./types";

export const dialogs: Record<string, DialogTree> = {
  // ---------------------------------------------------------------
  // 1. Philippe at Layard's door — first meeting
  // ---------------------------------------------------------------
  philippeAtDoor: {
    id: "philippeAtDoor",
    start: "p0",
    onEnd: (api) => {
      api.goTo("apt2613");
    },
    lines: {
      // Erstkontakt — die beiden kennen sich noch nicht.
      p0: {
        id: "p0",
        speaker: "SYSTEM",
        text: "[ Layard öffnet die Tür. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "p1",
      },
      p1: {
        id: "p1",
        speaker: "SYSTEM",
        text: "[ Im Korridor steht ein Mann Anfang 40. Scheu. Murmelt verhalten. Sein Gesicht: besorgt. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "p2",
      },
      p2: {
        id: "p2",
        speaker: "PHILIPPE",
        text: "Hallo. Ich bin Philippe. Ich … habe ein Problem. Ich weiß nicht, was ich tun soll.",
        subtext: "Echte Angst. Er hat das nicht im Schauspielkurs gelernt.",
        hiddenWhen: ["metPhilippeBefore"],
        next: "p3",
      },
      // Wiedersehen — Philippe stand vorher schon Layard im Komplex
      // gegenüber (Lobby / Korridor 36 / Korridor 46).
      pR1: {
        id: "pR1",
        speaker: "SYSTEM",
        text: "[ Layard öffnet die Tür. Auf der Schwelle: Philippe. Derselbe beige Cardigan, derselbe scheue Blick — nur jetzt blass. ]",
        requires: ["metPhilippeBefore"],
        next: "pR2",
      },
      pR2: {
        id: "pR2",
        speaker: "PHILIPPE",
        text: "Worag. — Tut mir leid. Ich weiß, wir haben uns vorhin erst gesehen. Ich wäre nicht gekommen, wenn …",
        subtext: "Er hat lange im Korridor gestanden, bevor er geklingelt hat.",
        requires: ["metPhilippeBefore"],
        next: "pR3",
      },
      pR3: {
        id: "pR3",
        speaker: "LAYARD",
        text: "Schon gut, Philippe. Was ist los?",
        requires: ["metPhilippeBefore"],
        next: "p4",
      },
      p3: {
        id: "p3",
        speaker: "LAYARD",
        text: "Was für ein Problem?",
        hiddenWhen: ["metPhilippeBefore"],
        next: "p4",
      },
      p4: {
        id: "p4",
        speaker: "PHILIPPE",
        text: "Es klopft. An meiner Wand. Tag und Nacht. Wenn ich rufe, gibt es keine Antwort. Es ist unheimlich.",
        subtext: "Er hat lange gewartet, bevor er geklingelt hat. Sehr lange.",
        next: "p5",
      },
      p5: {
        id: "p5",
        speaker: "LAYARD",
        text: "Ich kann mir das mal anschauen.",
        subtext: "Layard ist von sich selbst überrascht. Wann hat er das letzte Mal etwas angeboten?",
        next: "p6",
      },
      p6: {
        id: "p6",
        speaker: "PHILIPPE",
        text: "Danke. Folgen Sie mir bitte. Es geht um meine Wohnung, 2613 — das Klopfen kommt aus der Nachbarwand, von 2615.",
        next: "p7",
      },
      p7: {
        id: "p7",
        speaker: "SYSTEM",
        text: "[ Philippe geht voran in den Korridor. Layard folgt. Drei Schritte. Dann die nächste Tür. Sie steht angelehnt. ]",
        end: true,
      },
    },
  },

  // Philippe inside 2613 — explains the situation
  philippeIn2613: {
    id: "philippeIn2613",
    start: "q1",
    onEnd: (api) => {
      // Erste tiefere Begegnung → Philippe macht sich seine erste Notiz.
      api.setFlag("philippeNote1");
    },
    lines: {
      q1: {
        id: "q1",
        speaker: "PHILIPPE",
        text: "Es dauert schon mehrere Stunden an. Ich habe die Block-Verwaltung über das Terminal informiert.",
        next: "q2",
      },
      q2: {
        id: "q2",
        speaker: "PHILIPPE",
        text: "Status: „in Bearbeitung“. Seit heute Morgen. Das ist alles, was ich bekomme.",
        next: "q3",
      },
      q3: {
        id: "q3",
        speaker: "PHILIPPE",
        text: "Hier wohnt ein alleinstehender Mann. Älter, vielleicht Mitte sechzig. Ich weiß nicht, wie er heißt. Ich habe geklingelt. Niemand öffnet.",
        subtext: "Niemand kennt hier den Nachbarn. Das ist Statut, nicht Zufall.",
        next: "q4",
      },
      q4: {
        id: "q4",
        speaker: "LAYARD",
        text: "Vielleicht ein medizinischer Notfall. In dem Fall ist ein Anruf vorgeschrieben.",
        next: "q5",
      },
      q5: {
        id: "q5",
        speaker: "SYSTEM",
        text: "[ Auf dem Beistelltisch des Bewohners: ein Wandtelefon. Nummer 001 ist die Leitstelle E67. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 2. Phone call to Insa from inside 2613
  // ---------------------------------------------------------------
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

  // ---------------------------------------------------------------
  // 3. Smalltalk while waiting for the paramedics
  // ---------------------------------------------------------------
  philippeSmalltalk: {
    id: "philippeSmalltalk",
    start: "k1",
    onEnd: (api) => {
      // Bei jedem weiteren Smalltalk: nächste freie Notiz auf Philippes Rechner.
      if (!api.hasFlag("philippeNote2")) api.setFlag("philippeNote2");
      else if (!api.hasFlag("philippeNote3")) api.setFlag("philippeNote3");
      else if (!api.hasFlag("philippeNote4")) api.setFlag("philippeNote4");
      else if (!api.hasFlag("philippeNote5")) api.setFlag("philippeNote5");
    },
    lines: {
      k1: {
        id: "k1",
        speaker: "PHILIPPE",
        text: "Sagen Sie … diese Kantinenreform. Ich finde, das Essen ist wirklich ein wenig besser geworden. Nutzen Sie die B2?",
        subtext: "Er sucht etwas. Irgendetwas, um die Stille zu zerschlagen.",
        next: "k2",
      },
      k2: {
        id: "k2",
        speaker: "LAYARD",
        text: "Ja. Überwiegend B2. Einfach bequem zu wissen, dass man alle Nährstoffe zu sich nimmt. Ich verdiente zuletzt wenig mit dem Schreiben.",
        subtext: "Hat er gerade etwas Persönliches verraten? Einem fast Unbekannten?",
        next: "k3",
      },
      k3: {
        id: "k3",
        speaker: "PHILIPPE",
        text: "Ich habe gehört, B3 sei auch nicht schlecht. Aber ich bin da etwas eigen. Ich mag es, wenn das Essen noch nach etwas schmeckt.",
        next: "k4",
      },
      k4: {
        id: "k4",
        speaker: "LAYARD",
        text: "Ja. Das kann ich verstehen. Manchmal ist es einfach praktischer, nicht darüber nachzudenken, was man isst.",
        next: "k5",
      },
      k5: {
        id: "k5",
        speaker: "SYSTEM",
        text: "[ Eine weitere Stille senkt sich zwischen die beiden. Layard bemerkt: er hat schon lange keine längere Konversation mehr geführt. ]",
        next: "k6",
      },
      k6: {
        id: "k6",
        speaker: "SYSTEM",
        text: "[ Aus dem Korridor: schnelle Schritte. Ein Team der lokalen Noteinsatzkräfte. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 4. Paramedics arrive and break open the door
  // ---------------------------------------------------------------
  paramedicsArrive: {
    id: "paramedicsArrive",
    start: "a1",
    onEnd: (api) => {
      api.setFlag("doorBrokenOpen");
    },
    lines: {
      a1: {
        id: "a1",
        speaker: "SANITÄTER",
        text: "Gehen Sie zurück. Wir brechen die Tür auf.",
        subtext: "Hochkonzentriert. Routine. Tausend solche Einsätze.",
        next: "a2",
      },
      a2: {
        id: "a2",
        speaker: "SYSTEM",
        text: "[ Layard ist erleichtert. Das Thema liegt jetzt bei den Profis. Philippe geht zurück in seine Wohnung — „Ich lasse Sie mal Ihre Arbeit machen.“ ]",
        next: "a3",
      },
      a3: {
        id: "a3",
        speaker: "SYSTEM",
        text: "[ Zwei Versuche, die Tür aufzubrechen, fruchten nicht. Beim dritten Mal knackt das Schloss. Die Tür schwingt auf. ]",
        next: "a4",
      },
      a4: {
        id: "a4",
        speaker: "SYSTEM",
        text: "[ Die Sanitäter stürmen herein. Layards Körper durchfährt ein intensives Kribbeln — wie er es außerhalb des Schmerz-Radios lange nicht mehr gespürt hat. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 5. Paramedic hands over the protocol
  // ---------------------------------------------------------------
  paramedic: {
    id: "paramedic",
    start: "s1",
    onEnd: (api) => {
      // Sobald Layard das Protokoll in der Hand hat, meldet das
      // Aufzugssystem eine "lokale Übersteuerung" und legt eine
      // Wartungssperre. Ohne Hausmeister-Account → Sackgasse.
      api.setFlag("elevatorMaintBlocked");
    },
    lines: {
      s1: {
        id: "s1",
        speaker: "SANITÄTER",
        text: "Kein A-, B- oder C-Problem. Transport mit Trage.",
        subtext: "Der andere Sanitäter nickt knapp. Es geht schnell.",
        next: "s2",
      },
      s2: {
        id: "s2",
        speaker: "LAYARD",
        text: "Brauchen Sie mich noch?",
        next: "s3",
      },
      s3: {
        id: "s3",
        speaker: "SANITÄTER",
        text: "Ja. Ich drucke Ihnen das Protokoll des Einsatzes aus. Verschlüsselt. Es ist für den Abschnittsverantwortlichen E67.",
        next: "s4",
      },
      s4: {
        id: "s4",
        speaker: "SANITÄTER",
        text: "Wir schicken es per Rohrpost — aber der Verantwortliche sollte heute schon informiert werden. Bitte werfen Sie es ein.",
        next: "s5",
      },
      s5: {
        id: "s5",
        speaker: "LAYARD",
        text: "In Ordnung.",
        subtext: "Warum hat er gerade ja gesagt? Er hätte nein sagen können.",
        next: "s6",
      },
      s6: {
        id: "s6",
        speaker: "SYSTEM",
        text: "[ Die Sanitäter schieben die Trage hinaus. Layard bleibt allein in der charakterlosen Wohnung des Mannes mit den grünen Augen. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 6. Back in 2611 — first call from his own phone:
  //    the protocol cannot be delivered, Insa redirects to E71/1534.
  // ---------------------------------------------------------------
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

  // ---------------------------------------------------------------
  // 7. Stegmann (Zentral-IT) — reached after the first failed network attempt
  // ---------------------------------------------------------------
  // Disposition zwischen 1. Anruf (insa2a) und Code-Freigabe (insa2):
  // Insa fragt, was Layard braucht. Er kann sich entscheiden, den
  // Standardweg über Stegmann zu gehen — oder direkt nach dem Code zu
  // fragen. In letzterem Fall mahnt sie ihn, dass die Ausgangsmeldung
  // noch aussteht, und überlässt ihm die Wahl.
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
        next: "id3",
      },
      id3: {
        id: "id3",
        speaker: "LAYARD",
        text: "…",
        choices: [
          {
            text: "Ich komme nicht durchs Netz. Error 4567.",
            next: "idNet1",
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
        text: "Den Code. — Eine Sekunde, Herr Worag. Hier steht, dass Sie Ihren Ausgang noch nicht elektronisch gemeldet haben. Standardprotokoll: zuerst die Meldung, dann der Code.",
        subtext: "Kein Vorwurf. Sie liest nur ab, was auf ihrem Schirm steht.",
        next: "idCode2",
      },
      idCode2: {
        id: "idCode2",
        speaker: "INSA",
        text: "Die Meldung läuft über das ZENTRAL.NETZ. Wenn Sie wollen, verbinde ich Sie mit dem Verantwortlichen für das Netz — er sagt Ihnen, was am Terminal zu tun ist. Sonst …",
        next: "idCode3",
      },
      idCode3: {
        id: "idCode3",
        speaker: "LAYARD",
        text: "…",
        choices: [
          {
            text: "Verbinden Sie mich. Ich versuche es noch.",
            next: "idNet1",
          },
          {
            text: "Lassen wir das. Geben Sie mir bitte direkt den Code.",
            next: "idCode4",
          },
        ],
      },
      idCode4: {
        id: "idCode4",
        speaker: "INSA",
        text: "[ … ] Gut. Ich vermerke es als „nicht gemeldet“. Den Code lege ich Ihnen trotzdem ins Terminal — Sie wissen schon: das Datum.",
        subtext: "Sie zögert kurz. Dann tippt sie. Sie tut es trotzdem.",
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
        next: "idCode6",
      },
      idCode6: {
        id: "idCode6",
        speaker: "INSA",
        text: "Beispiel — wenn da steht 14.03.1985, dann tippen Sie 14031985. Verstanden, Herr Worag?",
        next: "idCode7",
      },
      idCode7: {
        id: "idCode7",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt jetzt eine Nachricht. Datum: 06.11.1997. Code-Format: ohne Punkte. Acht Ziffern. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 8. Insa releases the door code (mail) — third call
  // ---------------------------------------------------------------
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
        next: "x3",
      },
      x3: {
        id: "x3",
        speaker: "LAYARD",
        text: "Ich brauche jetzt einen Code für die Sektor-Tür.",
        next: "x4",
      },
      x4: {
        id: "x4",
        speaker: "INSA",
        text: "Ich habe den Code extra für Sie geändert. Direkt herausgeben darf ich ihn trotzdem nicht — er steht in der Mail, die ich Ihnen gerade ins Terminal lege. Sie wissen schon: das Datum.",
        subtext: "Extra für ihn. Sie sagt es so beiläufig, als wäre es Teil des Standardprotokolls. Ist es nicht.",
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

  // ---------------------------------------------------------------
  // 9. Detour: Philippe in his own apartment, after E67 is mostly done
  // ---------------------------------------------------------------
  // Variant A0 — die Sanitäter sind da, aber Layard hat das Protokoll
  // noch gar nicht erhalten. Kein Hinweis auf E71 oder weitere Wege.
  philippeAfterBeforeProtocol: {
    id: "philippeAfterBeforeProtocol",
    start: "pp1",
    onEnd: (api) => {
      if (!api.hasFlag("philippeNote3")) api.setFlag("philippeNote3");
      else if (!api.hasFlag("philippeNote4")) api.setFlag("philippeNote4");
      else if (!api.hasFlag("philippeNote5")) api.setFlag("philippeNote5");
    },
    lines: {
      pp1: {
        id: "pp1",
        speaker: "PHILIPPE",
        text: "Und? Wissen die Sanitäter schon, was da drüben los ist?",
        subtext: "Er versucht ruhig zu klingen. Es gelingt ihm nur halb.",
        next: "pp2",
      },
      pp2: {
        id: "pp2",
        speaker: "LAYARD",
        text: "Noch nicht. Sie sind noch drüben. Ich wollte nur kurz nach Ihnen sehen.",
        next: "pp3",
      },
      pp3: {
        id: "pp3",
        speaker: "PHILIPPE",
        text: "Danke. Wenn Sie wiederkommen, klopfen Sie. Ich höre das. Ich höre heute alles.",
        subtext: "Versprechen klingen anders. Das hier ist eher eine Bitte, nicht allein gelassen zu werden.",
        next: "pp4",
      },
      pp4: {
        id: "pp4",
        speaker: "LAYARD",
        text: "Ja.",
        end: true,
      },
    },
  },

  // Variant A — Layard ist NOCH NICHT beim Abschnittsverantwortlichen gewesen
  // (also: hat das leere Büro auf Etage 3 noch nicht gesehen). Philippe weiß
  // nicht, wohin Layard als nächstes will, und fragt einfach nach.
  philippeAfterEarly: {
    id: "philippeAfterEarly",
    start: "pe1",
    onEnd: (api) => {
      if (!api.hasFlag("philippeNote3")) api.setFlag("philippeNote3");
      else if (!api.hasFlag("philippeNote4")) api.setFlag("philippeNote4");
      else if (!api.hasFlag("philippeNote5")) api.setFlag("philippeNote5");
    },
    lines: {
      pe1: {
        id: "pe1",
        speaker: "PHILIPPE",
        text: "Sie sind wieder da. Hat alles … geklappt? Mit den Sanitätern, meine ich.",
        subtext: "Er hat heute Kaffee gemacht. Echten. Für sich allein.",
        next: "pe2",
      },
      pe2: {
        id: "pe2",
        speaker: "LAYARD",
        text: "Es geht weiter. Ich muss noch runter. Hier im Block gibt es noch etwas zu erledigen.",
        next: "pe3",
      },
      pe3: {
        id: "pe3",
        speaker: "PHILIPPE",
        text: "Unten. Ich war ewig nicht mehr unten. Wenn Sie zurückkommen, klopfen Sie. Ich höre das. Ich höre alles.",
        subtext: "Versprechen klingen anders. Das ist eher: ein Ankerpunkt.",
        next: "pe4",
      },
      pe4: {
        id: "pe4",
        speaker: "LAYARD",
        text: "Wenn ich zurückkomme.",
        end: true,
      },
    },
  },

  // Variant B — Layard war schon beim leeren Büro. Philippe weiß jetzt,
  // wohin Layard geht (er hat es ihm wahrscheinlich erzählt).
  philippeAfter: {
    id: "philippeAfter",
    start: "pa1",
    onEnd: (api) => {
      // „Sie gehen also wirklich.“ — eine eigene, finale Beobachtung.
      if (!api.hasFlag("philippeNote3")) api.setFlag("philippeNote3");
      else if (!api.hasFlag("philippeNote4")) api.setFlag("philippeNote4");
      else if (!api.hasFlag("philippeNote5")) api.setFlag("philippeNote5");
    },
    lines: {
      pa1: {
        id: "pa1",
        speaker: "PHILIPPE",
        text: "Sie gehen also wirklich. Zum Abschnittsverantwortlichen. Nur ein paar Etagen tiefer — aber ich war auch schon ewig nicht mehr unten.",
        subtext: "Er hat heute Kaffee gemacht. Echten. Für sich allein.",
        next: "pa2",
      },
      pa2: {
        id: "pa2",
        speaker: "PHILIPPE",
        text: "Wenn Sie zurückkommen, klopfen Sie. Ich höre das. Ich höre alles.",
        subtext: "Versprechen klingen anders. Das ist eher: ein Ankerpunkt.",
        next: "pa3",
      },
      pa3: {
        id: "pa3",
        speaker: "LAYARD",
        text: "Wenn ich zurückkomme.",
        end: true,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Philippe als Wander-NPC — vor der Resonanz-Überlastung
  // (Kurze, nervöse Begegnungen an unterschiedlichen Orten.)
  // ─────────────────────────────────────────────────────────────
  philippeInLobby: {
    id: "philippeInLobby",
    start: "pl0",
    onEnd: (api) => {
      api.setFlag("metPhilippeBefore");
    },
    lines: {
      // Erstkontakt
      pl0: {
        id: "pl0",
        speaker: "SYSTEM",
        text: "[ Ein Mann Anfang 40 lehnt am Tresen. Beiger Cardigan, müde Augen. Er sieht auf, als Layard näher kommt. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pl2",
      },
      pl1: {
        id: "pl1",
        speaker: "SYSTEM",
        text: "[ Wieder Philippe. Beiger Cardigan, jetzt am Tresen. Er sieht auf, halbes Lächeln. ]",
        requires: ["metPhilippeBefore"],
        next: "plR1",
      },
      pl2: {
        id: "pl2",
        speaker: "PHILIPPE",
        text: "Oh — hallo. Sie wohnen im 26er, nicht? 2611. Ich bin Philippe. 2613.",
        subtext: "Er nuschelt. Er probiert die Begrüßung im Kopf, bevor er sie ausspricht.",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pl3",
      },
      plR1: {
        id: "plR1",
        speaker: "PHILIPPE",
        text: "Worag. Wir laufen uns heute oft über den Weg.",
        subtext: "Er klingt fast erleichtert, ein bekanntes Gesicht zu sehen.",
        requires: ["metPhilippeBefore"],
        next: "plR2",
      },
      plR2: {
        id: "plR2",
        speaker: "LAYARD",
        text: "Sieht so aus.",
        requires: ["metPhilippeBefore"],
        next: "pl4",
      },
      pl3: {
        id: "pl3",
        speaker: "LAYARD",
        text: "Layard. — Was machen Sie hier unten?",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pl4",
      },
      pl4: {
        id: "pl4",
        speaker: "PHILIPPE",
        text: "Ich … bin viel unterwegs. Wenn ich zu lange in der Wohnung bin, höre ich Dinge. Aus der Nachbarwand.",
        subtext: "Er sagt das so, wie man Wetterprognosen sagt.",
        next: "pl5",
      },
      pl5: {
        id: "pl5",
        speaker: "PHILIPPE",
        text: "Wahrscheinlich nichts. Wahrscheinlich.",
        end: true,
      },
    },
  },

  philippeInCorridor36: {
    id: "philippeInCorridor36",
    start: "pc0",
    onEnd: (api) => {
      api.setFlag("metPhilippeBefore");
    },
    lines: {
      pc0: {
        id: "pc0",
        speaker: "SYSTEM",
        text: "[ Philippe steht vor einer geschlossenen Verwaltungstür, beide Hände in den Cardiganstaschen. Er nickt Layard zu. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pc2",
      },
      pc1: {
        id: "pc1",
        speaker: "SYSTEM",
        text: "[ Philippe wieder. Vor derselben verschlossenen Verwaltungstür. Er hebt kurz die Hand. ]",
        requires: ["metPhilippeBefore"],
        next: "pcR1",
      },
      pc2: {
        id: "pc2",
        speaker: "PHILIPPE",
        text: "Worag, oder? Aus 2611. Ich bin Philippe — von gegenüber, 2613.",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pc3",
      },
      pcR1: {
        id: "pcR1",
        speaker: "PHILIPPE",
        text: "Worag. Sie auch nochmal hier oben.",
        subtext: "Halb Frage, halb Trost. Als hätte er Gesellschaft gesucht.",
        requires: ["metPhilippeBefore"],
        next: "pcR2",
      },
      pcR2: {
        id: "pcR2",
        speaker: "LAYARD",
        text: "Immer noch niemand drin?",
        requires: ["metPhilippeBefore"],
        next: "pc3",
      },
      pc3: {
        id: "pc3",
        speaker: "PHILIPPE",
        text: "Ich wollte hier eigentlich etwas erledigen. Aber dann war niemand da. Wie immer.",
        subtext: "Er sagt „wie immer“ ohne Bitterkeit. Eher wie eine Wettermeldung.",
        next: "pc4",
      },
      pc4: {
        id: "pc4",
        speaker: "LAYARD",
        text: "Was wollten Sie melden?",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pc5",
      },
      pc5: {
        id: "pc5",
        speaker: "PHILIPPE",
        text: "Ach. Ein Klopfen. Bei mir an der Wand. Seit Tagen. Aber das ist sicher nichts. Schönen Tag noch, Herr Worag.",
        end: true,
      },
    },
  },

  philippeInCorridor46: {
    id: "philippeInCorridor46",
    start: "pq0",
    onEnd: (api) => {
      api.setFlag("metPhilippeBefore");
    },
    lines: {
      pq0: {
        id: "pq0",
        speaker: "SYSTEM",
        text: "[ Philippe steht vor dem abblätternden Plakat, als läse er es zum dritten Mal. Er sieht überrascht auf. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pq2",
      },
      pq1: {
        id: "pq1",
        speaker: "SYSTEM",
        text: "[ Philippe vor dem alten Plakat. Er dreht sich nicht überrascht um — er hat Layards Schritte schon gehört. ]",
        requires: ["metPhilippeBefore"],
        next: "pqR1",
      },
      pq2: {
        id: "pq2",
        speaker: "PHILIPPE",
        text: "Sie auch hier? — Entschuldigung. Ich bin Philippe, wir wohnen Tür an Tür. 2611, 2613.",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pq3",
      },
      pqR1: {
        id: "pqR1",
        speaker: "PHILIPPE",
        text: "Schon wieder, Worag. Heute ist so ein Tag.",
        subtext: "Er meint nicht das Wetter.",
        requires: ["metPhilippeBefore"],
        next: "pqR2",
      },
      pqR2: {
        id: "pqR2",
        speaker: "LAYARD",
        text: "Sieht so aus.",
        requires: ["metPhilippeBefore"],
        next: "pq3",
      },
      pq3: {
        id: "pq3",
        speaker: "PHILIPPE",
        text: "Ich laufe heute viel. Etage rauf, Etage runter. In der Wohnung wird es manchmal … laut. Ohne dass jemand spricht, meine ich.",
        subtext: "Er meint es genau so, wie er es sagt.",
        next: "pq4",
      },
      pq4: {
        id: "pq4",
        speaker: "PHILIPPE",
        text: "Vielleicht sehen wir uns mal. Bei einem Kaffee. Echtem.",
        end: true,
      },
    },
  },


  // ---------------------------------------------------------------
  // 10. E71 — reception
  // ---------------------------------------------------------------
  reception: {
    id: "reception",
    start: "r1",
    lines: {
      r1: {
        id: "r1",
        speaker: "RECEPTION",
        text: "Sektor E71 — Medizin. Sie sind … Worag, korrekt? Quadrant E67. Ihr Eintritt wurde von der Leitstelle vorgemerkt.",
        subtext: "Vorgemerkt. Wie ein Paket, das man erwartet hat.",
        next: "r2",
      },
      r2: {
        id: "r2",
        speaker: "LAYARD",
        text: "Ich bringe ein Einsatzprotokoll für Herrn Stegmann. Zimmer 1534.",
        next: "r3",
      },
      r3: {
        id: "r3",
        speaker: "RECEPTION",
        text: "Korridor 15. Den langen Gang entlang. Die letzte Tür auf der rechten Seite, mit dem roten Licht.",
        next: "r4",
      },
      r4: {
        id: "r4",
        speaker: "RECEPTION",
        text: "Herr Stegmann hat heute viel auf dem Tisch. Halten Sie es bitte kurz.",
        subtext: "Sie sagt das, ohne aufzuschauen. Es ist Standard.",
        next: "r5",
      },
      r5: {
        id: "r5",
        speaker: "SYSTEM",
        text: "[ Sie schiebt einen kleinen Besucherchip über den Tresen. Schweigend. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 11. Mikael Stegmann — lehnt das Protokoll ab
  // ---------------------------------------------------------------
  mikaelReject: {
    id: "mikaelReject",
    start: "mr1",
    lines: {
      mr1: {
        id: "mr1",
        speaker: "SYSTEM",
        text: "[ Der Mann hinter dem Schreibtisch sieht auf. Drahtgestell-Brille, grauer Bart, ein hellgraues Diensthemd, das schon zu lange getragen wird. ]",
        next: "mr2",
      },
      mr2: {
        id: "mr2",
        speaker: "MIKAEL",
        text: "Stegmann. Bitte schließen Sie die Tür. Es zieht.",
        subtext: "Keine Härte. Routine. Er sagt das vermutlich zwanzigmal am Tag.",
        next: "mr3",
      },
      mr3: {
        id: "mr3",
        speaker: "LAYARD",
        text: "Worag. E67, Quadrant 26. Ich bringe ein Einsatzprotokoll. Fall-ID 5245, Wohnung 2615. Die Leitstelle hat mich zu Ihnen geschickt.",
        next: "mr4",
      },
      mr4: {
        id: "mr4",
        speaker: "MIKAEL",
        text: "E67. — Ja. Ich vertrete dort heute formal mit. Frau Bauerfeind hat es vermutlich erwähnt.",
        subtext: "Er nickt langsam. Wie jemand, der eine Auskunft bestätigt, die er selbst nicht gegeben hat.",
        next: "mr5",
      },
      mr5: {
        id: "mr5",
        speaker: "LAYARD",
        text: "Ja. Es ist eine versiegelte Datenkapsel. Soll ich sie hier ablegen?",
        next: "mr6",
      },
      mr6: {
        id: "mr6",
        speaker: "MIKAEL",
        text: "Nein. — Bitte nicht.",
        subtext: "Es kommt zu schnell. Er hört es selbst und sieht kurz zur Seite.",
        next: "mr7",
      },
      mr7: {
        id: "mr7",
        speaker: "MIKAEL",
        text: "Herr Worag. Ich bin … ich komme nicht hinterher. Sehen Sie das hier?",
        next: "mr8",
      },
      mr8: {
        id: "mr8",
        speaker: "SYSTEM",
        text: "[ Mikael deutet mit beiden Händen auf den Schreibtisch. Auf die Stapel. Auf die Aktenschränke. Auf die offenen Schubladen. Es ist keine Geste — es ist ein Beweis. ]",
        next: "mr9",
      },
      mr9: {
        id: "mr9",
        speaker: "MIKAEL",
        text: "Jeder dieser Vorgänge hat Vorrang. Jeder. Wenn ich Ihre Kapsel jetzt annehme, liegt sie in zwei Wochen unter den anderen — und dann sind wir beide schuld, dass sie nicht bearbeitet wurde.",
        next: "mr10",
      },
      mr10: {
        id: "mr10",
        speaker: "MIKAEL",
        text: "Nehmen Sie sie bitte wieder mit. Geben Sie sie Frau Bauerfeind zurück. Sie soll das richtig zuweisen.",
        next: "mr11",
      },
      mr11: {
        id: "mr11",
        speaker: "LAYARD",
        text: "Sie hat mich heute Morgen explizit hierher geschickt.",
        subtext: "Das ist das Erste seit Stunden, das er ganz allein sagt.",
        next: "mr12",
      },
      mr12: {
        id: "mr12",
        speaker: "MIKAEL",
        text: "Ja. Das tut sie manchmal.",
        subtext: "Kein Vorwurf. Er hat sich daran gewöhnt. Sie sich auch.",
        next: "mr13",
      },
      mr13: {
        id: "mr13",
        speaker: "MIKAEL",
        text: "Sagen Sie ihr, ich habe es nicht angenommen. Sagen Sie ihr — bitte —, dass es nicht persönlich ist. Sie weiß das.",
        next: "mr14",
      },
      mr14: {
        id: "mr14",
        speaker: "LAYARD",
        text: "In Ordnung.",
        subtext: "Warum hat er gerade ja gesagt? Er hätte nein sagen können.",
        next: "mr15",
      },
      mr15: {
        id: "mr15",
        speaker: "SYSTEM",
        text: "[ Mikael nickt nur noch. Sein Blick ist schon wieder auf dem nächsten Stapel. Layard tritt einen Schritt zurück. Die Datenkapsel liegt unverändert in seiner Hand. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 11b. Akt-II-Übergang: Layard ruft aus 2611 die Leitstelle an.
  //      Insa öffnet sich zum ersten Mal — und lädt ihn ein.
  // ---------------------------------------------------------------
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
        next: "ar11",
      },
      ar11: {
        id: "ar11",
        speaker: "INSA",
        text: "Hören Sie. — Bringen Sie es mir vorbei. Persönlich. Ich bin in der Leitstelle E67, Etage 3, Tür 3601. Heute. Morgen. Wann Sie wollen.",
        next: "ar12",
      },
      ar12: {
        id: "ar12",
        speaker: "INSA",
        text: "Es ist nichts Dienstliches. Ich möchte einfach jemanden treffen, der eine Kapsel zwei Sektoren weit getragen hat, ohne sie unterwegs „zu verlieren“.",
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

  // ───────────────────────────────────────────────────────────
  // Etage 3 — Tür 3601, Abschnittsverantwortlicher E67. Heute leer.
  // ───────────────────────────────────────────────────────────
  emptyOfficeSign: {
    id: "emptyOfficeSign",
    start: "eo1",
    lines: {
      eo1: {
        id: "eo1",
        speaker: "SYSTEM",
        text: "[ An der Tür 3601 hängt ein DIN-A5-Zettel. Maschinenschrift, krumm geklebt. ]",
        next: "eo2",
      },
      eo2: {
        id: "eo2",
        speaker: "SYSTEM",
        text: "„HEUTE NICHT BESETZT — Dienstplan-Engpass. Vertretung für E67: Sektor E71, Zimmer 1534.“",
        next: "eo3",
      },
      eo3: {
        id: "eo3",
        speaker: "LAYARD",
        text: "Was soll ich jetzt tun? Ich rufe die Leitstelle wieder an.",
        end: true,
      },
    },
  },

  emptyOfficeBell: {
    id: "emptyOfficeBell",
    start: "eb1",
    lines: {
      eb1: {
        id: "eb1",
        speaker: "SYSTEM",
        text: "[ Layard drückt den Klingelknopf. Ein dünnes, fernes Klingeln hinter der Tür. ]",
        next: "eb2",
      },
      eb2: {
        id: "eb2",
        speaker: "SYSTEM",
        text: "[ Sieben Sekunden Stille. Ein mechanisches Klacken. Dann nichts mehr. ]",
        next: "eb3",
      },
      eb3: {
        id: "eb3",
        speaker: "LAYARD",
        text: "Niemand. Wirklich niemand.",
        subtext: "Eine Mischung aus Erleichterung und Wut. Beides gleichzeitig, beides leise.",
        end: true,
      },
    },
  },

  // ───────────────────────────────────────────────────────────
  // Mira — die 16-Jährige mit revolutionären Ideen.
  // ───────────────────────────────────────────────────────────
  miraIntro: {
    id: "miraIntro",
    start: "mi1",
    lines: {
      mi1: {
        id: "mi1",
        speaker: "SYSTEM",
        text: "[ An der Wand lehnt eine junge Frau. Sechzehn, vielleicht siebzehn. Kein Empfänger im Ohr. Sie sieht Layard direkt an. ]",
        next: "mi2",
      },
      mi2: {
        id: "mi2",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Aber du suchst auch nichts Bestimmtes, oder? Du läufst nur. Das machen die meisten, bevor sie wissen, wovor.",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Diagnose.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi2b",
      },
      mi2b: {
        id: "mi2b",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Und du läufst, als hättest du ein Ziel. Wen suchst du?",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Diagnose.",
        requires: ["sawEmptyOffice"],
        next: "mi3",
      },
      mi3: {
        id: "mi3",
        speaker: "LAYARD",
        text: "Ich … wollte mir nur ein paar andere Etagen ansehen.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi3b",
      },
      mi3b: {
        id: "mi3b",
        speaker: "LAYARD",
        text: "Den Abschnittsverantwortlichen. Sein Büro ist leer.",
        requires: ["sawEmptyOffice"],
        next: "mi4",
      },
      mi4: {
        id: "mi4",
        speaker: "MIRA",
        text: "Andere Etagen ansehen. — Weißt du, wie selten das jemand macht? Die meisten bleiben in ihrem Quadranten, bis sie transferiert werden. Du nicht.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi4b",
        choices: [
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Pass auf, was du sagst. Hier hört jemand zu.",
            next: "miraClosed1",
            action: (api) => api.setFlag("miraSystemic"),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      mi4b: {
        id: "mi4b",
        speaker: "MIRA",
        text: "Den gibt es heute nicht. Den gibt es eigentlich nie. Das System tut nur so, als ob.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        requires: ["sawEmptyOffice"],
        choices: [
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Pass auf, was du sagst. Hier hört jemand zu.",
            next: "miraClosed1",
            action: (api) => api.setFlag("miraSystemic"),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      // OFFEN
      miraOpen1: {
        id: "miraOpen1",
        speaker: "MIRA",
        text: "Frag dich mal, warum 104,6 deinen Schmerz lindert und nicht den Grund dafür wegnimmt. Ein gutes Mittel würde das Problem lösen — nicht dich an das Problem gewöhnen.",
        choices: [
          { text: "Sprich weiter.", next: "miraOpen2" },
          {
            text: "Das ist mir jetzt zu groß. Lass gut sein.",
            next: "miraDefer",
          },
        ],
      },
      miraOpen2: {
        id: "miraOpen2",
        speaker: "MIRA",
        text: "Die Frequenz ist eine Leine. Lang genug, dass du dich frei fühlst. Kurz genug, dass du nicht aus dem Quadranten läufst.",
        choices: [
          { text: "Und wer hält das andere Ende?", next: "miraOpen4" },
          { text: "Hübsches Bild. Mehr nicht.", next: "miraDeferDry" },
          { text: "Reicht. Ich muss weiter.", next: "miraDefer" },
        ],
      },
      miraOpen4: {
        id: "miraOpen4",
        speaker: "MIRA",
        text: "Genau die Frage. Und die Antwort steht hier drauf.",
        next: "miraOpen5",
      },
      miraOpen5: {
        id: "miraOpen5",
        speaker: "SYSTEM",
        text: "[ Sie zieht ein gefaltetes Blatt aus der Innentasche und drückt es Layard in die Hand. Schnell. Geübt. ]",
        next: "miraOpen6",
        choices: [
          {
            text: "[ Annehmen ]",
            next: "miraOpen7",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
          {
            text: "[ Ablehnen ]",
            next: "miraRefuse",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
        ],
      },
      miraOpen7: {
        id: "miraOpen7",
        speaker: "MIRA",
        text: "Lies es allein. Nicht im Terminal. Niemals im Terminal. Z.K.S.",
        next: "miraOpen8",
      },
      miraOpen8: {
        id: "miraOpen8",
        speaker: "LAYARD",
        text: "Z.K.S.?",
        next: "miraOpen9",
      },
      miraOpen9: {
        id: "miraOpen9",
        speaker: "MIRA",
        text: "Wirst du schon merken. Geh jetzt. Ich war nie hier.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraOpenness");
              api.setFlag("tookFlyer");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description:
                  "LAUSCHT IHR? Die Frequenz, die euch trägt, wurde nicht gefunden. Sie wurde gebaut. Wer hat sie eingestellt? Wer dreht sie lauter, wenn ihr leiser werdet? Fragt nicht eure Leitstelle. Fragt euch selbst. — Z.K.S.",
              });
              api.setKnowledge("frequencyControl");
            },
          },
        ],
      },
      miraRefuse: {
        id: "miraRefuse",
        speaker: "MIRA",
        text: "Schade. — Aber ich verstehe. Wenn du es dir anders überlegst: Ich bin oft hier oben.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraOpenness"),
          },
        ],
      },
      // Layard hört zu, lässt sich aber nicht hineinziehen.
      // Mira hält das Blatt zurück und bleibt offen für Wiederbegegnung.
      miraDefer: {
        id: "miraDefer",
        speaker: "MIRA",
        text: "Auch gut. — Ich bin oft hier oben, falls du irgendwann doch mal Lust hast, weiterzudenken.",
        subtext:
          "Sie steckt etwas zurück in die Innentasche, ohne es ihm zu zeigen.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraDeferred"),
          },
        ],
      },
      miraDeferDry: {
        id: "miraDeferDry",
        speaker: "MIRA",
        text: "Mag sein. — Dann eben ein hübsches Bild. Schönen Tag noch.",
        subtext: "Sie wendet den Blick ab. Das Gespräch ist für heute vorbei.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraDeferred"),
          },
        ],
      },
      // GESCHLOSSEN
      miraClosed1: {
        id: "miraClosed1",
        speaker: "MIRA",
        text: "Ach. Einer von denen. Schon gut. Vergiss, dass ich was gesagt habe.",
        subtext: "Sie ist nicht überrascht. Sie hat damit gerechnet.",
        next: "miraClosed2",
      },
      miraClosed2: {
        id: "miraClosed2",
        speaker: "MIRA",
        text: "Schönen Tag noch, Bürger.",
        end: true,
      },
    },
  },

  // Wiederbegegnung: Layard hat noch kein Flugblatt, kann zurückkommen.
  miraReturn: {
    id: "miraReturn",
    start: "mr1",
    lines: {
      mr1: {
        id: "mr1",
        speaker: "MIRA",
        text: "Wieder hier. Hast du es dir überlegt?",
        // Nur, wenn Mira das Blatt schon einmal hervorgeholt hat — sonst
        // gäbe es nichts „zu überlegen“. Und nicht, wenn Layard im
        // Suchmodus ist (sawEmptyOffice → eigene Begrüßung mr1b).
        requires: ["miraOfferedFlyer"],
        hiddenWhen: ["sawEmptyOffice"],
        next: "mr1b",
        choices: [
          { text: "Ja. Gib mir das Blatt.", next: "mr2" },
          { text: "Nein. Ich wollte nur reden.", next: "mrTalk" },
        ],
      },
      mr1b: {
        id: "mr1b",
        speaker: "MIRA",
        text: "Wieder hier. Hast du ihn gefunden? Den Abschnittsverantwortlichen, meine ich.",
        subtext: "Sie weiß die Antwort schon.",
        requires: ["sawEmptyOffice", "miraOfferedFlyer"],
        next: "mrFresh1",
        choices: [
          { text: "Ja. Gib mir das Blatt.", next: "mr2" },
          { text: "Nein. Aber gib mir trotzdem das Blatt.", next: "mr2" },
          { text: "Nein. Ich wollte nur reden.", next: "mrTalk" },
        ],
      },
      // Layard war noch nicht beim Thema „Frequenz“ — Mira fängt nochmal
      // von vorn an, ohne ihm direkt das Blatt anzubieten.
      mrFresh1: {
        id: "mrFresh1",
        speaker: "MIRA",
        text: "Du bist nochmal hier. Das machen die wenigsten zweimal.",
        subtext: "Keine Begrüßung. Eher eine Notiz.",
        next: "mrFresh2",
      },
      mrFresh2: {
        id: "mrFresh2",
        speaker: "MIRA",
        text: "Sag mal — hörst du eigentlich noch zu, wenn das Radio leise ist? Oder nur, wenn es laut ist?",
        choices: [
          { text: "Was willst du damit sagen?", next: "miraOpen1" },
          { text: "Lass mich in Ruhe damit.", next: "mrSystemic" },
          { text: "Keine Zeit." },
        ],
      },
      mrTalk: {
        id: "mrTalk",
        speaker: "MIRA",
        text: "Reden. Gut. — Worüber denn?",
        choices: [
          { text: "Über das, was du vorhin meintest.", next: "miraOpen1" },
          { text: "Eigentlich über nichts." },
        ],
      },
      // Spieler weicht beim Wiedersehen aus → wird ab jetzt ebenfalls
      // als systemtreu behandelt.
      mrSystemic: {
        id: "mrSystemic",
        speaker: "MIRA",
        text: "Verstanden. — Schönen Tag noch, Bürger.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraSystemic"),
          },
        ],
      },
      mr2: {
        id: "mr2",
        speaker: "MIRA",
        text: "Gut. Lies es allein. Niemals im Terminal. Z.K.S.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("tookFlyer");
              api.setFlag("miraOpenness");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description:
                  "LAUSCHT IHR? Die Frequenz, die euch trägt, wurde nicht gefunden. Sie wurde gebaut. Wer hat sie eingestellt? Wer dreht sie lauter, wenn ihr leiser werdet? Fragt nicht eure Leitstelle. Fragt euch selbst. — Z.K.S.",
              });
              api.setKnowledge("frequencyControl");
            },
          },
        ],
      },
    },
  },

  // Nach Erhalt des Flugblatts.
  miraAfter: {
    id: "miraAfter",
    start: "ma1",
    lines: {
      ma1: {
        id: "ma1",
        speaker: "MIRA",
        text: "Du hast es noch. Gut. — Und du bist immer noch hier. Auch gut.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "ma1b",
        end: true,
      },
      ma1b: {
        id: "ma1b",
        speaker: "MIRA",
        text: "Du hast es noch. Gut. — Und der Verantwortliche ist immer noch keiner. Auch gut.",
        requires: ["sawEmptyOffice"],
        end: true,
      },
    },
  },

  // Layard hat sich beim Erstgespräch (oder beim ersten Wiedersehen)
  // klar systemtreu positioniert. Mira spricht ihn nur noch knapp an.
  miraSystemicGreeting: {
    id: "miraSystemicGreeting",
    start: "msg1",
    lines: {
      msg1: {
        id: "msg1",
        speaker: "MIRA",
        text: "Guten Tag, Bürger.",
        subtext: "Sie sieht ihn nicht einmal an.",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // Philippe — Sondierungs-Dialoge nach versiegelter Tür (2615).
  // Philippe versucht über mehrere Besuche herauszufinden, wer
  // Layard wirklich ist. Jeder Dialog erzeugt eine neue,
  // hochspekulative Notiz auf seinem Rechner.
  // ---------------------------------------------------------------
  philippeProbe1: {
    id: "philippeProbe1",
    start: "pr1",
    onEnd: (api) => api.setFlag("philippeProbeNote1"),
    lines: {
      pr1: {
        id: "pr1",
        speaker: "PHILIPPE",
        text: "Sie sind wieder da. Setzen Sie sich kurz. — Darf ich was fragen? Etwas Persönliches?",
        subtext: "Er hat sich das die ganze Zeit zurechtgelegt. Es klingt jetzt trotzdem unsicher.",
        next: "pr2",
      },
      pr2: {
        id: "pr2",
        speaker: "PHILIPPE",
        text: "Wo sind Sie geboren? Ich meine — ursprünglich. Vor E67.",
        next: "pr3",
      },
      pr3: {
        id: "pr3",
        speaker: "LAYARD",
        text: "Ich … weiß es nicht mehr genau. Ein anderer Quadrant. Es ist lange her.",
        subtext: "Er weiß es. Er will es nur nicht sagen.",
        next: "pr4",
      },
      pr4: {
        id: "pr4",
        speaker: "PHILIPPE",
        text: "Verstehe. — Und Geschwister? Eltern? Irgendjemand?",
        next: "pr5",
      },
      pr5: {
        id: "pr5",
        speaker: "LAYARD",
        text: "Niemand mehr, mit dem ich Kontakt habe.",
        next: "pr6",
      },
      pr6: {
        id: "pr6",
        speaker: "PHILIPPE",
        text: "Hm. — Entschuldigen Sie. Ich frage zu viel.",
        subtext: "Er fragt nicht zu viel. Er fragt zu wenig. Innerlich notiert er bereits.",
        end: true,
      },
    },
  },

  philippeProbe2: {
    id: "philippeProbe2",
    start: "ps1",
    onEnd: (api) => api.setFlag("philippeProbeNote2"),
    lines: {
      ps1: {
        id: "ps1",
        speaker: "PHILIPPE",
        text: "Sie haben vorhin „Schreiben“ gesagt. Was schreiben Sie denn?",
        subtext: "Er hat sich das Wort gemerkt. Er merkt sich alles.",
        next: "ps2",
      },
      ps2: {
        id: "ps2",
        speaker: "LAYARD",
        text: "Berichte. Manchmal. Früher Geschichten. Das ist lange vorbei.",
        next: "ps3",
      },
      ps3: {
        id: "ps3",
        speaker: "PHILIPPE",
        text: "Geschichten. Worüber denn? — Was hat Sie bewegt, das aufzuschreiben?",
        next: "ps4",
      },
      ps4: {
        id: "ps4",
        speaker: "LAYARD",
        text: "Menschen, die nicht zurückkommen. Räume, die zu lange leer stehen. Solche Dinge.",
        subtext: "Er hat das jahrelang nicht ausgesprochen.",
        next: "ps5",
      },
      ps5: {
        id: "ps5",
        speaker: "PHILIPPE",
        text: "Aha. — Aha. Interessant. Sehr interessant.",
        subtext: "Er sagt „interessant“ wie jemand, der gerade ein Puzzleteil dreht.",
        end: true,
      },
    },
  },

  philippeProbe3: {
    id: "philippeProbe3",
    start: "pt1",
    onEnd: (api) => api.setFlag("philippeProbeNote3"),
    lines: {
      pt1: {
        id: "pt1",
        speaker: "PHILIPPE",
        text: "Darf ich? — Wie gehen Sie eigentlich mit dem Schmerz-Radio um? Konkret. Wie viele Stunden am Tag?",
        subtext: "Es klingt beiläufig. Es ist nicht beiläufig.",
        next: "pt2",
      },
      pt2: {
        id: "pt2",
        speaker: "LAYARD",
        text: "Mehr, als die Leitstelle empfiehlt. Manche Tage fast durchgehend.",
        next: "pt3",
      },
      pt3: {
        id: "pt3",
        speaker: "PHILIPPE",
        text: "Und — wenn Sie es ausschalten? Was passiert dann?",
        next: "pt4",
      },
      pt4: {
        id: "pt4",
        speaker: "LAYARD",
        text: "Dann höre ich mich selbst.",
        subtext: "Drei Worte. Mehr braucht es nicht.",
        next: "pt5",
      },
      pt5: {
        id: "pt5",
        speaker: "PHILIPPE",
        text: "Ja. Ja, das verstehe ich. — Ich meine, ich glaube, das verstehe ich.",
        subtext: "Er versteht es nicht. Er wird es heute nacht aufschreiben.",
        end: true,
      },
    },
  },

  philippeProbe4: {
    id: "philippeProbe4",
    start: "pu1",
    onEnd: (api) => api.setFlag("philippeProbeNote4"),
    lines: {
      pu1: {
        id: "pu1",
        speaker: "PHILIPPE",
        text: "Diese Insa. Bauerfeind, oder? — Wie würden Sie Ihr Verhältnis beschreiben?",
        subtext: "Eine sehr gezielte Frage, als ginge es nur um Smalltalk.",
        next: "pu2",
      },
      pu2: {
        id: "pu2",
        speaker: "LAYARD",
        text: "Es gibt kein Verhältnis. Sie ist die Stimme am Telefon. Heute zum dritten Mal.",
        next: "pu3",
      },
      pu3: {
        id: "pu3",
        speaker: "PHILIPPE",
        text: "Dreimal. An einem Tag. — Sagt sie etwas, das nicht im Protokoll steht?",
        next: "pu4",
      },
      pu4: {
        id: "pu4",
        speaker: "LAYARD",
        text: "… Manchmal. Pausen. Eine Frage, die sie nicht stellen müsste.",
        subtext: "Das hat er bisher nicht einmal sich selbst eingestanden.",
        next: "pu5",
      },
      pu5: {
        id: "pu5",
        speaker: "PHILIPPE",
        text: "Aha. — Verzeihen Sie. Ich höre einfach gerne zu.",
        subtext: "Er hört nicht nur zu. Er sortiert.",
        end: true,
      },
    },
  },

  philippeProbe5: {
    id: "philippeProbe5",
    start: "pv1",
    onEnd: (api) => api.setFlag("philippeProbeNote5"),
    lines: {
      pv1: {
        id: "pv1",
        speaker: "PHILIPPE",
        text: "Eine letzte Frage, dann lasse ich Sie. — Wenn Sie heute hier weggehen, kommen Sie wieder?",
        subtext: "Er hat das schon gefragt. Er fragt es trotzdem noch einmal.",
        next: "pv2",
      },
      pv2: {
        id: "pv2",
        speaker: "LAYARD",
        text: "Ich weiß es nicht.",
        next: "pv3",
      },
      pv3: {
        id: "pv3",
        speaker: "PHILIPPE",
        text: "Das ist die ehrlichste Antwort, die ich heute gehört habe. — Danke.",
        next: "pv4",
      },
      pv4: {
        id: "pv4",
        speaker: "PHILIPPE",
        text: "Eines noch: Glauben Sie, dass der Mann von nebenan … freiwillig geklopft hat? Oder hat ihn etwas geklopft?",
        subtext: "Er fragt das, als hätte er die Antwort längst formuliert.",
        next: "pv5",
      },
      pv5: {
        id: "pv5",
        speaker: "LAYARD",
        text: "Ich weiß es nicht, Philippe. Ich weiß heute sehr vieles nicht.",
        next: "pv6",
      },
      pv6: {
        id: "pv6",
        speaker: "PHILIPPE",
        text: "Gut. — Das ist gut.",
        subtext: "Er sagt es zu sich selbst. Schon halb am Schreibtisch.",
        end: true,
      },
    },
  },

  // ═════════════════════════════════════════════════════════════
  // HELKA VINT — Tür 2610 (Türgespräch)
  // ═════════════════════════════════════════════════════════════
  helkaAtDoor: {
    id: "helkaAtDoor",
    start: "h1",
    lines: {
      h1: {
        id: "h1",
        speaker: "SYSTEM",
        text: "[ Layard klopft an 2610. Die Tür öffnet sich nur einen Spalt. Eine Frau Mitte fünfzig, grau-meliertes Haar, randlose Brille, mustert ihn von oben. ]",
        next: "h2",
      },
      h2: {
        id: "h2",
        speaker: "HELKA",
        text: "Sie sind der Schreiber aus 2611. Worag. ›Räume, die zu lange leer stehen, werden zu Räumen, die niemand mehr betritt.‹ — Ihre Zeile, 1991, Morgenblatt, Seite 11.",
        next: "h3",
      },
      h3: {
        id: "h3",
        speaker: "LAYARD",
        text: "… das habe ich geschrieben?",
        subtext: "Er erinnert sich nicht. Nicht an den Satz, nicht an die Seite, nicht an 1991.",
        next: "h4",
      },
      h4: {
        id: "h4",
        speaker: "HELKA",
        text: "Sie haben es geschrieben. Ich habe es archiviert. Das ist mein Beruf gewesen. Bibliothekarin. Bevor sie die Bibliothek geschlossen haben.",
        next: "h5",
      },
      h5: {
        id: "h5",
        speaker: "LAYARD",
        text: "Es tut mir leid, dass ich störe. Ich gehe jetzt durch den Korridor — Nachbarschaft, sagt man wohl.",
        next: "h6",
      },
      h6: {
        id: "h6",
        speaker: "HELKA",
        text: "Nachbarschaft. Schönes Wort. Steht nicht mehr im Verzeichnis der Leitstelle. Kommen Sie wieder. Aber nicht oft.",
        subtext: "Sie schließt die Tür einen Spalt weiter.",
        end: true,
      },
    },
  },

  helkaSmalltalk: {
    id: "helkaSmalltalk",
    start: "hs1",
    lines: {
      hs1: {
        id: "hs1",
        speaker: "SYSTEM",
        text: "[ Helka steht wieder im Türspalt. Diesmal mit einer Tasse — der Inhalt klar, geruchlos. ]",
        next: "hs2",
      },
      hs2: {
        id: "hs2",
        speaker: "HELKA",
        text: "Ich sortiere heute ungelesene Mails der Leitstelle. Schicht acht Stunden. Eintausendzweihundert Stück, durchschnittlich. Niemand wird sie lesen. Ich auch nicht.",
        next: "hs3",
      },
      hs3: {
        id: "hs3",
        speaker: "LAYARD",
        text: "Bibliothekarin — was haben Sie da gemacht? Ich meine, abgesehen vom Sortieren.",
        next: "hs4",
      },
      hs4: {
        id: "hs4",
        speaker: "HELKA",
        text: "Wörter aufbewahren. Manche kommen nicht mehr vor in offiziellen Mitteilungen. ›Zärtlich.‹ ›Beliebig.‹ ›Sehnsucht.‹ — Wer das letzte Mal eines davon gehört? Der Sprecher merkt nicht einmal, dass es fehlt.",
        subtext: "Das Passwort ihres alten Berufs liegt in dem Satz. Sie weiß es. Sie testet, ob er zuhört.",
        next: "hs5",
      },
      hs5: {
        id: "hs5",
        speaker: "LAYARD",
        text: "Sie führen eine Liste? Solcher Wörter?",
        next: "hs6",
      },
      hs6: {
        id: "hs6",
        speaker: "HELKA",
        text: "Privat. Auf meinem Rechner. Wer wissen will, wie sie heißt — sie heißt nach dem, was ich war. Das ist alles, was ich Ihnen heute sage.",
        end: true,
      },
    },
  },

  helkaSmalltalk2: {
    id: "helkaSmalltalk2",
    start: "hs21",
    lines: {
      hs21: {
        id: "hs21",
        speaker: "HELKA",
        text: "Sie sind hartnäckig, Herr Worag. Das ist neu in diesem Korridor.",
        next: "hs22",
      },
      hs22: {
        id: "hs22",
        speaker: "HELKA",
        text: "1989 habe ich einmal einen Bewohner gemeldet. Er hat die Frequenz manipuliert. Mit einem Lötkolben und einer Theorie. Es ist nichts passiert. Mit ihm nicht. Mit der Meldung nicht. Mit mir auch nicht — und das hat mir am meisten zu denken gegeben.",
        next: "hs23",
      },
      hs23: {
        id: "hs23",
        speaker: "LAYARD",
        text: "Was ist mit ihm geschehen?",
        next: "hs24",
      },
      hs24: {
        id: "hs24",
        speaker: "HELKA",
        text: "Er wohnt noch hier. Drei Türen weiter. Er weiß es nicht. Ich weiß es. Sie wissen es jetzt auch.",
        end: true,
      },
    },
  },

  helkaFlyer: {
    id: "helkaFlyer",
    start: "hf1",
    onEnd: (api) => {
      api.setFlag("helkaWarned");
    },
    lines: {
      hf1: {
        id: "hf1",
        speaker: "LAYARD",
        text: "Darf ich Ihnen etwas zeigen?",
        next: "hf2",
      },
      hf2: {
        id: "hf2",
        speaker: "SYSTEM",
        text: "[ Layard reicht das gefaltete Flugblatt durch den Türspalt. Helka liest es. Einmal. Faltet es zusammen. Liest es noch einmal. ]",
        next: "hf3",
      },
      hf3: {
        id: "hf3",
        speaker: "HELKA",
        text: "Z.K.S. Das hat schon mal jemand versucht. 1989. Wortgleich, fast. Nehmen Sie es wieder mit, Herr Worag.",
        next: "hf4",
      },
      hf4: {
        id: "hf4",
        speaker: "HELKA",
        text: "Und werfen Sie es nicht in meinen Briefschlitz. Ich sortiere alles, was reinkommt. Auch das, was ich nicht sortieren möchte.",
        next: "hf5",
      },
      hf5: {
        id: "hf5",
        speaker: "LAYARD",
        text: "Sie haben Angst.",
        next: "hf6",
      },
      hf6: {
        id: "hf6",
        speaker: "HELKA",
        text: "Ich habe Ordnung. Das ist nicht dasselbe. Aber heute, zum ersten Mal seit Jahren: vielleicht ist es das doch.",
        end: true,
      },
    },
  },

  // ═════════════════════════════════════════════════════════════
  // BODO MARSCHKE — Wohnung 2612 (begehbar)
  // ═════════════════════════════════════════════════════════════
  bodoIntro: {
    id: "bodoIntro",
    start: "b1",
    lines: {
      b1: {
        id: "b1",
        speaker: "SYSTEM",
        text: "[ Ein Mann Anfang sechzig, Hände wie Werkzeug, sitzt in einem zweiten Sessel — schmaler als der mit der Decke. Er hebt zur Begrüßung die Tasse, sagt aber nichts. ]",
        next: "b2",
      },
      b2: {
        id: "b2",
        speaker: "LAYARD",
        text: "Entschuldigen Sie das Eindringen. Ich bin Layard Worag, von gegenüber.",
        next: "b3",
      },
      b3: {
        id: "b3",
        speaker: "BODO",
        text: "Bodo Marschke. Tür war offen, also kein Eindringen. Setzen Sie sich, wenn Sie wollen. Tee?",
        subtext: "Er deutet auf eine Tasse mit etwas Bräunlichem. Synthetischer Aufguss. Riecht nach Karton.",
        next: "b4",
      },
      b4: {
        id: "b4",
        speaker: "LAYARD",
        text: "Danke, nein. — Sie wohnen hier allein?",
        next: "b5",
      },
      b5: {
        id: "b5",
        speaker: "BODO",
        text: "Allein ist relativ. — Fernmeldetechniker, Stadtwerke, sechsundzwanzig Jahre. Vorruhestand seit der Sektor-Reform. Und seitdem … ja. Hier.",
        next: "b6",
      },
      b6: {
        id: "b6",
        speaker: "SYSTEM",
        text: "[ Auf dem Sessel mit der Decke bewegt sich etwas. Eine Pfote streckt sich langsam aus den Falten. ]",
        choices: [
          { text: "Sie haben ein Tier?", next: "bodoLottiReveal" },
          { text: "Stadtwerke. Erzählen Sie.", next: "b7" },
          { text: "[ Beenden ]" },
        ],
      },
      b7: {
        id: "b7",
        speaker: "BODO",
        text: "Funkanlagen. Trägersignale. Verstärker. Wenn die Stadt knirschte, war meistens eine Spule kalt. — Ich rede nicht gern darüber. Es war ein anderer Beruf, in einer anderen Stadt.",
        choices: [
          { text: "Da bewegt sich etwas auf dem Sessel.", next: "bodoLottiReveal" },
          { text: "[ Beenden ]" },
        ],
      },
      bodoLottiReveal: {
        id: "bodoLottiReveal",
        speaker: "BODO",
        text: "Ja. Lotti. Vierzehn Jahre. Frisst nur noch B3, weil sie nichts anderes mehr mag. Deshalb der Aufstand bei Insa, damals.",
        subtext: "Bodo schaut auf den Sessel. Etwas in seinem Gesicht öffnet sich, kurz.",
        next: "bodoLottiReveal2",
      },
      bodoLottiReveal2: {
        id: "bodoLottiReveal2",
        speaker: "BODO",
        text: "Tiere sind im Sektor offiziell nicht erlaubt. Ich hab sie über Insa angemeldet. Sie hat es nie protokolliert. Das ist alles, was ich Ihnen heute über Insa sage.",
        next: "bodoLottiReveal3",
      },
      bodoLottiReveal3: {
        id: "bodoLottiReveal3",
        speaker: "BODO",
        text: "Sie zuckt, wenn das Radio voll aufgedreht ist. Deshalb läuft hier 104,6 leise. Ist auch alles, was sie hört.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("knowsLotti");
            },
          },
        ],
      },
    },
  },

  bodoLotti: {
    id: "bodoLotti",
    start: "bl1",
    lines: {
      bl1: {
        id: "bl1",
        speaker: "SYSTEM",
        text: "[ Layard beugt sich zur Decke hinunter. Die Katze öffnet ein Auge, schließt es wieder. ]",
        next: "bl2",
      },
      bl2: {
        id: "bl2",
        speaker: "BODO",
        text: "Sie heißt Lotti. Vierzehn Jahre. Ich hab sie über Insa angemeldet, damals. Tiere sind im Sektor eigentlich nicht erlaubt — Insa hat es nie protokolliert.",
        next: "bl3",
      },
      bl3: {
        id: "bl3",
        speaker: "BODO",
        text: "Sie zuckt, wenn das Radio voll aufgedreht ist. Deshalb dreh’ ich es hier nicht hoch. Sie ist die Einzige, die mir das übel nehmen würde.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("knowsLotti");
            },
          },
        ],
      },
    },
  },

  bodoSmalltalk: {
    id: "bodoSmalltalk",
    start: "bk1",
    lines: {
      bk1: {
        id: "bk1",
        speaker: "BODO",
        text: "Setzen Sie sich. Lotti hat Sie nicht weggebissen. Das ist heute schon viel.",
        subtext: "Bodo nickt langsam, als Layard wieder in der Tür steht.",
        next: "bk2",
      },
      bk2: {
        id: "bk2",
        speaker: "BODO",
        text: "Was treibt Sie eigentlich heute durch die Etagen, Herr Worag? Ich hab Sie noch nie aus 2611 rauskommen sehen. Nicht in den letzten Jahren.",
        next: "bk3",
      },
      bk3: {
        id: "bk3",
        speaker: "LAYARD",
        text: "Heute habe ich Urlaub. Ich wollte … weiter.",
        next: "bk4",
      },
      bk4: {
        id: "bk4",
        speaker: "BODO",
        text: "Weiter. Schönes Wort. Steht nicht im Lautsprecher. Wenn Sie weiter wollen — gehen Sie zu Helka, drei Türen weiter. Die hat eine Liste. Da steht ›weiter‹ wahrscheinlich auch drin.",
        subtext: "Er trinkt einen Schluck.",
        choices: [
          {
            text: "Da bewegt sich etwas auf dem Sessel.",
            next: "bodoLottiReveal",
          },
          { text: "[ Beenden ]" },
        ],
      },
      // Wiederverwendete Lotti-Reveal-Sequenz, falls der Spieler das Tier
      // im Smalltalk anspricht (statt im Intro).
      bodoLottiReveal: {
        id: "bodoLottiReveal",
        speaker: "BODO",
        text: "Ja. Lotti. Vierzehn Jahre. Frisst nur noch B3, weil sie nichts anderes mehr mag. Deshalb der Aufstand bei Insa, damals.",
        subtext: "Bodo schaut auf den Sessel. Etwas in seinem Gesicht öffnet sich, kurz.",
        next: "bodoLottiReveal2",
      },
      bodoLottiReveal2: {
        id: "bodoLottiReveal2",
        speaker: "BODO",
        text: "Tiere sind im Sektor offiziell nicht erlaubt. Ich hab sie über Insa angemeldet. Sie hat es nie protokolliert. Das ist alles, was ich Ihnen heute über Insa sage.",
        next: "bodoLottiReveal3",
      },
      bodoLottiReveal3: {
        id: "bodoLottiReveal3",
        speaker: "BODO",
        text: "Sie zuckt, wenn das Radio voll aufgedreht ist. Deshalb läuft hier 104,6 leise. Ist auch alles, was sie hört.",
        choices: [
          {
            text: "[ Verstanden. ]",
            action: (api) => {
              api.setFlag("knowsLotti");
            },
          },
        ],
      },
    },
  },

  bodoFlyer: {
    id: "bodoFlyer",
    start: "bf1",
    onEnd: (api) => {
      api.setFlag("bodoToldCarrierTruth");
    },
    lines: {
      bf1: {
        id: "bf1",
        speaker: "LAYARD",
        text: "Darf ich Ihnen etwas zeigen?",
        next: "bf2",
      },
      bf2: {
        id: "bf2",
        speaker: "SYSTEM",
        text: "[ Bodo nimmt das Flugblatt zwischen zwei Finger. Liest. Lange. Lotti zuckt einmal mit dem Ohr, als wäre eine Frequenz gewandert. ]",
        next: "bf3",
      },
      bf3: {
        id: "bf3",
        speaker: "BODO",
        text: "Z.K.S. Den Namen kenne ich. Aus dem Funkprotokoll. — Das hier ist nichts Neues, Herr Worag. Das hier ist nur das erste Mal, dass es jemand auf Papier bringt.",
        next: "bf4",
      },
      bf4: {
        id: "bf4",
        speaker: "LAYARD",
        text: "Welches Funkprotokoll?",
        next: "bf5",
      },
      bf5: {
        id: "bf5",
        speaker: "BODO",
        text: "Das Trägersignal von 104,6. Stadtwerke-Logbücher, neunzehnhunderteinundneunzig. Seitdem wird der Träger manuell nachgeregelt — von Hand. Ein Mensch, eine Schicht, ein Drehknopf.",
        next: "bf6",
      },
      bf6: {
        id: "bf6",
        speaker: "BODO",
        text: "Wenn der Mensch geht, geht das Signal. Wenn das Signal geht, hört der Sektor sich selbst. Das ist alles, was Sie wissen müssen — und mehr, als ich heute hätte sagen sollen.",
        next: "bf7",
      },
      bf7: {
        id: "bf7",
        speaker: "SYSTEM",
        text: "[ Bodo gibt das Flugblatt zurück. Lotti rollt sich enger ein. Bodo sagt nichts mehr. ]",
        end: true,
      },
    },
  },

  // ── Layard überzeugt Bodo, schnell B3 für Lotti zu besorgen ─────
  bodoConvinceLeave: {
    id: "bodoConvinceLeave",
    start: "bc1",
    onEnd: (api) => {
      if (api.hasFlag("bodoLeftForB3")) return;
    },
    lines: {
      bc1: {
        id: "bc1",
        speaker: "LAYARD",
        text: "Bodo, darf ich was Persönliches fragen? — Wie viele Dosen B3 hat Lotti noch?",
        next: "bc2",
      },
      bc2: {
        id: "bc2",
        speaker: "BODO",
        text: "Warum fragen Sie das?",
        subtext: "Bodo zieht eine Augenbraue hoch. Er hat heute morgen schon nachgeschaut. Er weiß die Antwort.",
        next: "bc3",
      },
      bc3: {
        id: "bc3",
        speaker: "LAYARD",
        text: "Weil sie zuckt, wenn der Napf leer ist. Und Sie haben gerade dreimal in den Sessel geschaut, ohne es zu merken.",
        next: "bc4",
      },
      bc4: {
        id: "bc4",
        speaker: "SYSTEM",
        text: "Bodo schweigt. Schaut zum Sessel. Schaut zurück.",
        next: "bc5",
      },
      bc5: {
        id: "bc5",
        speaker: "BODO",
        text: "Zwei Dosen Rind. Fisch ist aus. Lieferung ist erst Freitag.",
        next: "bc6",
      },
      bc6: {
        id: "bc6",
        speaker: "LAYARD",
        text: "Wenn Lotti laut wird, wird der ganze Korridor laut. Sie wissen, wer dann anruft.",
        subtext: "Layard erstaunt sich selbst. Er klingt wie jemand, der einen Plan hat.",
        next: "bc7",
      },
      bc7: {
        id: "bc7",
        speaker: "BODO",
        text: "Insa. Ja. — Die Vorratskammer ist im Schacht 4, fünfzehn Minuten hin, fünfzehn zurück. Zu lang.",
        subtext: "Bodo seufzt.",
        next: "bc8",
      },
      bc8: {
        id: "bc8",
        speaker: "LAYARD",
        text: "Ich pass’ auf Lotti auf. Gehen Sie. Bevor sie aufwacht und merkt, dass nichts da ist.",
        next: "bc9",
      },
      bc9: {
        id: "bc9",
        speaker: "SYSTEM",
        text: "Bodo steht auf. Langsam, aber ohne Zögern. Greift nach der Jacke.",
        next: "bc10",
      },
      bc10: {
        id: "bc10",
        speaker: "BODO",
        text: "Eine Viertelstunde. Höchstens. — Und Worag: am Terminal hängen ein paar Privatsachen. Die gehen Sie nichts an.",
        subtext: "Er sagt das, ohne sich umzudrehen. Er weiß, was er gerade gesagt hat.",
        next: "bc11",
      },
      bc11: {
        id: "bc11",
        speaker: "SYSTEM",
        text: "[ Die Tür fällt ins Schloss. Schritte werden leiser. Lotti schnurrt einmal, leise. Sonst: Stille. ]",
        choices: [
          {
            text: "[ Allein. Fünfzehn Minuten. ]",
            action: (api) => {
              api.setFlag("bodoLeftForB3");
            },
          },
        ],
      },
    },
  },

  // ── Bodo kommt zurück (Spieler hat NICHT aktualisiert) ──────────
  bodoReturnsClean: {
    id: "bodoReturnsClean",
    start: "br1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3");
    },
    lines: {
      br1: {
        id: "br1",
        speaker: "SYSTEM",
        text: "[ Bodo schiebt sich durch die Tür. Eine Tasche unter dem Arm, vier Dosen B3 darin. Lotti hebt den Kopf, das erste Mal seit einer Stunde. ]",
        next: "br2",
      },
      br2: {
        id: "br2",
        speaker: "BODO",
        text: "Vierzehn Minuten. Mein neuer Rekord.",
        subtext: "Er stellt die Dosen ab. Schaut kurz zum Terminal.",
        next: "br3",
      },
      br3: {
        id: "br3",
        speaker: "BODO",
        text: "Bildschirm steht noch wie ich ihn verlassen hab’. Brav, Worag. Brav.",
        subtext: "Er glaubt es nur halb. Aber heute reicht ihm das.",
        next: "br4",
      },
      br4: {
        id: "br4",
        speaker: "SYSTEM",
        text: "[ Lotti reibt den Kopf an Bodos Schienbein. Bodo lächelt zum ersten Mal mit den Augen. ]",
        end: true,
      },
    },
  },

  // ── Bodo kommt zurück (Spieler HAT aktualisiert) ────────────────
  bodoReturnsCaught: {
    id: "bodoReturnsCaught",
    start: "bx1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3");
      api.setFlag("bodoNoticedIntrusion");
    },
    lines: {
      bx1: {
        id: "bx1",
        speaker: "SYSTEM",
        text: "[ Bodo schiebt sich durch die Tür. Tasche unter dem Arm, B3 darin. Lotti hebt den Kopf — und Bodo bleibt im Türrahmen stehen. ]",
        next: "bx2",
      },
      bx2: {
        id: "bx2",
        speaker: "SYSTEM",
        text: "Bodo schaut zum Terminal. Schaut wieder zurück. Sein Gesicht wird sehr still.",
        next: "bx3",
      },
      bx3: {
        id: "bx3",
        speaker: "BODO",
        text: "v2.3.1. — Ich hatte v2.0. Seit sechs Jahren v2.0.",
        subtext: "Er sagt das nicht laut. Er sagt es so, wie man eine Zahl ausspricht, die nicht stimmen kann.",
        next: "bx4",
      },
      bx4: {
        id: "bx4",
        speaker: "BODO",
        text: "Worag. Sie haben an meinem Rechner gesessen. Mit meinem Login. Mit meinem Hostnamen. — Und Sie haben aktualisiert.",
        subtext: "Langsam. Jedes Wort einzeln gewogen.",
        next: "bx5",
      },
      bx5: {
        id: "bx5",
        speaker: "LAYARD",
        text: "Es … es kam ein Fenster. Immer wieder. Ich dachte —",
        next: "bx6",
      },
      bx6: {
        id: "bx6",
        speaker: "BODO",
        text: "Ich weiß, was Sie dachten. Sie dachten gar nichts. Sie haben einfach geklickt.",
        subtext: "Er stellt die Dosen ab. Lauter, als nötig.",
        next: "bx7",
      },
      bx7: {
        id: "bx7",
        speaker: "SYSTEM",
        text: "[ Stille. Lotti schaut zwischen beiden hin und her. Bodo zieht die Jacke aus. Setzt sich. ]",
        next: "bx8",
      },
      bx8: {
        id: "bx8",
        speaker: "BODO",
        text: "Ach, Worag. — Ich war auch mal so neugierig wie Sie. Vor langer, langer Zeit.",
        subtext: "Leiser jetzt. Etwas weiter weg als der vorige Satz.",
        next: "bx9",
      },
      bx9: {
        id: "bx9",
        speaker: "BODO",
        text: "Geht jetzt. Gehen Sie. Bevor ich es mir doch anders überlege.",
        subtext: "Er meint es nicht. Aber heute ist heute.",
        end: true,
      },
    },
  },

  // ── Bodo kommt zurück (Spieler hat NUR die Wartung 4711 storniert,
  //    NICHT das System aktualisiert). Eigener, kürzerer Pfad ohne den
  //    v2.3.1-Schock — Bodo merkt etwas anderes: das gelöschte Ticket. ──
  bodoReturnsCaughtMaint: {
    id: "bodoReturnsCaughtMaint",
    start: "bm1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3");
      api.setFlag("bodoNoticedIntrusion");
    },
    lines: {
      bm1: {
        id: "bm1",
        speaker: "SYSTEM",
        text: "[ Bodo schiebt sich durch die Tür. Tasche unter dem Arm, B3 darin. Lotti hebt den Kopf — und Bodo bleibt im Türrahmen stehen. ]",
        next: "bm2",
      },
      bm2: {
        id: "bm2",
        speaker: "SYSTEM",
        text: "Bodo schaut zum Terminal. Bildschirm steht — fast — wie er ihn verlassen hat. Eine Zeile zu viel im Verlauf.",
        next: "bm3",
      },
      bm3: {
        id: "bm3",
        speaker: "BODO",
        text: "Wartung 4711. Storniert. Heute Mittag, von meinem Hostnamen aus. Hm.",
        subtext: "Keine Frage. Eine Feststellung.",
        next: "bm4",
      },
      bm4: {
        id: "bm4",
        speaker: "BODO",
        text: "Worag. Sie haben an meinem Rechner gesessen. Mit meinem Login. — Und Sie haben in ein Ticket eingegriffen, das Sie nichts angeht.",
        subtext: "Langsam. Ohne Lautstärke. Das ist schlimmer.",
        next: "bm5",
      },
      bm5: {
        id: "bm5",
        speaker: "LAYARD",
        text: "Der Aufzug stand. Ich konnte sonst nirgendwo hin. Es war keine Wartung — es war ein Riegel.",
        next: "bm6",
      },
      bm6: {
        id: "bm6",
        speaker: "BODO",
        text: "Das wussten Sie. Und Sie haben trotzdem geklickt. — Das ist genau so klug, wie es klingt.",
        subtext: "Er stellt die Dosen ab. Nicht laut. Sehr bestimmt.",
        next: "bm7",
      },
      bm7: {
        id: "bm7",
        speaker: "SYSTEM",
        text: "[ Stille. Lotti schaut zwischen beiden hin und her. Bodo zieht die Jacke aus. Setzt sich. ]",
        next: "bm8",
      },
      bm8: {
        id: "bm8",
        speaker: "BODO",
        text: "Ach, Worag. — Ich war auch mal so neugierig wie Sie. Vor langer, langer Zeit.",
        subtext: "Leiser jetzt. Etwas weiter weg als der vorige Satz.",
        next: "bm9",
      },
      bm9: {
        id: "bm9",
        speaker: "BODO",
        text: "Gehen Sie. Bevor ich es mir doch anders überlege. Und nehmen Sie Ihre Idee von Mut gleich mit.",
        subtext: "Er meint es nicht ganz. Aber heute ist heute.",
        end: true,
      },
    },
  },

  // ── Zweiter Anlauf: Layard überredet Bodo erneut wegzugehen ─────
  // Voraussetzung: Bodo war schon einmal weg, ist zurück, und die
  // Aufzugssperre 4711 liegt immer noch auf der Etage. Anderes Argument:
  // Lottis Wassernapf braucht frisches Wasser aus der Sektor-Leitung.
  bodoConvinceLeave2: {
    id: "bodoConvinceLeave2",
    start: "bd1",
    lines: {
      bd1: {
        id: "bd1",
        speaker: "LAYARD",
        text: "Bodo. Eine Frage noch. — Lottis Wassernapf. Wann haben Sie zuletzt Sektor-Wasser geholt?",
        next: "bd2",
      },
      bd2: {
        id: "bd2",
        speaker: "SYSTEM",
        text: "Bodo schaut auf den Napf. Auf Lotti. Wieder auf Layard.",
        subtext: "Der Napf ist halb leer und sieht trübe aus.",
        next: "bd3",
      },
      bd3: {
        id: "bd3",
        speaker: "BODO",
        text: "Vorgestern. Vielleicht. — Das Leitungswasser hier oben ist… nicht für Katzen.",
        next: "bd4",
      },
      bd4: {
        id: "bd4",
        speaker: "LAYARD",
        text: "Im Schacht 4 gibt es einen Filterhahn. Sie wissen das. Ich pass’ wieder auf. Gehen Sie.",
        subtext: "Layard sagt das ruhiger als beim ersten Mal. Er weiß, was er gerade tut.",
        next: "bd5",
      },
      bd5: {
        id: "bd5",
        speaker: "SYSTEM",
        text: "Bodo seufzt. Diesmal länger.",
        next: "bd6",
      },
      bd6: {
        id: "bd6",
        speaker: "BODO",
        text: "Sie haben heute zweimal Recht, Worag. Das ist mehr als die meisten in einem Jahr.",
        next: "bd7",
      },
      bd7: {
        id: "bd7",
        speaker: "BODO",
        text: "Eine Viertelstunde. Und das Terminal lasse ich offen — ich glaub’ inzwischen nicht mehr, dass Sie irgendwas tun, was ich nicht selber täte.",
        subtext: "Vertrauen klingt bei Bodo wie Resignation. Ist es aber nicht.",
        next: "bd8",
      },
      bd8: {
        id: "bd8",
        speaker: "SYSTEM",
        text: "[ Die Tür fällt ins Schloss. Lotti rollt sich um. Stille. ]",
        choices: [
          {
            text: "[ Allein. Wieder fünfzehn Minuten. ]",
            action: (api) => {
              api.setFlag("bodoLeftForB3Twice");
            },
          },
        ],
      },
    },
  },

  // ── Zweiter Anlauf, Bodo kommt zurück und Layard hat es geschafft ─
  bodoReturnsCaught2: {
    id: "bodoReturnsCaught2",
    start: "bz1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3Twice");
    },
    lines: {
      bz1: {
        id: "bz1",
        speaker: "SYSTEM",
        text: "[ Bodo kommt zurück, eine Wasserkanne in der Hand. Er schaut zum Aufzug-Display draußen — das rote Blinken ist weg. ]",
        next: "bz2",
      },
      bz2: {
        id: "bz2",
        speaker: "BODO",
        text: "Wartung 4711 storniert. — Ich frage nicht, von wo aus.",
        subtext: "Er fragt es trotzdem, nur leiser.",
        next: "bz3",
      },
      bz3: {
        id: "bz3",
        speaker: "BODO",
        text: "Gehen Sie, wo Sie hin müssen, Worag. Bevor jemand merkt, dass mein Login heute zu viel kann.",
        end: true,
      },
    },
  },

  // ── Zweiter Anlauf, Layard hat WIEDER nichts getan → Lösung C ────
  // Bodo merkt selbst, dass die Sperre dämlich ist, und storniert sie.
  bodoReturnsSelfFix: {
    id: "bodoReturnsSelfFix",
    start: "bs1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3Twice");
      api.setFlag("elevatorMaintCleared");
      api.setFlag("bodoSelfCanceledMaint");
    },
    lines: {
      bs1: {
        id: "bs1",
        speaker: "SYSTEM",
        text: "[ Bodo kommt zurück, Kanne in der Hand, Lotti reibt sich an seinem Schienbein. Er bleibt im Türrahmen stehen. ]",
        next: "bs2",
      },
      bs2: {
        id: "bs2",
        speaker: "SYSTEM",
        text: "Bodo schaut zum Terminal. Bildschirm dunkel. Tastatur unberührt.",
        subtext: "Er glaubt es schon eher als beim ersten Mal.",
        next: "bs3",
      },
      bs3: {
        id: "bs3",
        speaker: "BODO",
        text: "Worag. Sie hatten zweimal eine halbe Stunde an meinem Rechner. Und Sie haben nichts angerührt.",
        next: "bs4",
      },
      bs4: {
        id: "bs4",
        speaker: "LAYARD",
        text: "Ich wollte nichts kaputtmachen.",
        next: "bs5",
      },
      bs5: {
        id: "bs5",
        speaker: "BODO",
        text: "Kaputtmachen. Hm. — Da steht draußen ein Aufzug, der seit heute Mittag nichts mehr tut. Wartung 4711. Wegen Ihrer kleinen Resonanz-Geschichte unten.",
        next: "bs6",
      },
      bs6: {
        id: "bs6",
        speaker: "SYSTEM",
        text: "Bodo setzt sich ans Terminal. Tippt drei Zeilen, ohne hinzuschauen.",
        subtext: "Routine. Er hat das hundertmal gemacht. Nur nie für jemanden.",
        next: "bs7",
      },
      bs7: {
        id: "bs7",
        speaker: "BODO",
        text: "Storniert. — Sie wollten nicht. Also ich. Einmal. Damit Sie da rauskommen, wo Sie hin müssen.",
        next: "bs8",
      },
      bs8: {
        id: "bs8",
        speaker: "BODO",
        text: "Nächstes Mal trauen Sie sich. Oder lassen es ganz. Aber halten Sie mich nicht zweimal mit derselben Geschichte vom Sessel weg.",
        subtext: "Das ist kein Schimpfen. Das ist Bodos Art von Zuneigung.",
        end: true,
      },
    },
  },

  // ═════════════════════════════════════════════════════════════
  // ENNIS KORR — Tür 2614 (Türgespräch)
  // ═════════════════════════════════════════════════════════════
  ennisAtDoor: {
    id: "ennisAtDoor",
    start: "e1",
    lines: {
      e1: {
        id: "e1",
        speaker: "SYSTEM",
        text: "[ Die Tür 2614 fliegt komplett auf. Ein Mann Anfang dreißig, Schichtarbeiter-Jacke, blockiert den Rahmen mit dem Körper. ]",
        next: "e2",
      },
      e2: {
        id: "e2",
        speaker: "ENNIS",
        text: "Was wollen Sie? Hören heißt Gehören, Bürger. Was machen Sie um diese Zeit im Korridor und nicht auf Schicht?",
        next: "e3",
      },
      e3: {
        id: "e3",
        speaker: "LAYARD",
        text: "Ich habe heute Urlaub. Layard Worag, 2611.",
        next: "e4",
      },
      e4: {
        id: "e4",
        speaker: "ENNIS",
        text: "Urlaub. Schön. — Ich hab Nachtschicht in der Logistik. Sektor-Frachten. Ohne mich kommt Ihre B2 nicht in den Schacht. Sie sind also indirekt mein Bürger. Behalten Sie das im Kopf.",
        next: "e5",
      },
      e5: {
        id: "e5",
        speaker: "LAYARD",
        text: "Verstanden. Insa hat mich heute schon dreimal —",
        next: "e6",
      },
      e6: {
        id: "e6",
        speaker: "SYSTEM",
        text: "[ Ennis erstarrt für eine Sekunde, als hätte jemand einen Schalter gedrückt. ]",
        next: "e7",
      },
      e7: {
        id: "e7",
        speaker: "ENNIS",
        text: "Den Namen sagen Sie hier nicht. Nicht in meiner Tür. Schönen Urlaub, Worag.",
        next: "e8",
      },
      e8: {
        id: "e8",
        speaker: "SYSTEM",
        text: "[ Die Tür schlägt zu. Drinnen: das Geräusch eines Stuhls, der sehr vorsichtig zurückgeschoben wird. ]",
        end: true,
      },
    },
  },

  ennisSmalltalk: {
    id: "ennisSmalltalk",
    start: "es1",
    lines: {
      es1: {
        id: "es1",
        speaker: "SYSTEM",
        text: "[ Diesmal öffnet Ennis nur einen Spalt. Die Schichtarbeiterjacke sitzt nicht mehr — er war wohl gerade aufgewacht. ]",
        next: "es2",
      },
      es2: {
        id: "es2",
        speaker: "ENNIS",
        text: "Sie sind wieder da. Was wollen Sie diesmal von mir, Worag.",
        next: "es3",
      },
      es3: {
        id: "es3",
        speaker: "LAYARD",
        text: "Nichts. Nachsehen, ob Sie noch wütend sind.",
        next: "es4",
      },
      es4: {
        id: "es4",
        speaker: "ENNIS",
        text: "Wütend ist Bürgersache. Ich bin auf Linie. — Wenn Sie Smalltalk wollen, gehen Sie zu Marschke, die Katze hört zu. Hier hört nur 104,6 zu, und der zählt nicht.",
        subtext: "Er meint den Satz nicht so, wie er ihn sagt. Beides gleichzeitig.",
        end: true,
      },
    },
  },

  ennisFlyer: {
    id: "ennisFlyer",
    start: "ef1",
    onEnd: (api) => {
      api.setFlag("ennisCracked");
    },
    lines: {
      ef1: {
        id: "ef1",
        speaker: "LAYARD",
        text: "Darf ich Ihnen etwas zeigen?",
        next: "ef2",
      },
      ef2: {
        id: "ef2",
        speaker: "SYSTEM",
        text: "[ Ennis sieht das Flugblatt. Sein Gesicht zieht sich zu — Wut, Angst, beides verschachtelt. Er reißt es Layard nicht aus der Hand, aber er beugt sich vor, als wollte er es. ]",
        next: "ef3",
      },
      ef3: {
        id: "ef3",
        speaker: "ENNIS",
        text: "Das ist Hochverrat, Worag. Wissen Sie, was passiert mit Leuten, die so was im Korridor tragen? Wissen Sie, was passiert mit ihren Familien?",
        next: "ef4",
      },
      ef4: {
        id: "ef4",
        speaker: "LAYARD",
        text: "… ich glaube, Sie wissen es besser als ich.",
        next: "ef5",
      },
      ef5: {
        id: "ef5",
        speaker: "SYSTEM",
        text: "[ Ennis sackt einen halben Schritt zurück. Die Tür schwingt einen Spalt weiter auf, ohne dass er es merkt. ]",
        next: "ef6",
      },
      ef6: {
        id: "ef6",
        speaker: "ENNIS",
        text: "Mein Vater hatte so ein Blatt. Vor sechs Jahren. Sie haben ihn nach E81 versetzt. Aus E81 kommt niemand zurück. — Ich weiß nicht, warum ich Ihnen das gerade sage.",
        next: "ef7",
      },
      ef7: {
        id: "ef7",
        speaker: "LAYARD",
        text: "Ihr Vater. Wie hat er geheißen?",
        next: "ef8",
      },
      ef8: {
        id: "ef8",
        speaker: "ENNIS",
        text: "Vater. Das hat er geheißen. Ich brauche keinen anderen Namen. — Gehen Sie. Bitte. Wenn jemand fragt: Sie waren nie hier.",
        next: "ef9",
      },
      ef9: {
        id: "ef9",
        speaker: "SYSTEM",
        text: "[ Im Hinterkopf hört Layard das Wort noch nach. Ein Wort, drei Buchstaben mehr — laut, nüchtern, ohne Schmuck. Er wird es nicht vergessen. ]",
        end: true,
      },
    },
  },

  ennisAfterFlyer: {
    id: "ennisAfterFlyer",
    start: "ea1",
    lines: {
      ea1: {
        id: "ea1",
        speaker: "SYSTEM",
        text: "[ Ennis öffnet diesmal sofort, schaut links und rechts in den Korridor, zieht Layard fast hinein. ]",
        next: "ea2",
      },
      ea2: {
        id: "ea2",
        speaker: "ENNIS",
        text: "Wenn Sie noch mal an meinem Rechner sind — Passwort steht in einem Wort, das ich heute zum ersten Mal seit Jahren laut gesagt habe. Sie waren dabei. Mehr sage ich nicht.",
        next: "ea3",
      },
      ea3: {
        id: "ea3",
        speaker: "ENNIS",
        text: "Und wenn Sie irgendwann nach E81 kommen — und das wünsche ich Ihnen nicht — fragen Sie nach Korr. Vorname egal. Es gibt nur einen.",
        end: true,
      },
    },
  },
};
