import sectorBg from "@/assets/scene-sector-door.jpg";
import e71LobbyBg from "@/assets/scene-e71-lobby.jpg";
import corridor15Bg from "@/assets/scene-corridor-15.jpg";
import room1534Bg from "@/assets/scene-room-1534.jpg";
import room1532Bg from "@/assets/scene-room-1532.jpg";
import type { Scene } from "../types";

export const sectorAct1Scenes: Record<string, Scene> = {
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
        x: 82,
        y: 5,
        w: 18,
        h: 95,
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
        x: 26,
        y: 40,
        w: 48,
        h: 12,
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
        x: 0,
        y: 5,
        w: 16,
        h: 95,
        label: "Tür 1532 — Praxis Dr. Okwu",
        kind: "exit",
        onUse: (api) => api.goTo("room1532"),
      },
      {
        id: "door1534",
        // Tür ganz hinten in der Fluchtachse, mit rotem Status-Licht darüber.
        x: 43,
        y: 40,
        w: 14,
        h: 38,
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
        kind: "talk",
        requires: ["metMikael"],
        onUse: (api) => {
          // Hidden-Frequency-Hinweis: Hat Layard schon mindestens einen
          // anderen Hinweis (Bodo oder Helka), bietet Mikael den dritten
          // — kryptisch, aber bestätigend. Ohne Vorwissen bleibt es bei
          // der bisherigen Schweigeszene.
          if (
            !api.hasFlag("mikaelHintHiddenFreqMood") &&
            (api.hasFlag("bodoHintHiddenFreqBand") ||
              api.hasFlag("helkaHintHiddenFreqStep"))
          ) {
            api.startDialog("mikaelHiddenFreq");
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
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },
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
};
