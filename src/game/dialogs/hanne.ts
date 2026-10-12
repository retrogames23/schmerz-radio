import type { DialogChoice, DialogLine, DialogTree, GameApi, StoryFlag } from "../types";

/**
 * Hanne Brodersen — Wohnung 1104, Gebäude E71, Etage 1.
 * Geb. 1948 in Hamburg, 1966 in die USA, 1972 zurück.
 *
 * Die Gespräche beginnen bei Erinnerungen und Dingen im Raum. Begriffe und
 * Namen werden erst von Hanne eingeführt, bevor Layard danach fragen kann.
 * Kurze Zwischenmenüs halten das Tempo beim Spieler: vertiefen, wechseln,
 * gehen. Hanne redet viel, aber nicht mehr allein.
 */

type Entry = [DialogLine["speaker"], string, string?];

function chain(
  prefix: string,
  entries: Entry[],
  choices: DialogChoice[],
): Record<string, DialogLine> {
  const out: Record<string, DialogLine> = {};
  entries.forEach(([speaker, text, subtext], index) => {
    const id = `${prefix}_${index + 1}`;
    const last = index === entries.length - 1;
    out[id] = {
      id,
      speaker,
      text,
      subtext,
      next: last ? undefined : `${prefix}_${index + 2}`,
      choices: last ? choices : undefined,
    };
  });
  return out;
}

const HUB = "hb";
const back = (text = "Lassen wir den Gedanken erst einmal liegen."): DialogChoice => ({
  text,
  next: HUB,
});
const bye = (text = "Ich muss weiter."): DialogChoice => ({
  text,
  endsDialog: true,
});
const go = (text: string, prefix: string, flag?: StoryFlag): DialogChoice => ({
  text,
  next: `${prefix}_1`,
  action: flag ? (api) => api.setFlag(flag) : undefined,
});

/* ------------------------------------------------------------------ */
/* Amerika, Rückkehr, Brot und Gemütlichkeit                          */
/* ------------------------------------------------------------------ */

