import type { DsaClassId } from "./classes";
import type { Attr } from "./dice";

/**
 * Daten für die Mini-Kampagne, die Tjark im Gemeinschaftsraum E67
 * leitet. Drei Abschnitte mit jeweils mehreren „Beats" (Szenen am
 * Tisch). Jeder Beat hat eine Erzählung von Tjark, eine Illustration
 * und mehrere Wahloptionen — manche davon nur verfügbar, wenn Layards
 * DSA-Charakter eine bestimmte Klasse hat oder magiebegabt ist.
 */

export type DsaRequirement =
  | "any"
  | "magic"
  | "noMagic"
  | DsaClassId
  | DsaClassId[];

export interface DsaOption {
  id: string;
  text: string;
  /** Anforderung an Layards Klasse. Standard: jeder kann das wählen. */
  requires?: DsaRequirement;
  /** Optional: Eigenschafts-Probe (3W20 unter Eigenschaft). */
  attrCheck?: { attr: Attr; modifier?: number };
  /**
   * Optional: automatischer Kampf statt einfacher Probe. Ist das gesetzt,
   * wird die Kampfszene gezeigt — Sieg → success-Text, Niederlage → failure.
   */
  combat?: {
    /** Gegner-IDs aus ENEMY_STATS. Mehrere = mehrere Feinde gleichzeitig. */
    enemyIds: string[];
  };
  outcome: {
    /** Erzähltext bei Erfolg / kein Check. */
    success: string[];
    /** Erzähltext bei Misserfolg. */
    failure?: string[];
    /** Lockerer Kommentar vom Tisch (Brem / Yelva / Tjark). */
    table?: { speaker: "BREM" | "YELVA" | "TJARK"; text: string };
  };
  /** Nächster Beat (lokaler ID), oder Sprungmarke. */
  next: string | "scene2" | "scene3" | "end";
}

export interface DsaBeat {
  id: string;
  /** Importierter Bildpfad. */
  illustration: string;
  /** Tjarks Vorlese-Text (mehrere Zeilen). */
  narration: string[];
  options: DsaOption[];
}

export interface DsaAct {
  id: "scene1" | "scene2" | "scene3";
  title: string;
  /** Reihenfolge der Beats; das erste Element ist der Einstieg. */
  beats: DsaBeat[];
}

import imgForest from "@/assets/dsa/dsa-anreise-forest.jpg";
import imgEncounter from "@/assets/dsa/dsa-anreise-encounter.jpg";
import imgTavernExt from "@/assets/dsa/dsa-tavern-exterior.jpg";
import imgTavernInt from "@/assets/dsa/dsa-tavern-interior.jpg";
import imgRuinEntrance from "@/assets/dsa/dsa-ruin-entrance.jpg";
import imgRuinChamber from "@/assets/dsa/dsa-ruin-chamber.jpg";

