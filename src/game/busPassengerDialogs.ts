/**
 * Gesprächsbäume der Fahrgäste auf Linie 28.
 *
 * Jedes Thema kann Nachfragen (`follow`) haben, diese wiederum eigene.
 * So entstehen echte kleine Gespräche statt zwei Fragen und Schluss.
 *
 * Lore-Regeln: Sektor 28 ist die Großeinheit, Quadranten sind Baugruppen,
 * E67/E71 sind Gebäude. Mandatsdeutsch sparsam einstreuen. Keine
 * Anspielungen auf das Schmerz-Radio.
 */

export type BusSpriteId = "elder" | "woman" | "girl" | "youth" | "worker" | "couple";

export interface BusTopic {
  id: string;
  /** Layards Gesprächsangebot (Menüzeile). */
  label: string;
  /** Antwort der Person, absatzweise. */
  lines: string[];
  /** Nachfragen, die sich erst aus dieser Antwort ergeben. */
  follow?: BusTopic[];
}

export interface BusPassenger {
  id: string;
  name: string;
  kicker: string;
  sprite: BusSpriteId;
  greeting: string;
  farewell: string;
  topics: BusTopic[];
}

export const BUS_PASSENGERS: BusPassenger[] = [
  {
    id: "gerda",
    name: "Gerda Pahlke",
    kicker: "Rentnerin, Quadrant 67, Block B",
    sprite: "woman",
    greeting: "„Setzen Sie sich ruhig. Der Bus wird nicht schneller, wenn man steht.“",
    farewell: "„Mehr weiß ich auch nicht. Und was ich weiß, hab ich schon gesagt.“",
    topics: [
      {
        id: "wetter",
        label: "Über das Wetter reden.",
        lines: [
          "„Feucht. Immer feucht. Bei uns im Block B haben sie die Fenster verordnungsgemäß dichtgemacht, jetzt schwitzt die Wand.“",
          "„Ich hab eine Eingabe geschrieben. Es erging Antwort: Wahrnehmungsschwankung. Also gut, dann schwitze ich eben falsch.“",
        ],
        follow: [
          {
            id: "eingabe",
            label: "Fragen, wie so eine Eingabe abläuft.",
            lines: [
              "„Zwei Blätter, eins bleibt bei Ihnen. Das Ihre ist das wichtigere, auch wenn es keiner liest.“",
              "„Nach sechs Wochen bekommen Sie einen Bescheid, der Ihnen mitteilt, dass Ihre Sache bearbeitet wird. Das ist kein Ergebnis, das ist ein Lebenszeichen.“",
            ],
            follow: [
              {
                id: "nachhaken",
                label: "Fragen, ob Nachhaken hilft.",
                lines: [
              "„Nachhaken hilft, wenn Sie freundlich und schriftlich sind. Freundlich allein ist Luft, schriftlich allein ist frech. Und ohne Sprawka in der Mappe sind Sie beides umsonst.“",
                ],
              },
              {
                id: "aufgeben",
                label: "Fragen, warum sie nicht aufgibt.",
                lines: [
                  "„Weil ich sonst nur noch warte. Und Warten ohne Blatt in der Hand ist etwas anderes als Warten mit.“",
                ],
              },
            ],
          },
          {
            id: "wand",
            label: "Nach der feuchten Wand fragen.",
            lines: [
              "„Sie ist dunkel geworden, kniehoch, wie ein Wasserstand. Mein Mann hätte gesagt: Das Haus atmet nicht mehr.“",
              "„Die Instandhaltung war da, hat gemessen und geschrieben: in Regel. Die Werte sind großzügig.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Ob es Neuigkeiten gibt.",
        lines: [
          "„Die Zählung. Alle reden von der Zählung. Angeblich kommt eine Bestandsaufnahme durch Sektor 28, Haus für Haus.“",
          "„Meine Nachbarin sagt, die schauen nicht in die Wohnungen, sondern in die Akten. Das ist schlimmer. In den Akten kann man sich nicht aufräumen.“",
        ],
        follow: [
          {
            id: "wer",
            label: "Fragen, wer zählt.",
            lines: [
              "„Leute mit Mappe und Ausweisband. Keine Uniform, das würde auffallen.“",
              "„Sie klingeln nicht, sie klopfen. Man erkennt sie am Klopfen: zweimal, gleich laut.“",
            ],
          },
          {
            id: "sorge",
            label: "Fragen, wovor sie Angst hat.",
            lines: [
              "„Angst ist zu groß. Sorge. Wenn man gezählt wird, kann man auch verschoben werden.“",
              "„Bei uns im Block sind zwei Wohnungen seit dem Frühjahr leer und trotzdem belegt. Fragen Sie mich nicht, wie das geht.“",
            ],
            follow: [
              {
                id: "leerstand",
                label: "Nach den leeren Wohnungen fragen.",
                lines: [
                  "„Zweiter Stock, gegenüber. Vorhänge zu, Post wird abgeholt, aber niemand geht rein oder raus.“",
                  "„Ich habe aufgehört hinzusehen. Das klingt feige. Ist es auch.“",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "frueher",
        label: "Nach früher fragen.",
        lines: [
          "„Früher fuhr die 28 alle zehn Minuten. Heute alle vierzig, dafür heißt sie jetzt Grundtaktleistung.“",
        ],
        follow: [
          {
            id: "besser",
            label: "Fragen, ob früher besser war.",
            lines: [
              "„Nein. Enger, lauter, dreckiger. Aber man wusste, welche Instanz man ärgern muss, wenn etwas fehlt.“",
              "„Heute ärgert man einen Vorgang. Der Vorgang nimmt das nicht persönlich.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hanno",
    name: "Hanno Brück",
    kicker: "Instandhaltung, Bestandspflege Nord",
    sprite: "worker",
    greeting: "„Vorsicht, der Kasten steht im Gang. Ist schwerer als er aussieht.“",
    farewell: "„Ich muss gleich raus. Zwei Steigleitungen und ein Aufzug, der nur abwärts will.“",
    topics: [
      {
        id: "arbeit",
        label: "Fragen, wohin es geht.",
        lines: [
          "„Nordkette. Drei Häuser, alle mit derselben Meldung: Es tropft, aber vorschriftsmäßig.“",
          "„Wir dürfen nichts austauschen, nur instand halten. Der Unterschied ist ein Formular breit.“",
        ],
        follow: [
          {
            id: "formular",
            label: "Nach diesem Formular fragen.",
            lines: [
              "„Ersatzbedarfsanzeige. Wer sie stellt, muss begründen, warum Instandhaltung nicht genügt. Wer das kann, wird gefragt, warum er es nicht früher konnte. Kurz: Das ließe sich prüfen.“",
              "„Also flicken wir. Ein Rohr aus dem Baujahr, drei Schellen aus diesem Jahr.“",
            ],
            follow: [
              {
                id: "haelt",
                label: "Fragen, wie lange das hält.",
                lines: [
                  "„Bis zur nächsten Frostnacht, wenn ich ehrlich bin. Aber dann ist es ein neuer Vorgang, und neue Vorgänge sind schneller als alte.“",
                ],
              },
            ],
          },
          {
            id: "kasten",
            label: "Nach dem Kasten im Gang fragen.",
            lines: [
              "„Werkzeug, Dichtungen, zwei Handapparate. Die Apparate sind das Wertvollste, deswegen sitze ich daneben.“",
            ],
          },
        ],
      },
      {
        id: "e67",
        label: "Über E67 sprechen.",
        lines: [
          "„E67? Erhöhter Instandhaltungsbedarf, steht so im Bestand. Heißt: Wir kommen, wenn was raucht.“",
          "„Die Leitstelle dort telefoniert übrigens über den eigenen Knoten. Praktisch, solange keiner umschaltet.“",
        ],
        follow: [
          {
            id: "knoten",
            label: "Nach dem Knoten fragen.",
            lines: [
              "„Jedes Haus hat einen. Ein grauer Kasten, plombiert, meistens im Keller neben der Wärmeübergabe.“",
              "„Wenn ein Apparat oben tot ist, liegt es fast immer unten am Kasten. Das ist keine Weisheit, das ist Statistik.“",
            ],
            follow: [
              {
                id: "wer_darf",
                label: "Fragen, wer daran darf.",
                lines: [
              "„Fernmeldedienst. Für uns ist das nicht vorgesehen. Und trotzdem trägt sich dort regelmäßig jemand ein, der weder das eine noch das andere ist.“",
                ],
              },
            ],
          },
          {
            id: "ruf",
            label: "Fragen, welchen Ruf E67 hat.",
            lines: [
              "„Ruhig. Zu ruhig für ein Haus dieser Größe. Bei uns in der Kartei ist das ein Merkmal, kein Lob.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ilva",
    name: "Ilva Kertesz",
    kicker: "Sachbearbeiterin, Vorlagenprüfung",
    sprite: "woman",
    greeting: "„Einen Moment, ich sortiere nur. Sonst liegt die 7 vor der 4, und dann geht das von vorne los.“",
    farewell: "„Ich muss die Mappe vor der Haltestelle fertig haben. Sonst prüfe ich morgen dasselbe zweimal.“",
    topics: [
      {
        id: "vorlagen",
        label: "Fragen, was sie prüft.",
        lines: [
          "„Vorlagen. Wer wo hindarf, mit welchem Blatt. Neunzig Prozent sind richtig ausgefüllt und trotzdem nicht in Regel.“",
          "„Das liegt am Vorgang, nicht an den Leuten. Der Vorgang mag es, wenn er dreimal läuft.“",
        ],
        follow: [
          {
            id: "fehler",
            label: "Nach dem häufigsten Fehler fragen.",
            lines: [
              "„Falsches Datum im Kopf. Nicht das heutige — das Datum der Zuständigkeit. Die meisten schreiben, wann sie schreiben, nicht, wann es gilt.“",
            ],
            follow: [
              {
                id: "trick",
                label: "Fragen, wie man es richtig macht.",
                lines: [
                  "„Datum der Zuständigkeit ist immer das Datum des Schreibens, auf das Sie sich beziehen. Kein eigenes erfinden.“",
                  "„Und unterschreiben Sie mit demselben Namenszug wie auf dem Vorblatt. Zwei Handschriften sind für uns zwei Personen.“",
                ],
              },
            ],
          },
          {
            id: "menschen",
            label: "Fragen, ob sie die Leute dahinter sieht.",
            lines: [
              "„Manchmal. Bei Wohnungswechseln fast immer. Da liest man zwischen den Zeilen mehr, als in den Zeilen steht.“",
              "„Es hilft niemandem, wenn ich mitleide. Es hilft, wenn ich das Blatt zulässig mache.“",
            ],
          },
        ],
      },
      {
        id: "zentrale",
        label: "Nach der Zentralverwaltungsstelle fragen.",
        lines: [
          "„Weit im Norden, hinter der Grünbrache. Von hier zwei Kilometer und ein bisschen Geduld.“",
          "„Gehen Sie nicht vor elf. Vor elf nehmen die nur Eigenes an.“",
        ],
        follow: [
          {
            id: "schalter",
            label: "Fragen, an welchen Schalter man muss.",
            lines: [
              "„Kommt auf Ihr Anliegen an. Alles mit Hinweisen läuft über die Annahme, nicht über die Auskunft. Die Auskunft nimmt nichts an, sie erklärt nur, warum.“",
            ],
            follow: [
              {
                id: "warten",
                label: "Fragen, wie lange man wartet.",
                lines: [
                  "„Mit Vorlage vierzig Minuten. Ohne Vorlage so lange, bis Sie eine haben.“",
                ],
              },
            ],
          },
          {
            id: "kollegen",
            label: "Fragen, wie die Leute dort sind.",
            lines: [
              "„Korrekt. Das ist nicht dasselbe wie freundlich, aber es ist verlässlicher.“",
            ],
          },
        ],
      },
      {
        id: "sprache",
        label: "Auf ihr Amtsdeutsch ansprechen.",
        lines: [
          "„Mandatsdeutsch, bitte. Es klingt kalt, aber es ist eindeutig. Eindeutig ist freundlich, nur merkt das keiner.“",
        ],
        follow: [
          {
            id: "privat",
            label: "Fragen, ob sie privat auch so spricht.",
            lines: [
              "„Ich habe meinem Neffen zum Geburtstag eine Zuwendung überreicht. Er hat gelacht. Es war trotzdem ein Fahrrad.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tibor",
    name: "Tibor Lang",
    kicker: "Lehrling, Versorgungswerk",
    sprite: "youth",
    greeting: "„Alles in Regel? Platz ist frei, ist eh alles frei um diese Zeit.“",
    farewell: "„Ich hör wieder Musik. Nichts für ungut.“",
    topics: [
      {
        id: "job",
        label: "Fragen, was er lernt.",
        lines: [
          "„Versorgung. Rohre, Druck, Protokolle. Vor allem Protokolle.“",
          "„Mein Meister sagt, wer den Druck versteht, versteht den Sektor. Ich glaub, er meint das nicht technisch.“",
        ],
        follow: [
          {
            id: "meister",
            label: "Nach seinem Meister fragen.",
            lines: [
              "„Alter Knochen, dreißig Jahre im Werk. Er schreibt jede Messung doppelt auf — einmal fürs Werk, einmal in ein eigenes Heft.“",
            ],
            follow: [
              {
                id: "heft",
                label: "Nach dem eigenen Heft fragen.",
                lines: [
                  "„Er sagt, die Werke werden alle paar Jahre bereinigt. Sein Heft nicht.“",
                  "„Ich hab reingeschaut. Zahlen, Uhrzeiten, manchmal ein Wort dazu. Meistens: unruhig.“",
                ],
              },
            ],
          },
          {
            id: "zukunft",
            label: "Fragen, ob er dabei bleiben will.",
            lines: [
              "„Drei Jahre muss ich. Danach — keine Ahnung. Wechseln ist ein Vorgang, bleiben ist keiner.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„Im Süden soll ein Haus komplett auf Sammelanschluss gelegt worden sein. Ein Apparat für vierzig Wohnungen.“",
          "„Angeblich freiwillig. Freiwillig heißt hier: Es stand im Aushang.“",
        ],
        follow: [
          {
            id: "warum",
            label: "Fragen, warum man das macht.",
            lines: [
              "„Wartungsaufwand, heißt es. Vierzig Apparate sind vierzig Fehlerquellen, einer ist einer.“",
              "„Und einer ist leichter mitzuhören. Das hat keiner gesagt. Das denkt sich jeder.“",
            ],
          },
          {
            id: "haus",
            label: "Fragen, welches Haus.",
            lines: [
              "„Irgendwas mit S im Südgürtel. Ich sag Ihnen keine Nummer, die ich nicht sicher weiß. Nummern verbreiten sich schneller als Menschen.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "roswitha",
    name: "Roswitha Dehn",
    kicker: "Hauswartin, Quadrant 71",
    sprite: "woman",
    greeting: "„Sie sind aus einem der Ergänzungsbauten, oder? Man sieht das am Schuhwerk.“",
    farewell: "„So. Jetzt kommt meine Haltestelle, und Sie wissen mehr als vorher.“",
    topics: [
      {
        id: "haus",
        label: "Über ihre Arbeit reden.",
        lines: [
          "„Vier Blöcke, ein Innenhof, zwei Bänke. Auf den Bänken sitzt niemand, weil sie im Zug stehen.“",
          "„Block D ist seit dem Rohrbruch nur unten bewohnt. Oben steht das Wasser in den Akten, nicht mehr im Haus.“",
        ],
        follow: [
          {
            id: "blockd",
            label: "Nach Block D fragen.",
            lines: [
              "„Drei Etagen geräumt, provisorisch. Das Provisorium ist jetzt im zweiten Jahr.“",
              "„Die Leute wurden verteilt. Zwei Familien sind in Ergänzungsbauten gekommen, eine ist nie angekommen. Verwaltungstechnisch schon.“",
            ],
            follow: [
              {
                id: "familie",
                label: "Nachhaken, was mit der Familie ist.",
                lines: [
                  "„Ich weiß es nicht. Ich habe zweimal gefragt und beim dritten Mal aufgehört, weil man mir gesagt hat, ich sei nicht zuständig.“",
                  "„Man ist nie zuständig. Man ist nur da.“",
                ],
              },
            ],
          },
          {
            id: "hausleute",
            label: "Fragen, wie die Bewohner sind.",
            lines: [
              "„Anständig, müde, misstrauisch in dieser Reihenfolge. Wer neu einzieht, ist drei Wochen freundlich und dann normal.“",
            ],
          },
        ],
      },
      {
        id: "hygiene",
        label: "Über Resonanz-Hygiene sprechen.",
        lines: [
          "„Ich hänge die Merkblätter auf, wie es verlangt ist. Lüften, Abstand von den Steigleitungen, nichts stapeln.“",
          "„Ob es hilft? Es beruhigt. Das ist auch etwas.“",
        ],
        follow: [
          {
            id: "faelle",
            label: "Fragen, ob es Fälle gab.",
            lines: [
              "„Eine Frau im Erdgeschoss hat wochenlang schlecht geschlafen. Kopfdruck, sagte sie, wie ein tiefer Ton, den man nicht hört.“",
              "„Nach der Umklemmung im Keller war es weg. Zufall, sagt die Verwaltung. Ich sage gar nichts, ich hänge Merkblätter auf.“",
            ],
            follow: [
              {
                id: "keller",
                label: "Nach der Umklemmung im Keller fragen.",
                lines: [
                  "„Da waren Leute, die keiner bestellt hat. Sie hatten Papiere, also habe ich aufgeschlossen.“",
                  "„Danach lief ein Kabel anders als vorher. Ich weiß, wie mein Keller aussieht.“",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "matthes",
    name: "Matthes Ovid",
    kicker: "Registerhilfe, Zentralbestand",
    sprite: "elder",
    greeting: "„Ich fahre diese Strecke seit neunzehn Jahren. Ich könnte die Schlaglöcher benennen.“",
    farewell: "„Genug. Ich zähle sonst wieder mit.“",
    topics: [
      {
        id: "register",
        label: "Nach seiner Arbeit fragen.",
        lines: [
          "„Ich führe Bestand. Nicht Menschen — Bestand. Menschen tauchen darin auf, als Merkmal.“",
          "„Das klingt hart. Aber der Bestand ist ehrlicher als die Aushänge.“",
        ],
        follow: [
          {
            id: "merkmal",
            label: "Fragen, welche Merkmale das sind.",
            lines: [
              "„Wohnlage, Beschäftigung, Vorgänge. Und ein Feld, das nur eine Zahl enthält, für die es keine Erklärung im Handbuch gibt.“",
            ],
            follow: [
              {
                id: "zahl",
                label: "Nach dieser Zahl fragen.",
                lines: [
                  "„Zwischen eins und neun. Die meisten haben eine Vier. Wer eine Sieben hat, bekommt seine Anträge langsamer bearbeitet.“",
                  "„Ich habe das nie geprüft. Ich habe es nur bemerkt. Bemerken ist nicht verboten.“",
                ],
              },
            ],
          },
          {
            id: "jahre",
            label: "Fragen, was sich in neunzehn Jahren geändert hat.",
            lines: [
              "„Früher stand in einer Zeile ein Satz. Heute steht ein Kürzel. Der Satz konnte irren, das Kürzel nicht.“",
            ],
          },
        ],
      },
      {
        id: "sektor",
        label: "Über Sektor 28 sprechen.",
        lines: [
          "„28 ist ein Randsektor. Wir bekommen die Vorschriften spät und die Reparaturen später.“",
          "„Dafür bemerkt uns auch niemand. Es hat beides.“",
        ],
        follow: [
          {
            id: "nachbarn",
            label: "Nach den Nachbarsektoren fragen.",
            lines: [
              "„27 im Osten, dichter bebaut, strenger geführt. 31 im Norden, hinter der Grünbrache, da sitzt die Verwaltung, die uns verwaltet.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„Es heißt, im Bestand tauchen Wohnungen doppelt auf. Einmal belegt, einmal geräumt. Dieselbe Nummer.“",
          "„Wahrscheinlich ein Übertragungsfehler. Wahrscheinlich.“",
        ],
        follow: [
          {
            id: "selbst",
            label: "Fragen, ob er es selbst gesehen hat.",
            lines: [
              "„Dreimal. Immer in Ergänzungsbauten, immer in oberen Etagen.“",
              "„Ich habe es einmal gemeldet. Zwei Wochen später war der Eintrag sauber. Nicht korrigiert — sauber.“",
            ],
            follow: [
              {
                id: "unterschied",
                label: "Fragen, was der Unterschied ist.",
                lines: [
                  "„Eine Korrektur hinterlässt eine Spur. Sauber heißt: Es war nie anders.“",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "juna",
    name: "Juna Petrak",
    kicker: "Küchenkraft, Kantine 3602",
    sprite: "woman",
    greeting: "„Riechen Sie das? Das bin ich. Kohl hält sich drei Buslinien lang.“",
    farewell: "„Ich muss noch Töpfe wiegen. Wiegen, nicht kochen. Fragen Sie nicht.“",
    topics: [
      {
        id: "kantine",
        label: "Über die Kantine reden.",
        lines: [
          "„Zwei Ausgaben, eine Verordnung, dreiundvierzig Absätze. Der längste Absatz regelt den Löffel.“",
          "„Wer nach halb eins kommt, bekommt Restbestandsverwertung. Schmeckt wie es heißt.“",
        ],
        follow: [
          {
            id: "loeffel",
            label: "Nach dem Löffel-Absatz fragen.",
            lines: [
              "„Größe, Material, Rückgabeweg. Es gab mal einen Vorfall mit Besteck, der nie erklärt wurde, und seitdem gibt es den Absatz.“",
            ],
            follow: [
              {
                id: "vorfall",
                label: "Nach dem Vorfall fragen.",
                lines: [
                  "„Ich war nicht dabei. Man sagt, jemand hat mit einem Löffel etwas aufgeschraubt, das verschraubt bleiben sollte.“",
                ],
              },
            ],
          },
          {
            id: "wiegen",
            label: "Fragen, warum sie Töpfe wiegt.",
            lines: [
              "„Ausgabemenge gegen Restmenge. Wenn die Differenz nicht stimmt, gilt das als Schwund, und Schwund ist ein Vorgang mit Namen dran.“",
            ],
          },
        ],
      },
      {
        id: "leute",
        label: "Nach den Leuten fragen.",
        lines: [
          "„Die aus E67 essen leise, die aus E71 reden dazwischen. Verwaltung isst allein und schnell.“",
        ],
        follow: [
          {
            id: "e67leute",
            label: "Fragen, was mit den Leuten aus E67 ist.",
            lines: [
              "„Höflich, aber sie gucken auf die Uhr, auch wenn keiner sie zurückerwartet. Das habe ich noch nie verstanden.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "eberhardt",
    name: "Eberhardt Simm",
    kicker: "Rentner, ehemals Fernmeldedienst",
    sprite: "elder",
    greeting: "„Sie halten sich an der Stange fest wie einer, der selten fährt.“",
    farewell: "„Reden macht müde. Zuhören auch. Gute Fahrt.“",
    topics: [
      {
        id: "fernmelde",
        label: "Nach seinem Beruf fragen.",
        lines: [
          "„Vierzig Jahre Leitungen. Kupfer, Klemmen, Handvermittlung. Ich weiß, wie ein Sektor klingt, wenn er still ist.“",
          "„Heute ist er nicht still. Er ist leise. Das ist ein Unterschied.“",
        ],
        follow: [
          {
            id: "unterschied",
            label: "Fragen, worin der Unterschied liegt.",
            lines: [
              "„Still ist, wenn nichts läuft. Leise ist, wenn viel läuft und keiner es hören soll.“",
              "„Legen Sie nachts ein Ohr an eine Steigleitung. Sie werden etwas hören, und es wird nicht Wasser sein.“",
            ],
            follow: [
              {
                id: "was",
                label: "Fragen, was man dann hört.",
                lines: [
                  "„Einen Ton, tief, gleichmäßig, mit kleinen Aussetzern. Aussetzer heißt: Da wird geschaltet.“",
                  "„Mehr sage ich nicht in einem Bus.“",
                ],
              },
            ],
          },
          {
            id: "handvermittlung",
            label: "Nach der Handvermittlung fragen.",
            lines: [
              "„Man kannte jede Stimme im Sektor. Das war Kontrolle und Fürsorge zugleich, und keiner hat sich damals überlegt, welches von beidem überwiegt.“",
            ],
          },
        ],
      },
      {
        id: "umschaltung",
        label: "Über Anschlüsse sprechen.",
        lines: [
          "„Wenn ein Apparat tot ist, ist selten der Apparat schuld. Meistens hat jemand einen Knoten umgeklemmt.“",
          "„Und wer umklemmt, trägt es ein. Irgendwo steht das immer.“",
        ],
        follow: [
          {
            id: "wo",
            label: "Fragen, wo das eingetragen wird.",
            lines: [
              "„Im Schaltbuch des Hauses, bei der Leitstelle. Nicht in der Zentrale — die bekommt nur Summen.“",
              "„Wenn Sie wissen wollen, wer Ihren Apparat abgeklemmt hat, müssen Sie zur Leitstelle, nicht zur Verwaltung.“",
            ],
            follow: [
              {
                id: "einsicht",
                label: "Fragen, ob man da Einsicht bekommt.",
                lines: [
                  "„Offiziell nein. Praktisch: Wer schon einmal am Schaltbuch stand, weiß, dass es offen liegt. Bücher, die keiner lesen darf, schließt man selten weg.“",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "carlo",
    name: "Carlo Winnig",
    kicker: "Aushilfsfahrer, Lieferdienst",
    sprite: "worker",
    greeting: "„Ich fahre sonst selbst. Als Fahrgast bin ich schlecht.“",
    farewell: "„So, Feierabendrichtung. Machen Sie's gut.“",
    topics: [
      {
        id: "strecke",
        label: "Nach der Strecke fragen.",
        lines: [
          "„Die 28 nimmt den Umweg über die Magistrale, weil die Abkürzung offiziell nicht befahrbar ist.“",
          "„Sie ist befahrbar. Sie ist nur nicht eingetragen.“",
        ],
        follow: [
          {
            id: "abkuerzung",
            label: "Nach der Abkürzung fragen.",
            lines: [
              "„Am Nordrand der Grünbrache entlang, alte Betonpiste, zwei Schranken ohne Schloss.“",
              "„Spart eine Viertelstunde. Kostet eine Erklärung, wenn einer fragt.“",
            ],
            follow: [
              {
                id: "gefahren",
                label: "Fragen, ob er sie fährt.",
                lines: [
                  "„Mit Ware nie. Leer manchmal. Leer ist man nur ein Fahrzeug, mit Ware ist man ein Vorgang.“",
                ],
              },
            ],
          },
          {
            id: "magistrale",
            label: "Über die Magistrale reden.",
            lines: [
              "„Vier Spuren, zwei benutzt. Die anderen zwei stehen für Verkehr bereit, den es nicht mehr gibt.“",
            ],
          },
        ],
      },
      {
        id: "ware",
        label: "Fragen, was er ausfährt.",
        lines: [
          "„Bewirtschaftetes Gut. Klingt gut, ist Mehl, Seife, Klebeband.“",
          "„Und Formulare. Formulare fahre ich am meisten.“",
        ],
        follow: [
          {
            id: "kisten",
            label: "Fragen, ob es auch andere Fracht gibt.",
            lines: [
              "„Manchmal graue Kisten, verplombt, Ziel Nord. Ich lade sie nicht selbst ein, das machen die Absender.“",
              "„Sie sind schwer für ihre Größe. Mehr will ich nicht wissen, und Sie auch nicht.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sanne",
    name: "Sanne Ruhl",
    kicker: "Schülerin, Bildungsstelle Süd",
    sprite: "girl",
    greeting: "„Wenn Sie fragen, ob ich schwänze: Unterricht ausgefallen. Ich hab keine Sprawka dafür, aber es stimmt.“",
    farewell: "„Ich muss lernen. Angeblich.“",
    topics: [
      {
        id: "schule",
        label: "Über die Schule reden.",
        lines: [
          "„Wir haben ein neues Fach: Ordnungskunde. Man lernt, welches Blatt zu welchem Schalter gehört.“",
          "„Geschichte fällt dafür aus. Passt ja: Geschichte ist auch nur ein Blatt, das keiner mehr annimmt.“",
        ],
        follow: [
          {
            id: "geschichte",
            label: "Fragen, was im Geschichtsunterricht kam.",
            lines: [
              "„Vor der Neuordnung: viel. Nach der Neuordnung: eine Übersicht mit Pfeilen. Alle Pfeile zeigen nach hier.“",
            ],
            follow: [
              {
                id: "glauben",
                label: "Fragen, ob sie das glaubt.",
                lines: [
                  "„Ich glaube den Zahlen und nicht den Pfeilen. Die Zahlen sind unbequemer, also sind sie wahrscheinlich echt.“",
                ],
              },
            ],
          },
          {
            id: "ordnungskunde",
            label: "Nach Ordnungskunde fragen.",
            lines: [
              "„Nützlich, ehrlich gesagt. Ich habe für meine Mutter einen Wohnungsantrag in Regel gebracht. Das kann sonst keiner bei uns.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„In E71 soll es eine Bibliothek geben, die Bücher rausgibt, die gar nicht geführt werden.“",
          "„Ich glaub das nicht. Aber ich würde gern hin.“",
        ],
        follow: [
          {
            id: "wer_sagt",
            label: "Fragen, wer das erzählt.",
            lines: [
              "„Ein Junge aus dem Nordgürtel. Er sagt, man muss den Bibliothekar nach etwas fragen, das es nicht gibt, dann holt er es.“",
              "„Das ist entweder sehr klug oder sehr erfunden.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "orwin",
    name: "Orwin Talbach",
    kicker: "Aufsicht, Grünbrache Nord",
    sprite: "elder",
    greeting: "„Sitzen Sie ruhig gegenüber. Ich schaue sowieso raus.“",
    farewell: "„Da vorne fängt mein Abschnitt an. Ich zähle jetzt Zäune.“",
    topics: [
      {
        id: "brache",
        label: "Über die Grünbrache fragen.",
        lines: [
          "„Zwischen den Wohngürteln liegt sie, breit wie zwei Quadranten. Offiziell Erholungsfläche.“",
          "„Es erholt sich dort nur das Gras. Und im Winter nicht mal das.“",
        ],
        follow: [
          {
            id: "warum_leer",
            label: "Fragen, warum sie leer ist.",
            lines: [
              "„Weil dort einmal etwas stand. Fundamente sind noch da, unter der Grasnarbe, in Reihen.“",
              "„Was dort stand, steht in keiner Übersicht, die ich habe. Und ich habe die Übersichten.“",
            ],
            follow: [
              {
                id: "fundamente",
                label: "Nach den Fundamenten fragen.",
                lines: [
                  "„Rechtecke, alle gleich groß, alle gleich ausgerichtet. Keine Wohnhäuser. Wohnhäuser stehen nie so ordentlich.“",
                ],
              },
            ],
          },
          {
            id: "aufsicht",
            label: "Fragen, worauf er aufpasst.",
            lines: [
              "„Auf Zäune und darauf, dass niemand quer geht. Meistens gehen Leute quer, und meistens sage ich nichts.“",
            ],
          },
        ],
      },
      {
        id: "wege",
        label: "Nach Abkürzungen fragen.",
        lines: [
          "„Trampelpfade gibt es, quer durch. Wer sie nimmt, spart zwanzig Minuten und riskiert eine Vorlage.“",
        ],
        follow: [
          {
            id: "risiko",
            label: "Fragen, wie hoch das Risiko ist.",
            lines: [
              "„Bei Tag gering. Bei Dämmerung sind die Kontrollen dichter, weil dann angeblich mehr passiert. Es passiert nicht mehr, es fällt nur mehr auf.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lisbeth",
    name: "Lisbeth Vahl",
    kicker: "Näherin, Heimarbeit",
    sprite: "woman",
    greeting: "„Nicht wundern, ich zähle Stiche. Man verlernt es sonst.“",
    farewell: "„Jetzt hab ich mich verzählt. Sehen Sie? Reden kostet.“",
    topics: [
      {
        id: "arbeit",
        label: "Nach ihrer Arbeit fragen.",
        lines: [
          "„Heimarbeit. Sie liefern Stoff, ich liefere Stück. Der Weg dazwischen ist meine Miete.“",
        ],
        follow: [
          {
            id: "lohn",
            label: "Fragen, ob das reicht.",
            lines: [
              "„Wenn ich nicht krank werde. Krankheit ist bei Stückarbeit kein Zustand, sondern ein Ausfall.“",
            ],
            follow: [
              {
                id: "hilfe",
                label: "Fragen, ob es dafür etwas gibt.",
                lines: [
                  "„Eine Ausgleichszuwendung. Man muss sie beantragen, während man krank ist. Wer das schafft, war nicht krank genug.“",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "sektor",
        label: "Über Sektor 28 sprechen.",
        lines: [
          "„Früher hieß das hier alles anders. Dann kam die Neuordnung und alles bekam Zahlen.“",
          "„Zahlen streiten nicht. Das ist der ganze Trick.“",
        ],
        follow: [
          {
            id: "namen",
            label: "Nach den alten Namen fragen.",
            lines: [
              "„Unser Gürtel hieß Buchhorst. Es gab keinen Buchenwald, aber es gab den Namen, und der war älter als die Häuser.“",
              "„Heute sagt keiner mehr Buchhorst. Nur meine Schwester, und die sagt auch sonst, was sie will.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„Man hört, in einem der Ergänzungsbauten prüfen sie neue Meldewege. Ohne Ankündigung.“",
        ],
        follow: [
          {
            id: "meldewege",
            label: "Fragen, was Meldewege sind.",
            lines: [
              "„Wer meldet was an wen. Bisher meldet der Hauswart. Angeblich soll künftig das Haus selbst melden.“",
              "„Fragen Sie mich nicht, wie ein Haus meldet. Ich nähe.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bruno",
    name: "Bruno Kessler",
    kicker: "Heizer, Fernwärmewerk",
    sprite: "worker",
    greeting: "„Fassen Sie die Stange oben an. Unten ist sie kalt, das ist unangenehm.“",
    farewell: "„Schicht. Man merkt es an den Händen, bevor man es an der Uhr sieht.“",
    topics: [
      {
        id: "waerme",
        label: "Über die Fernwärme reden.",
        lines: [
          "„Wir versorgen die Quadranten und die Ergänzungsbauten. Ein Kreis, viele Häuser, ein Druck.“",
          "„Wenn irgendwo einer am Regler dreht, merken wir das drei Kilometer weiter. Und wir schreiben es auf.“",
        ],
        follow: [
          {
            id: "regler",
            label: "Fragen, was passiert, wenn jemand dreht.",
            lines: [
              "„Erst nichts. Dann fällt der Druck im Strang, und der Strang meldet sich. Bei uns leuchtet dann eine Nummer.“",
              "„Wir schicken keinen raus. Wir tragen ein und warten, ob es nochmal kommt.“",
            ],
            follow: [
              {
                id: "wohnung",
                label: "Fragen, ob man das bis in die Wohnung merkt.",
                lines: [
                  "„In derselben Steigleitung ja: erst warm, dann zu warm, dann kalt. Wer das auslöst, hat zwanzig Minuten, bevor jemand nachsieht.“",
                ],
              },
            ],
          },
          {
            id: "werk",
            label: "Nach dem Werk fragen.",
            lines: [
              "„Zwei Kessel, einer läuft, einer wird gepflegt. Seit dem Winter läuft immer derselbe. Der andere wird sehr gründlich gepflegt.“",
            ],
          },
        ],
      },
      {
        id: "brummen",
        label: "Nach dem Brummen fragen.",
        lines: [
          "„Das Brummen? Bei Ostwind bis in die Korridore. Eingaben dazu laufen unter Wahrnehmungsschwankung.“",
          "„Ich hör es auch. Ich schreib nur keine Eingabe mehr.“",
        ],
        follow: [
          {
            id: "quelle",
            label: "Fragen, woher es kommt.",
            lines: [
              "„Nicht von uns. Unsere Pumpen haben eine andere Tonhöhe, das erkenne ich im Schlaf.“",
              "„Es kommt aus der Erde, nicht aus dem Rohr. Das ist alles, was ich dazu sage.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "annel",
    name: "Annel Sprott",
    kicker: "Postverteilung, Sektorzustellung",
    sprite: "woman",
    greeting: "„Wenn Sie auf ein Schreiben warten: Ich hab es nicht dabei.“",
    farewell: "„Meine Tasche wartet nicht. Bis dann.“",
    topics: [
      {
        id: "post",
        label: "Über die Zustellung reden.",
        lines: [
          "„Rohrpost innerhalb der Häuser, Bote zwischen den Quadranten. Dazwischen liegt die Wartezeit.“",
          "„Amtliches geht zuerst. Amtliches geht immer zuerst.“",
        ],
        follow: [
          {
            id: "wartezeit",
            label: "Fragen, wie lang die Wartezeit ist.",
            lines: [
              "„Innerhalb eines Quadranten ein Tag. Zwischen Quadranten drei. Zur Zentrale im Norden fünf, zurück sieben.“",
              "„Zurück dauert länger, weil zurück niemanden drängt.“",
            ],
          },
          {
            id: "verloren",
            label: "Fragen, ob Post verloren geht.",
            lines: [
              "„Selten. Häufiger wird sie umgeleitet. Das ist kein Verlust, das ist ein Zustellhinweis.“",
            ],
            follow: [
              {
                id: "umgeleitet",
                label: "Nachhaken, wer umleitet.",
                lines: [
                  "„Das steht auf einem Aufkleber, und der Aufkleber trägt eine Stellennummer, keinen Namen.“",
                  "„Ich habe mir zwei Nummern gemerkt. Beide gehören nach Norden.“",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "faecher",
        label: "Nach Postfächern fragen.",
        lines: [
          "„Wer kein eigenes Fach hat, bekommt es an den Knoten seines Hauses zugestellt. Steht so in der Zustellordnung.“",
        ],
        follow: [
          {
            id: "eigenes",
            label: "Fragen, wie man ein eigenes bekommt.",
            lines: [
              "„Antrag, Begründung, Zustimmung des Hauswarts. Die Begründung ist der schwierige Teil: Man muss erklären, warum die anderen nicht mitlesen sollen.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "veit",
    name: "Veit Ohlwein",
    kicker: "Antragsteller, ohne festen Vorgang",
    sprite: "elder",
    greeting: "„Sie sehen aus wie jemand, der weiß, welcher Schalter offen hat.“",
    farewell: "„Egal. Ich fahre einfach mit bis zur Endstelle und wieder zurück.“",
    topics: [
      {
        id: "antrag",
        label: "Fragen, worum es geht.",
        lines: [
          "„Wohnungswechsel. Seit vierzehn Monaten. Das Dossier ist vollständig, nur keine Instanz zuständig.“",
          "„Sie schicken mich von Norden nach Süden und zurück. Ich kenne die Linie 28 auswendig.“",
        ],
        follow: [
          {
            id: "grund",
            label: "Fragen, warum er wechseln will.",
            lines: [
              "„Vierter Stock, kein Aufzug, ein Knie. Das ist die kurze Fassung.“",
              "„Die lange Fassung steht in Blatt 2, und Blatt 2 liest niemand, weil Blatt 1 nicht zulässig ist.“",
            ],
            follow: [
              {
                id: "blatt1",
                label: "Fragen, was an Blatt 1 fehlt.",
                lines: [
                  "„Ein Stempel der abgebenden Stelle. Die abgebende Stelle sagt, sie sei erst zuständig, wenn die aufnehmende zugestimmt hat.“",
                  "„Die aufnehmende stimmt zu, wenn ein Stempel da ist. Sie sehen das Problem. Alle sehen es. Es ist trotzdem korrekt.“",
                ],
              },
            ],
          },
          {
            id: "hoffnung",
            label: "Fragen, ob er noch hofft.",
            lines: [
              "„Ich hoffe nicht mehr, ich fahre. Das ist ruhiger und kostet dasselbe.“",
            ],
          },
        ],
      },
      {
        id: "rat",
        label: "Um einen Rat bitten.",
        lines: [
          "„Nehmen Sie nie das letzte Blatt aus der Hand. Solange Sie es halten, sind Sie im Vorgang.“",
        ],
        follow: [
          {
            id: "mehr",
            label: "Um mehr solcher Regeln bitten.",
            lines: [
              "„Zweitens: Fragen Sie nie, ob etwas geht. Fragen Sie, welches Blatt es braucht. Die erste Frage kann verneint werden, die zweite nicht.“",
              "„Drittens: Merken Sie sich Namen. Stellen wechseln, Menschen bleiben sitzen.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mirko",
    name: "Mirko Zant",
    kicker: "Wachdienst, Objektschutz",
    sprite: "worker",
    greeting: "„Ausweis brauch ich nicht. Ich hab Feierabend.“",
    farewell: "„Und jetzt schlafe ich im Sitzen. Kann ich gut.“",
    topics: [
      {
        id: "dienst",
        label: "Über seinen Dienst reden.",
        lines: [
          "„Nachts an einem Tor, an dem nichts passiert. Das Schwierige ist, wach zu bleiben, nicht mutig.“",
        ],
        follow: [
          {
            id: "tor",
            label: "Fragen, welches Tor.",
            lines: [
              "„Nordrand, Zufahrt zu einer Anlage ohne Schild. Lieferungen kommen nachts, immer dieselben zwei Fahrzeuge.“",
            ],
            follow: [
              {
                id: "anlage",
                label: "Fragen, was dort steht.",
                lines: [
                  "„Ich stehe außen. Innen ist ein flacher Bau und ein Kamin, der nicht raucht.“",
                  "„Ich frage nicht. Wer nicht fragt, bleibt am Tor, und am Tor ist es warm.“",
                ],
              },
            ],
          },
          {
            id: "wachbleiben",
            label: "Fragen, wie er wach bleibt.",
            lines: [
              "„Rechnen. Ich addiere Kennzeichen. Wenn ich bei einer Zahl zweimal aufwache, war das Fahrzeug zweimal da.“",
            ],
          },
        ],
      },
      {
        id: "zentrale",
        label: "Über die Zentralverwaltungsstelle sprechen.",
        lines: [
          "„Da kommen Sie ohne Vorlage nicht mal in den Vorraum. Der Vorraum hat einen eigenen Vorraum.“",
          "„Und lächeln Sie nicht am Tresen. Das kommt merkwürdig.“",
        ],
        follow: [
          {
            id: "kollegen",
            label: "Fragen, wie die Wache dort arbeitet.",
            lines: [
              "„Zu zweit, immer. Einer spricht, einer schreibt. Der Schreibende ist der, auf den Sie achten müssen.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hedda",
    name: "Hedda Nolt",
    kicker: "Bibliothekshilfe, Bestand Süd",
    sprite: "woman",
    greeting: "„Vorsicht, die Mappe ist offen. Wenn das fliegt, sortiere ich bis morgen.“",
    farewell: "„Ich muss die Karten noch ordnen. Nach Nummer, nicht nach Sinn.“",
    topics: [
      {
        id: "buecher",
        label: "Über Bücher reden.",
        lines: [
          "„Wir führen nur geprüfte Titel. Was nicht geführt ist, ist nicht verboten — es ist nicht vorhanden.“",
          "„Der Unterschied ist bequem. Für uns.“",
        ],
        follow: [
          {
            id: "pruefung",
            label: "Fragen, wer prüft.",
            lines: [
              "„Eine Stelle im Norden. Wir bekommen Listen, keine Begründungen. Auf der letzten Liste standen drei Titel, die wir gar nicht hatten.“",
            ],
            follow: [
              {
                id: "drei",
                label: "Nach diesen drei Titeln fragen.",
                lines: [
                  "„Zwei Romane und ein Bildband. Ich habe die Namen behalten, weil man Namen behält, die man streichen soll.“",
                  "„Fragen Sie mich in einem ruhigeren Bus.“",
                ],
              },
            ],
          },
          {
            id: "lieblingsbuch",
            label: "Nach ihrem Lieblingsbuch fragen.",
            lines: [
              "„Ein Handbuch über Brückenbau von vor der Neuordnung. Es erklärt geduldig, wie etwas trägt. Das ist beruhigend.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„Es gibt Häuser mit eigenen Regalen im Flur. Bewohnerbestand nennen sie das. Geduldet, solange keiner fragt.“",
        ],
        follow: [
          {
            id: "e71",
            label: "Nach der Bibliothek in E71 fragen.",
            lines: [
              "„Geführt, ordentlich, freundlicher Bibliothekar. Und er hat ein Hinterzimmer, in dem er sehr lange nach Dingen sucht.“",
              "„Wer lange sucht, findet manchmal, was nicht im Regal steht.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "pawel",
    name: "Pawel Strunk",
    kicker: "Monteur, Aufzugsdienst",
    sprite: "worker",
    greeting: "„Nicht wundern, ich rieche nach Fett. Das ist Aufzugsfett, das riecht anders als Küchenfett.“",
    farewell: "„Nächster Halt, nächster Schacht.“",
    topics: [
      {
        id: "aufzug",
        label: "Über Aufzüge reden.",
        lines: [
          "„In den Ergänzungsbauten hängen alte Anlagen. Sie fahren, aber sie erzählen dabei.“",
          "„Wenn einer im Schacht summt, ist es meistens die Bremse. Meistens.“",
        ],
        follow: [
          {
            id: "und_sonst",
            label: "Fragen, was es sonst sein kann.",
            lines: [
              "„Ein Kabel, das mitschwingt, weil es nicht dorthin gehört, wo es liegt.“",
              "„In zwei Häusern habe ich Kabel im Schacht gefunden, die nicht zur Anlage gehören. Ich habe es gemeldet und nie eine Antwort bekommen.“",
            ],
            follow: [
              {
                id: "wohin",
                label: "Fragen, wohin die Kabel führen.",
                lines: [
                  "„Nach unten. Immer nach unten, in den Keller, an den Knoten. Nach oben führt keins.“",
                ],
              },
            ],
          },
          {
            id: "gefahr",
            label: "Fragen, ob das gefährlich ist.",
            lines: [
              "„Die Anlagen? Nein. Sie sind alt, aber sie sind ehrlich. Sie kündigen an, bevor sie stehenbleiben.“",
            ],
          },
        ],
      },
      {
        id: "etagen",
        label: "Nach gesperrten Etagen fragen.",
        lines: [
          "„Manche Etagen sind aus dem Tableau genommen. Nicht abgeklemmt — nur unbeschriftet.“",
          "„Wer die Zahl kennt, kommt trotzdem hin. Ich sag das nicht gern laut.“",
        ],
        follow: [
          {
            id: "wie",
            label: "Fragen, wie das technisch geht.",
            lines: [
              "„Der Taster ist da, nur die Blende fehlt. Man drückt, wo nichts steht, und der Korb fährt.“",
              "„Wenn Sie das machen, machen Sie es einmal und nicht am Vormittag.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "traudel",
    name: "Traudel Barsch",
    kicker: "Kassiererin, Verkaufsstelle 12",
    sprite: "woman",
    greeting: "„Wenn Sie Wechselgeld brauchen: Ich hab keins. Berufskrankheit.“",
    farewell: "„So, ich sortiere jetzt Marken. Bis zur Haltestelle schaff ich das.“",
    topics: [
      {
        id: "laden",
        label: "Über den Laden reden.",
        lines: [
          "„Wir bekommen zugeteilt, nicht bestellt. Diese Woche viel Essig, wenig Mehl.“",
          "„Die Leute fragen mich, warum. Ich sag: Zuteilungsschwankung. Dann nicken sie.“",
        ],
        follow: [
          {
            id: "warum_wirklich",
            label: "Fragen, was wirklich dahintersteckt.",
            lines: [
              "„Die Zuteilung folgt der Bestandsmeldung, und die Bestandsmeldung schreibe ich. Wenn ich etwas als knapp melde, kommt weniger, weil knapp gilt als eingespielt.“",
              "„Ich habe aufgehört, knapp zu melden. Jetzt kommt zu viel Essig, aber genug Mehl.“",
            ],
            follow: [
              {
                id: "erlaubt",
                label: "Fragen, ob das erlaubt ist.",
                lines: [
                  "„Es ist nicht falsch. Es ist nur nicht so gemeint. Das ist der Raum, in dem man hier atmet.“",
                ],
              },
            ],
          },
          {
            id: "kunden",
            label: "Nach den Kunden fragen.",
            lines: [
              "„Morgens die Schicht, mittags die Alten, abends die, die es sich nicht anmerken lassen wollen.“",
            ],
          },
        ],
      },
      {
        id: "sektor",
        label: "Über Sektor 28 sprechen.",
        lines: [
          "„Der Sektor ist groß und lahm. Aber er verschwindet nicht. Das schätzen die Leute mehr, als sie zugeben.“",
        ],
        follow: [
          {
            id: "weggehen",
            label: "Fragen, ob sie weg möchte.",
            lines: [
              "„Wohin? Woanders ist derselbe Vorgang mit anderer Nummer. Ich bleibe da, wo ich die Nummern kenne.“",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rufus",
    name: "Rufus Denk",
    kicker: "Setzer, Druckerei Sektorblatt",
    sprite: "youth",
    greeting: "„Achtung, Finger. Frisch gedruckt färbt ab.“",
    farewell: "„Ich muss die Fahne noch lesen. Zweimal, sonst steht morgen Unsinn drin.“",
    topics: [
      {
        id: "blatt",
        label: "Über das Sektorblatt reden.",
        lines: [
          "„Vier Seiten. Eine Seite Bekanntmachungen, zwei Seiten Zahlen, eine Seite Wetter und Resonanz.“",
          "„Die Zahlen sind ehrlich. Nur die Überschriften nicht.“",
        ],
        follow: [
          {
            id: "zahlen",
            label: "Fragen, was in den Zahlen steht.",
            lines: [
              "„Versorgungswerte, Instandhaltungsquote, Belegungsstand. Wer drei Ausgaben nebeneinanderlegt, sieht mehr als in drei Reden.“",
            ],
            follow: [
              {
                id: "gesehen",
                label: "Fragen, was er dabei gesehen hat.",
                lines: [
                  "„Der Belegungsstand im Nordgürtel steigt seit dem Frühjahr, obwohl dort nicht gebaut wird.“",
                  "„Entweder wohnen die Leute enger, oder jemand rechnet anders. Beides steht nicht in der Überschrift.“",
                ],
              },
            ],
          },
          {
            id: "arbeit",
            label: "Fragen, wie das Setzen läuft.",
            lines: [
              "„Nachts. Blei, Winkelhaken, Korrekturfahne. Alt, aber es geht nichts verloren, was man in der Hand hatte.“",
            ],
          },
        ],
      },
      {
        id: "geruecht",
        label: "Nach Gerüchten fragen.",
        lines: [
          "„Diese Woche mussten wir eine Meldung dreimal umsetzen. Am Ende stand da nur noch: Vorgang läuft.“",
          "„Wenn eine Meldung schrumpft, ist etwas dran. So merkt man das.“",
        ],
        follow: [
          {
            id: "erste",
            label: "Fragen, was zuerst dastand.",
            lines: [
              "„In der ersten Fassung ging es um eine Bestandsaufnahme in Sektor 28, mit Datum und Stellennummer.“",
              "„In der zweiten fehlte das Datum. In der dritten die Stellennummer. Übrig blieb der Vorgang.“",
            ],
            follow: [
              {
                id: "notiert",
                label: "Fragen, ob er sich das notiert hat.",
                lines: [
                  "„Setzer werfen keine Fahnen weg. Sagen wir so: Wenn Sie das Datum jemals brauchen, fragen Sie in der Druckerei nach der Fahne von Dienstag.“",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "eheleuteRitter",
    name: "Eheleute Ritter",
    kicker: "Beide um die 40, unterwegs zu einem Termin",
    sprite: "couple",
    greeting:
      "Frau Ritter: „Entschuldigen Sie. Sagen Sie doch bitte einmal etwas dazu, Sie sind unbefangen.“",
    farewell:
      "Herr Ritter: „Wir klären das zu Hause. Also: nie.“",
    topics: [
      {
        id: "einmischen",
        label: "Sich einmischen.",
        lines: [
          "Frau Ritter: „Er behauptet, braune Eier seien braun, weil die Hühner braun sind. Das ist der Stand nach zwanzig Jahren Ehe.“",
          "Herr Ritter: „Sie behauptet, es habe mit dem Ohr zu tun. Mit dem Ohrläppchen des Huhns.“",
          "Frau Ritter: „Ohrscheibe. Es heißt Ohrscheibe, Manfred.“",
        ],
        follow: [
          {
            id: "ohrscheibe",
            label: "Fragen, was eine Ohrscheibe ist.",
            lines: [
              "Frau Ritter: „Ein kleiner Fleck am Kopf des Huhns. Weiß oder rot. Danach richtet sich die Schale, hat meine Mutter gesagt.“",
              "Herr Ritter: „Ihre Mutter hat auch gesagt, Radio hört man besser bei offener Tür.“",
              "Frau Ritter: „Und das stimmt.“",
            ],
          },
          {
            id: "partei",
            label: "Sich vorsichtig auf eine Seite schlagen.",
            lines: [
              "Herr Ritter: „Sehen Sie, Hedwig. Der Herr gibt mir recht.“",
              "Frau Ritter: „Der Herr will aussteigen, ohne dass wir ihn festhalten. Das ist etwas anderes.“",
            ],
          },
          {
            id: "wielange",
            label: "Fragen, wie lange das schon geht.",
            lines: [
              "Frau Ritter: „Seit Haltestelle Ringstraße.“",
              "Herr Ritter: „Seit 1979.“",
              "Frau Ritter: „Das war das Thema Wandfarbe. Das ist ein anderes Verfahren.“",
            ],
          },
        ],
      },
      {
        id: "ziel",
        label: "Nach dem Ziel fragen.",
        lines: [
          "Herr Ritter: „Zentralverwaltungsstelle. Wohnungsangelegenheit, angeblich nur eine Unterschrift.“",
          "Frau Ritter: „Es ist nie nur eine Unterschrift. Es sind immer zwei und eine fehlende.“",
        ],
        follow: [
          {
            id: "wohnung",
            label: "Nach der Wohnungsangelegenheit fragen.",
            lines: [
              "Frau Ritter: „Bei uns war eine Begehung. Zwei Leute mit Mappe, sehr freundlich, sehr schnell.“",
              "Herr Ritter: „Sie haben nicht die Wohnung gemessen, sondern die Zimmer gezählt. Das ist ein Unterschied.“",
            ],
            follow: [
              {
                id: "beleg",
                label: "Fragen, ob sie einen Beleg bekommen haben.",
                lines: [
                  "Herr Ritter: „Ein Blatt. Ohne Stellennummer.“",
                  "Frau Ritter: „Und ohne Datum. Ich habe es trotzdem in die Mappe getan, zwischen die Sprawka und den Zählerstand.“",
                  "Herr Ritter: „Es ließe sich prüfen, sagte der Jüngere. Da wusste ich, dass wir hinfahren müssen.“",
                ],
              },
              {
                id: "zaehlung",
                label: "Fragen, ob das mit der Zählung zu tun hat.",
                lines: [
                  "Frau Ritter: „Im Haus reden alle davon. Bei den Bienerts haben sie zweimal geklopft, gleich laut.“",
                  "Herr Ritter: „Hedwig.“",
                  "Frau Ritter: „Was denn. Der Herr fährt auch dorthin. Dann weiß er wenigstens, was ihn erwartet.“",
                ],
              },
            ],
          },
          {
            id: "termin",
            label: "Fragen, ob sie einen Termin haben.",
            lines: [
              "Herr Ritter: „Vorsprache ohne Terminbindung. Das heißt: Wir sitzen, bis jemand Mitleid hat.“",
              "Frau Ritter: „Er nimmt immer belegte Brote mit. Das ist das einzig Vernünftige an ihm.“",
            ],
          },
        ],
      },
      {
        id: "streitkultur",
        label: "Fragen, ob sie immer so miteinander reden.",
        lines: [
          "Frau Ritter: „Nur wenn wir wach sind.“",
          "Herr Ritter: „Es ist kein Streit. Es ist eine laufende Abstimmung ohne Ergebnis.“",
        ],
        follow: [
          {
            id: "geheimnis",
            label: "Nach dem Geheimnis der langen Ehe fragen.",
            lines: [
              "Herr Ritter: „Man darf nie beide gleichzeitig recht haben wollen.“",
              "Frau Ritter: „Er meint: Er hat immer recht, und ich habe immer die Mappe.“",
            ],
          },
        ],
      },
      {
        id: "weiter",
        label: "Weiterstreiten lassen.",
        lines: [
          "Frau Ritter: „Sehr freundlich. Also: Ohrscheibe.“",
          "Herr Ritter: „Huhn.“",
        ],
      },
    ],
  },
];

export function pickBusPassengers(count: number): BusPassenger[] {
  const pool = [...BUS_PASSENGERS];
  const out: BusPassenger[] = [];
  const usedSprites = new Set<BusSpriteId>();
  while (out.length < count && pool.length && usedSprites.size < 4) {
    const idx = Math.floor(Math.random() * pool.length);
    const passenger = pool.splice(idx, 1)[0];
    if (usedSprites.has(passenger.sprite)) continue;
    usedSprites.add(passenger.sprite);
    out.push(passenger);
  }
  return out;
}

export function getBusPassenger(id: string): BusPassenger | undefined {
  return BUS_PASSENGERS.find((p) => p.id === id);
}
