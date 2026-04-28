import type { DialogTree, GameApi } from "./types";

/**
 * Weg C zum Serverraum 5610: Sobald drei Philippe-Sondierungs-Notizen
 * gesetzt sind, hat Layard genug Andeutungen, um sich Bodos zweite
 * Wartungskarte aus der Werkbank zu holen. Das Item öffnet später am
 * Kartenleser die Tür 5610. (Item-ID bleibt aus Save-Kompatibilität
 * "wartungsnotiz5610".)
 * Wird aus den onEnd-Callbacks aller fünf Sonden aufgerufen.
 */
function maybeGiveWartungsnotiz5610(api: GameApi) {
  const probes =
    (api.hasFlag("philippeProbeNote1") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote2") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote3") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote4") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote5") ? 1 : 0);
  if (probes >= 3 && !api.hasItem("wartungsnotiz5610")) {
    api.addItem({
      id: "wartungsnotiz5610",
      name: "Wartungskarte (E67 · Korridor 56)",
      description:
        "Eine abgegriffene blaue Plastikkarte aus Bodos zweiter Schublade. Auf der Rückseite mit Bleistift: »5610 · nur Bodo«. Öffnet den Kartenleser an der Wartungstür im Korridor 56.",
    });
  }
}

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
        text: "Hier wohnt ein alleinstehender Mann. Schlank, hager, vielleicht Mitte, Ende vierzig. Ich weiß nicht, wie er heißt. Ich habe geklingelt. Niemand öffnet.",
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
  // 4. Back in 2611 — first call from his own phone:
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

  // ---------------------------------------------------------------
  // 8b. Insa — Kurz-Reminder, wenn der Auftrag schon läuft
  // ---------------------------------------------------------------
  // Layard hat Insa schon gesprochen, sie hat ihn zu Knoten 5610 geschickt
  // (insaSentTo5610), aber er hat dort noch nicht »tap« ausgeführt
  // (tappedNode5610 fehlt). Wenn er sie jetzt erneut anruft, wiederholt
  // sie nicht das ganze Briefing — sie fasst nur kurz zusammen, was sie
  // braucht, und legt auf.
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
        text: "Ich … musste kurz raus. Wenn ich zu lange in der Wohnung bin, höre ich Dinge. Aus der Nachbarwand.",
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

  philippeInCorridor56: {
    id: "philippeInCorridor56",
    start: "pd0",
    onEnd: (api) => {
      api.setFlag("metPhilippeBefore");
    },
    lines: {
      pd0: {
        id: "pd0",
        speaker: "SYSTEM",
        text: "[ Am Ende des Korridors, dicht am vergitterten Fenster: Philippe. Er sieht hinaus, ohne wirklich hinzusehen. ]",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pd2",
      },
      pd1: {
        id: "pd1",
        speaker: "SYSTEM",
        text: "[ Philippe steht wieder am Fenster. Diesmal dreht er sich nicht um. ]",
        requires: ["metPhilippeBefore"],
        next: "pdR1",
      },
      pd2: {
        id: "pd2",
        speaker: "PHILIPPE",
        text: "Oh — Worag. Aus 2611, oder? Ich bin Philippe, von gegenüber. Ich komme hier manchmal hoch. Wegen der Aussicht.",
        hiddenWhen: ["metPhilippeBefore"],
        next: "pd3",
      },
      pdR1: {
        id: "pdR1",
        speaker: "PHILIPPE",
        text: "Hier oben hört man es nicht so. Das Klopfen, meine ich.",
        subtext: "Er sagt es leise. Als wollte er es selbst nicht hören.",
        requires: ["metPhilippeBefore"],
        next: "pd3",
      },
      pd3: {
        id: "pd3",
        speaker: "PHILIPPE",
        text: "Man sieht von hier oben die Antennen. Möwen. Manchmal eine. Reicht mir.",
        subtext: "Er meint nicht, dass es ihm gefällt. Er meint, dass es genug ist.",
        next: "pd4",
      },
      pd4: {
        id: "pd4",
        speaker: "PHILIPPE",
        text: "Ich gehe gleich wieder runter. Vermutlich. Schönen Tag, Herr Worag.",
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
        text: "Korridor 15. Den langen Gang ganz nach hinten. Die Tür am Ende, mit dem roten Licht.",
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
  // 10b. E71 — reception, Layard hat den Übertritt NICHT gemeldet
  // ---------------------------------------------------------------
  receptionUnannounced: {
    id: "receptionUnannounced",
    start: "ru1",
    lines: {
      ru1: {
        id: "ru1",
        speaker: "RECEPTION",
        text: "Sektor E71 — Medizin. Sie wünschen?",
        subtext: "Sie sieht ihn an, ohne zu lächeln. Die Hand bleibt auf dem Terminal.",
        next: "ru2",
      },
      ru2: {
        id: "ru2",
        speaker: "LAYARD",
        text: "Worag. E67, Quadrant 26. Ich bringe ein Einsatzprotokoll für Herrn Stegmann. Zimmer 1534.",
        next: "ru3",
      },
      ru3: {
        id: "ru3",
        speaker: "RECEPTION",
        text: "E67. — Ihr Eintritt ist hier nicht vorgemerkt, Herr Worag.",
        subtext: "Sie tippt zweimal. Wartet. Tippt noch einmal.",
        next: "ru4",
      },
      ru4: {
        id: "ru4",
        speaker: "LAYARD",
        text: "Die Vermittlung hat mich hierher geschickt. Direkt.",
        next: "ru5",
      },
      ru5: {
        id: "ru5",
        speaker: "RECEPTION",
        text: "Üblich ist das nicht. Übertritte werden vorgemerkt. Das wissen Sie.",
        subtext: "Es klingt nicht streng. Eher müde. So, als hätte sie heute schon zwei davon gehabt.",
        next: "ru6",
      },
      ru6: {
        id: "ru6",
        speaker: "RECEPTION",
        text: "Ich notiere das nach. Halten Sie Ihren Ausweis bereit, falls jemand fragt.",
        next: "ru7",
      },
      ru7: {
        id: "ru7",
        speaker: "RECEPTION",
        text: "Korridor 15. Den langen Gang ganz nach hinten. Die Tür am Ende, rotes Licht. Herr Stegmann hat heute viel auf dem Tisch — fassen Sie sich kurz.",
        next: "ru8",
      },
      ru8: {
        id: "ru8",
        speaker: "SYSTEM",
        text: "[ Sie schiebt einen Besucherchip über den Tresen. Etwas härter, als es nötig wäre. ]",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 10c. E71 — Dr. Adaeze Okwu (Korridor 15) · Schicht 1
  //      Höflicher Smalltalk. Setzt okwuLayer2 beim Weiterreden.
  // ---------------------------------------------------------------
  okwu1: {
    id: "okwu1",
    start: "ok1",
    lines: {
      ok1: {
        id: "ok1",
        speaker: "OKWU",
        text: "Sie sehen ein bisschen verloren aus. Tür gesucht oder nur Gegend angeguckt?",
        subtext: "Sie schiebt die Lesebrille von der Stirn, lächelt knapp.",
        next: "ok2",
      },
      ok2: {
        id: "ok2",
        speaker: "LAYARD",
        text: "Ich bringe nur was vorbei. Zimmer 1534.",
        next: "ok3",
      },
      ok3: {
        id: "ok3",
        speaker: "OKWU",
        text: "Stegmann. Aha. Heute haben Sie's gut getroffen, der Korridor ist fast erstaunlich ruhig. Manchmal steh' ich hier zwischen zwei Visiten und höre tatsächlich die Lüftung.",
        subtext: "Sie tippt mit dem Klemmbrett gegen den Oberschenkel, ruhig.",
        next: "ok4",
      },
      ok4: {
        id: "ok4",
        speaker: "OKWU",
        text: "Adaeze Okwu, Stationsärztin. Und Sie sind, wenn ich raten darf, nicht von hier.",
        next: "ok5",
      },
      ok5: {
        id: "ok5",
        speaker: "LAYARD",
        text: "E67. Quadrant 26.",
        next: "ok6",
      },
      ok6: {
        id: "ok6",
        speaker: "OKWU",
        text: "E67.",
        subtext: "Eine Augenbraue hebt sich, kaum merklich. Das Lächeln bleibt.",
        next: "ok7",
      },
      ok7: {
        id: "ok7",
        speaker: "OKWU",
        text: "Selten. Sehr selten sogar. — Nichts gegen Sie persönlich.",
        choices: [
          {
            text: "Was meinen Sie mit »selten«?",
            action: (api) => api.setFlag("okwuLayer2"),
            next: "ok_handoff",
          },
          {
            text: "Ich muss weiter.",
            next: "ok_bye",
          },
        ],
      },
      ok_handoff: {
        id: "ok_handoff",
        speaker: "OKWU",
        text: "Setzen Sie sich gedanklich kurz hin. Ich erklär's Ihnen.",
        end: true,
      },
      ok_bye: {
        id: "ok_bye",
        speaker: "OKWU",
        text: "Dann viel Erfolg da hinten. Rotes Licht, ganz am Ende, nicht zu übersehen.",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 10d. E71 — Dr. Okwu · Schicht 2
  //      E71 als Vorzeige-Quadrant + Nachbarn E68/E69/E70 + Bürokratie.
  //      Setzt okwuLayer3 beim Weiterreden.
  // ---------------------------------------------------------------
  okwu2: {
    id: "okwu2",
    start: "ok2a",
    lines: {
      ok2a: {
        id: "ok2a",
        speaker: "OKWU",
        text: "Also. E71 ist hier in der Gegend der Medizin-Quadrant. Vorzeige-Trakt, wenn Sie die richtigen Leute fragen. Die Geräte hier sind jünger als meine Praktikanten.",
        next: "ok2b",
      },
      ok2b: {
        id: "ok2b",
        speaker: "OKWU",
        text: "Drumherum: E68, E69, E70. Lauter Wohn- und Verwaltungs-Quadranten. Man sieht sich auf den Quadrantenfesten, man kennt sich.",
        next: "ok2c",
      },
      ok2c: {
        id: "ok2c",
        speaker: "OKWU",
        text: "E68 ist Logistik. Sehr fleißige Menschen. Die heben die Hand schon, bevor du die Frage gestellt hast.",
        subtext: "Sie sagt das mit der Wärme, die man für Lieblings-Kollegen reserviert.",
        next: "ok2d",
      },
      ok2d: {
        id: "ok2d",
        speaker: "OKWU",
        text: "E69 — Wohnen, viele Familien. Lärm im Treppenhaus, aber wenn jemand Geburtstag hat, klingelt es bei mir und es steht ein Kuchen vor der Tür.",
        next: "ok2e",
      },
      ok2e: {
        id: "ok2e",
        speaker: "OKWU",
        text: "E70 ist Verwaltung. Sehr nett, sehr langsam. Wie eine warme Dusche mit niedrigem Druck.",
        subtext: "Sie lacht leise, halb in sich hinein.",
        next: "ok2f",
      },
      ok2f: {
        id: "ok2f",
        speaker: "LAYARD",
        text: "Und die Bürokratie? Ist die hier anders?",
        next: "ok2g",
      },
      ok2g: {
        id: "ok2g",
        speaker: "OKWU",
        text: "Ach. Die ist überall. Aber wir gehen lockerer damit um. Papier ist geduldig, Terminal-Daten sind die Ruhe selbst — und ich bin um sieben zu Hause.",
        next: "ok2h",
      },
      ok2h: {
        id: "ok2h",
        speaker: "OKWU",
        text: "Ich unterschreibe, was ich unterschreiben muss, und der Rest darf bis morgen warten. Ist bisher noch keiner dran gestorben.",
        choices: [
          {
            text: "Und was sagen die anderen Quadranten über E67?",
            action: (api) => api.setFlag("okwuLayer3"),
            next: "ok2_handoff",
          },
          {
            text: "Ich muss weiter.",
            next: "ok2_bye",
          },
        ],
      },
      ok2_handoff: {
        id: "ok2_handoff",
        speaker: "OKWU",
        text: "Hahaaa. Okay. Dafür stelle ich kurz die Tasse ab.",
        subtext: "Sie schiebt die Brille wieder auf die Stirn, fast amüsiert.",
        end: true,
      },
      ok2_bye: {
        id: "ok2_bye",
        speaker: "OKWU",
        text: "Klar. Tür mit dem roten Licht, ganz hinten. Grüßen Sie Stegmann, falls er guckt.",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 10e. E71 — Dr. Okwu · Schicht 3
  //      Klatsch über die E67-Eigenbrödler, freundlich-witzig.
  //      Setzt okwuLayer4 beim Weiterfragen.
  // ---------------------------------------------------------------
  okwu3: {
    id: "okwu3",
    start: "ok3a",
    lines: {
      ok3a: {
        id: "ok3a",
        speaker: "OKWU",
        text: "E67. Also — wie soll ich's nett sagen. Ihr seid … speziell.",
        subtext: "Sie zieht die Brille runter, schaut über den Rand.",
        next: "ok3b",
      },
      ok3b: {
        id: "ok3b",
        speaker: "OKWU",
        text: "Bei den Quadrantenfesten halten wir immer einen Tisch frei für E67. Und jedes Jahr räumen wir ihn am Abend wieder leer ab. Kein Mensch.",
        next: "ok3c",
      },
      ok3c: {
        id: "ok3c",
        speaker: "OKWU",
        text: "In E69 erzählen sie sich, dass bei euch seit Jahren niemand neu eingezogen ist. Die Aufzüge nach E67 kommen angeblich immer leer zurück, egal um welche Uhrzeit. Wahr ist das wahrscheinlich nicht. Aber es hält sich.",
        next: "ok3d",
      },
      ok3d: {
        id: "ok3d",
        speaker: "OKWU",
        text: "Eine Kollegin aus E68 schwört, sie hat mal jemanden aus eurem Quadranten am Fenster winken sehen. Sie redet seitdem nicht mehr drüber.",
        subtext: "Augenzwinkern. Ein einziges. Und sehr präzise.",
        next: "ok3e",
      },
      ok3e: {
        id: "ok3e",
        speaker: "OKWU",
        text: "Es gibt Witze, Herr Worag. Wirklich gute, alte Witze. „Wie viele E67er braucht es, um eine Glühbirne zu wechseln?“ — Antwort: Keiner weiß es, es war noch nie jemand drin, der's berichten konnte.",
        next: "ok3f",
      },
      ok3f: {
        id: "ok3f",
        speaker: "OKWU",
        text: "Ihr seid die Eigenbrödler in der Gegend. Die, die sich komplett aus der Welt rausgenommen haben. Nichts Persönliches. Eher … folkloristisch.",
        choices: [
          {
            text: "Und was glauben Sie wirklich über E67?",
            action: (api) => api.setFlag("okwuLayer4"),
            next: "ok3_handoff",
          },
          {
            text: "Ich muss jetzt wirklich weiter.",
            next: "ok3_bye",
          },
        ],
      },
      ok3_handoff: {
        id: "ok3_handoff",
        speaker: "OKWU",
        text: "Hm. Gute Frage. Lassen Sie mich kurz nachdenken.",
        end: true,
      },
      ok3_bye: {
        id: "ok3_bye",
        speaker: "OKWU",
        text: "Geht klar. Und ehrlich — danke für den Plausch. Ist ein bisschen wie ein Vogel, der aus seinem Käfig in den Garten geflattert kommt. Das hat man nicht alle Tage.",
        subtext: "Sie sagt es ohne Spott. Eher belustigt-zärtlich.",
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // 10f. E71 — Dr. Okwu · Schicht 4
  //      Ihre eigene Sicht. Wird kurz ernst, bleibt warm.
  // ---------------------------------------------------------------
  okwu4: {
    id: "okwu4",
    start: "ok4a",
    lines: {
      ok4a: {
        id: "ok4a",
        speaker: "OKWU",
        text: "Ehrlich? Ich glaube nicht, dass mit euch was nicht stimmt. Ich glaube, ihr habt euch da drüben einfach … sehr gründlich eingerichtet. Mit allem drum und dran.",
        next: "ok4b",
      },
      ok4b: {
        id: "ok4b",
        speaker: "OKWU",
        text: "Manche Leute räumen ihre Wohnung jeden Sonntag auf. Manche Quadranten räumen sich selber weg. Das ist ein Unterschied von Grad, nicht von Art.",
        subtext: "Sie sagt's leise, ohne Schärfe.",
        next: "ok4c",
      },
      ok4c: {
        id: "ok4c",
        speaker: "OKWU",
        text: "Aber Sie sind ja heute hier. Sie stehen in meinem Korridor und unterhalten sich mit mir. Das ist mehr, als die meisten von euch je tun. Vielleicht ist das schon der Anfang von etwas.",
        next: "ok4d",
      },
      ok4d: {
        id: "ok4d",
        speaker: "LAYARD",
        text: "Vielleicht.",
        next: "ok4e",
      },
      ok4e: {
        id: "ok4e",
        speaker: "OKWU",
        text: "Wenn Sie zurückwollen — der Empfang weiß Bescheid, der trägt Sie nach. Wenn Sie nicht zurückwollen, auch gut. Aber dann sagen Sie's vorher jemandem. Spart Papier.",
        next: "ok4f",
      },
      ok4f: {
        id: "ok4f",
        speaker: "OKWU",
        text: "Und jetzt entschuldigen Sie mich. Frau Aldenhoff in 1538 wartet auf ihre Sprechstunde, und sie wartet ungern.",
        subtext: "Sie hebt das Klemmbrett in einer kleinen, freundlichen Geste.",
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
        next: "mr4burnA",
      },
      // Reaktion auf den abgeschalteten Knoten — nur, wenn Layard burn
      // ausgeführt hat. Owned/Dodged bekommt Mikael unterschiedlich
      // gespiegelt. Beide Linien führen wieder in den Standard-Verlauf.
      mr4burnA: {
        id: "mr4burnA",
        speaker: "MIKAEL",
        text: "Sie haben den Knoten weggeschossen. Das war nicht klug — aber es war ehrlicher als alles, was ich heute hier gemacht habe.",
        subtext: "Er sagt das nicht zu Layard. Eher: zu sich selbst.",
        requires: ["burnedAndOwned"],
        next: "mr4burnB",
      },
      mr4burnB: {
        id: "mr4burnB",
        speaker: "MIKAEL",
        text: "Sie haben ihn weggeschossen — und wissen nicht warum. Das ist das Schlimmste daran.",
        subtext: "Es ist kein Vorwurf. Eher eine Diagnose.",
        requires: ["burnedAndDodged"],
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
          { text: "Was willst du damit sagen?", next: "mrOpen1" },
          { text: "Lass mich in Ruhe damit.", next: "mrSystemic" },
          { text: "Keine Zeit." },
        ],
      },
      mrTalk: {
        id: "mrTalk",
        speaker: "MIRA",
        text: "Reden. Gut. — Worüber denn?",
        choices: [
          { text: "Über das, was du vorhin meintest.", next: "mrOpen1" },
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
      // Wiederbegegnungs-Variante der Offenheits-Kette (lokal, da
      // DialogOverlay nur innerhalb desselben Trees nach IDs sucht).
      mrOpen1: {
        id: "mrOpen1",
        speaker: "MIRA",
        text: "Frag dich mal, warum 104,6 deinen Schmerz lindert und nicht den Grund dafür wegnimmt. Ein gutes Mittel würde das Problem lösen — nicht dich an das Problem gewöhnen.",
        choices: [
          { text: "Sprich weiter.", next: "mrOpen2" },
          { text: "Das ist mir jetzt zu groß. Lass gut sein.", next: "mrOpenDefer" },
        ],
      },
      mrOpen2: {
        id: "mrOpen2",
        speaker: "MIRA",
        text: "Du drehst sie auf, weil du etwas spüren willst, was dir im eigenen Leben fehlt. Und während du hörst, sendest du selbst — leise, unbewusst. Genau das wollen sie.",
        choices: [
          { text: "Wer ist „sie“?", next: "mrOpen3" },
          { text: "Reicht. Ich muss weiter.", next: "mrOpenDefer" },
        ],
      },
      mrOpen3: {
        id: "mrOpen3",
        speaker: "MIRA",
        text: "Niemand mit Namen. Eine Verwaltung, die gelernt hat, dass ruhige Bürger billiger sind als zufriedene. Und die Antwort steht hier drauf.",
        next: "mrOpen4",
      },
      mrOpen4: {
        id: "mrOpen4",
        speaker: "SYSTEM",
        text: "[ Sie zieht ein gefaltetes Blatt aus der Innentasche und drückt es Layard in die Hand. Schnell. Geübt. ]",
        choices: [
          {
            text: "[ Annehmen ]",
            next: "mrOpen5",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
          {
            text: "[ Ablehnen ]",
            next: "mrOpenRefuse",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
        ],
      },
      mrOpen5: {
        id: "mrOpen5",
        speaker: "MIRA",
        text: "Lies es allein. Niemals im Terminal. Z.K.S. — Geh jetzt. Ich war nie hier.",
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
      mrOpenRefuse: {
        id: "mrOpenRefuse",
        speaker: "MIRA",
        text: "Schade. — Aber ich verstehe. Wenn du es dir anders überlegst: Ich bin oft hier oben.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraOpenness"),
          },
        ],
      },
      mrOpenDefer: {
        id: "mrOpenDefer",
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
        next: "ma2",
      },
      ma1b: {
        id: "ma1b",
        speaker: "MIRA",
        text: "Du hast es noch. Gut. — Und der Verantwortliche ist immer noch keiner. Auch gut.",
        requires: ["sawEmptyOffice"],
        next: "ma2",
      },
      // Mira nennt jetzt konkret den Knoten 5610. Sie tut das nur einmal:
      // sobald saw5610Door gesetzt ist, übergeht sie diese Zeilen.
      ma2: {
        id: "ma2",
        speaker: "MIRA",
        text: "Hör zu. Eine Sache noch. Auf 56 ist eine Tür. 5610. Steht „Technik“ dran. Ist sie aber nicht. Nicht nur.",
        hiddenWhen: ["saw5610Door"],
        next: "ma3",
      },
      ma3: {
        id: "ma3",
        speaker: "MIRA",
        text: "Hinter der Tür sitzt ein Knoten. Da läuft dein eigenes Schmerz-Radio durch, bevor es zu jemand anderem geht. 104,6 — du hörst sie nicht. Du bist sie. Gefiltert.",
        hiddenWhen: ["saw5610Door"],
        next: "ma4",
      },
      ma4: {
        id: "ma4",
        speaker: "MIRA",
        text: "Wenn du den Knoten findest, hörst du, woher die Sendung wirklich kommt — und wohin sie geht. Mehr sage ich nicht. Geh.",
        hiddenWhen: ["saw5610Door"],
        next: "maAck",
        end: true,
      },
      // Sobald die Tür schon entdeckt ist, bleibt die Begrüßung schlicht.
      maAck: {
        id: "maAck",
        speaker: "MIRA",
        text: "Du hast die Tür gesehen. Gut. Lass dich nicht erwischen.",
        requires: ["saw5610Door"],
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
    onEnd: (api) => {
      api.setFlag("philippeProbeNote1");
      maybeGiveWartungsnotiz5610(api);
    },
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
    onEnd: (api) => {
      api.setFlag("philippeProbeNote2");
      maybeGiveWartungsnotiz5610(api);
    },
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
    onEnd: (api) => {
      api.setFlag("philippeProbeNote3");
      maybeGiveWartungsnotiz5610(api);
    },
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
    onEnd: (api) => {
      api.setFlag("philippeProbeNote4");
      maybeGiveWartungsnotiz5610(api);
    },
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
    onEnd: (api) => {
      api.setFlag("philippeProbeNote5");
      maybeGiveWartungsnotiz5610(api);
    },
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
        subtext: "Sie sagt das beiläufig, aber sie wartet darauf, ob er zuhört.",
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
        text: "Privat. Auf meinem Rechner. Sie hat einen Namen, aber den behalte ich für mich. Wer mir lange genug zuhört, kommt vielleicht selbst drauf.",
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
        text: "Allein ist relativ. — Fernmeldetechniker, Stadtwerke, sechsundzwanzig Jahre. Vorruhestand seit der Sektor-Reform. Seitdem mache ich hier den Hausmeister. Halbtags, auf dem Papier. Praktisch immer, wenn irgendwo was knirscht.",
        next: "b6",
      },
      b6: {
        id: "b6",
        speaker: "SYSTEM",
        text: "[ Auf dem Sessel mit der Decke bewegt sich etwas. Eine Pfote streckt sich langsam aus den Falten. An der Garderobe hängt ein schwerer Schlüsselbund mit einem Holzanhänger: »HM 2/E67«. ]",
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
        next: "bf5b",
      },
      bf5b: {
        id: "bf5b",
        speaker: "BODO",
        text: "Wer da am Knopf sitzt, ist nicht die Stadt. Das war sie nie. Wer es ist — keine Ahnung. Aber jemand zahlt ihn.",
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
        next: "bc9b",
      },
      bc9b: {
        id: "bc9b",
        speaker: "LAYARD",
        text: "Schacht 4 — funktioniert der Aufzug von hier überhaupt runter?",
        next: "bc9c",
      },
      bc9c: {
        id: "bc9c",
        speaker: "BODO",
        text: "Den Aufzug brauche ich nicht. Als Hausmeister kenne ich hier JEDEN Gang. Wartungsschächte, Versorgungstreppen, ein paar Türen, die offiziell gar nicht existieren. Ich bin schneller unten als das Display piept.",
        subtext: "Er sagt es ohne Stolz. Es ist einfach so.",
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

  // ─────────────────────────────────────────────────────────────
  // Insa-Rückruf nach burn am Knoten 5610.
  // Wird automatisch ausgelöst, wenn Layard nach der Burn-Sequenz
  // wieder in seine Wohnung oder den Korridor 56 kommt.
  // Sie weiß, dass etwas passiert ist. Sie macht weiter — und gibt
  // den Code trotzdem heraus. Das Spiel läuft weiter.
  // ─────────────────────────────────────────────────────────────
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

  // ---------------------------------------------------------------
  // Tjark — Smalltalk im Gemeinschaftsraum E67 (DSA-Tafelrunde)
  // ---------------------------------------------------------------
  tjarkSmalltalk: {
    id: "tjarkSmalltalk",
    start: "t0",
    onEnd: (api) => {
      api.setFlag("tjarkSmalltalkDone");
    },
    lines: {
      // Erstkontakt — vor der Charaktererschaffung
      t0: {
        id: "t0",
        speaker: "TJARK",
        text: "Du musst Layard sein. Setz dich. Ich bin Tjark — ich leite das hier.",
        hiddenWhen: ["dsaCharacterRolled"],
        next: "t1",
      },
      t1: {
        id: "t1",
        speaker: "TJARK",
        text: "Das hier ist meine kleine Runde. Yelva spielt eine Elfe, Brem einen Streuner. Wir brauchen wirklich noch einen Vierten — am liebsten einen Krieger, ehrlich gesagt. Aber bring her, was du willst.",
        hiddenWhen: ["dsaCharacterRolled"],
        next: "tHub",
      },
      // Wiedereintritt — Charakter steht schon
      tBack: {
        id: "tBack",
        speaker: "TJARK",
        text: "Schön, dass du wieder da bist, Layard. Wir warten nur noch auf dich. Soll ich nochmal was erklären, oder sollen wir loslegen?",
        requires: ["dsaCharacterRolled"],
        next: "tHub",
      },
      // Hub mit allen Smalltalk-Optionen
      tHub: {
        id: "tHub",
        speaker: "TJARK",
        text: "Was willst du wissen?",
        choices: [
          { text: "Was ist das hier eigentlich?", next: "tWhat", hiddenWhen: ["askedTjarkAboutDsa"] },
          { text: "Wer seid ihr drei?", next: "tWho", hiddenWhen: ["askedTjarkAboutGroup"] },
          { text: "Wie funktioniert das?", next: "tRules", hiddenWhen: ["askedTjarkAboutRules"] },
          { text: "Was ist der Plan heute?", next: "tPlan", hiddenWhen: ["askedTjarkAboutPlan"] },
          { text: "Lass uns spielen.", next: "tPlay" },
        ],
      },
      tWhat: {
        id: "tWhat",
        speaker: "TJARK",
        text: "„Das Schwarze Auge“. Zweite Edition. Schmidt-Spiele, vor zwei Jahren rausgekommen. Wir spielen in Aventurien — das ist ein Kontinent, kein Wohnkomplex. Götter, Magie, ein Haufen Würfel.",
        next: "tWhat2",
      },
      tWhat2: {
        id: "tWhat2",
        speaker: "TJARK",
        text: "Ich erzähle, ihr handelt. Wenn etwas schiefgehen kann, würfelt ihr. Wenn etwas klappt, war es entweder gut geplant oder ihr hattet Glück. Mehr ist es eigentlich nicht.",
        choices: [
          { text: "Verstanden.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutDsa") },
        ],
      },
      tWho: {
        id: "tWho",
        speaker: "TJARK",
        text: "Yelva, links von dir, spielt seit ich das hier mache. Genau, präzise, manchmal eine Spur zu nüchtern. Ihre Elfe heißt Niamhuin und schießt besser als jeder Mensch, den ich kenne.",
        next: "tWho2",
      },
      tWho2: {
        id: "tWho2",
        speaker: "TJARK",
        text: "Brem ist neu. Drei Sitzungen jetzt. Spielt einen Streuner, weil er „mal jemanden ohne Regeln“ wollte. Ich versuche ihm beizubringen, dass auch Streuner Regeln haben.",
        next: "tWho3",
      },
      tWho3: {
        id: "tWho3",
        speaker: "TJARK",
        text: "Und ich bin der Spielleiter. Ich werfe Steine, Räuber und gelegentlich einen Drachen. Mein Job ist, dass ihr eine gute Geschichte erlebt. Nicht, dass ihr alle überlebt.",
        choices: [
          { text: "Beruhigend.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutGroup") },
        ],
      },
      tRules: {
        id: "tRules",
        speaker: "TJARK",
        text: "Sieben Eigenschaften: Mut, Klugheit, Charisma, Fingerfertigkeit, Gewandtheit, Intuition, Körperkraft. Du würfelst pro Eigenschaft 1W6 plus 7. Macht Werte zwischen acht und dreizehn.",
        next: "tRules2",
      },
      tRules2: {
        id: "tRules2",
        speaker: "TJARK",
        text: "Danach suchst du dir eine Klasse, deren Mindestwerte du erreichst. Krieger, Streuner, Magier, Elf, Zwerg, Gaukler, Thorwaler, Druide. Wenn nichts passt, wirfst du nochmal. Und nochmal, wenn du magst.",
        choices: [
          { text: "Klingt machbar.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutRules") },
        ],
      },
      tPlan: {
        id: "tPlan",
        speaker: "TJARK",
        text: "Heute: Anreise nach Phexcaer durch den Reichsforst. Unterwegs Übernachtung in einem Wirtshaus — ein Magister sucht dort Leute. Und dann eine alte Tempelruine. Hesindes Auge.",
        next: "tPlan2",
      },
      tPlan2: {
        id: "tPlan2",
        speaker: "TJARK",
        text: "Drei Akte, ein Abend. Wenn ihr euch nicht zu blöd anstellt, sind wir gegen Mitternacht durch. Wenn doch, eben morgen weiter.",
        choices: [
          { text: "Gut.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutPlan") },
        ],
      },
      tPlay: {
        id: "tPlay",
        speaker: "TJARK",
        text: "Dann wirf erstmal deine Eigenschaften. Setz dich auf den Stuhl, dann legen wir los.",
        requires: [],
        hiddenWhen: ["dsaCharacterRolled"],
        end: true,
      },
      tPlayGo: {
        id: "tPlayGo",
        speaker: "TJARK",
        text: "Gut. Dann: Vorhang auf.",
        requires: ["dsaCharacterRolled"],
        end: true,
      },
    },
  },

  // ---------------------------------------------------------------
  // Lobby-Schleuse: drei Fehlversuche → Insa schaltet sich selbst ein.
  // ---------------------------------------------------------------
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

  // ───────────────────────────────────────────────────────────
  // Kantine 3602 — Vollmachts-Rätsel (Akt I, Erweiterung)
  // ───────────────────────────────────────────────────────────

  // Philippe bittet Layard, B3 mitzubringen, und gibt eine Vollmacht.
  philippeAsksFavor: {
    id: "philippeAsksFavor",
    start: "pf1",
    lines: {
      pf1: {
        id: "pf1",
        speaker: "PHILIPPE",
        text: "Worag — Sie waren oben? Etage 3? Dann sind Sie sicher auch durch den Korridor 36 gekommen.",
        next: "pf2",
      },
      pf2: {
        id: "pf2",
        speaker: "LAYARD",
        text: "Ja. Tür 3601 — leer. 3602 hat Geruch. Was war das?",
        next: "pf3",
      },
      pf3: {
        id: "pf3",
        speaker: "PHILIPPE",
        text: "Die Kantine. — Hören Sie. Ich frage Sie nicht gern, aber ich frage Sie.",
        subtext:
          "Er sieht eine Sekunde länger zur Wand 2615 als zu Layard.",
        next: "pf4",
      },
      pf4: {
        id: "pf4",
        speaker: "PHILIPPE",
        text: "Würden Sie meine B3 mitnehmen, wenn Sie das nächste Mal runter müssen? Ich bin … nicht mehr ganz sicher, ob ich heute durch die Kantine komme.",
        next: "pf5",
      },
      pf5: {
        id: "pf5",
        speaker: "PHILIPPE",
        text: "Hier — meine Vollmacht. Vier-Drei-Eins-Sieben. Steht alles drauf. Geben Sie das einfach Frau Kowalk oder dem jüngeren Kollegen.",
        choices: [
          {
            text: "Klar. Ich nehme sie mit.",
            next: "pfAccept",
          },
          {
            text: "Ich versuche es. Versprechen tue ich nichts.",
            next: "pfMaybe",
          },
          {
            text: "Lassen Sie. Heute nicht, Philippe.",
            next: "pfDecline",
          },
        ],
      },
      pfAccept: {
        id: "pfAccept",
        speaker: "PHILIPPE",
        text: "Danke. Wirklich. Ich revanchiere mich, wenn Sie zurück sind.",
        choices: [
          {
            text: "[ Vollmacht einstecken ]",
            action: (api) => {
              api.setFlag("gotB3Authorization");
              api.addItem({
                id: "b3Authorization",
                name: "Vollmacht 4317 — B3-Ausgabe",
                description:
                  "Pinkes Carbon-Formular auf das Layards Nachbar Philippe Marteau vier Ziffern und seine Unterschrift gesetzt hat: 4317. Daneben das Trockensiegel »BEWOHNERVERTRETUNG E67 / SCHICHT A«. Berechtigt zur einmaligen Abholung einer B3-Ration in der Kantine 3602.",
              });
            },
          },
        ],
      },
      pfMaybe: {
        id: "pfMaybe",
        speaker: "PHILIPPE",
        text: "Versuchen reicht. Mehr verlange ich nicht.",
        choices: [
          {
            text: "[ Vollmacht einstecken ]",
            action: (api) => {
              api.setFlag("gotB3Authorization");
              api.addItem({
                id: "b3Authorization",
                name: "Vollmacht 4317 — B3-Ausgabe",
                description:
                  "Pinkes Carbon-Formular, Philippe Marteaus Hand, Code 4317. Trockensiegel »BEWOHNERVERTRETUNG E67 / SCHICHT A«. Einmalige B3-Ausgabe.",
              });
            },
          },
        ],
      },
      pfDecline: {
        id: "pfDecline",
        speaker: "PHILIPPE",
        text: "… verstanden.",
        subtext:
          "Er nickt nicht. Er steckt die Vollmacht zurück, sehr sorgfältig.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("refusedB3Favor"),
          },
        ],
      },
    },
  },

  // Philippe bekommt seine B3.
  philippeReceivesB3: {
    id: "philippeReceivesB3",
    start: "pr1",
    lines: {
      pr1: {
        id: "pr1",
        speaker: "PHILIPPE",
        text: "Sie haben es wirklich getan. — Setzen Sie sich kurz, Worag.",
        next: "pr2",
      },
      pr2: {
        id: "pr2",
        speaker: "LAYARD",
        text: "Brust hat erst nicht. Kowalk dann doch.",
        next: "pr3",
      },
      pr3: {
        id: "pr3",
        speaker: "PHILIPPE",
        text: "Frau Kowalk, ja. Sie kennt mich noch von früher. — Ich habe etwas für Sie. Behalten Sie es. Sehen Sie es sich an, wenn niemand zuschaut.",
        next: "pr4",
      },
      pr4: {
        id: "pr4",
        speaker: "SYSTEM",
        text: "[ Philippe schiebt einen vierfach gefalteten Bogen über den Tisch. Kopfbalken: rotes Kreuz. Im Briefkopf: »PROTOKOLL — KORRIDOR 26 / WOHNUNG 2615 / ÜBERFÜHRUNG«. ]",
        next: "pr5",
      },
      pr5: {
        id: "pr5",
        speaker: "LAYARD",
        text: "Wo haben Sie den her?",
        next: "pr6",
      },
      pr6: {
        id: "pr6",
        speaker: "PHILIPPE",
        text: "Den Sanitätern fällt manchmal Papier aus der Tasche. Ich hebe es dann auf. Reine Ordnung.",
        subtext: "Er meint kein Wort davon.",
        next: "pr7",
      },
      pr7: {
        id: "pr7",
        speaker: "PHILIPPE",
        text: "Da steht nicht alles drauf, was passiert ist. Aber genug, dass jemand wie Sie weiß, dass nicht alles draufsteht.",
        choices: [
          {
            text: "[ Bericht annehmen ]",
            action: (api) => {
              api.setFlag("gotParamedicsReport");
              api.addItem({
                id: "paramedicsReport",
                name: "Sanitäter-Bericht 2615",
                description:
                  "Vierfach gefaltetes Formblatt der Sanitäter, Stempel »ÜBERFÜHRUNG STILL — RESONANZ«. Patient: keine Namen, nur eine Bewohnernummer. Befund: »wach, nicht reaktiv«. Maßnahme: »Kategorie B / Typ 3«. Vom Zielort steht nichts.",
              });
            },
          },
        ],
      },
    },
  },

  // ── Kowalk-Dialogbaum ─────────────────────────────────────
  cafeteriaKowalk: {
    id: "cafeteriaKowalk",
    start: "k0",
    lines: {
      k0: {
        id: "k0",
        speaker: "KOWALK",
        text: "Worag, E67, 2611. — Steht in der Liste. Was brauchen Sie?",
        subtext:
          "Sie hat die Liste nicht angesehen. Sie kennt die Leute auf E67.",
        choices: [
          {
            text: "Ich habe eine Vollmacht. Vier-Drei-Eins-Sieben.",
            next: "kAuth1",
            requires: ["gotB3Authorization"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            text: "Ich wollte mich nur umsehen.",
            next: "kSmall1",
          },
          {
            text: "Sie streiten ständig über die Hygieneordnung.",
            next: "kHyg1",
          },
          {
            text: "Ihre Tochter — Sie haben sie vorhin erwähnt.",
            next: "kDaughter1",
            requires: ["metPhilippe"],
            hiddenWhen: ["kowalkToldHerDaughter"],
          },
          {
            text: "[ Beenden ]",
            next: "kBye",
          },
        ],
      },
      kSmall1: {
        id: "kSmall1",
        speaker: "KOWALK",
        text: "Umsehen ist nicht verboten. Mitnehmen schon.",
        next: "k0",
      },
      kHyg1: {
        id: "kHyg1",
        speaker: "KOWALK",
        text: "Brust ist neu. Brust glaubt, was im neuesten Aushang steht. Ich halte mich an das, was funktioniert. Manchmal überschneidet sich das. Manchmal nicht.",
        next: "kHyg2",
      },
      kHyg2: {
        id: "kHyg2",
        speaker: "KOWALK",
        text: "Wir streiten nicht über Hygiene, Worag. Wir streiten darüber, wer nachher schuld ist.",
        next: "k0",
      },
      kDaughter1: {
        id: "kDaughter1",
        speaker: "KOWALK",
        text: "Tilla. Ja. War zwei Jahre bei Resonanz-Hygiene. Ist letztes Frühjahr ohne Erklärung gegangen.",
        next: "kDaughter2",
      },
      kDaughter2: {
        id: "kDaughter2",
        speaker: "KOWALK",
        text: "Sie isst seitdem keine B2. Nur noch B3. Sagt, sie braucht was, das schmeckt. Klingt blöd, ich weiß.",
        next: "kDaughter3",
      },
      kDaughter3: {
        id: "kDaughter3",
        speaker: "KOWALK",
        text: "Vergessen Sie das wieder, ja? Ich rede sonst nicht über sowas.",
        choices: [
          {
            text: "Verstanden.",
            action: (api) => api.setFlag("kowalkToldHerDaughter"),
            next: "k0",
          },
        ],
      },
      // Vollmacht-Pfad ──────────────────────────────────────
      kAuth1: {
        id: "kAuth1",
        speaker: "KOWALK",
        text: "4317. Marteau, Philippe. — Brust, was sagst du?",
        next: "kAuth2",
      },
      kAuth2: {
        id: "kAuth2",
        speaker: "BRUST",
        text: "Vollmacht 4317 ist von Schicht A gegengezeichnet. Heute ist Schicht B. Ich kann das nicht freigeben.",
        next: "kAuth3",
      },
      kAuth3: {
        id: "kAuth3",
        speaker: "KOWALK",
        text: "Brust.",
        next: "kAuth4",
      },
      kAuth4: {
        id: "kAuth4",
        speaker: "BRUST",
        text: "Es steht im Aushang.",
        next: "kAuth5",
      },
      kAuth5: {
        id: "kAuth5",
        speaker: "KOWALK",
        text: "Welcher.",
        subtext: "Es ist keine Frage.",
        next: "kAuth6",
      },
      kAuth6: {
        id: "kAuth6",
        speaker: "KOWALK",
        text: "Worag. Ich brauche etwas, das ich Brust hinhalten kann. Sonst gibt’s das nicht.",
        choices: [
          {
            // Lösungsweg A — Vertrauen via Ausweis + Philippe-Hinweis
            text: "[ Bewohner-Ausweis zeigen ] Philippe sieht seit gestern schlecht aus. Ich gehe für ihn.",
            requires: ["metPhilippe"],
            hiddenWhen: ["brustOutruled"],
            next: "kSideA1",
          },
          {
            // Lösungsweg B — die alte Hygieneordnung
            text: "[ E67-Handbuch zeigen ] Hier — Hygieneordnung 1991, wörtlich. Aushang sieben Punkt eins.",
            requires: ["readHandbook"],
            next: "kSideB1",
          },
          {
            text: "Vergessen Sie’s. Komme später wieder.",
            next: "kAuthLater",
          },
        ],
      },
      // Lösungsweg A — Kowalk handelt unter der Theke
      kSideA1: {
        id: "kSideA1",
        speaker: "KOWALK",
        text: "Marteau. — Marteau wohnt neben der Klopfwand. Ich weiß.",
        next: "kSideA2",
      },
      kSideA2: {
        id: "kSideA2",
        speaker: "KOWALK",
        text: "Brust, mach mir die Liste fertig für E70. Ich übergebe Worag noch einen Restposten aus dem Vortag.",
        next: "kSideA3",
      },
      kSideA3: {
        id: "kSideA3",
        speaker: "BRUST",
        text: "Restposten sind im Inventur—",
        next: "kSideA4",
      },
      kSideA4: {
        id: "kSideA4",
        speaker: "KOWALK",
        text: "E70-Liste. Brust.",
        subtext: "Brust geht. Sehr gerade.",
        next: "kSideA5",
      },
      kSideA5: {
        id: "kSideA5",
        speaker: "KOWALK",
        text: "Hier. Eine Dose. Sie haben sie nie gesehen, und ich habe sie nie gegeben. Bringen Sie die hoch und öffnen Sie sie nicht im Korridor.",
        choices: [
          {
            text: "[ Dose annehmen ]",
            action: (api) => {
              api.setFlag("kowalkSidedWithLayard");
              api.setFlag("gotB3Ration");
              api.addItem({
                id: "b3Ration",
                name: "B3-Ration",
                description:
                  "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Auf der Bodenseite mit Bleistift gekritzelt: »Marteau«. Frau Kowalk hat sie unter der Theke hervorgeholt, ohne dass Brust es sah.",
              });
            },
            next: "kSideA6",
          },
        ],
      },
      kSideA6: {
        id: "kSideA6",
        speaker: "KOWALK",
        text: "Und Worag — wenn Sie Marteau sehen: ich frage nicht, was er hat. Aber sagen Sie ihm, er soll runterkommen, wenn’s wieder geht. Tilla hat auch immer gesagt, sie kann nicht. Bis sie nicht mehr konnte.",
        choices: [{ text: "[ Beenden ]", next: "kBye" }],
      },
      // Lösungsweg B — Brust kapituliert vor seiner eigenen Logik
      kSideB1: {
        id: "kSideB1",
        speaker: "BRUST",
        text: "Das … das ist die alte Ausgabe. Die ist offiziell …",
        next: "kSideB2",
      },
      kSideB2: {
        id: "kSideB2",
        speaker: "BRUST",
        text: "… nicht widerrufen. Korrekt. Punkt sieben Eins ist nicht widerrufen. Nur überlagert.",
        next: "kSideB3",
      },
      kSideB3: {
        id: "kSideB3",
        speaker: "KOWALK",
        text: "Überlagert ist nicht widerrufen, Brust.",
        next: "kSideB4",
      },
      kSideB4: {
        id: "kSideB4",
        speaker: "BRUST",
        text: "Bei gegengezeichneten Vollmachten greift im Zweifel der jeweils ältere Aushang, sofern er nicht ausdrücklich—",
        next: "kSideB5",
      },
      kSideB5: {
        id: "kSideB5",
        speaker: "KOWALK",
        text: "— widerrufen wurde. Genau. — Brust, geben Sie ihm die B3.",
        next: "kSideB6",
      },
      kSideB6: {
        id: "kSideB6",
        speaker: "BRUST",
        text: "Bitte … bitte nehmen Sie die Ration. Quittung am Pneumatikrohr links abgeben. Danke.",
        subtext: "Er sieht Layard nicht an.",
        choices: [
          {
            text: "[ Dose annehmen ]",
            action: (api) => {
              api.setFlag("brustOutruled");
              api.setFlag("gotB3Ration");
              api.addItem({
                id: "b3Ration",
                name: "B3-Ration",
                description:
                  "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Brust hat sie freigegeben, weil sein eigenes Regelwerk ihn dazu zwang. Er hat dabei nicht aufgeschaut.",
              });
            },
            next: "kBye",
          },
        ],
      },
      kAuthLater: {
        id: "kAuthLater",
        speaker: "KOWALK",
        text: "Tun Sie das. Aber heute Abend ist Schichtwechsel.",
        next: "k0",
      },
      kBye: {
        id: "kBye",
        speaker: "KOWALK",
        text: "Bis dann, Worag.",
        end: true,
      },
    },
  },

  // ── Brust-Dialogbaum ──────────────────────────────────────
  cafeteriaBrust: {
    id: "cafeteriaBrust",
    start: "b0",
    lines: {
      b0: {
        id: "b0",
        speaker: "BRUST",
        text: "Bewohner Worag. Identität gegengezeichnet. Anliegen?",
        subtext: "Er notiert die Frage, bevor sie beantwortet ist.",
        choices: [
          {
            text: "Ich habe eine Vollmacht. 4317.",
            next: "bAuth1",
            requires: ["gotB3Authorization"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            text: "Welcher Aushang gilt jetzt eigentlich?",
            next: "bHyg1",
          },
          {
            text: "Wofür ist das Pneumatikrohr?",
            next: "bTube1",
          },
          {
            text: "[ Beenden ]",
            next: "bBye",
          },
        ],
      },
      bAuth1: {
        id: "bAuth1",
        speaker: "BRUST",
        text: "4317 — Marteau. Schicht A gegengezeichnet. Heute Schicht B. Aushang vier Punkt zwei.",
        next: "bAuth2",
      },
      bAuth2: {
        id: "bAuth2",
        speaker: "BRUST",
        text: "Ich kann das nicht freigeben. Bitte mit Frau Kowalk weiterreden.",
        choices: [
          {
            text: "Verstanden.",
            next: "b0",
          },
        ],
      },
      bHyg1: {
        id: "bHyg1",
        speaker: "BRUST",
        text: "Aushang vier Punkt zwei vom 14. März 1996. Eindeutig. Frau Kowalk verweist auf Aushang sieben Punkt eins, von 91. Der ist überschrieben.",
        next: "bHyg2",
      },
      bHyg2: {
        id: "bHyg2",
        speaker: "BRUST",
        text: "Bei mehrfacher Überlagerung gilt der jüngere, sofern der ältere ausdrücklich widerrufen wurde. Das Wort »widerrufen« kommt im neuen Aushang nicht vor. Das ist … unschön.",
        subtext: "Das ist das erste Mal, dass er die Stimme leiser macht.",
        next: "b0",
      },
      bTube1: {
        id: "bTube1",
        speaker: "BRUST",
        text: "Pneumatik nach E70. Quittungen, Schichtprotokolle, Anträge. Eingehende Sendungen sehr selten.",
        next: "bTube2",
      },
      bTube2: {
        id: "bTube2",
        speaker: "BRUST",
        text: "Heute morgen drei Sendungen ausgegangen. Eingehend: keine. Das Licht oben blinkt seit gestern. Frau Kowalk sagt, das blinkt manchmal einfach.",
        next: "b0",
      },
      bBye: {
        id: "bBye",
        speaker: "BRUST",
        text: "Auf Wiedersehen, Bewohner Worag.",
        end: true,
      },
    },
  },
};
