import zvsExteriorBg from "@/assets/scene-zvs-exterior.jpg";
import zvsForumBg from "@/assets/scene-zvs-forum.jpg";
import zvs5011Bg from "@/assets/scene-zvs-5011-final.png";
import type { Scene } from "../types";

/**
 * Zentralverwaltungsstelle Sektor 28 — der lange Bau im Norden, jenseits
 * von Grünbrache und Magistrale. Drei Schauplätze: Vorplatz, Forum mit
 * Empfang, Zimmer 5011 (Sachbearbeiterin Sasse).
 */
export const zentralverwaltungScenes: Record<string, Scene> = {
  zvsExterior: {
    id: "zvsExterior",
    background: zvsExteriorBg,
    title: "Vorplatz — Zentralverwaltungsstelle Sektor 28",
    intro:
      "Der Bau zieht sich über den ganzen Horizont, drei Stockwerke, eine Kolonnade aus Betonpfeilern und drei Portale. Zwei davon sind mit Brettern gekreuzt und verkettet. Der Vorplatz ist so groß, dass jeder Schritt darauf wie ein Antrag wirkt. Der Fahnenmast trägt keine Fahne. Hinter dem mittleren Portal brennt Licht.",
    hotspots: [
      {
        id: "zvsPortal",
        x: 50,
        y: 39,
        w: 10,
        h: 22,
        label: "Mittleres Portal",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => {
          if (!api.hasFlag("enteredZvs")) {
            api.setFlag("enteredZvs");
            api.showText(
              [
                "Die Tür geht schwerer auf, als sie aussieht. Dahinter Stein, Hall und die Kühle von Gebäuden, die nie ganz warm werden.",
              ],
              () => api.goTo("zvsForum"),
            );
            return;
          }
          api.goTo("zvsForum");
        },
      },
      {
        id: "zvsPortalLeft",
        x: 30,
        y: 42,
        w: 8,
        h: 17,
        label: "Linkes Portal (verschlossen)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Zwei gekreuzte Bretter, eine Kette, ein Vorhängeschloss ohne Rost. Das Schloss ist neuer als die Bretter.",
            "Ein Aushang daneben, ausgeblichen: „Dieser Zugang ist bis auf Weiteres nicht vorgesehen.“ Ein Datum steht nicht darauf.",
          ]),
      },
      {
        id: "zvsPortalRight",
        x: 71,
        y: 42,
        w: 9,
        h: 17,
        label: "Rechtes Portal (verschlossen)",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Derselbe Verschlag, dieselbe Kette. Hinter dem Glas steht ein Stuhl, auf dem seit Jahren niemand mehr gesessen hat.",
            "Layard rechnet nach: drei Eingänge, einer offen. Die Auslastung stimmt trotzdem.",
          ]),
      },
      {
        id: "zvsFlagpole",
        x: 64,
        y: 5,
        w: 5,
        h: 58,
        label: "Fahnenmast",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Mast ohne Fahne. Die Leine schlägt bei jedem Windstoß zweimal gegen das Metall, dann ist es wieder still.",
            "Am Fuß eine Plakette, so verwittert, dass nur noch die Jahreszahl lesbar ist. Sie liegt vor Layards Geburt.",
          ]),
      },
      {
        id: "zvsBusStop",
        x: 1,
        y: 24,
        w: 9,
        h: 50,
        label: "Haltepunkt Linie 28",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Das Schild der Linie 28. Ein Fahrplan hängt nicht daran, nur ein Reißnagel, an dem einer gehangen hat.",
            "Zurück in den Wohngürtel geht es mit dem Bus — über die Karte oben in der Leiste.",
          ]),
      },
      {
        id: "zvsPlaza",
        x: 20,
        y: 66,
        w: 45,
        h: 30,
        label: "Vorplatz",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Betonplatten, jede so groß wie ein Zimmer, jede Fuge mit Gras. Wer hier über den Platz geht, wird von drei Stockwerken Fenster begleitet.",
            "Vossbecks Satz kommt Layard wieder in den Sinn: Abgabe ausschließlich hier. In Schriftform. Mit Paraphe.",
          ]),
      },
    ],
  },

  zvsForum: {
    id: "zvsForum",
    background: zvsForumBg,
    title: "Forum — Zentralverwaltungsstelle Sektor 28",
    intro:
      "Eine Halle wie ein Gerichtsgebäude: Steinboden mit Politur, hohe schmale Fenster, Pfeiler, an denen der Schall zweimal abbiegt, bevor er ankommt. Rechts der Empfangstresen hinter einer Glasscheibe mit runder Sprechmuschel. Links eine Bank, auf der niemand sitzt. Am Ende der Halle eine Treppe nach oben.",
    hotspots: [
      {
        id: "zvsReceptionDesk",
        x: 68,
        y: 20,
        w: 31,
        h: 60,
        label: "Empfang",
        kind: "talk",
        onUse: (api) => api.startDialog("zvsReception"),
      },
      {
        id: "zvsBoard",
        x: 25,
        y: 19,
        w: 12,
        h: 37,
        label: "Wegweisertafel",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine schwarze Tafel mit eingeschobenen Buchstabenleisten. Zimmer 1001 bis 1094: Zuteilung. 3000er: Bestand und Instandhaltung. 5000er: Eingaben, Hinweise, Vorsprache.",
            api.hasFlag("zvsSentTo5011")
              ? "Zimmer 5011 steht ganz unten in der Reihe. Daneben, in anderer Schrift: „Aufnahme“."
              : "Bei mehreren Zeilen fehlt die Leiste. Der Rest ist eingeschoben, aber verrutscht, sodass die Nummern nicht mehr zu den Bezeichnungen passen.",
          ]),
      },
      {
        id: "zvsBench",
        x: 4,
        y: 58,
        w: 25,
        h: 30,
        label: "Wartebank",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine Bank aus dunklem Holz, blank gesessen an genau zwei Stellen. Dazwischen liegt der Lack unberührt.",
            "Wer hier wartet, wartet allein und trotzdem in der Mitte nicht.",
          ]),
      },
      {
        id: "zvsStairs",
        x: 39,
        y: 22,
        w: 18,
        h: 50,
        label: "Treppe nach oben",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => {
          if (!api.hasFlag("zvsSentTo5011")) {
            api.showText([
              "Die Treppe führt in die oberen Zimmerreihen. Layard bleibt auf der ersten Stufe stehen.",
              "Ohne Zimmernummer ist das kein Gang nach oben, sondern Herumlaufen im Haus. Das steht bestimmt irgendwo.",
            ]);
            return;
          }
          if (!api.hasFlag("metSasse")) {
            api.showText(
              [
                "Zwei Absätze, ein Gang mit Türen, deren Nummern nicht in der Reihenfolge stehen, in der man sie erwartet. 5007, 5013, 5009 — dann 5011.",
                "Ein Messingschild, ein Klingelknopf, der nicht mehr angeschlossen ist. Layard klopft.",
              ],
              () => api.goTo("zvsRoom5011"),
            );
            return;
          }
          api.goTo("zvsRoom5011");
        },
      },
      {
        id: "zvsWindows",
        x: 0,
        y: 0,
        w: 15,
        h: 55,
        label: "Hohe Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Das Licht fällt in schmalen Bahnen herein und trifft den Boden weiter hinten, als es sollte. Draußen der leere Vorplatz.",
            "Die Scheiben sind innen sauber und außen nicht.",
          ]),
      },
      {
        id: "zvsExitDoor",
        x: 60,
        y: 78,
        w: 40,
        h: 22,
        label: "Hinaus auf den Vorplatz",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("zvsExterior"),
      },
    ],
  },

  zvsRoom5011: {
    id: "zvsRoom5011",
    background: zvs5011Bg,
    title: "Zimmer 5011 — Aufnahme",
    intro:
      "Ein kleines Zimmer, in dem alles seinen Platz hat: Regale mit grauen Ordnern, ein Aktenschrank, eine Schreibtischlampe, die wärmer leuchtet als das Fenster hell ist. Hinter dem Schreibtisch sitzt eine Frau um die fünfundfünfzig, die Hände auf einer offenen Kladde, und sieht Layard an, als habe sie Zeit.",
    hotspots: [
      {
        id: "sasse",
        x: 40,
        y: 22,
        w: 24,
        h: 60,
        label: "Sachbearbeiterin",
        kind: "talk",
        onUse: (api) => api.startDialog("sasse5011"),
      },
      {
        id: "sasseDesk",
        x: 26,
        y: 63,
        w: 22,
        h: 28,
        label: "Formularstapel",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Stapel Vordrucke, alle im selben Grauton, alle mit derselben Kopfzeile. Der oberste ist zur Hälfte ausgefüllt, in einer Handschrift, die keinen einzigen Buchstaben verschluckt.",
            "Daneben ein Stempel und ein Kissen, dessen Farbe frisch nachgefüllt wurde.",
          ]),
      },
      {
        id: "sassePhone",
        x: 67,
        y: 58,
        w: 15,
        h: 20,
        label: "Telefon",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein schwarzes Wählscheibentelefon, die Schnur ordentlich aufgedreht. Es klingelt nicht, solange Layard da ist.",
            "Auf dem Gehäuse klebt ein Streifen mit vier Nummern. Drei davon sind durchgestrichen.",
          ]),
      },
      {
        id: "sasseShelves",
        x: 44,
        y: 2,
        w: 33,
        h: 20,
        label: "Regal mit Ordnern",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ordner an Ordner, gleich hoch, gleich beschriftet, Jahr für Jahr. In einer Reihe fehlen drei Rücken; die Lücke ist mit einem Pappstreifen ausgefüllt, damit die Reihe nicht kippt.",
            "Auf dem Streifen steht nur: „ausgelagert“.",
          ]),
      },
      {
        id: "sasseCabinet",
        x: 30,
        y: 27,
        w: 13,
        h: 40,
        label: "Aktenschrank",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Vier Schubladen, jede mit einem Kärtchen im Halter. Die unterste trägt kein Kärtchen und hat ein Schloss, das die anderen nicht haben.",
          ]),
      },
      {
        id: "sasseNotice",
        x: 84,
        y: 5,
        w: 13,
        h: 25,
        label: "Gerahmter Aushang",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Hinter Glas eine Verordnung in acht Punkten. Punkt sechs: „Angaben von Bewohnern werden aufgenommen, nicht bewertet.“",
            "Punkt sieben: „Die Aufnahme begründet keine Bearbeitung.“",
          ]),
      },
      {
        id: "sasseDoor",
        x: 0,
        y: 0,
        w: 14,
        h: 100,
        label: "Zurück ins Forum",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("zvsForum"),
      },
    ],
  },
};
