import apartmentBg from "@/assets/scene-apartment.jpg";
import apartmentNoRadioBg from "@/assets/scene-apartment-no-radio.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import hallway2615SealedBg from "@/assets/scene-hallway-2615-sealed.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2612BgEmpty from "@/assets/scene-apt-2612.jpg";
import apt2612BgBodo from "@/assets/scene-apt-2612-bodo.jpg";
import pencilStubSprite from "@/assets/sprite-pencil-stub.png";
import type { GameApi, Scene } from "../types";

/**
 * Kaputtes Telefon (Akt-I-Pflichträtsel): Solange Layards Apparat tot ist,
 * fragt er bei jedem erreichbaren Nachbarn nach dessen Telefon. Alle lehnen
 * ab — mehrere verweisen auf die Korridor-Wartung (Mira, 4601).
 * Gibt true zurück, wenn ein Absage-Dialog gestartet wurde.
 */
function tryPhoneRefusal(
  api: GameApi,
  askedFlag:
    | "askedBodoPhone"
    | "askedPhilippePhone"
    | "askedEnnisPhone"
    | "askedHelkaPhone",
  dialogId: string,
  shortDialogId: string,
): boolean {
  if (!api.hasFlag("phoneBroken") || api.hasFlag("phoneRepaired")) return false;
  if (api.hasFlag(askedFlag)) {
    api.startDialog(shortDialogId);
    return true;
  }
  api.setFlag(askedFlag);
  api.startDialog(dialogId);
  return true;
}

