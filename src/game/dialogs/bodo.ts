import type { DialogTree } from "../types";

export const bodoDialogs: Record<string, DialogTree> = {
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
        text: "Messgänge. Körperschall, Verstärker, Klemmen. Wenn die Stadt knirschte, war meistens eine Spule kalt — oder eine Wand, die weitergab, was sie nicht sollte. Resonanz-Hygiene hieß das schon damals. — Ich rede nicht gern darüber. Es war ein anderer Beruf, in einer anderen Stadt.",
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
        text: "Tiere sind in dieser Etage offiziell nicht erlaubt. Ich hab sie über Insa angemeldet. Sie hat es nie protokolliert. Das ist alles, was ich Ihnen heute über Insa sage.",
        next: "bodoLottiReveal3",
      },
      bodoLottiReveal3: {
        id: "bodoLottiReveal3",
        speaker: "BODO",
        text: "Sie zuckt, wenn mein Werkstattradio voll aufgedreht ist. Deshalb läuft es hier leise.",
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
        text: "Sie zuckt, wenn es im Mauerwerk brummt. Deshalb ist es hier leise. Sie ist die Einzige, die mir Lärm wirklich übel nehmen würde.",
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
        text: "Weiter. Schönes Wort.",
        subtext: "Er trinkt einen Schluck.",
        choices: [
          {
            text: "Da bewegt sich etwas auf dem Sessel.",
            next: "bodoLottiReveal",
          },
          {
            text: "Sie haben vorhin Resonanz-Hygiene gesagt. Was hat das mit Ihren Messgängen zu tun?",
            next: "bodoResonanzHygiene1",
          },
          {
            text: "Meine Post läuft seit der Reparatur bei der Leitstelle auf. Kommt man da irgendwie ran?",
            requires: ["port2611Locked"],
            hiddenWhen: ["readTagescodeViaMira"],
            next: "bodoLeitstelle1",
          },
          {
            text: "Kowalk sagt, Sie haben Brust mal im Phrasen-Duell kleingekriegt. Wie?",
            requires: ["kowalkHintedBodoHelka"],
            hiddenWhen: ["learnedAttackVorgesetzten"],
            next: "bodoTeachAttack1",
          },
          { text: "[ Beenden ]" },
        ],
      },
      bodoTeachAttack1: {
        id: "bodoTeachAttack1",
        speaker: "BODO",
        text: "Brust? — Ja. Einmal. Vor zwei Jahren. Wegen Lottis Wassermarke. Er wollte mich mit »ich muss das erst meinem Vorgesetzten vorlegen« abwimmeln.",
        next: "bodoTeachAttack2",
      },
      bodoTeachAttack2: {
        id: "bodoTeachAttack2",
        speaker: "BODO",
        text: "Der Trick, Worag: nicht zurückzucken. Sagen Sie: »Holen Sie doch bitte gleich Ihren Vorgesetzten. Ich warte hier — ich habe Zeit.« Punkt. Ohne Lächeln.",
        subtext: "Er sagt es ganz nüchtern. Als hätte er den Satz seitdem hundertmal weitergegeben.",
        next: "bodoTeachAttack3",
      },
      bodoTeachAttack3: {
        id: "bodoTeachAttack3",
        speaker: "BODO",
        text: "Niemand will den Vorgesetzten wirklich holen. Auch Brust nicht. Auch Vossbeck nicht. Schreiben Sie sich das ins Phrasenbuch.",
        choices: [
          {
            text: "[ »Holen Sie Ihren Vorgesetzten« ins Phrasenbuch übernehmen ]",
            action: (api) => api.setFlag("learnedAttackVorgesetzten"),
          },
        ],
      },
      // Diegetischer Hinweis: das Wartungsnetz ist die Ausnahme — und im
      // 46er hängt eine Maschine daran, die keiner angemeldet hat.
      bodoLeitstelle1: {
        id: "bodoLeitstelle1",
        speaker: "BODO",
        text: "Dienstpasswort? Kriegen Sie nicht. Das hat die Disposition, und die gibt es nicht raus, auch nicht an Leute, die höflich fragen.",
        subtext: "Er sagt es ohne Bedauern. Eine Feststellung, wie ein Grenzwert.",
        next: "bodoLeitstelle2",
      },
      bodoLeitstelle2: {
        id: "bodoLeitstelle2",
        speaker: "BODO",
        text: "Es gibt genau eine Ausnahme, und die ist technisch: Anschlüsse im Wartungsnetz. Die fragt der Knoten nicht nach einem Passwort, weil er sonst bei jedem Rohrbruch stehenbliebe.",
        next: "bodoLeitstelle3",
      },
      bodoLeitstelle3: {
        id: "bodoLeitstelle3",
        speaker: "BODO",
        text: "Und im 46er sitzt ein Kind, das sich an den Etagendrucker geklemmt hat. Das ist im Wartungsnetz. Ich billige das nicht. Ich stelle es nur fest.",
        subtext: "Er schaut kurz zu Lotti, als hätte er zu viel gesagt.",
        next: "bodoLeitstelle4",
      },
      bodoLeitstelle4: {
        id: "bodoLeitstelle4",
        speaker: "BODO",
        text: "Reinbitten wird sie Sie nicht. Aber Betriebstechnik sitzt nie in der eigenen Wohnung, wenn der Steigstrang hochläuft — dann stehen die im Korridor wie alle anderen. Die Stränge stehen unten im Keller. Tür neben dem Tresen, Vierkant.",
        subtext: "Er sagt es so beiläufig, dass es kein Rat sein kann. Es ist trotzdem einer.",
        choices: [
          {
            text: "[ Verstanden. ]",
            action: (api) => api.setFlag("knowsMiraNetAccess"),
          },
        ],
      },

      // Resonanz-Hygiene als Doppelbegriff — bau-akustisch und sozial.
      bodoResonanzHygiene1: {
        id: "bodoResonanzHygiene1",
        speaker: "BODO",
        text: "Offiziell: Schwingungen im Bau. Messwerte, Grenzwerte, Ruhezeiten. Inoffiziell wissen Sie so gut wie ich, was der Mandatsrat damit meint — wer hinter welcher Wand weint, wer sich krankmeldet, wo es kippt. Beides heißt Resonanz. Das ist kein Versehen.",
        next: "bodoResonanzHygiene2",
      },
      bodoResonanzHygiene2: {
        id: "bodoResonanzHygiene2",
        speaker: "BODO",
        text: "Ich gehe meine Messgänge, ich trage die Zahlen ein, und einmal im Quartal fragt jemand nach, ob im 46er alles ruhig ist. Nach den Zahlen fragt nie jemand.",
        subtext: "Er stellt die Teekanne ab, sehr genau in den Ring auf dem Tisch.",
        end: true,
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
        text: "Sie zuckt, wenn es im Mauerwerk brummt. Tieffrequent, nachts. Deshalb halte ich es hier leise — soweit ein Stahlbetonbau das zulässt.",
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
        text: "[ Bodo nimmt das Flugblatt zwischen zwei Finger. Liest. Lange. Lotti zuckt einmal mit dem Ohr, als hätte jemand im Nebenraum gehustet. ]",
        next: "bf3",
      },
      bf3: {
        id: "bf3",
        speaker: "BODO",
        text: "Z.K.S. Den Namen kenne ich. Aus alten Akten bei den Stadtwerken. — Das hier ist nichts Neues, Herr Worag. Das hier ist nur das erste Mal, dass es jemand auf Papier bringt.",
        next: "bf4",
      },
      bf4: {
        id: "bf4",
        speaker: "LAYARD",
        text: "Welche Akten?",
        next: "bf5",
      },
      bf5: {
        id: "bf5",
        speaker: "BODO",
        text: "Stadtwerke-Logbücher, neunzehnhunderteinundneunzig. Seitdem läuft hier vieles nur, weil jemand von Hand nachregelt — Schicht für Schicht. Ein Mensch, eine Liste, ein Schraubenzieher.",
        next: "bf5b",
      },
      bf5b: {
        id: "bf5b",
        speaker: "BODO",
        text: "Wer diese Schichten besetzt, ist nicht die Stadt. Das war sie nie. Wer es ist — keine Ahnung. Aber jemand zahlt sie.",
        next: "bf6",
      },
      bf6: {
        id: "bf6",
        speaker: "BODO",
        text: "Wenn der Mensch geht, fällt die Schicht aus. Wenn die Schicht ausfällt, ist das Haus taub — kein Hausruf, keine Terminals. Das ist alles, was Sie wissen müssen — und mehr, als ich heute hätte sagen sollen.",
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
        next: "bc10b",
      },
      bc10b: {
        id: "bc10b",
        speaker: "SYSTEM",
        text: "[ Bodo bleibt an der Schublade stehen. Zieht sie noch einmal halb auf, kramt kurz, und legt eine abgegriffene blaue Plastikkarte vor Layard auf den Tisch. Auf der Rückseite mit Bleistift: »5610 · nur Bodo«. ]",
        next: "bc10c",
      },
      bc10c: {
        id: "bc10c",
        speaker: "BODO",
        text: "Wenn Sie eh hier sitzen, Worag — tun Sie mir einen Gefallen. 5610, Tech-Knoten Korridor 56. Ich war gestern dran und hab' meine Thermoskanne stehenlassen. Grüne, mit Delle. Holen Sie die nur raus, wenn Sie sowieso an 5610 vorbeikommen.",
        subtext: "Er sagt es beiläufig. Wie etwas, das er sich nicht abringen muss.",
        next: "bc10d",
      },
      bc10d: {
        id: "bc10d",
        speaker: "BODO",
        text: "Karte können Sie behalten. Von dem Raum weiß eh keiner mehr, dass es ihn gibt.",
        subtext: "Lotti hebt kurz den Kopf. Bodo nickt nur einmal, knapp.",
        choices: [
          {
            text: "[ Karte einstecken ]",
            action: (api) => {
              // Nur einstecken, wenn Layard nicht schon eine Karte hat
              // (Philippe-Spur vergibt dieselbe Karte aus der Werkbank).
              if (!api.hasItem("wartungsnotiz5610")) {
                api.addItem({
                  id: "wartungsnotiz5610",
                  name: "Wartungskarte (E67 · Korridor 56)",
                  description:
                    "Eine abgegriffene blaue Plastikkarte. Auf der Rückseite mit Bleistift: »5610 · nur Bodo«. Bodo hat sie Layard ohne Aufhebens in die Hand gedrückt — als Gefälligkeit, mit Auftrag: Thermoskanne aus dem Tech-Knoten 5610 holen.",
                });
              }
              api.setFlag("bodoGaveWartungskarte");
            },
            next: "bc11",
          },
        ],
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
        text: "Bildschirm steht noch wie ich ihn verlassen hab’. Danke, Herr Worag. Danke.",
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
  bodoReturnsCaught: {
    id: "bodoReturnsCaught",
    start: "bx1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3");
    },
    lines: {
      bx1: {
        id: "bx1",
        speaker: "SYSTEM",
        text: "[ Bodo schiebt sich durch die Tür. Tasche unter dem Arm, B3 darin. Lotti hebt den Kopf — und Bodo bleibt im Türrahmen stehen. ] Bodo schaut zum Terminal. Schaut wieder zurück. Sein Gesicht wird sehr still.",
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
  bodoReturnsCaughtMaint: {
    id: "bodoReturnsCaughtMaint",
    start: "bm1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3");
    },
    lines: {
      bm1: {
        id: "bm1",
        speaker: "SYSTEM",
        text: "[ Bodo schiebt sich durch die Tür. Tasche unter dem Arm, B3 darin. Lotti hebt den Kopf — und Bodo bleibt im Türrahmen stehen. ] Bodo schaut zum Terminal. Bildschirm steht — fast — wie er ihn verlassen hat. Eine Zeile zu viel im Verlauf.",
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
  bodoReturnsSelfFix: {
    id: "bodoReturnsSelfFix",
    start: "bs1",
    onEnd: (api) => {
      api.setFlag("bodoBackAfterB3Twice");
      api.setFlag("elevatorMaintCleared");
    },
    lines: {
      bs1: {
        id: "bs1",
        speaker: "SYSTEM",
        text: "[ Bodo kommt zurück, Wasserkanne in der Hand, Lotti reibt sich an seinem Schienbein. Er bleibt im Türrahmen stehen. ]",
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
        text: "Kaputtmachen. Hm. — Da steht draußen ein Aufzug, der seit heute Mittag nichts mehr tut. Wartung 4711.",
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
  bodoSignsTilla: {
    id: "bodoSignsTilla",
    start: "bt1",
    onEnd: (api) => {
      api.setFlag("bodoSignedForTilla");
    },
    lines: {
      bt1: {
        id: "bt1",
        speaker: "LAYARD",
        text: "Bodo. Eine kleine Sache. Schicht-B-Quittung. Wartung. Sie kennen das.",
        subtext: "Layard hält den Bogen so flach, dass nur das Kopffeld sichtbar ist.",
        next: "bt2",
      },
      bt2: {
        id: "bt2",
        speaker: "BODO",
        text: "Schicht B. Kulanz. Was hat Frau Kowalk wieder unten an der Theke …",
        subtext: "Er greift den Bogen, ohne hinzusehen. Wie hundert Wartungsformulare zuvor.",
        next: "bt3",
      },
      bt3: {
        id: "bt3",
        speaker: "SYSTEM",
        text: "[ Bodo sucht den Stift, findet keinen. Lotti zwinkert. Layard reicht ihm den Bleistiftstummel. ]",
        next: "bt4",
      },
      bt4: {
        id: "bt4",
        speaker: "BODO",
        text: "Marschke, Schicht B, Kulanz. Datum kennen Sie selber. — So. Wo unterschreibt man da heute eigentlich.",
        subtext: "Er findet das Feld trotzdem. Setzt den Strich.",
        next: "bt5",
      },
      bt5: {
        id: "bt5",
        speaker: "LAYARD",
        text: "Hier. Danke, Bodo.",
        next: "bt6",
      },
      bt6: {
        id: "bt6",
        speaker: "BODO",
        text: "Schon gut. Wenn die Theke das braucht, kriegt die Theke das. Hauptsache, Lotti merkt nichts vom Lärm.",
        subtext: "Lotti merkt alles. Sie sagt nur nichts.",
        end: true,
      },
    },
  },
  // ── Layard bringt Bodo seine vergessene Thermoskanne zurück.
  //    Wird vom bodoNpc-Hotspot ausgelöst (sobald die Kanne im
  //    Inventar liegt) oder von der Combine-Logik (Kanne auf Bodo
  //    gezogen). Entfernt das Item und setzt `gaveBodoThermos`.
  bodoReturnThermos: {
    id: "bodoReturnThermos",
    start: "brt1",
    onEnd: (api) => {
      api.removeItem("bodoThermos");
      api.setFlag("gaveBodoThermos");
    },
    lines: {
      brt1: {
        id: "brt1",
        speaker: "LAYARD",
        text: "Bodo — die hier hat im Tech-Knoten gestanden. Grün, mit Delle. Wie bestellt.",
        subtext: "Layard stellt die Thermoskanne behutsam auf den Tisch.",
        next: "brt2",
      },
      brt2: {
        id: "brt2",
        speaker: "BODO",
        text: "Da ist sie ja. Ich dachte schon, die hätt' jemand für eine Vase gehalten.",
        subtext: "Er nimmt sie hoch, dreht sie einmal in der Hand. Klopft beiläufig gegen die Delle.",
        next: "brt3",
      },
      brt3: {
        id: "brt3",
        speaker: "BODO",
        text: "Die Delle ist von '94. Ein Trafo ist mir damals fast auf den Fuß — die Kanne hat den Treffer für mich abgekriegt.",
        subtext: "Bodo schraubt den Deckel auf, riecht hinein, schraubt ihn wieder zu.",
        next: "brt4",
      },
      brt4: {
        id: "brt4",
        speaker: "BODO",
        text: "Riecht noch nach Tee. Lotti wird das mögen — sie schläft besser, wenn's hier irgendwo nach Karton riecht.",
        next: "brt5",
      },
      brt5: {
        id: "brt5",
        speaker: "LAYARD",
        text: "Gern geschehen.",
        next: "brt6",
      },
      brt6: {
        id: "brt6",
        speaker: "BODO",
        text: "Wer Kannen wiederbringt, dem schuldet man nichts — außer einem Nicken.",
        subtext: "Er nickt einmal. Knapp, aber er meint es.",
        end: true,
      },
    },
  },

  // ── Layard versucht, Bodo die Wartungskarte 5610 zurückzugeben.
  //    Bodo weigert sich. Die Karte bleibt im Inventar — eine Einladung,
  //    die Räume zu finden, zu denen sie führt.
  bodoReturnWartungskarte: {
    id: "bodoReturnWartungskarte",
    start: "brwk1",
    lines: {
      brwk1: {
        id: "brwk1",
        speaker: "LAYARD",
        text: "Bodo — Ihre Karte. Ich habe sie nicht gebraucht.",
        next: "brwk2",
      },
      brwk2: {
        id: "brwk2",
        speaker: "BODO",
        text: "Danke, die können Sie behalten. Ich habe genug Karten, die zu Räumen führen, die längst vergessen wurden.",
        subtext: "Er wedelt ab, als hätte Layard ihm ein Taschentuch angeboten.",
        next: "brwk3",
      },
      brwk3: {
        id: "brwk3",
        speaker: "LAYARD",
        text: "Sind Sie sicher?",
        next: "brwk4",
      },
      brwk4: {
        id: "brwk4",
        speaker: "BODO",
        text: "Sicher. Wenn Sie sie nicht brauchen, findet sie irgendwann selbst den Weg. Die meisten Dinge tun das hier.",
        end: true,
      },
    },
  },

  // ── Kellerschlüssel: Bodo rückt den Vierkant heraus ───────────────
  //    Nur nach zurückgebrachter Thermoskanne (`gaveBodoThermos`).

  bodoKellerKey: {
    id: "bodoKellerKey",
    start: "bkk1",
    onEnd: (api) => {
      api.setFlag("gotKellerKey");
      api.setFlag("knowsStrang46");
      api.addItem({
        id: "vierkantschluessel",
        name: "Vierkantschlüssel",
        description:
          "Kurzer Stahlgriff mit quadratischer Nuss. Öffnet die Wartungstür neben dem Empfangstresen in der Lobby E67. Bodo hat ihn seit '89 nicht abgegeben.",
      });
    },
    lines: {
      bkk1: {
        id: "bkk1",
        speaker: "LAYARD",
        text: "Bodo — kommt man hier eigentlich in den Keller? An die Betriebstechnik.",
        next: "bkk2",
      },
      bkk2: {
        id: "bkk2",
        speaker: "BODO",
        text: "Kommt man. Wenn man einen Vierkant hat. Und einen Grund.",
        subtext: "Er sieht Layard an, als würde er beides gleichzeitig prüfen.",
        choices: [
          { text: "Mein Anschluss ist gesperrt. Ich brauche einen anderen Weg.", next: "bkk3" },
          { text: "Nur mal sehen, wie das Haus warm wird.", next: "bkk3b" },
        ],
      },
      bkk3: {
        id: "bkk3",
        speaker: "BODO",
        text: "Prüfsperre. Ja. Die kennen wir. Da unten liegt der Anschluss nicht, aber egal — Sie kriegen den Schlüssel.",
        next: "bkk4",
      },
      bkk3b: {
        id: "bkk3b",
        speaker: "BODO",
        text: "Warm wird es da unten von ganz allein. — Ach, nehmen Sie ihn. Wer Kannen zurückbringt, klaut keine Rohre.",
        next: "bkk4",
      },
      bkk4: {
        id: "bkk4",
        speaker: "BODO",
        text: "Der hier. Seit '89 nicht abgegeben, hat auch keiner verlangt. Tür neben dem Tresen, Blech, kein Schild, das noch stimmt.",
        subtext: "Er angelt den Schlüssel aus einer Blechdose neben dem Sessel.",
        next: "bkk5",
      },
      bkk5: {
        id: "bkk5",
        speaker: "BODO",
        text: "Unten steht die Heizung. Sechs Stränge, sechs Knöpfe. Vierter von links ist Korridor 46 — steht auch im Buch, falls Sie's nicht glauben.",
        next: "bkk6",
      },
      bkk6: {
        id: "bkk6",
        speaker: "BODO",
        text: "Und drehen Sie mir da nichts fest, was nachher jemand losdrehen muss. Ich sag nur: der Kasten ist älter als Sie.",
        subtext: "[ Vierkantschlüssel erhalten. ]",
        end: true,
      },
    },
  },
  // Absage: Bodo weiß, was er noch zugute hat.
  bodoKellerKeyRefusal: {
    id: "bodoKellerKeyRefusal",
    start: "bkr1",
    onEnd: (api) => api.setFlag("askedBodoKellerKey"),
    lines: {
      bkr1: {
        id: "bkr1",
        speaker: "LAYARD",
        text: "Bodo — kommt man hier in den Keller? An die Betriebstechnik.",
        next: "bkr2",
      },
      bkr2: {
        id: "bkr2",
        speaker: "BODO",
        text: "Erst mal das, was Sie mir schon versprochen haben. Meine Kanne steht noch in 5610 und wird nicht wärmer.",
        subtext: "Er sagt es freundlich. Und trotzdem ist es ein Nein.",
        next: "bkr3",
      },
      bkr3: {
        id: "bkr3",
        speaker: "BODO",
        text: "Bringen Sie die zurück, dann reden wir über Schlüssel. So läuft das hier — nicht wegen der Kanne. Wegen der Reihenfolge.",
        end: true,
      },
    },
  },

  // ── Kaputtes Telefon: Bitte um Bodos Apparat ──────────────────────
  bodoPhoneRefusal: {
    id: "bodoPhoneRefusal",
    start: "bp1",
    lines: {
      bp1: {
        id: "bp1",
        speaker: "LAYARD",
        text: "Bodo, mein Apparat ist tot. Kein Freizeichen, nur Sirren. Darf ich einmal Ihres benutzen?",
        next: "bp2",
      },
      bp2: {
        id: "bp2",
        speaker: "BODO",
        text: "Sirren. Klar. Kalte Spule oder Klemme locker, eins von beiden.",
        subtext: "Er sagt es beiläufig, wie jemand, der das Geräusch schon tausendmal gehört hat.",
        next: "bp3",
      },
      bp3: {
        id: "bp3",
        speaker: "LAYARD",
        text: "Dann wissen Sie ja, dass es dringend ist.",
        next: "bp4",
      },
      bp4: {
        id: "bp4",
        speaker: "BODO",
        text: "Weiß ich. Trotzdem nein. — Wenn Sie über meinen Anschluss die Leitstelle anrufen, steht mein Anschluss in einem Verwaltungsakt. Und dann steht auch ich drin.",
        next: "bp5",
      },
      bp5: {
        id: "bp5",
        speaker: "LAYARD",
        text: "Es ist ein Anruf.",
        next: "bp6",
      },
      bp6: {
        id: "bp6",
        speaker: "BODO",
        text: "Es ist nie ein Anruf. Es ist eine Verbindungsnotiz, eine Rückfrage, eine Bestätigung, und irgendwann eine Anhörung, in der man wissen will, warum bei mir jemand telefoniert hat, der nicht bei mir wohnt.",
        subtext: "Er hebt die Tasse, trinkt nicht.",
        next: "bp7",
      },
      bp7: {
        id: "bp7",
        speaker: "BODO",
        text: "Tut mir leid, Worag. Ich habe einfach keine Lust auf den Papierkram.",
        next: "bp8",
      },
      bp8: {
        id: "bp8",
        speaker: "LAYARD",
        text: "Und was mache ich stattdessen?",
        next: "bp9",
      },
      bp9: {
        id: "bp9",
        speaker: "BODO",
        text: "Sie melden die Störung da, wo sie hingehört. Nicht bei der Leitstelle — an Wohnungsapparaten darf nur die Wartung des eigenen Korridors ran.",
        next: "bp10",
      },
      bp10: {
        id: "bp10",
        speaker: "BODO",
        text: "Korridor 46, Schicht A. Tür 4601. Das Mädchen mit dem Werkzeugkoffer — Anwärterin. Die muss ran, ob sie will oder nicht. Das ist ihr Papierkram, nicht meiner.",
        choices: [
          {
            text: "[ Notiert: 4601, Korridor 46 ]",
          },
        ],
      },
    },
  },
  bodoPhoneRefusalShort: {
    id: "bodoPhoneRefusalShort",
    start: "bps1",
    lines: {
      bps1: {
        id: "bps1",
        speaker: "LAYARD",
        text: "Noch mal wegen des Telefons: Ihr Apparat, ein Anruf, mehr nicht.",
        next: "bps2",
      },
      bps2: {
        id: "bps2",
        speaker: "BODO",
        text: "4601. Korridor 46. Immer noch. — Und immer noch keine Lust auf den Papierkram.",
        subtext: "Die Katze hebt kurz den Kopf und legt ihn wieder ab.",
        end: true,
      },
    },
  },
};
