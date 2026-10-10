import type { DialogChoice, DialogLine, DialogTree, StoryFlag } from "../types";

/**
 * Hanne Brodersen — Wohnung 1104, Gebäude E71, Etage 1.
 * Geb. 1948 Hamburg, 1966 in die USA (Bay Area), 1972 zurück.
 * Liest Fuller, Mumford, Whole Earth Catalog, Beat-Literatur, Dylan —
 * und wendet das alles auf das Mandatsgebiet 1997 an.
 *
 * Aufbau: ein Hub mit sechs Strängen, jeder 3–5 Ebenen tief. Jede
 * Entscheidungszeile bietet „Zurück“ (zum Hub) und „Ich muss los“.
 */

type Entry = [DialogLine["speaker"], string, string?];

/** Baut eine lineare Folge; die letzte Zeile bekommt `choices`. */
function chain(
  prefix: string,
  entries: Entry[],
  choices: DialogChoice[],
): Record<string, DialogLine> {
  const out: Record<string, DialogLine> = {};
  entries.forEach(([speaker, text, subtext], i) => {
    const id = `${prefix}_${i + 1}`;
    const isLast = i === entries.length - 1;
    out[id] = {
      id,
      speaker,
      text,
      subtext,
      next: isLast ? undefined : `${prefix}_${i + 2}`,
      choices: isLast ? choices : undefined,
    };
  });
  return out;
}

const HUB = "hb";
const back: DialogChoice = { text: "Zurück zu etwas anderem.", next: HUB };
const bye: DialogChoice = { text: "Ich muss los.", next: "bye" };
const exits = [back, bye];
const go = (text: string, prefix: string, flag?: StoryFlag): DialogChoice => ({
  text,
  next: `${prefix}_1`,
  action: flag ? (a) => a.setFlag(flag) : undefined,
});

/* ------------------------------------------------------------------ */
/* Stränge                                                            */
/* ------------------------------------------------------------------ */

const usa = {
  ...chain(
    "us",
    [
      ["HANNE", "Achtzehn war ich. Hamburg, Hafen, Regen, ein Vater, der Zeitungen bügelte, bevor er sie las. Ich hatte ein Ticket nach New York und eine Adresse in Berkeley, die sich als Waschsalon herausstellte."],
      ["HANNE", "Sechsundsechzig, Herr Layard. Da hat die Westküste geglaubt, man könne das Bewusstsein umbauen wie eine Garage. Ein paar von uns haben stattdessen Garagen umgebaut. Ich war bei denen."],
      ["LAYARD", "Und dann kamen Sie zurück. 1972. Freiwillig?"],
      ["HANNE", "Völlig freiwillig. Ich habe Vollkornbrot vermisst. Ich meine das ernst. Und Gemütlichkeit. Und eine Sprache, in der ein Wort genau eine Sache meint und nicht drei Stimmungen."],
    ],
    [
      go("Und? Hat sich die Rückkehr gelohnt?", "us2"),
      go("Was vermissen Sie jetzt — hier?", "us3"),
      ...exits,
    ],
  ),
  ...chain(
    "us2",
    [
      ["HANNE", "Das Brot: ja. Die Sprache: ja, bis man merkt, dass präzise Sprache auch die präziseste Art ist, nichts zu sagen. Lesen Sie mal einen Bescheid der ZVS. Kein Wort falsch. Kein Satz wahr."],
      ["HANNE", "Und die Gemütlichkeit — die ist zweischneidig. Geborgenheit ist, wenn man sich sicher fühlt. Gemütlichkeit ist, wenn man aufgehört hat, nachzusehen, ob man es ist."],
    ],
    [go("Das klingt nach einem Vorwurf ans ganze Mandatsgebiet.", "psy"), ...exits],
  ),
  ...chain(
    "us3",
    [
      ["HANNE", "Die Weite. Nicht die Landschaft — die Köpfe. Drüben hat ein Zwanzigjähriger gesagt: Ich baue einen Computer für jeden Haushalt. Und man hat ihn ausgelacht, und dann hat er es getan."],
      ["HANNE", "Hier sagt ein Zwanzigjähriger dasselbe, und man fragt ihn, welches Formular er dafür vorgesehen hat. Niemand lacht. Das ist schlimmer."],
    ],
    [
      go("Erzählen Sie von dem Computer da drüben.", "mac", "hanneMac"),
      go("Sie meinen, hier fehlt Vision.", "fu", "hanneFuller"),
      ...exits,
    ],
  ),
};

