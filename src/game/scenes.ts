import apartmentBg from "@/assets/scene-apartment.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import philippeBg from "@/assets/scene-philippe.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2615Bg from "@/assets/scene-apt-2615.jpg";
import apt2615EmptyBg from "@/assets/scene-apt-2615-empty.jpg";
import sectorBg from "@/assets/scene-sector-door.jpg";
import e71LobbyBg from "@/assets/scene-e71-lobby.jpg";
import corridor15Bg from "@/assets/scene-corridor-15.jpg";
import room1534Bg from "@/assets/scene-room-1534.jpg";
import type { Scene } from "./types";

export const sceneVariants = {
  apt2615Empty: apt2615EmptyBg,
};

export const scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro:
      "Layard Worag. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6.",
    hotspots: [
      {
        id: "radio",
        x: 5,
        y: 55,
        w: 22,
        h: 18,
        label: "Schmerz-Radio",
        onUse: (api) => api.openRadio(),
      },
      {
        id: "terminal",
        x: 24,
        y: 48,
        w: 22,
        h: 22,
        label: "CentralOS Terminal",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "phoneApt",
        x: 47,
        y: 52,
        w: 14,
        h: 18,
        label: "Telefon",
        // Only available after returning from 2613 with the protocol
        requires: ["protocolReceived"],
        hiddenWhen: ["calledForCode"],
        onUse: (api) => {
          if (!api.hasFlag("calledInsa2")) {
            api.setFlag("calledInsa2");
            api.startDialog("insa2a");
          } else if (!api.hasFlag("calledStegmann")) {
            api.setFlag("calledStegmann");
            api.startDialog("stegmann");
          } else if (!api.hasFlag("calledForCode")) {
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          }
        },
      },
      {
        id: "bed",
        x: 50,
        y: 72,
        w: 30,
        h: 22,
        label: "Bett",
        onUse: (api) =>
          api.showText([
            "Ungemacht. Wie immer.",
            "Schlaf ist B2-konform: ausreichend, geschmacklos.",
          ]),
      },
      {
        id: "b2",
        x: 4,
        y: 84,
        w: 12,
        h: 14,
        label: "B2-Ration",
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
        x: 65,
        y: 18,
        w: 18,
        h: 35,
        label: "Fenster",
        onUse: (api) =>
          api.showText([
            "Hinter dem Fenster: derselbe Innenhof wie gestern.",
            "Auf dem Sims: die Solaranlage. Sie reicht für 48 Stunden Notstrom.",
            "Lange genug. So lange, hat noch nie etwas gedauert.",
          ]),
      },
      {
        id: "door",
        x: 86,
        y: 35,
        w: 12,
        h: 60,
        label: "Wohnungstür",
        // Only relevant after the doorbell rings
        requires: ["doorbellRang"],
        onUse: (api) => {
          if (!api.hasFlag("metPhilippe")) {
            // First open: meet Philippe at the door, then go with him to 2613
            api.setFlag("metPhilippe");
            api.startDialog("philippeAtDoor");
          } else if (!api.hasFlag("protocolReceived")) {
            // Still needs to handle the emergency
            api.goTo("apt2613");
          } else {
            // After protocol, going out leads to the hallway
            api.goTo("hallway");
          }
        },
      },
    ],
  },

  // The stranger's apartment, where the knocking comes from.
  // Philippe is in here together with Layard until the sanitarians arrive.
  apt2613: {
    id: "apt2613",
    background: apt2613Bg,
    title: "Wohnung 2613 — Unbekannter Bewohner",
    intro:
      "Die Tür ist nur angelehnt. Drinnen: derselbe Grundriss wie bei Layard. Charakterlos. Und das Klopfen — regelmäßig, durch die Wand.",
    hotspots: [
      {
        id: "philippeNpc",
        x: 70,
        y: 35,
        w: 22,
        h: 55,
        label: "Philippe",
        hiddenWhen: ["paramedicsArrived"],
        onUse: (api) => {
          if (!api.hasFlag("calledLeitstelle")) {
            api.startDialog("philippeIn2613");
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      {
        id: "wall",
        x: 30,
        y: 25,
        w: 30,
        h: 45,
        label: "Wand mit Klopfen",
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
      {
        id: "phone2613",
        x: 5,
        y: 50,
        w: 14,
        h: 18,
        label: "Telefon (Wandapparat)",
        requires: ["knockingHeard"],
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
        requires: ["calledLeitstelle"],
        hiddenWhen: ["paramedicsArrived"],
        onUse: (api) => {
          if (!api.hasFlag("smalltalkPhilippe")) {
            api.setFlag("smalltalkPhilippe");
            api.startDialog("philippeSmalltalk");
          } else {
            // Sanitarians arrive
            api.setFlag("paramedicsArrived");
            api.startDialog("paramedicsArrive");
          }
        },
      },
      {
        id: "patient",
        x: 40,
        y: 35,
        w: 22,
        h: 50,
        label: "Der Mann an der Wand",
        requires: ["doorBrokenOpen"],
        hiddenWhen: ["sawCatatonic"],
        onUse: (api) => {
          api.setFlag("sawCatatonic");
          api.showText([
            "Ein Mann, ausgemergelt. Fahle Haut. Hochgezogene Brauen.",
            "Er schlägt mit leblosem Gesicht rhythmisch gegen die Wand.",
            "Layard nimmt seinen Mut zusammen und schaut ihm in die Augen.",
            "Er erwartet tote, glasige Augen.",
            "Stattdessen: grüne Augen. Eine seltsame Tiefe. Klarheit.",
            "Wie ein Portal in ein mystisches Universum.",
            "Layard wird das Bild nicht mehr loswerden.",
          ]);
        },
      },
      {
        id: "paramedicsHotspot",
        x: 40,
        y: 35,
        w: 22,
        h: 50,
        label: "Sanitäter",
        requires: ["sawCatatonic"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => {
          api.setFlag("protocolReceived");
          api.addItem({
            id: "protocol",
            name: "Einsatzprotokoll (verschlüsselt)",
            description:
              "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
          });
          api.setKnowledge("responsibilityE67");
          api.startDialog("paramedic");
        },
      },
      {
        id: "goToNeighbor",
        x: 30,
        y: 25,
        w: 30,
        h: 45,
        label: "Zur aufgebrochenen Tür (2615)",
        requires: ["doorBrokenOpen"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => api.goTo("apt2615"),
      },
      {
        id: "exit2613",
        x: 88,
        y: 70,
        w: 11,
        h: 28,
        label: "Zurück in den Korridor",
        requires: ["protocolReceived"],
        onUse: (api) => api.goTo("hallway"),
      },
    ],
  },

  // The neighbor's apartment, broken open by the paramedics.
  // The catatonic man stands inside, knocking against the wall.
  apt2615: {
    id: "apt2615",
    background: apt2615Bg,
    title: "Wohnung 2615 — Aufgebrochen",
    intro:
      "Die Tür hängt schief in den Angeln. Splitter auf dem Beton. Drinnen: gleicher Grundriss, kahler. Eine Lampe flackert. Und in der Mitte: er.",
    hotspots: [
      {
        id: "patient2615",
        x: 38,
        y: 45,
        w: 22,
        h: 45,
        label: "Der Mann an der Wand",
        hiddenWhen: ["sawCatatonic"],
        onUse: (api) => {
          api.setFlag("sawCatatonic");
          api.showText([
            "Ein Mann, ausgemergelt. Fahle Haut. Hochgezogene Brauen.",
            "Er sitzt auf dem Boden, den Rücken an der Wand,",
            "und schlägt mit leblosem Gesicht rhythmisch mit der Faust dagegen.",
            "Layard nimmt seinen Mut zusammen und schaut ihm in die Augen.",
            "Er erwartet tote, glasige Augen.",
            "Stattdessen: grüne Augen. Eine seltsame Tiefe. Klarheit.",
            "Wie ein Portal in ein mystisches Universum.",
            "Layard wird das Bild nicht mehr loswerden.",
          ]);
        },
      },
      {
        id: "paramedicsHotspot2615",
        x: 15,
        y: 35,
        w: 18,
        h: 55,
        label: "Sanitäter ansprechen",
        requires: ["sawCatatonic"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => {
          api.setFlag("protocolReceived");
          api.addItem({
            id: "protocol",
            name: "Einsatzprotokoll (verschlüsselt)",
            description:
              "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
          });
          api.setKnowledge("responsibilityE67");
          api.startDialog("paramedic");
        },
      },
      {
        id: "philippe2615",
        x: 70,
        y: 35,
        w: 18,
        h: 55,
        label: "Philippe",
        hiddenWhen: ["sawCatatonic"],
        onUse: (api) => {
          api.showText([
            "Philippe steht an der Tür, die Arme verschränkt.",
            "„Sehen Sie ihn auch?“ — flüstert er.",
            "„Ich konnte nicht hinein. Ich konnte einfach nicht.“",
          ]);
        },
      },
      {
        id: "wallDetail2615",
        x: 38,
        y: 18,
        w: 24,
        h: 22,
        label: "Die Wand",
        requires: ["sawCatatonic"],
        onUse: (api) =>
          api.showText([
            "Beton. Nichts dahinter, das man hören könnte.",
            "Trotzdem schlägt er weiter. Der Rhythmus ist exakt.",
            "Genau der Rhythmus von 104,6.",
          ]),
      },
      {
        id: "exitTo2613",
        x: 0,
        y: 5,
        w: 12,
        h: 35,
        label: "Zurück nach 2613",
        onUse: (api) => api.goTo("apt2613"),
      },
    ],
  },

  // Philippe's own apartment is now used only as a small detour after Akt 1
  // is over - it can stay reachable from the hallway as a memory beat.
  philippe: {
    id: "philippe",
    background: philippeBg,
    title: "Wohnung 2610 — Philippe",
    intro:
      "Philippes Wohnung riecht nach echtem Kaffee. Verboten. Er sitzt am Fenster und schaut auf die Wand gegenüber.",
    hotspots: [
      {
        id: "philippeQuiet",
        x: 8,
        y: 30,
        w: 30,
        h: 60,
        label: "Philippe",
        onUse: (api) => api.startDialog("philippeAfter"),
      },
      {
        id: "lamp",
        x: 30,
        y: 30,
        w: 14,
        h: 25,
        label: "Lampe",
        onUse: (api) =>
          api.showText([
            "Die einzige warme Lichtquelle im Korridor.",
            "Philippe muss sie heimlich repariert haben.",
          ]),
      },
      {
        id: "exitPhilippe",
        x: 88,
        y: 70,
        w: 11,
        h: 28,
        label: "Zurück in den Flur",
        onUse: (api) => api.goTo("hallway"),
      },
    ],
  },

  hallway: {
    id: "hallway",
    background: hallwayBg,
    title: "Korridor 26 — Quadrant E67",
    intro:
      "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 70,
        y: 35,
        w: 22,
        h: 50,
        label: "Tür 2611 (zurück in die Wohnung)",
        onUse: (api) => api.goTo("apartment"),
      },
      {
        id: "to2610",
        x: 5,
        y: 35,
        w: 22,
        h: 50,
        label: "Tür 2610 (Philippe)",
        // Only meaningful after E67 is mostly done
        requires: ["calledForCode"],
        onUse: (api) => api.goTo("philippe"),
      },
      {
        id: "door2613Sealed",
        x: 28,
        y: 35,
        w: 16,
        h: 45,
        label: "Tür 2613 (versiegelt)",
        requires: ["protocolReceived"],
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Niemand wird hier in absehbarer Zeit einziehen.",
          ]),
      },
      {
        id: "toSector",
        x: 38,
        y: 30,
        w: 24,
        h: 60,
        label: "Korridor → Sektor-Tür",
        requires: ["protocolReceived"],
        onUse: (api) => api.goTo("sectorDoor"),
      },
    ],
  },

  sectorDoor: {
    id: "sectorDoor",
    background: sectorBg,
    title: "Sektor-Tür E67 / E71",
    intro:
      "Eine Tür, die Layard seit Jahren nicht passiert hat. Daneben: ein Keypad. Darüber: ein Monitor mit grüner Phosphor-Schrift, der „ERROR 4567“ blinkt.",
    hotspots: [
      {
        id: "monitor",
        x: 22,
        y: 25,
        w: 22,
        h: 18,
        label: "Status-Monitor",
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
        x: 60,
        y: 50,
        w: 18,
        h: 30,
        label: "Keypad — Code eingeben",
        onUse: (api) => {
          if (!api.hasFlag("calledForCode")) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Layard hat keinen Code. Noch nicht.",
              "Es gibt nur einen Weg: 001 anrufen.",
              "[ Geh zurück in deine Wohnung und benutze dein Telefon. ]",
            ]);
          } else {
            api.openTerminal();
          }
        },
      },
      {
        id: "elevator",
        x: 82,
        y: 30,
        w: 16,
        h: 60,
        label: "Aufzug → E71",
        requires: ["sectorDoorOpen"],
        onUse: (api) => {
          if (!api.hasFlag("feetWontMove")) {
            api.setFlag("feetWontMove");
            api.showText([
              "Layard denkt intensiv daran, einen Schritt zu machen.",
              "Aus dem Korridor. In den Aufzug. Aus E67 hinaus.",
              "Seine Füße bewegen sich nicht.",
              "Im Hinterkopf: das amber-grüne Glühen der Frequenz 104,6.",
              "Sie ist nicht mehr im Radio. Sie ist in ihm.",
              "Er zwingt das rechte Bein. Es geht. Schwer. Mechanisch.",
              "Wie eine Tür, deren Scharniere seit Jahren niemand geölt hat.",
            ]);
          } else {
            api.setFlag("elevatorTaken");
            api.goTo("e71Lobby");
          }
        },
      },
      {
        id: "backHallwayS",
        x: 0,
        y: 60,
        w: 14,
        h: 38,
        label: "Zurück in den Flur",
        onUse: (api) => api.goTo("hallway"),
      },
    ],
  },

  elevatorEnd: {
    id: "elevatorEnd",
    background: sectorBg,
    title: "Aufzug",
    hotspots: [],
  },

  e71Lobby: {
    id: "e71Lobby",
    background: e71LobbyBg,
    title: "Sektor E71 — Empfang",
    intro:
      "Der Aufzug schließt hinter Layard. Andere Luft. Kühler. Sauberer. Eine Frau hinter einem Tresen sieht auf — als hätte sie ihn erwartet.",
    hotspots: [
      {
        id: "receptionist",
        x: 70,
        y: 35,
        w: 25,
        h: 50,
        label: "Empfangsdame",
        hiddenWhen: ["metReceptionist"],
        onUse: (api) => {
          api.setFlag("metReceptionist");
          api.startDialog("reception");
        },
      },
      {
        id: "directory",
        x: 35,
        y: 30,
        w: 18,
        h: 22,
        label: "Hinweisschild",
        onUse: (api) =>
          api.showText([
            ">> SEKTOR E71 — MEDIZIN",
            ">> Korridor 15  →  Zimmer 1500–1540",
            ">> Korridor 16  →  Pathologie",
            ">> Frequenzsperre 104,6 in diesem Sektor — bitte respektieren.",
          ]),
      },
      {
        id: "elevatorBack",
        x: 0,
        y: 30,
        w: 22,
        h: 65,
        label: "Aufzug zurück nach E67",
        requires: ["heardMikaelTruth"],
        onUse: (api) => {
          api.setFlag("ending");
          api.setEnding();
        },
      },
      {
        id: "toCorridor15",
        x: 50,
        y: 50,
        w: 16,
        h: 35,
        label: "Tür → Korridor 15",
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
      "Spiegelblanker Linoleum. Drei Lichter flackern. Am Ende des Korridors: eine rote Tür. Zimmer 1534.",
    hotspots: [
      {
        id: "gurney",
        x: 6,
        y: 55,
        w: 22,
        h: 25,
        label: "Verlassene Trage",
        onUse: (api) =>
          api.showText([
            "Eine zurückgelassene Trage. Auf dem Laken: ein hellbrauner Fleck.",
            "Daneben: ein Klemmbrett. Name unleserlich. Datum: heute.",
          ]),
      },
      {
        id: "doors",
        x: 28,
        y: 30,
        w: 38,
        h: 50,
        label: "Türen 1530–1540",
        onUse: (api) =>
          api.showText([
            "1530, 1532, 1536, 1538 — alle grün. Alle leer.",
            "Nur 1534 zeigt ein gelbes Licht. Aktiv. Bewohnt.",
          ]),
      },
      {
        id: "door1534",
        x: 44,
        y: 35,
        w: 14,
        h: 50,
        label: "Tür 1534 (rot beleuchtet)",
        onUse: (api) => {
          api.setFlag("foundRoom1534");
          api.goTo("room1534");
        },
      },
      {
        id: "backLobby",
        x: 84,
        y: 70,
        w: 14,
        h: 28,
        label: "Zurück zum Empfang",
        onUse: (api) => api.goTo("e71Lobby"),
      },
    ],
  },

  room1534: {
    id: "room1534",
    background: room1534Bg,
    title: "Zimmer 1534 — Mikael Bauerfeind",
    intro:
      "Warmes Licht. Echtes Holz. Ein alter Mann unter einer dünnen Decke. Neben ihm ein kleiner Empfänger, der amber glüht — auf einer Frequenz, die nicht im Verzeichnis steht.",
    hotspots: [
      {
        id: "mikaelNpc",
        x: 18,
        y: 50,
        w: 40,
        h: 35,
        label: "Alter Mann",
        hiddenWhen: ["metMikael"],
        onUse: (api) => {
          api.setFlag("metMikael");
          api.setKnowledge("radioOrigin");
          api.setKnowledge("leitstelleListens");
          api.setKnowledge("frequencyControl");
          api.startDialog("mikael");
        },
      },
      {
        id: "nightstand",
        x: 0,
        y: 55,
        w: 18,
        h: 38,
        label: "Nachttisch / Schubladen",
        requires: ["metMikael"],
        hiddenWhen: ["tookCrystal"],
        onUse: (api) => {
          api.setFlag("tookCrystal");
          api.setFlag("readLetter");
          api.addItem({
            id: "tuningCrystal",
            name: "Bernstein-Kristall",
            description:
              "Ein handgeschliffener Quarz. Stimmt das Schmerz-Radio jenseits des offiziellen Bands.",
          });
          api.addItem({
            id: "mikaelLetter",
            name: "Brief an Insa",
            description:
              "Ein versiegelter, handbeschriebener Umschlag. Nicht über das Terminal zu öffnen.",
          });
          api.setFlag("heardMikaelTruth");
          api.startDialog("mikaelLast");
        },
      },
      {
        id: "monitor",
        x: 0,
        y: 60,
        w: 14,
        h: 18,
        label: "Medizinmonitor",
        requires: ["heardMikaelTruth"],
        onUse: (api) =>
          api.showText([
            "Eine flache Linie. Kein Alarm.",
            "Niemand hat ihn aktiviert. Niemand wird kommen.",
          ]),
      },
      {
        id: "photo",
        x: 38,
        y: 32,
        w: 12,
        h: 18,
        label: "Foto an der Wand",
        onUse: (api) =>
          api.showText([
            "Ein junges Mädchen, vielleicht zehn Jahre alt.",
            "Auf der Rückseite, in derselben Handschrift wie der Brief: „Insa, 1986“.",
          ]),
      },
      {
        id: "leaveRoom",
        x: 86,
        y: 60,
        w: 12,
        h: 35,
        label: "Zurück in den Korridor",
        requires: ["heardMikaelTruth"],
        onUse: (api) => {
          if (!api.hasFlag("insa3Called")) {
            api.setFlag("insa3Called");
            api.startDialog("insa3");
          }
          api.goTo("corridor15");
        },
      },
    ],
  },
};
