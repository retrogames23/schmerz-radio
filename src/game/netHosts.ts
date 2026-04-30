/**
 * Netzwerk-Hosts im Sektor E67 (und benachbarten Sektoren), erreichbar
 * über das `telnet`-Kommando im Terminal. Enthält Zugangsdaten, MOTD-
 * Banner und das jeweilige (statische bzw. story-flag-abhängige)
 * Mini-Filesystem pro Host.
 *
 * Das ist reiner Spielinhalt — UI-Logik dazu liegt in
 * `src/components/game/Terminal.tsx`. So lassen sich Texte (perspektivisch
 * mehrsprachig) hier zentral pflegen, ohne die Komponente anzufassen.
 */
import type { StoryFlag } from "@/game/types";
import { FREIHEIT_TXT, LAYARD_TXT } from "@/game/filesystemBodo";

export interface NetHost {
  ip: string;
  host: string;
  desc: string;
  /** Telnet-Passwort. null = kein Telnet-Daemon / Verbindung verweigert. */
  password: string | null;
  /** Wenn true: Passwortvergleich ist case-insensitiv. */
  passwordCaseInsensitive?: boolean;
  motd?: string[];
  files?: Record<string, string[]>;
  /**
   * Optional: zusätzliche Dateien, die abhängig vom Story-Stand entstehen.
   * Werden mit `files` gemerged. Spätere Einträge überschreiben frühere.
   */
  dynamicFiles?: (hasFlag: (f: StoryFlag) => boolean) => Record<string, string[]>;
}

