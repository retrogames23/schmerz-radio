import apartmentBg from "@/assets/scene-apartment.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import philippeBg from "@/assets/scene-philippe.jpg";
import sectorBg from "@/assets/scene-sector-door.jpg";
import type { Scene } from "./types";

export const scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro:
      "Layard Worag. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Die Frequenz steht auf 102,3 — Einsamkeit. Routine.",
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
        id: "bed",
        x: 50,
        y: 60,
        w: 35,
        h: 30,
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
            "Dasselbe fahle Grün. Dieselbe Stille.",
          ]),
      },
      {
        id: "door",
        x: 86,
        y: 35,
        w: 12,
        h: 60,
        label: "Wohnungstür",
        requires: ["doorbellRang"],
        onUse: (api) => {
          if (!api.hasFlag("metPhilippe")) {
            api.setFlag("metPhilippe");
            api.goTo("philippe");
          } else {
            api.goTo("hallway");
          }
        },
      },
    ],
  },

  philippe: {
    id: "philippe",
    background: philippeBg,
    title: "Wohnung 2610 — Philippe",
    intro:
      "Philippes Wohnung riecht nach echtem Kaffee. Verboten. Im Hintergrund tragen die Sanitäter jemanden weg. Reglos. Augen offen.",
    hotspots: [
      {
        id: "philippeNpc",
        x: 0,
        y: 30,
        w: 30,
        h: 60,
        label: "Philippe",
        hiddenWhen: ["calledLeitstelle"],
        onUse: (api) => api.startDialog("philippeIntro"),
      },
      {
        id: "phone",
        x: 32,
        y: 55,
        w: 16,
        h: 16,
        label: "Telefon",
        requires: ["metPhilippe"],
        hiddenWhen: ["calledLeitstelle"],
        onUse: (api) => {
          api.setFlag("calledLeitstelle");
          api.startDialog("insa1");
        },
      },
      {
        id: "paramedics",
        x: 56,
        y: 18,
        w: 38,
        h: 70,
        label: "Sanitäter",
        requires: ["calledLeitstelle"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => {
          api.setFlag("protocolReceived");
          api.addItem({
            id: "protocol",
            name: "Einsatzprotokoll (verschlüsselt)",
            description:
              "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534.",
          });
          api.setKnowledge("resonanceTerm");
          api.setKnowledge("responsibilityE67");
          api.startDialog("paramedic");
        },
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
            "Die einzige warme Lichtquelle in E67.",
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
        requires: ["protocolReceived"],
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
        label: "Tür 2611 (zurück)",
        onUse: (api) => api.goTo("apartment"),
      },
      {
        id: "to2610",
        x: 5,
        y: 35,
        w: 22,
        h: 50,
        label: "Tür 2610 (Philippe)",
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => api.goTo("philippe"),
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
            ">> Wartungsarbeiten am Gateway gemeldet.",
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
              "Es gibt nur einen Weg: 001 anrufen — aber dafür braucht es ein Telefon.",
              "[ Geh zurück in den Flur und nutze Philippes Telefon erneut. ]",
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
          api.setFlag("ending");
          api.setEnding();
          api.goTo("elevatorEnd");
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
};