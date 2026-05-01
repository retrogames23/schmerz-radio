import corridor36Bg from "@/assets/scene-corridor-36.jpg";
import corridor36PhilippeBg from "@/assets/scene-corridor-36-philippe.jpg";
import corridor46Bg from "@/assets/scene-corridor-46.jpg";
import corridor56Bg from "@/assets/scene-corridor-56.jpg";
import serverRoom5610Bg from "@/assets/scene-server-room-5610.jpg";
import miraSprite from "@/assets/npc-mira.png";
import philippeSprite from "@/assets/npc-philippe.png";
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
      // Wartungs-Funkgerät — alter Kassetten-Funk, an dem ein
      // verschollener Vorgänger-Hausmeister einmal saß. Reagiert nur
      // auf eine Frequenz, die nicht auf der Skala steht (102,7).
      // Der Spieler muss die Zahl aus drei NPC-Aussagen herleiten,
      // das Schmerz-Radio öffnen und feintunen.
      {
        id: "wartungsFunk5610",
        x: 56,
        y: 60,
        w: 12,
        h: 22,
        label: "Wartungs-Funkgerät (alt)",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("sawWartungsFunk5610")) {
            api.setFlag("sawWartungsFunk5610");
          }
          if (api.hasFlag("hiddenFrequencyFound")) {
            api.showText([
              "Das alte Wartungs-Funkgerät rauscht leise vor sich hin.",
              "Die Träger-Frequenz, die der Vorgänger-Hausmeister benutzt hat,",
              "ist jetzt notiert. Mehr verrät das Gerät nicht.",
            ]);
            return;
          }
          if (!api.hasItem("tuningCrystal")) {
            api.showText([
              "Ein alter Kassetten-Funk mit handgekritzelter Skala.",
              "Der Drehknopf ist abgebrochen — wer den hier benutzen wollte,",
              "musste auf einer anderen Frequenz feintunen können.",
              "Ohne ein passendes Werkzeug bleibt das Ding stumm.",
            ]);
            return;
          }
          api.showText([
            "Ein alter Kassetten-Funk. Auf einer vergilbten Klebefläche steht:",
            "»TRÄGER LIEGT NEBEN DER SKALA. NICHT AUF EINEM PRESET.«",
            "Layard erinnert sich an den Bernstein-Kristall in seiner Tasche.",
            "Wenn er das Schmerz-Radio öffnet und exakt die richtige Frequenz",
            "trifft, wird das Funkgerät vielleicht antworten.",
          ]);
        },
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
};
