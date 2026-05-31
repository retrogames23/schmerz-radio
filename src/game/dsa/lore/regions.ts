/**
 * Regionen Aventuriens 19/20 Hal — kompakte Briefs für den LLM-Meister.
 * Werden je nach Setting gezielt in den System-Prompt eingehängt
 * (vermeidet, alle ~12 Regionen pro Wende mitzuschleppen).
 *
 * Stand: DSA3, "Das Jahr des Greifen". Eigene Worte. Die Grundstimmung
 * Aventuriens ist abenteuerlich-bunt, nicht düster: Heldenmut, Wunder,
 * Tavernen-Romantik, gelegentliche Gefahr. Erwachsene Themen (Orkfront,
 * Sklaverei, Inquisition, Aufstände) sind LORE-WAHR und dürfen erwähnt
 * werden, sollen aber nicht jede Szene einfärben — sie sind Kulisse,
 * kein Dauerton.
 */

export type DsaRegionId =
  | "mittelreich_kern"
  | "garetien_tobrien"
  | "almada_horas"
  | "thorwal"
  | "tulamiden"
  | "bornland_svellt"
  | "maraskan"
  | "alanfa_sueden"
  | "andergast_nostria"
  | "khom_rastullah"
  | "schwarze_lande";

export interface RegionBrief {
  id: DsaRegionId;
  name: string;
  hauptorte: string;
  herrscher: string;
  goetter: string;
  alltag: string;
  bedrohung: string;
  sprache: string;
  namen: string;
  notiz: string;
}