const fuller = {
  ...chain(
    "fu",
    [
      ["HANNE", "Buckminster Fuller. Kennen Sie nicht? Natürlich nicht, er steht nicht im Verwaltungslexikon. Ingenieur, Dichter, Größenwahnsinniger im besten Sinne. Er hat gesagt, die Erde ist ein Raumschiff — und sie kam ohne Bedienungsanleitung."],
      ["HANNE", "„Operating Manual for Spaceship Earth“, 1969. Die Idee: Wir sind alle Besatzung, keiner ist Passagier. Wer so denkt, kann keine Grenze mehr ernst nehmen, die man nicht vom Orbit aus sieht."],
      ["LAYARD", "Das Mandatsgebiet ist ziemlich gut darin, Grenzen ernst zu nehmen."],
      ["HANNE", "Eben. Deshalb erzähle ich es Ihnen ja."],
    ],
    [
      go("Was meinte er mit „mehr mit weniger“?", "fu2"),
      go("Und diese Kuppel da?", "fu3"),
      go("Hat er auch etwas Brauchbares für Leute wie mich?", "fu4"),
      ...exits,
    ],
  ),
  ...chain(
    "fu2",
    [
      ["HANNE", "Ephemeralisierung. Ein schreckliches Wort für eine schöne Idee: Technik entwickelt sich dahin, mit immer weniger Material, Energie und Zeit immer mehr zu leisten. Ein Telefonkabel aus Kupfer, dann ein Glasfaden, dann gar nichts mehr — Funk."],
      ["HANNE", "Jetzt schauen Sie sich die Verwaltung an. Die macht das Gegenteil: mit immer mehr Formularen immer weniger. Fuller hätte das Ephemeralisierung rückwärts genannt. Ich nenne es Sektor 28."],
      ["LAYARD", "Vielleicht ist das gewollt. Wer weniger erreicht, verändert weniger."],
      ["HANNE", "Oh. Sie sind gar nicht so harmlos, wie Ihr Mantel aussieht."],
    ],
    [go("Das klingt nach Mumford.", "mu", "hanneMumford"), back, bye],
  ),
  ...chain(
    "fu3",
    [
      ["HANNE", "Eine geodätische Kuppel. Fullers berühmtestes Ding. Lauter Dreiecke, weil das Dreieck die einzige Form ist, die sich nicht verbiegt, ohne zu brechen."],
      ["HANNE", "Und dann Tensegrity — tensional integrity. Stäbe, die sich nicht berühren, gehalten nur durch Spannung. Die Stabilität kommt nicht aus der Härte der Teile, sondern aus dem Zug zwischen ihnen."],
      ["HANNE", "Ich denke oft, dass eine Gesellschaft so funktionieren könnte. Nicht durch Druck von oben — durch Spannung zwischen Gleichen. Das Mandatsgebiet ist das Gegenmodell: ein Ziegelbau. Alles liegt auf allem, und unten trägt einer alles."],
    ],
    [go("Und was ist mit Synergie?", "fu5"), back, bye],
  ),
  ...chain(
    "fu5",
    [
      ["HANNE", "Synergetik. Das Verhalten des Ganzen lässt sich aus den Teilen nicht vorhersagen. Chrom, Nickel, Stahl: jedes für sich schwach, zusammen eine Legierung, die mehr aushält als die Summe."],
      ["HANNE", "Die Verwaltung glaubt das Gegenteil. Sie glaubt, wenn jede Abteilung ihre Spalte richtig ausfüllt, ist das Ganze richtig. Es ist aber nur korrekt. Das ist nicht dasselbe."],
    ],
    exits,
  ),
  ...chain(
    "fu4",
    [
      ["HANNE", "Ein Satz, den man ihm zuschreibt: „Man ändert die Dinge nie, indem man die bestehende Wirklichkeit bekämpft. Um etwas zu ändern, baut man ein neues Modell, das das alte überflüssig macht.“"],
      ["HANNE", "Für einen Verwaltungsangestellten ist das der gefährlichste Satz, den es gibt. Sie dürfen nicht kämpfen — aber niemand hat Ihnen verboten, etwas Besseres zu bauen."],
      ["HANNE", "Und Fuller hat das World Game erfunden: ein Spiel, in dem man die Welt so schnell wie möglich für hundert Prozent der Menschheit funktionieren lässt. Ohne dass jemand Schaden nimmt. Das Gegenteil eines Kriegsspiels."],
    ],
    [go("Klingt nach dem, was Walter nebenan erzählt.", "fu6"), ...exits],
  ),
  ...chain(
    "fu6",
    [
      ["HANNE", "Walter! Der mit dem Peilrahmen. Ja, Walter hat Fuller von mir. Er hat ihn nur nie zu Ende gelesen, weil er beim zweiten Kapitel angefangen hat, die Kuppel nachzulöten."],
      ["HANNE", "Seine Partei mit dem englischen Namen — das ist Fuller für Leute, die keine Zeit haben. Gut gemeint. Wie fast alles hier."],
    ],
    exits,
  ),
};