export const DSA_CAMPAIGN: ReadonlyArray<DsaAct> = [
  // ──────────────────────────────────────────────────────────────────
  // Akt 1 — Anreise
  // ──────────────────────────────────────────────────────────────────
  {
    id: "scene1",
    title: "Anreise — Durch den Reichsforst",
    beats: [
      {
        id: "s1b1",
        illustration: imgForest,
        narration: [
          "Der Pfad vom Greifenpaß nach Phexcaer ist alt — und er weiß es.",
          "Drei Tage seid ihr jetzt unterwegs. Die Sonne sinkt zwischen die Tannen, der Atem dampft.",
          "Vor euch liegt eine Gabelung: links der breite Weg, ausgefahren von Karren. Rechts ein schmaler Trampelpfad, der sich um einen moosigen Findling windet.",
          "Was tut ihr?",
        ],
        options: [
          {
            id: "s1b1-broad",
            text: "Wir nehmen den breiten Weg — das ist die Hauptroute.",
            outcome: {
              success: [
                "Ihr stapft den Karrenweg entlang. Der Boden ist matschig, aber breit genug für ein Pferdegespann.",
                "Etwa eine halbe Meile weiter wird der Wald lichter — ihr seht Rauch zwischen den Bäumen aufsteigen.",
              ],
              table: { speaker: "BREM", text: "Rauch heißt Feuer. Feuer heißt Leute. Leute heißt Ärger." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-narrow",
            text: "Wir nehmen den Trampelpfad — sicherer, weniger Begegnungen.",
            outcome: {
              success: [
                "Der Trampelpfad ist eng, das Geäst kratzt euch über die Schultern.",
                "Nach einer Weile öffnet er sich überraschend zu einer kleinen Waldlichtung — und ihr steht plötzlich Aug in Aug mit drei finsteren Gestalten.",
              ],
              table: { speaker: "YELVA", text: "Sicherer, sagt er." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-elf-listen",
            text: "(Elf) Du legst die Hand ans Ohr — was hörst du, das die anderen nicht hören?",
            requires: "elf",
            attrCheck: { attr: "IN" },
            outcome: {
              success: [
                "Du schließt die Augen. Wind in den Wipfeln, ein Specht weit weg — und Stahl. Eine Sehne, die gespannt wird.",
                "Du bedeutest den anderen, langsam zu sein. Brem zieht den Dolch. Yelva legt die Hand an den Stab.",
                "Drei Bewaffnete, hinter dem Findling. Sie wissen nicht, dass ihr sie kommen seht.",
              ],
              failure: [
                "Du lauschst — aber der Wind ist heute laut. Du hörst nur Wald.",
                "Ihr geht weiter. Nichts geschieht. Vielleicht.",
              ],
              table: { speaker: "TJARK", text: "Saubere IN-Probe. Plus 1 auf Initiative im nächsten Beat." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-druid-ask",
            text: "(Druide) Du sprichst mit den Bäumen. Was ist hier passiert?",
            requires: "druide",
            outcome: {
              success: [
                "Du legst die Hand auf eine alte Tanne. Die Rinde ist warm.",
                "Bilder kommen langsam: Männer mit Armbrüsten, gestern, kurz vor Sonnenaufgang. Zwei Tote. Ein Karren, der nie ankam.",
                "Du dankst der Tanne und nickst den anderen zu. „Wir sollten uns vorsehen.“",
              ],
              table: { speaker: "BREM", text: "Du redest mit Bäumen. Das ist großartig. Wirklich." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-dwarf-tracks",
            text: "(Zwerg) Du gehst in die Hocke und liest den Boden.",
            requires: "zwerg",
            attrCheck: { attr: "KL" },
            outcome: {
              success: [
                "Du tippst mit dem Finger an einen Abdruck. Stiefel, billiges Leder. Drei Mann, schwer beladen — aber der mittlere humpelt.",
                "„Da hinter dem Findling lauert was. Drei. Einer langsam.“ Brem nickt anerkennend.",
              ],
              failure: [
                "Du brummst über schlechtes Licht und dreckigen Schnee, kommst aber zu keinem Schluss.",
                "Ihr geht weiter — wachsam, aber blind.",
              ],
              table: { speaker: "TJARK", text: "Saubere Spurenlese, Zwerg." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-rogue-scout",
            text: "(Streuner / Gaukler) Du schleichst voraus, prüfst die Lage.",
            requires: ["streuner", "gaukler"],
            attrCheck: { attr: "GE" },
            outcome: {
              success: [
                "Du gleitest zwischen die Stämme, leise wie ein Gerücht.",
                "Hinter dem Findling: drei Männer, Armbrüste auf den Knien, einer schnitzt an einem Bolzen. Du kommst zurück, ehe sie atmen können.",
              ],
              failure: [
                "Ein Ast knackt unter deiner Sohle. Du erstarrst — niemand reagiert. Glück gehabt. Aber wissen tust du nichts.",
              ],
              table: { speaker: "YELVA", text: "Endlich macht jemand etwas Sinnvolles." },
            },
            next: "s1b2",
          },
          {
            id: "s1b1-mage-omen",
            text: "(Magier) Du fragst die Zeichen — Wind, Vogelflug, das Knacken im Holz.",
            requires: "magier",
            attrCheck: { attr: "KL" },
            outcome: {
              success: [
                "Du schließt die Augen, legst zwei Finger an die Schläfe. Krähen, links. Drei. Schlechtes Omen.",
                "Ein Frost, der zu früh kommt. Etwas wartet vor uns. Du sagst es leise. Brem zieht den Dolch.",
              ],
              failure: [
                "Die Zeichen schweigen. Heute hat Hesinde anderes zu tun.",
              ],
              table: { speaker: "TJARK", text: "Akademist-Wissen ist auch Wissen." },
            },
            next: "s1b2",
          },
        ],
      },
      {
        id: "s1b2",
        illustration: imgEncounter,
        narration: [
          "Drei Wegelagerer stehen vor euch. Lederrüstungen, schlecht geflickt. Zwei Armbrüste, ein Kurzschwert.",
          "Der Anführer — ein Mann mit gebrochener Nase — grinst.",
          "„Der Wegzoll, Herrschaften. Drei Silbertaler pro Nase, dann dürft ihr weiter.“",
          "Was tut ihr?",
        ],
        options: [
          {
            id: "s1b2-fight",
            text: "(Krieger / Thorwaler / Zwerg) Du ziehst das Schwert. „Den Zoll zahle ich in Eisen.“",
            requires: ["krieger", "thorwaler", "zwerg"],
            combat: {
              enemyIds: [
                "wegelagerer_anfuehrer",
                "wegelagerer_armbrust",
                "wegelagerer_stab",
              ],
            },
            outcome: {
              success: [
                "Du gehst breitbeinig zwei Schritte vor. Die Klinge zischt aus der Scheide.",
                "Der Anführer zuckt zurück. Einer der Armbrustschützen feuert in Panik — der Bolzen geht ins Holz hinter dir.",
                "Drei Hiebe später liegen zwei am Boden, der dritte rennt.",
                "Yelva senkt langsam den Stab. „Das ging schnell.“",
              ],
              failure: [
                "Du gehst vor — der Anführer ist schneller. Sein Kurzschwert findet deine Schulter.",
                "Brem flucht und schmeißt einen Dolch. Der Wegelagerer geht zu Boden, aber dein Arm blutet.",
                "Tjark kritzelt etwas auf seinen Block. „Drei Lebenspunkte. Halt durch, Held.“",
              ],
              table: { speaker: "YELVA", text: "Subtil." },
            },
            next: "s1b3",
          },
          {
            id: "s1b2-talk",
            text: "(Streuner / Gaukler / Elf) Du redest sie weich. „Drei Silber? Wir haben nichts. Aber eine Geschichte hätten wir.“",
            requires: ["streuner", "gaukler", "elf"],
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "Du lächelst, als hättest du die ganze Nacht auf diese Frage gewartet.",
                "Eine halbe Stunde später sitzt ihr alle am Wegrand, der Anführer hat dir Brot abgegeben und lacht über deine Lüge vom singenden Bären.",
                "Ihr geht ohne Silber, aber mit einem Wink: „In der Schenke unten — passt auf den Wirt auf.“",
              ],
              failure: [
                "Sie hören kurz zu. Dann lacht der Anführer trocken.",
                "„Geschichten verkaufen wir selber. Den Beutel, oder den Hals.“",
                "Es wird hässlich. Ihr verliert ein paar Silber, aber niemand stirbt.",
              ],
              table: { speaker: "BREM", text: "Sie hat den Bären-Trick gemacht. Den BÄREN-Trick." },
            },
            next: "s1b3",
          },
          {
            id: "s1b2-magic",
            text: "(Magie) Du erhebst die Hand. „Ihr werdet uns vorbeilassen. Sofort.“",
            requires: "magic",
            attrCheck: { attr: "MU", modifier: -2 },
            outcome: {
              success: [
                "Du sprichst die Formel. Drei Worte, eine Geste. Die Luft zwischen euch wird kalt.",
                "Der Anführer macht zwei Schritte rückwärts, ohne es zu wollen. Seine Männer ebenso.",
                "Sie senken die Waffen. Murmeln etwas, das wie eine Entschuldigung klingt. Verschwinden.",
              ],
              failure: [
                "Du sprichst die Formel — sie misslingt. Ein leiser Knall, ein Geruch nach verbranntem Haar.",
                "Der Anführer lacht. „Magier. Hab ich's nicht gesagt?“",
                "Es wird zur Schlägerei. Ihr kommt durch, aber ihr seid zerschlagen.",
              ],
              table: { speaker: "TJARK", text: "Patzer auf der MU-Probe. Astralpunkte sind trotzdem weg." },
            },
            next: "s1b3",
          },
          {
            id: "s1b2-bluff",
            text: "Du bluffst: „Wir sind nicht allein. Hinter uns reiten Bewaffnete.“",
            attrCheck: { attr: "MU" },
            outcome: {
              success: [
                "Du sagst es ruhig, ohne zu lächeln. Der Anführer mustert dich, blickt nervös den Pfad zurück.",
                "Er zischt etwas zu seinen Männern, sie verschwinden zwischen die Bäume. Ihr geht weiter — schneller als nötig.",
              ],
              failure: [
                "Der Anführer lacht. „Hinter euch ist genau gar nichts. Beutel.“",
                "Es kommt zur Schlägerei. Ihr verliert ein paar Münzen, niemand stirbt — aber dein Stolz hat eine Beule.",
              ],
              table: { speaker: "BREM", text: "Klassiker. Funktioniert manchmal." },
            },
            next: "s1b3",
          },
          {
            id: "s1b2-pay",
            text: "Wir zahlen die drei Silbertaler. Pragmatisch.",
            outcome: {
              success: [
                "Du zählst neun Silberlinge in seine ausgestreckte Hand.",
                "Er nickt fast höflich, tritt einen Schritt zur Seite. „Angenehme Reise, Herrschaften.“",
                "Brem brummt etwas vom „verdammten Pragmatismus“, aber alle leben noch.",
              ],
              table: { speaker: "BREM", text: "Neun Silber. Neun!" },
            },
            next: "s1b3",
          },
        ],
      },
      {
        id: "s1b3",
        illustration: imgForest,
        narration: [
          "Ihr zieht weiter. Die Dämmerung wird Nacht.",
          "Zwischen den Stämmen taucht ein Lichtschein auf — gelb, warm, einladend. Eine Schenke am Wegrand.",
          "Über der Tür hängt ein Schild: ein Drache mit weit aufgerissenem Maul. „Zum durstigen Drachen.“",
          "Yelva atmet aus. „Endlich. Bett, Bier, was immer zuerst kommt.“",
        ],
        options: [
          {
            id: "s1b3-enter",
            text: "Wir gehen rein.",
            outcome: {
              success: [
                "Ihr klopft den Schnee von den Mänteln und stoßt die Tür auf.",
                "Wärme schlägt euch entgegen, und der Geruch nach Bier, Pfeifenrauch und gebratenem Fleisch.",
              ],
            },
            next: "scene2",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Akt 2 — Wirtshaus
  // ──────────────────────────────────────────────────────────────────
  {
    id: "scene2",
    title: "Im Wirtshaus „Zum durstigen Drachen“",
    beats: [
      {
        id: "s2b1",
        illustration: imgTavernExt,
        narration: [
          "Die Schankstube ist voll. Holzfäller in der Ecke, ein Händler am Kamin, zwei Söldner, die Würfel werfen.",
          "Der Wirt — fettig, freundlich — winkt euch heran. „Drei Krüge? Ein Zimmer? Beides?“",
          "Während ihr bestellt, fällt euch ein Mann an einem Einzeltisch auf. Schwarzer Reisemantel, Kapuze noch auf. Er beobachtet euch.",
        ],
        options: [
          {
            id: "s2b1-approach",
            text: "Wir gehen direkt zu ihm und fragen, was er will.",
            attrCheck: { attr: "MU" },
            outcome: {
              success: [
                "Du setzt dich ihm gegenüber. Er schiebt die Kapuze zurück — ein älterer Gelehrter, fahl, übermüdet.",
                "„Mein Name ist Magister Wendelmir. Ich suche Leute, die keine Angst vor alten Steinen haben.“",
                "Er legt eine Karte auf den Tisch. Ein Tempel. Halbtags Marsch nördlich. „Hesindes Auge. Verschüttet seit dreihundert Jahren. Ich brauche, was darin liegt.“",
              ],
              failure: [
                "Du gehst zu ihm. Bevor du etwas sagen kannst, hebt er die Hand.",
                "„Nicht jetzt. Setzt euch. Trinkt. Ich finde euch.“",
                "Du gehst zurück, leicht beschämt. Brem kichert in seinen Krug.",
              ],
              table: { speaker: "TJARK", text: "Auftraggeber-Szene. Nehmt den Auftrag — oder nicht, eure Sache." },
            },
            next: "s2b2",
          },
          {
            id: "s2b2-listen-rumor",
            text: "(Streuner / Gaukler) Wir setzen uns an die Theke und fangen Gerede ein.",
            requires: ["streuner", "gaukler"],
            attrCheck: { attr: "IN" },
            outcome: {
              success: [
                "Du nuckelst an deinem Bier und hältst die Ohren offen.",
                "Innerhalb einer halben Stunde weißt du: Der Mann mit der Kapuze heißt Wendelmir. Akademist aus Punin. Sucht jemanden für die Ruine im Norden. Drei vor euch haben abgelehnt.",
                "Einer ist nie zurückgekommen.",
              ],
              table: { speaker: "BREM", text: "Drei Wochen Gold dafür, was Wendelmir zahlt. Hab ich gehört." },
            },
            next: "s2b2",
          },
          {
            id: "s2b1-elf-watch",
            text: "(Elf / Magier / Druide) Du beobachtest ihn, ohne dich zu rühren.",
            requires: ["elf", "magier", "druide"],
            outcome: {
              success: [
                "Du siehst seine Hände. Tinte unter den Fingernägeln, eine kleine Brandnarbe am rechten Daumen — ein Magier, ohne Zweifel.",
                "Sein Blick wandert öfter zu euch als zu sonst jemandem. Er wartet, bis ihr fertig getrunken habt.",
              ],
              table: { speaker: "YELVA", text: "Geduldiger Mann. Das macht mich nervös." },
            },
            next: "s2b2",
          },
          {
            id: "s2b1-dwarf-drink",
            text: "(Zwerg / Thorwaler / Krieger) Wir kümmern uns erstmal ums Bier. Der wartet schon.",
            requires: ["zwerg", "thorwaler", "krieger"],
            outcome: {
              success: [
                "Du leerst den ersten Krug in zwei Zügen. Der Wirt hebt anerkennend die Brauen.",
                "Beim zweiten Krug kommt der Mann von selbst. Setzt sich, ohne zu fragen. „Ihr habt das Aussehen von Leuten, die Arbeit brauchen.“",
              ],
              table: { speaker: "BREM", text: "DAS ist Diplomatie." },
            },
            next: "s2b2",
          },
          {
            id: "s2b1-wait",
            text: "Wir tun, als merkten wir ihn nicht — und warten ab.",
            outcome: {
              success: [
                "Ihr esst, trinkt, lacht etwas zu laut. Nach einer Weile erhebt sich der Fremde von selbst und kommt herüber.",
                "„Vier Augen sehen mehr als zwei. Sechs noch mehr. Darf ich?“ Er setzt sich, ohne die Antwort abzuwarten.",
              ],
              table: { speaker: "TJARK", text: "Geduld ist auch eine Tugend, sagen die Hesindiner." },
            },
            next: "s2b2",
          },
        ],
      },
      {
        id: "s2b2",
        illustration: imgTavernInt,
        narration: [
          "Während ihr verhandelt, eskaliert die Würfelrunde am Nachbartisch.",
          "Einer der Söldner — ein massiger Bursche mit Glatze — schmeißt seinen Krug gegen die Wand und brüllt.",
          "„Du hast falsch gewürfelt, du Lump!“ Er greift den Kleineren am Kragen. Stühle fliegen. Plötzlich seid ihr mittendrin.",
        ],
        options: [
          {
            id: "s2b2-fight",
            text: "(Krieger / Thorwaler / Zwerg) Wir mischen mit. Eine gute Schlägerei wärmt das Blut.",
            requires: ["krieger", "thorwaler", "zwerg"],
            combat: { enemyIds: ["glatzkopf"] },
            outcome: {
              success: [
                "Du landest dem Glatzkopf einen sauberen Schwinger ans Kinn. Er geht um wie ein gefällter Baum.",
                "Der Wirt brüllt, der Magister duckt sich, Brem hat schon einen halben Brotlaib in der Hand wie ein Wurfgeschoss.",
                "Drei Minuten später sitzt ihr wieder, leicht zerzaust. Wendelmir nickt euch anerkennend zu.",
              ],
              failure: [
                "Du gehst rein — und die Welt dreht sich. Sein Schwinger war schneller.",
                "Du wachst auf einer Bank auf. Brem hält dir Wasser hin. „Er hat gewonnen. Eindeutig.“",
              ],
              table: { speaker: "TJARK", text: "Faustkampf, kein Schaden auf LE — nur Beulen." },
            },
            next: "s2b3",
          },
          {
            id: "s2b2-trick",
            text: "(Gaukler / Streuner / Elf) Wir lenken ab. Ein Trick, ein Lied, irgendwas.",
            requires: ["gaukler", "streuner", "elf"],
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "Du springst auf den Tisch und beginnst ein Lied — laut, falsch, aber so absurd, dass alle anhalten.",
                "Der Glatzkopf vergisst seinen Streit, brüllt das Lied einfach mit. Krise abgewendet.",
                "Der Wirt wirft dir einen dankbaren Blick zu und stellt einen Krug ans Geländer.",
              ],
              failure: [
                "Du fängst an zu singen. Niemand hört zu. Der Glatzkopf schmeißt einen Krug nach dir.",
                "Du duckst dich rechtzeitig — der Krug trifft Brem.",
              ],
              table: { speaker: "YELVA", text: "Du hast einen schönen Gesang. Wirklich." },
            },
            next: "s2b3",
          },
          {
            id: "s2b2-magic",
            text: "(Magie) Du sprichst die Formel des Schlafs.",
            requires: "magic",
            attrCheck: { attr: "KL" },
            outcome: {
              success: [
                "Du murmelst, du gestikulierst — der Glatzkopf blinzelt, rülpst, und legt sich friedlich auf den Boden.",
                "Stille. Alle starren ihn an, dann dich. Wendelmir hebt eine Augenbraue: „Sauber.“",
              ],
              failure: [
                "Die Formel verpufft. Der Glatzkopf wird nicht müder, aber wütender — er hat Magie gespürt.",
                "„Hexer!“ brüllt er und stürmt los. Ihr kommt mit blauen Flecken davon.",
              ],
              table: { speaker: "TJARK", text: "Somnigravis, klassisch." },
            },
            next: "s2b3",
          },
          {
            id: "s2b2-druid-calm",
            text: "(Druide) Du legst dem Glatzkopf ruhig die Hand auf die Schulter.",
            requires: "druide",
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "Du sagst kein Wort. Du atmest tief, und plötzlich atmet er mit dir.",
                "Seine Faust öffnet sich, der Krug rutscht ihm aus der Hand. Er setzt sich, blickt drein wie ein Kind, das gleich weint.",
              ],
              failure: [
                "Er schüttelt deine Hand ab und brüllt. Es kommt zum Handgemenge — du kommst mit blauen Flecken davon.",
              ],
              table: { speaker: "YELVA", text: "Du bist… seltsam. Aber nützlich." },
            },
            next: "s2b3",
          },
          {
            id: "s2b2-stayout",
            text: "Wir halten uns raus und schauen zu.",
            outcome: {
              success: [
                "Ihr zieht euch in die Ecke zurück. Die Schlägerei ebbt nach drei Minuten von selbst ab.",
                "Der Wirt schmeißt beide Söldner raus. Der Magister wartet geduldig, bis alles vorbei ist.",
                "„Vernünftige Leute. Selten in diesen Tagen.“",
              ],
              table: { speaker: "BREM", text: "Vernünftig ist langweilig. Aber heile." },
            },
            next: "s2b3",
          },
        ],
      },
      {
        id: "s2b3",
        illustration: imgTavernInt,
        narration: [
          "Wendelmir lehnt sich vor. Seine Stimme wird leise.",
          "„Im Tempel liegt ein Buch — die Zweite Augenschrift. Sie öffnet, was geschlossen ist. Ich brauche sie. Ihr bekommt fünfzig Dukaten. Pro Person.“",
          "„Es gibt nur ein Problem. Der Tempel hat… Hüter. Nicht alle sind tot.“",
        ],
        options: [
          {
            id: "s2b3-accept",
            text: "Wir nehmen den Auftrag an.",
            outcome: {
              success: [
                "Yelva nickt langsam. Brem schlägt sich aufs Knie: „Fünfzig Dukaten kaufen viel Bier.“",
                "Ihr besiegelt den Handel mit einem Schluck. Morgen früh brecht ihr auf.",
              ],
              table: { speaker: "TJARK", text: "Gut. Dann reisen wir morgen. Schlaft schon mal." },
            },
            next: "scene3",
          },
          {
            id: "s2b3-haggle",
            text: "(Streuner / Thorwaler / Gaukler / Zwerg) Fünfzig sind ein Witz. Hundert.",
            requires: ["streuner", "thorwaler", "gaukler", "zwerg"],
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "Du blickst Wendelmir lange an. Er hält dem Blick stand — dann lacht er trocken.",
                "„Achtzig. Letztes Wort. Und ihr kriegt vorab fünf, für Vorräte.“",
                "Yelva tritt dich unterm Tisch — anerkennend.",
              ],
              failure: [
                "Du forderst hundert. Wendelmir steht auf.",
                "„Dann eben jemand anderes.“ Es kostet Brem zehn Minuten Schmeicheln, ihn zurück an den Tisch zu holen — und am Ende sind es vierzig, nicht fünfzig.",
              ],
              table: { speaker: "BREM", text: "Tu es. Tu es. Tu es." },
            },
            next: "scene3",
          },
          {
            id: "s2b3-info",
            text: "(Magie) Erzähl uns von den „Hütern“.",
            requires: "magic",
            outcome: {
              success: [
                "Wendelmir mustert dich. „Ein Magier, gut. Dann verstehst du.“",
                "„Es sind keine Untoten. Es sind… Spiegelbilder. Was ihr im Tempel werdet, war schon einmal dort.“",
                "Yelva legt langsam den Krug ab. „Großartig.“",
              ],
              table: { speaker: "TJARK", text: "Hesinde-Tempel. Nehmt das ernst." },
            },
            next: "scene3",
          },
          {
            id: "s2b3-warrior-promise",
            text: "(Krieger / Thorwaler / Zwerg) „Ich gebe dir mein Wort. Wenn das Buch existiert, bringen wir es.“",
            requires: ["krieger", "thorwaler", "zwerg"],
            outcome: {
              success: [
                "Du sagst es ohne zu blinzeln. Wendelmir mustert dich lange.",
                "„Ein Wort von einem Mann mit Klinge ist mehr wert als zehn Verträge.“ Er legt einen Beutel auf den Tisch. „Vorab. Damit ihr wisst, dass ich es ernst meine.“",
              ],
              table: { speaker: "BREM", text: "Das ist alte Schule. Ich mag das." },
            },
            next: "scene3",
          },
          {
            id: "s2b3-decline",
            text: "Wir lehnen ab. Ruinen sind nichts für uns.",
            outcome: {
              success: [
                "Du schiebst den Krug zur Seite. „Such dir andere, Magister.“",
                "Wendelmir nickt müde. „Schade.“ Brem starrt dich an, als hättest du ihm den letzten Heller geklaut.",
                "Am nächsten Morgen liegt ein Brief auf eurem Tisch — ein anderer Auftrag, dieselbe Ruine, dieselbe Bezahlung. Manche Wege findet man nicht, sie finden einen.",
              ],
              table: { speaker: "TJARK", text: "Auch Ablehnen ist eine Entscheidung. Das Schicksal ist hartnäckig." },
            },
            next: "scene3",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Akt 3 — Die Ruine
  // ──────────────────────────────────────────────────────────────────
  {
    id: "scene3",
    title: "Hesindes Auge — Die Ruine",
    beats: [
      {
        id: "s3b1",
        illustration: imgRuinEntrance,
        narration: [
          "Vollmond. Nebel kriecht zwischen den Säulen. Das steinerne Auge über dem Torbogen scheint euch anzusehen.",
          "Der Eingang ist offen — aber der Boden davor ist mit feinen Symbolen bedeckt. Eine Falle, oder eine Warnung.",
        ],
        options: [
          {
            id: "s3b1-cross-careful",
            text: "(Streuner / Elf / Gaukler) Wir untersuchen das Muster, bevor wir drüber gehen.",
            requires: ["streuner", "elf", "gaukler"],
            attrCheck: { attr: "FF" },
            outcome: {
              success: [
                "Du gehst auf die Knie, fährst die Linien mit dem Finger nach.",
                "Ein Spannungsdraht — fein wie Spinnenseide — verbindet zwei Säulen. Du durchtrennst ihn mit dem Dolch. Klick. Nichts geschieht.",
                "Über euch fällt ein Stein, dort wo ihr gestanden hättet.",
              ],
              failure: [
                "Du tippst eines der Symbole — und der Boden zischt. Eine Stichflamme schießt hoch.",
                "Du springst zurück, deine Augenbrauen sind kürzer als vorher. „Das war knapp.“",
              ],
              table: { speaker: "YELVA", text: "Das war IHR Problem, sagt sie. Nicht ihres." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-magic-disarm",
            text: "(Magie) Du erkennst das Muster. Eine Bann-Formel müsste reichen.",
            requires: "magic",
            attrCheck: { attr: "KL" },
            outcome: {
              success: [
                "Du sprichst drei Worte in der alten Sprache der Hesinde-Geweihten.",
                "Die Symbole leuchten kurz auf — und verlöschen. Das Eis im Boden taut, der Weg ist frei.",
              ],
              failure: [
                "Du sprichst — und die Symbole leuchten heller. Eine kalte Welle wirft euch zurück.",
                "Astrale Energie ist verbraucht, der Weg ist trotzdem versperrt. Brem geht voraus und löst die Falle physisch aus. Ihr verliert Zeit und Würde.",
              ],
              table: { speaker: "TJARK", text: "Hesinde-Symbole. Schwierige Probe." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-warrior-charge",
            text: "(Krieger / Thorwaler / Zwerg) Wir gehen einfach durch. Schild hoch.",
            requires: ["krieger", "thorwaler", "zwerg"],
            attrCheck: { attr: "GE" },
            outcome: {
              success: [
                "Du hebst den Schild über den Kopf und stürmst los.",
                "Ein Stein fällt — du fängst ihn mit dem Schild ab, das Krachen hallt durch die Ruine. Ihr seid drin.",
              ],
              failure: [
                "Du stürmst los. Ein Stein trifft dich an der Schulter. Du gehst zu Boden, aber lebst.",
                "Brem zieht dich rein. „War das wirklich nötig?“",
              ],
              table: { speaker: "BREM", text: "Subtil wie immer." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-dwarf-stone",
            text: "(Zwerg) Du klopfst die Steinplatten ab — Stein lügt nicht.",
            requires: "zwerg",
            attrCheck: { attr: "KL" },
            outcome: {
              success: [
                "Du gehst die Symbole entlang, klopfst leise mit dem Knöchel. Eine Platte klingt hohl.",
                "Du drückst sie mit dem Stiefel hinunter — ein dumpfes Klack, irgendwo löst sich etwas. Der Rest des Bodens ist sicher.",
              ],
              failure: [
                "Eine Platte gibt nach, schneller als du. Ein Funkenschauer, ein Geruch nach altem Schwefel. Du springst zurück, sengende Härchen am Bart.",
              ],
              table: { speaker: "BREM", text: "Stein versteht Stein. Logisch." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-druid-bless",
            text: "(Druide) Du bittest den Ort um Erlaubnis — leise, mit gebeugtem Haupt.",
            requires: "druide",
            attrCheck: { attr: "IN" },
            outcome: {
              success: [
                "Du kniest am Rand der Symbole, legst die Hand auf den kalten Stein.",
                "Etwas erkennt dich. Die Symbole leuchten kurz blau, dann blass — und werden durchsichtig. Der Weg ist offen, niemandem ein Schaden geschehen.",
              ],
              failure: [
                "Der Ort schweigt. Vielleicht ist Hesinde nicht in der Stimmung. Ihr müsst es anders versuchen — Brem geht voraus und löst die Falle aus. Es kostet Zeit.",
              ],
              table: { speaker: "TJARK", text: "Selten gesehen, aber sauber gespielt." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-go-around",
            text: "Wir suchen einen Weg drum herum. Es muss einen geben.",
            attrCheck: { attr: "IN" },
            outcome: {
              success: [
                "Ihr taucht in den Nebel, tastet die Mauer entlang. Hinter einem zerbrochenen Säulenfuß: ein schmaler Spalt, gerade breit genug.",
                "Brem zwängt sich zuerst durch. „Riecht nach Moder. Aber sicher.“ Ihr folgt — die Symbole bleiben unangetastet hinter euch.",
              ],
              failure: [
                "Eine halbe Stunde im Nebel und nichts. Ihr kommt zurück, müde, und Brem zieht den Dolch: „Dann eben durch.“ Er löst die Falle — knapp, aber niemand stirbt.",
              ],
              table: { speaker: "YELVA", text: "Manchmal ist drumherum die ganze Kunst." },
            },
            next: "s3b2",
          },
          {
            id: "s3b1-throw-stone",
            text: "Wir werfen Steine drauf, bis nichts mehr passiert.",
            outcome: {
              success: [
                "Brem hat schon einen halben Steinhaufen in den Händen. Ihr werft, eins nach dem anderen.",
                "Es zischt, es flammt, es klickt. Nach drei Minuten ist die Falle leer. Ihr geht durch — über frischen Ruß, aber unversehrt.",
              ],
              table: { speaker: "BREM", text: "Wissenschaft. Reine Wissenschaft." },
            },
            next: "s3b2",
          },
        ],
      },
      {
        id: "s3b2",
        illustration: imgRuinChamber,
        narration: [
          "Die innere Kammer ist… leer. Fast.",
          "In der Mitte: ein steinerner Altar, darauf ein aufgeschlagenes Buch. Davor, im Boden eingelassen: ein leuchtendes Auge. Es bewegt sich. Es schaut zu euch.",
          "Aus dem Schatten löst sich eine Gestalt. Sie sieht aus wie ihr — jeder von euch, ineinander verschmolzen. Sie spricht mit Wendelmirs Stimme:",
          "„Das Buch gehört euch nicht. Geht.“",
        ],
        options: [
          {
            id: "s3b2-fight",
            text: "Wir kämpfen. Das Buch nehmen wir mit.",
            combat: { enemyIds: ["spiegelhueter"] },
            outcome: {
              success: [
                "Es wird hässlich. Yelva singt eine Formel, die das Spiegelwesen für einen Atemzug zögern lässt.",
                "Brem rollt sich darunter durch und schnappt das Buch. Du hältst die Gestalt mit blanker Klinge in Schach.",
                "Dann ist es vorbei. Der Hüter zerfließt zu Asche. Das Auge im Boden erlischt.",
              ],
              failure: [
                "Es wird hässlich. Der Hüter ist schneller als jeder von euch.",
                "Ihr kommt raus, schwer verletzt, ohne Buch. Nur am Leben.",
              ],
              table: { speaker: "TJARK", text: "Endkampf. Würfle eure MU-Probe gemeinsam." },
            },
            next: "end",
          },
          {
            id: "s3b2-talk",
            text: "(Charisma) Wir reden mit ihm. Was will er wirklich?",
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "„Was bewachst du?“, fragst du leise.",
                "Die Gestalt zögert. „Eine Geschichte, die nicht erzählt werden darf.“ — „Wir können sie tragen“, sagst du. „Wir geben das Buch nur an Wendelmir, sonst niemandem.“",
                "Lange Pause. Dann tritt der Hüter zur Seite.",
              ],
              failure: [
                "Du redest, der Hüter hört nicht zu. Es kommt zum Kampf.",
                "Ihr kommt raus, mit dem Buch, aber Brem hinkt seitdem.",
              ],
              table: { speaker: "YELVA", text: "Das war… elegant. Ich nehme alles zurück." },
            },
            next: "end",
          },
          {
            id: "s3b2-druid-ritual",
            text: "(Druide) Du legst die Hand aufs Auge im Boden und bittest um Frieden.",
            requires: "druide",
            attrCheck: { attr: "IN" },
            outcome: {
              success: [
                "Du kniest. Du sprichst kein Wort. Du legst die Stirn auf den Stein.",
                "Das Auge im Boden schließt sich langsam. Der Hüter neigt den Kopf, fast respektvoll, und ist dann nicht mehr da.",
                "Das Buch liegt offen. Ihr nehmt es mit.",
              ],
              failure: [
                "Das Auge bleibt offen. Der Hüter reagiert nicht. Es kommt zum Kampf.",
              ],
              table: { speaker: "TJARK", text: "Ein sehr DSA-Moment. Schön gemacht." },
            },
            next: "end",
          },
          {
            id: "s3b2-elf-song",
            text: "(Elf) Du beginnst zu singen — leise, in der alten Sprache.",
            requires: "elf",
            attrCheck: { attr: "CH" },
            outcome: {
              success: [
                "Deine Stimme füllt die Kammer. Ein Lied, das älter ist als der Tempel.",
                "Der Hüter hebt den Kopf. Etwas in seinen Spiegelaugen ändert sich — Erkennen, vielleicht Heimweh. Er tritt zurück, ohne ein Wort.",
                "Das Buch liegt offen. Ihr nehmt es mit, behutsam.",
              ],
              failure: [
                "Du singst — der Hüter starrt dich an, als wäre dein Gesang ein Hohn. Es kommt zum Kampf. Ihr siegt knapp.",
              ],
              table: { speaker: "YELVA", text: "Singen funktioniert manchmal. Wer hätte das gedacht." },
            },
            next: "end",
          },
          {
            id: "s3b2-mage-banish",
            text: "(Magier) Du sprichst eine Bann-Formel gegen Spiegelwesen.",
            requires: "magier",
            attrCheck: { attr: "KL", modifier: -1 },
            outcome: {
              success: [
                "Du sprichst — und sprichst sauber. Drei Silben, ein Zeichen in die Luft.",
                "Der Hüter zerfließt wie Wasser auf heißem Stein. Das Auge im Boden schließt sich. Das Buch wartet.",
              ],
              failure: [
                "Die Formel hält ihn — eine Sekunde. Dann zerreißt sie. Es kommt zum Kampf, aber er ist geschwächt. Ihr gewinnt.",
              ],
              table: { speaker: "TJARK", text: "Bann-Formel auf einen Hesinde-Hüter. Mutig." },
            },
            next: "end",
          },
          {
            id: "s3b2-leave",
            text: "Wir gehen. Das Buch ist es nicht wert.",
            outcome: {
              success: [
                "Du senkst die Klinge, drehst dich um. Yelva folgt sofort. Brem schimpft, kommt aber mit.",
                "Hinter euch fällt das Tor zu. Die Symbole verlöschen. Die Welt ist eine Geschichte ärmer — und drei Leben reicher.",
                "Wendelmir wird enttäuscht sein. Aber ihr lebt.",
              ],
              table: { speaker: "BREM", text: "Fünfzig Dukaten. FÜNFZIG." },
            },
            next: "end",
          },
        ],
      },
    ],
  },
];

export function findBeat(beatId: string): { act: DsaAct; beat: DsaBeat } | null {
  for (const act of DSA_CAMPAIGN) {
    const beat = act.beats.find((b) => b.id === beatId);
    if (beat) return { act, beat };
  }
  return null;
}

export function firstBeatOf(actId: "scene1" | "scene2" | "scene3"): DsaBeat {
  const act = DSA_CAMPAIGN.find((a) => a.id === actId);
  if (!act) throw new Error(`Unknown act ${actId}`);
  return act.beats[0];
}

/** Prüft, ob die Klasse die Voraussetzung für eine Option erfüllt. */
export function meetsRequirement(
  classId: DsaClassId | null,
  magic: boolean,
  req: DsaRequirement | undefined,
): boolean {
  if (!req || req === "any") return true;
  if (!classId) return false;
  if (req === "magic") return magic;
  if (req === "noMagic") return !magic;
  if (Array.isArray(req)) return req.includes(classId);
  return req === classId;
}

/**
 * Würfelt eine vereinfachte Eigenschaftsprobe (3W6, statt 3W20 nach DSA1/2,
 * da unsere Eigenschaften nur 8..14 sind). Erfolg, wenn die Summe der drei
 * Würfel ≤ Eigenschaftswert + Modifikator. Gibt die einzelnen Würfel und
 * das Ergebnis zurück.
 */
export interface AttrCheckResult {
  rolls: [number, number, number];
  total: number;
  target: number;
  success: boolean;
}

export function rollAttrCheck(attrValue: number, modifier = 0): AttrCheckResult {
  const rolls: [number, number, number] = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  const total = rolls[0] + rolls[1] + rolls[2];
  const target = attrValue + modifier;
  return { rolls, total, target, success: total <= target };
}