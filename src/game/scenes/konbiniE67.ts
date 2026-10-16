import konbiniBg from "@/assets/scene-konbini-e67.jpg";
import type { Scene } from "../types";

/**
 * Konbini E67 (Typ K-4) — rechts neben dem Aufzug in der Lobby.
 * Waren aus dem Mandatsgebiet, Geräte aus dem Wirtschaftsabkommen 1979.
 */
export const konbiniE67Scenes: Record<string, Scene> = {
  konbiniE67: {
    id: "konbiniE67",
    background: konbiniBg,
    title: "Konbini E67 — Typ K-4",
    intro:
      "Kaltes Deckenlicht, glänzende Fliesen, orange-grüne Firmenstreifen an den Wänden. Ein Kühlschrank surrt. Hinter der Kasse sitzt ein Mann im beigen Kittel, über ihm läuft eine Leuchtschrift.",
    decals: [
      { id: "konbiniTicker", kind: "ledTicker", tickerPool: "e67", hiddenWhen: ["act2Started"], x: 75.5, y: 6.9, w: 22.3, h: 3.8, skewY: -15.4 },
      { id: "konbiniTickerAct2", kind: "ledTicker", tickerPool: "e67act2", requires: ["act2Started"], x: 75.5, y: 6.9, w: 22.3, h: 3.8, skewY: -15.4 },
    ],
    hotspots: [
      {
        id: "konbiniExit",
        x: 37,
        y: 84,
        w: 30,
        h: 16,
        label: "Zurück in die Lobby",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
      {
        id: "konbiniKroll",
        x: 80.5,
        y: 21,
        w: 12.5,
        h: 33,
        label: "Uwe Kroll (Versorgungswart)",
        kind: "talk",
        onUse: (api) => api.startDialog("krollKonbini"),
      },
      {
        id: "konbiniTickerSpot",
        x: 75,
        y: 2,
        w: 23.5,
        h: 15,
        label: "Leuchtschrift-Laufband",
        kind: "look",
        onUse: (api) => {
          if (api.hasFlag("ralfWantsNews") && !api.hasFlag("readTickerForRalf")) {
            api.setFlag("readTickerForRalf");
            api.showText([
              "Layard bleibt stehen und liest mit, eine ganze Runde lang. Öffnungszeiten, Wetter, eine Fundsache, eine Verordnung.",
              "Er prägt sich die Meldungen ein. Für Ralf. Hauptsache, sie sind von heute.",
            ]);
            return;
          }
          api.showText([
            "Ein Laufband aus bernsteinfarbenen Leuchtpunkten. Am Rahmen ein Typenschild mit japanischen Zeichen und einem deutschen Aufkleber: „Importzulassung Sektor 79/K“.",
            "Die Meldungen kommen per Leitung von der Versorgungskommission. Wer sie schreibt, weiß niemand. Sie klingen alle, als hätte sie dieselbe Schreibmaschine verfasst.",
          ]);
        },
      },
      {
        id: "konbiniFridge",
        x: 0,
        y: 10,
        w: 15,
        h: 70,
        label: "Kühlregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Glastüren, innen beschlagen. Haltbarmilch im Tetraeder, Molke, Quark in Wachspapier. Alles aus Sektor 31.",
            "Auf den Türen japanische Warnaufkleber, halb mit Tesafilm überklebt. Darunter, mit Kugelschreiber: „Tür zu! — Kroll“.",
            api.hasFlag("act2Started")
              ? "Das rote Lämpchen ist aus. Regelverkauf. Layard braucht nichts davon."
              : "Das Fach ist verriegelt. Ein kleines rotes Lämpchen meldet: Nachtsperre.",
          ]),
      },
      {
        id: "konbiniShelf",
        x: 23,
        y: 35,
        w: 28,
        h: 58,
        label: "Warenregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            api.hasFlag("act2Started")
              ? "Graubrot in Tüten, Dosen mit blauem Stempel, Haltbarmilch. Die Nachtsperre-Schilder sind umgedreht. Auf dem Tresen liegt noch der Bon von jemandem, der eben eingekauft hat."
              : "Graubrot in Tüten, Dosen mit blauem Stempel, Haltbarmilch. An jedem Regal ein kleines rotes Nachtsperre-Schild. Man darf sich die Waren nachts ansehen. Nur nicht nehmen.",
          ]),
      },
      {
        id: "konbiniRegister",
        x: 66.5,
        y: 40,
        w: 14,
        h: 27,
        label: "Kasse und Münzzählwerk",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein bulliges Gerät aus beigem und braunem Hartplastik, verchromte Tasten. Das Typenschild ist japanisch. Darüber Dymo-Streifen: SUMME, STORNO, FACH 4.",
            "Daneben der Münzzähler: Schächte für jede Münzgröße, ein kleines grünes Zählfenster. Er zeigt 0000. Nachts wird nicht gezählt.",
          ].map((t, i) =>
            i === 1 && api.hasFlag("act2Started")
              ? "Daneben der Münzzähler: Schächte für jede Münzgröße, ein kleines grünes Zählfenster. Es rattert. Der Regelverkauf läuft seit sechs."
              : t,
          ),
          ),
      },
    ],
  },
};
