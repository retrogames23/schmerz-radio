import type { GameApi } from "../types";
import type { DialogTree } from "../types";

/**
 * Setsuko Arai — Künstlerin in Wohnung 1102 (E71, Etage 1),
 * gegenüber der Bewohnerbibliothek.
 *
 * Überschwänglich, exzentrisch, redet schnell. Ekel vor Essen und Sex
 * ist ihr offen benanntes Material. Weltbild: Befreiung durch das
 * Zeigen des Schambehafteten — „So befreiend!“
 *
 * Nur wer hartnäckig nachfragt (Kunst- UND Körper-Ebene) und dann
 * weiterbohrt, hört von „Zero is Infinity“. Sie kennt die Leute,
 * sie gehört nicht dazu.
 */
export const setsukoDialogs: Record<string, DialogTree> = {
  setsukoIntro: {
    id: "setsukoIntro",
    start: "si1",
    npcId: "setsuko",
    onStart: (api) => api.setFlag("metSetsuko"),
    lines: {
      si1: {
        id: "si1",
        speaker: "SETSUKO",
        text: "Nicht stehenbleiben in der Tür! In der Tür ist der schlechteste Punkt im ganzen Raum, da ist man halb drinnen und halb entschuldigt. Kommen Sie ganz rein. So. — Setsuko.",
        subtext:
          "Sie hat Farbe an beiden Unterarmen und einen Pinsel hinterm Ohr, als hätte sie ihn vergessen.",
        next: "si2",
      },
      si2: {
        id: "si2",
        speaker: "SETSUKO",
        text: "Tee? Ich habe Tee. Ich trinke ihn nicht, aber ich habe ihn. Ich mag es, wenn andere Leute in meiner Wohnung schlucken. Das ist gut für mich, das ist Übung.",
        next: "sHub",
      },
      sHub: {
        id: "sHub",
        speaker: "SETSUKO",
        text: "Und? Sie sehen sich um. Alle sehen sich zuerst um und stellen dann die falsche Frage. Stellen Sie ruhig die falsche.",
        choicesFn: (api) => [
          {
            text: "Warum überall diese Punkte?",
            next: "kunst1",
            action: (api) => api.setFlag("setsukoArtTalk"),
          },
          {
            text: "Warum genau Essen und Körper?",
            next: "koerper1",
            action: (api) => api.setFlag("setsukoBodyTalk"),
          },
          ...(api.hasFlag("setsukoArtTalk") || api.hasFlag("setsukoBodyTalk")
            ? [
                {
                  text: api.hasFlag("setsukoOshoStarted")
                    ? "Noch mal zu diesem Satz mit dem gefährlichen Leben."
                    : "Wovon haben Sie das eigentlich alles?",
                  next: "osho1",
                  action: (a: GameApi) => a.setFlag("setsukoOshoStarted"),
                },
              ]
            : []),
          ...(api.hasFlag("setsukoArtTalk") && api.hasFlag("setsukoBodyTalk")
            ? [
                {
                  text: "Sie reden von „wir“. Machen das hier noch andere?",
                  next: "andere1",
                },
              ]
            : []),
          ...(api.hasFlag("heardZeroIsInfinity")
            ? [
                {
                  text: "Zero is Infinity — was ist das genau?",
                  next: "zero4",
                },
              ]
            : []),
          { text: "Ich lasse Sie arbeiten. Danke." },
        ],
      },

      // ── Ebene: Kunst ─────────────────────────────────────────
      kunst1: {
        id: "kunst1",
        speaker: "SETSUKO",
        text: "Weil ein Punkt allein nichts ist. Ein Punkt ist ein Fehler auf der Wand, den meldet man. Aber zehntausend Punkte sind kein Fehler mehr, das ist eine Ordnung, und in einer Ordnung fragt niemand nach dem einzelnen Punkt.",
        subtext: "Sie tippt mit dem Pinselstiel auf die Wand, dreimal.",
        next: "kunst2",
      },
      kunst2: {
        id: "kunst2",
        speaker: "SETSUKO",
        text: "Ich male, bis ich verschwinde. Erst der Tisch, dann der Boden, dann meine Hände — sehen Sie? — dann bin ich nur noch Muster. Und wer Muster ist, den kann man nicht mehr beschämen. So befreiend!",
        next: "kunst3",
      },
      kunst3: {
        id: "kunst3",
        speaker: "SETSUKO",
        text: "Die Hausverwaltung nennt das „Wandveränderung ohne Vorlage“. Ich habe ein Formblatt bekommen. Ich habe es bepunktet und zurückgeschickt. Seitdem ist es still.",
        next: "sHub",
      },

      // ── Ebene: Körper, Essen, Sex ────────────────────────────
      koerper1: {
        id: "koerper1",
        speaker: "SETSUKO",
        text: "Weil mir davor graut. Vor beidem. Vor Essen und vor Sex. Wirklich körperlich, nicht kokett. Ich kann kaum zusehen, wie jemand kaut.",
        subtext:
          "Sie sagt es so beiläufig wie eine Zimmernummer und sieht dabei erwartungsvoll aus.",
        next: "koerper2",
      },
      koerper2: {
        id: "koerper2",
        speaker: "SETSUKO",
        text: "Also nähe ich es. Ich nähe hundert davon, ich lege sie auf mein Sofa, ich setze mich mitten hinein und mache ein Foto. Was hundertmal daliegt, kann mir nichts mehr tun. Man frisst die Angst, indem man sie ausstellt.",
        next: "koerper3",
      },
      koerper3: {
        id: "koerper3",
        speaker: "SETSUKO",
        text: "Und deshalb sage ich: alle sollen sich nackt machen. Nicht die Kleider — das ist das Leichteste. Das Verletzlichste zeigen, das, wofür man sich am meisten schämt. Wenn das jeder täte, hätte niemand mehr etwas gegen einen in der Hand. Keine Akte, keine Nachbarn, nichts. So befreiend!",
        next: "koerper4",
      },
      koerper4: {
        id: "koerper4",
        speaker: "SETSUKO",
        text: "Aber alle bedecken sich. Von morgens bis abends. Und dann wundern sie sich, dass sie leise sprechen.",
        subtext:
          "Layard merkt, dass er die Hände in den Manteltaschen hat, und lässt sie da.",
        next: "sHub",
      },

      // ── Ebene: Osho ──────────────────────────────────────────
      osho1: {
        id: "osho1",
        speaker: "SETSUKO",
        text: "Von einem Mann aus Indien. Osho. Ich habe ein Heft von ihm, eine Übersetzung, dreimal abgezogen, ohne Impressum, ohne Nummer. Niemand hier interessiert sich dafür, das ist der Vorteil an Sachen, die nicht vorgesehen sind.",
        subtext:
          "Sie zieht ein weiches, eselsohriges Heft zwischen zwei Farbgläsern hervor und hält es hoch wie einen Fund.",
        next: "osho2",
      },
      osho2: {
        id: "osho2",
        speaker: "SETSUKO",
        text: "Ein Satz steht darin, der mir gehört, seit ich ihn gelesen habe: gefährlich leben, aber nicht rücksichtslos. Die meisten hören das und denken, das sei dasselbe. Es ist das Gegenteil.",
        next: "oshoHub",
      },
      oshoHub: {
        id: "oshoHub",
        speaker: "SETSUKO",
        text: "Fragen Sie. Ich erkläre das gern, ich erkläre das viel zu gern.",
        choicesFn: (api) => [
          ...(!api.hasFlag("setsukoToldGefahrUnterschied")
            ? [
                {
                  text: "Wo ist da der Unterschied?",
                  next: "oshoU1",
                  action: (a: GameApi) =>
                    a.setFlag("setsukoToldGefahrUnterschied"),
                },
              ]
            : []),
          ...(!api.hasFlag("setsukoToldRuestung")
            ? [
                {
                  text: "Und was heißt dann gefährlich leben, konkret?",
                  next: "oshoR1",
                  action: (a: GameApi) => a.setFlag("setsukoToldRuestung"),
                },
              ]
            : []),
          ...(api.hasFlag("setsukoToldRuestung") &&
          !api.hasFlag("setsukoToldKomfort")
            ? [
                {
                  text: "Gibt es noch eine zweite Gefahr?",
                  next: "oshoK1",
                  action: (a: GameApi) => a.setFlag("setsukoToldKomfort"),
                },
              ]
            : []),
          ...(api.hasFlag("setsukoToldKomfort") &&
          !api.hasFlag("setsukoToldAuthentisch")
            ? [
                {
                  text: "Und die dritte?",
                  next: "oshoA1",
                  action: (a: GameApi) => {
                    a.setFlag("setsukoToldAuthentisch");
                    a.setFlag("setsukoOshoDone");
                  },
                },
              ]
            : []),
          {
            text: "Klingt wie eine hübsche Ausrede für Rücksichtslosigkeit.",
            next: "oshoSkepsis",
          },
          { text: "Ich muss das erst mal sacken lassen.", next: "sHub" },
        ],
      },
      oshoU1: {
        id: "oshoU1",
        speaker: "SETSUKO",
        text: "Rücksichtslos ist der Körper, wenn niemand zu Hause ist. Zweihundert fahren, weil man nichts mehr spürt. Das ist keine Kühnheit, das ist Taubheit mit Blech drumherum. Da ist kein Kontakt — nicht zu den eigenen Folgen und erst recht nicht zu fremden.",
        next: "oshoU2",
      },
      oshoU2: {
        id: "oshoU2",
        speaker: "SETSUKO",
        text: "Gefährlich leben ist etwas anderes. Das findet nicht im Blech statt, sondern in Ihnen. Sie fordern Ihr eigenes Ego heraus. Sie riskieren nichts an fremden Knochen, Sie riskieren sich.",
        next: "oshoU3",
      },
      oshoU3: {
        id: "oshoU3",
        speaker: "SETSUKO",
        text: "Unten im Haus rutscht einer betrunken das Treppengeländer runter und alle sagen, der traut sich was. Der traut sich nichts. Der ist nur nicht da. Trauen würde er sich, wenn er nüchtern klingelt und sagt, dass er einsam ist.",
        next: "oshoHub",
      },
      oshoR1: {
        id: "oshoR1",
        speaker: "SETSUKO",
        text: "Die erste Gefahr: die Rüstung ablegen. Sagen, was Sie wirklich empfinden — laut, zu einem Menschen, der Nein sagen kann. Und er kann Nein sagen, das gehört dazu, sonst wäre es keine Gefahr.",
        next: "oshoR2",
      },
      oshoR2: {
        id: "oshoR2",
        speaker: "SETSUKO",
        text: "Das ist mein „nackt machen“. Nicht der Mantel — der ist das Leichteste. Das Zurückgewiesenwerden riskieren, jedes Mal wieder. Ich male Punkte, bis ich verschwinde, und dann zeige ich es Leuten. Manche gehen. So befreiend!",
        subtext:
          "Sie sagt „so befreiend“ diesmal leiser, fast wie eine Selbstermahnung.",
        next: "oshoHub",
      },
      oshoK1: {
        id: "oshoK1",
        speaker: "SETSUKO",
        text: "Die zweite: die eingefahrenen Wege verlassen. Routine ist warm, Routine ist bequem, und Routine legt den Geist schlafen, ganz langsam, ohne dass er es merkt.",
        next: "oshoK2",
      },
      oshoK2: {
        id: "oshoK2",
        speaker: "SETSUKO",
        text: "Sehen Sie sich den Sektor an. Eine einzige große Komfortzone mit Formblatt. Jeder Weg vorgezeichnet, jede Frage schon beantwortet, bevor sie jemand stellt. Wer sich dagegen ins Unbekannte stellt, bleibt wach. Wach ist unbequem. Wach ist alles.",
        next: "oshoHub",
      },
      oshoA1: {
        id: "oshoA1",
        speaker: "SETSUKO",
        text: "Die dritte ist die schwerste: echt bleiben. Die Rollenspiele beenden. Nicht anpassen, was Sie denken und fühlen, an das Zimmer, in dem Sie gerade stehen.",
        next: "oshoA2",
      },
      oshoA2: {
        id: "oshoA2",
        speaker: "SETSUKO",
        text: "Das kostet. Ablehnung, Alleinsein, ein Formblatt wegen Wandveränderung. Ich wohne allein, und ich sage Ihnen ehrlich: nicht nur, weil ich es so schön finde. Aber ich muss morgens niemanden spielen. Das ist der Handel.",
        subtext: "Sie zuckt mit den Schultern, ohne dass es traurig aussieht.",
        next: "oshoEnde",
      },
      oshoEnde: {
        id: "oshoEnde",
        speaker: "SETSUKO",
        text: "Also, noch einmal ganz: gefährlich leben, aber nicht rücksichtslos. Kein Draufgängertum. Nur Ehrlichkeit gegen sich selbst, und die verlangt mehr Mut als jede Raserei auf einer Straße.",
        next: "oshoHub",
      },
      oshoSkepsis: {
        id: "oshoSkepsis",
        speaker: "SETSUKO",
        text: "Nein. Eine Ausrede wäre es, wenn ich Ihnen etwas wegnehmen würde und dabei „Freiheit“ riefe. Ich nehme mir etwas weg. Das ist der ganze Unterschied, und er ist nicht klein.",
        next: "oshoSkepsis2",
      },
      oshoSkepsis2: {
        id: "oshoSkepsis2",
        speaker: "SETSUKO",
        text: "Rücksichtslos sein kann jeder Betrunkene. Gefährlich leben kann nur jemand, der wach ist. Deshalb ist es so selten und deshalb reden alle lieber über Autos.",
        next: "oshoHub",
      },

      // ── Ebene: die anderen — Hinweis auf Zero is Infinity ────
      andere1: {
        id: "andere1",
        speaker: "SETSUKO",
        text: "Andere. Hm. Ja, es gibt andere. Die meisten malen nicht, die machen es draußen, mit Leuten, an Orten, wo es weh tut.",
        subtext: "Zum ersten Mal wird sie langsamer.",
        choicesFn: (api) => [
          ...(api.hasFlag("setsukoOshoDone")
            ? [
                {
                  text: "Die leben also gefährlich, aber nicht rücksichtslos.",
                  next: "andere3",
                  action: (a: GameApi) => a.setFlag("heardZeroIsInfinity"),
                },
              ]
            : []),
          { text: "Erzählen Sie mir davon.", next: "andere2" },
          { text: "Klingt nach Ärger. Lassen wir das.", next: "sHub" },
        ],
      },
      andere2: {
        id: "andere2",
        speaker: "SETSUKO",
        text: "Warum wollen Sie das wissen? Sie sind aus einem anderen Gebäude, Sie haben einen Mantel, der nach Registratur riecht, und Sie fragen nach Leuten. Das ist eine Kombination, bei der man normalerweise Tee anbietet und dann aufhört zu reden.",
        choicesFn: () => [
          {
            text: "Weil mir Ihr Gedanke nicht mehr aus dem Kopf geht.",
            next: "andere3",
            action: (api) => api.setFlag("heardZeroIsInfinity"),
          },
          {
            text: "Dienstlich. Ich schreibe etwas auf.",
            next: "andereAbwehr",
          },
          { text: "Sie haben recht. Vergessen Sie's.", next: "sHub" },
        ],
      },
      andereAbwehr: {
        id: "andereAbwehr",
        speaker: "SETSUKO",
        text: "Dann schreiben Sie: „Bewohnerin hat gepunktete Wände.“ Das stimmt, das ist wahr, und mehr steht Ihnen nicht zu.",
        subtext:
          "Sie lächelt weiter, aber sie dreht sich zur Leinwand. Vielleicht ein anderes Mal, anders gefragt.",
        next: "sHub",
      },
      andere3: {
        id: "andere3",
        speaker: "SETSUKO",
        text: "Gut. Das ist wenigstens keine Sprawka-Antwort.",
        subtext: "Sie legt den Pinsel weg. Das hat sie bisher nicht getan.",
        next: "zero1",
      },
      zero1: {
        id: "zero1",
        speaker: "SETSUKO",
        text: "Es gibt Leute, die arbeiten mit der Null. Nicht mit Farbe — mit sich. Sie ziehen sich aus, wo es nicht vorgesehen ist. Auf Treppen, in Wartebereichen, einmal in einer Schleuse. Zwei Minuten, dann sind sie weg.",
        next: "zero2",
      },
      zero2: {
        id: "zero2",
        speaker: "SETSUKO",
        text: "Sie nennen sich Zero is Infinity. Englisch, ja. Null ist Unendlich. Wenn du nichts mehr bist, was man wegnehmen kann, bist du alles. Das ist mein Satz, ehrlich gesagt, aber sie tragen ihn weiter, und das ist in Ordnung.",
        next: "zero3",
      },
      zero3: {
        id: "zero3",
        speaker: "SETSUKO",
        text: "Fragen Sie mich nicht nach Namen. Ich kenne welche, ich sage keine. Ich gehöre nicht dazu, ich mache ihnen nur manchmal Kaffee und höre zu, wenn sie zittern.",
        next: "sHub",
      },
      zero4: {
        id: "zero4",
        speaker: "SETSUKO",
        text: "Mehr als ich gesagt habe, sage ich nicht. Ein Name, kein Ort, keine Leute. Wenn die Sie finden wollen, finden die Sie. So läuft das mit der Null.",
        subtext:
          "Sie nimmt den Pinsel wieder auf und setzt einen Punkt, sehr genau, sehr ruhig.",
        next: "sHub",
      },
    },
  },

  // ── Wiederansprache ────────────────────────────────────────
  setsukoHub: {
    id: "setsukoHub",
    start: "sh1",
    npcId: "setsuko",
    lines: {
      sh1: {
        id: "sh1",
        speaker: "SETSUKO",
        text: "Ah, der Mantel. Alles in Regel? Setzen Sie sich nicht aufs Sofa, das trocknet noch.",
        choicesFn: (api) => [
          ...(!api.hasFlag("setsukoArtTalk")
            ? [{
                text: "Warum überall diese Punkte?",
                next: "shKunst",
                action: (a: GameApi) => a.setFlag("setsukoArtTalk"),
              }]
            : []),
          ...(!api.hasFlag("setsukoBodyTalk")
            ? [{
                text: "Warum Essen und Körper?",
                next: "shKoerper",
                action: (a: GameApi) => a.setFlag("setsukoBodyTalk"),
              }]
            : []),
          ...(api.hasFlag("setsukoArtTalk") &&
          api.hasFlag("setsukoBodyTalk") &&
          !api.hasFlag("heardZeroIsInfinity")
            ? [
                {
                  text: "Sie sagten, es gibt andere. Ich frage noch mal.",
                  next: "shAndere",
                  action: (a: GameApi) => a.setFlag("heardZeroIsInfinity"),
                },
              ]
            : []),
          ...(!api.hasFlag("setsukoOshoDone")
            ? [
                {
                  text: "Wovon haben Sie das eigentlich alles?",
                  next: "shOsho1",
                  action: (a: GameApi) => {
                    a.setFlag("setsukoOshoStarted");
                    a.setFlag("setsukoToldGefahrUnterschied");
                    a.setFlag("setsukoToldRuestung");
                    a.setFlag("setsukoToldKomfort");
                    a.setFlag("setsukoToldAuthentisch");
                    a.setFlag("setsukoOshoDone");
                  },
                },
              ]
            : [{ text: "Noch mal zu Osho.", next: "shOshoShort" }]),
          ...(api.hasFlag("heardZeroIsInfinity")
            ? [{ text: "Noch mal zu Zero is Infinity.", next: "shZero" }]
            : []),
          { text: "Ich wollte nur Hallo sagen.", endsDialog: true },
        ],
      },
      shOsho1: {
        id: "shOsho1",
        speaker: "SETSUKO",
        text: "Von Osho. Ein Mann aus Indien, ich habe ein abgezogenes Heft von ihm. Sein Satz: gefährlich leben, aber nicht rücksichtslos. Klingt gleich, ist das Gegenteil.",
        subtext: "Das Heft liegt aufgeschlagen zwischen zwei Farbgläsern.",
        next: "shOsho2",
      },
      shOsho2: {
        id: "shOsho2",
        speaker: "SETSUKO",
        text: "Rücksichtslos ist der Körper ohne Bewusstsein — zweihundert fahren, weil man nichts mehr spürt. Gefährlich leben ist die Seele: Sie fordern Ihr eigenes Ego heraus, nicht fremde Knochen.",
        next: "shOsho3",
      },
      shOsho3: {
        id: "shOsho3",
        speaker: "SETSUKO",
        text: "Drei Gefahren. Erstens: die Rüstung ablegen und sagen, was Sie fühlen, obwohl man Sie zurückweisen kann. Zweitens: aus der Routine heraus, weil Bequemlichkeit den Geist einschläfert. Drittens: echt bleiben, die Rollenspiele beenden — auch wenn man dann allein wohnt wie ich.",
        next: "shOsho4",
      },
      shOsho4: {
        id: "shOsho4",
        speaker: "SETSUKO",
        text: "Also kein Draufgängertum. Ehrlichkeit gegen sich selbst, und die verlangt mehr Mut als jede Raserei. So befreiend!",
        next: "sh1",
      },
      shOshoShort: {
        id: "shOshoShort",
        speaker: "SETSUKO",
        text: "Gefährlich leben, aber nicht rücksichtslos. Rüstung ab, Routine weg, Rolle beenden. Mehr steht nicht drin, und mehr braucht man auch nicht — man muss es nur machen, jeden Tag, und das ist die Schwierigkeit.",
        next: "sh1",
      },
      shKunst: {
        id: "shKunst",
        speaker: "SETSUKO",
        text: "Ein Punkt ist ein Fehler. Zehntausend sind eine Ordnung. Ich male, bis ich verschwinde, und was verschwunden ist, kann man nicht beschämen. So befreiend!",
        next: "sh1",
      },
      shKoerper: {
        id: "shKoerper",
        speaker: "SETSUKO",
        text: "Weil mir vor beidem graut, vor Essen und vor Sex. Also nähe ich es hundertmal und setze mich hinein. Wer sein Schlimmstes ausstellt, ist frei. Alle anderen bedecken sich und wundern sich, dass sie flüstern.",
        next: "sh1",
      },
      shAndere: {
        id: "shAndere",
        speaker: "SETSUKO",
        text: "Sie sind hartnäckig. Das mag ich mehr, als ich sollte.",
        next: "shZeroReveal",
      },
      shZeroReveal: {
        id: "shZeroReveal",
        speaker: "SETSUKO",
        text: "Es gibt Leute, die arbeiten mit der Null. Sie ziehen sich aus, wo es nicht vorgesehen ist, zwei Minuten lang, dann sind sie weg. Zero is Infinity nennen sie sich. Keine Namen von mir. Ich mache ihnen Kaffee, mehr nicht.",
        next: "sh1",
      },
      shZero: {
        id: "shZero",
        speaker: "SETSUKO",
        text: "Ein Name, kein Ort, keine Leute. Ich gehöre nicht dazu. Aber ich schlafe besser, seit es sie gibt.",
        next: "sh1",
      },
      shBye: {
        id: "shBye",
        speaker: "SETSUKO",
        text: "Hallo. Und: bedecken Sie sich weniger, Herr Mantel.",
        subtext: "Sie lacht und malt weiter, noch bevor er an der Tür ist.",
      },
    },
  },
};
