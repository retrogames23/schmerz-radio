import corridor36Bg from "@/assets/scene-corridor-36-transit.jpg";
import corridor36PhilippeBg from "@/assets/scene-corridor-36-philippe-transit.jpg";
import corridor46Bg from "@/assets/scene-corridor-46.jpg";
import corridor46NoPosterBg from "@/assets/scene-corridor-46-noposter.jpg";
import corridor56Bg from "@/assets/scene-corridor-56.jpg";
import serverRoom5610Bg from "@/assets/scene-server-room-5610.jpg";
import miraSprite from "@/assets/npc-mira.png";
import { startMiraEncounter } from "../dialogs/mira";
import philippeSprite from "@/assets/npc-philippe.png";
import oilCanSprite from "@/assets/item-oil-can-scene.png";
import bodoThermosSprite from "@/assets/sprite-bodo-thermos.png";
import type { Scene } from "../types";

export const corridorsE67Scenes: Record<string, Scene> = {
  corridor36: {
    id: "corridor36",
    background: (api) =>
      api.getPhilippeFloor() === 3 &&
      !api.hasFlag("doorbellRang") &&
      !api.hasFlag("metPhilippeBefore")
        ? corridor36PhilippeBg
        : corridor36Bg,
    // Asset ist ~2.36:1 — auf 16:9-Bühnen würden sonst Tür 3601 und der
    // Aufzug am Rand abgeschnitten. „contain" zeigt das Bild immer ganz.
    bgFit: "contain",
    title: "Korridor 36 — Verwaltung und Versorgung",
    intro:
      "Andere Beleuchtung als zuhause. Sterilere Türen. Vor einer davon — 3601 — ein handgeschriebenes Schild. Aus 3602 zieht warm und ranzig ein Geruch nach Mensa-Pampe und Bohnerwachs.",
    npcs: [],
    hotspots: [
      {
        id: "philippeSpot36",
        // Philippe steht (wenn er Etage 3 ist) vor seiner Wohnung — wir
        // nutzen den freien Wandstreifen zwischen 3603 und Aufzug.
        x: 76,
        y: 36,
        w: 7.5,
        h: 50,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 3,
        onUse: (api) => api.startDialog("philippeInCorridor36"),
      },
      {
        id: "officeDoor",
        // Tür 3601 — links außen.
        x: 4.4,
        y: 31.7,
        w: 14,
        h: 45.4,
        label: "Tür 3601 — Abschnittsverantwortlicher E67",
        kind: "talk",
        onUse: (api) => {
          api.setFlag("sawEmptyOffice");
          api.startDialog("emptyOfficeSign");
        },
      },
      {
        id: "cafeteriaDoor",
        // Tür 3602 — Kantine, mittig.
        x: 25,
        y: 31.3,
        w: 25.5,
        h: 52.7,
        label: "Tür 3602 — Kantine E67",
        kind: "exit",
        onUse: (api) => api.goTo("cafeteriaE67"),
      },
      {
        id: "verwaltungDoor",
        // Tür 3603 — Kantinenverwaltung, rechts neben 3602.
        x: 60,
        y: 32,
        w: 13,
        h: 45.7,
        label: "Tür 3603 — Kantinenverwaltung",
        kind: "exit",
        onUse: (api) => api.goTo("kantinenverwaltung3603"),
      },
      {
        id: "officeBell",
        // Brass-Klingelknopf an der Wand zwischen Tür 3601 und 3602.
        x: 20.1,
        y: 48,
        w: 3.1,
        h: 6.2,
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
        id: "traktPassage36",
        // Linkes Bildende: Versorgungsachse läuft weiter Richtung Aufgang 5.
        x: 0,
        y: 82,
        w: 22,
        h: 18,
        label: "Versorgungsachse → Aufgang 5",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ich weiß nicht, was ich dort soll. Die Kantine und die Verwaltung sind gleich hier.",
          ]),
      },
      {
        id: "axisSign36",
        x: 72.5,
        y: 37,
        w: 8.5,
        h: 8,
        label: "Schild „Versorgungsachse“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Emailleschild: »VERSORGUNGSACHSE ← Aufgänge 1–5 · Aufgänge 7–10 →«.",
            "Auf dem Boden die Spuren der Speisewagen. Hier laufen die Leute aus dem ganzen Haus zur Kantine.",
          ]),
      },
      {
        id: "back36",
        // Aufzug rechts außen.
        x: 82,
        y: 33,
        w: 14,
        h: 44.5,
        label: "Zurück zum Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },
  corridor46: {
    id: "corridor46",
    background: (api) =>
      api.hasFlag("belegAushangKorridor46") ? corridor46NoPosterBg : corridor46Bg,
    title: "Korridor 46 — Wohnetage",
    intro: (api) =>
      api.hasFlag("calledForCode") &&
      api.hasFlag("port2611Locked") &&
      !api.hasFlag("readTagescodeViaMira")
        ? "Wie zuhause, nur eine Etage höher. Ein Plakat „RESONANZ-HYGIENE“ blättert ab. — Layards Post liegt seit heute Morgen bei der Leitstelle, und dort kommt nur rein, wer im Wartungsnetz hängt. Hinter einer dieser Türen steht so ein Anschluss."
        : "Wie zuhause, nur eine Etage höher. Ein Plakat „RESONANZ-HYGIENE“ blättert ab.",

    npcs: [
      {
        id: "miraSprite46",
        src: miraSprite,
        x: 37,
        y: 24.2,
        w: 19.4,
        h: 70.8,
        alt: "Junge Frau, an die Wand gelehnt",
        visible: (api) => api.getMiraFloors().includes(4),
      },
      {
        id: "philippeSprite46",
        src: philippeSprite,
        x: 50,
        y: 36,
        w: 9,
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
        w: 9,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) =>
          api.getPhilippeFloor() === 4 && !api.getMiraFloors().includes(4),
        onUse: (api) => api.startDialog("philippeInCorridor46"),
      },
      {
        id: "poster46",
        x: 31.8,
        y: 24.9,
        w: 20.3,
        h: 40,
        label: "Plakat „Resonanz-Hygiene“",
        kind: "look",
        onUse: (api) => {
          if (api.hasFlag("belegAushangKorridor46")) {
            api.showText([
              "Nur noch ein helleres Rechteck an der Wand und vier Papierecken",
              "unter den Reißnägeln. Das Plakat steckt zusammengefaltet in Layards Tasche.",
            ]);
            return;
          }
          api.setFlag("sawResonanzAushang");
          const read = [
            "„RUHE IST TEIL DER STATIK.“",
            "Darunter, kleiner: „Belegungsdichte einhalten. Türen leise. Ruhezeiten 22–06.“",
            "Am Fuß: „Bei anhaltender Resonanz-Überlastung — Sektorärztin, nicht Leitstelle.“",
            "Jemand hat mit Bleistift dazugeschrieben: „und ihr Käfig.“",
          ];
          if (api.hasFlag("miraAskedEvidence")) {
            api.startDialog("aushangKorridor46Take");
            return;
          }
          api.showText(read);
        },
      },
      // WICHTIG: Nach poster46 im Array — Hotspots stapeln in DOM-Reihenfolge,
      // damit Miras Klickfläche VOR dem Plakat liegt und dort klickbar bleibt.
      {
        id: "miraSpot46",
        x: 40.5,
        y: 26.9,
        w: 10.5,
        h: 55,
        label: "Junge Frau an der Wand",
        kind: "talk",
        visible: (api) => api.getMiraFloors().includes(4),
        onUse: (api) => startMiraEncounter(api),
      },
      {
        id: "door4601Look",
        x: 11.6,
        y: 12.2,
        w: 16.4,
        h: 79.6,
        label: "Tür 4601",
        kind: "look",
        hiddenWhen: ["miraTrustEarned", "phoneBroken"],
        onUse: (api) =>
          api.showText([
            "Tür 4601. Kein Schild. Verkratzter Lack.",
            "Auf Brusthöhe ein winziger Aufkleber: ein durchgestrichenes Ohr.",
          ]),
      },
      {
        id: "door4601Enter",
        x: 9,
        y: 12,
        w: 16.6,
        h: 75.9,
        label: "Tür 4601 — Mira",
        kind: "exit",
        onUse: (api) => {
          if (
            api.hasFlag("miraTrustEarned") ||
            api.hasFlag("miraFlatOpen") ||
            (api.hasFlag("phoneBroken") && !api.hasFlag("phoneRepaired"))
          ) {
            api.goTo("aptMira4601");
            return;
          }
          api.startDialog("miraDoorBlock");
        },
      },
      {
        id: "door4602Look",
        x: 84.9,
        y: 22.1,
        w: 10.5,
        h: 66,
        label: "Tür 4602",
        kind: "look",
        hiddenWhen: ["act2Started"],
        onUse: (api) =>
          api.showText([
            "Tür 4602. Verschlossen. Hinter der Tür: leises Radiorauschen, keine Stimme.",
          ]),
      },
      {
        id: "door4602Leitstelle",
        x: 84.9,
        y: 22.1,
        w: 10.5,
        h: 66,
        label: "Tür 4602 — Leitstelle E67 · Disposition",
        kind: "exit",
        exitDir: "right",
        requires: ["act2Started"],
        onUse: (api) => api.goTo("leitstelleE67"),
      },
      {
        id: "door4603Look",
        x: 51.2,
        y: 33.2,
        w: 6,
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
        // Aufzug am Ende des Korridors (verlaufende Flucht).
        x: 31,
        y: 75.1,
        w: 53.6,
        h: 17.1,
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
        x: 62,
        y: 34,
        w: 10.5,
        h: 54,
        alt: "Philippe am Ende des Korridors",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 5,
      },
    ],
    hotspots: [
      {
        id: "philippeSpot56",
        x: 62,
        y: 36,
        w: 10.5,
        h: 54,
        label: "Philippe (Nachbar)",
        kind: "talk",
        hiddenWhen: ["doorbellRang", "metPhilippeBefore"],
        visible: (api) => api.getPhilippeFloor() === 5,
        onUse: (api) => api.startDialog("philippeInCorridor56"),
      },
      {
        id: "window56",
        x: 39,
        y: 29.8,
        w: 22,
        h: 27.9,
        label: "Vergittertes Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Hinter den Gitterstäben: Dächer. Antennenwald. Eine Möwe.",
            "Darunter, in den Beton geritzt: „Z.K.S. war hier.“",
          ]),
      },
      // Tür 5614 — vorne links (zukünftiger Inhalt). Reserviert.
      {
        id: "door5614",
        x: 10.9,
        y: 12.4,
        w: 13.8,
        h: 76.8,
        label: "Tür 5614",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine Stahltür. Kein Schild, kein Geräusch dahinter.",
            "Layard klopft nicht. Heute nicht.",
          ]),
      },
      // Tür 5612 — mittlere Position links. Reserviert.
      {
        id: "door5612",
        x: 24.7,
        y: 21.5,
        w: 6.2,
        h: 56.6,
        label: "Tür 5612",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine Stahltür. Kein Schild, kein Geräusch dahinter.",
            "Layard klopft nicht. Heute nicht.",
          ]),
      },
      // ─────────────────────────────────────────────────────────
      // Tür 5610 — Serverraum hinter Korridor 56.
      // Sichtbar nur, wenn eine der Motivations-Spuren erfüllt ist:
      //   (a) Mira-Hint: tookFlyer
      //   (b) Schmerz-Radio aktiv (104,6)
      //   (c) Mindestens 3 Philippe-Themen gelesen
      // Öffnet sich ohne Keypad — narrative Wege:
      //   (1) Bodos Hausmeister-Reset (elevatorMaintCleared) hat den
      //       Magnetriegel im selben Wartungs-Sammelvorgang mitfreigeschaltet.
      //   (2) Layard hat eine Wartungskarte (Item "wartungsnotiz5610",
      //       intern weiterhin so heißend; vergeben aus Bodo-/Mira-/
      //       Philippe-Spur).
      //   (3) Andernfalls bleibt die Tür zu — Hinweis-Text.
      // Nach dem Öffnen führt der Hotspot direkt in den Raum.
      // ─────────────────────────────────────────────────────────
      {
        id: "door5610",
        x: 30.9,
        y: 28.6,
        w: 4.7,
        h: 40.4,
        label: "Tür 5610 · Technik",
        kind: "exit",
        visible: (api) => {
          if (api.hasFlag("serverRoom5610Open")) return true;
          // Wer Bodos Wartungskarte (oder seinen Auftrag) hat, sieht die Tür
          // immer — sonst wäre die Karte ein totes Item und das Ölkännchen
          // unerreichbar.
          if (
            api.hasItem("wartungsnotiz5610") ||
            api.hasFlag("bodoGaveWartungskarte") ||
            api.hasFlag("elevatorMaintCleared") ||
            api.hasFlag("saw5610Door")
          )
            return true;
          const themaCount =
            (api.hasFlag("philippeThemaNotiz1") ? 1 : 0) +
            (api.hasFlag("philippeThemaNotiz2") ? 1 : 0) +
            (api.hasFlag("philippeThemaNotiz3") ? 1 : 0) +
            (api.hasFlag("philippeThemaNotiz4") ? 1 : 0) +
            (api.hasFlag("philippeThemaNotiz5") ? 1 : 0);
          return (
            api.hasFlag("tookFlyer") ||
            api.isRadioActive() ||
            themaCount >= 3
          );
        },
        onUse: (api) => {
          if (api.hasFlag("serverRoom5610Open")) {
            api.goTo("serverRoom5610");
            return;
          }
          // (1) Bodos Wartungs-Reset hebt den Magnetriegel mit auf —
          //     gleicher Sammelvorgang 4711.
          if (api.hasFlag("elevatorMaintCleared")) {
            api.setFlag("serverRoom5610Open");
            api.setFlag("saw5610Door");
            api.showText(
              [
                "Layard tritt an die Tür. Das blaue Wartungs-LED",
                "schaltet auf Grün — von ganz alleine.",
                "Ein dumpfes Klacken in der Wand: die Magnetriegel geben nach.",
                "Der Hausmeister-Reset von vorhin hat hier mit aufgeräumt.",
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
            // Karte hat ihren Zweck erfüllt — Layard steckt sie nicht
            // wieder ein, sie verschwindet aus dem Inventar.
            api.removeItem("wartungsnotiz5610");
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
              "oder gelöste Wartungssperre bleibt die Tür zu.",
            ]);
          } else {
            api.showText([
              "Die Tür gibt nicht nach. Der Kartenleser blinkt blau.",
              "Ohne Wartungskarte oder gelöste Wartungssperre bleibt sie zu.",
            ]);
          }
        },
      },
      {
        id: "back56",
        x: 71.1,
        y: 21.1,
        w: 12.3,
        h: 61.2,
        label: "Zurück zum Aufzug",
        kind: "exit",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },
  serverRoom5610: {
    id: "serverRoom5610",
    background: serverRoom5610Bg,
    title: "Serverraum 5610 — Knoten E67",
    intro:
      "Drei Racks, blinkende LEDs, der Geruch von heißem Lötzinn. In der Ecke: ein einzelnes Wartungsterminal. Hier läuft der Vorgangsknoten des Hauses — jede Störmeldung, jedes Türsiegel, jede weitergeleitete Krankmeldung aus E67 geht durch dieses Gitter.",
    npcs: [
      {
        id: "oilCanSprite5610",
        src: oilCanSprite,
        x: 39.6,
        y: 62.5,
        w: 21.3,
        h: 39.4,
        alt: "Ölkännchen auf dem Wartungsregal",
        hiddenWhen: ["tookOilCan"],
      },
      {
        id: "bodoThermosSprite5610",
        src: bodoThermosSprite,
        x: 56.4,
        y: 83.2,
        w: 9,
        h: 13,
        alt: "Grüne Thermoskanne auf dem Rack",
        hiddenWhen: ["tookBodoThermos"],
      },
    ],
    hotspots: [
      {
        id: "nodeTerminal5610",
        x: 65,
        y: 45,
        w: 19.5,
        h: 40,
        label: "Wartungsterminal",
        kind: "use",
        onUse: (api) => api.openNode5610(),
      },
      {
        id: "racks5610",
        x: 22.1,
        y: 25.2,
        w: 22.5,
        h: 72.6,
        label: "Racks (warm)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei Racks, dicht an dicht. Die LEDs flackern unregelmäßig — das Gitter feuert nur dort, wo gerade Daten ankommen.",
            "Layard hält die Hand kurz an das Gehäuse — es ist warm.",
            "Wärme von etwas, das ohne Pause arbeitet.",
          ]),
      },
      // Wartungs-Funkgerät — reines Deko-Objekt. Alter Kassetten-Funk,
      // an dem einmal ein Hausmeister saß. Rauscht, mehr nicht.
      {
        id: "wartungsFunk5610",
        x: 48.6,
        y: 41.4,
        w: 13,
        h: 22,
        label: "Wartungs-Funkgerät (alt)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein alter Kassetten-Funk mit Bakelit-Knöpfen. Jemand hat ihn nie abgeklemmt.",
            "Layard dreht am Regler. Rauschen, gleichmäßig, ohne jede Absicht.",
            "Auf einer vergilbten Klebefläche steht nur noch: »WARTUNG — E67«.",
          ]),
      },
      {
        id: "exit5610",
        x: 8.3,
        y: 0.4,
        w: 10.5,
        h: 99.8,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor56"),
      },
      {
        id: "oilCanPickup5610",
        x: 47.3,
        y: 80.2,
        w: 8,
        h: 14,
        label: "Ölkännchen (Wartungsregal)",
        kind: "use",
        hiddenWhen: ["tookOilCan"],
        onUse: (api) => {
          api.setFlag("tookOilCan");
          api.addItem({
            id: "oilCan",
            name: "Ölkännchen",
            description:
              "Eine kleine zinnerne Ölkanne mit langem, schlankem Schnabel. Halb voll, klebrig am Hals. Auf einem Aufkleber, mit Bleistift: »Wartung — Tür 4 fällig«. Niemand hat sich darum gekümmert.",
          });
          api.showText([
            "Auf dem unteren Wartungsregal liegt zwischen Lötzinn und vergilbten Gummiringen ein kleines Ölkännchen. Der Aufkleber ist alt: »Wartung — Tür 4 fällig«.",
            "Layard nimmt es mit. Tür 4 — das ist die Lautsprecher-Maske vor der Kneipe. [ Ölkännchen eingesteckt. ]",
          ]);
        },
      },
      // Bodos vergessene grüne Thermoskanne — liegt auf einem der
      // warmen Racks, gut sichtbar. Nur relevant, wenn Bodo den
      // Auftrag erteilt hat (Wartungskarte ausgehändigt).
      {
        id: "bodoThermosPickup5610",
        x: 56.3,
        y: 84.2,
        w: 9,
        h: 13,
        label: "Grüne Thermoskanne",
        kind: "use",
        hiddenWhen: ["tookBodoThermos"],
        onUse: (api) => {
          api.setFlag("tookBodoThermos");
          api.addItem({
            id: "bodoThermos",
            name: "Grüne Thermoskanne",
            description:
              "Bodos vergessene Thermoskanne. Mattgrün, eine ordentliche Delle an der Seite, der Schraubdeckel klemmt. Innen riecht es noch schwach nach Karton-Tee.",
          });
          api.showText([
            "Auf einem der warmen Racks, halb hinter einem Patchkabel-Wirrwarr,",
            "steht eine grüne Thermoskanne. Mit Delle. Genau wie Bodo gesagt hat.",
            "[ Thermoskanne eingesteckt. ]",
          ]);
        },
      },
    ],
  },
};