const mumford = {
  ...chain(
    "mu",
    [
      ["HANNE", "Lewis Mumford. Der Gegenpol zu Fuller, und darum mein Liebster. Fuller glaubte an die Technik. Mumford hat gefragt, wem sie gehorcht."],
      ["HANNE", "„Der Mythos der Maschine“. Seine These: Die erste große Maschine der Geschichte war nicht aus Metall. Sie war aus Menschen. Pyramiden, Bewässerung, Armeen — tausende Körper, koordiniert von wenigen, wie Zahnräder."],
      ["HANNE", "Er nannte das die Megamaschine. Und sie braucht drei Dinge: einen Gottkönig, eine Schrift, um Befehle festzuhalten, und eine Bürokratie, die sie ausführt, ohne zu fragen."],
      ["LAYARD", "Eine Bürokratie, die ausführt, ohne zu fragen."],
      ["HANNE", "Ich sehe, Sie haben es schon verstanden. Sie sind ein Zahnrad, Herr Layard. Ich auch. Die Frage ist nur, ob wir quietschen."],
    ],
    [
      go("Was meint er mit autoritärer und demokratischer Technik?", "mu2"),
      go("Wer wäre hier der Gottkönig?", "mu3"),
      go("Was ist das „Pentagon der Macht“?", "mu4"),
      ...exits,
    ],
  ),
  ...chain(
    "mu2",
    [
      ["HANNE", "1964 hat er einen Aufsatz geschrieben: „Authoritarian and Democratic Technics“. Es gibt, sagt er, seit jeher zwei Arten von Technik. Die eine ist klein, handwerklich, gehört dem, der sie benutzt. Die andere ist groß, zentral, mächtig — und macht den Benutzer zum Bediensteten."],
      ["HANNE", "Ein Webstuhl in der Stube ist demokratisch. Eine Spinnerei mit dreitausend Spindeln ist autoritär, egal wie freundlich der Direktor ist."],
      ["HANNE", "Und jetzt raten Sie, welche Art Technik das Mandatsgebiet verteilt. Ihr Terminal im Büro — dürfen Sie das öffnen? Reparieren? Ohne Antrag?"],
      ["LAYARD", "Ich darf es einschalten."],
      ["HANNE", "Na also."],
    ],
    [go("Und Ihr Computer da drüben ist die andere Sorte?", "mac", "hanneMac"), ...exits],
  ),
  ...chain(
    "mu3",
    [
      ["HANNE", "Das ist das Raffinierte an der modernen Megamaschine. Sie braucht keinen Gottkönig mehr. Der Mandatsrat ist ein Gremium, das Gremium ist ein Protokoll, das Protokoll ist ein Vordruck."],
      ["HANNE", "Mumford hat das vorausgesehen: Die neue Megamaschine wird von niemandem gesteuert und gerade deshalb von keinem gestoppt. Der König ist das System selbst. Man kann ihn nicht stürzen, nur nicht mehr glauben."],
    ],
    [go("Ginsberg hätte das Moloch genannt, oder?", "be2", "hanneBeat"), ...exits],
  ),
  ...chain(
    "mu4",
    [
      ["HANNE", "Ein Wortspiel, typisch Mumford. Fünf Säulen: Power, Productivity, Profit, Property, Publicity — im Deutschen geht der Reim leider verloren. Macht, Produktivität, Profit, Besitz, Öffentlichkeit."],
      ["HANNE", "Er dachte dabei an Amerika. Ich übersetze es fürs Mandatsgebiet: Macht, Planerfüllung, Zuteilung, Kontingent, Verlautbarung. Dasselbe Gebäude, andere Fassade."],
      ["HANNE", "Und sein Gegenmittel war nicht Revolution, sondern das Organische: Städte im menschlichen Maß, Gärten, Nachbarschaften. „Die Stadt in der Geschichte“ — lesen Sie es. Danach sehen Sie Sektor 28 nie wieder gleich."],
    ],
    [go("Was hätte er über Sektor 28 gesagt?", "mu5"), ...exits],
  ),
  ...chain(
    "mu5",
    [
      ["HANNE", "Er hätte die Ringe gezählt und gesagt: Das ist keine Stadt, das ist ein Lager mit Postleitzahl. Eine Stadt, schrieb er, ist ein Theater des sozialen Handelns. Hier ist sie ein Wartezimmer."],
      ["HANNE", "Aber — und das gefällt mir an ihm — er hätte auch die Kantine gesehen. Die Leute, die da trotzdem miteinander reden. Er nannte das die eigentliche Technik: Menschen, die sich etwas zu sagen haben."],
    ],
    exits,
  ),
};

