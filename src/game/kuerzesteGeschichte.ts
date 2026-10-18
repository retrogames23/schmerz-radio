/**
 * Inhalt des Buches „Die kürzeste Geschichte der Menschheit“.
 *
 * Zweites Buch im Wandregal von Layards Wohnung, neben dem
 * „Sektoren-Almanach 1997“. Populärwissenschaftlicher Überblick,
 * 1994 in der Mandats-Schulbuchreihe erschienen.
 *
 * Bei Konflikten mit `LORE.md` hat `LORE.md` Vorrang: die Kapitel ab 1920
 * folgen der alternativen Weltgeschichte des Spiels.
 */

import type { HandbookChapter } from "./e67Handbook";

import imgUrsprung from "@/assets/history/ursprung.jpg";
import imgNeolithikum from "@/assets/history/neolithikum.jpg";
import imgRadSchrift from "@/assets/history/rad-schrift.jpg";
import imgDreiFluesse from "@/assets/history/drei-fluesse.jpg";
import imgRomsErbe from "@/assets/history/roms-erbe.jpg";
import imgWelt from "@/assets/history/welt.jpg";
import imgMittelalter from "@/assets/history/mittelalter.jpg";
import imgAufklaerung from "@/assets/history/aufklaerung.jpg";
import imgIndustrie from "@/assets/history/industrie.jpg";
import imgJahrhundert from "@/assets/history/jahrhundert.jpg";
import imgZwischenkrieg from "@/assets/history/zwischenkrieg.jpg";
import imgWeltkrieg from "@/assets/history/weltkrieg.jpg";
import imgModerne from "@/assets/history/moderne.jpg";

export type HistoryChapter = HandbookChapter;

export const HISTORY_TITLE = "Die kürzeste Geschichte der Menschheit";

export const HISTORY_SUBTITLE =
  "Mandats-Schulbuchreihe · Band 3 · 4. durchgesehene Auflage 1994 · zugelassen für Bewohner-Bibliotheken";

export const HISTORY_UI_TEXT = {
  ariaLabel: "Die kürzeste Geschichte der Menschheit",
  closeLabel: "Buch schließen",
  contents: "Inhalt",
  chaptersUnit: (n: number) => `${n} Kapitel`,
  edition: "4. Auflage 1994",
  pagerStart: "— Anfang —",
  pagerEnd: "— Ende —",
  pagerOf: (idx: number, total: number) => `Seite ${idx} / ${total}`,
  chapterSelectLabel: "Kapitel",
} as const;