export const NET_HOSTS: NetHost[] = [
  {
    ip: "10.67.0.1",
    host: "gateway.e67",
    desc: "Sektor-Gateway (Routing)",
    password: null,
  },
  {
    ip: "10.67.0.2",
    host: "leitstelle.e67",
    desc: "Leitstelle 001 — I. Bauerfeind",
    password: null,
  },
  {
    ip: "10.67.26.11",
    host: "worag.e67",
    desc: "Sie selbst (Zimmer 2611)",
    password: null,
  },
  {
    ip: "10.67.26.13",
    host: "philippe.e67",
    desc: "Bewohner, Zimmer 2613",
    password: "Passwort123",
    passwordCaseInsensitive: true,
    motd: [
      "── philippe.e67 — CentralOS v2.1 ─────────────",
      "Letzte Anmeldung: 06.11.1997 04:11 (lokal)",
      "Du bist eingeloggt als: philippe",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "notiz.txt": [
        "die wand antwortet wenn ich klopfe",
        "die wand antwortet wenn ich klopfe",
        "die wand antwortet wenn ich klopfe",
        "ich glaube layard ist auch da drin",
        "ich klopfe weiter",
      ],
      "passwort.txt": [
        "ich vergesse alles. das hier nicht.",
        "Passwort123",
        "(insa hat gelacht. soll sie.)",
      ],
      "tagebuch.txt": [
        "tag 4012",
        "104,6 war heute drei minuten still",
        "ich habe in den drei minuten meinen namen vergessen",
        "als es wieder anging hieß ich wieder philippe",
        "ich glaube das ist gut",
      ],
    },
    // Beobachtungen über Layard. Eine pro geführtem Dialog.
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("philippeNote1")) {
        out["beobachtung_layard_01.txt"] = [
          "── notiz, kurz nach er kam ────────────────────",
          "",
          "der nachbar aus 2611. layard worag.",
          "geöffnet hat er erst beim dritten klingeln.",
          "die augen: wach, aber zu lange nicht benutzt.",
          "",
          "er hat nicht gezögert mitzukommen.",
          "das hat mich mehr überrascht als das klopfen.",
          "in diesem korridor öffnet niemand für niemanden.",
          "",
          "vermutung: er hat sich darauf vorbereitet,",
          "ohne es selbst zu wissen.",
          "vermutung: er ist einsamer als ich.",
          "",
          "ich werde das im auge behalten.",
        ];
      }
      if (hasFlag("philippeNote2")) {
        out["beobachtung_layard_02.txt"] = [
          "── notiz, während wir gewartet haben ──────────",
          "",
          "er redet wenig. wenn, dann präzise.",
          "er sagt »B2« wie andere »ich«. ohne nachzudenken.",
          "",
          "als ich von kantine angefangen habe, hat er",
          "von seinem schreiben gesprochen. unaufgefordert.",
          "drei sätze, dann hat er sich erschrocken.",
          "",
          "diagnose (laienhaft): er hat seit jahren mit",
          "niemandem ein längeres gespräch geführt.",
          "er weiß nicht mehr, wie viel er teilen darf.",
          "",
          "soziale beziehungen, geschätzt: 0–1.",
          "die 1 ist möglicherweise insa.",
          "ich glaube nicht, dass das eine beziehung ist.",
          "",
          "ich glaube, ich mag ihn.",
        ];
      }
      if (hasFlag("philippeNote3")) {
        out["beobachtung_layard_03.txt"] = [
          "── notiz, nach den sanitätern ────────────────",
          "",
          "er ist gegangen. wirklich gegangen.",
          "vor mir hat das niemand gemacht. nicht einer.",
          "",
          "charakter: stiller mut. nicht laut. nicht performt.",
          "er hat das protokoll geholt, ohne zu fragen warum.",
          "vielleicht weil ihn das »warum« seit jahren erstickt.",
          "",
          "persönlichkeit: ein mensch, der zu lange",
          "geschwiegen hat und jetzt nicht mehr weiß,",
          "wie laut seine eigene stimme klingen darf.",
          "",
          "soziale beziehungen, korrigiert:",
          "  insa  — auftraggeberin, nicht freundin",
          "  philippe — ich. unklarer status.",
          "  und vielleicht: dieser alte mann in 1534.",
          "",
          "ich hoffe, er kommt wieder. ich klopfe dann.",
        ];
      }
      if (hasFlag("philippeNote4")) {
        out["beobachtung_layard_04.txt"] = [
          "── notiz, später ─────────────────────────────",
          "",
          "wir haben heute über essen geredet.",
          "er hat gelacht. einmal, kurz.",
          "ich habe es aufgeschrieben.",
          "",
          "er ist nicht beschädigt. er ist konserviert.",
          "wie etwas, das man eingelegt hat,",
          "weil man nicht wusste, wann man es brauchen würde.",
          "",
          "wenn jemand ihn aus dem glas nimmt:",
          "ich glaube, er kann noch alles sein.",
        ];
      }
      if (hasFlag("philippeNote5")) {
        out["beobachtung_layard_05.txt"] = [
          "── notiz, nach unserem letzten gespräch ──────",
          "",
          "ich höre alles, das ist wahr.",
          "aber ihn höre ich anders.",
          "",
          "fazit, vorläufig:",
          "  charakter        — leise, lehrbarer mut",
          "  persönlichkeit   — ein autor ohne publikum",
          "  beziehungen      — bisher: keine. jetzt: zwei.",
          "                     (insa zählt nicht.)",
          "",
          "ich werde dieses dokument nicht löschen.",
          "von 104,6 kommt kein wort dazu, nur das gefühl —",
          "diese stille wärme, die keine sprache braucht.",
          "ich glaube, ich sollte es ihm geben.",
          "ich werde es ihm nicht geben.",
        ];
      }
      if (hasFlag("philippeProbeNote1")) {
        out["spekulation_layard_01.txt"] = [
          "── spekulation, weil die wand jetzt still ist ─",
          "",
          "frage gestellt: herkunft. eltern. geschwister.",
          "antwort erhalten: »niemand mehr«.",
          "",
          "vermutung A: er hat jemanden verloren,",
          "  und zwar nicht durch transfer.",
          "vermutung B: er hat jemanden verlassen,",
          "  und gibt sich dafür die schuld.",
          "vermutung C: beides. wahrscheinlichkeit: hoch.",
          "",
          "korrelation: er hat heute zum ersten mal",
          "  eine fremde tür geöffnet. das passt zu A.",
          "  und auch zu B. natürlich passt das zu beidem.",
          "",
          "ich habe keinerlei beleg.",
          "ich werde es trotzdem aufschreiben.",
        ];
      }
      if (hasFlag("philippeProbeNote2")) {
        out["spekulation_layard_02.txt"] = [
          "── spekulation, schreiben & motiv ─────────────",
          "",
          "er schreibt »über menschen, die nicht zurückkommen«.",
          "er schreibt »über räume, die zu lange leer stehen«.",
          "",
          "schlussfolgerung (ohne beweis):",
          "  jemand ist nicht zurückgekommen.",
          "  ein raum steht zu lange leer.",
          "  vermutlich beides derselbe vorgang.",
          "",
          "subtheorie: 2615 hat ihn deshalb so getroffen.",
          "  ein leerer raum, ein verschwundener mensch.",
          "  archetyp seiner eigenen erzählungen.",
          "  er ist heute in seine eigene geschichte gelaufen.",
          "",
          "literarisch interessant. menschlich besorgniserregend.",
          "(diese unterscheidung gibt es vielleicht nicht.)",
        ];
      }
      if (hasFlag("philippeProbeNote3")) {
        out["spekulation_layard_03.txt"] = [
          "── spekulation, 104,6 ────────────────────────",
          "",
          "selbstauskunft: »fast durchgehend«.",
          "selbstauskunft: »dann höre ich mich selbst«.",
          "",
          "diagnose, ferndiagnose, anmaßend:",
          "  abhängigkeit von 104,6: gesichert.",
          "  inhalt der eigenen stimme: angstauslösend.",
          "  ursache der eigenen stimme: unbekannt,",
          "  vermutlich kohärent mit notiz 01 und 02.",
          "",
          "hypothese: die leitstelle weiß das.",
          "hypothese: die leitstelle nutzt das.",
          "hypothese: ich werde diese hypothesen löschen,",
          "  bevor jemand mein terminal liest.",
          "  ich werde sie nicht löschen.",
          "",
          "(104,6 läuft währenddessen leise im hintergrund.)",
          "(ich höre es nicht mehr. das ist der punkt.)",
        ];
      }
      if (hasFlag("philippeProbeNote4")) {
        out["spekulation_layard_04.txt"] = [
          "── spekulation, insa bauerfeind ──────────────",
          "",
          "drei anrufe an einem tag. eine telefonistin",
          "stellt drei mal denselben mann durch. das",
          "passiert nicht zufällig. das passiert nicht",
          "ohne dass die telefonistin sich beteiligt.",
          "",
          "er sagt: »pausen. eine frage, die sie nicht",
          "stellen müsste.« das ist alles, was er sagt.",
          "es ist alles, was nötig ist.",
          "",
          "vermutung A: insa testet ihn.",
          "vermutung B: insa rekrutiert ihn.",
          "vermutung C: insa hofft auf etwas, das sie",
          "  selbst nicht benennen kann. dann ist sie",
          "  jetzt da, wo er war, bevor er heute aufstand.",
          "",
          "(C) ist die unwahrscheinlichste. mir gefällt sie",
          "trotzdem am besten. ich behalte sie.",
        ];
      }
      if (hasFlag("philippeProbeNote5")) {
        out["spekulation_layard_05.txt"] = [
          "── spekulation, der mann von nebenan ─────────",
          "",
          "frage: hat 2615 freiwillig geklopft, oder",
          "  hat ihn etwas geklopft.",
          "antwort: »ich weiß heute sehr vieles nicht«.",
          "",
          "das ist die antwort, die ich brauche.",
          "das ist die antwort, die ich nicht brauche.",
          "",
          "vermutung, große:",
          "  104,6 hat in 2615 etwas eingeklopft, das",
          "  er irgendwann zurückgegeben hat — an die wand.",
          "  er war kein opfer. er war ein lautsprecher.",
          "",
          "vermutung, kleinere, ehrlichere:",
          "  ich habe keine ahnung. niemand hat ahnung.",
          "  wir sortieren menschen nach quadranten,",
          "  damit niemand merkt, dass wir nicht sortieren können.",
          "",
          "schlussbemerkung über layard:",
          "  er kommt vielleicht wieder. vielleicht nicht.",
          "  beides ist heute zum ersten mal denkbar.",
          "  das ist, glaube ich, das wichtigste,",
          "  was ich heute aufschreiben kann.",
          "",
          "ich werde ihm das niemals zeigen.",
          "ich werde es niemals löschen.",
        ];
      }
      return out;
    },
  },
  {
    ip: "10.67.26.07",
    host: "kamenev.e67",
    desc: "Bewohnerin, Zimmer 2607",
    password: null,
  },
  {
    ip: "10.67.26.10",
    host: "helka.e67",
    desc: "Bewohnerin, Zimmer 2610 (H. Vint)",
    password: "bibliothek",
    passwordCaseInsensitive: true,
    motd: [
      "── helka.e67 — CentralOS v2.1 ─────────────────",
      "Letzte Anmeldung: 06.11.1997 03:42 (lokal)",
      "Du bist eingeloggt als: helka",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "wortliste.txt": [
        "── wörter, die in offiziellen mitteilungen ───",
        "── seit 1991 nicht mehr vorgekommen sind ─────",
        "",
        "  zärtlich",
        "  beliebig",
        "  sehnsucht",
        "  vielleicht",
        "  zuhause     (ersetzt durch: 'wohneinheit')",
        "  freund      (ersetzt durch: 'kontakt')",
        "  weiter      (gestrichen, ohne ersatz)",
        "  nachbar     (gestrichen, ohne ersatz)",
        "  einsam      (nie vorgekommen)",
        "",
        "── ende der liste, geführt seit 12.07.1985 ───",
      ],
      "tagebuch_kurz.txt": [
        "ich führe kein tagebuch mehr.",
        "ich führe nur noch listen.",
        "das ist auch ein tagebuch.",
        "",
        "heute: ein bewohner aus 2611 hat geklopft.",
        "er hat 'nachbarschaft' gesagt.",
        "wort steht auf liste. ich habe es ihm nicht gesagt.",
      ],
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      out["gemeldet.log"] = [
        "── meldungs-archiv, h. vint ──────────────────",
        "",
        "12.04.1989  bewohner 2614 (vater korr) — verdacht",
        "            frequenzmanipulation, lötkolben.",
        "            status: bearbeitet (E81-versetzung)",
        "            ergebnis für meldende: keine reaktion.",
        "",
        ...(hasFlag("helkaWarned")
          ? [
              "06.11.1997  bewohner 2611 (worag) — flugblatt",
              "            Z.K.S. wortgleich zu 1989, fast.",
              "            status: NICHT gemeldet.",
              "            ergebnis für meldende: ungewiss.",
              "            (zum ersten mal: bewusst nicht gemeldet.)",
            ]
          : []),
      ];
      return out;
    },
  },
  {
    ip: "10.67.26.12",
    host: "bodo.e67",
    desc: "Bewohner, Zimmer 2612 (B. Marschke)",
    password: "Lotti",
    passwordCaseInsensitive: true,
    motd: [
      "── bodo.e67 — CentralOS v2.1 ──────────────────",
      "Letzte Anmeldung: 05.11.1997 19:08 (lokal)",
      "Du bist eingeloggt als: bodo",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "tagebuch.txt": [
        "── notizen, ohne datum ───────────────────────",
        "",
        "lotti hat heute wieder geniest.",
        "vermutlich der staub aus dem schacht.",
        "ich werde wischen müssen.",
        "",
        "die katze ist die einzige, die hier zuhört,",
        "ohne mitzuschreiben.",
        "",
        "wenn ich mich an etwas erinnern muss,",
        "schreibe ich es auf eine notiz an die wand.",
        "wenn ich mich an LOTTI erinnern muss —",
        "und das vergesse ich manchmal, weil das gehirn",
        "alt wird — dann steht das auch da.",
      ],
      "lotti_futter.txt": [
        "── monatsbestellung B3, intern ───────────────",
        "",
        "  6 dosen B3-paste 'rind-äquivalent'",
        "  4 dosen B3-paste 'fisch-äquivalent'",
        "  1 packung trockenfutter (resterampe E71)",
        "",
        "anmerkung an insa b.:",
        "  ja, ich weiß, B3 ist nicht für tiere zertifiziert.",
        "  ja, ich weiß, tiere sind im sektor nicht zertifiziert.",
        "  bitte trotzdem durchwinken. wie immer. danke.",
      ],
      "notiz_an_mich.txt": [
        "wenn du das hier liest, weil du wieder",
        "vergessen hast, warum du heute aufgestanden bist:",
        "",
        "LOTTI.",
        "",
        "das ist der grund. das ist immer der grund.",
      ],
      "funkprotokoll_alt.txt": [
        "── stadtwerke, abt. fernmelde, archiv ────────",
        "── auszug, mitgenommen 1991 ──────────────────",
        "",
        "trägersignal 104,6 MHz, sektor E67:",
        "  amplitudenstabilität automatisch:  ausgefallen",
        "  amplitudenstabilität manuell:      aktiv",
        "  zuständig:                          1 person/schicht",
        "  nachregelintervall:                 ca. 90 sek.",
        "",
        "anmerkung techniker (b.m.):",
        "  wenn die schicht ausfällt, fällt der träger.",
        "  wenn der träger fällt, hört der sektor",
        "  ungefiltert sich selbst. das war zweimal,",
        "  beide male nicht länger als drei minuten.",
        "  beide male haben bewohner gegen wände geschlagen.",
        "",
        "abschlussvermerk: niemand hat das je dokumentiert.",
        "ich auch nicht. ich hab nur das hier mitgenommen.",
      ],
      ".freiheit.txt": FREIHEIT_TXT,
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("bodoToldCarrierTruth")) {
        out["funkprotokoll_neu.txt"] = [
          "── nachtrag, 06.11.1997 ──────────────────────",
          "",
          "heute zum ersten mal jemandem davon erzählt.",
          "ein bewohner aus 2611. layard worag.",
          "er hat ein flugblatt dabei gehabt. Z.K.S.",
          "",
          "ich habe ihm das mit der schicht gesagt.",
          "ich habe ihm nicht gesagt, dass ich von 1986",
          "bis 1991 selbst diese schicht war.",
          "",
          "vielleicht das nächste mal. wenn lotti dabei ist.",
        ];
      }
      if (hasFlag("bodoLeftForB3")) {
        out[".layard.txt"] = LAYARD_TXT;
      }
      return out;
    },
  },
  {
    ip: "10.67.26.14",
    host: "ennis.e67",
    desc: "Bewohner, Zimmer 2614 (E. Korr)",
    password: "vater",
    passwordCaseInsensitive: true,
    motd: [
      "── ennis.e67 — CentralOS v2.1 ─────────────────",
      "Letzte Anmeldung: 06.11.1997 02:14 (lokal)",
      "Du bist eingeloggt als: ennis",
      "",
      "WARNUNG: PRIVATER RECHNER. ZUGRIFF PROTOKOLLIERT.",
      "(das ist gelogen. ich protokolliere nichts.)",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "dienstplan.txt": [
        "── nachtschicht, sektor-logistik, KW 45 ──────",
        "",
        "  Mo  22:00 — 06:00   schacht 3 + 4",
        "  Di  22:00 — 06:00   schacht 3 + 4",
        "  Mi  FREI",
        "  Do  22:00 — 06:00   schacht 3 + 4 + 7",
        "  Fr  22:00 — 06:00   schacht 3 + 4 + 7",
        "  Sa  22:00 — 06:00   schacht 3 + 4 + 7",
        "  So  FREI",
        "",
        "anmerkung: drei schächte allein sind regelwidrig.",
        "ich beschwere mich nicht. linientreue zählt mehr.",
      ],
      "meldungen_offen.log": [
        "── meldungen, status: offen ──────────────────",
        "",
        "  (keine.)",
        "",
        "── meldungen, status: zurückgezogen ──────────",
        "",
        "  06.11.1997 01:12  bewohner 2611 — verdacht",
        "                    auf abweichendes verhalten",
        "                    ZURÜCKGEZOGEN um 01:14",
        "                    grund: keine angabe",
      ],
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("ennisCracked")) {
        out[".versteckt_presse.txt"] = [
          "── private sammlung, nicht weitergeben ───────",
          "",
          "1991  abendkurier:    'sektor E67 hört zu'",
          "1992  morgenblatt:    'frequenzkritik wächst'",
          "1993  freie presse:   'sektor E81 — was bleibt'",
          "1994  abendkurier:    'die letzten freien funker'",
          "1995  (alles ab hier nur noch in ZENTRAL.NETZ)",
          "",
          "warum ich das sammle:",
          "  weil mein vater drinsteht. einmal, kleine notiz.",
          "  '1993, korr, fernmeldetechniker, E67 → E81.'",
          "  ein satz. mein vater war ein satz.",
        ];
        out[".brief_an_vater.txt"] = [
          "── nie abgeschickt ───────────────────────────",
          "",
          "lieber vater,",
          "",
          "ich hab heute zum ersten mal seit sechs jahren",
          "wieder dein wort gesagt. laut. einem fremden.",
          "der hatte ein flugblatt. so eins wie deins.",
          "",
          "ich weiß nicht, ob du noch lebst.",
          "ich weiß nicht, ob diese frage noch erlaubt ist.",
          "",
          "ich werde diesen brief nicht abschicken.",
          "es gibt keine post nach E81.",
          "es gibt nur die schicht, die katze von nebenan,",
          "und die hoffnung, dass jemand wie heute wiederkommt.",
          "",
          "                                            — e.",
        ];
      }
      return out;
    },
  },
  {
    ip: "10.67.36.01",
    host: "abschnitt.e67",
    desc: "Abschnittsverantwortlicher (Etage 3, 3601)",
    password: null,
  },
  {
    ip: "10.67.46.18",
    host: "drucker46.e67",
    desc: "Etagendrucker, Etage 4",
    password: "drucker",
    motd: [
      "── drucker46.e67 — PrintOS 1.1 ───────────────",
      "Tonerstand: 4%. Papierschacht 2: leer.",
      "Letzter Auftrag: »flugblatt_v3.ps« (412 Seiten)",
      "Tippe 'ls' oder 'exit'.",
    ],
    files: {
      "queue.log": [
        "06.11.1997 02:14  flugblatt_v3.ps  412 S.  USER: ?",
        "06.11.1997 02:51  flugblatt_v3.ps  abgebrochen (Toner)",
        "06.11.1997 03:02  flugblatt_v3.ps  WIEDER GESTARTET",
      ],
    },
  },
  {
    ip: "10.67.56.04",
    host: "kantine.e67",
    desc: "Kantinen-Terminal (Etage 5)",
    password: "B2B2B2",
    motd: [
      "── kantine.e67 — MealNet 0.9 ────────────────",
      "Heute: Eintopf §3, B2-Tabletten, Wasser.",
      "Tippe 'ls' oder 'exit'.",
    ],
    files: {
      "speiseplan.txt": [
        "Mo  Eintopf §3 + B2",
        "Di  Eintopf §3 + B2",
        "Mi  Eintopf §3 + B2",
        "Do  Eintopf §3 + B2",
        "Fr  Eintopf §3 + B2 (Doppelration)",
        "Sa  Eintopf §3",
        "So  geschlossen — bitte Vorräte planen",
      ],
    },
  },
  {
    ip: "10.71.0.1",
    host: "gateway.e71",
    desc: "Gateway Nachbarsektor E71",
    password: null,
  },
  {
    ip: "10.71.15.34",
    host: "sprechzimmer.e71",
    desc: "Sprechzimmer Sanitäter (E71)",
    password: null,
  },
  {
    // Miras Rechner — kein offizieller Eintrag, taucht aber im Routing auf,
    // weil sie sich an einen freien Port am Etagendrucker geklemmt hat.
    // IP-Bereich „99“ wird vom System eigentlich für Wartung reserviert.
    ip: "10.67.99.16",
    host: "mira.zks",
    desc: "Unbekannt — kein Eintrag im Bewohnerverzeichnis",
    password: "ZENTRUMKAEFIGSTILLE",
    passwordCaseInsensitive: true,
    motd: [
      "── mira.zks — kein offizielles system ────────",
      "wenn du das hier liest, bist du entweder",
      "  (a) jemand, der zuhört, oder",
      "  (b) jemand, der zuhört, weil er muss.",
      "ich gehe vom ersten aus. das ist bereits eine entscheidung.",
      "",
      "Tippe 'ls' oder 'exit'. Wenn du nicht weißt, was Z.K.S.",
      "bedeutet: lies 'manifest.txt'. Wenn du es weißt: 'logbuch.txt'.",
    ],
    files: {
      "manifest.txt": [
        "── Z.K.S. — Zentrum.Käfig.Stille ─────────────",
        "",
        "1. 104,6 ist kein medikament. 104,6 ist eine leine.",
        "   ein gutes mittel würde den schmerz nehmen,",
        "   nicht dich an den schmerz gewöhnen.",
        "",
        "2. die quadranten sind keine wohnform.",
        "   die quadranten sind eine sortieranlage.",
        "   du bist nicht zuhause. du bist abgelegt.",
        "",
        "3. die leitstelle hört zu. das schmerz-radio sendet.",
        "   wer empfängt, sendet auch. wer sendet, wird gehört.",
        "   wer gehört wird, wird verwaltet.",
        "",
        "4. der weg hinaus beginnt mit einer minute stille.",
        "   schalt das radio aus. eine minute.",
        "   du wirst dich erschrecken. das ist der punkt.",
        "",
        "5. wir sind keine bewegung. wir sind eine vermutung.",
        "   eine vermutung, die sich weitergibt.",
        "",
        "                                              — Z.K.S.",
      ],
      "logbuch.txt": [
        "tag 0   ich habe einen freien port am etagendrucker gefunden.",
        "tag 0   ich habe einen rechner angeschlossen.",
        "tag 0   niemand hat es gemerkt.",
        "",
        "tag 12  flugblatt v1 — 18 seiten, zu lang. niemand liest 18 seiten.",
        "tag 19  flugblatt v2 — 6 seiten, zu höflich. niemand reagiert auf höflich.",
        "tag 27  flugblatt v3 — 1 seite. die richtige.",
        "",
        "tag 31  drucker46 hat 412 seiten ausgespuckt, bevor ihm der toner ausging.",
        "        ich war stolz. ich war auch dumm.",
        "        die putzkolonne hat 397 davon weggeworfen.",
        "        15 sind in der welt. das reicht.",
        "",
        "tag 33  ein bewohner aus E67 läuft heute durch die etagen.",
        "        kein empfänger im ohr. ungewöhnlich.",
        "        ich werde ihn ansprechen, wenn er an mir vorbeikommt.",
        "        wenn er nicht vorbeikommt, war es nicht der richtige.",
      ],
      "verteiler.txt": [
        "── verteilerliste, intern. nicht ausdrucken. ─",
        "",
        "  E67  philippe.2613   — hört zu. schreibt mit.",
        "  E67  worag.2611      — heute zum ersten mal sichtbar.",
        "  E67  bauerfeind, I.  — komplizierter fall. siehe weiter.",
        "  E71  mikael, 1534    — ursprung. hat angefangen, hört auf.",
        "  E71  rezeption       — keine option. nie.",
        "",
        "  ALLE: keine namen aussprechen. keine namen telefonieren.",
        "        keine namen ins ZENTRAL.NETZ.",
      ],
      "frequenzen.txt": [
        "── frequenzen, jenseits der erlaubten ────────",
        "",
        "  102,3   einsamkeit  (sendet, wer empfängt)",
        "  104,6   schmerz     (offiziell. die leine.)",
        "  107,9   stille      (nicht dokumentiert.",
        "          erreichbar nur mit getuntem empfänger.",
        "          wer dort hört, hört nichts. das ist alles.)",
        "",
        "  wer das hier weitergibt: bitte nur mündlich.",
      ],
      "passwort.hint": [
        "drei worte, die du jeden tag im kopf hast,",
        "auch wenn du sie nie aussprichst.",
        "in der reihenfolge: ZENTRUM. KAEFIG. STILLE.",
        "(zusammengeschrieben. ohne umlaut. ohne punkt.)",
      ],
    },
  },
];