const wec = {
  ...chain(
    "we",
    [
      ["HANNE", "Der Whole Earth Catalog. Stewart Brand, 1968. Ein Versandkatalog, in dem man nichts kaufen konnte, ohne vorher etwas zu lernen. Werkzeuge, Bücher, Ideen, Bauanleitungen für Kuppeln und für Köpfe."],
      ["HANNE", "Auf der ersten Seite stand: „We are as gods and might as well get good at it.“ Wir sind wie Götter, also sollten wir lernen, gut darin zu sein."],
      ["HANNE", "Und das Motto: Access to Tools. Zugang zu Werkzeugen. Nicht zu Geld, nicht zu Macht — zu Werkzeugen. Wer das Werkzeug hat, braucht keine Erlaubnis."],
    ],
    [
      go("Wer stand noch alles darin?", "we2"),
      go("Was stand auf der letzten Seite?", "we3"),
      go("Gibt es so etwas im Mandatsgebiet?", "we4"),
      ...exits,
    ],
  ),
  ...chain(
    "we2",
    [
      ["HANNE", "Ach, alle. Gregory Bateson, der Anthropologe — „Ökologie des Geistes“. Für ihn war Denken kein Ding im Kopf, sondern ein Kreislauf zwischen Organismus und Umgebung. Wer den Wald zerstört, beschädigt sein eigenes Denken."],
      ["HANNE", "Norbert Wiener, Kybernetik: Steuerung durch Rückkopplung. Ein System, das nicht auf seine Fehler hört, fährt gegen die Wand, egal wie gut es geplant ist."],
      ["HANNE", "Marshall McLuhan — das Medium ist die Botschaft. Ivan Illich, „Werkzeuge für ein konviviales Leben“: Ein Werkzeug ist gut, solange es den Menschen dient, und schlecht, sobald der Mensch ihm dienen muss. Und Schumacher: Small is beautiful."],
    ],
    [
      go("Erklären Sie mir das mit der Rückkopplung.", "we5"),
      go("Bateson — was hat er über Zwickmühlen gesagt?", "ps2"),
      ...exits,
    ],
  ),
  ...chain(
    "we5",
    [
      ["HANNE", "Ein Thermostat. Es wird zu warm, der Fühler meldet es, die Heizung drosselt. Das ist Kybernetik. Das Wichtige ist nicht die Heizung, sondern dass die Meldung ankommt."],
      ["HANNE", "Nun ist das Mandatsgebiet eine Heizung ohne Fühler. Oder schlimmer: eine Heizung, die die Fühler bestraft. Wer meldet, dass es zu warm ist, bekommt einen Vermerk."],
      ["HANNE", "Wiener hat gewarnt: Eine Gesellschaft, die ihre Rückmeldungen unterdrückt, wird nicht stabiler. Sie wird nur blind — bis sie überhitzt."],
    ],
    [go("Resonanz-Überlastung, sozusagen.", "we6"), ...exits],
  ),
  ...chain(
    "we6",
    [
      ["HANNE", "Sie sagen es, ich nicht. Aber ja. Wenn eine Rückkopplung nicht gedämpft wird, sondern verstärkt, schaukelt sich das System auf. Jeder Tontechniker kennt das Pfeifen."],
      ["HANNE", "Die Frage, die mich nachts wach hält, Herr Layard: Was, wenn man das Pfeifen nicht abstellen will, sondern hören?"],
    ],
    exits,
  ),
  ...chain(
    "we3",
    [
      ["HANNE", "Die letzte Ausgabe, 1974. Auf der Rückseite ein Foto: eine Landstraße am frühen Morgen, so eine, auf der man trampt. Und darunter: „Stay hungry. Stay foolish.“"],
      ["HANNE", "Bleib hungrig. Bleib töricht. Ich habe das an meinen Kühlschrank geklebt, als ich zurückkam. Der Hausmeister hat gefragt, ob das eine Diätempfehlung ist."],
      ["HANNE", "Es ist das Gegenteil von dem, was das Mandatsgebiet will. Das will, dass wir satt und vernünftig sind. Satte, vernünftige Menschen stellen keine Fragen."],
    ],
    exits,
  ),
  ...chain(
    "we4",
    [
      ["HANNE", "Die Bibliothek in 1101 vielleicht. Herbert ist so etwas wie ein Whole Earth Catalog auf zwei Beinen — nur dass er nie verrät, wofür man das Wissen braucht."],
      ["HANNE", "Und das FastWeb. Das könnte es werden. Ein Katalog ohne Papier, in dem jeder schreibt und jeder liest. Brand hat davon geträumt. Aber ein Werkzeug ist nur so frei wie die Leitung, durch die es läuft."],
    ],
    [go("Wem gehört denn die Leitung?", "mac3"), ...exits],
  ),
};

