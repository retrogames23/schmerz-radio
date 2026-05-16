import type { DialogTree } from "../types";
import { maybeGiveWartungsnotiz5610 } from "./_helpers";

export const philippeDialogs: Record<string, DialogTree> = {
  philippeAtDoor: {
    id: "philippeAtDoor",
    start: "p0",
    npcId: "philippe",
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
        text: "[ Am Ende des Korridors, dicht am vergitterten Fenster: ein Mann, Anfang 40. Er kommt dir bekannt vor und sieht hinaus, ohne wirklich hinzusehen. ]",
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
};
