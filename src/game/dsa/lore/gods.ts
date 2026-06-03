/**
 * Die Zwölfgötter — Detailbriefs für den LLM-Meister. Nur was er
 * pro Geweihten-NSC braucht: Beiname, Tempel, Festtag, Liturgie-Eigenheit,
 * typische Gebote/Tabus, Schattenseiten. DSA3-Stand ("Götter und Dämonen").
 * Eigene Formulierung. Die Grundstimmung der Zwölfgötterwelt ist
 * farbenfroh und heldenmythisch — Schattenseiten (Inquisition, Sklaven-
 * kult, Schwarzmagie-Verfolgung) sind Lore-wahr und sollen nur dort
 * auftauchen, wo das Abenteuer sie wirklich braucht.
 */

export type DsaGodId =
  | "praios" | "rondra" | "efferd" | "travia" | "boron" | "hesinde"
  | "firun" | "tsa" | "phex" | "peraine" | "ingerimm" | "rahja";

export interface GodBrief {
  id: DsaGodId;
  name: string;
  beiname: string;
  domain: string;
  symbol: string;
  colors: string;
  festtag: string;
  liturgie: string;
  tabus: string;
  schatten: string;
  greetingNote: string;
}

export const DSA_GODS: Record<DsaGodId, GodBrief> = {
  praios: {
    id: "praios", name: "Praios", beiname: "der Herr des Lichts, Götterfürst",
    domain: "Sonne, Recht, Ordnung, Wahrheit",
    symbol: "goldenes Sonnenrad mit zwölf Strahlen", colors: "Gold und Weiß",
    festtag: "Sommersonnenwende (Praios 1), kleinere Sonnenfeste jeden Monatsersten",
    liturgie: "Streng, formell, lateinisch-anmutendes Garethi. Geweihte tragen weiße Roben mit Goldborte, Tonsur, oft ein Sonnenmedaillon. Tempel sind hell, weiß, mit goldenen Sonnenrädern an der Decke.",
    tabus: "Lüge, Magie ohne kirchliche Aufsicht, Anbetung der Namenlosen, Schattenwerk, Nachtkulte.",
    schatten: "Die PRAIOS-INQUISITION verfolgt Schwarzmagier, Hexen, Dämonenpaktierer und Anhänger der Namenlosen — ohne Verhör, oft mit Scheiterhaufen. Auch Hesinde-Magier werden misstrauisch beäugt. Ein Inquisitor mit Sonnen-Hellebarde ist eine reale Bedrohung für jede Magierfigur.",
    greetingNote: "»Im Lichte des Herrn.« Anrede je nach Rang: einfacher Praios-Geweihter = Euer Gnaden, Tempelvorsteher = Euer Hochwürden, Erzpriester = Euer Ehrwürden, Hochgeweihter Bote = Eure Erhabene Weisheit.",
  },
  rondra: {
    id: "rondra", name: "Rondra", beiname: "die Löwin, Herrin der Stürme",
    domain: "Sturm, Schwert, Ehre, ehrlicher Kampf",
    symbol: "Löwenkopf oder geflügeltes Schwert", colors: "Rot und Weiß",
    festtag: "Schwertleiten im Rondra-Monat, Rondrakomtur am 1. Boron",
    liturgie: "Knapp, militärisch, mit Schwertkuss. Geweihte (Rondrianer/Rondriana) tragen Kettenhemd unter dem roten Mantel, einen Heldenhammer oder ein Schwert offen am Gürtel. Tempel sind oft mit Waffen geschmückt, der Altar ein Amboss.",
    tabus: "Hinterhalt, Gift, Angriff auf Wehrlose, Lüge im Zweikampf, Schwarzmagie. Ein Rondrianer wirft NIEMALS den ersten Stein im Hinterhalt.",
    schatten: "Ihre Orden (Schwerter des Greifen, Theaterritter) führen blutige Feldzüge gegen Orks, Heiden und ›Treulose‹. Ehrenduelle enden tödlich, Beleidigungen werden mit Stahl beantwortet.",
    greetingNote: "»Mit Stahl und Ehre.« Ein Rondrianer reicht die Hand vom Schwertarm, nie die Linke.",
  },
  efferd: {
    id: "efferd", name: "Efferd", beiname: "der Herr der Wasser",
    domain: "Meer, Wetter, Stürme, Quellen, Reisen über Wasser",
    symbol: "Dreizack, Welle, weißer Wal", colors: "Meeresgrün und Silber",
    festtag: "Efferd 30 (Sturmnacht), Schiffsweihen im ganzen Efferd-Monat",
    liturgie: "Locker, salzig, oft draußen am Wasser. Geweihte (Efferd-Priester) tragen seegrüne Roben, Muschelschmuck, Salzhände. In Thorwal verehrt als SWAFNIR, Sohn des Efferd, in Walgestalt — eigene Priesterschaft, andere Riten.",
    tabus: "Wasservergiftung, Schiffsdiebstahl, Sturmleugnen, Verstoß gegen das Seerecht (›des Meeres Frieden‹).",
    schatten: "Piraterie wird mancherorts als ›efferdgefällig‹ gerechtfertigt; al'anfanische Sklavenschiffe segeln auch unter Efferd-Wimpel.",
    greetingNote: "»Mit der Strömung.« Seemänner spucken vor dem Auslaufen ins Wasser.",
  },
  travia: {
    id: "travia", name: "Travia", beiname: "die Herrin am Herd, Schützerin des Heims",
    domain: "Herd, Familie, Treue, Gastrecht, Heimat",
    symbol: "brennende Gans am Herd, Schlüsselbund", colors: "Braun und Sandgelb",
    festtag: "Travia-Heimkehrfest (Travia 30) — jeder reist heim, wenn er kann",
    liturgie: "Warm, mütterlich/väterlich. Geweihte (Traviane/Travianer) tragen einfache braune Kutten, oft mit Schlüsselbund am Gürtel. Tempel sind Herdhäuser mit ewig brennendem Feuer; jeder darf eintreten und essen.",
    tabus: "Bruch des Gastrechts (heiligstes Tabu — wer einen Gast verrät, ist verflucht), Ehebruch, Vernachlässigung der Eltern.",
    schatten: "Travia-Geweihte können Verstoßene aus Sippen offiziell ›heimlos‹ erklären — eine Form sozialer Vernichtung. In manchen Dörfern werden Witwen mit Travia-Hilfe enterbt.",
    greetingNote: "»Unter Travias Mantel.« Gastfreund wird mit Brot und Salz begrüßt; das abzulehnen, ist Beleidigung.",
  },
  boron: {
    id: "boron", name: "Boron", beiname: "der Schweiger, Herr des Schlafes und des Todes",
    domain: "Tod, Schlaf, Träume, Vergessen, Schweigen",
    symbol: "schwarzer Rabe, Stundenglas, geschlossenes Auge",
    colors: "Schwarz, manchmal mit Silber",
    festtag: "Boron 30 (Boronsfest, Totengedenken). Auch alle Mondfinsternisse.",
    liturgie: "Geflüsterte Litaneien, lange Schweigeminuten. Geweihte (Boroni) tragen tief verhüllende schwarze Roben, gesichtsverdeckende Masken (Rabenmaske bei höherem Rang). Tempel sind kühl, dunkel, mit Totenhalle und Krypta.",
    tabus: "Tote stören, Leichenraub (außer ritualisiert), das Wort ›Tod‹ flapsig benutzen, ›Guten Tag‹ als Gruß (›Tag‹ ist Praios — sage ›gutes Schweigen‹ oder schweige nickend).",
    schatten: "BORON HAT ZWEI GESICHTER: Im Mittelreich (Tobrien, Punin) milder Sterbebegleiter. In AL'ANFA Boron der Strenge — Patriarch und Kirche herrschen über Stadt und Sklavenwirtschaft, Opferdienste mit Mohasaft (Rauschmittel), brutale Verfolgung von Tsa-Anhängern. Boronanker (al'anfanische Patriarchen) sind unerbittlich.",
    greetingNote: "»Im Schweigen des Herrn.« Nie laut grüßen in einem Boron-Tempel; Verbeugung reicht.",
  },
  hesinde: {
    id: "hesinde", name: "Hesinde", beiname: "die Herrin der Schlangen, Mutter der Magie",
    domain: "Wissen, Magie, Schlangen, Heilung der Seele, Kunst",
    symbol: "Schlange, die sich um einen Stab oder Pergament ringelt",
    colors: "Grün und Gold",
    festtag: "Hesinde 1 (Wissensfest), Hesinde 21 (Tag der Schlange)",
    liturgie: "Gelehrt, in Garethi und alten Sprachen, oft in Versform. Geweihte (Hesindianer/Hesindiane) tragen grüne Roben mit Schlangenfibel, oft eine lebende Tempelschlange um den Arm. Tempel sind Bibliotheken mit Skriptorien und Schlangengruben.",
    tabus: "Bücher verbrennen, Schlangen töten, Wissen aus Furcht zurückhalten, einem Suchenden Antwort verweigern.",
    schatten: "Hesinde-Tempel SCHÜTZEN Magier — auch verfolgte. Manche bewahren verbotene Werke (›Codex Borbaradi‹-Fragmente, Liber Nephili). Im Konflikt mit Praios-Inquisition kommt es zu offenen Auseinandersetzungen, die in Punin und Kuslik regelmäßig eskalieren.",
    greetingNote: "»Wissen sei dein Pfad.« Eine Frage zu stellen, gilt als Gruß.",
  },
  firun: {
    id: "firun", name: "Firun", beiname: "der Jäger, Herr des Winters",
    domain: "Winter, Jagd, Einsamkeit, Wildnis, Eis",
    symbol: "Speer mit Eiszapfen, weißer Wolf", colors: "Weiß und Blaugrau",
    festtag: "Firun 1 (Jagdfest), Wintersonnenwende",
    liturgie: "Karg, draußen, oft schweigend. Geweihte (Firnis) leben einsiedlerisch, tragen Pelze, ein Speer ist ihr Symbol. Tempel sind eher Jagdhütten in der Wildnis.",
    tabus: "Sinnlose Jagd, Tiere quälen, Wild zur falschen Jahreszeit erlegen, Feuer in der Wildnis unbeaufsichtigt lassen.",
    schatten: "Firun-Geweihte greifen Wilderer und Pelzhändler offen an. In den Nordlanden gilt: wer einen weißen Wolf tötet, stirbt im selben Winter.",
    greetingNote: "»Der Jäger sehe dich.« Begrüßung mit erhobenem Speer oder Faust.",
  },
  tsa: {
    id: "tsa", name: "Tsa", beiname: "die Erneuerin, Herrin des Lebens und der Echsen",
    domain: "Leben, Geburt, Wandel, Neuanfang, Kinder, Echsen",
    symbol: "bunte Eidechse, fünfblättrige Tsa-Blume", colors: "alle Regenbogenfarben",
    festtag: "Tsa 1 (Geburtenfest), jeder Geburtstag ist ein kleines Tsa-Fest",
    liturgie: "Bunt, fröhlich, spontan. Geweihte (Tsa-Geweihte) tragen vielfarbige Gewänder, oft mit lebenden Eidechsen am Hals oder im Haar. Tempel sind Gärten mit Echsengehegen und Kinderhorten.",
    tabus: "Kinder bedrohen, Schwangere verletzen, Echsen töten, jemandem den Neuanfang verweigern.",
    schatten: "Konflikt mit Boron-Kirche, besonders mit Al'Anfa — dort sind Tsa-Tempel verboten. Tsa-Geweihte schmuggeln Schwangere aus Al'Anfa heraus. Wer eine Tsa-Geweihte angreift, hat halb Aventurien gegen sich.",
    greetingNote: "»Wandle und werde.« Begrüßung oft mit Lächeln und Blume.",
  },
  phex: {
    id: "phex", name: "Phex", beiname: "der Fuchs, Herr der Schatten und Händler",
    domain: "Schatten, Diebe, Händler, Glück, Wagnis, Reisen bei Nacht",
    symbol: "Fuchs, Münze mit Mond darauf", colors: "Schwarz, Silber, Rot",
    festtag: "Phex 1 (Markttage), Phex 30 (Diebesfest, in den Schatten)",
    liturgie: "Zweischneidig. Tagsüber Händler-Phex (gerecht, redlich), nachts Diebes-Phex (verschlagen, listig). Geweihte tragen schwarzgraue Mäntel mit silbernen Münzen am Saum. Tempel sind oft am Markt — oben Bankhaus, unten Diebesgilde-Treff.",
    tabus: "Phex-Gabe stehlen (Almosen am Markttag), gegebenes Wort brechen, Fuchsschwänze als Schmuck.",
    schatten: "Phex-Kirche unterhält in vielen Städten die Diebesgilde halb-offiziell. Wer Phex bestiehlt, wird nicht angezeigt — aber gefunden. Schmuggelt auch verfolgte Magier außer Land.",
    greetingNote: "»Möge der Fuchs deine Wege ebnen.« Händler-Handschlag mit gespuckter Hand gilt als bindend.",
  },
  peraine: {
    id: "peraine", name: "Peraine", beiname: "die Säerin, Herrin des Ackers und der Heilung",
    domain: "Heilung, Ackerbau, Geduld, Wandern, Mitgefühl",
    symbol: "Sichel und Ähre, weiße Taube", colors: "Grün und Weiß",
    festtag: "Peraine 1 (Saatfest), Peraine 15 (Tag der wandernden Heiler)",
    liturgie: "Warm, einfach, in der Sprache der Bauern. Geweihte (Peraine-Heiler) tragen einfache grüne oder weiße Kutten, eine Sichel am Gürtel, Heilkräuter in der Tasche. Reisen oft als Wanderheiler über Land. Tempel sind Hospize und Kräutergärten.",
    tabus: "Heilung aus Geldgier verweigern, Ackerland verwüsten, Saatgut horten, Kranke abweisen.",
    schatten: "Peraine-Geweihte behandeln auch Verbrecher, Orks und Untouchables — was sie regelmäßig mit Adel und Praios-Klerus in Konflikt bringt. Manche Bauern misstrauen ihnen wegen alter Hexen-Verbindungen.",
    greetingNote: "»Wachse und gedeihe.« Begrüßung mit überreichter Kornähre oder Heilpflanze.",
  },
  ingerimm: {
    id: "ingerimm", name: "Ingerimm", beiname: "der Schmied, Herr des Feuers und des Handwerks",
    domain: "Feuer, Schmieden, Handwerk, Vulkane, Zwerge",
    symbol: "Hammer auf Amboss, lodernde Flamme", colors: "Rot, Schwarz, Bronze",
    festtag: "Ingerimm 1 (Schmiedefest), Versammlungen der Zwergensippen",
    liturgie: "Knapp, derb, mit Hammerschlag. Geweihte (Ingerimm-Priester) tragen Lederschurz über roter Robe, Brandnarben gelten als Ehrenzeichen. Tempel sind aktive Schmieden mit ewiger Esse. Bei den Zwergen heißt er ANGROSCH — eigener, älterer Kult.",
    tabus: "Pfusch am Werk, Feuer aus Bosheit, Werkzeugdiebstahl, ein Werkstück halbfertig verkaufen.",
    schatten: "Ingerimm-Tempel schmieden Waffen für jeden, der zahlt — auch für Söldner und Mörder. Zwischen Mittelreichs-Ingerimm und zwergischem Angrosch-Kult bestehen alte Streitigkeiten.",
    greetingNote: "»Fest sei dein Werk.« Begrüßung oft mit kurzem Faustschlag an die Brust.",
  },
  rahja: {
    id: "rahja", name: "Rahja", beiname: "die Holde, Herrin der Liebe, des Tanzes und des Rausches",
    domain: "Liebe, Lust, Wein, Tanz, Schönheit, schöpferische Ekstase",
    symbol: "Stute mit wehender Mähne, Weinkelch, Rose", colors: "Rot und Goldgelb",
    festtag: "Drei Rahja-Tage zur Sommersonnenwende (1.–3. Rahja) — landesweiter Ausnahmezustand",
    liturgie: "Sinnlich, körperlich, oft tanzend oder singend. Geweihte (Rahjaner/Rahjanerinnen) tragen rot-goldene, oft knappe Gewänder, viel Schmuck, Rosen im Haar. Tempel sind Festsäle mit Tanzboden, Wein und — in offen-rahjanischen Tempeln — sakrale Tempelliebe gegen Spende.",
    tabus: "Liebe erzwingen, einen Tanz erzwingen, schlechten Wein als guten verkaufen, Rosen in Wut abreißen.",
    schatten: "Tempelliebe ist legal und sakral, wird aber von Praios- und Boron-Klerus angefeindet. In Al'Anfa als ›sittenlos‹ verfolgt. Gegen Übergriffe verteidigen sich Rahjas mit ›Tanzklingen‹-Geweihten, die einen Ruf wie Donnerhall haben.",
    greetingNote: "»Lust und Leben dir.« Begrüßung mit angedeutetem Kuss in die Luft.",
  },
};