const beat = {
  ...chain(
    "be",
    [
      ["HANNE", "Die Beats waren vor meiner Zeit, aber nicht vor meiner Lektüre. Kerouac, „Unterwegs“ — Leute, die einfach losfahren, ohne Passierschein. Hier ist das Science-Fiction."],
      ["HANNE", "Und Dylan. „The Times They Are a-Changin’“. Er hat das 1964 als Warnung an die Väter gesungen: Steht nicht in der Tür, versperrt nicht den Flur."],
      ["HANNE", "Ich habe es 1972 auf dem Schiff zurück gehört und gedacht: Hier stehen alle in der Tür. Und jeder hat einen Stempel für den Flur."],
    ],
    [
      go("Wer war Ginsberg?", "be2"),
      go("Und Burroughs?", "be3"),
      go("Ist Poesie nicht einfach Trost?", "be4"),
      ...exits,
    ],
  ),
  ...chain(
    "be2",
    [
      ["HANNE", "Allen Ginsberg, „Howl“, 1956. Das Gedicht fängt an mit: „Ich sah die besten Köpfe meiner Generation zerstört vom Wahnsinn.“ Und im zweiten Teil schreit er einen Namen: Moloch."],
      ["HANNE", "Moloch, der Götze, dem man Kinder opfert. Bei Ginsberg ist er aus Beton, Geld und Bürotürmen. „Moloch, dessen Geist reine Maschinerie ist.“"],
      ["HANNE", "Das ist Mumfords Megamaschine als Schrei statt als Buch. Und, Herr Layard — ich habe hier nicht ein einziges Gebäude gesehen, das kein Moloch-Gesicht hat."],
      ["LAYARD", "E67 hat Fenster."],
      ["HANNE", "Moloch hat auch Augen."],
    ],
    [go("Zurück zu Mumford.", "mu"), ...exits],
  ),
  ...chain(
    "be3",
    [
      ["HANNE", "William S. Burroughs. Unangenehmer Mann, unentbehrliche Gedanken. Für ihn war Sprache ein Virus und Gesellschaft ein System der Kontrolle — lange bevor jemand das Wort Kontrollgesellschaft gesagt hat."],
      ["HANNE", "Seine Waffe war die Cut-up-Technik. Man schneidet einen Text auseinander und klebt ihn neu zusammen. Und plötzlich sagt er, was er eigentlich verschweigen sollte."],
      ["HANNE", "Ich mache das mit meinen Bescheiden. Wollen Sie hören? „Ihr Antrag … wird … als nicht vorgesehen … zur Kenntnis genommen … im Interesse des Mandatsfriedens … Sie.“"],
    ],
    [
      { text: "Das ist ja unheimlich.", next: "be3b" },
      ...exits,
    ],
  ),
  be3b: {
    id: "be3b",
    speaker: "HANNE",
    text: "Nicht wahr? Burroughs sagte: Schneide die Wortlinien, und die Zukunft sickert durch. Ich glaube eher, die Gegenwart sickert durch. Die, die man sonst nicht lesen darf.",
    choices: exits,
  },
  ...chain(
    "be4",
    [
      ["HANNE", "Nein. Trost ist das, was die Verwaltung verteilt — Kantinenmusik, Lehrfilme, warme Ansprachen. Poesie ist Diagnose."],
      ["HANNE", "Dylan, „It’s Alright, Ma (I’m Only Bleeding)“: „Wer nicht damit beschäftigt ist, geboren zu werden, ist damit beschäftigt zu sterben.“ Das ist kein Trost. Das ist ein Befund."],
      ["HANNE", "Ein guter Vers tut, was ein guter Arzt tut: Er sagt Ihnen, wo es wehtut. Den Rest müssen Sie selbst machen."],
    ],
    exits,
  ),
};

