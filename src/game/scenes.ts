import apartmentBg from "@/assets/scene-apartment.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import hallway2615SealedBg from "@/assets/scene-hallway-2615-sealed.jpg";
import hallwayElevatorSealedBg from "@/assets/scene-hallway-elevator-sealed.jpg";
import hallwayElevatorAnd2615SealedBg from "@/assets/scene-hallway-elevator-and-2615-sealed.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2612BgEmpty from "@/assets/scene-apt-2612.jpg";
import apt2612BgBodo from "@/assets/scene-apt-2612-bodo.jpg";
import sectorBg from "@/assets/scene-sector-door.jpg";
import e71LobbyBg from "@/assets/scene-e71-lobby.jpg";
import corridor15Bg from "@/assets/scene-corridor-15.jpg";
import room1534Bg from "@/assets/scene-room-1534.jpg";
import elevatorBg from "@/assets/scene-elevator.jpg";
import floor1LobbyBg from "@/assets/scene-floor1-lobby.jpg";
import passageBg from "@/assets/scene-passage.jpg";
import corridor36Bg from "@/assets/scene-corridor-36.jpg";
import corridor36PhilippeBg from "@/assets/scene-corridor-36-philippe.jpg";
import corridor46Bg from "@/assets/scene-corridor-46.jpg";
import corridor56Bg from "@/assets/scene-corridor-56.jpg";
import serverRoom5610Bg from "@/assets/scene-server-room-5610.jpg";
import room1532Bg from "@/assets/scene-room-1532.jpg";
import miraSprite from "@/assets/npc-mira.png";
import philippeSprite from "@/assets/npc-philippe.png";
import commonRoomBg from "@/assets/scene-common-room.jpg";
import cafeteriaBg from "@/assets/scene-cafeteria-e67.jpg";
import aptMira4601Bg from "@/assets/scene-apt-mira-4601.jpg";
import type { GameApi, Scene, SceneId } from "./types";
import { playSound } from "@/lib/sound";

const ELEVATOR_DING = "/audio/elevator-ding.mp3";

/** Spielt das klassische Aufzug-„Ding-Dong" und wechselt danach die Szene. */
function rideElevator(api: GameApi, target: SceneId) {
  playSound(ELEVATOR_DING, 0.7);
  // Kurze Verzögerung, damit der erste Ton noch im Aufzug zu hören ist.
  window.setTimeout(() => api.goTo(target), 350);
}

