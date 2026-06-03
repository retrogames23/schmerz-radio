import type { Attrs } from "@/game/dsa/dice";
import {
  type DsaClass,
  type DsaClassId,
} from "@/game/dsa/classes";

export type Geschlecht = "männlich" | "weiblich";

/** Ein paar typische DSA3-Vornamen je Klasse + Geschlecht. */
export const NAME_POOL: Record<DsaClassId, { männlich: string[]; weiblich: string[] }> = {
  krieger: {
    männlich: [
      "Hjalmar von Salzgar", "Edur von Tannstein", "Roban Greifenklau", "Aldred von Eberstamm",
      "Praiodan vom Eberstamm", "Garlef von Wertlingen", "Answin zu Rabenmund", "Folkward von Hartsteen",
      "Reto von Trottberg", "Wulfhelm von Garlischgrötz", "Cuanu ui Bennain", "Bosper von Falkenhag",
      "Storko von Ehrenstein", "Hartmuth Sturmfels", "Brin von Notmark", "Eolan von Albenhus",
    ],
    weiblich: [
      "Sigwine von Salzgar", "Brynja Greifenklau", "Hilde von Tannstein", "Roana von Eberstamm",
      "Rondrigane von Wertlingen", "Alrike zu Rabenmund", "Walpurga von Hartsteen", "Mechthild von Ehrenstein",
      "Yppolita von Trottberg", "Gernot... Genoveva von Garlischgrötz", "Cuana ui Bennain", "Bospera von Falkenhag",
      "Irmenella Sturmfels", "Hjalda von Notmark", "Praiodane vom Eberstamm", "Eolwyn von Albenhus",
    ],
  },
  streuner: {
    männlich: [
      "Knut Schattenstrich", "Marek Pfennigfuchs", "Dietrich Krummfinger",
      "Hagen Rattenpfote", "Olwin Dreifaltig", "Garmin Spitzohr", "Tibor Nimmersatt",
      "Jorge Halbschatten", "Pjotr Silberzahn", "Kunz Wegelagerer", "Erbo Kröte",
      "Sven Glücksstern", "Hadu der Schiefe", "Quentor Hehler",
    ],
    weiblich: [
      "Lisbeth Schattenstrich", "Mara Pfennigfuchs", "Yala Krummfinger",
      "Tinka Rattenpfote", "Esmer Dreifaltig", "Garmina Spitzohr", "Tibora Nimmersatt",
      "Jorga Halbschatten", "Pjotra Silberzahn", "Kunigunde Wegelagerin", "Erba Kröte",
      "Svenja Glücksstern", "Haduwig die Schiefe", "Quenta Hehlerin",
    ],
  },
  magier: {
    männlich: [
      "Wendelmir der Genaue", "Halmir vom Drachenstein", "Aldebrand der Stille",
      "Saldor Foslarin", "Rakorium Muntagonus", "Khadan ben Khefu", "Galottas Adept Korian",
      "Thargunitoth-Schüler Brandil", "Eslam ibn Yakuban", "Olnar Eisenfels",
      "Pherengar von Khunchom", "Tsaiane Sonnenstaub", "Hesindian von Punin",
    ],
    weiblich: [
      "Wendelmira die Genaue", "Halma vom Drachenstein", "Aldebranda die Stille",
      "Saldora Foslarin", "Rakoria Muntagona", "Khadana bint Khefu", "Koriane Sterndeuterin",
      "Brandila Tiefsicht", "Yasmina bint Yakuban", "Olnara Eisenfels",
      "Pherengara von Khunchom", "Tsaiane Sonnenstaub", "Hesindiane von Punin",
    ],
  },
  elf: {
    männlich: [
      "Niamhal Silberlied", "Faenor Mondhauch", "Cael Tiefwurzel",
      "Quellwasser nin' Mereth", "Aerdana vom Sternenpfad", "Lyriel Windkuss", "Salwain Tautropf",
      "Galador Schattenhain", "Iliad nin' Fenwasil", "Tirion Morgenwind", "Erinya Blattlicht",
      "Mond-Trinker", "Sturm-Reiter", "Wolken-Tänzer",
    ],
    weiblich: [
      "Niamhuin Silberlied", "Faelin Mondhauch", "Caela Tiefwurzel",
      "Quellwasser nin' Salwiel", "Aerdana vom Sternenpfad", "Lyriene Windkuss", "Salwiane Tautropf",
      "Galadrielle Schattenhain", "Iliane nin' Fenwasil", "Tiriana Morgenwind", "Erinya Blattlicht",
      "Mond-Sängerin", "Sturm-Reiterin", "Wolken-Tänzerin",
    ],
  },
  zwerg: {
    männlich: [
      "Angbar, Sohn des Angrosch", "Torin Steinaxt", "Brogar Erzhand",
      "Arombolosch Hammerschlag", "Grimbur Eisenbart", "Thorbosch Tiefgräber", "Ingramosch Goldfaust",
      "Xorlosch Felsbeißer", "Durak Schildwart", "Bardo Runenritzer", "Glimbron Schwarzkiesel",
    ],
    weiblich: [
      "Anga, Tochter des Angrosch", "Torina Steinaxt", "Brogina Erzhand",
      "Arombolinde Hammerschlag", "Grimba Eisenbart", "Thorbosa Tiefgräberin", "Ingrama Goldfaust",
      "Xorla Felsbeißerin", "Duraka Schildwartin", "Barda Runenritzerin", "Glimbra Schwarzkiesel",
    ],
  },
  gaukler: {
    männlich: [
      "Tjelvar mit dem doppelten Gesicht", "Riko Buntfuß", "Faldur Lautenklang",
      "Salim al'Schelm", "Tarsan Schellenklang", "Brindar Funkenwurf", "Hadu Maskenwechsler",
      "Ferro vom Phexcaer-Markt", "Ognan Feuerschlucker", "Vitus Sonnenrad", "Aldo Tausendzunge",
    ],
    weiblich: [
      "Tjelva mit dem doppelten Gesicht", "Rika Buntfuß", "Faldura Lautenklang",
      "Salimah al'Schelmin", "Tarsane Schellenklang", "Brindara Funkenwurf", "Haduwig Maskenwechslerin",
      "Ferra vom Phexcaer-Markt", "Ognara Feuerschluckerin", "Vita Sonnenrad", "Alda Tausendzunge",
    ],
  },
  thorwaler: {
    männlich: [
      "Asleif Walfangsohn", "Garm Eisbart", "Sven Sturmhand",
      "Beorn Drachentöter", "Hjalle Salzhaar", "Ulfgar Mövenfreund", "Ragnar Ottaskjamm",
      "Knut Wellenreiter", "Birka Hochmast", "Tjure Robbenstecher", "Eik Brandungssohn",
    ],
    weiblich: [
      "Asleif Walfangstochter", "Gerda Eisbart", "Svenja Sturmhand",
      "Beorna Drachentöterin", "Hjalla Salzhaar", "Ulfgara Mövenfreundin", "Ragna Ottaskjamm",
      "Knuta Wellenreiterin", "Birka Hochmast", "Tjura Robbenstecherin", "Eika Brandungstochter",
    ],
  },
  druide: {
    männlich: [
      "Brandil von der Eiche", "Ailwin Mistelzweig", "Tarvil Hainwacht",
      "Maurvan Wurzelbruder", "Ulwen Rabenstimme", "Cethelin Mondsichel", "Garwen Krähenruf",
      "Bran Beerenzunge", "Tairon Steinkreis", "Olwen Fünfblatt", "Eldur Erlenweh",
    ],
    weiblich: [
      "Brandila von der Eiche", "Ailwina Mistelzweig", "Tarvila Hainwacht",
      "Maurvana Wurzelschwester", "Ulwena Rabenstimme", "Cethelinde Mondsichel", "Garwina Krähenruf",
      "Brana Beerenzunge", "Tairona Steinkreis", "Olwena Fünfblatt", "Eldura Erlenweh",
    ],
  },
};