export const DSA_REGIONS: Record<DsaRegionId, RegionBrief> = {
  mittelreich_kern: {
    id: "mittelreich_kern",
    name: "Mittelreich, Reichsstädte (Gareth, Punin, Wehrheim, Kuslik)",
    hauptorte: "Gareth (Hauptstadt, ca. 90.000 Einwohner), Punin (Magier- und Hesindestadt), Kuslik (Hafen, Akademien), Wehrheim (Garnison).",
    herrscher: "Kronprinz Brin, Reichsbehüter, seit Hals Verschwinden de facto Kaiser. Reichskanzler, Reichsbarone, Stadträte.",
    goetter: "Praios dominant (Gareth = größte Praios-Basilika Aventuriens), Rondra, Travia. Hesinde stark in Punin.",
    alltag: "Steinerne Städte, gepflasterte Reichsstraßen, Garde an jedem Tor. Pflichtsteuer, Praios-Inquisition zugegen. Magier nur in offiziellen Roben mit Akademie-Siegel sicher.",
    bedrohung: "Politische Intrigen am Hof, Praios-Inquisitor, der zu viel weiß. Diebesgilden (Phex) in jeder Großstadt. Söldner aus dem Norden, die in Friedenszeiten Ärger machen.",
    sprache: "Reines Garethi, höfisches Bosparano am Hof, Anreden streng nach Stand (siehe Anreden-Block).",
    namen: "Hjalmar, Wendelmir, Brogan, Alrike, Praiogund, Hesinde-Mara, Travinian.",
    notiz: "Standard-Setting. Wer Aventurien sagt, denkt zuerst hier hin.",
  },
  garetien_tobrien: {
    id: "garetien_tobrien",
    name: "Garetien, Tobrien, Darpatien (Orkfront-Provinzen)",
    hauptorte: "Greifenfurt (umkämpft), Tobrien-Stadt, Festum-Vorposten, Trallop.",
    herrscher: "Lokale Markgrafen und Barone, oft direkt im Krieg gegen Orks. Marschall des Reichs als Oberbefehl.",
    goetter: "Rondra (Schwerter des Greifen, Theaterritter), Boron (viele Tote), Praios (Felddienste).",
    alltag: "Halbverbrannte Dörfer, Heerlager, Flüchtlingstrecks. Männer fehlen, Frauen führen Höfe. Brot ist knapp, Pferde geraubt.",
    bedrohung: "Orkstreifscharen jederzeit. Plünderer in eigenen Reihen. Schwarzmagier-Späher der Orks (›Borks‹ — selten, aber real).",
    sprache: "Garethi mit nordischem Klang, Soldatenfluch, derbe Direktheit.",
    namen: "Reto, Hartwig, Edgardo, Beronika, Garibald.",
    notiz: "Kriegssetting. Erwarte Verwundete, Massengräber, Beutestreit. Hier wird Heldentum teuer bezahlt.",
  },
  almada_horas: {
    id: "almada_horas",
    name: "Almada & Horasreich (Vinsalt, Methumis, Belhanka)",
    hauptorte: "Vinsalt (Hauptstadt Horasreich), Methumis (Wein, Intrige), Belhanka (Hafen), Ragath in Almada.",
    herrscher: "Im Horasreich Kaiserin Amene IV. (später Horas Hagrobald), Hofkamarilla, neunköpfiger Kronrat. In Almada Gräfin oder lokaler Markgraf, formal Lehen Garetiens, faktisch eigenständig.",
    goetter: "Rondra (Turnieradel), Rahja (Tanz, Wein), Hesinde, Phex (Händler).",
    alltag: "Höfisches Leben, Maskenbälle, Wein in Strömen, Etikette tödlich genau. Comto/Comtessa als Anrede. Vendetta-Kultur unter Adelshäusern.",
    bedrohung: "Vergiftung, Intrige, Komplott. Tanzklingen-Duelle. Spione zwischen Vinsalt und Gareth in jedem Saal.",
    sprache: "Garethi mit aranischem/horasischem Einschlag, blumige Höflichkeit, viel ›Eure Liebden‹.",
    namen: "Hagrobald, Aldare, Ucurian, Selindiane, Conchobair.",
    notiz: "Hof-Intrigen-Setting par excellence.",
  },
  thorwal: {
    id: "thorwal",
    name: "Thorwal & Hjaldingsche Inseln",
    hauptorte: "Thorwal (Hauptort, Hetfrau Otta), Prem, Olport, Skerdu auf den Inseln.",
    herrscher: "Hetleute der Ottajaskos (Schiffsgemeinschaften). Hetfrau Otta von Thorwal als ›Erste unter Gleichen‹. Kein König.",
    goetter: "Swafnir (Wal-Sohn des Efferd, eigener Kult), Rondra, Travia. Praios ist hier ein Fremder.",
    alltag: "Hafenstadt aus Holz und Stein, Met statt Wein, Streit per Hammel-Duell. Frauen kämpfen wie Männer. Familien fahren als Ottajasko zur See — fischen, handeln, viking (raid) gegen Mittelreich-Schiffe.",
    bedrohung: "Sippenfehden, Maraskan-Pirateninvasion, Hjaldingsche Hochzeitsschlägereien. Im Winter geschlossene Pässe.",
    sprache: "Thorwalsch (eigene Sprache) und gebrochenes Garethi. Anrede: ›Sohn/Tochter des XYZ‹ + Ottajasko-Name.",
    namen: "Asleif, Garhelt, Swantje, Erlan, Olaf Knochenhand, Yala Sturmwind.",
    notiz: "Erwachsene Themen: Sklavenraub (mittelreichisch), Frauen mit Axt, derber Humor, kein Adelsgehabe.",
  },
  tulamiden: {
    id: "tulamiden",
    name: "Tulamidenlande (Khunchom, Zorgan, Mherwed)",
    hauptorte: "Khunchom (Hafen, älteste Magierakademie), Zorgan (Handel), Mherwed (Hauptstadt des Kalifats — strenger Rastullahglaube).",
    herrscher: "Stadtfürsten (Padishah, Mawdli), in Mherwed Kalif Malkillah III. (Rastullahgläubig).",
    goetter: "Zwölfgötter in eigener Färbung (Hesinde besonders stark), südlich Rastullah (monotheistisch, fanatisch).",
    alltag: "Basare, Karawansereien, Sklavenmärkte (legal), Haremswache, Magier mit Goldfingerringen. Tee wird IMMER angeboten — Ablehnung beleidigt.",
    bedrohung: "Sklavenhändler, Khôm-Räuber, rastullahgläubige Eiferer, Djinnen-Beschwörer. Magier-Akademie-Politik tödlich.",
    sprache: "Tulamidya neben Garethi. Anreden: Effendi, Sahib, Lalla, Hadschi. Blumige Höflichkeit ist Pflicht.",
    namen: "Abu Tarik, Selima, Rashid, Yasmina, Zaid ben Mhanadi.",
    notiz: "Sklaverei, Harems, Magier-Intrigen, Wüstenromantik — alles dabei. Kantig spielen.",
  },
  bornland_svellt:  {
    id: "bornland_svellt",
    name: "Bornland & Svelltland (Festum, Notmark, Trollzacken)",
    hauptorte: "Festum (Hafen, Bornland), Notmark (Grenzfeste), Tjolmar.",
    herrscher: "Im Bornland Bojaren (Adel) unter formal mittelreichischem Lehen, faktisch eigenständig. Im Svelltland Vogteien.",
    goetter: "Firun (Winter, Wolf), Travia, Peraine. Eigenheiten: alte Götter (Ifirn — Firun-Schwester) im Norden.",
    alltag: "Lange Winter, Holzhäuser, Schneewölfe an den Grenzen, Met und Bärenfleisch. Bojaren halten Leibeigene; in den Wäldern leben Nivesen (Rentiernomaden).",
    bedrohung: "Goblins aus den Trollzacken, Eiswölfe, Verirren bei Schneesturm, Bojaren-Willkür gegen Bauern.",
    sprache: "Bornisch (mit slawischem Klang) neben Garethi. Anrede: ›Boschpane‹, ›Boschperan‹.",
    namen: "Brogar, Yelda, Slavomir, Borislaw, Olgerd.",
    notiz: "Kalt, hart, magisch. Hier ist Kaiser Hal angeblich verschwunden — die Bornländer wissen mehr, als sie sagen.",
  },
  maraskan: {
    id: "maraskan",
    name: "Maraskan (Insel im Südosten)",
    hauptorte: "Boran (Hauptstadt), Tuzak (Hafen), Kefer Mussa.",
    herrscher: "Offiziell mittelreichischer Gouverneur, faktisch im Bürgerkrieg gegen die Aufständischen.",
    goetter: "Rur und Gror (eigenes Götterpaar, die Maraskani lehnen die Zwölfgötter ab — Konfliktgrund Nr. 1).",
    alltag: "Dschungel, Reisterrassen, vergiftete Klingen, Krummsäbel, gelbe Roben. Mittelreichische Soldaten in Garnisonen, draußen kein Schritt sicher.",
    bedrohung: "Aufständische in jedem Dorf. Gift in jedem Becher. Sumpf-Fieber. Tigerhaie an der Küste. Reichssoldaten, die Vergeltung üben.",
    sprache: "Maraskani (eigene Sprache, Garethi nur in Häfen). Anreden formal mit Kasten-Suffixen.",
    namen: "Galahan, Sirla, Rohaja, Ifirgan, Yossan.",
    notiz: "Gewalt-Setting. Folter, Massenexekutionen, Vergiftungen sind Alltag. Erwachsen spielen.",
  },
  alanfa_sueden: {
    id: "alanfa_sueden",
    name: "Al'Anfa & der dunkle Süden",
    hauptorte: "Al'Anfa (›Perle des Südens‹), Mengbilla, Brabak, Sumu (Inseln).",
    herrscher: "In Al'Anfa der Patriarch des Boron + der Stadtrat der Zwölf Familien. Mengbilla freie Handelsrepublik. Brabak unter eigener Königin.",
    goetter: "Boron (in al'anfanischer, strenger Auslegung — Patriarch über allem), Phex (Händler & Schmuggler), Praios kaum, Rahja verboten.",
    alltag: "Tropenhitze, Marmorpaläste über Sklavenelend, Mohasaft als Rauschmittel, schwarze Roben überall. Sklavenmärkte legal und öffentlich. Tsa-Tempel verboten.",
    bedrohung: "Patriarchen-Garde, Boron-Inquisition, Giftmischer, Sklavenjäger. Wer aus Al'Anfa flieht, wird verfolgt.",
    sprache: "Garethi mit dunklem Süd-Akzent, viel ›Würden‹ und ›Erhabenheiten‹. Patriarch wird mit ›Euer Hochwürdigste Erhabenheit‹ angeredet.",
    namen: "Pavur, Gariel, Charypso, Soltan, Ardare al'Plitana.",
    notiz: "Düsterstes Setting Aventuriens. Sklaverei, Folter, religiöser Terror — wenn Layard kantig spielen will, hier.",
  },
  andergast_nostria: {
    id: "andergast_nostria",
    name: "Andergast & Nostria (Bauernkönigreiche, Nordwesten)",
    hauptorte: "Andergast, Nostria.",
    herrscher: "König Wendelmir III. von Andergast und König Tristan von Nostria — seit 1000 Jahren im Dauerstreit.",
    goetter: "Travia, Peraine, Firun. Praios schwach, Hesinde verachtet (man hält sie für Hexen).",
    alltag: "Holzpaläste, Bauernritter, Schweinefleisch, Kohl, Bier. Magier werden mit der Mistgabel davongejagt. Druiden in den Wäldern haben mehr Macht als Geweihte.",
    bedrohung: "Hexenverfolgung, Druiden-Rivalität, Grenzscharmützel zwischen den Bauernkönigreichen.",
    sprache: "Garethi mit Bauern-Akzent, derb, ehrlich. Adel mit ›Eure Wohlgeboren‹.",
    namen: "Wendelmar, Trastor, Gerwulf, Adelheid, Hjalmir.",
    notiz: "Märchenhaft-derb. Hexenangst und Aberglaube tragen jede Szene.",
  },
  khom_rastullah: {
    id: "khom_rastullah",
    name: "Khôm-Wüste & Kalifat (Mhanadistan, Rastullahgläubige)",
    hauptorte: "Unau, Keft, Khefu, Oasen entlang der Karawanenrouten.",
    herrscher: "Kalif Malkillah III. in Mherwed (Tulamidenland-Hauptstadt), in der Khôm selbst Stammesfürsten der Beni Novad.",
    goetter: "Rastullah (›Der Eine Gott‹), seine Geweihten sind Mawdli und Hadschi. Zwölfgötter gelten als Götzen — Konflikt vorprogrammiert.",
    alltag: "Wüste, Karawanen, Oasen, Datteln, Pferderaub als Sport. Männer und Frauen streng getrennt. Pilgerfahrten nach Mherwed.",
    bedrohung: "Hitze, Sandsturm, Wüstendämonen (Ifrits — selten), fanatische Mawdli, die Zwölfgöttergläubige als Ungläubige sehen.",
    sprache: "Tulamidya, kein Garethi außer in Handelsstädten. Anreden hochformelhaft.",
    namen: "Abu Feyrad, Selim, Yasimina, Tarik ben Hadrian.",
    notiz: "Religiöser Konflikt als Dauerthema. Rastullahglaube ist DSA3-spezifisch hart gezeichnet.",
  },
  schwarze_lande: {
    id: "schwarze_lande",
    name: "Schwarze Lande & Orklande (jenseits der Trollzacken)",
    hauptorte: "Keine im Sinne der Zivilisation. Festung Karkozay (Goblin), Steinerne Stadt der Orks.",
    herrscher: "Orkische Kriegshäuptlinge (Wahrer der Krone), goblinische Kaltquellen, einzelne Schwarzmagier in Türmen.",
    goetter: "Orks verehren Tairach (Sonnenfeind) und Brazoragh (Krieg). Untote Dämonenkulte vereinzelt.",
    alltag: "Karge Steppen, Knochenhütten, Wolfsreiterei, Schädelschmuck. Sklaverei (Menschen, Goblins) Normalfall. Magie ungeschult, gefährlich.",
    bedrohung: "Alles. Orks in Banden, Goblins in Schwärmen, Schwarzmagier in Türmen, niedere Drachen, Trolle.",
    sprache: "Orkisch, Goblinisch, gelegentlich gebrochenes Garethi von Sklaven.",
    namen: "Orks: Sharaz, Urgosh, Kurmaaz. Goblins: Zickzick, Kralle, Räude.",
    notiz: "Nur für epische Abenteuer. Hier endet die Zivilisation.",
  },
};