const mac = {
  ...chain(
    "mac",
    [
      ["HANNE", "Mein Macintosh! Baujahr 1994. Über drei Grenzen und einen Onkel in Kiel hierher gekommen. Fragen Sie nicht wie."],
      ["HANNE", "1984 hat Apple ihn vorgestellt als den „Computer für den Rest von uns“. Nicht für Rechenzentren. Für Leute. Ein Werkzeug, das man in den Schoß nimmt wie ein Buch."],
      ["HANNE", "Und das Schönste ist HyperCard. Karten, die aufeinander verweisen. Man klickt auf ein Wort und landet woanders, und von dort woanders. Wie Denken. Wie ein Gespräch mit mir, ehrlich gesagt."],
    ],
    [
      go("Wer hat sich so etwas ausgedacht?", "mac2"),
      go("Und das FastWeb — ist das dasselbe?", "mac3"),
      ...exits,
    ],
  ),
  ...chain(
    "mac2",
    [
      ["HANNE", "Douglas Engelbart. 1968, ein Vortrag in San Francisco, den man heute die „Mutter aller Demos“ nennt. Maus, Fenster, Text, den zwei Leute gleichzeitig bearbeiten, über eine Leitung — alles an einem Nachmittag."],
      ["HANNE", "Engelbarts Idee war nicht, den Menschen zu ersetzen, sondern zu verstärken. Augmenting human intellect. Stewart Brand hat bei der Demo die Kamera gehalten. Alles hängt zusammen, sehen Sie?"],
      ["HANNE", "Und das Mandatsgebiet? Hat den Computer übernommen und die Idee zurückgeschickt. Unsere Terminals verstärken nicht den Menschen. Sie verstärken die Akte."],
    ],
    exits,
  ),
  ...chain(
    "mac3",
    [
      ["HANNE", "Das ist meine Sehnsucht und meine Angst zugleich. Ein Netz, in dem jeder mit jedem spricht — das ist der Whole Earth Catalog ohne Papier. Brand hat das schon 1985 mit dem WELL ausprobiert, einer Mailbox, in der Leute aus der ganzen Bucht miteinander geredet haben."],
      ["HANNE", "Aber Mumford flüstert mir ins Ohr: Jede Leitung hat einen Knoten, und jeder Knoten hat einen Besitzer. Ein Netz, das alle verbindet, ist auch ein Netz, das alle sieht."],
      ["HANNE", "Burroughs würde sagen: Kontrolle war nie so bequem."],
    ],
    [go("Also lieber kein Netz?", "mac4"), ...exits],
  ),
  ...chain(
    "mac4",
    [
      ["HANNE", "Doch! Unbedingt. Illich hat recht: Es kommt nicht auf das Werkzeug an, sondern darauf, wer es reparieren darf. Ein Netz, das wir selbst knüpfen, ist ein Fischernetz. Eins, das man uns knüpft, ist ein Käfig mit Löchern."],
      ["HANNE", "Darum lerne ich Programmieren, mit neunundvierzig. Langsam, mit Wörterbuch. Wenn die Zukunft durch eine Leitung kommt, möchte ich wenigstens wissen, wie man sie abisoliert."],
    ],
    exits,
  ),
};

