import type { DialogTree } from "./types";

export const dialogs: Record<string, DialogTree> = {
  philippeIntro: {
    id: "philippeIntro",
    start: "p1",
    lines: {
      p1: {
        id: "p1",
        speaker: "PHILIPPE",
        text: "Worag. Sie müssen sofort kommen. 2613.",
        subtext: "Angst. Echte Angst. Er hat das nicht im Schauspielkurs gelernt.",
        next: "p2",
      },
      p2: {
        id: "p2",
        speaker: "LAYARD",
        text: "Was ist passiert?",
        next: "p3",
      },
      p3: {
        id: "p3",
        speaker: "PHILIPPE",
        text: "Klopfen. Seit … ich weiß nicht, drei Stunden. Erst rhythmisch. Jetzt nur noch — nicht mehr rhythmisch.",
        subtext: "Er hat zugehört. Lange. Ohne etwas zu tun. Schuld.",
        next: "p4",
      },
      p4: {
        id: "p4",
        speaker: "PHILIPPE",
        text: "Ich habe versucht zu klingeln. Niemand öffnet. Sie müssen die Leitstelle anrufen. Mein Telefon. Da drüben.",
        next: "p5",
      },
      p5: {
        id: "p5",
        speaker: "SYSTEM",
        text: "[ Philippes alter Beigetelefon-Apparat steht auf dem Beistelltisch. Wähle 001. ]",
        end: true,
      },
    },
  },

  insa1: {
    id: "insa1",
    start: "i1",
    lines: {
      i1: {
        id: "i1",
        speaker: "INSA",
        text: "Leitstelle E67. Bauerfeind.",
        subtext: "Erschöpfung. Routine. Etwas darunter.",
        next: "i2",
      },
      i2: {
        id: "i2",
        speaker: "LAYARD",
        text: "Worag, 2611. Es gibt einen Vorfall in 2613. Mein Nachbar Philippe sagt — Klopfen, das nicht aufhört.",
        next: "i3",
      },
      i3: {
        id: "i3",
        speaker: "INSA",
        text: "Verstanden. Ich habe das Klopfen seit gestern Nacht hier auf dem Bildschirm. Sanitäter sind unterwegs. Bitte bleiben Sie vor Ort.",
        next: "i4",
      },
      i4: {
        id: "i4",
        speaker: "INSA",
        text: "Sie nehmen das Einsatzprotokoll von den Sanitätern entgegen. Es ist verschlüsselt. Sie tragen es zur Sektor-Tür E67/E71. Ist das verstanden?",
        subtext: "Sie ist froh, dass jemand antwortet. Wirklich froh.",
        next: "i5",
      },
      i5: {
        id: "i5",
        speaker: "LAYARD",
        text: "Verstanden.",
        next: "i6",
      },
      i6: {
        id: "i6",
        speaker: "SYSTEM",
        text: "[ Hörer eingehängt. Die Sanitäter klopfen bereits an Tür 2613. ]",
        end: true,
      },
    },
  },

  paramedic: {
    id: "paramedic",
    start: "s1",
    lines: {
      s1: {
        id: "s1",
        speaker: "SANITÄTER",
        text: "Bewohner Worag? Hier. Einsatzprotokoll, verschlüsselt. Ziel: Sektor E71, Zimmer 1534.",
        subtext: "Routine. Kein Mitgefühl. Tausend solche Einsätze.",
        next: "s2",
      },
      s2: {
        id: "s2",
        speaker: "LAYARD",
        text: "Was hat er?",
        next: "s3",
      },
      s3: {
        id: "s3",
        speaker: "SANITÄTER",
        text: "Resonanz-Überlastung. Stand zu lange auf einer Frequenz. Und sein Herz — wir wissen es nicht. Wegen Krankheiten und …",
        subtext: "Er beendet diesen Satz nie. Niemand beendet ihn.",
        next: "s4",
      },
      s4: {
        id: "s4",
        speaker: "SANITÄTER",
        text: "Gehen Sie. Sektor-Tür. Code haben Sie hoffentlich.",
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
        speaker: "INSA",
        text: "Bauerfeind. Worag, schon wieder?",
        subtext: "Sie wartet auf etwas. Nicht auf den Feierabend.",
        next: "x2",
      },
      x2: {
        id: "x2",
        speaker: "LAYARD",
        text: "Die Sektor-Tür. Error 4567. Ich brauche einen Code.",
        next: "x3",
      },
      x3: {
        id: "x3",
        speaker: "INSA",
        text: "Wartungsarbeiten am Gateway. Ich sehe es hier. Sie haben vorhin selbst eine Störungsmeldung eingereicht — das war korrekt, Herr Worag. Die meisten Bewohner ignorieren sowas.",
        next: "x4",
      },
      x4: {
        id: "x4",
        speaker: "LAYARD",
        text: "Danke. Und … der Code für die Tür?",
        next: "x5",
      },
      x5: {
        id: "x5",
        speaker: "INSA",
        text: "Den darf ich nicht direkt herausgeben. Aber er steht in der Mail, die ich Ihnen gerade ins Terminal lege. Sie wissen schon — das Datum.",
        subtext: "Sie hätte ihn sagen können. Sie wollte nicht.",
        next: "x6",
        choices: [
          {
            text: "Pause … [Schmerz-Radio aktiv lassen]",
            requiresRadio: true,
            next: "x7radio",
          },
          {
            text: "Verstanden. Auf Wiederhören.",
            next: "x8",
          },
        ],
      },
      x7radio: {
        id: "x7radio",
        speaker: "INSA",
        text: "[Pause] … Herr Worag. Haben Sie eigentlich schon mal E67 verlassen?",
        subtext: "Sie fragt das nicht aus Höflichkeit.",
        next: "x7b",
      },
      x7b: {
        id: "x7b",
        speaker: "LAYARD",
        text: "… Nein.",
        next: "x7c",
      },
      x7c: {
        id: "x7c",
        speaker: "INSA",
        text: "Heute könnten Sie. Auf Wiederhören.",
        next: "x8",
      },
      x8: {
        id: "x8",
        speaker: "SYSTEM",
        text: "[ Im Terminal liegt jetzt eine E-Mail. Datum: 06.11.1997. Code-Format: ohne Punkte. ]",
        end: true,
      },
    },
  },
};