/** Kompakter Block aller zwölf Götter für den Core-Prompt. */
export function buildGodsBlock(): string {
  const lines = (Object.values(DSA_GODS) as GodBrief[]).map(
    (g) =>
      `${g.name.toUpperCase()} (${g.beiname}) — ${g.domain}\n` +
      `  Symbol: ${g.symbol}; Farben: ${g.colors}; Fest: ${g.festtag}.\n` +
      `  Liturgie/Kleidung: ${g.liturgie}\n` +
      `  Tabus: ${g.tabus}\n` +
      `  Schattenseite: ${g.schatten}\n` +
      `  Gruß/Anrede: ${g.greetingNote}`,
  );
  return `DIE ZWÖLFGÖTTER — DETAILBRIEF (DSA3):\n${lines.join("\n\n")}`;
}

/**
 * Knappe Götter-Liste für den Default-Prompt — nur Name, Beiname und
 * Domäne in einer Zeile. Details (Tabus, Schwüre, Liturgie, Schatten)
 * holt sich der Meister bei Bedarf via dsaLore({ topic: "gott.<id>" }).
 */
export function buildGodsBlockShort(): string {
  const lines = (Object.values(DSA_GODS) as GodBrief[]).map(
    (g) => `  ${g.name.padEnd(10)} (${g.beiname.padEnd(38)}) — ${g.domain}`,
  );
  return [
    "DIE ZWÖLFGÖTTER (Kurzliste — Details via dsaLore({topic:'gott.<id>'})):",
    ...lines,
  ].join("\n");
}