const psy = {
  ...chain(
    "psy",
    [
      ["HANNE", "Kein Vorwurf. Eine Diagnose. Ich habe sechs Jahre unter Leuten gelebt, die sich ständig fragten, wer sie sind, und fünfundzwanzig unter Leuten, die das für eine Ordnungswidrigkeit halten."],
      ["HANNE", "Das Mandatsgebiet hat das Unbehagen nicht abgeschafft. Es hat es eingemeindet. Wer unzufrieden ist, bekommt eine Diagnose, eine Zuteilung und einen Termin. Das Gefühl wird verwaltet, damit es nicht politisch wird."],
    ],
    [
      go("Was meinen Sie mit „verwaltet“?", "ps2"),
      go("Und was hilft dagegen?", "ps3"),
      ...exits,
    ],
  ),
  ...chain(
    "ps2",
    [
      ["HANNE", "Bateson hat einen Begriff erfunden: die Doppelbindung. Ein Kind bekommt von der Mutter zwei Botschaften, die sich widersprechen — „Komm her“ mit verschränkten Armen. Was es auch tut, es ist falsch. Und es darf nicht sagen, dass die Botschaft falsch ist."],
      ["HANNE", "Jetzt lesen Sie einen Aushang: „Bürger sind ausdrücklich ermutigt, Anliegen vorzubringen. Anliegen außerhalb der vorgesehenen Kategorien sind nicht vorgesehen.“"],
      ["HANNE", "Das ist Doppelbindung auf Mandatsdeutsch. Und Bateson sagt: Wer lange genug darin lebt, wird entweder krank — oder sehr, sehr witzig."],
      ["LAYARD", "Und Sie?"],
      ["HANNE", "Ich backe Brot. Das ist meine dritte Möglichkeit."],
    ],
    exits,
  ),
  ...chain(
    "ps3",
    [
      ["HANNE", "Keine Revolution. Die enden alle in neuen Formularen. Eher das, was Schumacher wollte: kleine Dinge, in menschlichem Maß. Eine Werkstatt wie bei Walter. Eine Bibliothek wie bei Herbert. Eine Malerei wie bei Setsuko nebenan."],
      ["HANNE", "Fuller nannte sich einen Trimmruder. Am Heck eines großen Schiffs gibt es ein winziges Ruder, das das große Ruder bewegt, das das Schiff dreht. Wer klein und am richtigen Ort ist, kann den Kurs ändern."],
      ["HANNE", "Sie, Herr Layard, sitzen ziemlich genau am Heck."],
    ],
    exits,
  ),
};

/* ------------------------------------------------------------------ */

const strands: Record<string, DialogLine> = {
  ...usa,
  ...fuller,
  ...mumford,
  ...wec,
  ...beat,
  ...mac,
  ...psy,
  bye: {
    id: "bye",
    speaker: "HANNE",
    text: "Gehen Sie nur. Und nehmen Sie eine Scheibe Brot mit — nein, nehmen Sie keine, Sie würden sie nur als Beweismittel abgeben. Kommen Sie wieder!",
    end: true,
  },
};