const usa = {
  ...chain(
    "us",
    [
      ["HANNE", "Achtzehn bin ich gewesen. Hamburg, Hafen, Regen. Mein Vater hat die Zeitung gebügelt, bevor er sie gelesen hat. Nicht aus Zwang — aus Überzeugung."],
      ["LAYARD", "Und Sie haben das gegen Amerika eingetauscht."],
      ["HANNE", "Gegen ein Ticket nach New York und eine Adresse in Berkeley. Die Adresse hat sich als Waschsalon herausgestellt. Das war meine erste amerikanische Lektion: Eine falsche Adresse kann trotzdem irgendwohin führen."],
      ["LAYARD", "Warum gerade dorthin?"],
      ["HANNE", "Weil dort Leute laut über die Zukunft gesprochen haben. Nicht nur Politiker. Studenten, Handwerker, Frauen mit Kindern, Männer in Garagen. Viel Unsinn, natürlich. Aber lebendiger Unsinn."],
    ],
    [
      go("Was haben Sie dort tatsächlich gemacht?", "us_work"),
      go("Und sechs Jahre später sind Sie zurückgekommen.", "us_return"),
      back("Ich möchte erst etwas anderes fragen."),
      bye(),
    ],
  ),
  ...chain(
    "us_work",
    [
      ["HANNE", "Erst Geschirr gespült. Dann in einer kleinen Druckerei gearbeitet. Abends haben wir in Küchen gesessen und Hefte geheftet, Schaltpläne kopiert, Adressen getauscht."],
      ["LAYARD", "Politische Flugblätter?"],
      ["HANNE", "Auch. Aber genauso Anleitungen: Wie man einen Ofen baut, ein Radio repariert, einen Garten auf schlechtem Boden anlegt. Mich hat beeindruckt, dass eine Idee dort oft mit einer Werkzeugliste endete."],
      ["LAYARD", "Hier endet sie eher mit einem Zuständigkeitsvermerk."],
      ["HANNE", "Sehen Sie. Darum dürfen Sie nicht nur höflich nicken. Sie kennen den Unterschied bereits."],
    ],
    [
      go("Diese Hefte auf Ihrem Tisch erinnern daran?", "we", "hanneWEC"),
      go("Was hat Sie trotzdem zurückgebracht?", "us_return"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "us_return",
    [
      ["HANNE", "1972 bin ich zurückgekommen. Freiwillig. Das muss ich immer dazusagen, sonst klingt es wie eine Abschiebung."],
      ["LAYARD", "Warum?"],
      ["HANNE", "Wegen Vollkornbrot. Lachen Sie ruhig. Das amerikanische Brot ließ sich zu einer Kugel drücken und sprang wieder auf. Ich wollte etwas, das Widerstand leistet."],
      ["LAYARD", "Nur wegen Brot fährt man nicht über einen Ozean."],
      ["HANNE", "Nein. Wegen Gemütlichkeit auch. Und wegen einer Sprache, in der ich einen Gedanken so lange festhalten kann, bis er genau ist. Ich habe Präzision mit Wahrheit verwechselt."],
    ],
    [
      go("Wann haben Sie den Unterschied bemerkt?", "us_language"),
      go("Was ist aus der vermissten Gemütlichkeit geworden?", "us_comfort"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "us_language",
    [
      ["HANNE", "Bei meinem ersten Bescheid. Kein Wort war falsch. Jeder Satz war vollständig. Und trotzdem stand am Ende nichts darin, worauf ein Mensch antworten konnte."],
      ["LAYARD", "Ein präziser Satz kann also unaufrichtig sein."],
      ["HANNE", "Er kann schlimmer sein. Er kann die Unaufrichtigkeit so genau vermessen, dass man sie für ein Verfahren hält."],
      ["LAYARD", "Ich habe früher Sätze geschrieben, damit jemand etwas sieht. Heute schreibe ich Vermerke, damit etwas abgelegt werden kann."],
      ["HANNE", "Dann wissen Sie, dass Sprache nicht harmlos ist. Ein Schriftsteller und ein Sachbearbeiter ordnen beide Wirklichkeit. Nur der eine darf zugeben, dass er es tut."],
    ],
    [
      go("Und was macht diese Ordnung mit den Menschen?", "psy"),
      back("Darüber muss ich einen Moment nachdenken."),
      bye(),
    ],
  ),
  ...chain(
    "us_comfort",
    [
      ["HANNE", "Geborgenheit ist, wenn man sich sicher fühlt und trotzdem nach der Tür sehen darf. Gemütlichkeit ist manchmal nur der Moment, in dem niemand mehr nachsieht."],
      ["LAYARD", "Sie machen aus einem Sessel eine politische Frage."],
      ["HANNE", "Nur aus einem sehr bequemen Sessel. Das Mandatsgebiet stellt überall welche hin: warme Kantinen, freundliche Durchsagen, Vorhänge vor Beton. Nichts davon ist böse. Zusammen kann es betäuben."],
      ["LAYARD", "Und Ihr Brot? Gehört das nicht auch zur Gemütlichkeit?"],
      ["HANNE", "Doch. Das ist mein Widerspruch. Ich misstraue der Betäubung und backe jeden Morgen daran mit. Man muss seine Widersprüche wenigstens frisch halten."],
    ],
    [
      go("Was vermissen Sie heute an Amerika?", "us_missing"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "us_missing",
    [
      ["HANNE", "Nicht Amerika. Die Weite im Denken. Dort hat ein Zwanzigjähriger gesagt: Ich baue einen Computer für jeden Haushalt. Man hat ihn ausgelacht, und dann hat jemand eine Garage aufgeschlossen."],
      ["LAYARD", "Hier würde man nach dem vorgesehenen Haushalt fragen."],
      ["HANNE", "Und nach der Geräteklasse. Niemand würde lachen. Das ist schlimmer, weil das Lachen immerhin einen Gedanken gehört hat."],
    ],
    [
      go("Dann zeigen Sie mir Ihren Computer.", "mac", "hanneMac"),
      go("Wer hat Sie zu diesem Blick auf Technik gebracht?", "fu", "hanneFuller"),
      back(),
      bye(),
    ],
  ),
};

/* ------------------------------------------------------------------ */
/* Fuller                                                              */
/* ------------------------------------------------------------------ */

const fuller = {
  ...chain(
    "fu",
    [
      ["HANNE", "Einer davon heißt Buckminster Fuller. Ingenieur, Gestalter, Dichter, gelegentlich unerträglich überzeugt von sich. Gerade genug Größenwahn, um die Gegenwart nicht für unvermeidlich zu halten."],
    ],
    [
      {
        text: "Haben Sie etwas von ihm zum Lesen hier?",
        next: "fu_zettel_1",
        hiddenWhen: ["fullerZettelTaken"],
      },
      { text: "Was hat er anders gesehen?", next: "fu2_1" },
      back(),
      bye(),
    ],
  ),
  ...chain(
    "fu_zettel",
    [
      ["HANNE", "Sogar auf Deutsch. Ich habe vor Jahren einige seiner Texte übersetzt, als ich sie Freunden hier erklären wollte. Warten Sie —"],
      ["SYSTEM", "Hanne steht auf, zieht eine Mappe aus dem Stapel neben dem Mac und blättert, bis sie einen eng beschriebenen Zettel findet."],
      ["HANNE", "Da. Das Hebelprinzip, das Raumschiff Erde, ein paar Aphorismen. Mein Englisch ist besser als meine Schrift, aber es reicht. Möchten Sie ihn mitnehmen?"],
    ],
    [
      {
        text: "Sehr gern. Danke.",
        next: "fu2_1",
        action: (a: GameApi) => {
          a.addItem({
            id: "fullerZettel",
            name: "Hannes Fuller-Übersetzungen",
            description:
              "Ein eng beschriebener Zettel mit Hannes eigenen Übersetzungen aus Fullers Texten: das Hebelprinzip, das Raumschiff Erde, einige Aphorismen.",
          });
          a.setFlag("fullerZettelTaken");
        },
      },
      { text: "Danke, ich merke mir das Wichtigste so.", next: "fu2_1" },
    ],
  ),
  ...chain(
    "fu2",
    [
      ["HANNE", "Die Erde als Raumschiff. Keine Metapher für Sonntagsreden, sondern eine Arbeitsannahme: begrenzte Vorräte, gemeinsame Reise, keine Ersatzmaschine."],
      ["LAYARD", "Und keine Bedienungsanleitung."],
      ["HANNE", "Genau. So heißt sein Buch von 1969 sinngemäß: Bedienungsanleitung für das Raumschiff Erde. Wir sind Besatzung, nicht Passagiere. Das verändert, wer für einen Defekt zuständig ist."],
    ],
    [
      go("Was folgt daraus für den Alltag?", "fu_less"),
      go("Hat das Kuppelmodell mit ihm zu tun?", "fu_dome"),
      go("Was kann ein Einzelner in so einem großen Schiff tun?", "fu_rudder"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "fu_less",
    [
      ["HANNE", "Fuller beobachtet, dass Technik mit weniger Material, Energie und Zeit mehr leisten kann. Ein schweres Kupferkabel wird zum Glasfaden, ein Raum voller Rechenmaschinen zu einem Kasten auf meinem Tisch."],
      ["LAYARD", "Fortschritt als Gewichtsverlust."],
      ["HANNE", "Schön gesagt. Er nennt es Ephemeralisierung. Ein schreckliches Wort für eine anschauliche Bewegung: mehr Wirkung mit weniger Aufwand."],
      ["LAYARD", "Die Verwaltung bewegt sich in die andere Richtung."],
      ["HANNE", "Mehr Formulare, mehr Stellen, mehr Durchschläge — und am Ende erreicht eine Nachricht den Nachbartisch nicht. Ephemeralisierung rückwärts. Sektor 28 als Gegenbeweis."],
    ],
    [
      go("Vielleicht ist die Wirkungslosigkeit gewollt.", "fu_less_doubt"),
      go("Sie sprechen von Technik. Wer entscheidet, wofür sie arbeitet?", "mu", "hanneMumford"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "fu_less_doubt",
    [
      ["LAYARD", "Wer weniger erreicht, verändert weniger. Vielleicht erfüllt das System genau seinen Zweck."],
      ["HANNE", "Da ist der frühere Autor. Sie hören auf das, was ein Satz verschweigt."],
      ["LAYARD", "Das verlernt man in der Verwaltung nicht. Man benutzt es nur anders."],
      ["HANNE", "Dann passen Sie auf, dass das Andersbenutzen nicht zum Verlernen wird."],
    ],
    [back("Lassen wir Fuller kurz ruhen."), bye()],
  ),
  ...chain(
    "fu_dome",
    [
      ["HANNE", "Ja. Eine geodätische Kuppel. Lauter Dreiecke. Ein Dreieck verändert seine Form erst, wenn eine Seite nachgibt; darum verteilt das Ganze die Last so gut."],
      ["LAYARD", "Viele schwache Teile tragen gemeinsam mehr."],
      ["HANNE", "Und sie tragen nicht, weil oben etwas Schweres auf ihnen liegt. Bei Fullers Tensegrity entsteht Stabilität aus Zug und Druck zwischen den Teilen."],
      ["LAYARD", "Sie sehen darin eine Gesellschaft."],
      ["HANNE", "Eine mögliche. Das Mandatsgebiet baut lieber Ziegelmauern: Alles liegt auf allem, und ganz unten trägt jemand, den keiner fragt."],
    ],
    [
      go("Kann man vom einzelnen Teil wirklich auf das Ganze schließen?", "fu_synergy"),
      back("Genug Architektur für den Moment."),
      bye(),
    ],
  ),
  ...chain(
    "fu_synergy",
    [
      ["HANNE", "Gerade nicht. Fuller nennt das Synergie: Das Verhalten des Ganzen lässt sich aus den einzelnen Teilen nicht vollständig vorhersagen."],
      ["LAYARD", "Wie bei einer Behörde. Jeder erfüllt seine Aufgabe, und gemeinsam entsteht etwas, das keiner beabsichtigt hat."],
      ["HANNE", "Sehr gut. Die Verwaltung verwechselt Korrektheit der Teile mit Richtigkeit des Ganzen. Jede Spalte stimmt, und der Mensch verschwindet."],
      ["LAYARD", "Dann ist das Ganze nicht mehr als die Summe. Es ist weniger."],
      ["HANNE", "Fuller hätte Sie gemocht. Vielleicht nur fünf Minuten, aber sehr intensiv."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "fu_rudder",
    [
      ["HANNE", "Fuller erzählt gern vom Trimmruder. Ein kleines Ruder bewegt das große, und das große dreht das Schiff. Nicht Größe entscheidet, sondern der richtige Ansatzpunkt."],
      ["LAYARD", "Das klingt tröstlich bequem. Jeder darf sich einreden, er sitze am richtigen Punkt."],
      ["HANNE", "Richtig. Deshalb reicht das Bild nicht. Man muss den Ansatzpunkt suchen, die Wirkung beobachten und zugeben, wenn nichts passiert."],
      ["LAYARD", "Wo wäre meiner?"],
      ["HANNE", "Sie bewegen Informationen. Früher als Autor, heute in Akten. Sie sitzen näher am Ruder, als Ihnen lieb sein sollte."],
    ],
    [
      go("Fuller wollte also ein neues System statt Widerstand?", "fu_model"),
      back("Das genügt mir als Verantwortung für heute."),
      bye(),
    ],
  ),
  ...chain(
    "fu_model",
    [
      ["HANNE", "Ein Satz wird ihm zugeschrieben: Man verändert etwas nicht, indem man gegen die bestehende Wirklichkeit kämpft. Man baut ein Modell, das die alte Wirklichkeit überflüssig macht."],
      ["LAYARD", "Im Mandatsgebiet braucht ein neues Modell zuerst eine Modellgenehmigung."],
      ["HANNE", "Dann bauen Sie klein. Fuller hat auch ein World Game entworfen: kein Kriegsspiel, sondern die Frage, wie die Welt für alle funktionieren kann, ohne jemanden zu vernichten."],
      ["LAYARD", "Ein Spiel ohne Gegner."],
      ["HANNE", "Mit Problemen statt Feinden. Allein diese Verschiebung wäre hier revolutionär."],
    ],
    [back(), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Mumford                                                             */
/* ------------------------------------------------------------------ */

const mumford = {
  ...chain(
    "mu",
    [
      ["HANNE", "Wenn Fuller fragt, was Technik ermöglichen kann, fragt Lewis Mumford, wem sie gehorcht. Ich brauche beide, sonst werde ich entweder naiv oder verbittert."],
      ["LAYARD", "Was ist Mumfords Antwort?"],
      ["HANNE", "Dass die mächtigste Maschine nicht unbedingt aus Metall besteht. Die Pyramiden sind gebaut worden, bevor es Motoren gab: aus tausenden Menschen, Befehlen, Listen und Strafen."],
      ["LAYARD", "Menschen als Bauteile."],
      ["HANNE", "Er nennt das die Megamaschine. Sie braucht einen Befehl oben, Schrift zur Übertragung und eine Bürokratie, die ausführt, ohne jedes Mal nach dem Sinn zu fragen."],
    ],
    [
      go("Wo wäre in einer modernen Megamaschine noch das Oben?", "mu_king"),
      go("Ist denn jede große Technik autoritär?", "mu_tech"),
      go("Wodurch erhält sich so eine Maschine?", "mu_power"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mu_king",
    [
      ["HANNE", "Früher stand dort ein Gottkönig. Heute ist es raffinierter: Der Mandatsrat ist ein Gremium, das Gremium ist ein Protokoll, das Protokoll ist ein Vordruck."],
      ["LAYARD", "Dann befiehlt niemand."],
      ["HANNE", "Und deshalb fühlt sich niemand verantwortlich. Die Maschine läuft, weil jeder nur den nächsten Schritt kennt."],
      ["LAYARD", "Man kann einen Vordruck nicht stürzen."],
      ["HANNE", "Nein. Aber man kann aufhören, ihn für Natur zu halten. Das ist unspektakulärer und schwieriger."],
    ],
    [
      go("Wie merkt ein Zahnrad, dass es eines ist?", "mu_person"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mu_person",
    [
      ["HANNE", "An dem Satz: Ich habe nur getan, was vorgesehen war. Wer ihn oft genug sagt, hört irgendwann das Nur nicht mehr."],
      ["LAYARD", "Und Sie? Sind Sie außerhalb der Maschine?"],
      ["HANNE", "Natürlich nicht. Ich wohne in ihrem Beton, beziehe ihren Strom und kaufe ihr Mehl. Der Unterschied ist nicht Reinheit. Der Unterschied ist, ob man das Knirschen noch hört."],
      ["LAYARD", "Sie quietschen also absichtlich."],
      ["HANNE", "Ununterbrochen. Meine Nachbarn können das bestätigen."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "mu_tech",
    [
      ["HANNE", "Mumford unterscheidet autoritäre und demokratische Technik. Nicht nach dem Aussehen, sondern danach, was sie aus ihren Benutzern macht."],
      ["LAYARD", "Ein Beispiel."],
      ["HANNE", "Ein Werkzeug in Ihrer Hand können Sie verstehen, verändern, weitergeben. Eine riesige Anlage kann Sie auf einen einzigen Handgriff reduzieren, selbst wenn ihr Direktor freundlich ist."],
      ["LAYARD", "Mein Terminal darf ich einschalten. Öffnen darf ich es nicht."],
      ["HANNE", "Dann wissen Sie, wem es gehört. Ein Gerät kann auf Ihrem Tisch stehen und trotzdem gegen Sie zentralisiert sein."],
    ],
    [
      go("Ist Ihr Macintosh wirklich anders?", "mac", "hanneMac"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mu_power",
    [
      ["HANNE", "Mumford beschreibt später ein Fünfeck der Macht: Macht, Produktivität, Profit, Besitz und öffentliche Inszenierung. Im Englischen beginnen alle fünf Wörter mit P."],
      ["LAYARD", "Und in Ihrer Übersetzung fürs Mandatsgebiet?"],
      ["HANNE", "Macht, Planerfüllung, Zuteilung, Kontingent, Verlautbarung. Kein schönes Fünfeck, aber ein stabiles."],
      ["LAYARD", "Was setzt er dagegen?"],
      ["HANNE", "Das menschliche Maß. Städte, in denen Wege Begegnungen erlauben. Werkzeuge, die ihre Benutzer nicht verkleinern. Nachbarschaften, die mehr sind als Belegungspläne."],
    ],
    [
      go("Was würde er in Sektor 28 sehen?", "mu_city"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mu_city",
    [
      ["HANNE", "Er würde die Ringe zählen und sagen: Das ist keine Stadt, sondern ein Lager mit Postleitzahl. Für ihn ist eine Stadt ein Theater sozialen Handelns."],
      ["LAYARD", "Und Sektor 28?"],
      ["HANNE", "Ein Wartezimmer. Aber er würde auch die Kantine sehen. Menschen reden dort miteinander, obwohl der Raum nur für Nahrungsaufnahme vorgesehen ist."],
      ["LAYARD", "Das genügt schon?"],
      ["HANNE", "Nein. Aber es ist der Moment, in dem die Maschine aus Menschen wieder Menschen werden lässt. Den darf man nicht gering schätzen."],
    ],
    [back(), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Whole Earth Catalog                                                */
/* ------------------------------------------------------------------ */

const wec = {
  ...chain(
    "we",
    [
      ["HANNE", "Das ist der Whole Earth Catalog. Stewart Brand hat ihn 1968 begonnen. Ein Katalog, in dem man nichts bestellen konnte, ohne vorher etwas über die Welt zu lernen."],
      ["LAYARD", "Werkzeuge neben Büchern."],
      ["HANNE", "Und Bücher als Werkzeuge. Auf dem Umschlag die Erde aus dem All. Innen Öfen, Computer, Landwirtschaft, Architektur, Philosophie. Keine Trennung zwischen Denken und Machen."],
      ["LAYARD", "Darum die Zeile ‚Access to Tools‘."],
      ["HANNE", "Zugang zu Werkzeugen. Nicht: Wartet auf Erlaubnis. Brand schreibt auch: Wir sind wie Götter und sollten lernen, gut darin zu werden. Großspurig — aber mit Verantwortung im zweiten Halbsatz."],
    ],
    [
      go("Welche Idee darin ist Ihnen am wichtigsten?", "we_feedback"),
      go("Wer hat für Sie noch hineingehört?", "we_people"),
      go("Was ist aus dem Katalog geworden?", "we_last"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "we_feedback",
    [
      ["HANNE", "Rückkopplung. Norbert Wiener, Kybernetik. Ein System muss die Folgen seines Handelns wahrnehmen, sonst kann es sich nicht steuern."],
      ["LAYARD", "Wie ein Thermostat."],
      ["HANNE", "Genau. Es wird warm, der Fühler meldet es, die Heizung drosselt. Nicht die Heizung ist klug. Entscheidend ist, dass die Meldung ankommt."],
      ["LAYARD", "Das Mandatsgebiet sammelt sehr viele Meldungen."],
      ["HANNE", "Aber es bestraft die Fühler. Wer Überhitzung meldet, bekommt einen Vermerk. Das ist keine Rückkopplung, sondern ein System, das seine eigenen Nerven betäubt."],
    ],
    [
      go("Und wenn eine Rückmeldung sich selbst verstärkt?", "we_feedback_loop"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "we_feedback_loop",
    [
      ["HANNE", "Dann schaukelt sie sich auf. Ein Mikrofon hört den Lautsprecher, der Lautsprecher verstärkt das Mikrofon, bis nur noch Pfeifen übrig ist."],
      ["LAYARD", "Wie eine Resonanz-Überlastung."],
      ["HANNE", "Ja. Jetzt haben Sie den Begriff eingeführt, nicht ich. Mich interessiert daran weniger das Pfeifen als die Frage, warum niemand den Regler findet."],
      ["LAYARD", "Oder ob jemand ihn absichtlich festhält."],
      ["HANNE", "Das ist die unangenehmere Frage. Behalten Sie sie."],
    ],
    [back("Die Frage behalte ich lieber für mich."), bye()],
  ),
  ...chain(
    "we_people",
    [
      ["HANNE", "Gregory Bateson zum Beispiel. Er beschreibt Denken nicht als Besitz im Kopf, sondern als Kreislauf zwischen einem Wesen und seiner Umgebung."],
      ["LAYARD", "Dann endet ein Gedanke nicht an der Schädeldecke."],
      ["HANNE", "Genau. Wer seine Umwelt zerstört, beschädigt den Zusammenhang, in dem er überhaupt denken kann. Das ist mehr als Umweltschutz. Es ist geistige Selbsterhaltung."],
      ["LAYARD", "Und die anderen Namen auf Ihren Zetteln?"],
      ["HANNE", "Ivan Illich fragt, wann ein Werkzeug den Menschen beherrscht. E. F. Schumacher besteht auf menschlichem Maß. Marshall McLuhan beobachtet, dass jedes Medium uns verändert, bevor wir über seinen Inhalt streiten."],
    ],
    [
      go("Bateson hat auch über widersprüchliche Botschaften geschrieben?", "psy_bind"),
      go("Wann beherrscht ein Werkzeug seinen Benutzer?", "we_illich"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "we_illich",
    [
      ["HANNE", "Illich nennt ein Werkzeug konvivial, wenn Menschen es selbstbestimmt benutzen können, ohne andere zu Werkzeugen zu machen."],
      ["LAYARD", "Also klein und einfach?"],
      ["HANNE", "Nicht unbedingt. Verstehbar, zugänglich, reparierbar. Die Größe ist weniger wichtig als die Abhängigkeit, die es erzeugt."],
      ["LAYARD", "Ein System, das nur Experten warten dürfen, verändert also auch seine Benutzer."],
      ["HANNE", "Es erzieht sie zur Hilflosigkeit. Darum interessiert mich an Computern nicht nur, was sie können. Ich will wissen, wer den Deckel öffnen darf."],
    ],
    [
      go("Dann reden wir über Ihren Macintosh.", "mac", "hanneMac"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "we_last",
    [
      ["HANNE", "Die letzte große Ausgabe ist 1974 erschienen. Auf der Rückseite: eine leere Landstraße am frühen Morgen. Darunter steht ‚Stay hungry. Stay foolish.‘"],
      ["LAYARD", "Hungrig bleiben. Töricht bleiben."],
      ["HANNE", "Ich habe es nach meiner Rückkehr an den Kühlschrank geklebt. Der Hausmeister hielt es für eine Diätempfehlung."],
      ["LAYARD", "Was bedeutet es Ihnen?"],
      ["HANNE", "Nicht satt werden an den vorhandenen Antworten. Nicht so vernünftig werden, dass jede unmögliche Idee schon vor dem ersten Satz stirbt."],
    ],
    [back(), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Beats, Dylan und Sprache                                           */
/* ------------------------------------------------------------------ */

const beat = {
  ...chain(
    "be",
    [
      ["HANNE", "Dylan ist der leichte Einstieg. Er klingt, als könne ein Lied eine Tür öffnen. Die Beats sind unbequemer: Kerouac, Ginsberg, Burroughs. Leute, die Sprache nicht schmücken, sondern aufschneiden."],
      ["LAYARD", "Was suchen sie darin?"],
      ["HANNE", "Den Punkt, an dem eine Gesellschaft in ihren eigenen Sätzen sichtbar wird. Kerouac fährt los, ohne Passierschein. Ginsberg schreit gegen eine Maschine. Burroughs zerschneidet die Anweisungen."],
      ["LAYARD", "Und Dylan?"],
      ["HANNE", "Warnt die Leute, die in Türen stehen und den Flur versperren. Ich habe das 1972 gehört und gedacht: Im Mandatsgebiet hat jeder in der Tür auch noch einen Stempel."],
    ],
    [
      go("Welche Maschine schreit Ginsberg an?", "be_ginsberg"),
      go("Was soll das Zerschneiden bei Burroughs?", "be_burroughs"),
      go("Kann ein Gedicht mehr als trösten?", "be_poetry"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "be_ginsberg",
    [
      ["HANNE", "In ‚Howl‘ sieht Ginsberg die besten Köpfe seiner Generation zerstört. Dann gibt er der zerstörenden Macht einen Namen: Moloch."],
      ["LAYARD", "Der Götze, dem Menschen geopfert werden."],
      ["HANNE", "Bei ihm ist Moloch aus Beton, Geld, Krieg und Bürotürmen. Sein Geist ist reine Maschinerie."],
      ["LAYARD", "Mumfords Megamaschine als Gedicht."],
      ["HANNE", "Als Schrei. Mumford erklärt, wie die Maschine gebaut ist. Ginsberg zeigt, wie es sich anfühlt, in ihr zu leben."],
    ],
    [
      go("E67 hat immerhin Fenster.", "be_windows"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "be_windows",
    [
      ["LAYARD", "E67 hat immerhin Fenster."],
      ["HANNE", "Moloch hat auch Augen."],
      ["SYSTEM", "Hanne lässt den Satz stehen. Aus dem Korridor dringt das Summen einer Leuchtstoffröhre."],
      ["LAYARD", "Das war eine Ihrer vorbereiteten Antworten."],
      ["HANNE", "Seit Jahren. Endlich hat jemand die richtige Vorlage geliefert."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "be_burroughs",
    [
      ["HANNE", "William Burroughs ist ein unangenehmer Mann mit unentbehrlichen Gedanken. Für ihn ist Sprache ein Kontrollsystem. Seine Cut-up-Technik schneidet Texte auseinander und setzt sie neu zusammen."],
      ["LAYARD", "Dadurch sollen sie wahrer werden?"],
      ["HANNE", "Nicht wahrer. Verdächtiger. Die gewohnte Satzordnung hält vieles verborgen, weil wir sie nicht mehr lesen, sondern nur noch erkennen."],
      ["SYSTEM", "Sie zieht einen Bescheid aus einem Buch. Die Streifen sind mit durchsichtigem Band neu zusammengesetzt."],
      ["HANNE", "Hören Sie: ‚Ihr Antrag — wird — im Interesse des Mandatsfriedens — als nicht vorgesehen — Sie.‘ Plötzlich steht der Adressat am Ende wie der eigentliche Fehler."],
    ],
    [
      go("Das ist unheimlich.", "be_cutup"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "be_cutup",
    [
      ["HANNE", "Ja. Nicht weil die Streifen die Zukunft vorhersagen. Weil die Gegenwart durch die Schnitte sickert."],
      ["LAYARD", "Als Autor hätte ich das für einen Trick gehalten."],
      ["HANNE", "Und als Verwaltungsangestellter?"],
      ["LAYARD", "Für eine unzulässige Veränderung eines Schriftstücks."],
      ["HANNE", "Sehen Sie, wie schnell ein Beruf eine Antwort findet?"],
    ],
    [back(), bye()],
  ),
  ...chain(
    "be_poetry",
    [
      ["HANNE", "Trost verteilt die Verwaltung: Kantinenmusik, Lehrfilme, warme Ansprachen. Poesie ist eher Diagnose."],
      ["LAYARD", "Das klingt hart für etwas, das Menschen freiwillig lesen."],
      ["HANNE", "Ein guter Vers sagt, wo es wehtut, ohne gleich ein Formular für die Heilung beizulegen."],
      ["LAYARD", "Ich habe einmal geglaubt, Schreiben könne etwas verändern."],
      ["HANNE", "Vielleicht hat es Sie verändert. Das ist weniger sichtbar, aber nicht nichts. Warum haben Sie aufgehört?"],
    ],
    [
      go("Weil es nicht zum Leben gereicht hat.", "be_writing"),
      back("Darauf möchte ich nicht antworten."),
      bye(),
    ],
  ),
  ...chain(
    "be_writing",
    [
      ["LAYARD", "Es hat nicht zum Leben gereicht. Die Verwaltung zahlt pünktlich."],
      ["HANNE", "Das ist keine kleine Antwort. Freiheit klingt anders, wenn die Miete fällig ist."],
      ["LAYARD", "Sie urteilen nicht?"],
      ["HANNE", "Doch, ständig. Aber nicht darüber. Mich interessiert eher, ob der Schreiber verschwunden ist oder nur einen sicheren Arbeitsplatz hat."],
      ["SYSTEM", "Layard sieht zu den zerschnittenen Bescheiden. Hanne wartet, ohne die Stille zu füllen."],
    ],
    [back("Reden wir von etwas anderem."), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Macintosh, HyperCard und Netz                                      */
/* ------------------------------------------------------------------ */

const mac = {
  ...chain(
    "mac",
    [
      ["HANNE", "Mein Macintosh. Baujahr 1994. Über drei Grenzen und einen Onkel in Kiel hierhergekommen. Den genauen Reiseweg kennt nur die Verpackung."],
      ["LAYARD", "Ein privater Computer ist hier fast auffälliger als Ihre Bücher."],
      ["HANNE", "Darum steht er offen da. Verstecken macht Dinge nur interessanter. Apple hat den Macintosh einmal als Computer für den Rest von uns vorgestellt — nicht fürs Rechenzentrum, sondern für einen Schreibtisch."],
      ["LAYARD", "Was tun Sie damit?"],
      ["HANNE", "Schreiben, ordnen, scheitern. Und HyperCard. Digitale Karteikarten, die aufeinander verweisen. Man klickt auf ein Wort und landet bei der nächsten Idee."],
    ],
    [
      go("Wer ist auf diese Art des Denkens gekommen?", "mac_engelbart"),
      go("Ist das FastWeb nicht schon so ein Kartenstapel?", "mac_net"),
      go("Warum lernen Sie mit neunundvierzig noch Programmieren?", "mac_learn"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mac_engelbart",
    [
      ["HANNE", "Douglas Engelbart hat 1968 in San Francisco eine Vorführung gemacht: Maus, Fenster, verknüpfter Text, zwei Menschen arbeiten über eine Leitung am selben Dokument."],
      ["LAYARD", "Alles an einem Nachmittag?"],
      ["HANNE", "Fast alles, was heute noch modern wirkt. Aber seine eigentliche Idee war nicht das Gerät. Er wollte den menschlichen Verstand verstärken — augmentieren, nicht ersetzen."],
      ["LAYARD", "Unsere Terminals verstärken eher die Akte."],
      ["HANNE", "Genau. Das Mandatsgebiet übernimmt die Maschine und schickt den Gedanken zurück. Technik ohne Absicht ist nur Möbel mit Strom."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "mac_net",
    [
      ["HANNE", "Das FastWeb könnte ein Whole Earth Catalog ohne Papier sein. Jeder liest, jeder schreibt, Wissen wandert schneller als ein Stempel."],
      ["LAYARD", "Sie sagen ‚könnte‘."],
      ["HANNE", "Weil jede Leitung einen Knoten hat und jeder Knoten einen Besitzer. In Kalifornien gibt es seit Jahren eine Mailbox namens WELL. Wunderbare Gespräche — und trotzdem läuft alles durch Rechner, die jemand abschalten kann."],
      ["LAYARD", "Ein Netz verbindet alle und sieht dadurch alle."],
      ["HANNE", "Das ist meine Sehnsucht und meine Angst im selben Kabel. Verbindung kann Gemeinschaft sein. Oder die bequemste Form der Kontrolle."],
    ],
    [
      go("Also lieber auf das Netz verzichten?", "mac_no"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "mac_no",
    [
      ["HANNE", "Nein. Unbedingt hinein. Aber nicht schlafend. Ein Werkzeug, das wir verstehen und reparieren können, erweitert uns. Eines, das nur über uns geführt wird, macht uns abhängig."],
      ["LAYARD", "Ein selbst geknüpftes Netz und ein Fangnetz sehen zunächst ähnlich aus."],
      ["HANNE", "Darum muss man die Knoten prüfen. Wer setzt die Regeln? Wer darf sprechen? Wer kann verschwinden, ohne dass seine Spur gespeichert bleibt?"],
      ["LAYARD", "Darauf hat das FastWeb keine sichtbare Antwort."],
      ["HANNE", "Dann ist das die erste Frage, die wir hineinschreiben sollten."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "mac_learn",
    [
      ["HANNE", "Weil ich nicht möchte, dass die Zukunft nur von Leuten erklärt wird, die jünger sind als meine Schuhe."],
      ["LAYARD", "Und weil Sie den Deckel selbst öffnen wollen."],
      ["HANNE", "Ja. Ich lerne langsam, mit Wörterbuch und vielen Fehlern. Das ist demütigend und sehr gesund."],
      ["LAYARD", "Was wollen Sie programmieren?"],
      ["HANNE", "Noch nichts Großes. Einen Kartenstapel, in dem ein Gedanke nicht nach Aktenzeichen, sondern nach Zusammenhang gefunden wird. Vielleicht ist das schon politisch genug."],
    ],
    [back(), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Psychologie und Mandatsdeutsch                                     */
/* ------------------------------------------------------------------ */

const psychology = {
  ...chain(
    "psy",
    [
      ["HANNE", "Es macht sie vorsichtig mit den eigenen Empfindungen. Unzufriedenheit wird zur persönlichen Störung, bevor sie eine gemeinsame Frage werden kann."],
      ["LAYARD", "Sie nennen das Verwaltung von Gefühlen."],
      ["HANNE", "Ja. Man bekommt eine Diagnose, eine Zuteilung und einen Termin. Danach ist das Unbehagen offiziell versorgt, auch wenn seine Ursache noch im Raum steht."],
      ["LAYARD", "Und wer sich nicht versorgen lassen will?"],
      ["HANNE", "Gilt als schwierig. Das ist ein erstaunlich wirksames Wort. Es beschreibt nie die Lage, immer die Person darin."],
    ],
    [
      go("Wie hält ein Mensch solche Widersprüche aus?", "psy_bind"),
      go("Was hilft, ohne gleich die Welt zu retten?", "psy_small"),
      back(),
      bye(),
    ],
  ),
  ...chain(
    "psy_bind",
    [
      ["HANNE", "Bateson beschreibt die Doppelbindung. Ein Mensch erhält zwei Botschaften, die sich widersprechen, und darf den Widerspruch selbst nicht benennen."],
      ["LAYARD", "Zum Beispiel?"],
      ["HANNE", "‚Komm her‘ — mit verschränkten Armen. Oder auf Mandatsdeutsch: ‚Bürger sind ausdrücklich ermutigt, Anliegen vorzubringen. Anliegen außerhalb der vorgesehenen Kategorien sind nicht vorgesehen.‘"],
      ["LAYARD", "Was man auch tut, bestätigt den Fehler bei sich selbst."],
      ["HANNE", "Und wer lange darin lebt, wird krank oder sehr witzig. Ich backe Brot. Das ist meine dritte Möglichkeit."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "psy_small",
    [
      ["HANNE", "Keine große Reinheit. Kleine Dinge im menschlichen Maß. Eine Werkstatt, eine Bibliothek, ein Gespräch, in dem jemand seine Meinung ändern darf."],
      ["LAYARD", "Das klingt bescheiden nach all Ihren großen Büchern."],
      ["HANNE", "Bescheidenheit ist nicht Kleinmut. Schumacher sagt: Small is beautiful. Nicht weil klein automatisch gut ist, sondern weil der Mensch darin noch vorkommen kann."],
      ["LAYARD", "Und wenn das Kleine nichts am Ganzen ändert?"],
      ["HANNE", "Dann hat es wenigstens verhindert, dass das Ganze alles wird. Auch das ist eine Wirkung."],
    ],
    [back(), bye()],
  ),
};

/* ------------------------------------------------------------------ */
/* Gerüchte um 104,6 und der Erfinder — erst, wenn Hanne Layard ernst */
/* nimmt. Vertrauen = gehörte Stränge + erreichte tiefe Stellen.      */
/* ------------------------------------------------------------------ */

const STRAND_FLAGS: StoryFlag[] = [
  "hanneUSA", "hanneFuller", "hanneMumford", "hanneWEC", "hanneBeat", "hanneMac",
];
/** Tiefe Stellen: Betreten setzt ein Vertrauens-Flag. */
const DEEP: Record<string, StoryFlag> = {
  us_language: "hanneDeepLanguage",
  fu_rudder: "hanneDeepRudder",
  mu_power: "hanneDeepPower",
  we_illich: "hanneDeepIllich",
  be_writing: "hanneDeepWriting",
  mac_learn: "hanneDeepLearn",
  psy_bind: "hanneDeepBind",
};
export function hanneTrust(api: { hasFlag: (f: StoryFlag) => boolean }): number {
  return [...STRAND_FLAGS, ...Object.values(DEEP)].filter((f) => api.hasFlag(f)).length;
}
export const HANNE_RUMOR_THRESHOLDS = { rumor1: 4, rumor2: 6, rumor3: 8, inventor: 10 } as const;

const rumors = {
  ...chain(
    "ru1",
    [
      ["HANNE", "Darf ich Ihnen etwas erzählen, das kein Gedanke ist, sondern Korridorgerede? Ich erzähle es nur Leuten, die nicht sofort einen Vermerk daraus machen."],
      ["LAYARD", "Ich bin heute nicht im Dienst. Jedenfalls nicht ganz."],
      ["HANNE", "Es gibt ein altes Bastlergerät. Ein Radio, das keine Musik bringt, sondern Gefühle. Meistens schlechte. Jahrzehntelang hat es kaum jemand gewollt."],
      ["HANNE", "Und jetzt höre ich, dass ausgerechnet die Einsamen im Sektor danach suchen. Witwer. Leute, die seit Jahren mit niemandem mehr streiten. Sie sagen, es sei das Einzige, das noch wehtut."],
      ["LAYARD", "Und das wollen sie?"],
      ["HANNE", "Ein Schmerz ist wenigstens ein Beweis, dass man noch Empfang hat. Wiener hätte gesagt: Ein System ohne Rückmeldung hält sich für tot."],
    ],
    [
      { text: "Ich kenne das Gerät. Ich höre es selbst.", next: "ru1_own_1" },
      { text: "Woher wissen Sie das?", next: "ru1_src_1" },
      back("Das muss ich erst einmal sacken lassen."),
      bye(),
    ],
  ),
  ...chain(
    "ru1_own",
    [
      ["HANNE", "Oh."],
      ["HANNE", "Dann verurteile ich Sie nicht. Ich wollte nur wissen, ob Sie mir zuhören oder mich prüfen. Sie hören zu."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "ru1_src",
    [
      ["HANNE", "Aus dem Waschkeller. Der Waschkeller ist die ehrlichste Zeitung des Hauses. Niemand lügt, während er fremde Socken sortiert."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "ru2",
    [
      ["HANNE", "Neulich hat mir eine Frau aus E67 erzählt, ihr Nachbar verlässt die Wohnung nicht mehr, ohne vorher eingeschaltet zu haben. Immer dieselbe Stelle auf der Skala. Hundertvierkommasechs."],
      ["LAYARD", "Eine Gewohnheit."],
      ["HANNE", "So fängt es an. Dann wird die Gewohnheit eine Bedingung. Sie sagt, es sind viele. Und mehrere von denen sind inzwischen versiegelt."],
      ["LAYARD", "Die Resonanz-Überlastungen."],
      ["HANNE", "Ich wollte erst sagen: wie Fernsehen oder Valium. Aber das stimmt nicht. Fernsehen betäubt. Das hier weckt. Und wer zu lange geweckt wird, bricht genauso zusammen."],
    ],
    [
      { text: "Warum gerade diese Frequenz?", next: "ru2_why_1" },
      back("Lassen wir das für den Moment."),
      bye(),
    ],
  ),
  ...chain(
    "ru2_why",
    [
      ["HANNE", "Das ist Ihre Frage, nicht meine. Ich bin eine Frau mit Brot und Büchern. Sie sind der mit dem Rechercheauftrag."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "ru3",
    [
      ["HANNE", "Es gibt noch eine dritte Geschichte. Die erzähle ich Ihnen nur, damit Sie sie von jemandem hören, der sie nicht glaubt."],
      ["LAYARD", "Ich höre."],
      ["HANNE", "Hundertvierkommasechs sei ein Programm. Jemand wolle den Sektor lahmlegen. Die Verwaltung, sagen die einen. Das Ausland, sagen andere. Einer im Waschkeller hat Außerirdische gesagt und es ernst gemeint."],
      ["LAYARD", "Und Sie?"],
      ["HANNE", "Diese Verwaltung schafft es nicht, einen Heizplan zu senden. Wie soll sie eine Stimmung senden? Mumfords Megamaschine ist gefährlich, weil sie langweilig ist, nicht weil sie raffiniert ist."],
      ["HANNE", "Aber ich gebe zu: Etwas daran bleibt mir im Nacken sitzen. Wenn es niemand plant und trotzdem passiert, ist das nicht beruhigender."],
    ],
    [
      { text: "Burroughs würde das Kontrolle nennen.", next: "ru3_burr_1", requires: ["hanneBeat"] },
      back("Ein unangenehmer Gedanke."),
      bye(),
    ],
  ),
  ...chain(
    "ru3_burr",
    [
      ["HANNE", "Burroughs hat überall Kontrolle gesehen. Das macht ihn nicht falsch, aber es macht ihn zu einem schlechten Zeugen."],
    ],
    [back(), bye()],
  ),
  ...chain(
    "inv",
    [
      ["LAYARD", "Woher kommt so ein Gerät überhaupt? Irgendjemand muss es gebaut haben."],
      ["HANNE", "Sie fragen wie einer, der die Antwort aufschreiben will."],
      ["LAYARD", "Ich frage wie einer, der es verstehen will. Beim Aufschreiben bin ich mir selbst nicht sicher."],
      ["HANNE", "…Gut. Fünfundsiebzig, Amateurfunktreffen in einer Turnhalle. Ein Mann mit Lötkolben in der Brusttasche, der nicht über Frequenzen sprechen wollte, sondern über Traurigkeit."],
      ["HANNE", "Seinen Namen sage ich Ihnen, sobald Sie ihn gefunden haben. Er hat mir damals seine Nummer auf die Innenhülle einer Platte gekritzelt — das Stück, über das wir die ganze Nacht geredet haben. Die Platte steht da drüben im Regal."],
      ["LAYARD", "Sie wissen nicht mehr, welche es war?"],
      ["HANNE", "Siebenundzwanzig Jahre, und ich finde meine eigene Plattensammlung nicht mehr ohne fremde Hilfe. Schauen Sie sich um. Wenn Sie die richtige Hülle in der Hand haben, erzähle ich Ihnen den Rest."],
    ],
    [
      { text: "Welche Platte habt ihr damals noch gleich gehört?", next: "sl_hint_1" },
      back("Dann sehe ich mir das Regal an."),
      bye(),
    ],
  ),
  ...chain(
    "sl_hint",
    [
      ["HANNE", "Dylan. Natürlich Dylan. Das Stück, in dem er singt, dass man manchmal niemandem gehorchen muss — ‚It's Alright, Ma‘. Das Ausgeliefertsein und die Freiheit darin. Damit sollten Sie etwas anfangen können."],
    ],
    [back("Dann sehe ich mir das Regal an."), bye()],
  ),
};

const RUMOR_HOSTS: Record<string, { prefix: string; flag: StoryFlag; min: number; text: string; requiresRumor?: StoryFlag }> = {
  us_comfort: { prefix: "ru1", flag: "hanneRumor1", min: HANNE_RUMOR_THRESHOLDS.rumor1, text: "Sie sehen aus, als hätten Sie noch etwas auf dem Herzen." },
  psy_bind: { prefix: "ru1", flag: "hanneRumor1", min: HANNE_RUMOR_THRESHOLDS.rumor1, text: "Kennen Sie hier jemanden, dem das passiert?" },
  mu_power: { prefix: "ru2", flag: "hanneRumor2", min: HANNE_RUMOR_THRESHOLDS.rumor2, text: "Hängen die Leute hier auch an anderen Maschinen?", requiresRumor: "hanneRumor1" },
  mac_net: { prefix: "ru2", flag: "hanneRumor2", min: HANNE_RUMOR_THRESHOLDS.rumor2, text: "Kann man auch von einem Signal abhängig werden?", requiresRumor: "hanneRumor1" },
  be_burroughs: { prefix: "ru3", flag: "hanneRumor3", min: HANNE_RUMOR_THRESHOLDS.rumor3, text: "Glauben Sie, jemand steuert das alles?", requiresRumor: "hanneRumor2" },
  fu_rudder: { prefix: "ru3", flag: "hanneRumor3", min: HANNE_RUMOR_THRESHOLDS.rumor3, text: "Und wenn jemand anderes das Ruder hält?", requiresRumor: "hanneRumor2" },
};

type TrustApi = Parameters<NonNullable<DialogLine["choicesFn"]>>[0];

function rumorChoice(api: TrustApi, host: (typeof RUMOR_HOSTS)[string]): DialogChoice | null {
  if (api.hasFlag(host.flag)) return null;
  if (host.requiresRumor && !api.hasFlag(host.requiresRumor)) return null;
  if (hanneTrust(api) < host.min) return null;
  return go(host.text, host.prefix, host.flag);
}

/** Nächstes fälliges Gerücht oder der Erfinder, als Hub-Einstieg. */
function pendingHubChoice(api: TrustApi): DialogChoice | null {
  const t = hanneTrust(api);
  if (!api.hasFlag("hanneRumor1") && t >= HANNE_RUMOR_THRESHOLDS.rumor1)
    return go("Sie wollten mir neulich noch etwas erzählen.", "ru1", "hanneRumor1");
  if (api.hasFlag("hanneRumor1") && !api.hasFlag("hanneRumor2") && t >= HANNE_RUMOR_THRESHOLDS.rumor2)
    return go("Gibt es Neues aus dem Waschkeller?", "ru2", "hanneRumor2");
  if (api.hasFlag("hanneRumor2") && !api.hasFlag("hanneRumor3") && t >= HANNE_RUMOR_THRESHOLDS.rumor3)
    return go("Was erzählt man sich sonst über diese Frequenz?", "ru3", "hanneRumor3");
  if (api.hasFlag("hanneRumor3") && !api.hasFlag("hanneSleeveHint") && t >= HANNE_RUMOR_THRESHOLDS.inventor)
    return go("Woher kommt so ein Gerät eigentlich?", "inv", "hanneSleeveHint");
  return null;
}

function weave(lines: Record<string, DialogLine>): Record<string, DialogLine> {
  const out: Record<string, DialogLine> = {};
  for (const [id, line] of Object.entries(lines)) {
    let l: DialogLine = line;
    if (l.choices) {
      l = {
        ...l,
        choices: l.choices.map((c) => {
          const p = c.next?.endsWith("_1") ? c.next.slice(0, -2) : undefined;
          const deep = p ? DEEP[p] : undefined;
          if (!deep) return c;
          const prev = c.action;
          return { ...c, action: (api) => { prev?.(api); api.setFlag(deep); } };
        }),
      };
      const hostKey = Object.keys(RUMOR_HOSTS).find((k) => id.startsWith(`${k}_`) && !l.next);
      if (hostKey) {
        const host = RUMOR_HOSTS[hostKey];
        const base = l.choices!;
        l = {
          ...l,
          choices: undefined,
          choicesFn: (api) => {
            const extra = rumorChoice(api, host);
            return extra ? [extra, ...base] : base;
          },
        };
      }
    }
    out[id] = l;
  }
  return out;
}

const invest = {
  ...chain(
    "invq",
    [
      ["HANNE", "Ach. Sie sind also im Dienst. Ich hatte gehofft, Sie schauen aus Neugier vorbei.", "Sie legt das Brotmesser hin, ohne dass es ein Vorwurf ist."],
      ["HANNE", "Aber nein. Über die Zusammenbrüche, über dieses Radio, über das, wovon im Korridor geflüstert wird — darüber rede ich nicht mit jemandem, den ich seit fünf Minuten kenne. Lernen wir uns erst ein bisschen kennen: ein Gedanke, eine Platte, ein Brot. Danach reden wir über das, warum Sie eigentlich hier sind."],
      ["LAYARD", "Einverstanden."],
    ],
    [back("Schön. Dann fangen wir mit dem Brot an.")],
  ),
};

const strands: Record<string, DialogLine> = weave({
  ...invest,
  ...usa,
  ...fuller,
  ...mumford,
  ...wec,
  ...beat,
  ...mac,
  ...psychology,
  ...rumors,
});

function hubLine(text: string): DialogLine {
  return {
    id: HUB,
    speaker: "HANNE",
    text,
    choicesFn: (api) => {
      const choices: DialogChoice[] = [];
      const pending = pendingHubChoice(api);
      if (pending) choices.push(pending);
      if (api.hasFlag("hanneSleeveHint") && !api.hasFlag("hanneInventor")) {
        choices.push({
          text: "Welche Platte habt ihr damals noch gleich gehört?",
          next: "sl_hint_1",
        });
      }
      if (
        !api.hasFlag("hanneInvest") &&
        !api.hasFlag("hanneRumor1") &&
        hanneTrust(api) < HANNE_RUMOR_THRESHOLDS.rumor1
      ) {
        choices.push(
          {
            text: "Ich ermittle wegen der Zusammenbrüche in diesem Sektor.",
            next: "invq_1",
            action: (a) => a.setFlag("hanneInvest"),
          },
          {
            text: "Was wissen Sie über das Schmerz-Radio?",
            next: "invq_1",
            action: (a) => a.setFlag("hanneInvest"),
          },
        );
      }
      const add = (
        flag: StoryFlag,
        first: string,
        again: string,
        prefix: string,
      ) => choices.push(go(api.hasFlag(flag) ? again : first, prefix, flag));

      add(
        "hanneUSA",
        "Sie haben Hamburg und Kalifornien erwähnt. Wie kam es dazu?",
        "Noch einmal zu Amerika und Ihrer Rückkehr.",
        "us",
      );
      add(
        "hanneWEC",
        "Was sind das für großformatige Hefte auf dem Tisch?",
        "Ich möchte einen Gedanken aus dem Whole Earth Catalog vertiefen.",
        "we",
      );
      add(
        "hanneMac",
        "Der Computer dort — ist der wirklich privat?",
        "Noch einmal zu Ihrem Macintosh und dem Netz.",
        "mac",
      );
      add(
        "hanneBeat",
        "Sie haben fast alle Dylan-Platten. Was hören Sie in ihnen?",
        "Noch einmal zu Dylan, den Beats und der Sprache.",
        "be",
      );
      add(
        "hanneMumford",
        "Welches Buch liegt da mit den vielen Zetteln?",
        "Ich möchte bei Mumfords Megamaschine weiterdenken.",
        "mu",
      );
      add(
        "hanneFuller",
        "Das Kuppelmodell sieht nicht nach Dekoration aus.",
        "Noch einmal zu Fuller und seinem Raumschiff.",
        "fu",
      );
      if (api.hasFlag("hanneMumford") || api.hasFlag("hanneWEC")) {
        choices.push({
          text: "Was macht all diese Ordnung mit den Menschen hier?",
          next: "psy_1",
        });
      }
      choices.push(bye("Für heute reicht es. Ich muss weiter."));
      return choices;
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
        text: "Offen! Kommen Sie rein, es zieht. Sie sind der Mann mit dem Rechercheauftrag, oder? Im Korridor spricht man darüber, weil der Korridor das einzige soziale Medium dieses Hauses ist.",
        subtext: "Eine Frau Ende vierzig, grauer Zopf, runde Brille, Leinenhemd. Sie hält ein Brotmesser in der einen Hand und deutet mit der anderen auf einen freien Sessel.",
        next: "i2",
      },
      i2: {
        id: "i2",
        speaker: "LAYARD",
        text: "Layard Worag. Ich wollte nicht stören.",
        next: "i3",
      },
      i3: {
        id: "i3",
        speaker: "HANNE",
        text: "Dann sind Sie in der falschen Wohnung. Hanne Brodersen. Hamburg, dann Kalifornien, dann wieder hier. Brot? Heute früh gebacken.",
        choices: [
          { text: "Gern. Es riecht gut.", next: "i4a" },
          { text: "Danke, nein. Ich wollte nur kurz hereinschauen.", next: "i4b" },
          { text: "Ich sollte gleich weiter.", endsDialog: true },
        ],
      },
      i4a: {
        id: "i4a",
        speaker: "HANNE",
        text: "Roggen, Sauerteig, Sonnenblumenkerne. Sechs Jahre Amerika, und am Ende bringt mich ein Brot zurück. Das klingt lächerlich, bis man sechs Jahre lang keines hatte, das beim Schneiden Widerstand leistet.",
        subtext: "Sie schneidet zwei ungleich dicke Scheiben ab und gibt Layard die größere.",
        next: "i5a",
      },
      i5a: {
        id: "i5a",
        speaker: "LAYARD",
        text: "Sie sind wegen Vollkornbrot zurückgekehrt?",
        next: "i6",
      },
      i4b: {
        id: "i4b",
        speaker: "HANNE",
        text: "Kurz sagen hier alle. Dann sehen sie den Computer, die Bücher oder die Kuppel, und plötzlich ist der Nachmittag weg. Bleiben Sie stehen, wenn Ihnen das sicherer vorkommt.",
        next: "i5b",
      },
      i5b: {
        id: "i5b",
        speaker: "LAYARD",
        text: "Die Wohnung sieht jedenfalls nicht aus wie der Rest des Korridors.",
        next: "i6",
      },
      i6: {
        id: "i6",
        speaker: "HANNE",
        text: "Das ist freundlich formuliert. Ich habe hier alles gesammelt, was mich daran erinnert, dass die Gegenwart nicht die einzige denkbare Einrichtung ist.",
        next: "i7",
      },
      i7: {
        id: "i7",
        speaker: "LAYARD",
        text: "Und womit fängt man an?",
        next: HUB,
      },
      [HUB]: hubLine("Worüber wollen Sie reden?"),
      ...strands,
    },
  },
  hanneHub: {
    id: "hanneHub",
    start: HUB,
    lines: {
      [HUB]: hubLine("Da sind Sie wieder. Setzen Sie sich, oder bleiben Sie stehen. Wir müssen nicht schneller reden, nur weil der Korridor lang ist."),
      ...strands,
    },
  },
  hanneSleeve: {
    id: "hanneSleeve",
    start: "s1",
    lines: {
      s1: {
        id: "s1",
        speaker: "SYSTEM",
        text: "Das Plattenregal. Dylan, fast vollständig — drei Alben kommen für das Jahr des besagten Stücks in Frage. Hanne beobachtet Layard über den Brillenrand, ohne zu helfen.",
        choices: [
          { text: "„Highway 61 Revisited“ herausziehen.", next: "s_wrong" },
          {
            text: "„Bringing It All Back Home“ herausziehen.",
            next: "s_found_1",
            action: (a) => a.setFlag("hanneInventor"),
          },
          { text: "„Blonde on Blonde“ herausziehen.", next: "s_wrong" },
          { text: "Doch lieber noch einmal nachfragen.", next: "sl_hint_1" },
          { text: "Ich schaue später noch einmal.", endsDialog: true },
        ],
      },
      s_wrong: {
        id: "s_wrong",
        speaker: "HANNE",
        text: "Nein, nicht die. Hören Sie genauer hin — das Ausgeliefertsein. ‚It's Alright, Ma‘. Die Hülle steckt wieder im Regal.",
        next: "s1",
      },
      s_found_1: {
        id: "s_found_1",
        speaker: "SYSTEM",
        text: "Die Innenhülle ist schwerer als erwartet. Auf dem matt gewordenen Papier, in verblasstem Bleistift: „K.E. — Sektor 14 — 014 / 30 72 19“.",
        next: "s_found_2",
      },
      s_found_2: {
        id: "s_found_2",
        speaker: "HANNE",
        text: "Da haben Sie sie. Konrad Elsner. Er hat nie ein Patent angemeldet. Die Firma, die in den Achtzigern seine Geräte verkauft hat, ist längst pleite, und er war froh darüber.",
        next: "s_found_3",
      },
      s_found_3: {
        id: "s_found_3",
        speaker: "LAYARD",
        text: "Lebt er noch?",
        next: "s_found_4",
      },
      s_found_4: {
        id: "s_found_4",
        speaker: "HANNE",
        text: "Nicht in Sektor 28. Er ist weggezogen, als das Ding anfing, Gesprächsstoff zu werden. Zu Weihnachten nimmt er ab.",
        next: "s_found_5",
      },
      s_found_5: {
        id: "s_found_5",
        speaker: "HANNE",
        text: "Und Layard: Rufen Sie ihn nicht als Beamter an. Rufen Sie ihn an wie jemand, der etwas gehört hat.",
        subtext: "Sie nimmt die Hülle nicht zurück. Manche Dinge verwahrt man besser bei jemandem, der sie braucht.",
        choices: [
          { text: "Danke. Ich werde vorsichtig sein.", next: HUB },
          { text: "Ich muss weiter.", endsDialog: true },
        ],
      },
    },
  },
};
