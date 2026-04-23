import type { DialogTree } from "./types";

export const dialogs: Record<string, DialogTree> = {
  // ---------------------------------------------------------------
  // 1. Philippe at Layard's door — first meeting
  // ---------------------------------------------------------------
  philippeAtDoor: {
    id: "philippeAtDoor",
    start: "p1",
    onEnd: (api) => {
      api.goTo("apt2613");
    },
    lines: {
      p1: {
        id: "p1",
        speaker: "SYSTEM",
        text: "[ Layard öffnet die Tür. Im Korridor steht ein Mann Anfang 40. Scheu. Murmelt verhalten. Sein Gesicht: besorgt. ]",
        next: "p2",
      },
      p2: {
        id: "p2",
        speaker: "PHILIPPE",
        text: "Hallo. Ich bin Philippe. Ich … habe ein Problem. Ich weiß nicht, was ich tun soll.",
        subtext: "Echte Angst. Er hat das nicht im Schauspielkurs gelernt.",
        next: "p3",
      },
      p3: {
        id: "p3",
        speaker: "LAYARD",
        text: "Was für ein Problem?",
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
        subtext: "Den Satz beendet sie nicht. Niemand beendet ihn.",
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
  stegmann: {
    id: "stegmann",
    start: "st1",
    lines: {
      st1: {
        id: "st1",
        speaker: "SYSTEM",
        text: "[ Layard versucht, sich am Terminal mit dem ZENTRAL.NETZ zu verbinden. ROUTER567.ZENTRAL.NETZ → ERROR 4567. Er greift wieder zum Hörer und wählt die 001. ]",
        next: "st2",
      },
      st2: {
        id: "st2",
        speaker: "INSA",
        text: "Bauerfeind. — Worag, schon wieder?",
        next: "st3",
      },
      st3: {
        id: "st3",
        speaker: "LAYARD",
        text: "Ich kann mich nicht mit dem ZENTRAL.NETZ verbinden. Error Code 4567. Ich muss aber meinen Ausgang melden.",
        next: "st4",
      },
      st4: {
        id: "st4",
        speaker: "INSA",
        text: "Ich verstehe. Ich stelle Sie durch zum Zentralnetz-Verantwortlichen.",
        subtext: "Sie merkt nicht an, dass das ungewöhnlich ist. Es ist es nicht.",
        next: "st5",
      },
      st5: {
        id: "st5",
        speaker: "SYSTEM",
        text: "[ Wartetonschleife. Acht Sekunden. Ein Knacken. Eine Männerstimme. ]",
        next: "st6",
      },
      st6: {
        id: "st6",
        speaker: "SYSTEM",
        text: "Hier ist die technische Unterstützung des Zentralnetzes, Stegmann am Apparat. Ihr Anliegen?",
        next: "st7",
      },
      st7: {
        id: "st7",
        speaker: "LAYARD",
        text: "Ich muss mich mit dem Zentralnetz verbinden, um einen Ausgang zu melden. Verbindung gestört. Error 4567.",
        next: "st8",
      },
      st8: {
        id: "st8",
        speaker: "SYSTEM",
        text: "Verstanden. Bitte führen Sie zuerst eine Aktualisierung von CentralOS durch — über das lokale E67-Netz. Verwaltung → System → CentralOS → Aktualisieren.",
        next: "st9",
      },
      st9: {
        id: "st9",
        speaker: "SYSTEM",
        text: "Danach: Verwaltung → Technisches Problem melden → Netzwerkproblem an Leitstelle E67. Die automatische Problemermittlung leitet Ihren Fehler an die Gateway-Verantwortlichen weiter.",
        next: "st10",
      },
      st10: {
        id: "st10",
        speaker: "LAYARD",
        text: "Verstanden.",
        next: "st11",
      },
      st11: {
        id: "st11",
        speaker: "SYSTEM",
        text: "[ Hörer eingehängt. Layard erinnert sich: Stegmann hatte denselben monotonen Tonfall wie die automatischen Ansagen der B2-Kantine. ]",
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
        text: "Den darf ich nicht direkt herausgeben. Aber er steht in der Mail, die ich Ihnen gerade ins Terminal lege. Sie wissen schon — das Datum.",
        subtext: "Sie hätte ihn sagen können. Sie wollte nicht.",
        next: "x5",
        choices: [
          {
            text: "Pause … [Schmerz-Radio aktiv lassen]",
            requiresRadio: true,
            next: "x6radio",
          },
          {
            text: "Verstanden. Auf Wiederhören.",
            next: "x7",
          },
        ],
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
        text: "Ich bringe das Einsatzprotokoll. Zimmer 1534.",
        next: "r3",
      },
      r3: {
        id: "r3",
        speaker: "RECEPTION",
        text: "Korridor 15. Erste Tür rechts, dann den langen Gang bis zum Ende. Die rote Tür.",
        next: "r4",
      },
      r4: {
        id: "r4",
        speaker: "RECEPTION",
        text: "Eine Bitte: Bleiben Sie nicht zu lange. Frequenz 104,6 ist in diesem Sektor … unstabil.",
        subtext: "Sie weiß, dass er sie kennt. Sie sagt es trotzdem.",
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
  // 11. Mikael — first contact
  // ---------------------------------------------------------------
  mikael: {
    id: "mikael",
    start: "m1",
    lines: {
      m1: {
        id: "m1",
        speaker: "SYSTEM",
        text: "[ Der alte Mann öffnet die Augen, langsam. Er wirkt überrascht, dass jemand kommt. ]",
        next: "m2",
      },
      m2: {
        id: "m2",
        speaker: "MIKAEL",
        text: "Sie sind … nicht in Uniform. Gut. Ich habe genug von Uniformen.",
        subtext: "Erleichterung. Und etwas, das wie Wiedererkennen aussieht.",
        next: "m3",
      },
      m3: {
        id: "m3",
        speaker: "LAYARD",
        text: "Mein Name ist Worag. Ich bringe ein Protokoll.",
        next: "m4",
      },
      m4: {
        id: "m4",
        speaker: "MIKAEL",
        text: "Worag. Sie sind der Hörer aus E67. Ich höre Sie seit Jahren auf 102,3.",
        subtext: "Hörer. Nicht „Bewohner“. Ein anderes Wort.",
        next: "m5",
      },
      m5: {
        id: "m5",
        speaker: "LAYARD",
        text: "Sie hören … mich?",
        next: "m6",
      },
      m6: {
        id: "m6",
        speaker: "MIKAEL",
        text: "Das Schmerz-Radio sendet nicht nur. Es ist eine Schleife. Wer empfängt, sendet auch. 102,3. Einsamkeit. Sehr klar bei Ihnen.",
        subtext: "Schuld? Nein. Mitgefühl. Lange geübt.",
        next: "m7",
      },
      m7: {
        id: "m7",
        speaker: "LAYARD",
        text: "Das wurde uns nie gesagt.",
        next: "m8",
      },
      m8: {
        id: "m8",
        speaker: "MIKAEL",
        text: "Nein. Sonst würde niemand zuhören. Die Leitstelle hört. Sie wissen, wer sich auf 104,6 verstimmt. Sie wissen, wann jemand … abweicht.",
        subtext: "Er meint Sie. Er meint heute. Er meint Insa.",
        next: "m9",
      },
      m9: {
        id: "m9",
        speaker: "MIKAEL",
        text: "Ich habe die ersten Geräte mitgebaut. Damals war es noch ein Empfänger. Erst dann kam der Sender. Erst dann kamen die Quadranten.",
        next: "m10",
      },
      m10: {
        id: "m10",
        speaker: "LAYARD",
        text: "Warum erzählen Sie mir das?",
        next: "m11",
      },
      m11: {
        id: "m11",
        speaker: "MIKAEL",
        text: "Weil heute jemand kommt, der zuhören kann. Und weil die Schubladen-Reihe an meinem Bett nicht aus Holz ist. Da liegt etwas. Für Sie.",
        next: "m12",
      },
      m12: {
        id: "m12",
        speaker: "SYSTEM",
        text: "[ Mikaels Hand zittert. Er deutet auf den Nachttisch und auf den kleinen amber-glühenden Empfänger neben sich. ]",
        end: true,
      },
    },
  },

  mikaelLast: {
    id: "mikaelLast",
    start: "ml1",
    lines: {
      ml1: {
        id: "ml1",
        speaker: "MIKAEL",
        text: "Der Kristall stimmt das Radio jenseits von 104,6. Auf Frequenzen, die die Leitstelle … nicht eingetragen hat.",
        subtext: "Stolz. Sehr alter Stolz.",
        next: "ml2",
      },
      ml2: {
        id: "ml2",
        speaker: "MIKAEL",
        text: "Der Brief ist für Insa Bauerfeind. Wenn Sie heute zurückgehen, geben Sie ihn ihr. Persönlich. Nicht über das Terminal.",
        next: "ml3",
      },
      ml3: {
        id: "ml3",
        speaker: "LAYARD",
        text: "Sie kennen sie?",
        next: "ml4",
      },
      ml4: {
        id: "ml4",
        speaker: "MIKAEL",
        text: "Sie ist meine Tochter. Sie hat seit elf Jahren keinen Sektorwechsel beantragt. Sie wartet. Auf jemanden wie Sie. Heute zum Beispiel.",
        subtext: "Es kostet ihn etwas, das auszusprechen. Er tut es trotzdem.",
        next: "ml5",
      },
      ml5: {
        id: "ml5",
        speaker: "MIKAEL",
        text: "Gehen Sie. Bevor die Sanitäter aus E67 hier oben sind. Und Worag — schalten Sie das Radio aus, wenn Sie den Aufzug betreten. Nur einmal. Probieren Sie es.",
        next: "ml6",
      },
      ml6: {
        id: "ml6",
        speaker: "SYSTEM",
        text: "[ Der Monitor neben dem Bett zeigt eine flache Linie. Der amber Empfänger erlischt. ]",
        end: true,
      },
    },
  },

  insa3: {
    id: "insa3",
    start: "n1",
    lines: {
      n1: {
        id: "n1",
        speaker: "INSA",
        text: "Bauerfeind. — Worag, sind Sie das? Sie sind in E71.",
        subtext: "Sie hat Ihren Standort auf dem Schirm. Schon eine Weile.",
        next: "n2",
      },
      n2: {
        id: "n2",
        speaker: "LAYARD",
        text: "Ich war in Zimmer 1534.",
        next: "n3",
      },
      n3: {
        id: "n3",
        speaker: "INSA",
        text: "[ … ]",
        subtext: "Sie atmet aus. Lautlos. Sie wusste es.",
        next: "n4",
      },
      n4: {
        id: "n4",
        speaker: "INSA",
        text: "Hören Sie zu. In genau elf Minuten gibt die Leitstelle 001 eine Sektor-Sperre für E67/E71 aus. Wartungsfenster. Standardprotokoll bei „Hörer-Drift“.",
        next: "n5",
      },
      n5: {
        id: "n5",
        speaker: "INSA",
        text: "Wenn Sie in E67 sein wollen, müssen Sie jetzt in den Aufzug. Wenn Sie in E71 bleiben wollen — auch.",
        subtext: "Sie zwingt Sie zu wählen. Zum ersten Mal seit Jahren.",
        next: "n6",
      },
      n6: {
        id: "n6",
        speaker: "LAYARD",
        text: "Ich habe etwas für Sie. Von ihm.",
        next: "n7",
      },
      n7: {
        id: "n7",
        speaker: "INSA",
        text: "Dann kommen Sie zurück. Bitte. — Auf Wiederhören, Herr Worag.",
        subtext: "Bitte. Sie hat „bitte“ gesagt.",
        next: "n8",
      },
      n8: {
        id: "n8",
        speaker: "SYSTEM",
        text: "[ Verbindung getrennt. Der Aufzug am Ende des Korridors öffnet sich. ]",
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
        text: "Hey. Du bist nicht von dieser Etage. Wer auf einer fremden Etage ankommt, sucht entweder etwas — oder läuft weg.",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Diagnose.",
        next: "mi3",
      },
      mi3: {
        id: "mi3",
        speaker: "LAYARD",
        text: "Ich suche jemanden. Den Abschnittsverantwortlichen.",
        next: "mi4",
      },
      mi4: {
        id: "mi4",
        speaker: "MIRA",
        text: "Den gibt es heute nicht. Den gibt es eigentlich nie. Das System tut nur so, als ob.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        choices: [
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          { text: "Pass auf, was du sagst. Hier hört jemand zu.", next: "miraClosed1" },
          { text: "Keine Zeit für sowas." },
        ],
      },
      // OFFEN
      miraOpen1: {
        id: "miraOpen1",
        speaker: "MIRA",
        text: "Frag dich mal, warum 104,6 deinen Schmerz lindert und nicht den Grund dafür wegnimmt. Ein gutes Mittel würde das Problem lösen — nicht dich an das Problem gewöhnen.",
        next: "miraOpen2",
      },
      miraOpen2: {
        id: "miraOpen2",
        speaker: "MIRA",
        text: "Die Frequenz ist eine Leine. Lang genug, dass du dich frei fühlst. Kurz genug, dass du nicht aus dem Quadranten läufst.",
        next: "miraOpen3",
      },
      miraOpen3: {
        id: "miraOpen3",
        speaker: "LAYARD",
        text: "Und wer hält das andere Ende?",
        next: "miraOpen4",
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
          { text: "[ Annehmen ]", next: "miraOpen7" },
          { text: "[ Ablehnen ]", next: "miraRefuse" },
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
        choices: [
          { text: "Ja. Gib mir das Blatt.", next: "mr2" },
          { text: "Nein. Ich wollte nur reden." },
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
};