/** Mapping Setting → empfohlene Region(en) (Mehrfach möglich). */
import type { DsaSettingId } from "../llmAdventure";

export const SETTING_TO_REGIONS: Record<DsaSettingId, DsaRegionId[]> = {
  city: ["mittelreich_kern", "almada_horas", "tulamiden", "alanfa_sueden"],
  wilderness: ["garetien_tobrien", "bornland_svellt", "andergast_nostria", "khom_rastullah"],
  epic: ["mittelreich_kern", "garetien_tobrien", "schwarze_lande"],
  dungeon: ["mittelreich_kern", "schwarze_lande", "bornland_svellt"],
  court: ["mittelreich_kern", "almada_horas", "tulamiden"],
  random: ["mittelreich_kern", "thorwal", "tulamiden", "bornland_svellt", "maraskan"],
};

function regionBlock(r: RegionBrief): string {
  return [
    `REGION — ${r.name}`,
    `  Hauptorte: ${r.hauptorte}`,
    `  Herrschaft (20 Hal): ${r.herrscher}`,
    `  Götter vor Ort: ${r.goetter}`,
    `  Alltag: ${r.alltag}`,
    `  Typische Bedrohung: ${r.bedrohung}`,
    `  Sprache/Anrede: ${r.sprache}`,
    `  Namensschema: ${r.namen}`,
    `  Notiz für den Meister: ${r.notiz}`,
  ].join("\n");
}

/**
 * Baut den Regionen-Block für ein Setting — nur die relevanten Regionen,
 * spart Tokens gegenüber „alle Regionen immer".
 */
export function buildRegionsBlockForSetting(setting: DsaSettingId): string {
  const ids = SETTING_TO_REGIONS[setting] ?? SETTING_TO_REGIONS.random;
  const briefs = ids.map((id) => regionBlock(DSA_REGIONS[id]));
  return [
    `REGIONEN-AUSWAHL FÜR DIESES SETTING (wähle EINE als Schauplatz und bleib bei ihrem Ton):`,
    ...briefs,
  ].join("\n\n");
}