export function pickRandomName(cid: DsaClassId, g: Geschlecht): string {
  const pool = NAME_POOL[cid][g];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Bissige Kommentare nach 10 Re-Rolls. */
export const SNIPPY_COMMENTS: { speaker: "BREM" | "YELVA" | "TJARK"; text: string }[] = [
  { speaker: "BREM", text: "Zehn Würfe. Zehn! Wir sind hier nicht bei der Lotterie." },
  { speaker: "YELVA", text: "Du weißt schon, dass die Würfel sich nicht ändern, wenn man sie öfter wirft?" },
  { speaker: "TJARK", text: "Spätestens beim Zwanzigsten erwarte ich eine Bestechung." },
  { speaker: "BREM", text: "Bei mir hat's beim ersten Mal geklappt. Nur so." },
  { speaker: "YELVA", text: "Statistisch gesehen … nein, lass es. Würfel einfach." },
];

/** Flavor-Default-Felder je Klasse. */
export const CLASS_FLAVOR: Record<
  DsaClassId,
  { stand: string; heimat: string; goetter: string; haar: string; augen: string }
> = {
  krieger: { stand: "Edelmann", heimat: "Mittelreich, Gareth", goetter: "Rondra · Praios", haar: "dunkelbraun", augen: "graublau" },
  streuner: { stand: "Bürgerlich", heimat: "Havena, Albernia", goetter: "Phex", haar: "strohblond", augen: "braun" },
  magier: { stand: "Magier-Adept", heimat: "Akademie zu Punin", goetter: "Hesinde", haar: "schwarz", augen: "grün" },
  elf: { stand: "Auelf", heimat: "Salamandersteine", goetter: "Pheks · Tairach", haar: "kupferrot", augen: "moosgrün" },
  zwerg: { stand: "Erzzwerg", heimat: "Xorlosch, Koschberge", goetter: "Angrosch", haar: "rotbraun", augen: "stahlgrau" },
  gaukler: { stand: "Fahrendes Volk", heimat: "Khunchom, Tulamidenlande", goetter: "Phex · Rahja", haar: "pechschwarz", augen: "haselnuss" },
  thorwaler: { stand: "Hetfrau", heimat: "Thorwal, Olport", goetter: "Swafnir · Travia", haar: "honigblond", augen: "eisblau" },
  druide: { stand: "Hain-Druide", heimat: "Salamandersteine", goetter: "Sumu · Tairach", haar: "ergraut", augen: "tief schwarz" },
};

/**
 * Stellt einen gebalancten Satz Eigenschaftswerte für eine Klasse zusammen.
 */
export function balancedAttrsFor(cls: DsaClass): Attrs {
  const base: Attrs = { MU: 11, KL: 11, CH: 11, FF: 11, GE: 11, IN: 11, KK: 11 };
  if (cls.min) {
    for (const k of Object.keys(cls.min) as Array<keyof Attrs>) {
      const need = cls.min[k];
      if (need !== undefined) base[k] = Math.min(13, need + 1);
    }
  }
  if (cls.max) {
    for (const k of Object.keys(cls.max) as Array<keyof Attrs>) {
      const cap = cls.max[k];
      if (cap !== undefined && base[k] > cap) base[k] = cap;
    }
  }
  return base;
}

export function emptyAttrs(): Partial<Attrs> {
  return {};
}

export function talentsFor(classId: DsaClassId | undefined): string[] {
  if (classId === "magier" || classId === "druide")
    return ["Stab+5", "Lesen/Schreiben +6", "Sprachen +4", "Pflanzenkunde +3"];
  if (classId === "streuner" || classId === "gaukler")
    return ["Dolch +5", "Schleichen +6", "Taschendieb +5", "Lügen +4"];
  if (classId === "elf")
    return ["Bogen +7", "Sinnenschärfe +6", "Wildnisleben +5", "Singen +4"];
  if (classId === "thorwaler")
    return ["Hiebwaffen +7", "Boote fahren +5", "Zechen +5"];
  if (classId === "zwerg")
    return ["Hiebwaffen +6", "Mineralogie +5", "Bergbau +5"];
  return ["Hiebwaffen +6", "Schild +5", "Reiten +4", "Athletik +4"];
}

export const NEGATIVE_ATTRS = [
  "Aberglaube",
  "Höhenangst",
  "Goldgier",
  "Jähzorn",
  "Neugier",
  "Raumangst",
  "Totenangst",
] as const;