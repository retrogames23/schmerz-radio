import sectorBg from "@/assets/scene-quadrant-lock.jpg";
import e71LobbyBg from "@/assets/scene-e71-lobby-v2.png";
import corridor15Bg from "@/assets/scene-corridor-15.jpg";
import elevatorE71Bg from "@/assets/scene-elevator-e71.jpg";
import room1534Bg from "@/assets/scene-room-1534.jpg";
import room1532Bg from "@/assets/scene-room-1532.jpg";
import type { Scene } from "../types";

export const sectorAct1Scenes: Record<string, Scene> = {
  sectorDoor: {
    id: "sectorDoor",
    background: sectorBg,
    title: "Quadrantenschleuse — Etage 1, E67",
    intro:
      "Eine graue Doppeltür mit Drahtglasfenstern am Ende der Lobby. Dahinter: grauer Himmel, nasser Beton. Daneben: ein Zugangsterminal. Darüber: ein Monitor mit grüner Phosphor-Schrift, der „ERROR 4567“ blinkt.",
    hotspots: [
      {
        id: "monitor",
        x: 27.5,
        y: 31,
        w: 12.5,
        h: 20,
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
        x: 30.3,
        y: 52.5,
        w: 7.5,
        h: 17,
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
          if (
            api.hasFlag("port2611Locked") &&
            !api.hasFlag("readTagescodeViaMira")
          ) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Der Code wurde verschickt — angekommen ist er nicht. Seit der",
              "Reparatur hängen Apparat und Datenport von 2611 am Leitstellen-",
              "Knoten. Die Nachricht liegt deshalb im Verteiler der Leitstelle",
              "(leitstelle.e67) und nicht in Layards Postfach.",
              api.hasFlag("knowsMiraNetAccess")
                ? "[ Passwort gibt es keines. Nur das Wartungsnetz — und daran hängt die Maschine im 46er. ]"
                : "[ Layard braucht eine andere Maschine, um an diesen Verteiler zu kommen. ]",
            ]);
            return;
          }
          // Layard kennt den Code aus der Terminal-Nachricht — er tippt ihn
          // selbst ein, statt den Spieler das Keypad bedienen zu lassen.
          api.setFlag("sectorDoorOpen");
          api.showText([
            "„Die Nachricht im Terminal hat das Datum 6.11.1997, entsprechend lautet der Tür-Code ‚06111997‘.\"",
            "Layard tippt die acht Ziffern. Die LED springt von Rot auf Grün. Ein Klacken in der Tür — die Verriegelung gibt nach.",
          ]);
        },
      },
      {
        id: "toPassage",
        x: 51,
        y: 25,
        w: 31,
        h: 52,
        label: "Quadrantenschleuse öffnen → Verbindungsgang",
        kind: "exit",
        requires: ["sectorDoorOpen"],
        onUse: (api) => {
          if (!api.hasFlag("sectorThresholdSeen")) {
            api.startCutscene("sectorThreshold");
          } else {
            api.goTo("passage");
          }
        },
      },
      // Eine reine "Beobachten"-Fläche an der Tür, sichtbar bevor Layard
      // weiß, dass es jenseits der Tür um E71 geht.
      {
        id: "doorWonder",
        x: 51,
        y: 25,
        w: 31,
        h: 52,
        label: "Tür betrachten",
        kind: "look",
        hiddenWhen: ["calledInsa2"],
        onUse: (api) =>
          api.showText([
            "Eine graue Brandschutz-Doppeltür, verriegelt. Durch das Drahtglas: Regen.",
            "Layard war noch nie hindurch. Er hat auch keinen Grund.",
            "Was hinter dieser Tür liegt, kennt er nur aus Aushängen:",
            "ein Verbindungsgang, irgendetwas weiter draußen.",
            "Er hat keinen Auftrag, der ihn jetzt nach draußen schickt.",
          ]),
      },
      {
        id: "backHallwayS",
        x: 0,
        y: 30,
        w: 20,
        h: 70,
        label: "Zurück in die Lobby",
        kind: "exit",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
    ],
  },
  e71Lobby: {
    id: "e71Lobby",
    background: e71LobbyBg,
    title: "Gebäude E71 — Empfang",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Andere Luft. Kühler. Sauberer. Vormittags klingelt irgendwo hinten ein Telefon, aus dem Seitengang kommen Schritte. Die Frau hinter dem Tresen sieht auf."
        : "Andere Luft. Kühler. Sauberer. Eine Frau hinter einem Tresen sieht auf.",
    hotspots: [
      {
        id: "receptionist",
        x: 80.5,
        y: 37,
        w: 12,
        h: 25,
        label: "Empfangsdame",
        kind: "talk",
        hiddenWhen: ["metReceptionist"],
        onUse: (api) => {
          // Ohne medizinische Maske wird Layard freundlich abgewiesen
          // und auf den Kondomautomaten in „Zum stillen Funk" verwiesen.
          if (!api.hasFlag("wearingMedMask")) {
            // Hat Layard die Maske im Inventar, setzt er sie jetzt
            // wortlos auf — die Bänder hinterm Ohr, Plastikgeruch.
            if (api.hasItem("medMask")) {
              api.setFlag("wearingMedMask");
              api.showText(
                [
                  "Layard knotet die OP-Maske hinterm Ohr fest.",
                  "Plastikgeruch, eine Spur Bier. Es genügt.",
                ],
                () => {
                  api.setFlag("metReceptionist");
                  if (api.hasFlag("reportedExit")) {
                    api.startDialog("reception");
                  } else {
                    api.startDialog("receptionUnannounced");
                  }
                },
              );
              return;
            }
            if (api.hasFlag("receptionRefusedNoMask")) {
              api.startDialog("receptionNoMaskAgain");
            } else {
              api.setFlag("receptionRefusedNoMask");
              api.startDialog("receptionNoMask");
            }
            return;
          }
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
        id: "konbiniE71Door",
        // Gläserne Tür mit Emailleschild ganz links.
        x: 2.5,
        y: 14,
        w: 9.5,
        h: 64,
        label: "Konbini E71 (Typ K-4m)",
        kind: "exit",
        onUse: (api) => api.goTo("konbiniE71"),
      },
      {
        id: "toTrakt16",
        // Offener Seitengang links der Mitte — Korridor 16 (Ambulanz & Labor).
        x: 29.5,
        y: 22,
        w: 15.5,
        h: 42,
        label: "Durchgang → Trakt 16 (Ambulanz & Labor)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ich weiß nicht, was ich dort soll. Ich habe in diesem Trakt nichts zu suchen.",
          ]),
      },
      {
        id: "directory",
        // Schwarzes Verzeichnisbrett neben der Konbini-Tür.
        x: 15,
        y: 11.5,
        w: 11.7,
        h: 46,
        label: "Hinweisschild",
        kind: "look",
        onUse: (api) =>
          api.showText([
            ">> GEBÄUDE E71 · QUADRANT 71 — GESUNDHEIT",
            ">> Korridor 15  →  Zimmer 1500–1540",
            ">> Korridor 16  →  Ambulanz & Labor",
            ">> Etagen 2–5: Wohnungen · Etage 1: Bewohnerbibliothek 1101 · Keller: Technik",
            ">> Resonanz-Hygiene in diesem Quadranten — bitte respektieren.",
          ]),
      },
      {
        id: "elevatorBack",
        x: 5,
        y: 82,
        w: 55,
        h: 18,
        label: "Ausgang Gebäude E71",
        kind: "exit",
        // Rückweg führt zurück durch die Passage nach E67.
        onUse: (api) => api.goTo("passage"),
      },
      {
        id: "toCorridor15",
        x: 48.5,
        y: 25,
        w: 14.5,
        h: 38,
        label: "Tür → Korridor 15",
        kind: "exit",
        requires: ["metReceptionist"],
        onUse: (api) => api.goTo("corridor15"),
      },
      {
        id: "e71ElevatorDoor",
        // Stahltür rechts hinter dem Tresen — Aufzug von E71.
        x: 71.6,
        y: 20,
        w: 8.6,
        h: 32,
        label: "Aufzug",
        kind: "exit",
        onUse: (api) => {
          // Ohne offizielles Schreiben (Akt II) hält die Empfangsdame Layard
          // vom Aufzug ab — der ist den Bewohnern von E71 vorbehalten.
          if (
            !api.hasItem("rechercheSchreiben") &&
            !api.hasFlag("act2LetterPickedUp")
          ) {
            api.showText([
              "Die Empfangsdame sieht auf, noch bevor Layard die Hand am Türgriff hat.",
              "„Das Büro von Herrn Stegmann befindet sich im Gang geradeaus. Der Aufzug ist für Bewohner von E71.“",
            ]);
            return;
          }
          api.goTo("elevatorE71");
        },
      },
    ],
  },
  elevatorE71: {
    id: "elevatorE71",
    background: elevatorE71Bg,
    title: "Aufzug — Gebäude E71",
    intro:
      "Eine Kabine aus gebürstetem Stahl. Rechts an der Wand ein Bedienfeld: fünf Etagen und ein Keller. Über der Tür ein rotes Segment-Display, das leise flackert.",
    hotspots: [
      ...[
        { id: "e71Btn4", x: 86.8, y: 33.6, label: "Etage 4" },
        { id: "e71Btn3", x: 86.6, y: 42.0, label: "Etage 3" },
        { id: "e71BtnK", x: 86.8, y: 68.7, label: "Keller" },
      ].map((b) => ({
        id: b.id,
        x: b.x,
        y: b.y,
        w: 4.6,
        h: 6.2,
        label: b.label,
        kind: "use" as const,
        onUse: (api: any) =>
          api.showText(["Auf dem Display steht: nicht berechtigt."]),
      })),
      {
        id: "e71Btn5",
        x: 86.1,
        y: 24.6,
        w: 4.6,
        h: 6.2,
        label: "Etage 5 — Lichtspielsaal",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => api.goTo("cinemaE71"),
      },
      {
        id: "e71Btn2",
        x: 87.0,
        y: 51.5,
        w: 4.6,
        h: 6.2,
        label: "Etage 2 — Korridor 21",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => api.goTo("corridor21"),
      },
      {
        id: "e71Btn1",
        x: 86.7,
        y: 60.4,
        w: 4.6,
        h: 6.2,
        label: "Etage 1 — Wohnkorridor 11",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => api.goTo("corridor11"),
      },
      {
        id: "e71ElevatorOut",
        x: 30,
        y: 15,
        w: 40,
        h: 78,
        label: "Zurück zum Empfang",
        kind: "exit",
        onUse: (api) => api.goTo("e71Lobby"),
      },
    ],
  },
  corridor15: {
    id: "corridor15",
    background: corridor15Bg,
    title: "Korridor 15 — Gebäude E71",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Spiegelblanker Linoleum, frisch gewischt, es riecht nach Seife. Hinter der Tür 1532 hört man gedämpft Stimmen, Sprechstunde. Rechts die Tür mit dem gelben Siegelband, unverändert."
        : "Spiegelblanker Linoleum. Eine Neonröhre flackert. Rechts an der Wand: eine Tür, schräg überklebt mit gelbem Siegelband. Am Ende des Korridors, in der Fluchtachse: eine Tür mit einem matten roten Status-Licht. Zimmer 1534. Halbrechts, schmal eingelassen: Tür 1530, einen Spalt offen — von drinnen Stimmen, jung, durcheinander.",
    hotspots: [
      {
        id: "door1530",
        // Schmale Tür halbrechts (zwischen sealedDoor1531 und door1534).
        // Liegt visuell zwischen den beiden — Klickfeld bewusst klein, damit
        // sich nichts mit dem Quarantäne-Türfeld überschneidet.
        x: 62.8,
        y: 28,
        w: 5.2,
        h: 50,
        label: "Tür 1530 — Gemeinschaftsraum",
        kind: "exit",
        onUse: (api) => {
          if (!api.hasFlag("enteredCommonRoomE71")) {
            api.setFlag("enteredCommonRoomE71");
          }
          api.goTo("commonRoomE71");
        },
      },
      {
        id: "sealedDoor1531",
        // Versiegelte Tür rechts vorne, mit gelbem Quarantäne-Band.
        x: 73.9,
        y: 16.8,
        w: 13.5,
        h: 75.2,
        label: "Tür 1531 (versiegelt)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Layard hat denselben Zettel heute schon einmal gesehen. Vor seiner eigenen Wand.",
            "Wie viele Türen hier wohl so aussehen. Wie viele in E67. Wie viele in den anderen Gebäuden.",
            "Resonanz-Überlastung. Der übliche Sammelbegriff der Sektorärztin — offiziell bau-akustisch, faktisch für alles, was zwischen den Wänden zu laut wird: Streit, Trauer, Krankmeldungen, ein Nachbar, der nicht mehr schläft. Was genau dahintersteckt, steht auf keinem der Zettel.",
            "Layard kennt niemanden, der quarantänisiert wurde. Er kennt aber auch keinen, der es nicht wäre, wenn man genau hinsähe.",
            "Vielleicht ist das hier kein Einzelfall. Vielleicht laufen Hunderte von diesen Türen still durch das System — gemeldet, abgehakt, versiegelt, vergessen. Eine Epidemie, die niemand so nennt, weil niemand sie zählt.",
            "Oder weil das Zählen selbst schon meldepflichtig wäre.",
          ]),
      },
      {
        id: "door1532",
        // Tür vorne links (Praxis Dr. Okwu).
        x: 9.7,
        y: 9.5,
        w: 12,
        h: 95,
        label: "Tür 1532 — Praxis Dr. Okwu",
        kind: "exit",
        onUse: (api) => api.goTo("room1532"),
      },
      {
        id: "door1534",
        // Tür ganz hinten in der Fluchtachse, mit rotem Status-Licht darüber.
        x: 45.6,
        y: 40.8,
        w: 9.5,
        h: 18.8,
        label: "Tür 1534 (rot beleuchtet)",
        kind: "exit",
        onUse: (api) => {
          api.goTo("room1534");
        },
      },
      {
        id: "backLobby",
        x: 22,
        y: 79.5,
        w: 53.1,
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
        x: 39.5,
        y: 28,
        w: 22.5,
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
        x: 37.1,
        y: 19.7,
        w: 22.5,
        h: 60,
        label: "Mikael Stegmann",
        kind: "talk",
        requires: ["metMikael"],
        onUse: (api) => {
          // Einmalig: Mikael deutet die nie verteilte Resonanz-Akte zu E67
          // an. Danach bleibt es bei der Schweigeszene.
          if (!api.hasFlag("heardMikaelTruth")) {
            api.startDialog("mikaelResonanzAkte");
            return;
          }
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
        x: 14.5,
        y: 20,
        w: 19.5,
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
        x: 68.1,
        y: 19.9,
        w: 19.5,
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
        x: 16.9,
        y: 84.4,
        w: 64.8,
        h: 15.3,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },
  room1532: {
    id: "room1532",
    background: room1532Bg,
    title: "Zimmer 1532 — Praxis Dr. Okwu",
    intro:
      "Ein wohnliches Sprechzimmer. Bücherregale voller Aktenordner mit Gebäudeetiketten, ein bernsteinfarbener Terminalbildschirm, eine Lederliege mit einem zusammengelegten Kissen. Hinter dem Schreibtisch sitzt eine schwarze Ärztin Anfang fünfzig in weißem Kittel, eine dampfende Tasse Tee in der Hand. Sie blickt auf, lächelt freundlich.",
    hotspots: [
      {
        id: "okwuTalk",
        // Dr. Okwu sitzt mittig hinter dem Schreibtisch.
        x: 35,
        y: 18,
        w: 21,
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
        x: 23,
        y: 42,
        w: 12,
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
        x: 54.5,
        y: 4,
        w: 28.5,
        h: 32,
        label: "Aktenordner",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Reihen von Aktenordnern, sauber nach Gebäuden beschriftet:",
            "E68 — Logistik. E69 — Wohnen. E70 — Verwaltung. E71 — Medizin.",
            "Auf einem oberen Brett, etwas verstaubt, ein einzelner Ordner: E67. Dünn. Sehr dünn.",
          ]),
      },
      {
        id: "okwuCouch",
        // Lederliege rechts.
        x: 57.5,
        y: 50,
        w: 27,
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
        x: 12.5,
        y: 4,
        w: 10.5,
        h: 94,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },
};
