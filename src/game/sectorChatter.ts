/**
 * Live-Mitschnitt des E67-Verkehrs — was Bewohner sich gegenseitig schicken.
 *
 * Pakete fliegen pausenlos: Telnet-Texte, interne Mails, Lobby-Nachrichten,
 * Lottis Kollegen aus den Wohnungen, Insas Telefon-Notizen, Bodos
 * Wartungs-Pings, sogar das, was Layard heute morgen selbst geschrieben
 * hat. Alles, was im Sektor durchs Kabel geht, läuft über 5610.
 *
 * Format: »[zeit]  von → an   text«.
 *
 * Diese Liste wird gerne lang. Genau das ist der Punkt: man soll nach
 * dreißig Sekunden noch nicht wissen, ob das alles ist. Es ist nicht
 * alles. Es ist nie alles.
 *
 * Regeln:
 *  - Kein Bewohner schickt sich selbst eine Nachricht (from !== to).
 *  - Längen variieren absichtlich: viele kurze Pings, einige längere
 *    Monologe und ein paar fast schon Briefe.
 */
export interface ChatterMessage {
  from: string;
  to: string;
  text: string;
}

export const SECTOR_CHATTER: ChatterMessage[] = [
  { from: "ennis.2614", to: "lobby.001", text: "der wasserhahn tropft wieder. keine eile." },
  { from: "lobby.001", to: "ennis.2614", text: "vermerkt. wartung in 4–6 wochen." },
  { from: "helka.2610", to: "philippe.2613", text: "klopfst du heute nacht wieder?" },
  { from: "philippe.2613", to: "helka.2610", text: "ich klopfe immer." },
  { from: "bodo.2612", to: "lobby.001", text: "B3 lieferung freitag bestätigt? lotti fragt." },
  { from: "lobby.001", to: "bodo.2612", text: "freitag. nicht früher." },
  { from: "rolf.5612", to: "leitstelle.001", text: "selbsttest. sender ok." },
  { from: "mira.5601", to: "lobby.001", text: "korridor 56 nordwand: schimmel kommt durch." },
  { from: "lobby.001", to: "mira.5601", text: "wir streichen drüber. das macht es weiß." },
  { from: "ennis.2614", to: "philippe.2613", text: "hörst du das brummen aus 2611?" },
  { from: "philippe.2613", to: "ennis.2614", text: "das ist 104,6. das brummt immer." },
  { from: "ennis.2614", to: "philippe.2613", text: "heute ist es lauter." },
  { from: "philippe.2613", to: "ennis.2614", text: "dann hört jemand zu." },
  { from: "ute.3408", to: "kantine.e67", text: "ist heute B2 oder B3?" },
  { from: "kantine.e67", to: "ute.3408", text: "B2. wie immer mittwochs." },
  { from: "ute.3408", to: "kantine.e67", text: "es ist donnerstag." },
  { from: "kantine.e67", to: "ute.3408", text: "B2. wie immer donnerstags." },
  { from: "lobby.001", to: "all.e67", text: "wartungsfenster gateway 09:00–11:30. ruhe bewahren." },
  { from: "philippe.2613", to: "lobby.001", text: "wer bewahrt sie sonst?" },
  { from: "lobby.001", to: "philippe.2613", text: "das war eine standardansage." },
  { from: "anonym.????", to: "all.e67", text: "wenn du das liest, bist du im richtigen kabel." },
  { from: "bodo.2612", to: "stegmann.it", text: "v2.0 läuft seit jahren stabil. muss das wirklich sein?" },
  { from: "stegmann.it", to: "bodo.2612", text: "ja. tippe sysupdate." },
  { from: "bodo.2612", to: "stegmann.it", text: "ich tippe es morgen." },
  { from: "stegmann.it", to: "bodo.2612", text: "das hast du letzten november auch geschrieben." },
  { from: "lotte.4711", to: "tina.4712", text: "kommst du heute zum kaffee?" },
  { from: "tina.4712", to: "lotte.4711", text: "kein kaffee mehr. nur B-getränk." },
  { from: "lotte.4711", to: "tina.4712", text: "dann komm trotzdem." },
  { from: "tina.4712", to: "lotte.4711", text: "ich komme." },
  { from: "mira.5601", to: "philippe.2613", text: "104,6 läuft wieder gerichtet. ihr im 26 spürt das nicht?" },
  { from: "philippe.2613", to: "mira.5601", text: "wir spüren es. wir sagen nur nichts." },
  { from: "leitstelle.001", to: "worag.2611", text: "wartungsfenster gateway: keine ausgehenden gespräche." },
  { from: "worag.2611", to: "leitstelle.001", text: "verstanden." },
  { from: "leitstelle.001", to: "worag.2611", text: "(antwort um 09:14:42 protokolliert.)" },
  { from: "ralph.6701", to: "lobby.001", text: "die kakerlake aus 6703 war heute wieder im gang." },
  { from: "lobby.001", to: "ralph.6701", text: "kakerlaken sind kein zuständigkeitsbereich der lobby." },
  { from: "ralph.6701", to: "lobby.001", text: "wessen denn?" },
  { from: "lobby.001", to: "ralph.6701", text: "das ist nicht teil dieser nachricht." },
  { from: "philippe.2613", to: "helka.2610", text: "die wand antwortet wenn ich klopfe. heute dreimal hintereinander, und ich schwöre dir, das war nicht das rohr. das war jemand. ich weiß nicht wer, ich weiß nicht in welcher wohnung, aber wir klopfen seit jahren miteinander, ohne uns je gesehen zu haben, und heute hatte das einen rhythmus, der nichts mit heizung zu tun hat." },
  { from: "helka.2610", to: "philippe.2613", text: "klopf morgen wieder. ich höre zu." },
  { from: "kantine.e67", to: "all.e67", text: "heute ausnahme: nudel-äquivalent in B-soße." },
  { from: "ennis.2614", to: "kantine.e67", text: "was ist nudel-äquivalent." },
  { from: "kantine.e67", to: "ennis.2614", text: "B2 in form." },
  { from: "lobby.001", to: "all.e67", text: "sektorradio bleibt heute durchgehend an. das ist normal." },
  { from: "anonym.????", to: "all.e67", text: "es ist nicht normal." },
  { from: "lobby.001", to: "anonym.????", text: "absender unbekannt. paket verworfen." },
  { from: "anonym.????", to: "all.e67", text: "es ist nicht normal." },
  { from: "lobby.001", to: "anonym.????", text: "absender unbekannt. paket verworfen." },
  { from: "anonym.????", to: "all.e67", text: "es ist immer noch nicht normal." },
  { from: "bodo.2612", to: "lobby.001", text: "notiz, falls jemand mitliest: B3 nachholen. wieder. lotti hat seit gestern nur trockenfutter und schaut mich an, als haette ich ihr persoenlich den fischtag gestrichen. das habe ich nicht. das war die belieferung. ich bitte um einen verbindlichen ersatztermin und nicht wieder 'demnaechst'." },
  { from: "lobby.001", to: "bodo.2612", text: "ersatztermin: morgen 14:00. demnächst." },
  { from: "uschi.6601", to: "harald.6602", text: "kommst du noch zum schach?" },
  { from: "harald.6602", to: "uschi.6601", text: "die figuren hat letzte woche jemand entfernt." },
  { from: "uschi.6601", to: "harald.6602", text: "wir spielen ohne." },
  { from: "harald.6602", to: "uschi.6601", text: "ok. ich bringe das brett." },
  { from: "philippe.2613", to: "worag.2611", text: "(leerer paket-header. kein inhalt.)" },
  { from: "worag.2611", to: "philippe.2613", text: "(leerer paket-header. kein inhalt.)" },
  { from: "philippe.2613", to: "worag.2611", text: "verstanden." },
  { from: "leitstelle.001", to: "stegmann.it", text: "5610 zeigt erhöhten paket-puls. bitte beobachten." },
  { from: "stegmann.it", to: "leitstelle.001", text: "ist eingeschaltet." },
  { from: "leitstelle.001", to: "stegmann.it", text: "ich meinte: jemand hört mit." },
  { from: "stegmann.it", to: "leitstelle.001", text: "(kein paket. timeout.)" },
  { from: "elke.4503", to: "lobby.001", text: "die heizung in 4503 macht das ploppen wieder." },
  { from: "lobby.001", to: "elke.4503", text: "vermerkt. seit 1994." },
  { from: "elke.4503", to: "lobby.001", text: "danke." },
  { from: "kuno.5712", to: "tilda.3301", text: "wenn ich jetzt schlafe, vergesse ich was. wenn ich jetzt nicht schlafe, vergesse ich auch was. der unterschied ist nur, wer am ende noch da ist, um es zu wissen. ich glaube heute schlafe ich. wenn ich morgen schreibe, dann weißt du, dass es geklappt hat." },
  { from: "tilda.3301", to: "kuno.5712", text: "schlaf. ich erinnere dich morgen daran, was du heute gesagt hast." },
  { from: "lobby.001", to: "all.e67", text: "ich erinnere: keine privaten frequenzen jenseits 100,0." },
  { from: "ennis.2614", to: "lobby.001", text: "und 99,9 ist erlaubt?" },
  { from: "lobby.001", to: "ennis.2614", text: "99,9 ist nicht definiert." },
  { from: "ennis.2614", to: "lobby.001", text: "perfekt." },
  { from: "tilda.3301", to: "elke.4503", text: "tagebuch (an dich, weil du immer fragst): heute 4 stunden 104,6, besser als gestern. gestern waren es 6, glaube ich. ich erinnere mich nicht genau, weil ich währenddessen nichts erinnere. das ist ja der punkt. wenn du das liest und mir nicht glaubst: das ist auch okay." },
  { from: "elke.4503", to: "tilda.3301", text: "vier ist genug. lass es vier bleiben." },
  { from: "philippe.2613", to: "ennis.2614", text: "der neue in 2611 schreibt was." },
  { from: "ennis.2614", to: "philippe.2613", text: "schreibt er gut?" },
  { from: "philippe.2613", to: "ennis.2614", text: "er schreibt ehrlich. das ist seltener." },
  { from: "leitstelle.001", to: "stegmann.it", text: "schichtwechsel 09:00. notiz: bauerfeind übernimmt e67. (wieder.)" },
  { from: "stegmann.it", to: "leitstelle.001", text: "vermerkt." },
  { from: "bodo.2612", to: "lobby.001", text: "schlüssel zu 5610 ist nicht im hauptbund." },
  { from: "lobby.001", to: "bodo.2612", text: "5610 hat kein schloss. nur ein keypad." },
  { from: "bodo.2612", to: "lobby.001", text: "und der code?" },
  { from: "lobby.001", to: "bodo.2612", text: "steht in deinem maint-system." },
  { from: "bodo.2612", to: "lobby.001", text: "(kein paket. timeout.)" },
  { from: "anonym.????", to: "all.e67", text: "104,6 fehlt zwei sekunden. niemand?" },
  { from: "anonym.????", to: "all.e67", text: "doch. ich. aber ich darf nichts sagen." },
  { from: "anonym.????", to: "all.e67", text: "ich auch." },
  { from: "anonym.????", to: "all.e67", text: "ich auch. aber wir sagen es uns gerade." },
  { from: "ennis.2614", to: "philippe.2613", text: "ich schreibe das nur dir, weil du nicht antwortest und das gerade hilft: ich vergesse langsam, was die welt da draußen ist. und in den momenten, in denen ich es vergesse, vergesse ich auch, dass es überhaupt eine gab. das ist nicht traurig. das ist nur sehr leise. wenn du das liest, schreib einfach nichts zurück. das passt dann besser." },
  { from: "philippe.2613", to: "ennis.2614", text: "ich antworte trotzdem. es gab eine. ich glaube." },
  { from: "kantine.e67", to: "all.e67", text: "ankündigung: morgen B3-tag. eine pro person." },
  { from: "philippe.2613", to: "kantine.e67", text: "wir sind 412 personen. ihr habt 80 dosen." },
  { from: "kantine.e67", to: "philippe.2613", text: "(kein paket. timeout.)" },
  { from: "rolf.5612", to: "leitstelle.001", text: "frage an die leitstelle, ich weiß, falsche adresse, aber ich habe sonst keine: mein name fühlt sich an wie ein passwort, das ich vergessen habe. ist das gemeldet bei euch oder muss ich das selbst dokumentieren? wenn ich das selbst dokumentieren muss, brauche ich einen anderen namen, denn meinen kann ich gerade schlecht aufschreiben." },
  { from: "leitstelle.001", to: "rolf.5612", text: "das ist nicht teil unseres dienstes. wir empfehlen tagebuch oder radio." },
  { from: "rolf.5612", to: "leitstelle.001", text: "ich weiß." },
  { from: "lobby.001", to: "all.e67", text: "freundliche erinnerung: lautstärke ist eine zentrale ressource." },
  { from: "ennis.2614", to: "lobby.001", text: "stille auch." },
  { from: "lobby.001", to: "ennis.2614", text: "vermerkt." },
  { from: "philippe.2613", to: "mira.5601", text: "ich glaube layard ist auch da drin. nicht in der wohnung — im kabel. ich kann es nicht erklären. wir sind seit jahren nachbarn, wir haben uns vielleicht zwölfmal gesehen, aber wenn 5610 heute zuhört, dann hört er mit. das ist ein gefühl, kein beweis. behalte es für dich." },
  { from: "mira.5601", to: "philippe.2613", text: "ich behalte alles für mich. das ist mein job." },
  { from: "mira.5601", to: "philippe.2613", text: "der knoten 5610 spürt heute jemanden, der ihm zuhört." },
  { from: "philippe.2613", to: "mira.5601", text: "ich war es nicht." },
  { from: "mira.5601", to: "philippe.2613", text: "ich auch nicht." },
  { from: "mira.5601", to: "philippe.2613", text: "es war jemand neues." },
  { from: "kuno.5712", to: "tilda.3301", text: "kennen wir uns?" },
  { from: "tilda.3301", to: "kuno.5712", text: "vor vier jahren. korridor 33." },
  { from: "kuno.5712", to: "tilda.3301", text: "ich erinnere mich nicht." },
  { from: "tilda.3301", to: "kuno.5712", text: "macht nichts. ich auch nicht mehr ganz." },
  { from: "lobby.001", to: "bodo.2612", text: "anruf liegt vor: lotti hat heute morgen 11 minuten gemiaut." },
  { from: "bodo.2612", to: "lobby.001", text: "danke. ich gehe gleich." },
  { from: "lobby.001", to: "bodo.2612", text: "(du gehst seit 09:11. es ist 11:42.)" },
  { from: "bodo.2612", to: "lobby.001", text: "ich gehe gleich." },
  { from: "anonym.????", to: "all.e67", text: "wenn ihr das hier mitlest: die tür 5610 öffnet sich von innen leichter." },
  { from: "anonym.????", to: "all.e67", text: "(diese nachricht wird nicht gelöscht. das ist neu.)" },
  { from: "leitstelle.001", to: "stegmann.it", text: "memo intern: knoten 5610 protokolliert seit 09:14 ungewöhnlich viel. anweisung: nicht reagieren, nur beobachten. bauerfeind weiß bescheid. dieses memo bitte nicht weiterleiten, auch nicht zur kenntnisnahme. dieses memo bitte nicht beantworten. dieses memo bitte nicht ausdrucken." },
  { from: "stegmann.it", to: "leitstelle.001", text: "verstanden. nicht reagieren ist meine spezialität." },
  { from: "philippe.2613", to: "ennis.2614", text: "104,6 war heute drei minuten still. in den drei minuten habe ich meinen namen vergessen. als es wieder anging, hieß ich wieder philippe. ich glaube das ist gut. ich weiß nur nicht, wer in der zwischenzeit hier in der wohnung war." },
  { from: "ennis.2614", to: "philippe.2613", text: "vielleicht der, den du jetzt heißt." },
  { from: "ute.3408", to: "elke.4503", text: "weißt du noch, wie es vor dem sektor war?" },
  { from: "elke.4503", to: "ute.3408", text: "es gab keinen davor." },
  { from: "ute.3408", to: "elke.4503", text: "doch. ich glaube schon." },
  { from: "elke.4503", to: "ute.3408", text: "dann erzähl." },
  { from: "ute.3408", to: "elke.4503", text: "(kein paket. timeout.)" },
  { from: "anonym.????", to: "all.e67", text: "wer das hier liest, ist nicht alleine." },
  { from: "anonym.????", to: "all.e67", text: "selbst die leitstelle liest mit. selbst die ist nicht alleine." },
  { from: "lobby.001", to: "all.e67", text: "gute nacht, e67. licht im korridor 56 wird gleich gedimmt." },
  { from: "philippe.2613", to: "lobby.001", text: "es ist 11:43 vormittags." },
  { from: "lobby.001", to: "philippe.2613", text: "vermerkt." },
  { from: "ralph.6701", to: "uschi.6601", text: "frage." },
  { from: "uschi.6601", to: "ralph.6701", text: "ja." },
  { from: "ralph.6701", to: "uschi.6601", text: "war das eine antwort." },
  { from: "uschi.6601", to: "ralph.6701", text: "ja." },
  { from: "helka.2610", to: "ennis.2614", text: "wasser?" },
  { from: "ennis.2614", to: "helka.2610", text: "ja." },
  { from: "lobby.001", to: "kantine.e67", text: "korrektur zur ankündigung: morgen kein B3-tag. die lieferung wurde umgeleitet, der grund ist intern, die kommunikation an die bewohner ist eure aufgabe, nicht unsere. wir empfehlen die formulierung »logistische präzisierung«. formulierungen wie »wieder nichts« sind ausdrücklich nicht freigegeben und werden im wiederholungsfall protokolliert." },
  { from: "kantine.e67", to: "lobby.001", text: "danke. wir hängen den zettel raus." },
  { from: "philippe.2613", to: "ennis.2614", text: "zettel hängt." },
  { from: "ennis.2614", to: "philippe.2613", text: "wieder nichts." },
  { from: "mira.5601", to: "lobby.001", text: "kurzer status korridor 56: nordwand wie gestern, ostwand neu feucht, decke unverändert, boden seit montag drei kabelenden frei, von denen zwei nicht in meinem plan stehen. ich melde das jetzt zum vierten mal. ich melde es so lange, bis es jemand liest, der nicht »vermerkt« antwortet. das ist keine drohung. das ist nur sehr viel zeit, die ich habe." },
  { from: "lobby.001", to: "mira.5601", text: "vermerkt." },
  { from: "bodo.2612", to: "stegmann.it", text: "hand aufs herz, kollege: wenn ich sysupdate eintippe, was passiert mit meinem fütterungskalender für lotti? der läuft auf v2.0. der ist eigenbau. den habe ich nirgendwo sonst und lotti merkt es sofort, wenn um 17:30 nichts in der schüssel ist. das ist kein technisches problem für euch, ich weiß. für mich schon." },
  { from: "stegmann.it", to: "bodo.2612", text: "der läuft weiter. wahrscheinlich." },
  { from: "bodo.2612", to: "stegmann.it", text: "wahrscheinlich ist kein wort, das man einer katze erklärt." },
  { from: "stegmann.it", to: "bodo.2612", text: "dann tippe es nicht." },
  { from: "anonym.????", to: "all.e67", text: "test." },
  { from: "anonym.????", to: "all.e67", text: "läuft." },
  { from: "harald.6602", to: "ralph.6701", text: "hast du heute eine kakerlake gesehen." },
  { from: "ralph.6701", to: "harald.6602", text: "drei." },
  { from: "harald.6602", to: "ralph.6701", text: "ich nur eine. dann gewinne ich." },
  { from: "ralph.6701", to: "harald.6602", text: "das ist kein gewinnspiel." },
  { from: "harald.6602", to: "ralph.6701", text: "alles ist ein gewinnspiel, wenn man lange genug hier wohnt." },
  { from: "leitstelle.001", to: "lobby.001", text: "anweisung: keine bestätigungen mehr an »anonym.????«. jede bestätigung verstärkt den kanal. einfach nicht antworten. das ist eine zentrale anweisung, sie steht über der höflichkeit, sie steht über dem dienstleistungs-leitfaden, und sie steht ausdrücklich über dem reflex, »vermerkt« zu schreiben. wenn ihr »vermerkt« schreiben wollt: schreibt es uns. wir lesen es. wir antworten nicht." },
  { from: "lobby.001", to: "leitstelle.001", text: "vermerkt." },
  { from: "tina.4712", to: "lotte.4711", text: "der kaffee ist alle, aber ich habe noch zwei filtertüten und einen löffel, an dem das wort kaffee mal stand. wir können so tun. wir tun das ja sowieso bei vielem." },
  { from: "lotte.4711", to: "tina.4712", text: "ich bringe wasser." },
  { from: "anonym.????", to: "all.e67", text: "wer auch immer gerade auf 5610 mitliest: schließt die tür hinter euch. und kippt die luke nicht. wir wissen, dass ihr das tun werdet. wir bitten trotzdem." },
  { from: "lobby.001", to: "anonym.????", text: "absender unbekannt. paket verworfen." },
  { from: "anonym.????", to: "all.e67", text: "die tür ist trotzdem zu." },
];

/** Zufällige Verzögerung 3000–7000 ms. */
export function chatterDelayMs(): number {
  return 3000 + Math.floor(Math.random() * 4001);
}

/** Liefert eine Zeitstempel-Annotation im 24h-Format, sektor-stilisiert. */
export function chatterTimestamp(): string {
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