export const scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro:
      "Layard. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6 und dreh die Lautstärke voll auf.",
    hotspots: [
      {
        id: "radio",
        x: 17,
        y: 52,
        w: 9,
        h: 19,
        label: "Schmerz-Radio",
        kind: "use",
        onUse: (api) => api.openRadio(),
      },
      {
        id: "terminal",
        x: 23,
        y: 38,
        w: 18,
        h: 28,
        label: "CentralOS Terminal",
        kind: "use",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "phoneApt",
        x: 81,
        y: 30,
        w: 9,
        h: 25,
        label: "Telefon",
        kind: "use",
        // Only available after Layard saw the empty office on floor 3.
        requires: ["sawEmptyOffice"],
        hiddenWhen: ["calledInsaAfterE71"],
        onUse: (api) => {
          // Höchste Priorität: Layard ist aus E71 zurück und hat das
          // abgelehnte Protokoll noch in der Tasche → Insa anrufen.
          if (
            api.hasFlag("mikaelRejectedProtocol") &&
            !api.hasFlag("calledInsaAfterE71")
          ) {
            api.setFlag("calledInsaAfterE71");
            api.setFlag("insaInvitedToDispatch");
            api.startDialog("insaAct2Return");
          } else if (!api.hasFlag("calledInsa2")) {
            api.setFlag("calledInsa2");
            api.startDialog("insa2a");
          } else if (
            api.hasFlag("tappedNode5610") &&
            !api.hasFlag("calledForCode")
          ) {
            // Layard war im Serverraum 5610 und hat »tap« ausgeführt.
            // Jetzt ruft er Insa zurück → sie hält ihr Versprechen und
            // legt ihm die Code-Mail (Datum 06.11.1997) ins Postfach.
            // Pflicht: Layard muss die Tilla-Frage geklärt haben (Transferbogen
            // aus der Rohrpost). Sonst bricht Insa ab.
            if (!api.hasFlag("receivedTillaTransfer")) {
              api.startDialog("insaWaitingForTransfer");
              return;
            }
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          } else if (
            api.hasFlag("calledStegmann") &&
            api.hasFlag("centralOsUpdated") &&
            api.hasFlag("troubleReported") &&
            api.hasFlag("reportedExit") &&
            !api.hasFlag("calledForCode")
          ) {
            // Standardweg: Layard hat brav gemeldet → direkt zum Code.
            if (!api.hasFlag("receivedTillaTransfer")) {
              api.startDialog("insaWaitingForTransfer");
              return;
            }
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          } else if (
            api.hasFlag("insaSentTo5610") &&
            !api.hasFlag("tappedNode5610")
          ) {
            // Insa hat den Auftrag schon erteilt, aber Layard war noch
            // nicht am Knoten. Kurzer Reminder statt voller Vermittlung.
            api.startDialog("insaReminder5610");
          } else {
            // Alle anderen Fälle laufen über die Vermittlung Insa,
            // die je nach Anliegen weiterverbindet bzw. den Ausgang
            // anmahnt, bevor sie den Code freigibt.
            api.startDialog("insaDispatch");
          }
        },
      },
      {
        id: "bed",
        x: 38,
        y: 50,
        w: 27,
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
        id: "b2",
        x: 23,
        y: 73,
        w: 21,
        h: 22,
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
        id: "window",
        // Fenster mit grünem Schein, Bildmitte etwas nach rechts.
        x: 51,
        y: 18,
        w: 17,
        h: 37,
        label: "Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Hinter dem Fenster: derselbe Innenhof wie gestern.",
            "Auf dem Sims: die Solaranlage. Sie reicht für 48 Stunden Notstrom.",
            "Lange genug. So lange, hat noch nie etwas gedauert.",
          ]),
      },
      {
        id: "door",
        x: 92,
        y: 4,
        w: 8,
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

  // Philippe's own apartment (2613). Akt 1: das Klopfen aus der
  // Nachbarwohnung 2615 ist hier hörbar; Philippe steht daneben.
  // Nach den Sanitätern bleibt 2613 bewohnt — Layard kann jederzeit
  // zurückkommen und mit Philippe verschiedene Dialoge führen.
  apt2613: {
    id: "apt2613",
    background: apt2613Bg,
    title: "Wohnung 2613 — Philippe",
    intro:
      "Philippes Wohnung. Derselbe Grundriss wie bei Layard, etwas wärmer. Es riecht nach echtem Kaffee. An der Wand zur Nachbarwohnung 2615 ist das regelmäßige Klopfen zu hören.",
    hotspots: [
      {
        id: "philippeNpc",
        // Philippe steht rechts mit verschränkten Armen.
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        kind: "talk",
        requires: ["knockingHeard"],
        // Nach dem ersten "Warten"-Klick verschwindet der Dialog-Hotspot.
        // Er kommt erst wieder, wenn Layard die Wohnung verlässt und neu
        // betritt (dann werden die Warte-Flags zurückgesetzt).
        hiddenWhen: ["paramedicsArrived", "wait2613Step1"],
        onUse: (api) => {
          if (!api.hasFlag("calledLeitstelle")) {
            api.setFlag("talkedPhilippe2613");
            api.startDialog("philippeIn2613");
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      // Nach den Sanitätern: Philippe bleibt in seiner Wohnung 2613.
      // Verschiedene Dialoge je nach Stand der Geschichte.
      {
        id: "philippeAfterNpc",
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        kind: "talk",
        requires: ["paramedicsArrived"],
        onUse: (api) => {
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
            // Fünf Sondierungs-Dialoge in fester Reihenfolge.
            if (!api.hasFlag("philippeProbe1")) {
              api.setFlag("philippeProbe1");
              api.startDialog("philippeProbe1");
            } else if (!api.hasFlag("philippeProbe2")) {
              api.setFlag("philippeProbe2");
              api.startDialog("philippeProbe2");
            } else if (!api.hasFlag("philippeProbe3")) {
              api.setFlag("philippeProbe3");
              api.startDialog("philippeProbe3");
            } else if (!api.hasFlag("philippeProbe4")) {
              api.setFlag("philippeProbe4");
              api.startDialog("philippeProbe4");
            } else if (!api.hasFlag("philippeProbe5")) {
              api.setFlag("philippeProbe5");
              api.startDialog("philippeProbe5");
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
        x: 60,
        y: 38,
        w: 14,
        h: 24,
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
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand mit Klopfen (zur 2615)",
        kind: "look",
        hiddenWhen: ["doorBrokenOpen"],
        onUse: (api) => {
          api.setFlag("knockingHeard");
          api.showText([
            "Klopf. Klopf. Klopf.",
            "Regelmäßig. Aber nicht mechanisch.",
            "Layard legt die Hand an den Beton. Er fühlt es im Handballen,",
            "bevor er es im Ohr hört.",
            "„Hallo?! Jemand da?“ — Das Klopfen geht im selben Rhythmus weiter.",
          ]);
        },
      },
      // Nach Akt 1: ruhige Wand zur (jetzt versiegelten) 2615.
      {
        id: "wallAfter",
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand zur 2615 (still)",
        kind: "look",
        requires: ["doorBrokenOpen"],
        onUse: (api) =>
          api.showText([
            "Die Wand ist still. Zum ersten Mal seit Wochen, sagt Philippe.",
            "Trotzdem hält Layard kurz die Hand an den Beton.",
            "Nichts. Nur sein eigener Puls.",
          ]),
      },
      {
        id: "phone2613",
        // Beiger Bakelit-Wandapparat ganz links.
        x:  0,
        y: 18,
        w: 22,
        h: 55,
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
        x: 40,
        y: 75,
        w: 24,
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
              "Layard und Philippe warten. Das Klopfen aus 2615 hat sich",
              "kein einziges Mal verändert. Kein Tempo-Wechsel, keine Pause.",
              "Philippe schaut auf seine Uhr. Sagt nichts.",
            ]);
          } else if (!api.hasFlag("wait2613Step2")) {
            api.setFlag("wait2613Step2");
            api.showText([
              "Noch ein paar Minuten. Philippe stellt zwei Tassen auf den Tisch,",
              "trinkt aber nicht. Layard auch nicht.",
              "Im Korridor: Schritte. Gleichmäßig. Schwer.",
            ]);
          } else {
            // Sanitäter sind eingetroffen — die eigentliche Bergung
            // wird beim Verlassen der Wohnung als Cutscene gespielt.
            api.setFlag("paramedicsArrived");
            api.showText([
              "Es klopft an Philippes Tür. Schwere, kontrollierte Schläge.",
              "Eine Stimme: „Sanitätsdienst Block 26. Wir sind wegen 2615 da.“",
              "Philippe nickt Layard zu. „Gehen Sie raus. Sie haben sie gerufen.“",
            ]);
          }
        },
      },
      {
        id: "exit2613",
        // Türrahmen ganz rechts (hinter Philippe).
        x: 94,
        y: 18,
        w: 6,
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

  // Philippe's own apartment is now used only as a small detour after Akt 1
  // is over - it can stay reachable from the hallway as a memory beat.
  // Bodos Wohnung (2612). Begehbar ab doorBrokenOpen.
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
    hotspots: [
      {
        id: "bodoNpc",
        // Hotspot deckt das Bodo-Sprite auf dem Sessel.
        x: 14,
        y: 36,
        w: 30,
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
        x: 2,
        y: 42,
        w: 30,
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
        x: 28,
        y: 64,
        w: 22,
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
              "Auf dem Sessel: eine grau-getigerte Katze, eingerollt auf einer Strickdecke.",
              "Sie schaut Layard nicht an. Sie weiß genau, dass er da ist.",
            ]);
          }
        },
      },
      {
        id: "bodoPhone",
        // Beiges Wandtelefon rechts oberhalb des Terminal-Tisches.
        x: 70,
        y: 24,
        w: 12,
        h: 22,
        label: "Wandtelefon",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein schwarzer Bakelit-Apparat. Hörer staubig.",
            "Bodo, von hinten: „Den hab ich seit zwölf Jahren nicht abgenommen.“",
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
        x: 36,
        y: 56,
        w: 12,
        h: 10,
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
        x: 46,
        y: 38,
        w: 26,
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
              "Bodo schüttelt den Kopf, ohne aufzuschauen.",
              "„Solange ich hier sitze, sitzen Sie nicht hier. Ende.“",
              "„Wenn ich mal weg bin, dann vielleicht. Aber dafür müssten Sie mich",
              " erst mal weg kriegen.“",
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
        // Wohnungstür ganz rechts.
        x: 80,
        y: 14,
        w: 20,
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
    // Hintergrund-Varianten:
    //  - rotes Klebeband am Aufzug, sobald Wartungssperre 4711 aktiv ist
    //    (elevatorMaintBlocked && !elevatorMaintCleared)
    //  - gelbes Siegelband an Tür 2615, sobald die Sanitäter-Cutscene
    //    gesehen wurde (paramedicsCutsceneSeen)
    //  - kombiniertes Bild, wenn beides zutrifft
    background: (api) => {
      const elevatorSealed =
        api.hasFlag("elevatorMaintBlocked") &&
        !api.hasFlag("elevatorMaintCleared");
      const apt2615Sealed = api.hasFlag("paramedicsCutsceneSeen");
      if (elevatorSealed && apt2615Sealed) return hallwayElevatorAnd2615SealedBg;
      if (elevatorSealed) return hallwayElevatorSealedBg;
      if (apt2615Sealed) return hallway2615SealedBg;
      return hallwayBg;
    },
    title: "Korridor 26 — Quadrant E67",
    intro:
      "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 79,
        y: 21,
        w: 19,
        h: 77,
        label: "Tür 2611 (zurück in die Wohnung)",
        kind: "exit",
        onUse: (api) => api.goTo("apartment"),
      },
      // Tür 2613 — Philippes Wohnung. Bleibt jederzeit begehbar.
      {
        id: "door2613Philippe",
        x: 69,
        y: 31,
        w: 8,
        h: 54,
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
        x: 62,
        y: 36,
        w: 6,
        h: 34,
        label: "Tür 2615 (versiegelt)",
        kind: "look",
        requires: ["paramedicsCutsceneSeen"],
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Niemand wird hier in absehbarer Zeit einziehen.",
          ]),
      },
      // Tür 2610 — Helka Vint. Nur Türgespräch, keine Szene.
      {
        id: "door2610Helka",
        x: 5,
        y: 20,
        w: 19,
        h: 78,
        label: "Tür 2610 (Helka Vint)",
        kind: "talk",
        onUse: (api) => {
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
          } else {
            api.showText([
              "Layard klopft. Aus der Wohnung 2610: kein Geräusch.",
              "Helka hat heute genug geredet. Mehr als in den letzten zwei Jahren.",
            ]);
          }
        },
      },
      // Tür 2612 — Bodo Marschke. Begehbare Wohnung.
      {
        id: "door2612Bodo",
        x: 25,
        y: 22,
        w: 11,
        h: 76,
        label: "Tür 2612 (Bodo Marschke)",
        kind: "exit",
        onUse: (api) => api.goTo("apt2612"),
      },
      // Tür 2614 — Ennis Korr. Nur Türgespräch.
      {
        id: "door2614Ennis",
        x: 37,
        y: 31,
        w: 6,
        h: 45,
        label: "Tür 2614 (Ennis Korr)",
        kind: "talk",
        onUse: (api) => {
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
        x: 43,
        y: 34,
        w: 17,
        h: 36,
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
        x: 43,
        y: 34,
        w: 17,
        h: 36,
        label: "Aufzug (gesperrt — Wartung 4711)",
        kind: "look",
        requires: ["elevatorMaintBlocked"],
        hiddenWhen: ["elevatorMaintCleared"],
        onUse: (api) => {
          api.setFlag("elevatorMaintSeen");
          api.showText([
            "Rotes Klebeband versperrt den Aufzug.",
            "Display: „WARTUNGSANFRAGE 4711 — AUFZUG GESPERRT“.",
          ]);
        },
      },
    ],
  },

  sectorDoor: {
    id: "sectorDoor",
    background: sectorBg,
    title: "Sektor-Tür — Etage 1, E67",
    intro:
      "Die schwere Schleusentür am Ende der Lobby. Hinter ihr: ein Verbindungsgang. Daneben: ein Keypad. Darüber: ein Monitor mit grüner Phosphor-Schrift, der „ERROR 4567“ blinkt.",
    hotspots: [
      {
        id: "monitor",
        x: 14,
        y: 30,
        w: 20,
        h: 22,
        label: "Status-Monitor",
        kind: "look",
        onUse: (api) =>
          api.showText([
            ">> CENTRALOS v2.3 — SEKTOR-GATEWAY",
            ">> ERROR 4567: Gateway-Authentifizierung fehlgeschlagen",
            ">> Wartungsfenster gemeldet — Status: bearbeitet",
            ">> Lösungspfad: Manueller Code via Leitstelle 001.",
          ]),
      },
      {
        id: "keypadCall",
        x: 16,
        y: 54,
        w: 16,
        h: 20,
        label: "Keypad — Code eingeben",
        kind: "use",
        onUse: (api) => {
          if (api.hasFlag("sectorDoorOpen")) {
            api.showText([
              "Das Keypad zeigt eine matte grüne LED.",
              "Die Tür ist bereits entriegelt.",
            ]);
            return;
          }
          if (!api.hasFlag("calledInsa2")) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Layard kennt keinen Code. Er hat hier auch nichts zu suchen —",
              "noch nicht. Er hat keinen Auftrag, der ihn hindurchschickt.",
              "[ Layard betrachtet die Tür eine Weile. Dann dreht er sich um. ]",
            ]);
            return;
          }
          if (!api.hasFlag("calledForCode")) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Layard hat noch keinen Code. Es gibt nur einen Weg: 001 anrufen.",
              "[ Geh zurück in deine Wohnung und benutze dein Telefon. ]",
            ]);
            return;
          }
          api.openKeypad();
        },
      },
      {
        id: "toPassage",
        x: 48,
        y: 26,
        w: 38,
        h: 60,
        label: "Sektor-Tür öffnen → Verbindungsgang",
        kind: "exit",
        requires: ["sectorDoorOpen"],
        onUse: (api) => {
          if (!api.hasFlag("feetWontMove")) {
            api.setFlag("feetWontMove");
            api.showText([
              "Layard denkt intensiv daran, einen Schritt zu machen.",
              "Aus der Lobby. Durch die Schleuse. Aus E67 hinaus.",
              "Seine Füße bewegen sich nicht.",
              "Im Hinterkopf: das amber-grüne Glühen der Frequenz 104,6.",
              "Sie ist nicht mehr im Radio. Sie ist in ihm.",
              "Er zwingt das rechte Bein. Es geht. Schwer. Mechanisch.",
              "Wie eine Tür, deren Scharniere seit Jahren niemand geölt hat.",
            ]);
          } else {
            api.goTo("passage");
          }
        },
      },
      // Eine reine "Beobachten"-Fläche an der Tür, sichtbar bevor Layard
      // weiß, dass es jenseits der Tür um E71 geht.
      {
        id: "doorWonder",
        x: 48,
        y: 26,
        w: 38,
        h: 60,
        label: "Tür betrachten",
        kind: "look",
        hiddenWhen: ["calledInsa2"],
        onUse: (api) =>
          api.showText([
            "Eine schwere Schleusentür, geschlossen.",
            "Layard war noch nie hindurch. Er hat auch keinen Grund.",
            "Was hinter dieser Tür liegt, kennt er nur aus Aushängen:",
            "ein Verbindungsgang, irgendetwas weiter draußen.",
            "Er hat keinen Auftrag, der ihn jetzt nach draußen schickt.",
          ]),
      },
      {
        id: "backHallwayS",
        x:  0,
        y: 35,
        w: 18,
        h: 60,
        label: "Zurück in die Lobby",
        kind: "exit",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
    ],
  },

  e71Lobby: {
    id: "e71Lobby",
    background: e71LobbyBg,
    title: "Sektor E71 — Empfang",
    intro:
      "Der Aufzug schließt hinter Layard. Andere Luft. Kühler. Sauberer. Eine Frau hinter einem Tresen sieht auf.",
    decals: [
      {
        id: "tvE71",
        kind: "television",
        // Linke Seitenwand, deutlich über dem schwarzen Brett.
        x: 6,
        y: 6,
        w: 11,
        h: 18,
      },
    ],
    hotspots: [
      {
        id: "receptionist",
        x: 70,
        y: 35,
        w: 25,
        h: 50,
        label: "Empfangsdame",
        kind: "talk",
        hiddenWhen: ["metReceptionist"],
        onUse: (api) => {
          api.setFlag("metReceptionist");
          // Wenn Layard den Übertritt brav gemeldet hat, ist sein Eintritt
          // vorgemerkt. Sonst muss er sich erklären — und sie ist skeptisch.
          if (api.hasFlag("reportedExit")) {
            api.startDialog("reception");
          } else {
            api.startDialog("receptionUnannounced");
          }
        },
      },
      {
        id: "directory",
        x: 35,
        y: 30,
        w: 18,
        h: 22,
        label: "Hinweisschild",
        kind: "look",
        onUse: (api) =>
          api.showText([
            ">> SEKTOR E71 — MEDIZIN",
            ">> Korridor 15  →  Zimmer 1500–1540",
            ">> Korridor 16  →  Pathologie",
            ">> Frequenzsperre 104,6 in diesem Sektor — bitte respektieren.",
          ]),
      },
      {
        id: "television",
        // Sichtbares Wandgerät an der linken Seitenwand, über dem
        // schwarzen Verzeichnis-Brett. Klick-Box deckt das Decal.
        x: 5,
        y: 5,
        w: 13,
        h: 20,
        label: "Teleempfänger",
        kind: "use",
        onUse: (api) => api.openTelevision(),
      },
      {
        id: "elevatorBack",
        x:  0,
        y: 30,
        w: 22,
        h: 65,
        label: "Aufzug zurück nach E67",
        kind: "exit",
        // Sobald Layard mit Mikael gesprochen hat, ist der Rückweg offen.
        requires: ["mikaelRejectedProtocol"],
        onUse: (api) => api.goTo("apartment"),
      },
      {
        id: "toCorridor15",
        x: 28,
        y: 16,
        w: 20,
        h: 50,
        label: "Tür → Korridor 15",
        kind: "exit",
        requires: ["metReceptionist"],
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },

  corridor15: {
    id: "corridor15",
    background: corridor15Bg,
    title: "Korridor 15 — Sektor E71",
    intro:
      "Spiegelblanker Linoleum. Eine Neonröhre flackert. Rechts an der Wand: eine Tür, schräg überklebt mit gelbem Siegelband. Am Ende des Korridors, in der Fluchtachse: eine Tür mit einem matten roten Status-Licht. Zimmer 1534.",
    hotspots: [
      {
        id: "sealedDoor1531",
        // Versiegelte Tür rechts vorne, mit gelbem Quarantäne-Band.
        x: 75,
        y: 15,
        w: 22,
        h: 80,
        label: "Tür 1531 (versiegelt)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Layard hat denselben Zettel heute schon einmal gesehen. Vor seiner eigenen Wand.",
            "Wie viele Türen hier wohl so aussehen. Wie viele in E67. Wie viele in den anderen Quadranten.",
            "Resonanz-Überlastung. Das ist der höfliche Name dafür, dass jemand das Schmerz-Radio zu lange aufgedreht hat. Dass jemand etwas zu deutlich gehört hat.",
            "Layard kennt niemanden, der quarantänisiert wurde. Er kennt aber auch keinen, der es nicht wäre, wenn man genau hinsähe.",
            "Vielleicht ist das hier kein Einzelfall. Vielleicht laufen Hunderte von diesen Türen still durch das System — gemeldet, abgehakt, versiegelt, vergessen. Eine Epidemie, die niemand so nennt, weil niemand sie zählt.",
            "Oder weil das Zählen selbst schon meldepflichtig wäre.",
          ]),
      },
      {
        id: "doors",
        // Übersichts-Look auf die Türenreihe im Mittelgrund.
        x: 28,
        y: 32,
        w: 42,
        h: 8,
        label: "Türen 1530–1540",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "1530, 1536 — grün. Leer.",
            "1532 — grünes Licht, ein kleines Schild: „Dr. A. Okwu — Allgemeinmedizin“.",
            "1538 — gelbes Wartelicht. Drinnen sitzt jemand, hörbar nervös.",
            "1531 — gelbes Band. Versiegelt.",
            "Nur 1534 zeigt ein rotes Licht. Aktiv. Besetzt.",
          ]),
      },
      {
        id: "door1532",
        // Tür vorne links (Praxis Dr. Okwu).
        x: 9,
        y: 18,
        w: 19,
        h: 75,
        label: "Tür 1532 — Praxis Dr. Okwu",
        kind: "exit",
        onUse: (api) => api.goTo("room1532"),
      },
      {
        id: "door1534",
        // Tür ganz hinten in der Fluchtachse, mit rotem Status-Licht darüber.
        x: 44,
        y: 38,
        w: 12,
        h: 42,
        label: "Tür 1534 (rot beleuchtet)",
        kind: "exit",
        onUse: (api) => {
          api.setFlag("foundRoom1534");
          api.goTo("room1534");
        },
      },
      {
        id: "backLobby",
        x: 0,
        y: 86,
        w: 9,
        h: 18,
        label: "Zurück zum Empfang",
        kind: "exit",
        onUse: (api) => api.goTo("e71Lobby"),
      },
    ],
  },

  room1534: {
    id: "room1534",
    background: room1534Bg,
    title: "Zimmer 1534 — Mikael Stegmann",
    intro:
      "Ein enges Büro. Beton, eine Glühbirne unter Schirm, ein vergittertes Fenster. Hinter einem Schreibtisch, der unter Aktenstapeln verschwindet: ein müder Mann Ende fünfzig. Er sieht auf, als Layard hereinkommt — ohne Erleichterung, ohne Ablehnung.",
    hotspots: [
      {
        id: "mikaelNpc",
        // Mikael sitzt mittig hinter dem Schreibtisch, halbe Bildhöhe.
        x: 36,
        y: 28,
        w: 30,
        h: 60,
        label: "Alter Mann",
        kind: "talk",
        hiddenWhen: ["metMikael"],
        onUse: (api) => {
          api.setFlag("metMikael");
          api.setFlag("mikaelRejectedProtocol");
          api.startDialog("mikaelReject");
        },
      },
      {
        id: "mikaelNpcAfter",
        x: 36,
        y: 28,
        w: 30,
        h: 60,
        label: "Mikael Stegmann",
        kind: "look",
        requires: ["metMikael"],
        onUse: (api) => {
          api.showText([
            "Mikael sieht kurz auf. Schüttelt langsam den Kopf.",
            "„Ich kann nichts annehmen, Herr Worag. Wirklich nicht.“",
            "Er deutet auf die Stapel. Es ist keine Geste. Es ist eine Erklärung.",
          ]);
        },
      },
      {
        id: "deskStacks",
        // Linke Aktenstapel-Säule auf dem Schreibtisch.
        x: 8,
        y: 30,
        w: 26,
        h: 60,
        label: "Aktenstapel",
        kind: "look",
        requires: ["metMikael"],
        onUse: (api) =>
          api.showText([
            "Manila-Mappen, Aktendeckel, Rohrpost-Hülsen. Manche von 1994.",
            "Jede einzelne mit einem roten Aufkleber: „PRIORITÄT — 24H“.",
            "Layard rechnet kurz. Er hört auf zu rechnen.",
          ]),
      },
      {
        id: "filingCabinets",
        // Aktenschränke rechts.
        x: 70,
        y: 30,
        w: 26,
        h: 60,
        label: "Aktenschränke",
        kind: "look",
        requires: ["metMikael"],
        onUse: (api) =>
          api.showText([
            "Sechs Stahlschränke, jeder mit halb offenen Schubladen.",
            "Aus den Schubladen quellen Mappen — keine geschlossen, keine sortiert.",
            "Ein einziger Etikettenstreifen ist lesbar: „E67 — Resonanz — 1996–“.",
            "Der Strich am Ende ist offen. Er ist nie weitergeschrieben worden.",
          ]),
      },
      {
        id: "leaveRoom",
        // Exit am rechten 16:9-Bildrand: bewusst über die alte 4:3-Hotspot-
        // Fläche hinausgezogen, damit der sichtbare Türbereich zuverlässig
        // anklickbar bleibt.
        x: 98,
        y: 0,
        w: 18,
        h: 100,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "right",
        requires: ["mikaelRejectedProtocol"],
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Zimmer 1532 — Praxis Dr. Adaeze Okwu (Allgemeinmedizin, E71).
  // Optionaler Side-Quest-Raum für World-Building rund um E71 und
  // die anderen Quadranten E68–E70. Dauerhaft erreichbar, sobald
  // Layard im Korridor 15 ist.
  // ───────────────────────────────────────────────────────────
  room1532: {
    id: "room1532",
    background: room1532Bg,
    title: "Zimmer 1532 — Praxis Dr. Okwu",
    intro:
      "Ein wohnliches Sprechzimmer. Bücherregale voller Aktenordner mit Quadrantenetiketten, ein bernsteinfarbener Terminalbildschirm, eine Lederliege mit einem zusammengelegten Kissen. Hinter dem Schreibtisch sitzt eine schwarze Ärztin Anfang fünfzig in weißem Kittel, eine dampfende Tasse Tee in der Hand. Sie blickt auf, lächelt freundlich.",
    hotspots: [
      {
        id: "okwuTalk",
        // Dr. Okwu sitzt mittig hinter dem Schreibtisch.
        x: 30,
        y: 18,
        w: 28,
        h: 76,
        label: "Dr. Adaeze Okwu",
        kind: "talk",
        onUse: (api) => {
          // Progressive Schichten: jeder erneute Klick öffnet die nächste
          // Ebene. Ab dem zweiten Klick werden die Folge-Dialoge freigeschaltet.
          if (!api.hasFlag("metOkwu")) {
            api.setFlag("metOkwu");
            api.startDialog("okwu1");
          } else if (!api.hasFlag("okwuLayer2")) {
            api.startDialog("okwu1");
          } else if (!api.hasFlag("okwuLayer3")) {
            api.startDialog("okwu2");
          } else if (!api.hasFlag("okwuLayer4")) {
            api.startDialog("okwu3");
          } else {
            api.startDialog("okwu4");
          }
        },
      },
      {
        id: "okwuTerminal",
        // Bernsteinfarbenes CRT-Terminal links auf dem Schreibtisch.
        x: 14,
        y: 42,
        w: 16,
        h: 26,
        label: "Patient:innen-Terminal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein bernsteinfarbenes Terminal. Auf dem Schirm laufen ruhig Datenzeilen — Wartezimmer leer, drei Termine heute, alle bestätigt.",
            "Daneben, säuberlich daneben gelegt, ein Stapel Papierformulare. Beides nebeneinander, ohne Hierarchie.",
            "„Papier ist geduldig, Terminal-Daten sind die Ruhe selbst.“ — sagt jemand hier offenbar oft.",
          ]),
      },
      {
        id: "okwuShelves",
        // Aktenordner-Regal hinter Dr. Okwu, oben rechts.
        x: 56,
        y: 4,
        w: 38,
        h: 32,
        label: "Aktenordner",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Reihen von Aktenordnern, sauber nach Quadranten beschriftet:",
            "E68 — Logistik. E69 — Wohnen. E70 — Verwaltung. E71 — Medizin.",
            "Auf einem oberen Brett, etwas verstaubt, ein einzelner Ordner: E67. Dünn. Sehr dünn.",
          ]),
      },
      {
        id: "okwuCouch",
        // Lederliege rechts.
        x: 60,
        y: 50,
        w: 36,
        h: 42,
        label: "Untersuchungsliege",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine alte Lederliege, weich vom Gebrauch. Ein zusammengelegtes Kissen darauf.",
            "Layard merkt erst beim Hinsehen, wie müde er eigentlich ist.",
          ]),
      },
      {
        id: "leaveRoom1532",
        // Türrahmen ganz links.
        x:  0,
        y: 4,
        w: 14,
        h: 94,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // E67 — Aufzug. Erreicht den Heim-Korridor (Etage 2) und drei
  // andere Etagen des Gebäudes. E71 ist NICHT per Aufzug zu
  // erreichen — dafür muss man Etage 1 → Sektor-Tür → Passage.
  // ───────────────────────────────────────────────────────────
  elevator: {
    id: "elevator",
    background: elevatorBg,
    title: "Aufzug — E67",
    intro:
      "Käfig aus Edelstahl, halb so groß wie eine Wohnung. An der rechten Seitenwand: ein Bedienfeld mit fünf Knöpfen. Über der Tür blinzelt der Etagen-Indikator.",
    hotspots: [
      // Knöpfe von oben (5) nach unten (1) — Koordinaten direkt auf dem
      // 4:3-Aufzug-Asset: jeweils Zahl + amberfarbener Knopf.
      {
        id: "btn5",
        x: 45.5,
        y: 32.8,
        w: 8.5,
        h: 5.6,
        label: "Etage 5 — Wohnen / Dach",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor56"),
      },
      {
        id: "btn4",
        x: 45.5,
        y: 41.2,
        w: 8.5,
        h: 5.6,
        label: "Etage 4 — Korridor",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor46"),
      },
      {
        id: "btn3",
        x: 45.5,
        y: 49.7,
        w: 8.5,
        h: 5.6,
        label: "Etage 3 — Verwaltung und Versorgung",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor36"),
      },
      {
        id: "btn2",
        x: 45.5,
        y: 58.2,
        w: 8.5,
        h: 5.6,
        label: "Etage 2 — Korridor 26 (Heim)",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "hallway"),
      },
      {
        id: "btn1",
        x: 45.5,
        y: 66.9,
        w: 8.5,
        h: 5.6,
        label: "Etage 1 — Lobby",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "floor1Lobby"),
      },
      {
        // Etagen-Indikator über den Türen — kleines amber-Display.
        id: "elevatorIndicator",
        x: 8.8,
        y: 7.2,
        w: 13.5,
        h: 7.8,
        label: "Etagen-Indikator",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein schmales amberfarbenes Sieben-Segment-Display.",
            "Im Moment zeigt es nur eine flackernde, halb-erloschene Ziffer.",
            "Darunter, in winziger Gravur:",
            "„E67 · 5 ETAGEN · max. 6 Personen · Anschluss E71 nur über Etage 1.“",
          ]),
      },
    ],
  },

  // Etage 1 — Lobby mit Sektor-Tür nach draußen.
  floor1Lobby: {
    id: "floor1Lobby",
    background: floor1LobbyBg,
    title: "Lobby — Etage 1, E67",
    intro:
      "Ein leerer Empfangstresen. Eine Anzeigetafel. Hinten links: der Aufzug. Rechts: die schwere Sektor-Tür.",
    decals: [
      {
        id: "tvE67",
        kind: "television",
        // Wand über dem Empfangstresen, gut sichtbar von der Mitte aus.
        x: 18,
        y: 18,
        w: 11,
        h: 17,
      },
    ],
    npcs: [
      {
        id: "philippeLobby",
        src: philippeSprite,
        x: 32,
        y: 28,
        w: 14,
        h: 56,
        alt: "Philippe wartet vor dem Tresen",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
      },
    ],
    hotspots: [
      {
        id: "philippeLobbySpot",
        x: 32,
        y: 30,
        w: 14,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        onUse: (api) => api.startDialog("philippeInLobby"),
      },
      {
        id: "lobbyDesk",
        x: 8,
        y: 50,
        w: 22,
        h: 30,
        label: "Empfangstresen (unbesetzt)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Niemand hinter dem Tresen. Eine Kaffeetasse, halb voll, kalt.",
            "Auf einem Klemmbrett: Schichtplan. Heutige Schicht: durchgestrichen.",
          ]),
      },
      {
        id: "televisionE67",
        // Wand-Teleempfänger über dem Tresen.
        x: 17,
        y: 17,
        w: 13,
        h: 19,
        label: "Teleempfänger",
        kind: "use",
        onUse: (api) => api.openTelevision(),
      },
      {
        id: "lobbyBoard",
        x: 38,
        y: 38,
        w: 14,
        h: 14,
        label: "Schwarzes Brett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Aushang: „Resonanz-Hygiene — Pflichtinformation für alle Hörer.“",
            "Aushang: „Quadrant E67 — Zuständigkeitsregelung Vertretung E71/1534.“",
            "Aushang, halb abgerissen: „… revolutionärer Umtriebe. Meldungen an 001.“",
          ]),
      },
      {
        id: "lobbyElevator",
        x: 62,
        y: 22,
        w: 18,
        h: 70,
        label: "Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
      {
        id: "lobbySectorDoor",
        x: 52,
        y: 35,
        w: 18,
        h: 50,
        label: "Sektor-Tür → E71",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "commonRoomDoor",
        // Schmale Tür links neben dem Empfangstresen (unterer Bildbereich,
        // damit es nicht mit den anderen Hotspots kollidiert).
        x: 0,
        y: 60,
        w: 8,
        h: 36,
        label: "Tür: Gemeinschaftsraum",
        kind: "exit",
        onUse: (api) => api.goTo("commonRoomE67"),
      },
    ],
  },

  // Verbindungsgang zwischen E67 und E71. Außenluft.
  passage: {
    id: "passage",
    background: passageBg,
    title: "Verbindungsgang E67 ↔ E71",
    intro:
      "Außenluft. Das erste Mal seit Jahren. Ein Geländer, kalter Beton, irgendwo ein Lautsprecher, der nichts sagt.",
    hotspots: [
      {
        id: "lookE67",
        x: 5,
        y: 35,
        w: 30,
        h: 50,
        label: "Wand E67 (zurück)",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "lookSky",
        x: 38,
        y: 8,
        w: 24,
        h: 22,
        label: "Himmel",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Grau. Niedrig. Kein Vogel.",
            "Trotzdem: Luft, die sich bewegt. Auf Layards Wange ein Frösteln.",
            "Etwas, das er aus dem Schmerz-Radio nicht kennt.",
          ]),
      },
      {
        id: "toE71",
        x: 65,
        y: 32,
        w: 30,
        h: 60,
        label: "Eingang E71 →",
        kind: "exit",
        onUse: (api) => {
          api.setFlag("elevatorTaken");
          api.setFlag("enteredE71");
          api.goTo("e71Lobby");
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Etage 3 — Verwaltungsetage. Hier ist das Büro des
  // Abschnittsverantwortlichen E67 (Tür 3601). Heute leer.
  // ───────────────────────────────────────────────────────────
  corridor36: {
    id: "corridor36",
    background: (api) =>
      api.getPhilippeFloor() === 3 &&
      !api.hasFlag("doorbellRang") &&
      !api.hasFlag("metPhilippeBefore")
        ? corridor36PhilippeBg
        : corridor36Bg,
    title: "Korridor 36 — Verwaltung und Versorgung",
    intro:
      "Andere Beleuchtung als zuhause. Sterilere Türen. Vor einer davon — 3601 — ein handgeschriebenes Schild. Aus 3602 zieht warm und ranzig ein Geruch nach Mensa-Pampe und Bohnerwachs.",
    npcs: [],
    hotspots: [
      {
        id: "philippeSpot36",
        x: 63,
        y: 36,
        w: 10,
        h: 50,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 3,
        onUse: (api) => api.startDialog("philippeInCorridor36"),
      },
      {
        id: "officeDoor",
        x: 50,
        y: 24,
        w: 15,
        h: 64,
        label: "Tür 3601 — Abschnittsverantwortlicher E67",
        kind: "talk",
        onUse: (api) => {
          api.setFlag("sawEmptyOffice");
          api.startDialog("emptyOfficeSign");
        },
      },
      {
        id: "cafeteriaDoor",
        x: 3,
        y: 18,
        w: 34,
        h: 74,
        label: "Tür 3602 — Kantine E67",
        kind: "exit",
        onUse: (api) => api.goTo("cafeteriaE67"),
      },
      {
        id: "officeBell",
        x: 65,
        y: 47,
        w: 4,
        h: 7,
        label: "Klingelknopf",
        kind: "use",
        requires: ["sawEmptyOffice"],
        hiddenWhen: ["rangEmptyOfficeBell"],
        onUse: (api) => {
          api.setFlag("rangEmptyOfficeBell");
          api.startDialog("emptyOfficeBell");
        },
      },
      {
        id: "back36",
        x: 73,
        y: 18,
        w: 22,
        h: 74,
        label: "Zurück zum Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },

  corridor46: {
    id: "corridor46",
    background: corridor46Bg,
    title: "Korridor 46 — Wohnetage",
    intro:
      "Wie zuhause, nur eine Etage höher. Ein Plakat „RESONANZ-HYGIENE“ blättert ab.",
    npcs: [
      {
        id: "miraSprite46",
        src: miraSprite,
        x: 20,
        y: 28,
        w: 24,
        h: 70,
        alt: "Junge Frau, an die Wand gelehnt",
        visible: (api) => api.getMiraFloors().includes(4),
      },
      {
        id: "philippeSprite46",
        src: philippeSprite,
        x: 50,
        y: 36,
        w: 12,
        h: 54,
        alt: "Philippe vor dem Plakat",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) =>
          api.getPhilippeFloor() === 4 && !api.getMiraFloors().includes(4),
      },
    ],
    hotspots: [
      {
        id: "philippeSpot46",
        x: 50,
        y: 36,
        w: 12,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) =>
          api.getPhilippeFloor() === 4 && !api.getMiraFloors().includes(4),
        onUse: (api) => api.startDialog("philippeInCorridor46"),
      },
      {
        id: "miraSpot46",
        x: 22,
        y: 41,
        w: 14,
        h: 55,
        label: "Junge Frau an der Wand",
        kind: "talk",
        visible: (api) => api.getMiraFloors().includes(4),
        onUse: (api) => {
          if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("miraTrustEarned") &&
            !api.hasFlag("miraTrustWithheld")
          ) {
            api.startDialog("miraTrustProbe");
          } else if (api.hasFlag("tookFlyer")) {
            api.startDialog("miraAfter");
          } else if (api.hasFlag("miraSystemic")) {
            api.startDialog("miraSystemicGreeting");
          } else if (api.hasFlag("metMira")) {
            api.startDialog("miraReturn");
          } else {
            api.setFlag("metMira");
            api.startDialog("miraIntro");
          }
        },
      },
      {
        id: "poster46",
        x: 31,
        y: 22,
        w: 16,
        h: 40,
        label: "Plakat „Resonanz-Hygiene“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "„HÖREN HEISST GEHÖREN.“",
            "Darunter, kleiner: „104,6 — Ihre Frequenz. Ihre Verantwortung.“",
            "Jemand hat mit Bleistift dazugeschrieben: „und ihr Käfig.“",
          ]),
      },
      {
        id: "door4601Look",
        x: 11,
        y: 18,
        w: 13,
        h: 64,
        label: "Tür 4601",
        kind: "look",
        hiddenWhen: ["miraTrustEarned"],
        onUse: (api) =>
          api.showText([
            "Tür 4601. Kein Schild. Verkratzter Lack.",
            "Auf Brusthöhe ein winziger Aufkleber: ein durchgestrichenes Ohr.",
          ]),
      },
      {
        id: "door4601Enter",
        x: 11,
        y: 18,
        w: 13,
        h: 64,
        label: "Tür 4601 — Mira",
        kind: "exit",
        requires: ["miraTrustEarned"],
        onUse: (api) => api.goTo("aptMira4601"),
      },
      {
        id: "door4602Look",
        x: 84,
        y: 22,
        w: 14,
        h: 66,
        label: "Tür 4602",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Tür 4602. Verschlossen. Hinter der Tür: leises Radiorauschen, keine Stimme.",
          ]),
      },
      {
        id: "door4603Look",
        x: 56,
        y: 32,
        w: 8,
        h: 38,
        label: "Tür 4603",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Tür 4603. Verschlossen. Auf dem Boden davor: ein vertrocknetes Stück Brot.",
          ]),
      },
      {
        id: "back46",
        x: 10,
        y: 92,
        w: 80,
        h: 7,
        label: "Zurück zum Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },

  corridor56: {
    id: "corridor56",
    background: corridor56Bg,
    title: "Korridor 56 — Dachetage",
    intro:
      "Oben. Am Ende des Korridors: ein vergittertes Fenster auf einen grauen Himmel.",
    npcs: [
      {
        id: "philippeSprite56",
        src: philippeSprite,
        x: 66,
        y: 34,
        w: 14,
        h: 54,
        alt: "Philippe am Ende des Korridors",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 5,
      },
    ],
    hotspots: [
      {
        id: "philippeSpot56",
        x: 66,
        y: 36,
        w: 14,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 5,
        onUse: (api) => api.startDialog("philippeInCorridor56"),
      },
      {
        id: "window56",
        x: 42,
        y: 30,
        w: 18,
        h: 30,
        label: "Vergittertes Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Hinter den Gitterstäben: Dächer. Antennenwald. Eine Möwe.",
            "Darunter, in den Beton geritzt: „Z.K.S. war hier.“",
          ]),
      },
      {
        id: "hatch56",
        x: 50,
        y: 6,
        w: 14,
        h: 10,
        label: "Wartungsluke (verriegelt)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Schwere Stahlluke, mit zwei Riegeln und einem Schloss gesichert.",
            "Layard rüttelt nicht einmal. Er weiß, was er nicht öffnet.",
          ]),
      },
      // ─────────────────────────────────────────────────────────
      // Tür 5610 — Serverraum hinter Korridor 56.
      // Sichtbar nur, wenn eine der drei Motivations-Spuren erfüllt ist:
      //   (a) Mira-Hint: tookFlyer
      //   (b) Schmerz-Radio aktiv (104,6)
      //   (c) Mindestens 3 Philippe-Sonden gelesen
      //   (d) Insa hat Layard explizit dorthin geschickt (Pflicht-Pfad)
      // Öffnet sich ohne Keypad — drei narrative Wege:
      //   (1) Insa-Pflicht-Pfad → "serverRoom5610OverrideArmed"
      //       (Insa schaltet die Magnetriegel aus der Leitstelle frei).
      //   (2) Layard hat eine Wartungskarte (Item "wartungsnotiz5610",
      //       intern weiterhin so heißend; vergeben aus Bodo-/Mira-/
      //       Philippe-Spur).
      //   (3) Andernfalls bleibt die Tür zu — Hinweis-Text.
      // Nach dem Öffnen führt der Hotspot direkt in den Raum.
      // ─────────────────────────────────────────────────────────
      {
        id: "door5610",
        x: 8,
        y: 16,
        w: 16,
        h: 74,
        label: "Tür 5610 · Technik",
        kind: "exit",
        visible: (api) => {
          if (api.hasFlag("serverRoom5610Open")) return true;
          if (api.hasFlag("insaSentTo5610")) return true;
          const probeCount =
            (api.hasFlag("philippeProbeNote1") ? 1 : 0) +
            (api.hasFlag("philippeProbeNote2") ? 1 : 0) +
            (api.hasFlag("philippeProbeNote3") ? 1 : 0) +
            (api.hasFlag("philippeProbeNote4") ? 1 : 0) +
            (api.hasFlag("philippeProbeNote5") ? 1 : 0);
          return (
            api.hasFlag("tookFlyer") ||
            api.isRadioActive() ||
            probeCount >= 3
          );
        },
        onUse: (api) => {
          if (api.hasFlag("serverRoom5610Open")) {
            api.goTo("serverRoom5610");
            return;
          }
          // (1) Insa hat den Wartungs-Override scharfgeschaltet.
          if (api.hasFlag("serverRoom5610OverrideArmed")) {
            api.setFlag("serverRoom5610Open");
            api.setFlag("saw5610Door");
            api.showText(
              [
                "Layard tritt an die Tür. Das blaue Wartungs-LED",
                "schaltet auf Grün — von ganz alleine.",
                "Ein dumpfes Klacken in der Wand: die Magnetriegel geben nach.",
                "Insa hat Wort gehalten.",
                "Hinter der Tür: kein Korridor. Ein Raum.",
              ],
              () => api.goTo("serverRoom5610"),
            );
            return;
          }
          // (2) Wartungskarte im Inventar (Bodo / Mira / Philippe-Spur).
          if (api.hasItem("wartungsnotiz5610")) {
            api.setFlag("serverRoom5610Open");
            api.setFlag("saw5610Door");
            api.showText(
              [
                "Layard hält die abgegriffene Wartungskarte an den Leser.",
                "Ein kurzes Surren. Das blaue LED schaltet auf Grün.",
                "Klacken im Schloss. Die Magnetriegel geben nach.",
                "Hinter der Tür: kein Korridor. Ein Raum.",
              ],
              () => api.goTo("serverRoom5610"),
            );
            return;
          }
          // (3) Erstkontakt ohne Berechtigung — nur Beschreibung.
          if (!api.hasFlag("saw5610Door")) {
            api.setFlag("saw5610Door");
            api.showText([
              "Eine Stahltür, schmal, in die Wand eingelassen.",
              "Schild: »5610 · Technik · Kein Zutritt«.",
              api.isRadioActive()
                ? "Hier ist das Brummen am lautesten. Das Signal kommt von hinter dieser Tür."
                : "Kein Keypad — nur ein flacher Kartenleser und ein blaues",
              "Wartungs-LED, das ruhig blinkt. Ohne Wartungskarte",
              "oder Freigabe der Leitstelle bleibt die Tür zu.",
            ]);
          } else {
            api.showText([
              "Die Tür gibt nicht nach. Der Kartenleser blinkt blau.",
              "Ohne Wartungskarte oder Freigabe der Leitstelle bleibt sie zu.",
            ]);
          }
        },
      },
      {
        id: "back56",
        x: 80,
        y: 30,
        w: 18,
        h: 60,
        label: "Zurück zum Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Serverraum hinter Tür 5610 — lokaler Resonanz-Knoten von E67.
  // ───────────────────────────────────────────────────────────
  serverRoom5610: {
    id: "serverRoom5610",
    background: serverRoom5610Bg,
    title: "Serverraum 5610 — Knoten E67",
    intro:
      "Drei Racks, blinkende LEDs, der Geruch von heißem Lötzinn. In der Ecke: ein einzelnes Wartungsterminal. Hier laufen die Resonanz-Pakete von E67 zusammen, bevor sie an die Leitstelle gehen.",
    hotspots: [
      {
        id: "nodeTerminal5610",
        x: 70,
        y: 45,
        w: 26,
        h: 40,
        label: "Wartungsterminal",
        kind: "use",
        onUse: (api) => api.openNode5610(),
      },
      {
        id: "racks5610",
        x: 18,
        y: 25,
        w: 38,
        h: 60,
        label: "Racks (warm)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei Racks, dicht an dicht. Die LEDs flackern im Takt von 104,6.",
            "Layard hält die Hand kurz an das Gehäuse — es ist warm.",
            "Wärme von etwas, das ohne Pause arbeitet.",
          ]),
      },
      {
        id: "exit5610",
        x:  0,
        y: 50,
        w: 14,
        h: 50,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor56"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Gemeinschaftsraum E67 — drei Jugendliche spielen DSA 2.
  // ───────────────────────────────────────────────────────────
  commonRoomE67: {
    id: "commonRoomE67",
    background: commonRoomBg,
    title: "Gemeinschaftsraum — Erdgeschoss, E67",
    intro:
      "Warmes Lampenlicht über einem viel zu großen Tisch. Würfel, ein aufgeschlagenes Regelwerk, ein Plan auf Karopapier. Drei Jugendliche schauen auf, als die Tür aufgeht.",
    // NPCs sind direkt ins Hintergrundbild gemalt (keine Sprites).
    hotspots: [
      {
        id: "tableSeat",
        // Der freie Stuhl links im Vordergrund (mit Lehne).
        // Stage 1024×640 zeigt 16:9-Bild via object-cover: sichtbar
        // sind ~5.4 %..94.6 % der Original-Bildbreite. Alle Werte sind
        // bereits in Stage-% angegeben.
        x:  0,
        y: 62,
        w: 13,
        h: 38,
        label: (() => "Freier Stuhl am Tisch")(),
        kind: "use",
        onUse: (api) => {
          api.setFlag("enteredCommonRoom");
          api.setFlag("metRpgGroup");
          if (!api.getDsaCharacter()) {
            api.openDsaCreator();
          } else if (api.hasFlag("dsaCampaignFinished")) {
            api.showText([
              "Tjark klappt das Buch zu. „Das war's für heute. Gute Runde.“",
              "Brem reckt sich, Yelva sammelt die Würfel ein.",
              "Ein anderes Mal vielleicht weiter.",
            ]);
          } else {
            api.openDsaAdventure();
          }
        },
      },
      {
        id: "tjarkSpot",
        // Tjark (schwarze Haare, Brille) hinten Mitte-Rechts hinter dem GM-Schirm.
        x: 66,
        y: 4,
        w: 20,
        h: 54,
        label: "Tjark (Meister)",
        kind: "talk",
        onUse: (api) => api.startDialog("tjarkSmalltalk"),
      },
      {
        id: "yelvaSpot",
        // Yelva (grünes Kleid, Brille) sitzt rechts am Tisch.
        x: 84,
        y: 38,
        w: 16,
        h: 58,
        label: "Yelva (Elfe)",
        kind: "talk",
        onUse: (api) =>
          api.showText([
            "Yelva mustert dich kurz, dann das Regelwerk.",
            "„Wenn du dich setzt, würfelst du erstmal sieben Eigenschaften. 1W6 plus 7.“",
          ]),
      },
      {
        id: "bremSpot",
        // Brem (rote Haare, rot-schwarz gestreift) steht links am Tisch.
        x: 13,
        y: 12,
        w: 22,
        h: 78,
        label: "Brem (Streuner)",
        kind: "talk",
        onUse: (api) =>
          api.showText([
            "Brem grinst schief.",
            "„Bloß keinen Magier. Magier sind langweilig.“",
          ]),
      },
      {
        id: "rulebook",
        // Aufgeschlagenes DSA-Regelwerk auf dem Tisch (links unten).
        x: 24,
        y: 64,
        w: 22,
        h: 16,
        label: "DSA-Regelwerk",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "„Das Schwarze Auge“, zweite Edition. Eselsohren, Kaffeeflecken,",
            "mit Bleistift annotiert: „Praxisregel — KEINE Charaktertode in der Anreise.“",
          ]),
      },
      {
        id: "exitCommon",
        // Schmaler Streifen am linken Bildrand (Tür außerhalb des Bildes).
        x:  0,
        y: 0,
        w: 4,
        h: 100,
        label: "Zurück in die Lobby",
        kind: "exit",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Kantine 3602 — Nährstoffausgabe E67
  // Zwei Mitarbeiter:innen hinter der Theke (Kowalk & Brust),
  // wechselseitiges Hintergrund-Geplauder (FloatingChatter "cafeteria").
  // ───────────────────────────────────────────────────────────
  cafeteriaE67: {
    id: "cafeteriaE67",
    background: cafeteriaBg,
    title: "Kantine 3602 — Nährstoffausgabe E67",
    intro:
      "Hinter der Theke zwei Kittel. Auf dem Boden ein Streifen, der einmal weiß war, jetzt eine Spur Anstellen markiert. Im Rohr über dem Tresen blinkt rot ein Licht, das niemand quittiert.",
    hotspots: [
      {
        id: "kowalkSpot",
        x: 13,
        y: 45,
        w: 14,
        h: 50,
        label: "Frau Kowalk",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metKowalk")) {
            api.setFlag("metKowalk");
          }
          api.startDialog("cafeteriaKowalk");
        },
      },
      {
        id: "brustSpot",
        x: 77,
        y: 42,
        w: 14,
        h: 50,
        label: "Herr Brust",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metBrust")) {
            api.setFlag("metBrust");
          }
          api.startDialog("cafeteriaBrust");
        },
      },
      {
        id: "cafeteriaCounter",
        x: 36,
        y: 56,
        w: 22,
        h: 16,
        label: "Ausgabetheke",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein gestempeltes Schild auf dem Tresen:",
            "„AUSGABE NUR MIT BEWOHNER-AUSWEIS ODER GEGENGEZEICHNETER VOLLMACHT.“",
            "Daneben ein zweites Schild, gelber:",
            "„AUSNAHMEN AUF KULANZ — Schicht B / Frau Kowalk.“",
          ]),
      },
      // Quittungsblock — Layard kann sich einen Blanko-Bogen nehmen,
      // sobald er gemerkt hat, dass 4317 ein Transfer-Code ist.
      // Brust und Kowalk sehen geflissentlich weg: Quittungsblöcke
      // gelten als Verbrauchsmaterial.
      {
        id: "cafeteriaQuittungsblock",
        // Auf dem Tresen, rechts neben dem Schild.
        x: 56,
        y: 56,
        w: 16,
        h: 14,
        label: "Quittungsblock Schicht B",
        kind: "use",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookQuittungBlanko"],
        onUse: (api) => {
          api.setFlag("tookQuittungBlanko");
          api.addItem({
            id: "quittungBlankoB",
            name: "Quittungsbogen Schicht B (blanko)",
            description:
              "Ein dünner, hellblauer Carbon-Quittungsbogen, oben perforiert. Trägt vorgedruckt: »QUITTUNG / SCHICHT __ / KOPIE FÜR E70«. Zwei Felder warten leer: Code und Schicht-Gegenzeichnung.",
          });
          api.showText([
            "Layard zieht einen Bogen vom Quittungsblock ab — der oberste,",
            "dünn und hellblau, perforiert. Brust steht zwei Meter weiter und",
            "sieht weg. Kowalk auch. Quittungsbögen kosten nichts.",
            "[ Quittungsbogen Schicht B (blanko) eingesteckt. ]",
          ]);
        },
      },
      {
        id: "cafeteriaPneumaticTube",
        x: 38,
        y: 14,
        w: 14,
        h: 18,
        label: "Pneumatik-Rohrpost",
        kind: (() => "use" as const)(),
        onUse: (api) => {
          // Sobald Layard die gefälschte Quittung schon abgeschickt hat,
          // bringt das Rohr die eingehende Antwort: Tillas Transferbogen.
          if (
            api.hasFlag("sentForgedQuittung") &&
            !api.hasFlag("receivedTillaTransfer")
          ) {
            api.setFlag("receivedTillaTransfer");
            api.addItem({
              id: "tillaTransfer",
              name: "Transferbogen E70-K → 70-2244",
              description:
                "Eingehende Rohrpost-Hülse, beantwortet eine Quittung 4317-K. Inhalt: ein Transferbogen — Patientin Tilla Kowalk, von E70-K verlegt an Heim Lothenau, neue Bewohnernummer 70-2244. Stempel »ÜBERFÜHRUNG STILL«. Datum 06.11.1997.",
            });
            api.showText([
              "Im Rohr klackt es. Eine Hülse landet im Auffangkorb.",
              "Aufkleber: »EINGANG · QUITTUNG 4317-K · BEANTWORTET«.",
              "Drinnen: ein Transferbogen. Eine Bewohnernummer. Ein Heim.",
              "Tilla.",
              "[ Transferbogen 70-2244 eingesteckt. ]",
            ]);
            return;
          }
          // Vor der Fälschung: das Overlay öffnet sich nur, wenn Layard
          // wirklich versuchen kann, etwas zu verschicken (Trigger gesetzt).
          // Sonst nur der alte Beobachtungs-Text.
          if (
            !api.hasFlag("noticedTransferCode") ||
            !api.hasFlag("forgedQuittung4317")
          ) {
            api.showText(
            api.hasFlag("radioTunedTo1046")
              ? [
                  "Messing, blank gewienert. Das Licht oben blinkt rot.",
                  "(SCHMERZ-RADIO: Hinter der Klappe atmet etwas, wie ein Mensch, der vergessen hat, wie das geht.)",
                ]
              : [
                  "Messing, blank gewienert. Das Licht oben blinkt rot.",
                  "Niemand schaut hin. Vielleicht blinkt es schon eine Weile.",
                ],
            );
            return;
          }
          api.openPneumaticTube();
        },
      },
      {
        id: "cafeteriaPosters",
        x: 60,
        y: 28,
        w: 18,
        h: 24,
        label: "Hygiene-Aushänge",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Zwei Aushänge, übereinander getackert.",
            "Oben, neu, von 1996: »Handschuhe bei jeder Ausgabe — ausnahmslos.«",
            "Darunter, von 1991, vergilbt: »Handschuhe nur bei flüssigen Rationen — sonst Geschmacksstörung.«",
            "Beide tragen das gleiche Siegel der Leitstelle.",
          ]),
      },
      {
        id: "back36FromCafeteria",
        x: 86,
        y: 70,
        w: 12,
        h: 28,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor36"),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Wohnung 4601 — Miras gehacktes Jugendzimmer.
  // Zugang nur, wenn `miraTrustEarned` gesetzt ist (siehe corridor46).
  // ───────────────────────────────────────────────────────────
  aptMira4601: {
    id: "aptMira4601",
    background: aptMira4601Bg,
    title: "Wohnung 4601 — Mira",
    intro:
      "Eng. Ein Bett, ein Schreibtisch, an der Wand mehr Plakate als Tapete. Auf dem Tisch summt ein offenes Terminal in giftigem Phosphorgrün. Ein Kabel verschwindet hinter der Wand Richtung Etagendrucker.",
    hotspots: [
      {
        id: "miraInRoom",
        x: 38,
        y: 50,
        w: 22,
        h: 38,
        label: "Mira",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("miraAtHomeMet")) {
            api.startDialog("miraAtHomeIntro");
          } else {
            api.startDialog("miraAtHomeIntro");
          }
        },
      },
      {
        id: "miraTerminal",
        x: 70,
        y: 50,
        w: 22,
        h: 30,
        label: "Miras Terminal (FuckTheSystemOS)",
        kind: "use",
        onUse: (api) => api.openTerminal({ mira: true }),
      },
      {
        id: "miraPosterLeine",
        x: 28,
        y: 22,
        w: 30,
        h: 24,
        label: "Plakat „104,6 — DEINE LEINE“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Stenciled, schwarz, schief geklebt. Darunter, klein:",
            "»eine leine ist erst dann eine, wenn man sie spürt.«",
            "Und ganz unten: Z.K.S.",
          ]),
      },
      {
        id: "miraPosterStille",
        x: 56,
        y: 36,
        w: 14,
        h: 14,
        label: "Zettel „TAG DER STILLE — bald.“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Mit roter Kreide übermalt: »bald.« Darunter, kleiner:",
            "»eine etage. eine stunde. wir merken, dass wir nicht sterben.«",
          ]),
      },
      {
        id: "miraPortraits",
        x:  0,
        y: 24,
        w: 22,
        h: 38,
        label: "Korkbrett mit Porträts",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Vier kopierte Bewohnerporträts, mit rotem Faden verbunden.",
            "Mira hat daneben mit Bleistift kleine Notizen geschrieben:",
            "»hört zu / schreibt mit / hat einen anker / weiß alles, sagt nichts«.",
          ]),
      },
      {
        id: "miraBed",
        x: 14,
        y: 64,
        w: 32,
        h: 30,
        label: "Bett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Zerwühlte Decke. Halb aufgeschlagen ein Schulbuch:",
            "»Sektor-Geographie · Klasse 10«. Am Rand mit Kuli:",
            "»E54, E72, E81 — Brieffreunde. nicht namen. nie namen.«",
          ]),
      },
      {
        id: "miraVent",
        x: 84,
        y: 6,
        w: 14,
        h: 16,
        label: "Verklebter Lüftungsschlitz",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Mit Paketband zugeklebt. Wer hier wohnt, will nicht,",
            "dass sein Zimmer mithört.",
          ]),
      },
      {
        id: "aptMiraBack",
        x:  0,
        y: 80,
        w: 14,
        h: 18,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor46"),
      },
    ],
  },
};
