import elevatorBg from "@/assets/scene-elevator.jpg";
import floor1LobbyBg from "@/assets/scene-floor1-lobby-konbini.jpg";
import floor1LobbyNoPosterBg from "@/assets/scene-floor1-lobby-noposter-konbini.jpg";
import passageBg from "@/assets/scene-passage.jpg";
import philippeSprite from "@/assets/npc-philippe.png";
import type { Scene } from "../types";
import { rideElevator } from "./_shared";

export const elevatorE67Scenes: Record<string, Scene> = {
  elevator: {
    id: "elevator",
    background: elevatorBg,
    title: "Aufzug — E67",
    intro: (api) => api.hasFlag("act2Started")
      ? "Der Käfig riecht nach dem Rasierwasser von jemandem, der eben ausgestiegen ist. Am Bedienfeld fünf Knöpfe, über der Tür der Etagen-Indikator."
      : "Käfig aus Edelstahl, halb so groß wie eine Wohnung. An der rechten Seitenwand: ein Bedienfeld mit fünf Knöpfen. Über der Tür blinzelt der Etagen-Indikator.",
    hotspots: [
      // Knöpfe von oben (5) nach unten (1) — Werte in Prozent der
      // 16:9-Bühne, rechtes Bedienfeld.
      {
        id: "btn5",
        x: 76.3,
        y: 19.6,
        w: 6.1,
        h: 5.6,
        label: "Etage 5 — Wohnen / Dach",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor56"),
      },
      {
        id: "btn4",
        x: 77,
        y: 30.1,
        w: 6.4,
        h: 5.6,
        label: "Etage 4 — Korridor",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor46"),
      },
      {
        id: "btn3",
        x: 76.7,
        y: 40.6,
        w: 6.4,
        h: 5.6,
        label: "Etage 3 — Verwaltung und Versorgung",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "corridor36"),
      },
      {
        id: "btn2",
        x: 76.3,
        y: 49.8,
        w: 6.4,
        h: 5.6,
        label: "Etage 2 — Korridor 26 (Heim)",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "hallway"),
      },
      {
        id: "btn1",
        x: 76.2,
        y: 59.6,
        w: 6.4,
        h: 5.6,
        label: "Etage 1 — Lobby",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => rideElevator(api, "floor1Lobby"),
      },
      {
        // Etagen-Indikator über den Türen — kleines amber-Display.
        id: "elevatorIndicator",
        x: 17,
        y: 6.7,
        w: 10.1,
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
      {
        // Rahmen-Aushang an der linken Wand, neben den Aufzugstüren.
        id: "elevatorAufzNV",
        x: 38.5,
        y: 30.5,
        w: 5.5,
        h: 18,
        label: "Aufzugsnutzungsverordnung",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Aufzugsnutzungsverordnung (AufzNV) — Muster-Anlage zur Hausordnung. Amt für Wohnraumfragen, gemäß Quadranten-Konvention Abschn. IV.",
            "§1 Geltungsbereich: Diese Verordnung regelt die Nutzung der Aufzugsanlage im jeweiligen Gebäude. Sie gilt für alle gemeldeten Bewohner sowie für Besucher in deren Begleitung.",
            "§2 Nutzungsberechtigung: Die Nutzung ist gestattet. Ein Anspruch auf ständige Verfügbarkeit der Anlage besteht nicht.",
            "§3 Belegung: Die höchstzulässige Personenzahl ist am Bedienfeld ausgewiesen. Bei Überschreitung ergeht keine Beförderung.",
            "§4 Ruhezeiten: Zwischen 22 und 6 Uhr ist die Nutzung auf dringende Fälle zu beschränken. Die Fälle, die als dringend gelten, sind bei der zuständigen Stelle im Amt für Bewohnerfragen einzusehen.",
            "§5 Gespräche und Lautäußerungen: Gespräche in der Kabine sind gestattet, sofern sie sich in üblicher Zimmerlautstärke halten. Auffälligkeiten wie Weinen oder Schreie im Aufzug werden im Rahmen der allgemeinen Resonanzerfassung protokolliert und behördlich ausgewertet.",
            "§6 Störungen: Bei Betriebsstörungen ist die Notrufeinrichtung zu betätigen. Ein Verbleib in der Kabine bis zum Eintreffen des zuständigen Bereitschaftsdienstes wird empfohlen, ist jedoch nicht vorgeschrieben.",
            "§7 Mitführen von Gegenständen: Das Mitführen von Transportgut ist gestattet, soweit die Belegungsgrenze nicht überschritten wird. Für Schäden an mitgeführtem Gegenstand wird keine Haftung übernommen.",
            "§8 Zuwiderhandlungen: Wiederholte Zuwiderhandlung gegen diese Verordnung wird vermerkt. Eine Sperrung der Nutzungsberechtigung ist in schweren Fällen möglich, aber nicht die Regel.",
            "§9 Änderungen: Änderungen dieser Verordnung werden durch Aushang bekanntgegeben und treten mit dem im Aushang genannten Datum in Kraft, auch wenn der Aushang nicht zur Kenntnis genommen wurde.",
          ]),
      },
      {
        // Unter Etage 1: kein Knopf, sondern ein Vierkant-Schlitz mit
        // eingraviertem „K“ — Betriebsfahrt Keller, nur für Wartung.
        id: "btnKeller",
        x: 76.6,
        y: 69.3,
        w: 6.4,
        h: 5.6,
        label: "K — Vierkant-Schlitz (Betriebsfahrt)",
        kind: "use",
        onUse: (api) => {
          if (api.hasItem("vierkantschluessel")) {
            api.showText([
              "Layard setzt Bodos Vierkantschlüssel an und dreht ihn eine",
              "Vierteldrehung nach rechts. Unter dem Schlitz glimmt ein „K“ auf.",
              "Der Käfig ruckt und fährt abwärts — an Etage 1 vorbei.",
            ]);
            api.goTo("kellerE67");
            return;
          }
          api.showText([
            "Unter dem Knopf für Etage 1 sitzt kein Knopf, sondern ein",
            "Vierkant-Schlitz. Daneben eingraviert: „K — nur Betriebsfahrt“.",
            "Ohne den passenden Schlüssel bleibt der Käfig, wo er ist.",
          ]);
        },
      },
    ],
  },
  floor1Lobby: {
    id: "floor1Lobby",
    background: (api) =>
      api.hasFlag("belegAushangAufzug") ? floor1LobbyNoPosterBg : floor1LobbyBg,
    title: "Lobby — Etage 1, E67",
    intro: (api) => api.hasFlag("act2Started")
      ? "Vormittag in der Lobby. Der Tresen ist leer wie immer. Im Konbini stehen zwei Leute an der Kasse. Hinten: die Quadrantenschleuse."
      : "Ein leerer Empfangstresen. Eine Anzeigetafel. Rechts der Aufzug, daneben hell erleuchtet die Glastür des Konbini. Hinten: die schwere Quadrantenschleuse.",
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
        x: 43.4,
        y: 44.5,
        w: 5.1,
        h: 11.8,
        label: "Schwarzes Brett",
        kind: "look",
        onUse: (api) => {
          if (api.hasFlag("belegAushangAufzug")) {
            api.showText([
              "Leerer Kork. Ein paar Reißnägel, eine abgerissene Papierecke.",
              "Der Aushang zur Resonanz-Hygiene liegt zusammengefaltet in Layards Tasche.",
            ]);
            return;
          }
          api.setFlag("sawResonanzAushang");
          const read = [
            "Aushang: „Resonanz-Hygiene — Pflichtinformation für alle Bewohner:",
            "Belegungsdichte, Lüftung, Türsiegel-Praxis. Verstöße werden erfasst.“",
            "Aushang: „Gebäude E67 — Zuständigkeitsregelung Vertretung E71/1534.“",
            "Aushang, halb abgerissen: „… revolutionärer Umtriebe. Meldungen an 001.“",
          ];
          if (api.hasFlag("miraAskedEvidence")) {
            api.startDialog("aushangLobbyTake");
            return;
          }
          api.showText(read);
        },
      },
      {
        id: "lobbyElevator",
        x: 68.5,
        y: 27.9,
        w: 9.7,
        h: 53.4,
        label: "Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
      {
        id: "traktPassageLobby",
        // Schmaler Durchgang links hinter dem Tresen — Magistrale zu den Aufgängen 1–5.
        x: 36.5,
        y: 30,
        w: 3.5,
        h: 32,
        label: "Durchgang → Trakte 1–5",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ich weiß nicht, was ich dort soll. Meine Wohnung liegt in Aufgang 6.",
          ]),
      },
      {
        id: "lobbySectorDoor",
        x: 48,
        y: 43,
        w: 6.5,
        h: 20.5,
        label: "Quadrantenschleuse → E71",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "konbiniDoor",
        // Glastür rechts neben dem Aufzug.
        x: 86.5,
        y: 18,
        w: 12.5,
        h: 78,
        label: "Konbini E67",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("konbiniE67"),
      },
      {
        id: "commonRoomDoor",
        // Schmale Tür links neben dem Empfangstresen (unterer Bildbereich,
        // damit es nicht mit den anderen Hotspots kollidiert).
        x: 3.3,
        y: 2.5,
        w: 14.5,
        h: 89.6,
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
        x: 12,
        y: 42.3,
        w: 8.4,
        h: 50,
        label: "Wand E67 (zurück)",
        kind: "exit",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "lookSky",
        x: 43.7,
        y: 0.7,
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
        x: 69.1,
        y: 40.1,
        w: 14.7,
        h: 51.9,
        label: "Eingang E71 →",
        kind: "exit",
        onUse: (api) => {
          api.setFlag("enteredE71");
          api.goTo("e71Lobby");
        },
      },
      {
        id: "toPub",
        // Tür mit Lampe und Schild „Zum stillen Funk" am zentralen Gebäude
        // hinten am Ende des Gehwegs.
        x: 23.4,
        y: 53.8,
        w: 12.3,
        h: 29.6,
        label: "Kneipe „Zum stillen Funk“",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("pubVestibule"),
      },
      {
        id: "zksGraffiti",
        x: 10.5,
        y: 53,
        w: 11,
        h: 12,
        label: "Graffiti an der Betonwand",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei Buchstaben, mit Sprühdose an den Beton geworfen: „Z.K.S.“ Die Farbe ist verlaufen, jemand hat halbherzig versucht, sie abzuschrubben.",
            "Layard hat das Kürzel schon im Treppenhaus gesehen, in den Beton geritzt. Niemand sagt, wofür es steht. Alle tun so, als wüssten sie es.",
          ]),
      },
      {
        // Der Gehweg läuft nach rechts weiter — dort sitzt Ralf hinter
        // seinem Rollo. Rein narrativer Ort, kein Rätsel.
        id: "toWindowNiche",
        x: 54.2,
        y: 24.5,
        w: 7.5,
        h: 45.8,
        label: "Weiter nach rechts →",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("windowNiche"),
      },
    ],
  },
};