export const apartmentAct1Scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: (api) =>
      api.hasFlag("tookPainRadio") ? apartmentNoRadioBg : apartmentBg,
    title: "Wohnung 2611 — Gebäude E67",
    intro: (api) => {
      // Akt II — am Morgen nach der Protokoll-Übergabe. Der Auftrag kommt
      // per Dienstmail; das Schreiben liegt bei Vossbeck (3603).
      if (api.hasFlag("act2Started")) {
        const friendly = api.hasFlag("miraEndFriendly");
        const skeptical = api.hasFlag("miraEndSkeptical");
        const mira = friendly
          ? "Auf dem Boden vor seiner Tür: ein zusammengefalteter Zettel von Mira — er hat ihn gestern Abend nicht aufgehoben."
          : skeptical
            ? "Von gegenüber: das Geräusch eines Riegels, der vorgeschoben wird. Miras Tür bleibt zu."
            : "Im Korridor draußen: Schritte, die nicht stehen bleiben.";
        if (!api.hasFlag("act2LetterPickedUp")) {
          return [
            "Layard wacht ohne Wecker auf. Auf dem Tisch liegt nichts mehr, was jemandem gehört.",
            "Im Dienstpostfach: Rechercheauftrag 28/1194. Erhebung vor Ort, Gebäude E71.",
            "Das Legitimationsschreiben liegt in der Kantinenverwaltung, Zimmer 3603, zur Abholung bereit.",
            mira,
          ].join(" ");
        }
        return [
          "Layards Wohnung. Auf dem Tisch das offizielle Schreiben, daneben ein leerer Becher.",
          "Erhebungsort E71. Befragung zulässig.",
          mira,
        ].join(" ");
      }
      return "Layard. Ein-Zimmer-Wohnung, Gebäude E67. Auf dem Tisch:  das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6 und dreh die Lautstärke voll auf.";
    },
    hotspots: [
      {
        id: "radio",
        x: 17,
        y: 50.9,
        w: 8.1,
        h: 13.7,
        label: "Schmerz-Radio",
        kind: "use",
        hiddenWhen: ["tookPainRadio"],
        onUse: (api) => {
          if (!api.hasFlag("tookPainRadio")) {
            api.setFlag("tookPainRadio");
            api.addItem({
              id: "painRadio",
              name: "Schmerz-Radio",
              description:
                "Ein kleines tragbares Schmerz-Radio mit Bernstein-Skala und kurzer Teleskop-Antenne — ein obskures Bastler-Gerät aus den Siebzigern, das außer Layard fast niemand mehr nutzt. Layards einziger verlässlicher Empfänger. Steckt jetzt in der Innentasche seines Mantels.",
            });
            api.showText([
              "Layard hebt das Schmerz-Radio vom Tisch und steckt es ein.",
              "Früher hatte Layard wenige Gefühle gehabt. Wahrscheinlich waren es meistens Gedanken gewesen – und dann überwiegend negative. Das Gefühl, das er noch am besten kannte, am klarsten trennen konnte von dem Klumpen seines Inneren, war Angst.",
              "Als er vor fünf Jahren das alte, längst aus der Mode gekommene Schmerz-Radio auf dem Dachboden seiner Mutter gefunden hatte, änderte sich das. Schmerz war anders. Schmerz war tief, traurige Schönheit – das Gefühl den Schmerz der anderen zu spüren war für ihn berauschender als das Excelsior, das er einmal ausprobiert hatte. Es machte Spaß, das Schmerz-Radio machte traurig, ehrfürchtig – die intensiven Gefühle der anderen war das Tor zu einem inneren Universum.",
            ]);
            return;
          }
          api.openRadio();
        },
      },
      {
        id: "terminal",
        x: 28.6,
        y: 35.6,
        w: 11.5,
        h: 28,
        label: "CentralOS Terminal",
        kind: "use",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "window",
        x: 45.1,
        y: 1.8,
        w: 10.2,
        h: 54.9,
        label: "Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Durch das schmale Fenster sieht Layard den gegenüberliegenden Trakt E65, die gleichen Reihen, die gleichen Scheiben.",
            "Unten im Hof fährt gerade ein Linienbus vorbei, kaum schneller als die Fußgänger. Der Lärm dringt gedämpft herauf.",
          ]),
      },

      {
        id: "phoneApt",
        x: 70.8,
        y: 30,
        w: 6.7,
        h: 22,

        label: "Telefon",
        kind: "use",
        // Only available after Layard saw the empty office on floor 3
        // AND has the Einsatzprotokoll in der Tasche — sonst gibt es
        // gar keinen Anlass, die Leitstelle anzurufen.
        requires: ["sawEmptyOffice", "protocolReceived"],
        hiddenWhen: ["calledInsaAfterE71"],
        onUse: (api) => {
          // Pflicht-Rätsel: Der Apparat ist tot, sobald Layard ihn zum
          // ersten Mal benutzen will. Reparieren kann nur die
          // Etagenwartung — Mira in 4601. Erst danach laufen Anrufe
          // (und damit der ganze Code-Strang über Insa/Vossbeck).
          if (!api.hasFlag("phoneRepaired")) {
            const first = !api.hasFlag("phoneBroken");
            api.setFlag("phoneBroken");
            // Der Aufkleber ist der Wegweiser: Er nennt Dienstweg,
            // Zuständigkeit UND Tür. Damit weiß der Spieler, dass Mira
            // (4601) ran muss — auch ohne vorheriges Gespräch.
            api.showText(
              first
                ? [
                    "Layard hebt ab. Kein Freizeichen.",
                    "Nur ein feines Sirren, als läge die Leitung an etwas an, das atmet.",
                    "Er drückt die Gabel. Wählt. Sirren.",
                    "Am Gehäuse klebt ein vergilbter Aufkleber: „Störungen an Wohnungsapparaten NICHT über die Leitstelle. Zuständig: Etagenwartung des eigenen Korridors.“",
                    "Darunter, mit Kugelschreiber nachgetragen: „Schicht A, Korridor 46 — Anwärterin, Tür 4601.“",
                    "Layard kennt die Tür. Dahinter wohnt das Mädchen mit dem Werkzeuggürtel.",
                  ]
                : [
                    "Sirren. Sonst nichts.",
                    "Am Gehäuse klebt der vergilbte Aufkleber noch immer: „Störungen an Wohnungsapparaten NICHT über die Leitstelle. Zuständig: Etagenwartung des eigenen Korridors.“",
                    "Darunter, mit Kugelschreiber nachgetragen: „Schicht A, Korridor 46 — Anwärterin, Tür 4601.“",
                  ],
            );
            return;
          }
          // Höchste Priorität: Layard ist aus E71 zurück und hat das
          // abgelehnte Protokoll noch in der Tasche → Insa anrufen.
          if (
            api.hasFlag("mikaelRejectedProtocol") &&
            !api.hasFlag("calledInsaAfterE71")
          ) {
            api.setFlag("calledInsaAfterE71");
            api.startDialog("insaAct2Return");
          } else if (!api.hasFlag("calledInsa2")) {
            api.setFlag("calledInsa2");
            api.startDialog("insa2a");
          } else {
            // Der Code-Pfad läuft ab jetzt komplett über Vossbeck (siehe
            // `insaDispatch.idCode*` → setzt `insaSentToKowalkForCode`).
            // Insa bleibt Vermittlung — für Netz-Erinnerungen und den
            // Vossbeck-Hinweis. Sie selbst gibt keinen Code mehr heraus.
            api.startDialog("insaDispatch");
          }
        },
      },
      {
        id: "bed",
        x: 48.6,
        y: 56.7,
        w: 32.6,
        h: 28,
        label: "Bett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ungemacht. Wie immer.",
            "Schlaf ist B2-konform: ausreichend, geschmacklos.",
          ]),
      },
      {
        // Wandregal über dem Bett. Enthält das einzige Buch, das Layard
        // wirklich gelesen hat: den „Sektoren-Almanach 1997". Daneben
        // steht die alte „Kantinenverordnung — Sammelausgabe", die
        // Layard einmalig einstecken kann.
        id: "bookshelf",
        x: 57.6,
        y: 15.9,
        w: 16,
        h: 12,
        label: "Wandregal",
        kind: "use",
        onUse: (api) => {
          // Kantinenverordnung beim ersten Aufschlagen mit einsacken.
          if (!api.hasFlag("tookKantinenverordnung")) {
            api.setFlag("tookKantinenverordnung");
            api.addItem({
              id: "kantinenverordnung",
              name: "Kantinenverordnung",
              description:
                "Ein dickes, in graues Leinen gebundenes Buch. „Kantinenverordnung — Sammelausgabe“. Aushänge, Hausordnung, Schicht- und Vollmachtsklauseln, eng beschrieben. Auf dem Vorsatzblatt, in winziger Handschrift: »Wer das ganz liest, hat schon verloren.«",
            });
          }
          const pick = () => api.startDialog("bookshelfPick");
          if (!api.hasFlag("openedAlmanach")) {
            api.setFlag("openedAlmanach");
            api.showText(
              [
                "Auf dem Wandregal: ein paar Aktenordner, ein leerer Vinyl-Schuber, die graue „Kantinenverordnung — Sammelausgabe“ (Layard zieht sie heraus, steckt sie ein), und — ganz links — der „Sektoren-Almanach 1997“.",
                "Daneben, schmaler und abgegriffener: „Die kürzeste Geschichte der Menschheit“, Mandats-Schulbuchreihe, Band 3.",
              ],
              // Auswahl erst zeigen, wenn der Spieler den Text durchgeklickt hat.
              pick,
            );
          } else {
            pick();
          }
        },
      },
      {
        id: "b2",
        x: 28.6,
        y: 77.1,
        w: 12.8,
        h: 17.8,
        label: "B2-Ration",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Synthetische Nährpaste B2.",
            "„Vollständige Versorgung. Keine Reizüberflutung.“",
            "Sie schmeckt nach nichts. Das ist Absicht.",
            "Philippe, hat Layard gehört, schwöre auf B3. Wegen des Geschmacks.",
            "Geschmack. Layard kann sich nicht erinnern, wann er das letzte Mal etwas geschmeckt hat.",
          ]),
      },
      {
        id: "door",
        x: 78,
        y: 4.2,
        w: 14.9,
        h: 92,
        label: "Wohnungstür",
        kind: "exit",
        onUse: (api) => {
          // Resonanz-Überlastung wurde ausgelöst (Radio @104,6),
          // Philippe steht beim ersten Heimkommen vor der Tür.
          if (api.hasFlag("doorbellRang") && !api.hasFlag("metPhilippe")) {
            // First open: meet Philippe at the door, then go with him to 2613
            api.setFlag("metPhilippe");
            api.startDialog("philippeAtDoor");
          } else {
            // Sonst einfach in den Korridor.
            api.goTo("hallway");
          }
        },
      },
    ],
  },
  apt2613: {
    id: "apt2613",
    background: apt2613Bg,
    title: "Wohnung 2613 — Philippe",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Philippes Wohnung am Morgen. Es riecht nach frischem Kaffee. Die Wand zur 2615 bleibt still."
        : "Philippes Wohnung. Derselbe Grundriss wie bei Layard, etwas wärmer. Es riecht nach echtem Kaffee. An der Wand zur Nachbarwohnung 2615 ist das regelmäßige Klopfen zu hören.",
    hotspots: [
      {
        id: "philippeNpc",
        // Philippe steht rechts mit verschränkten Armen.
        // Ein Hotspot für vor und nach dem Sanitäter-Einsatz,
        // mit interner Verzweigung.
        x: 68.4,
        y: 22.9,
        w: 17.4,
        h: 75.2,

        label: "Philippe",
        kind: "talk",
        visible: (api) =>
          api.hasFlag("paramedicsArrived")
            ? true
            : // Vor den Sanitätern: erst nach dem Klopfen, und nach dem
              // ersten "Warten"-Klick vorübergehend nicht ansprechbar.
              api.hasFlag("knockingHeard") && !api.hasFlag("wait2613Step1"),
        onUse: (api) => {
          if (!api.hasFlag("paramedicsArrived")) {
          if (
            api.hasFlag("calledLeitstelle") &&
            tryPhoneRefusal(
              api,
              "askedPhilippePhone",
              "philippePhoneRefusal",
              "philippePhoneRefusalShort",
            )
          ) {
            return;
          }
          if (!api.hasFlag("calledLeitstelle")) {
            api.setFlag("talkedPhilippe2613");
            api.startDialog("philippeIn2613");
          } else {
            api.startDialog("philippeSmalltalk");
          }
            return;
          }
          // Nach den Sanitätern: Philippe bleibt in seiner Wohnung 2613.
          // Verschiedene Dialoge je nach Stand der Geschichte.
          // Kaputtes Telefon: die Bitte um den Apparat geht allem voraus.
          if (
            tryPhoneRefusal(
              api,
              "askedPhilippePhone",
              "philippePhoneRefusal",
              "philippePhoneRefusalShort",
            )
          ) {
            return;
          }
          // Höchste Priorität: Layard hat die B3-Ration für Philippe und
          // hat sie noch nicht übergeben.
          if (
            api.hasItem("b3Ration") &&
            !api.hasFlag("gaveB3ToPhilippe")
          ) {
            api.setFlag("gaveB3ToPhilippe");
            api.startDialog("philippeReceivesB3");
            return;
          }
          if (api.hasFlag("ending")) {
            api.startDialog("philippeSmalltalk");
          } else if (!api.hasFlag("talkedPhilippeAfter")) {
            api.setFlag("talkedPhilippeAfter");
            if (!api.hasFlag("protocolReceived")) {
              api.startDialog("philippeAfterBeforeProtocol");
            } else if (api.hasFlag("sawEmptyOffice")) {
              api.startDialog("philippeAfter");
            } else {
              api.startDialog("philippeAfterEarly");
            }
          } else if (
            // Vollmacht-Bitte: nach erstem Zurückkommen, sobald Layard
            // weiß, dass auf Etage 3 etwas zu holen ist (sawEmptyOffice
            // → er war oben). Einmalig.
            api.hasFlag("sawEmptyOffice") &&
            !api.hasFlag("philippeAskedFavor") &&
            !api.hasFlag("ending")
          ) {
            api.setFlag("philippeAskedFavor");
            api.startDialog("philippeAsksFavor");
          } else if (api.hasFlag("protocolReceived")) {
            // Tür ist versiegelt → Philippe beginnt Layard auszufragen.
            // Fünf vertiefte Gespräche in fester Reihenfolge.
            if (!api.hasFlag("philippeThema1")) {
              api.setFlag("philippeThema1");
              api.startDialog("philippeThema1");
            } else if (!api.hasFlag("philippeThema2")) {
              api.setFlag("philippeThema2");
              api.startDialog("philippeThema2");
            } else if (!api.hasFlag("philippeThema3")) {
              api.setFlag("philippeThema3");
              api.startDialog("philippeThema3");
            } else if (!api.hasFlag("philippeThema4")) {
              api.setFlag("philippeThema4");
              api.startDialog("philippeThema4");
            } else if (!api.hasFlag("philippeThema5")) {
              api.setFlag("philippeThema5");
              api.startDialog("philippeThema5");
            } else {
              api.startDialog("philippeSmalltalk");
            }
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      {
        id: "lampPhilippe",
        // Tischlampe rechts neben Philippe auf dem Nachttisch.
        x: 64.5,
        y: 42.8,
        w: 8.1,
        h: 20.2,
        label: "Lampe",
        kind: "look",
        requires: ["paramedicsArrived"],
        onUse: (api) =>
          api.showText([
            "Die einzige warme Lichtquelle in diesem Korridor.",
            "Philippe muss sie heimlich repariert haben.",
          ]),
      },
      {
        id: "wall",
        // Mittlere Betonwand zwischen Telefon und Philippe.
        // Ein Hotspot, intern verzweigt: klopfend vor, still nach Akt 1.
        x: 27.3,
        y: 7.9,
        w: 34.4,
        h: 57.3,

        label: "Wand zur 2615",
        kind: "look",
        onUse: (api) => {
          if (api.hasFlag("doorBrokenOpen")) {
            api.showText([
              "Die Wand ist still. Zum ersten Mal seit Tagen, sagt Philippe.",
              "Trotzdem hält Layard kurz die Hand an den Beton.",
              "Nichts. Nur sein eigener Puls.",
            ]);
            return;
          }
          api.setFlag("knockingHeard");
          api.showText([
            "Klopf. Klopf. Klopf.",
            "Regelmäßig. Aber nicht mechanisch.",
            "Layard legt die Hand an den Beton. Er fühlt es im Handballen, bevor er es im Ohr hört.",
            "„Hallo?! Jemand da?“ — Das Klopfen geht im selben Rhythmus weiter.",
          ]);
        },
      },
      {
        id: "phone2613",
        // Beiger Bakelit-Wandapparat ganz links.
        x: 19.2,
        y: 23.7,
        w: 9.8,
        h: 26.6,

        label: "Telefon (Wandapparat)",
        kind: "use",
        requires: ["talkedPhilippe2613"],
        hiddenWhen: ["calledLeitstelle"],
        onUse: (api) => {
          api.setFlag("calledLeitstelle");
          api.startDialog("insa1");
        },
      },
      {
        id: "waitParamedics",
        x: 42.4,
        y: 80.4,
        w: 18,
        h: 18,
        label: "Warten",
        kind: "use",
        requires: ["calledLeitstelle"],
        hiddenWhen: ["paramedicsArrived"],
        onUse: (api) => {
          // Pro Besuch zwei Warte-Beats. Erst der zweite ruft die Sanitäter.
          if (!api.hasFlag("wait2613Step1")) {
            api.setFlag("wait2613Step1");
            api.showText([
              "Layard und Philippe warten. Das Klopfen aus 2615 hat sich kein einziges Mal verändert. Kein Tempo-Wechsel, keine Pause.",
              "Philippe schaut auf seine Uhr. Sagt nichts.",
            ]);
          } else if (!api.hasFlag("wait2613Step2")) {
            api.setFlag("wait2613Step2");
            api.showText([
              "Noch ein paar Minuten. Philippe stellt zwei Tassen auf den Tisch, trinkt aber nicht. Layard auch nicht.",
              "Im Korridor: Schritte. Gleichmäßig. Schwer.",
            ]);
          } else {
            // Sanitäter sind eingetroffen — die eigentliche Bergung
            // wird beim Verlassen der Wohnung als Cutscene gespielt.
            api.setFlag("paramedicsArrived");
            api.showText([
              "Es klopft an Philippes Tür. Schwere, kontrollierte Schläge. Eine Stimme: „Sanitätsdienst Block 26. Wir sind wegen 2615 da.“",
              "Philippe nickt Layard zu. „Gehen Sie raus. Sie haben sie gerufen.“",
            ]);
          }
        },
      },
      {
        id: "exit2613",
        // Türrahmen ganz rechts (hinter Philippe).
        x: 83.8,
        y: 18.3,
        w: 16.4,
        h: 80,

        label: "In den Korridor",
        kind: "exit",
        // Sobald die Sanitäter da sind, kann Layard hinaus. Beim ersten
        // Verlassen läuft die Bergungs-Cutscene; danach normales Navigieren.
        requires: ["paramedicsArrived"],
        onUse: (api) => {
          if (!api.hasFlag("paramedicsCutsceneSeen")) {
            api.startCutscene("paramedics");
          } else {
            api.goTo("hallway");
          }
        },
      },
    ],
  },
  apt2612: {
    id: "apt2612",
    // Solange Bodo da ist: Bild mit Bodo. Sobald er für B3 unterwegs ist:
    // identisches Bild ohne Bodo.
    background: (api) =>
      (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
      (api.hasFlag("bodoLeftForB3Twice") &&
        !api.hasFlag("bodoBackAfterB3Twice"))
        ? apt2612BgEmpty
        : apt2612BgBodo,
    title: "Wohnung 2612 — Bodo Marschke",
    intro:
      "Warmes Lampenlicht. Es riecht nach altem Kraut, das jemand „Tee“ nennt. Bodo sitzt tief im Sessel, die Katze hat den vorderen Platz auf der Decke längst für sich beansprucht.",
    npcs: [
      {
        id: "pencilStubSprite2612",
        src: pencilStubSprite,
        x: 49.6,
        y: 48.1,
        w: 7,
        h: 6,
        alt: "Bleistiftstummel auf Bodos Tisch",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookPencilStub"],
      },
    ],
    hotspots: [
      {
        id: "bodoNpc",
        // Hotspot deckt das Bodo-Sprite auf dem Sessel.
        x: 15.4,
        y: 25.5,
        w: 22.5,
        h: 60,
        label: "Bodo Marschke",
        kind: "talk",
        // Wenn Bodo gerade unterwegs zum B3 holen ist, ist er nicht da.
        visible: (api) => {
          const away1 =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const away2 =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          return !away1 && !away2;
        },
        onUse: (api) => {
          if (
            api.hasFlag("metBodo") &&
            tryPhoneRefusal(
              api,
              "askedBodoPhone",
              "bodoPhoneRefusal",
              "bodoPhoneRefusalShort",
            )
          ) {
            return;
          }
          if (!api.hasFlag("metBodo")) {
            api.setFlag("metBodo");
            api.startDialog("bodoIntro");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("bodoSawFlyer")
          ) {
            api.setFlag("bodoSawFlyer");
            api.startDialog("bodoFlyer");
          } else if (
            // Layard hat Bodos Thermoskanne aus 5610 dabei — bringt sie
            // ihm zurück, bevor andere Smalltalk-Themen aufgehen.
            api.hasItem("bodoThermos") &&
            !api.hasFlag("gaveBodoThermos")
          ) {
            api.startDialog("bodoReturnThermos");
          } else if (
            // Kellerschlüssel: erst nach zurückgebrachter Thermoskanne.
            api.hasFlag("port2611Locked") &&
            !api.hasFlag("gotKellerKey") &&
            api.hasFlag("gaveBodoThermos")
          ) {
            api.startDialog("bodoKellerKey");
          } else if (
            api.hasFlag("port2611Locked") &&
            !api.hasFlag("gotKellerKey") &&
            !api.hasFlag("askedBodoKellerKey")
          ) {
            api.startDialog("bodoKellerKeyRefusal");
          } else if (
            // Akt-I-Pflichträtsel: Layard hat den Blanko-Quittungsbogen UND
            // den Trockensiegel-Abdruck — er kann Bodo überreden, das Ding
            // als „Wartungs-Schicht-B-Quittung" gegenzuzeichnen.
            api.hasItem("quittungBlankoB") &&
            api.hasItem("siegelAbdruck") &&
            !api.hasFlag("bodoSignedForTilla")
          ) {
            api.startDialog("bodoSignsTilla");
          } else if (
            api.hasFlag("knowsLotti") &&
            api.hasFlag("elevatorMaintSeen") &&
            !api.hasFlag("bodoBackAfterB3")
          ) {
            // Layard kann Bodo überzeugen, los zu gehen — aber erst, wenn
            // er einen konkreten Grund hat, ungestört an Bodos Terminal zu
            // wollen. Voraussetzung: Aufzug-Sperre (Wartung 4711) selbst
            // gesehen haben. Vorher kennt Layard zwar Lotti, hat aber kein
            // Motiv, Bodo loszuschicken.
            api.startDialog("bodoConvinceLeave");
          } else if (
            // Zweiter Anlauf: Bodo ist zurück, aber die Aufzugssperre
            // (oder ein anderes Terminal-Anliegen) ist noch offen.
            api.hasFlag("bodoBackAfterB3") &&
            !api.hasFlag("bodoBackAfterB3Twice") &&
            api.hasFlag("elevatorMaintBlocked") &&
            !api.hasFlag("elevatorMaintCleared")
          ) {
            api.startDialog("bodoConvinceLeave2");
          } else if (!api.hasFlag("talkedBodo2")) {
            api.setFlag("talkedBodo2");
            api.startDialog("bodoSmalltalk");
          } else {
            api.startDialog("bodoSmalltalk");
          }
        },
      },
      // Während Bodo weg ist: Hinweis statt Person.
      {
        id: "bodoEmptyChair",
        x: 9.1,
        y: 35.9,
        w: 22.5,
        h: 50,
        label: "Bodos leerer Sessel",
        kind: "look",
        requires: ["bodoLeftForB3"],
        hiddenWhen: ["bodoBackAfterB3Twice"],
        visible: (api) =>
          // Sichtbar während Anlauf 1 ODER während Anlauf 2.
          (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
          (api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice")),
        onUse: (api) =>
          api.showText([
            "Bodos Sessel ist leer. Die Tasse Tee dampft noch.",
            "Lotti schläft tief. Sie weiß, dass er wiederkommt.",
            "Layard nicht so ganz. Aber er hat eine Viertelstunde.",
          ]),
      },
      {
        id: "lottiSpot",
        // Katze liegt auf der Ottomane vor dem Sessel.
        x: 42.8,
        y: 58.9,
        w: 16.5,
        h: 22,
        label: "Lotti (Katze)",
        kind: "talk",
        onUse: (api) => {
          if (
            api.hasFlag("noticedTransferCode") &&
            !api.hasFlag("tookPencilStub")
          ) {
            api.showText([
              "Lotti hat etwas zwischen den Vorderpfoten — etwas Kurzes,",
              "Spitzes, Holziges. Ein Bleistiftstummel, drei Zentimeter.",
              "Sie schiebt ihn unauffällig in Layards Richtung. Sie weiß,",
              "dass er etwas zu schreiben — oder zu reiben — hat.",
              "[ Nachsehen kannst du auf dem Tisch links neben Bodos Terminal. ]",
            ]);
          } else if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Lotti rollt sich enger ein und blinzelt Layard zu.",
              "Sie hat 14 Jahre Mensch gesehen. Sie hat eine Meinung.",
              "Sie behält sie für sich.",
            ]);
          } else if (api.hasFlag("metBodo")) {
            api.startDialog("bodoLotti");
          } else {
            api.showText([
              "Auf dem Sessel: eine schwarze Katze, eingerollt auf einer Strickdecke. Sie schaut Layard nicht an. Sie weiß genau, dass er da ist.",
            ]);
          }
        },
      },
      {
        id: "bodoPhone",
        // Beiges Wandtelefon rechts oberhalb des Terminal-Tisches.
        x: 72.9,
        y: 13.9,
        w: 9,
        h: 17.2,
        label: "Wandtelefon",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein beiger Bakelit-Apparat. Hörer staubig. Bodo, von hinten: „Den hab ich seit zwölf Jahren nicht abgenommen.“",
            "„Wer was von mir will, klopft. Oder ist die Katze.“",
          ]),
      },
      // Bleistiftstummel auf dem Terminaltisch — Pickup für das
      // Akt-I-Pflichträtsel „Quittung 4317". Sichtbar erst, wenn
      // Layard den Transfer-Code im Bericht entdeckt hat (sonst ist
      // das nur Deko, die niemand braucht).
      {
        id: "bodoPencil",
        // Tisch links neben dem Terminal.
        x: 49.6,
        y: 48.1,
        w: 7,
        h: 6,
        label: "Bleistiftstummel",
        kind: "use",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookPencilStub"],
        onUse: (api) => {
          api.setFlag("tookPencilStub");
          api.addItem({
            id: "pencilStub",
            name: "Bleistiftstummel",
            description:
              "Drei Zentimeter Bleistift, Mine 2B, abgelutschtes Ende. Lag auf Bodos Tisch zwischen einem Kaffeering und Lottis Schnurrhaar. Reicht noch für eine ordentliche Reibung.",
          });
          api.showText([
            "Ein Bleistiftstummel, drei Zentimeter, Mine 2B.",
            "Bodo merkt es nicht. Lotti merkt es. Sie behält es für sich.",
            "[ Bleistiftstummel eingesteckt. ]",
          ]);
        },
      },
      {
        id: "bodoTerminal",
        // CRT-Monitor mit Tisch in der Bildmitte rechts.
        x: 53.9,
        y: 22.2,
        w: 19.5,
        h: 32,
        label: "Bodos Terminal",
        kind: "use",
        onUse: (api) => {
          const bodoAway =
            (api.hasFlag("bodoLeftForB3") &&
              !api.hasFlag("bodoBackAfterB3")) ||
            (api.hasFlag("bodoLeftForB3Twice") &&
              !api.hasFlag("bodoBackAfterB3Twice"));
          if (bodoAway) {
            // Bodo ist weg → freier Zugang, eingeloggt als bodo.
            api.openTerminal(true);
          } else if (api.hasFlag("metBodo") && !api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt langsam den Kopf.",
              "„Das ist meiner. Da kommen Sie nur dran, wenn ich Sie ranlasse.“",
              "„Und ich lass’ Sie nicht ran, solange Sie nicht wissen, mit wem Sie hier eigentlich reden.“",
            ]);
          } else if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt den Kopf, ohne aufzuschauen. „Solange ich hier sitze, sitzen Sie nicht hier. Ende.“ ",
            ]);
          } else {
            api.showText([
              "Ein altes CRT-Terminal. Bodo hat einen Blick darauf, der",
              "deutlich macht: nicht jetzt, Layard.",
            ]);
          }
        },
      },
      {
        id: "exit2612",
        // Wohnungstür rechts neben dem Telefon-/Schreibtischbereich.
        x: 83.7,
        y: 4.1,
        w: 16.3,
        h: 80,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => {
          // Wenn Bodo gerade unterwegs ist: er kommt zurück, bevor Layard
          // den Raum verlassen kann. Beide treffen sich an der Tür.
          const firstTrip =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const secondTrip =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          if (firstTrip) {
            // Bodo merkt es, wenn Layard etwas Sichtbares getan hat —
            // entweder das System aktualisiert oder die Wartungssperre
            // 4711 storniert (beides hinterlässt Spuren im Log).
            if (api.hasFlag("centralOsUpdatedBodo")) {
              // v2.3.1-Schock — der eigentliche „Caught"-Dialog dreht
              // sich um die OS-Aktualisierung.
              api.startDialog("bodoReturnsCaught");
            } else if (api.hasFlag("elevatorMaintCleared")) {
              // Layard hat NICHT aktualisiert, aber das Wartungs-Ticket
              // 4711 storniert. Eigener Pfad ohne v2.3.1-Dialog.
              api.startDialog("bodoReturnsCaughtMaint");
            } else {
              api.startDialog("bodoReturnsClean");
            }
            return;
          }
          if (secondTrip) {
            // Beim zweiten Anlauf zählt nur, ob die Aufzugssperre weg ist.
            // Hat Layard wieder nichts getan → Bodo storniert sie selbst
            // (Lösung C: garantiert keine Sackgasse).
            if (api.hasFlag("elevatorMaintCleared")) {
              api.startDialog("bodoReturnsCaught2");
            } else {
              api.startDialog("bodoReturnsSelfFix");
            }
            return;
          }
          api.goTo("hallway");
        },
      },
    ],
  },
  hallway: {
    id: "hallway",
    // Zwei Hintergrund-Varianten: vor der Sanitäter-Cutscene das saubere
    // Original, danach die Variante mit gelbem Quarantäne-Klebeband vor
    // Tür 2615. Die Aufzugs-Sperre wird ausschließlich über das Display
    // („WARTUNGSANFRAGE 4711") kommuniziert — kein Tape-Overlay mehr.
    background: (api) =>
      api.hasFlag("paramedicsCutsceneSeen") ? hallway2615SealedBg : hallwayBg,
    title: "Korridor 26 — Gebäude E67",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Der Korridor am Vormittag. Hinter einer Tür läuft ein Wasserhahn, irgendwo klappert Geschirr. Das Siegel an 2615 hängt noch."
        : "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 72.9,
        y: 18.5,
        w: 11,
        h: 75.5,
        label: "Tür 2611 (zurück in die Wohnung)",
        kind: "exit",
        onUse: (api) => api.goTo("apartment"),
      },
      // Tür 2613 — Philippes Wohnung. Bleibt jederzeit begehbar.
      {
        id: "door2613Philippe",
        x: 64.75,
        y: 26.5,
        w: 6.9,
        h: 64.5,
        label: "Tür 2613 (Philippe)",
        kind: "exit",
        onUse: (api) => {
          // Vor dem Klingeln (= vor der Resonanz-Überlastung) ist Philippe
          // unterwegs im Komplex. Er öffnet nicht.
          if (!api.hasFlag("metPhilippe")) {
            api.showText([
              "Layard klopft an 2613.",
              "Philippe ist nicht zu Hause.",
            ]);
            return;
          }
          // Pro Besuch werden die Warte-Beats und der Philippe-Hotspot
          // zurückgesetzt, damit Layard wieder mit ihm reden kann.
          api.clearFlag("wait2613Step1");
          api.clearFlag("wait2613Step2");
          api.goTo("apt2613");
        },
      },
      // Tür 2615 — wird in der Sanitäter-Cutscene aufgebrochen und
      // direkt im Anschluss mit gelbem Siegelband versiegelt. Der
      // Innenraum existiert als Szene nicht mehr — die Cutscene zeigt
      // alles, was es zu sehen gibt.
      {
        id: "door2615Sealed",
        x: 58.8,
        y: 32.5,
        w: 5.2,
        h: 47,
        label: "Tür 2615 (versiegelt)",
        kind: "look",
        requires: ["paramedicsCutsceneSeen"],
        onUse: (api) =>
          api.showText(api.hasFlag("act2Started") ? [
            "Das Siegel hängt noch. Über Nacht hat sich eine Ecke gelöst und rollt sich ein.",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“. Niemand hat es seitdem angefasst.",
          ] : [
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Niemand wird hier in absehbarer Zeit einziehen.",
          ]),
      },
      // Tür 2610 — Helka Vint. Nur Türgespräch, keine Szene.
      {
        id: "door2610Helka",
        x: 16.8,
        y: 19.8,
        w: 12.1,
        h: 74,
        label: "Tür 2610 (Helka Vint)",
        kind: "talk",
        onUse: (api) => {
          if (
            api.hasFlag("metHelka") &&
            tryPhoneRefusal(
              api,
              "askedHelkaPhone",
              "helkaPhoneRefusal",
              "helkaPhoneRefusalShort",
            )
          ) {
            return;
          }
          if (!api.hasFlag("metHelka")) {
            api.setFlag("metHelka");
            api.startDialog("helkaAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("helkaSawFlyer")
          ) {
            api.setFlag("helkaSawFlyer");
            api.startDialog("helkaFlyer");
          } else if (!api.hasFlag("talkedHelka2")) {
            api.setFlag("talkedHelka2");
            api.startDialog("helkaSmalltalk");
          } else if (!api.hasFlag("talkedHelka3")) {
            api.setFlag("talkedHelka3");
            api.startDialog("helkaSmalltalk2");
          } else if (!api.hasFlag("helkaHeideggerDone")) {
            api.startDialog("helkaHeidegger");
          } else {
            api.startDialog("helkaHeideggerShort");
          }
        },
      },
      // Tür 2612 — Bodo Marschke. Begehbare Wohnung.
      {
        id: "door2612Bodo",
        x: 30.45,
        y: 26.4,
        w: 5.8,
        h: 65.1,
        label: "Tür 2612 (Bodo Marschke)",
        kind: "exit",
        onUse: (api) => api.goTo("apt2612"),
      },
      // Tür 2614 — Ennis Korr. Nur Türgespräch.
      {
        id: "door2614Ennis",
        x: 37.2,
        y: 32.8,
        w: 4,
        h: 42.5,
        label: "Tür 2614 (Ennis Korr)",
        kind: "talk",
        onUse: (api) => {
          if (
            api.hasFlag("metEnnis") &&
            tryPhoneRefusal(
              api,
              "askedEnnisPhone",
              "ennisPhoneRefusal",
              "ennisPhoneRefusalShort",
            )
          ) {
            return;
          }
          if (!api.hasFlag("metEnnis")) {
            api.setFlag("metEnnis");
            api.startDialog("ennisAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("ennisSawFlyer")
          ) {
            api.setFlag("ennisSawFlyer");
            api.startDialog("ennisFlyer");
          } else if (api.hasFlag("ennisCracked")) {
            api.startDialog("ennisAfterFlyer");
          } else if (!api.hasFlag("talkedEnnis2")) {
            api.setFlag("talkedEnnis2");
            api.startDialog("ennisSmalltalk");
          } else {
            api.showText([
              "Layard klopft an 2614. Drinnen: ein Stuhl, der zurückgeschoben wird.",
              "Dann nichts. Ennis hat heute Nachtschicht. Oder er tut so.",
            ]);
          }
        },
      },
      {
        id: "toSector",
        x: 44.05,
        y: 34.7,
        w: 13.9,
        h: 40.4,
        label: "Aufzug",
        kind: "exit",
        // Sichtbar, solange keine aktive Wartungssperre auf dem Aufzug liegt.
        // Sobald die Sperre per `maint cancel 4711` storniert wurde
        // (elevatorMaintCleared), wird sie ignoriert und der Aufzug ist
        // wieder benutzbar.
        visible: (api) =>
          !api.hasFlag("elevatorMaintBlocked") ||
          api.hasFlag("elevatorMaintCleared"),
        onUse: (api) => api.goTo("elevator"),
      },
      // Solange Wartungssperre 4711 auf dem Aufzug liegt: er fährt nicht.
      // Layard kann an Bodos Terminal `maint cancel 4711` ausführen, sobald
      // Bodo unterwegs ist (bodoLeftForB3 && !bodoBackAfterB3).
      {
        id: "toSectorBlocked",
        x: 44.05,
        y: 34.7,
        w: 13.9,
        h: 40.4,
        label: "Aufzug (gesperrt — Wartung 4711)",
        kind: "look",
        requires: ["elevatorMaintBlocked"],
        hiddenWhen: ["elevatorMaintCleared"],
        onUse: (api) => {
          api.setFlag("elevatorMaintSeen");
          api.showText([
            "Display: „WARTUNGSANFRAGE 4711 — AUFZUG GESPERRT“.",
          ]);
        },
      },
    ],
  },
};
