// Teleempfänger – Kanal-Daten. Statisch und groß; Auslagerung hält das
// Render-Modul klein und verhindert pro-Render-Reallocs.
import anchorZdsAsset from "@/assets/tv/anchor-zds.mp4.asset.json";
import anchorBvAsset from "@/assets/tv/anchor-bv.mp4.asset.json";
import anchorWetterAsset from "@/assets/tv/anchor-wetter.mp4.asset.json";

export interface Channel {
  id: "z1" | "z2" | "z3";
  name: string;
  tag: string;
  ticker: string;
  bulletins: string[];
  /** Fallback-Wartezeit pro Meldung in Sekunden (bei TTS-Aus / Fehler). */
  hold: number;
  /** Wand-Loop des/der Sprecher/in (10s, läuft endlos). */
  videoUrl: string;
  /** ElevenLabs voiceId für die Sprecher/in dieses Senders. */
  voiceId: string;
  /** Akzentfarbe für UI-Akzente und Bauchbinde. */
  accentClass: string;
}

export const CHANNELS: Channel[] = [
  {
    id: "z1",
    name: "ZDS · Sektorbericht",
    tag: "Zentrale Direktion für Sektorale Lage",
    ticker:
      "+++ Heizöl-Kontingjent für Sektor 28 um vier Prozent angehoben +++ Ringstraße zwischen E67 und E71 ab Montag einspurig +++ Winterfahrplan der Mandatsbahn ab 15.11. gültig +++ Meldefrist für die Wohnraum-Sprawka endet am 30.11. +++ Mandatsrat tagt am Donnerstag zur Haushaltslage +++",
    hold: 13,
    videoUrl: anchorZdsAsset.url,
    voiceId: "Xb7hH8MSUJpSbSDYk0k2",
    accentClass: "text-emerald-300",
    bulletins: [
      "Guten Abend. Der Mandatsrat hat das Heizöl-Kontingjent für Sektor 28 um vier Prozent angehoben. Die Anhebung gilt ab Montag und betrifft rund elftausend Wohneinheiten. Die Hausverwaltungen wurden schriftlich unterrichtet.",
      "Die Ringstraße zwischen Gebäude E67 und Gebäude E71 wird ab Montag für neun Tage einspurig geführt. Grund sind Arbeiten an der Fernwärmeleitung. Die Fahrzeit verlängert sich nach Angaben der Verkehrsstelle um sieben bis zwölf Minuten.",
      "Zum Winterfahrplan der Mandatsbahn. Ab dem 15. November entfällt die 5-Uhr-40 ab E-Nord ersatzlos. Die 6-Uhr-05 hält dafür zusätzlich in E12-West. Aushänge hängen seit gestern in den Empfangsbereichen.",
      "Die Meldefrist für die Wohnraum-Sprawka endet am 30. November. Wer seine Wohneinheit seit dem Frühjahr weder unter- noch übervermietet hat, kann die Kurzform verwenden. Sie umfasst zwei Seiten statt sieben.",
      "Personalie. Die Leitung der Bauverwaltung in Sektor 28 wechselt zum Monatsende an Frau Dr. Ostermann, bisher Fernwärme. Ihr Vorgänger geht nach neunzehn Jahren in den Ruhestand.",
      "Die Wasserversorgung in Gebäude E12-West war am Dienstag zwischen 4 und 9 Uhr unterbrochen. Ursache war ein Rohrbruch im Erdgeschoss. Die Bewohner erhalten eine Gutschrift von zwei Kontingjent-Einheiten.",
      "In Gebäude E71 wurden im Oktober zwölf zusätzliche Betten in Korridor 15 aufgestellt. Die medizinische Leitung spricht von einer saisonal erhöhten Eingangslage. Besuchszeiten bleiben unverändert.",
      "Zur Belegungslage in Sektor 28. Die Verwaltung meldet für Oktober eine Auslastung von 94 Prozent in den medizinischen Einrichtungen. Im Vorjahresmonat waren es 88 Prozent. Eine Erklärung wurde nicht mitgeteilt.",
      "Die Leitstelle E67 hat ihre Erreichbarkeit ausgeweitet. Der Apparat 001 ist ab kommender Woche werktags von 6 bis 20 Uhr besetzt, samstags bis 14 Uhr. An Sonntagen bleibt es beim Notdienst.",
      "Zwei Aufzüge in Gebäude E29 sind seit Mittwoch außer Betrieb. Ersatzteile werden für Anfang Dezember erwartet. Bewohnern der oberen Etagen wird eine Tragehilfe über die Hausverwaltung zugesagt, vorbehaltlich der Personallage.",
      "Die Preise für Grundnahrungsmittel bleiben in Sektor 28 im November stabil. Butter wird knapper: Das Kontingjent sinkt von 250 auf 200 Gramm je Person und Woche. Margarine ist nicht kontingentiert.",
      "Aus der Kantinenverwaltung. Die Essensmarken der Serie 3603 behalten ihre Gültigkeit bis Jahresende. Marken der Vorserie können in Gebäude E67, Raum 3603, getauscht werden, montags und donnerstags.",
      "Wetterbedingt kam es am Wochenende zu 41 Verkehrsunfällen in Sektor 28, davon vier mit Verletzten. Die Verkehrsstelle rät zu Winterreifen. Eine Pflicht besteht weiterhin nicht.",
      "Die Tiroler Kulturtage enden am Sonntag mit einem Jodel-Workshop in A66, Raum 1046. Der Eintritt ist frei. Weitere Termine im Programmheft der Kulturleitung.",
      "Der Mandatsrat tagt am Donnerstag zur Haushaltslage des kommenden Jahres. Beraten werden unter anderem die Mittel für Fernwärme und für die Bewohnerbibliotheken. Die Sitzung ist nicht öffentlich.",
      "Zur Schulstatistik. In Sektor 28 wurden in diesem Jahr 1.240 Kinder eingeschult, 60 weniger als im Vorjahr. Die Schulverwaltung führt das auf die Altersstruktur der Wohnblocks zurück.",
      "Die Postzustellung in den Gebäuden E55 und E58 verzögert sich diese Woche um bis zu zwei Tage. Grund ist ein Ausfall in der Sortierstelle. Eilzustellungen sind davon ausgenommen.",
      "Hinweis der Bauverwaltung. Die Fassadenarbeiten an E84 sind abgeschlossen. Die Gerüste werden bis Freitag abgebaut. Anwohner werden gebeten, die markierten Stellflächen bis dahin frei zu halten.",
      "Ein Wort zur Resonanz-Hygiene. Die Zahl der Ruhezeit-Beschwerden in Sektor 28 ist im Oktober um ein Fünftel gestiegen. Die Verwaltung bittet um wechselseitige Rücksicht, besonders in Gebäuden mit dünnen Zwischendecken.",
      "In Gebäude E61-Ost stehen nach Angaben der Wohnraumstelle derzeit 34 Einheiten leer. Die Sanierung beginnt im Frühjahr. Bewerbungen um eine Zuteilung sind ab Januar über den Naryad möglich.",
      "Zum Schluss die Zahl des Tages: 4.567. So viele Vorgänge hat die Leitstelle von Sektor 28 im Oktober abgeschlossen. Es ergeht der Dank der Direktion an die Mitarbeitenden.",
      "Das war der Sektorbericht. Die nächste Ausgabe folgt zur vollen Stunde. Bleiben Sie in Regel — und einen ruhigen Abend.",
    ],
  },
  {
    id: "z2",
    name: "Bürgerfunk Sektor 28",
    tag: "Programm 2 — von Bewohnern für Bewohner",
    ticker:
      "+++ Chorprobe Mittwoch 19 Uhr, Gemeinschaftsraum E67 +++ Blockfall-Turnier Samstag, Anmeldung bei Bodo +++ Filmabend im Kinosaal E71, Donnerstag 20 Uhr +++ Tauschbörse: Winterjacke gegen Kaffee +++ Fundsachen bitte bei der Hausverwaltung abgeben +++",
    hold: 13,
    videoUrl: anchorBvAsset.url,
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    accentClass: "text-amber-200",
    bulletins: [
      "Schönen guten Abend aus dem Bürgerfunk. Ich lese vor, was diese Woche in Sektor 28 abgegeben wurde. Es sind wieder viele Zettel geworden — wir fangen einfach oben an.",
      "Der Chor „Stimmen aus E67“ probt am Mittwoch um 19 Uhr im Gemeinschaftsraum. Gesucht werden Bässe. Herr Kowalk sagt, Vorkenntnisse sind nicht nötig, gute Laune schon.",
      "Am Samstag ab 16 Uhr Blockfall-Turnier im Gemeinschaftsraum. Anmeldung bei Bodo im Keller, ein Terminal steht bereit. Der Sieger bekommt eine Tafel Schokolade, echte, keine Ersatzmasse.",
      "Im Kinosaal in E71 läuft am Donnerstag um 20 Uhr wieder ein Lehrfilm mit anschließendem Gespräch. Eintritt frei. Bitte Mäntel nicht auf die Sitze legen, es waren letzte Woche zu wenige.",
      "Die Bewohnerbibliothek in E71, Korridor 11, hat vier neue Titel. Darunter „Das drehende Dreieck“ über die Geschichte des Automobils. Herbert sagt, das Buch sei schwerer als es aussieht.",
      "Tauschbörse. Frau Petrasch aus 2408 bietet eine Winterjacke, Größe 52, kaum getragen, gegen Kaffee-Kontingjent. Sie sagt, sie friert lieber als dass sie morgens ohne auskommt.",
      "Tauschbörse, weiter. Gesucht wird eine Bildröhre für einen Teleempfänger, Modell 71-B. Angebote an Apparat 2205. Getauscht wird gegen zwei Kisten Einweckgläser oder Verhandlungssache.",
      "Herr Ludewig aus dem achten Stock gibt Schallplatten ab. Tanzmusik, überwiegend. Er sagt, seine Frau habe genug gehört, und er auch. Abzuholen samstags, nicht vor zehn.",
      "Fundsachen. Im Aufzug von E67 lag ein Schlüsselbund mit vier Schlüsseln und einem Anhänger in Form eines Fisches. Abzuholen bei der Hausverwaltung, gegen Unterschrift.",
      "Fundsachen, zweiter Teil. Ein einzelner Handschuh, links, braun, gefunden vor der Quadrantenschleuse. Er wartet seit drei Wochen. Ich sage es ehrlich: Er sieht nicht so aus, als würde er noch abgeholt.",
      "Und noch eine Fundsache, die eigentlich keine ist: In E12-West ist ein Wellensittich zugeflogen. Er heißt vermutlich nicht Peter, hört aber darauf. Meldungen an Apparat 1188.",
      "Suchmeldung. Familie Arndt sucht die Hebamme, die im Juni bei der Geburt in 3312 geholfen hat. Sie möchten sich bedanken und wissen den Namen nicht mehr. Ein Anruf genügt.",
      "Nachbarschaftliches. Aus dem zwölften Stock wird gebeten, nach 22 Uhr keine Bohrmaschine mehr zu benutzen. Der Zettel endet mit „bitte, bitte, bitte“. Drei Mal unterstrichen.",
      "Dazu passt der nächste Zettel, aus derselben Etage: „Ich bohre, weil ich tagsüber arbeite.“ Ich lese beides vor, meine Damen und Herren, und rede den beiden gut zu, miteinander zu sprechen.",
      "Glückwünsche. Frau Sobotta in 1907 wird morgen achtzig. Ihre Enkel lassen ausrichten, dass sie den Kuchen selbst backen und die Küche hinterher aufräumen. Alles Gute, und in Regel bleiben.",
      "Der Handarbeitskreis trifft sich freitags um 17 Uhr, jetzt im kleinen Raum neben der Waschküche. Der große Raum wird geheizt nur noch dienstags. Wolle bitte mitbringen.",
      "Hilfsgesuch. Herr Merten, 4102, sucht jemanden, der ihm beim Ausfüllen der Wohnraum-Sprawka hilft. Er sagt, er verstehe die Seite vier nicht. Ehrlich gesagt versteht die hier niemand.",
      "Aus der Kantine wird gemeldet: Am Freitag gibt es Grießbrei mit Kirschen. Das ist keine Ankündigung, das ist eine Warnung, schreibt der Einsender. Ich gebe das nur weiter.",
      "Kinderbetreuung. Zwei Familien aus dem sechsten Stock suchen eine dritte für einen Wechseldienst am Nachmittag. Zwei Stunden pro Woche. Wer Zeit hat, klopft einfach bei 618.",
      "Ein Leserbrief zum Schluss: „Ich habe für den Fahrradkeller einen Naryad beantragt und nach elf Monaten eine Casenummer bekommen. Ich sammle jetzt Casenummern statt Fahrräder.“ Danke dafür.",
      "Das war's von uns. Zettel bitte weiter in den Kasten neben dem schwarzen Brett. Nächste Woche wieder, gleiche Zeit. Kommen Sie gut nach Hause.",
    ],
  },
  {
    id: "z3",
    name: "Wetter & Resonanz",
    tag: "Sektorale Wetter- und Resonanzlage",
    ticker:
      "+++ Nacht 1 bis minus 3 Grad, örtlich Nebel +++ morgen 4 Grad, Wind aus Nordost 25 km/h +++ Resonanzindex Sektor 28: 2,4 (Vortag 2,3) +++ E71 bei 3,1 +++ Empfehlung: Ruhezeiten wahren, Innenräume bevorzugen +++",
    hold: 12,
    videoUrl: anchorWetterAsset.url,
    voiceId: "XB0fDUnXU5powFXDhCwa",
    accentClass: "text-cyan-200",
    bulletins: [
      "Guten Abend zur Wetter- und Resonanzlage. Zunächst das Wetter: In der Nacht sinken die Temperaturen in Sektor 28 auf 1 bis minus 3 Grad, in den Senken örtlich Nebel mit Sichtweiten unter hundert Metern.",
      "Morgen tagsüber stark bewölkt, gebietsweise Nieselregen, Höchstwerte um 4 Grad. Wind aus Nordost mit 25, in Böen 45 Kilometern pro Stunde. Zwischen den Hochhäusern deutlich stärker.",
      "Die Aussichten für die kommenden Tage: Freitag trocken bei 3 Grad, Samstag Regen, Sonntag Aufheiterungen und minus 1 Grad in der Frühe. Erster Nachtfrost flächendeckend ab Sonntag.",
      "Zur Resonanzlage. Der Resonanzindex von Sektor 28 liegt heute bei 2,4 nach 2,3 am Vortag. Die Skala reicht von 0 bis 5. Werte unter 3 gelten als unauffällig.",
      "Gebäude E67: Resonanzindex 2,1. Die Körperschallmessung im Treppenhaus liegt bei 38 Dezibel, sieben Ruhezeit-Beschwerden im Wochenmittel. Keine Auffälligkeiten.",
      "Gebäude E71: Resonanzindex 3,1, damit der höchste Wert in Sektor 28. Ausschlaggebend sind 42 Krankmeldungen in der zurückliegenden Woche und eine erhöhte Belegungsdichte in Korridor 15.",
      "Gebäude E71-Nord: Resonanzindex 2,8, Tendenz steigend. Die bau-akustischen Werte sind unverändert; gestiegen ist die Zahl der Nachbarschaftsbeschwerden, von neun auf siebzehn.",
      "Gebäude E12-West: Resonanzindex 2,6. Nach dem Rohrbruch am Dienstag wurden im Erdgeschoss tieffrequente Schwingungen von 18 bis 22 Hertz gemessen. Die Ursache gilt als behoben.",
      "Gebäude E29: Resonanzindex 1,9, der niedrigste Wert in Sektor 28 seit August. Die Bauverwaltung führt das auf die neuen Dämmschichten in den Zwischendecken zurück.",
      "Gebäude E55: Resonanzindex 2,5 mit zwei kurzen Spitzen am Nachmittag, jeweils unter zehn Minuten. Beide fielen in die Zeit der Schichtwechsel.",
      "Gebäude E58: Resonanzindex 2,0. Ruhige Lage, keine Meldungen. Für morgen wird ein unveränderter Wert erwartet.",
      "Gebäude E61: Resonanzindex 2,7. Aus vier benachbarten Wohneinheiten wurde gleichzeitiges Brummen gemeldet, gemessen bei 19 Hertz. Die Messstelle setzt die Beobachtung fort.",
      "Gebäude E84: Resonanzindex 2,3. Nach Abschluss der Fassadenarbeiten ist der Wert um 0,4 gefallen. Baulärm schlägt erfahrungsgemäß mit etwa einem halben Punkt zu Buche.",
      "Gebäude E73: für heute liegt kein Wert vor. Die Messstelle meldet einen Geräteausfall. Die Nachmeldung erfolgt morgen mit der Mittagslage.",
      "Zur Einordnung: Der Resonanzindex ist eine Mischgröße aus bau-akustischen Messwerten, Krankmeldungen und Nachbarschaftsbeschwerden. Über die Gewichtung der drei Anteile entscheidet der Mandatsrat.",
      "Hinweis für Wohneinheiten mit dünnen Zwischendecken: Körperschall wirkt in beide Richtungen. Teppiche und Filzgleiter unter Möbeln senken den Wert messbar, um bis zu drei Dezibel.",
      "Wer anhaltendes Brummen wahrnimmt, kann es der Messstelle für Bau-Akustik melden, Apparat 214. Hilfreich sind Uhrzeit, Dauer und die Etage. Eine Bestätigung des Eingangs ergeht schriftlich.",
      "Gesundheitlicher Hinweis bei Nebel und Frost: Ältere Bewohner sollten die Außenaufenthalte kurz halten. Die Gehwege vor E67 und E70 sind ab 6 Uhr gestreut.",
      "Für die Fernwärme bedeutet die kalte Nacht eine Anhebung der Vorlauftemperatur um vier Grad. In den oberen Etagen kann es in den Rohren knacken. Das ist normal und kein Resonanzereignis.",
      "Die Empfehlung für morgen: Innenräume bevorzugen, Ruhezeiten wahren, bei Glätte festes Schuhwerk. Für die Fahrt zur Arbeit zehn Minuten mehr einplanen.",
      "Das war die Wetter- und Resonanzlage. Die nächste Ausgabe folgt nach dem Sektorbericht. Kommen Sie gut durch die Nacht.",
    ],
  },
];