function hubLine(text: string): DialogLine {
  return {
    id: HUB,
    speaker: "HANNE",
    text,
    choicesFn: (api) => {
      const c: DialogChoice[] = [];
      const add = (flag: StoryFlag, fresh: string, again: string, prefix: string) =>
        c.push(go(api.hasFlag(flag) ? again : fresh, prefix, flag));
      add("hanneUSA", "Warum sind Sie damals nach Amerika gegangen?", "Erzählen Sie noch einmal von Amerika.", "us");
      add("hanneFuller", "Wer ist dieser Fuller, von dem Sie reden?", "Noch mal Fuller.", "fu");
      add("hanneMumford", "Was lesen Sie gerade?", "Zurück zu Mumford und der Megamaschine.", "mu");
      add("hanneWEC", "Was sind das für Hefte da auf dem Tisch?", "Noch etwas aus dem Whole Earth Catalog.", "we");
      add("hanneBeat", "Sie haben viele Dylan-Platten.", "Mehr über die Beats und Dylan.", "be");
      add("hanneMac", "Ist das ein Computer? Ein privater?", "Zurück zu Ihrem Macintosh.", "mac");
      if (api.hasFlag("hanneMumford") || api.hasFlag("hanneWEC"))
        c.push({ text: "Was macht das alles mit den Menschen hier?", next: "psy_1" });
      c.push(bye);
      return c;
    },
  };
}

export const hanneDialogs: Record<string, DialogTree> = {
  hanneIntro: {
    id: "hanneIntro",
    start: "i1",
    onStart: (api) => api.setFlag("metHanne"),
    lines: {
      i1: {
        id: "i1",
        speaker: "HANNE",
        text: "Offen! Kommen Sie rein, es zieht. Sie sind der vom Rechercheauftrag, oder? Man redet im Korridor. Man redet hier immer im Korridor, das ist das einzig Kommunikative an diesem Bau.",
        subtext: "Eine Frau Ende vierzig, grauer Zopf, runde Brille, Leinenhemd. Sie gestikuliert schon, bevor sie fertig ist mit Begrüßen.",
        next: "i2",
      },
      i2: {
        id: "i2",
        speaker: "HANNE",
        text: "Hanne Brodersen. Hamburg, dann Kalifornien, dann wieder hier — in der Reihenfolge, die man bereut, und der, die man nicht bereut. Ich weiß nur nicht mehr, welche welche ist. Brot? Ist von heute früh.",
        choices: [
          { text: "Gern. Riecht gut.", next: "i3a" },
          { text: "Danke, nein. Ich wollte nur kurz …", next: "i3b" },
        ],
      },
      i3a: {
        id: "i3a",
        speaker: "HANNE",
        text: "Natürlich riecht es gut. Sauerteig, Roggen, Sonnenblumenkerne. Sechs Jahre lang habe ich in Amerika Brot gegessen, das man zu einer Kugel drücken konnte. Dafür bin ich zurückgekommen. Fast nur dafür.",
        next: "i4",
      },
      i3b: {
        id: "i3b",
        speaker: "HANNE",
        text: "Kurz. Das sagen alle. Und dann sitzen sie drei Stunden im Sessel und streiten mit mir über Lewis Mumford. Setzen Sie sich ruhig, ich verspreche nichts.",
        next: "i4",
      },
      i4: {
        id: "i4",
        speaker: "HANNE",
        text: "Wissen Sie, was das Schlimme ist? Hier hat man alles, was ich drüben vermisst habe, und nichts von dem, was ich hier vermisse. Die Weite. Die Vision. Leute, die abends über Computer reden statt über Zuteilungen.",
        next: HUB,
      },
      [HUB]: hubLine("Also. Worüber wollen wir reden? Ich habe Zeit, ich habe Kaffee, und ich habe ungefähr vierhundert Bücher Meinung."),
      ...strands,
    },
  },
  hanneHub: {
    id: "hanneHub",
    start: HUB,
    lines: {
      [HUB]: hubLine("Der Mann mit dem Mantel! Setzen Sie sich. Wo waren wir stehen geblieben — oder fangen wir woanders an?"),
      ...strands,
    },
  },
};
