import elevatorBg from "@/assets/scene-elevator.jpg";
import floor1LobbyBg from "@/assets/scene-floor1-lobby.jpg";
import passageBg from "@/assets/scene-passage.jpg";
import philippeSprite from "@/assets/npc-philippe.png";
import type { Scene } from "../types";
import { rideElevator } from "./_shared";

export const elevatorE67Scenes: Record<string, Scene> = {
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
        x: 46.63,
        y: 32.8,
        w: 6.38,
        h: 5.6,
        label: "Etage 5 — Wohnen / Dach",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor56"),
      },
      {
        id: "btn4",
        x: 46.63,
        y: 41.2,
        w: 6.38,
        h: 5.6,
        label: "Etage 4 — Korridor",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor46"),
      },
      {
        id: "btn3",
        x: 46.63,
        y: 49.7,
        w: 6.38,
        h: 5.6,
        label: "Etage 3 — Verwaltung und Versorgung",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor36"),
      },
      {
        id: "btn2",
        x: 46.63,
        y: 58.2,
        w: 6.38,
        h: 5.6,
        label: "Etage 2 — Korridor 26 (Heim)",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "hallway"),
      },
      {
        id: "btn1",
        x: 46.63,
        y: 66.9,
        w: 6.38,
        h: 5.6,
        label: "Etage 1 — Lobby",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "floor1Lobby"),
      },
      {
        // Etagen-Indikator über den Türen — kleines amber-Display.
        id: "elevatorIndicator",
        x: 19.1,
        y: 7.2,
        w: 10.13,
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
        x: 26,
        y: 18,
        w: 8.25,
        h: 17,
      },
    ],
    npcs: [
      {
        id: "philippeLobby",
        src: philippeSprite,
        x: 36.5,
        y: 28,
        w: 10.5,
        h: 56,
        alt: "Philippe wartet vor dem Tresen",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
      },
    ],
    hotspots: [
      {
        id: "philippeLobbySpot",
        x: 36.5,
        y: 30,
        w: 10.5,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        onUse: (api) => api.startDialog("philippeInLobby"),
      },
      {
        id: "lobbyDesk",
        x: 18.5,
        y: 50,
        w: 16.5,
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
        x: 25.25,
        y: 17,
        w: 9.75,
        h: 19,
        label: "Teleempfänger",
        kind: "use",
        onUse: (api) => api.openTelevision(),
      },
      {
        id: "lobbyBoard",
        x: 41,
        y: 38,
        w: 10.5,
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
        x: 59,
        y: 22,
        w: 13.5,
        h: 70,
        label: "Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
      {
        id: "lobbySectorDoor",
        x: 51.5,
        y: 35,
        w: 13.5,
        h: 50,
        label: "Sektor-Tür → E71",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "commonRoomDoor",
        // Schmale Tür links neben dem Empfangstresen (unterer Bildbereich,
        // damit es nicht mit den anderen Hotspots kollidiert).
        x: 12.5,
        y: 60,
        w: 6,
        h: 36,
        label: "Tür: Gemeinschaftsraum",
        kind: "exit",
        onUse: (api) => api.goTo("commonRoomE67"),
      },
    ],
  },
  passage: {
    id: "passage",
    background: passageBg,
    title: "Verbindungsgang E67 ↔ E71",
    intro:
      "Außenluft. Das erste Mal seit Jahren. Ein Geländer, kalter Beton, irgendwo ein Lautsprecher, der nichts sagt.",
    hotspots: [
      {
        id: "lookE67",
        x: 16.25,
        y: 35,
        w: 22.5,
        h: 50,
        label: "Wand E67 (zurück)",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "lookSky",
        x: 41,
        y: 8,
        w: 18,
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
        x: 61.25,
        y: 32,
        w: 22.5,
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
};
