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
  { from: "rolf.5612", to: "rolf.5612", text: "selbsttest. sender ok." },
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
  { from: "anonym.????", to: "anonym.????", text: "wenn du das liest, bist du im richtigen kabel." },
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
  { from: "philippe.2613", to: "philippe.2613", text: "die wand antwortet wenn ich klopfe." },
  { from: "philippe.2613", to: "philippe.2613", text: "die wand antwortet wenn ich klopfe." },
  { from: "philippe.2613", to: "philippe.2613", text: "die wand antwortet wenn ich klopfe." },
  { from: "kantine.e67", to: "all.e67", text: "heute ausnahme: nudel-äquivalent in B-soße." },
  { from: "ennis.2614", to: "kantine.e67", text: "was ist nudel-äquivalent." },
  { from: "kantine.e67", to: "ennis.2614", text: "B2 in form." },
  { from: "lobby.001", to: "all.e67", text: "sektorradio bleibt heute durchgehend an. das ist normal." },
  { from: "anonym.????", to: "all.e67", text: "es ist nicht normal." },
  { from: "lobby.001", to: "anonym.????", text: "absender unbekannt. paket verworfen." },
  { from: "anonym.????", to: "all.e67", text: "es ist nicht normal." },
  { from: "lobby.001", to: "anonym.????", text: "absender unbekannt. paket verworfen." },
  { from: "anonym.????", to: "all.e67", text: "es ist immer noch nicht normal." },
  { from: "bodo.2612", to: "bodo.2612", text: "todo: B3 nachholen. wieder." },
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
  { from: "kuno.5712", to: "kuno.5712", text: "wenn ich jetzt schlafe, vergesse ich was." },
  { from: "kuno.5712", to: "kuno.5712", text: "wenn ich jetzt nicht schlafe, vergesse ich auch was." },
  { from: "kuno.5712", to: "kuno.5712", text: "ich schlafe." },
  { from: "lobby.001", to: "all.e67", text: "ich erinnere: keine privaten frequenzen jenseits 100,0." },
  { from: "ennis.2614", to: "lobby.001", text: "und 99,9 ist erlaubt?" },
  { from: "lobby.001", to: "ennis.2614", text: "99,9 ist nicht definiert." },
  { from: "ennis.2614", to: "lobby.001", text: "perfekt." },
  { from: "tilda.3301", to: "tilda.3301", text: "tagebuch: heute 4 stunden 104,6. besser als gestern." },
  { from: "tilda.3301", to: "tilda.3301", text: "tagebuch: gestern 6 stunden. ich erinnere mich nicht." },
  { from: "philippe.2613", to: "ennis.2614", text: "der neue in 2611 schreibt was." },
  { from: "ennis.2614", to: "philippe.2613", text: "schreibt er gut?" },
  { from: "philippe.2613", to: "ennis.2614", text: "er schreibt ehrlich. das ist seltener." },
  { from: "leitstelle.001", to: "leitstelle.001", text: "schichtwechsel 09:00. notiz: bauerfeind übernimmt e67." },
  { from: "leitstelle.001", to: "leitstelle.001", text: "(wieder.)" },
  { from: "bodo.2612", to: "lobby.001", text: "schlüssel zu 5610 ist nicht im hauptbund." },
  { from: "lobby.001", to: "bodo.2612", text: "5610 hat kein schloss. nur ein keypad." },
  { from: "bodo.2612", to: "lobby.001", text: "und der code?" },
  { from: "lobby.001", to: "bodo.2612", text: "steht in deinem maint-system." },
  { from: "bodo.2612", to: "lobby.001", text: "(kein paket. timeout.)" },
  { from: "anonym.????", to: "all.e67", text: "104,6 fehlt zwei sekunden. niemand?" },
  { from: "anonym.????", to: "all.e67", text: "doch. ich. aber ich darf nichts sagen." },
  { from: "anonym.????", to: "all.e67", text: "ich auch." },
  { from: "anonym.????", to: "all.e67", text: "ich auch. aber wir sagen es uns gerade." },
  { from: "ennis.2614", to: "ennis.2614", text: "ich vergesse, was die welt da draußen ist." },
  { from: "ennis.2614", to: "ennis.2614", text: "ich vergesse, ob es eine welt da draußen ist." },
  { from: "kantine.e67", to: "all.e67", text: "ankündigung: morgen B3-tag. eine pro person." },
  { from: "philippe.2613", to: "kantine.e67", text: "wir sind 412 personen. ihr habt 80 dosen." },
  { from: "kantine.e67", to: "philippe.2613", text: "(kein paket. timeout.)" },
  { from: "rolf.5612", to: "rolf.5612", text: "mein name fühlt sich an wie ein passwort, das ich vergessen habe." },
  { from: "leitstelle.001", to: "rolf.5612", text: "das ist nicht teil unseres dienstes." },
  { from: "rolf.5612", to: "leitstelle.001", text: "ich weiß." },
  { from: "lobby.001", to: "all.e67", text: "freundliche erinnerung: lautstärke ist eine zentrale ressource." },
  { from: "ennis.2614", to: "lobby.001", text: "stille auch." },
  { from: "lobby.001", to: "ennis.2614", text: "vermerkt." },
  { from: "philippe.2613", to: "philippe.2613", text: "ich glaube layard ist auch da drin." },
  { from: "worag.2611", to: "worag.2611", text: "(noch keine ausgehenden pakete heute.)" },
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
  { from: "leitstelle.001", to: "leitstelle.001", text: "memo: knoten 5610 protokolliert seit 09:14 ungewöhnlich viel." },
  { from: "leitstelle.001", to: "leitstelle.001", text: "memo: nicht reagieren. beobachten." },
  { from: "leitstelle.001", to: "leitstelle.001", text: "memo: bauerfeind weiß bescheid." },
  { from: "philippe.2613", to: "philippe.2613", text: "104,6 war heute drei minuten still." },
  { from: "philippe.2613", to: "philippe.2613", text: "in den drei minuten habe ich meinen namen vergessen." },
  { from: "philippe.2613", to: "philippe.2613", text: "als es wieder anging, hieß ich wieder philippe." },
  { from: "philippe.2613", to: "philippe.2613", text: "ich glaube das ist gut." },
  { from: "ute.3408", to: "elke.4503", text: "weißt du noch, wie es vor dem sektor war?" },
  { from: "elke.4503", to: "ute.3408", text: "es gab keinen davor." },
  { from: "ute.3408", to: "elke.4503", text: "doch. ich glaube schon." },
  { from: "elke.4503", to: "ute.3408", text: "dann erzähl." },
  { from: "ute.3408", to: "elke.4503", text: "(kein paket. timeout.)" },
  { from: "anonym.????", to: "anonym.????", text: "wer das hier liest, ist nicht alleine." },
  { from: "anonym.????", to: "anonym.????", text: "selbst die leitstelle liest mit. selbst die ist nicht alleine." },
  { from: "lobby.001", to: "all.e67", text: "gute nacht, e67. licht im korridor 56 wird gleich gedimmt." },
  { from: "philippe.2613", to: "lobby.001", text: "es ist 11:43 vormittags." },
  { from: "lobby.001", to: "philippe.2613", text: "vermerkt." },
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
