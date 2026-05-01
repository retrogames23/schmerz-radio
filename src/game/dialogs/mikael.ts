import type { DialogTree } from "../types";

export const mikaelDialogs: Record<string, DialogTree> = {
  mikaelReject: {
    id: "mikaelReject",
    start: "mr1",
    lines: {
      mr1: {
        id: "mr1",
        speaker: "SYSTEM",
        text: "[ Der Mann hinter dem Schreibtisch sieht auf. Drahtgestell-Brille, grauer Bart, ein hellgraues Diensthemd, das schon zu lange getragen wird. ]",
        next: "mr2",
      },
      mr2: {
        id: "mr2",
        speaker: "MIKAEL",
        text: "Stegmann. Bitte schließen Sie die Tür. Es zieht.",
        subtext: "Keine Härte. Routine. Er sagt das vermutlich zwanzigmal am Tag.",
        next: "mr3",
      },
      mr3: {
        id: "mr3",
        speaker: "LAYARD",
        text: "Worag. E67, Quadrant 26. Ich bringe ein Einsatzprotokoll. Fall-ID 5245, Wohnung 2615. Die Leitstelle hat mich zu Ihnen geschickt.",
        next: "mr4",
      },
      mr4: {
        id: "mr4",
        speaker: "MIKAEL",
        text: "E67. — Ja. Ich vertrete dort heute formal mit. Frau Bauerfeind hat es vermutlich erwähnt.",
        subtext: "Er nickt langsam. Wie jemand, der eine Auskunft bestätigt, die er selbst nicht gegeben hat.",
        next: "mr4burnA",
      },
      // Reaktion auf den abgeschalteten Knoten — nur, wenn Layard burn
      // ausgeführt hat. Owned/Dodged bekommt Mikael unterschiedlich
      // gespiegelt. Beide Linien führen wieder in den Standard-Verlauf.
      mr4burnA: {
        id: "mr4burnA",
        speaker: "MIKAEL",
        text: "Sie haben den Knoten weggeschossen. Das war nicht klug — aber es war ehrlicher als alles, was ich heute hier gemacht habe.",
        subtext: "Er sagt das nicht zu Layard. Eher: zu sich selbst.",
        requires: ["burnedAndOwned"],
        next: "mr4burnB",
      },
      mr4burnB: {
        id: "mr4burnB",
        speaker: "MIKAEL",
        text: "Sie haben ihn weggeschossen — und wissen nicht warum. Das ist das Schlimmste daran.",
        subtext: "Es ist kein Vorwurf. Eher eine Diagnose.",
        requires: ["burnedAndDodged"],
        next: "mr5",
      },
      mr5: {
        id: "mr5",
        speaker: "LAYARD",
        text: "Ja. Es ist eine versiegelte Datenkapsel. Soll ich sie hier ablegen?",
        next: "mr6",
      },
      mr6: {
        id: "mr6",
        speaker: "MIKAEL",
        text: "Nein. — Bitte nicht.",
        subtext: "Es kommt zu schnell. Er hört es selbst und sieht kurz zur Seite.",
        next: "mr7",
      },
      mr7: {
        id: "mr7",
        speaker: "MIKAEL",
        text: "Herr Worag. Ich bin … ich komme nicht hinterher. Sehen Sie das hier?",
        next: "mr8",
      },
      mr8: {
        id: "mr8",
        speaker: "SYSTEM",
        text: "[ Mikael deutet mit beiden Händen auf den Schreibtisch. Auf die Stapel. Auf die Aktenschränke. Auf die offenen Schubladen. Es ist keine Geste — es ist ein Beweis. ]",
        next: "mr9",
      },
      mr9: {
        id: "mr9",
        speaker: "MIKAEL",
        text: "Jeder dieser Vorgänge hat Vorrang. Jeder. Wenn ich Ihre Kapsel jetzt annehme, liegt sie in zwei Wochen unter den anderen — und dann sind wir beide schuld, dass sie nicht bearbeitet wurde.",
        next: "mr10",
      },
      mr10: {
        id: "mr10",
        speaker: "MIKAEL",
        text: "Nehmen Sie sie bitte wieder mit. Geben Sie sie Frau Bauerfeind zurück. Sie soll das richtig zuweisen.",
        next: "mr11",
      },
      mr11: {
        id: "mr11",
        speaker: "LAYARD",
        text: "Sie hat mich heute Morgen explizit hierher geschickt.",
        subtext: "Das ist das Erste seit Stunden, das er ganz allein sagt.",
        next: "mr12",
      },
      mr12: {
        id: "mr12",
        speaker: "MIKAEL",
        text: "Ja. Das tut sie manchmal.",
        subtext: "Kein Vorwurf. Er hat sich daran gewöhnt. Sie sich auch.",
        next: "mr13",
      },
      mr13: {
        id: "mr13",
        speaker: "MIKAEL",
        text: "Sagen Sie ihr, ich habe es nicht angenommen. Sagen Sie ihr — bitte —, dass es nicht persönlich ist. Sie weiß das.",
        next: "mr14",
      },
      mr14: {
        id: "mr14",
        speaker: "LAYARD",
        text: "In Ordnung.",
        subtext: "Warum hat er gerade ja gesagt? Er hätte nein sagen können.",
        next: "mr15",
      },
      mr15: {
        id: "mr15",
        speaker: "SYSTEM",
        text: "[ Mikael nickt nur noch. Sein Blick ist schon wieder auf dem nächsten Stapel. Layard tritt einen Schritt zurück. Die Datenkapsel liegt unverändert in seiner Hand. ]",
        end: true,
      },
    },
  },
  mikaelHiddenFreq: {
    id: "mikaelHiddenFreq",
    start: "mh1",
    lines: {
      mh1: {
        id: "mh1",
        speaker: "MIKAEL",
        text: "Sie sind noch hier. Suchen Sie etwas, Herr Worag?",
        next: "mh2",
      },
      mh2: {
        id: "mh2",
        speaker: "LAYARD",
        text: "Eine Frequenz. Zwischen den Bändern. Niemand will sie zugeben.",
        next: "mh3",
      },
      mh3: {
        id: "mh3",
        speaker: "MIKAEL",
        text: "Dann hören Sie sie. Sie klingt wie eine Stimme, die nicht weint, aber kurz davor ist. Wer sie einmal gehört hat, erkennt sie wieder. Mehr sage ich nicht.",
        subtext: "Er deutet kurz auf den Aktenschrank: »E67 — Resonanz — 1996–«.",
        choices: [
          {
            text: "[ Verstanden. ]",
            action: (api) => {
              api.setFlag("mikaelHintHiddenFreqMood");
            },
          },
        ],
      },
    },
  },
};