export const HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    id: "vorwort",
    shortTitle: "Vorwort",
    title: "Vorwort: Warum kurz?",
    body: [
      "Die Geschichte der Menschheit umfasst rund dreihunderttausend Jahre. Dieses Buch umfasst zweihundert Seiten. Das Missverhältnis ist beabsichtigt.",
      "Wer alles erzählen will, erzählt nichts. Wir beschränken uns auf die **Wendepunkte**: Momente, nach denen die Welt nicht mehr so funktionierte wie davor. Alles andere — und das ist fast alles — bleibt weg.",
      "> Merke: Eine kurze Geschichte ist keine einfache Geschichte. Sie ist eine, die zugibt, dass sie auswählt.",
      "Wir bemühen uns außerdem, verbreitete Irrtümer **nicht** zu wiederholen, auch wenn sie sich gut erzählen. Wo ein Mythos fällt, sagen wir es dazu.",
    ],
  },
  {
    id: "ursprung",
    image: imgUrsprung,
    imageCaption: "Tafel I — Jäger und Sammler in Ostafrika, Rekonstruktion",
    shortTitle: "Der Homo sapiens",
    title: "Vorgeschichte: Ein Tier lernt erzählen",
    body: [
      "Vor rund **300.000 Jahren** treten in Afrika Menschen auf, die anatomisch aussehen wie wir. Funde aus Nordafrika und Ostafrika zeigen: Es gab keinen einzelnen „Geburtsort“ des Menschen, sondern ein weit verstreutes Netz von Gruppen, die sich mischten.",
      "Der Homo sapiens war nicht die einzige Menschenform. Neben ihm lebten **Neandertaler** in Europa und Westasien, **Denisovaner** in Asien, weitere Formen anderswo. Sie waren keine dumpfen Vorstufen: Sie bestatteten Tote, pflegten Kranke, stellten Werkzeuge und Schmuck her. Ein Teil ihres Erbguts steckt bis heute in uns.",
      "Was den Sapiens auszeichnete, war weniger Kraft oder Hirnvolumen als **kumulative Kultur**: Wissen, das nicht mit dem Träger stirbt. Sprache, Erzählung, Ritual — Techniken, um Erfahrung über Generationen zu stapeln.",
      "Vor etwa 70.000 bis 50.000 Jahren breiten sich Sapiens-Gruppen über Asien, Australien und schließlich Europa aus; vor rund 15.000 Jahren erreichen sie Amerika. Überall verschwinden bald darauf die großen Tiere. Ob Klima oder Mensch schuld war, ist bis heute umstritten; vermutlich beides.",
      "> Am Ende der Eiszeit, vor rund 12.000 Jahren, leben vielleicht fünf Millionen Menschen auf der Erde. Alle jagen und sammeln. Keiner besitzt ein Feld.",
    ],
  },
  {
    id: "neolithikum",
    image: imgNeolithikum,
    imageCaption: "Tafel II — Frühe Bauern, Vorderer Orient, Rekonstruktion",
    shortTitle: "Neolithikum",
    title: "Die neolithische Revolution",
    body: [
      "Mit dem Ende der Eiszeit wird das Klima stabiler. In mehreren Weltgegenden **unabhängig voneinander** beginnen Menschen, Pflanzen und Tiere zu domestizieren: im Nahen Osten (Weizen, Gerste, Schaf, Ziege), in China (Hirse, Reis, Schwein), in Mesoamerika (Mais, Bohne), in den Anden (Kartoffel, Lama), in Neuguinea und Westafrika.",
      "Der Ackerbau war kein Fortschritt für den Einzelnen. Skelette der ersten Bauern zeigen kleinere Körper, schlechtere Zähne, mehr Krankheiten, mehr Arbeitsstunden als bei Jägern und Sammlern. Aber ein Feld ernährt auf derselben Fläche viel mehr Menschen. **Nicht Glück, sondern Zahl** entschied die Sache.",
      "Mit dem Feld kommen Vorräte. Mit Vorräten kommen Ungleichheit, Erbschaft, Steuern, Mauern und Krieg um Speicher. Mit sesshaften Menschen und ihren Tieren kommen die großen Seuchen.",
      "- **Mythos:** „Der Mensch wurde sesshaft, weil es angenehmer war.“ — Falsch. Er wurde sesshaft, weil Sesshaftigkeit sich vermehrt.",
      "- **Mythos:** „Vor dem Ackerbau lebten alle friedlich.“ — Auch falsch. Gewalt gab es vorher; Ackerbau gab ihr Ziele, die sich lohnten.",
    ],
  },
  {
    id: "rad-schrift",
    image: imgRadSchrift,
    imageCaption: "Tafel III — Schreiber, Töpferscheibe und Karren, Mesopotamien",
    shortTitle: "Rad und Schrift",
    title: "Rad, Schrift und die ersten Zivilisationen",
    body: [
      "Um **3500 v. u. Z.** erscheinen fast gleichzeitig zwei Erfindungen, die alles Weitere tragen: das **Rad** (zunächst als Töpferscheibe und schwerer Karren, in der eurasischen Steppe und in Mesopotamien) und die **Schrift**.",
      "Die Schrift entsteht nicht aus dem Wunsch zu dichten, sondern aus dem Wunsch zu **verwalten**. Die ältesten Tontafeln Sumers verzeichnen Gerste, Bier, Schafe, Arbeitstage und Schulden. Die Literatur kommt Jahrhunderte später.",
      "> Die erste bekannte Unterschrift der Menschheit gehört einem Buchhalter. Man darf das ruhig ein Omen nennen.",
      "Aus Dörfern werden Städte: **Uruk**, **Memphis**, **Mohenjo-Daro**, **Anyang**. Alle brauchen dasselbe Gerüst — Bewässerung, Speicher, Priesterschaft, Königtum, Recht. Der **Kodex Hammurapi** (um 1750 v. u. Z.) schreibt Strafen nieder und macht damit Willkür wenigstens vorhersehbar.",
      "Zwischen 1200 und 1150 v. u. Z. bricht die bronzezeitliche Welt des östlichen Mittelmeers zusammen: Dürre, Wanderungen, gekappte Handelswege. Aus den Trümmern kommt das **Eisen** — billiger als Bronze, weil es kein Fernhandelsnetz für Zinn braucht — und das **Alphabet** der Phönizier, das Schreiben aus den Händen der Spezialisten löst.",
    ],
  },
  {
    id: "drei-fluesse",
    image: imgDreiFluesse,
    imageCaption: "Tafel IV — Jerusalem, Athen, Rom",
    shortTitle: "Drei Flüsse",
    title: "Die drei Flüsse: Jerusalem, Athen, Rom",
    body: [
      "Was später „Abendland“ heißen wird, speist sich aus drei Strömen, die sich erst spät mischen.",
      "**Erster Fluss: das Judentum.** Aus einem kleinen Volk am Rand der Großreiche kommt eine folgenreiche Idee: ein einziger Gott, der nicht Natur ist, sondern **Geschichte macht** und Gerechtigkeit verlangt — von Königen ausdrücklich auch. Dazu ein Buch als Mittelpunkt statt eines Tempelbezirks, ein Ruhetag für alle, und die Prophetie als religiös legitimierte Kritik an der Macht. Nach der Zerstörung des Zweiten Tempels (70 u. Z.) wird daraus eine Religion der Lehrhäuser und Auslegung: der **rabbinische Judaismus**.",
      "**Zweiter Fluss: das antike Griechenland.** In den Stadtstaaten des 6. und 5. Jahrhunderts v. u. Z. entsteht die Gewohnheit, Behauptungen zu **begründen** statt zu überliefern: Naturphilosophie, Geometrie, Medizin, Geschichtsschreibung, Tragödie. Athen erfindet die *Demokratie* — für freie erwachsene Männer, das heißt für vielleicht ein Fünftel der Bevölkerung; Frauen, Metöken und die zahlreichen Sklaven bleiben draußen. Der Gedanke war trotzdem neu genug, um zweitausend Jahre zu überdauern.",
      "**Dritter Fluss: Rom.** Rom erfindet wenig und ordnet alles. Seine Beiträge sind **Recht** (Vertrag, Eigentum, Verfahren, die Trennung von Person und Amt), **Verwaltung** (Straßen, Zensus, Provinzen, Bürgerrecht als Integrationsangebot) und **Ingenieurwesen** (Aquädukte, Beton, Städtebau).",
      "In diesem römischen Rahmen, aus jüdischer Wurzel, mit griechischen Begriffen formuliert, entsteht das **Christentum**: eine Bewegung innerhalb des Judentums, die sich im 1. und 2. Jahrhundert an die griechischsprachige Welt richtet, im 3. Jahrhundert verfolgt wird und im 4. Jahrhundert zur Staatsreligion aufsteigt.",
      "> Drei Flüsse, ein Delta: Ein Gott, der Gerechtigkeit fordert; eine Vernunft, die Gründe fordert; ein Recht, das Verfahren fordert. Wo einer der drei austrocknet, wird es unangenehm.",
    ],
  },
  {
    id: "roms-erbe",
    image: imgRomsErbe,
    imageCaption: "Tafel V — Konstantinopel, weströmische Ruinen, Córdoba",
    shortTitle: "Roms Erbe",
    title: "Roms Erbe teilt sich",
    body: [
      "**395 u. Z.** wird das Reich verwaltungstechnisch geteilt. Der Westen zerfällt im 5. Jahrhundert: nicht in einer Nacht, sondern über Generationen aus Steuerkrise, Bürgerkriegen, Söldnerheeren und einwandernden Verbänden, die meist römisch werden wollten, statt Rom abzuschaffen. **476** setzt ein Offizier den letzten Westkaiser ab — Zeitgenossen bemerkten das Datum kaum.",
      "Im Osten geht das Reich weiter: **Byzanz** besteht noch tausend Jahre, bewahrt römisches Recht (Corpus Iuris Civilis, 6. Jh.) und griechische Bildung, hält Konstantinopel als größte Stadt Europas.",
      "Aus Roms Erbe werden so **drei Zivilisationen**:",
      "- der **lateinische Westen**: fragmentiert, agrarisch, mit dem Papsttum als einzig verbliebener reichsweiter Institution;",
      "- das **griechische Byzanz**: zentralistisch, städtisch, orthodox;",
      "- ab dem 7. Jahrhundert die **islamische Welt**: Sie übernimmt die reichsten Provinzen von Byzanz und Persien und wird für Jahrhunderte das Zentrum von Handel, Medizin, Mathematik und Philosophie — Bagdad, Kairo, Córdoba.",
      "Über diesen dritten Weg kehren später Aristoteles, Euklid und die indische Ziffernrechnung nach Europa zurück. Das *Abendland* hat sein Erbe zeitweise ausgelagert und dann zurückgekauft.",
    ],
  },
  {
    id: "welt",
    image: imgWelt,
    imageCaption: "Tafel VI — China, Indien und die Handelswege Afrikas",
    shortTitle: "China und Indien",
    title: "Die Welt jenseits Europas",
    body: [
      "Bis weit in die Neuzeit war Europa Peripherie. Der Schwerpunkt der Welt lag in Asien.",
      "**China** ist seit 221 v. u. Z. immer wieder als Reich geeint, verwaltet von einer über Prüfungen rekrutierten Beamtenschaft — die erste Bürokratie, die nicht nur aus Adel bestand. Chinesische Erfindungen tragen die halbe Weltgeschichte: **Papier**, **Buchdruck**, **Schwarzpulver**, **Kompass**, Papiergeld, Hochofen. Unter der Song-Dynastie (960–1279) lebt vermutlich die reichste und städtischste Gesellschaft der damaligen Welt.",
      "**Indien** liefert das Positionssystem mit der **Null**, ohne das keine moderne Mathematik existiert, dazu Algebra, Astronomie, Medizin — und mit Buddhismus und Hinduismus zwei Religionsräume, die halb Asien prägen.",
      "Der **Islam** verbindet ab dem 8. Jahrhundert diese Räume: Handel und Wissen fließen von Córdoba bis Kanton. Die Mongolen des 13. Jahrhunderts erzwingen dann kurzzeitig einen einzigen Verkehrsraum von Korea bis Ungarn — mit einer Nebenwirkung: 1347 erreicht die **Pest** Europa und tötet dort binnen Jahren etwa ein Drittel der Menschen.",
      "- **Mythos:** „Europa war immer führend.“ — Nein. Um 1400 war es ein rückständiger Zipfel Eurasiens. Der Vorsprung entsteht erst nach 1500, und er ist historisch kurz.",
      "In Afrika bestehen Reiche wie **Mali** und **Songhai** mit Handelsstädten wie Timbuktu; in Amerika **Maya**, **Azteken** und **Inka** mit Millionenstädten und Straßensystemen ohne Rad und Zugtier. Was sie beendet, ist ab 1492 weniger die europäische Waffe als die eingeschleppte Seuche: In manchen Regionen sterben neun von zehn Menschen.",
    ],
  },
  {
    id: "mittelalter",
    image: imgMittelalter,
    imageCaption: "Tafel VII — Pflug, Mühle, Kathedrale, Universität",
    shortTitle: "Mittelalter",
    title: "Europas Mittelalter — ohne die üblichen Märchen",
    body: [
      "Kaum eine Epoche wird so gründlich falsch erinnert. Ein paar Korrekturen:",
      "- **„Man hielt die Erde für eine Scheibe.“** Nein. Die Kugelgestalt war seit der Antike bekannt und in jedem Lehrbuch unbestritten. Der Scheiben-Mythos stammt aus dem 19. Jahrhundert.",
      "- **„Alles war finster und stillstehend.“** Nein. Zwischen 1000 und 1300 wächst Europas Bevölkerung stark: schwerer Pflug, Dreifelderwirtschaft, Pferdekummet, Wasser- und Windmühlen, Brille, mechanische Uhr, gotische Bautechnik. Es ist eine Epoche technischer Dauerbastelei.",
      "- **„Die Kirche verbot die Wissenschaft.“** Zu pauschal. Die **Universität** (Bologna, Paris, Oxford, ab dem 12. Jh.) ist eine kirchliche Erfindung mit eigenen Rechten; die Scholastik trainiert genau jene Streitkultur, aus der später die Naturwissenschaft hervorgeht. Zensur und Verfolgung gab es ebenfalls — beides ist wahr.",
      "- **„Das Recht der ersten Nacht.“** Frei erfunden. Ebenso die eisernen Keuschheitsgürtel.",
      "- **„Hexenverbrennungen waren mittelalterlich.“** Ihr Höhepunkt liegt zwischen 1560 und 1660 — also in der frühen Neuzeit, mitten in Renaissance und Reformation.",
      "Real war anderes: eine Gesellschaft ohne staatliches Gewaltmonopol, in der Herrschaft aus persönlichen Bindungen bestand; Leibeigenschaft für die Mehrheit; Städte, die mit Marktrecht und Zünften eigene Freiräume erkämpften; wiederkehrende Hungersnöte; die Pest von 1347, nach der Arbeitskraft knapp und damit teurer wurde — ein unfreiwilliger Schub für Löhne und Freiheit.",
      "Ab 1450 beschleunigt der **Buchdruck** alles: Reformation, Wissenschaft, Nationalsprachen, Propaganda. Die erste Informationsrevolution der Neuzeit war eine Maschine mit beweglichen Lettern.",
    ],
  },
  {
    id: "aufklaerung",
    image: imgAufklaerung,
    imageCaption: "Tafel VIII — Studierzimmer und Straße, 1789",
    shortTitle: "Aufklärung",
    title: "Aufklärung und Französische Revolution",
    body: [
      "Im 17. Jahrhundert setzt sich eine Methode durch, die Autorität durch **Messung und Wiederholbarkeit** ersetzt: Galilei, Kepler, Huygens, Newton. Was zählt, ist nicht, wer es sagt, sondern ob es nachprüfbar ist.",
      "Im 18. Jahrhundert wird daraus ein politisches Programm. Locke fragt nach der Grenze legitimer Herrschaft, Montesquieu nach der Teilung der Gewalten, Voltaire nach Toleranz, Rousseau nach dem Gemeinwillen, Kant fasst es 1784 als *Ausgang des Menschen aus seiner selbstverschuldeten Unmündigkeit*. Die *Encyclopédie* macht Wissen zum Nachschlagewerk statt zum Geheimnis.",
      "**1789** stürzt in Frankreich eine Staatsordnung, die an Krieg, Schulden und Missernten erstickt war. Die *Erklärung der Menschen- und Bürgerrechte* setzt Sätze in die Welt, die sich nicht mehr zurücknehmen ließen — auch wenn sie sofort verraten wurden: Der Terror von 1793/94 frisst seine eigenen Leute, das Wahlrecht bleibt begrenzt, die Sklaverei wird abgeschafft und wenig später wieder eingeführt.",
      "Einer, der beides erlebte — die Hoffnung und die Guillotine —, war der Mathematiker und Philosoph **Condorcet**. Als Verfolgter der Revolution, der er gedient hatte, schrieb er 1794 im Versteck seinen *Entwurf einer historischen Darstellung der Fortschritte des menschlichen Geistes*. Wenige Wochen später starb er in Haft. Die berühmteste Passage lautet:",
      "> »Es wird der Augenblick kommen, wo die Sonne auf der Erde nur freie Menschen bescheint, die keinen anderen Herren als ihre Vernunft anerkennen, wo Tyrannen und Sklaven, Priester und ihre Werkzeuge nur noch in den Geschichtsbüchern und auf der Bühne existieren werden. […] Ein immer kleineres Stück Land wird dann eine Fülle von sehr viel nützlicheren und wertvolleren Lebensmitteln hervorbringen; bei geringerem Aufwand wird ein größeres Quantum an Genuß verfügbar sein; das gleiche Industrieprodukt wird mit niedrigeren Rohmaterialkosten produziert und dauerhafter sein; aller Boden wird für die Erzeugnisse nutzbar gemacht, die mit geringer Arbeitskraft eine größere Anzahl von Bedürfnissen befriedigen. […] Die durchschnittliche Lebensdauer des Menschen wird keine angebbare Grenze haben. Der Mensch wird zwar nicht unsterblich werden, aber die Zeitspanne zwischen dem ersten Atemzug und dem letzten wird, wenn er, ohne Krankheit und Unfall, eines Tages von Natur aus nicht mehr länger leben kann, notwendigerweise immer mehr hinausgeschoben werden.«",
      "— *Jean Antoine Nicolas de Caritat de Condorcet*",
      "Man kann diesen Text für naiv halten. Man kann aber auch nachrechnen: Die durchschnittliche Lebenserwartung hat sich seit Condorcet mehr als verdoppelt. Er lag in der Sache öfter richtig als seine Spötter — und in der Frage der Herren bis heute nicht.",
    ],
  },
  {
    id: "industrie",
    image: imgIndustrie,
    imageCaption: "Tafel IX — Dampfmaschine, Fabrik, Eisenbahn",
    shortTitle: "Industrielle Revolution",
    title: "Die Industrielle Revolution",
    body: [
      "Ab etwa 1760 geschieht in England etwas historisch Einmaliges: Die Wirtschaftsleistung pro Kopf beginnt **dauerhaft** zu wachsen. Zuvor hatte jede Produktivitätssteigerung nur mehr Menschen ernährt, nicht bessere Leben erzeugt.",
      "Die Zutaten: billige Kohle direkt neben Eisenerz, die Dampfmaschine (Newcomen, dann Watt), mechanische Spinnerei und Weberei, ein Patent- und Vertragsrecht, Kapitalmärkte — und Kolonialhandel, Zucker- und Baumwollplantagen samt Sklaverei, deren Gewinne mitfinanzierten, was man später gern als reine Erfindergeschichte erzählt.",
      "Die Folgen kommen in Wellen: Eisenbahn und Telegraf (ab 1830) schrumpfen Entfernungen; Stahl, Chemie und **Elektrizität** (ab 1870) verwandeln Städte; Verbrennungsmotor, Fließband und Kunstdünger machen im frühen 20. Jahrhundert Massenproduktion und Massenernährung möglich.",
      "Der Preis war hoch: Kinderarbeit, Sechzehnstundenschichten, Slums, Cholera, Landflucht. Dagegen entstehen **Gewerkschaften**, Arbeiterparteien, Genossenschaften und Sozialgesetze; im Lauf des 19. Jahrhunderts wird das Wahlrecht schrittweise ausgeweitet, wenn auch fast überall zunächst nur für Männer.",
      "Zugleich rüstet Europa mit derselben Technik die Welt unter: Das Zeitalter des Hochimperialismus teilt Afrika und weite Teile Asiens unter wenigen Hauptstädten auf. Um 1900 ist die Erde erstmals vollständig vermessen, verkabelt — und aufgeteilt.",
      "> Die Industrialisierung hat mehr Menschen aus dem Elend geholt als jede Idee zuvor. Und sie hat die Mittel geliefert, mit denen sich das folgende Jahrhundert selbst zerlegte.",
    ],
  },
  {
    id: "jahrhundert",
    image: imgJahrhundert,
    imageCaption: "Tafel X — Westfront, 1916",
    shortTitle: "Der Große Krieg",
    title: "1914–1923: Das Ende des langen Jahrhunderts",
    body: [
      "Der **Große Krieg** (1914–1918) beginnt als Bündnisautomatik und endet als Materialschlacht. Vier Jahre Schützengraben, Maschinengewehr, Artillerie und Giftgas kosten rund neun Millionen Soldaten das Leben. Die Front bewegt sich jahrelang um Kilometer.",
      "Der Krieg zerstört vier Reiche: das deutsche Kaiserreich, Österreich-Ungarn, das Osmanische Reich und das Zarenreich. In Russland stürzt 1917 zuerst der Zar, dann die provisorische Regierung; die Bolschewiki übernehmen, es folgt ein Bürgerkrieg, der weitere Millionen kostet und das Land ausblutet.",
      "1918/19 tötet die **Influenza-Pandemie** weltweit mehr Menschen als der Krieg — nach vorsichtigen Schätzungen zwischen 25 und 50 Millionen. Sie trifft besonders junge Erwachsene und wird in der Erinnerung dennoch vom Krieg verdeckt.",
      "Die Friedensverträge von 1919/20 ziehen in Mittel- und Osteuropa neue Grenzen nach dem Prinzip der Nationalität, das sich in gemischt besiedelten Gebieten nicht anwenden lässt. Reparationen, Gebietsverluste und Schuldzuweisung erzeugen Streit statt Ordnung. 1923 vernichtet eine **Hyperinflation** in Mitteleuropa binnen Monaten die Ersparnisse ganzer Mittelschichten.",
      "- **Mythos:** „Der Krieg brach unvermittelt aus.“ — Nein. Rüstungswettlauf, Mobilmachungspläne und feste Bündnisse machten die Eskalation seit Jahren wahrscheinlich; das Attentat von Sarajevo war der Anlass, nicht die Ursache.",
      "> 1918 endeten die Kämpfe. Die Fragen, um die gekämpft worden war, endeten nicht.",
    ],
  },
  {
    id: "zwischenkrieg",
    image: imgZwischenkrieg,
    imageCaption: "Tafel XI — Arbeitsamt und geschlossene Bank, um 1931",
    shortTitle: "Zwischenkriegszeit",
    title: "Krise und Konsolidierung",
    body: [
      "Die zwanziger Jahre bringen eine kurze Erholung: stabilisierte Währungen, amerikanische Kredite, Radio, Kino, Automobil. Sie ruht auf schmalem Grund.",
      "**1929** bricht die Weltwirtschaftskrise aus. Der Zusammenbruch der Börsen zieht Banken, Kredite und Fabriken mit sich; in den Industrieländern verliert bis zu ein Drittel der Arbeitsfähigen die Beschäftigung. Regierungen reagieren zunächst mit Sparhaushalten und Schutzzöllen und verschärfen damit, was sie bekämpfen wollen.",
      "In Mitteleuropa gewinnen darauf **autoritäre Bewegungen** Zulauf, die Ordnung gegen Freiheit versprechen. Parlamente werden entmachtet, Notverordnungen zur Regel, Minderheiten zum Feindbild. Die Jahrzehnte, die folgen, kosten den Kontinent seine Städte, seine Bevölkerung und seine Selbstverwaltung.",
      "Einen eigenen Weg geht die **Sowjetunion**. Nach 1921 setzt sich dort die Linie der **Neuen Ökonomischen Politik** durch — und wird, anders als viele erwarteten, nicht wieder zurückgenommen. **Nikolai Bucharin** wird zur prägenden Figur einer Politik des langsamen Wachstums: Bauern behalten ihre Höfe, Handel und Kleingewerbe bleiben zugelassen, Industrialisierung geschieht über Jahrzehnte statt über Fünfjahrespläne mit Zwang. Das Ergebnis ist ein Staat, der ärmer bleibt als erhofft, aber wirtschaftlich stetiger und außenpolitisch berechenbarer als seine Nachbarn.",
      "- **Mythos:** „Die Krise kam über Nacht.“ — Nein. Überschuldete Landwirtschaft, überhitzte Spekulation und ein starres Goldwährungssystem hatten sie über Jahre vorbereitet.",
    ],
  },
  {
    id: "weltkrieg",
    image: imgWeltkrieg,
    imageCaption: "Tafel XII — Provisorische Verwaltung in den Ruinen, 1946",
    shortTitle: "Zweiter Weltkrieg",
    title: "1939–1948: Der zweite große Krieg",
    body: [
      "Die Krise der dreißiger Jahre entlädt sich 1939 in einem zweiten Krieg, der den ersten übertrifft. Der NS-Staat greift Polen an; Frankreich und Großbritannien erklären daraufhin dem NS-Staat den Krieg. Innerhalb von zwei Jahren steht fast ganz Europa unter seiner Besatzung oder der seiner Verbündeten.",
      "Dieser Krieg ist von Anfang an ein **Vernichtungskrieg**. Zivile Opfer werden nicht mehr als Kollateralschaden behandelt, sondern als Ziel: Bombardements ganzer Städte, deportierte Bevölkerungen, industriell organisierte Massenmorde. Die Zahlen übersteigen alles, was 1918 als unvorstellbar galt.",
      "Auch der Osten entwickelt sich anders als erwartet. Die Sowjetunion unter Buchars Neuer Ökonomischer Politik bleibt zwar autoritär, aber weniger expansionistisch und ideologisch aggressiv als ihre Gegner befürchteten. Ein Pakt zwischen Moskau und dem NS-Staat kommt nicht zustande; stattdessen hält Moskau lange Waffenstillstand, bevor es 1941 doch angegriffen wird. Der Krieg im Osten wird dadurch länger und blutiger; die Front verläuft ohne den ideologischen Zusatz, den die Reichspropaganda im Westen verbreitet.",
      "Die Vereinigten Staaten treten 1941 in den Krieg ein und bringen Produktionskapazitäten ins Spiel, die Europa nicht mehr besitzt. Der Pazifik-Krieg endet **1946 durch Verhandlungen**. Kernwaffen werden erst 1947 von mehreren Staaten entwickelt und gelten von Beginn an als nicht einsetzbar.",
      "In Europa bricht der NS-Staat 1945/46 zusammen. Doch der Krieg lässt sich nicht mehr siegreich beenden; er lässt sich nur noch nicht weiterführen. **1946** wird Mitteleuropa unter eine gemeinsame Vier-Mächte-Verwaltung gestellt — USA, Vereinigtes Königreich, Frankreich, Sowjetunion. Aus dem **Mandatsfrieden** entsteht das **provisorische Mandatsgebiet Mitteleuropa**, ein Verwaltungsraum ohne klare Ost-West-Teilung.",
      "Erst **1948** wird der Krieg formell durch Verhandlungen beendet. Nicht mit einer Siegerkonferenz, sondern mit dem Eingeständnis, dass niemand die Last noch tragen kann. Die Nationalstaaten, die ihn begonnen hatten, gelten fortan als ungeeignet, Europa zu ordnen.",
    ],
  },
  {
    id: "moderne",
    image: imgModerne,
    imageCaption: "Tafel XIII — Aufbau der Quadranten, um 1950",
    shortTitle: "Das Provisorium",
    title: "1946–1997: Das Provisorium und der Mandatsbund",
    body: [
      "Mitteleuropa geht aus den Krisen und Kriegen der ersten Jahrhunderthälfte **erschöpft** hervor: zerstörte Städte, entwurzelte Bevölkerungen, Verwaltungen ohne Akten, Währungen ohne Wert. Die Nationalstaaten, die den Zusammenbruch verursacht hatten, gelten als ungeeignet, ihn zu beheben.",
      "**1946** tritt an ihre Stelle eine gemeinsame Verwaltung der vier Schutzmächte — Vereinigte Staaten, Vereinigtes Königreich, Frankreich und Sowjetunion —, der **Mandatsrat**. Sein Auftrag lautet Wiederaufbau. Sein Name lautet **Provisorium**: Was als Provisorium gedacht war, weil sich die Alliierten darauf einigen konnten, wurde durch Praxis institutionalisiert. Erst **1986** wird es in den **Mandatsbund** überführt; seither spricht man vom **Mandatsgebiet Mitteleuropa**.",
      "1948 bis 1953 entstehen in den Trümmerfeldern die ersten **Quadranten** — Gebäudegruppen nach einheitlichem geometrischem Raster, ausgelegt auf schnelle Errichtung, geringen Materialverbrauch und leichte Erfassung. Wer heute durch einen Sektor geht, geht über Pläne aus jenen Jahren.",
      "Die zweite Jahrhunderthälfte bringt nicht die Wohlstandsexplosion, die beispielsweise in den Vereinigten Staaten von Amerika stattfand. Aber etwas, das die Verwaltung höher schätzt: **Berechenbarkeit**. Wohnraum wird zugeteilt, Arbeit zugewiesen, Versorgung geregelt, Lautstärke normiert. Hungersnöte und Massenarbeitslosigkeit gibt es seither nicht mehr; Auswahl, Umzug und Wechsel dafür kaum noch. Beides gehört zusammen.",
      "Die **Sektor-Reform 1996** fasst die Quadranten zu Sektoren zusammen und gilt als vorläufiger Abschluss dieser Entwicklung.",
      "- **Mythos:** „Das Raster wurde aus Prinzip gewählt.“ — Nein. Es wurde aus Zementmangel gewählt. Das Prinzip kam später dazu.",
      "> Ob dies das Ende der Geschichte ist, wird in Band 5 erörtert. Band 5 ist seit 1991 in Vorbereitung.",
      "Condorcets Satz von den Menschen, die keinen anderen Herrn anerkennen als ihre Vernunft, steht seit zweihundert Jahren im Raum. Er ist nicht widerlegt. Er ist nur noch nicht eingelöst.",
    ],
  },
];
