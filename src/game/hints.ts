/**
 * "Stuck?"-Hint-System nach Vorbild von Return to Monkey Island.
 *
 * Pro offene Quest existiert ein Eintrag mit drei Hinweis-Stufen:
 *   1. Andeutung — erinnert nur an das Thema.
 *   2. Richtung  — nennt Ort/Person/Item konkret.
 *   3. Lösung    — sagt exakt, was als Nächstes zu tun ist.
 *
 * i18n-Hinweis: Alle Texte hier sind ganze Sätze. UI-Strings stehen in
 * `HINTS_UI_TEXT`. Keine String-Konkatenation in der Komponente.
 */

import type { GameApi } from "./types";

export interface HintQuest {
  /** Stabile ID, z.B. "act1.b3Authorization". */
  id: string;
  /** Kurzer Titel für die Quest-Auswahl. */
  title: string;
  /** 1–3 Stufen — vage → konkreter → exakte Anweisung. Wenn der erste
   *  Tipp schon eindeutig ist, reicht ein einzelner Eintrag. */
  hints: [string] | [string, string] | [string, string, string];
  /** Sortierung: kleiner = wichtiger / Default-Vorauswahl. */
  priority: number;
  /** Quest gilt als offen, wenn dieses Prädikat true ist. */
  isActive: (api: GameApi) => boolean;
  /** Quest verschwindet aus der Liste, wenn dieses Prädikat true ist. */
  isResolved: (api: GameApi) => boolean;
}

/**
 * Hilfsfunktion: Quest ist "echt offen" — aktiv und noch nicht erledigt.
 */
function open(active: boolean, resolved: boolean) {
  return active && !resolved;
}

/**
 * Quest-Inventar. Reihenfolge ist nur Lesbarkeits-Hilfe; Sortierung
 * erfolgt über `priority`. Beim Ergänzen neuer Akte: hier eintragen,
 * UI muss nicht angefasst werden.
 */
export const HINT_QUESTS: HintQuest[] = [
  // ════════════════════════════════════════════════════════════════
  // KRITISCHER PFAD AKT I — strikt in der Reihenfolge, in der
  // das Spiel die nächste Aktion erzwingt. Tipps sind kleinteilig:
  // jeder Eintrag deckt genau EINEN Story-Trigger ab. Optionale
  // Nebenpfade (B3, Bürokratie-Duell, Mira-Vertrauen, versteckte
  // Frequenzen) stehen weiter unten mit höherer Priorität-Zahl.
  // ════════════════════════════════════════════════════════════════

  // 1) Spielstart — Radio auf 104,6, voll aufdrehen
  {
    id: "act1.tuneRadio",
    title: "Schmerz-Radio einstellen",
    priority: 1,
    isActive: (a) =>
      !a.hasFlag("doorbellRang") &&
      !a.hasFlag("knockingHeard") &&
      !a.hasFlag("metPhilippe"),
    isResolved: (a) => a.hasFlag("doorbellRang"),
    hints: [
      "Layard hat heute Urlaub — und einen ganz konkreten Plan, womit er anfangen will. Auf seinem Tisch steht das wichtigste Gerät seines Alltags.",
      "Klick in der Wohnung das Schmerz-Radio an. Du brauchst die richtige Frequenz UND die richtige Lautstärke — beides muss zusammenkommen.",
      "Öffne das Schmerz-Radio, drehe die Frequenz exakt auf 104,6 MHz und schiebe die Lautstärke ganz nach rechts (voll auf). Dann passiert von selbst etwas an deiner Tür.",
    ],
  },

  // 2) Es klingelt — Tür öffnen, Philippe trifft Layard
  {
    id: "act1.openDoor",
    title: "Es hat geklingelt",
    priority: 2,
    isActive: (a) => a.hasFlag("doorbellRang") && !a.hasFlag("metPhilippe"),
    isResolved: (a) => a.hasFlag("metPhilippe"),
    hints: [
      "Da war ein Geräusch — und es kam nicht aus dem Radio.",
      "Jemand steht vor deiner Tür. Du musst sie öffnen, um zu sehen, wer.",
      "Klick auf die Wohnungstür rechts im Bild und führ das Gespräch mit Philippe zu Ende.",
    ],
  },

  // 3) In 2613: das Klopfen an der Wand untersuchen
  {
    id: "act1.examineWall",
    title: "Das Klopfen aus der Nachbarwohnung",
    priority: 4,
    isActive: (a) =>
      a.hasFlag("metPhilippe") &&
      !a.hasFlag("knockingHeard"),
    isResolved: (a) => a.hasFlag("knockingHeard"),
    hints: [
      "Hör genau hin — etwas in Philippes Wohnung wiederholt sich.",
      "Das Geräusch kommt aus der Wand zur Nachbarwohnung 2615.",
      "Klick die mittlere Wand zwischen Telefon und Philippe an („Wand mit Klopfen“). Erst dann zählt das Klopfen als von dir wahrgenommen.",
    ],
  },

  // 5) Mit Philippe in 2613 sprechen, bevor man telefonieren kann
  {
    id: "act1.talkPhilippe2613",
    title: "Philippe in seiner Wohnung ansprechen",
    priority: 5,
    isActive: (a) =>
      a.hasFlag("knockingHeard") &&
      !a.hasFlag("talkedPhilippe2613") &&
      !a.hasFlag("calledLeitstelle"),
    isResolved: (a) =>
      a.hasFlag("talkedPhilippe2613") || a.hasFlag("calledLeitstelle"),
    hints: [
      "Du musst nicht alleine entscheiden, was zu tun ist. Frag den, der danebensteht.",
      "Sprich Philippe in 2613 an, bevor du irgendetwas anderes tust.",
      "Klick Philippe in 2613 an und führ das Gespräch durch. Erst danach gibt sein Telefon dir eine sinnvolle Option.",
    ],
  },

  // 6) Leitstelle anrufen — Sanitäter rufen
  {
    id: "act1.callLeitstelle",
    title: "Leitstelle anrufen",
    priority: 6,
    isActive: (a) =>
      a.hasFlag("talkedPhilippe2613") && !a.hasFlag("calledLeitstelle"),
    isResolved: (a) => a.hasFlag("calledLeitstelle"),
    hints: [
      "In 2615 reagiert niemand. Du selbst hast dort keine Befugnis — aber jemand anderes hat sie.",
      "Philippes Wandapparat (Telefon links) ist jetzt nutzbar. Da gibt es nur eine Stelle, die in so einem Fall zuständig ist.",
      "Klick das Wandtelefon in 2613 an und ruf die Leitstelle (Insa) an. Sie schickt Sanitäter zur 2615.",
    ],
  },

  // 7) Warten, bis die Sanitäter eintreffen
  {
    id: "act1.waitForParamedics",
    title: "Auf die Sanitäter warten",
    priority: 7,
    isActive: (a) =>
      a.hasFlag("calledLeitstelle") && !a.hasFlag("paramedicsArrived"),
    isResolved: (a) => a.hasFlag("paramedicsArrived"),
    hints: [
      "Klick in 2613 zweimal auf „Warten“. Beim zweiten Beat treffen die Sanitäter ein.",
    ],
  },

  // 7b) Nach den Sanitätern: Zimmer verlassen
  {
    id: "act1.leaveAfterParamedics",
    title: "2613 verlassen",
    priority: 7,
    isActive: (a) =>
      a.hasFlag("paramedicsArrived") && !a.hasFlag("protocolReceived"),
    isResolved: (a) => a.hasFlag("protocolReceived"),
    hints: [
      "Verlass das Zimmer.",
    ],
  },

  // 8) Aufzug benutzen — auf Etage 3 das leere Büro entdecken
  {
    id: "act1.takeElevator",
    title: "Aufzug benutzen",
    priority: 8,
    isActive: (a) =>
      a.hasFlag("protocolReceived") &&
      !a.hasFlag("sawEmptyOffice") &&
      // Solange die Wartungssperre 4711 aktiv ist, kann der Aufzug nicht
      // benutzt werden — dann gilt der separate Hint act1.elevatorMaint.
      !(a.hasFlag("elevatorMaintBlocked") && !a.hasFlag("elevatorMaintCleared")),
    isResolved: (a) => a.hasFlag("sawEmptyOffice"),
    hints: [
      "Du hast jetzt etwas in der Hand, das du jemand anderem geben sollst. Der zuständige Mensch sitzt nicht auf deiner Etage.",
      "Geh in den Korridor, dann zum Aufzug am Ende des Gangs.",
      "Verlass 2613, geh in den Korridor 26 und nimm den Aufzug ins 3. Stockwerk. Geh dort den Korridor 36 ab bis Tür 3601 und lies den Aushang.",
    ],
  },

  // 10) Wartungssperre 4711 am Aufzug — über Bodos Terminal lösen
  {
    id: "act1.elevatorMaint",
    title: "Wartungssperre 4711 am Aufzug",
    priority: 10,
    isActive: (a) =>
      a.hasFlag("elevatorMaintBlocked") && !a.hasFlag("elevatorMaintCleared"),
    isResolved: (a) => a.hasFlag("elevatorMaintCleared"),
    hints: [
      "Der Aufzug fährt nicht mehr. Die Sperre wurde nicht zentral, sondern von einem Hausmeister gesetzt.",
      "Auf Etage 26 wohnt Bodo (2612). Er hat einen Hausmeister-Account — aber du musst die Wohnung leer haben, um an sein Terminal zu kommen.",
      "Sprich Bodo so an, dass er die Wohnung verlässt (B3-Gefälligkeit / Lotti-Wasser). Sobald er weg ist, geh in 2612, öffne sein Terminal und lösche dort die Wartungssperre 4711.",
    ],
  },

  // 11) Insa anrufen → Vorgangs-Status klären, Code anfragen
  {
    id: "act1.callInsaFor5610",
    title: "Insa anrufen — Code für die Sektor-Tür",
    priority: 11,
    isActive: (a) =>
      a.hasFlag("sawEmptyOffice") &&
      !a.hasFlag("insaSentToKowalkForCode") &&
      !a.hasFlag("calledForCode"),
    isResolved: (a) =>
      a.hasFlag("insaSentToKowalkForCode") || a.hasFlag("calledForCode"),
    hints: [
      "Der Abschnittsverantwortliche fehlt — also gibt es jetzt nur noch eine Stelle, die deine Sache weiterbringt.",
      "Geh zurück in deine Wohnung 2611 und ruf von deinem Telefon aus die Leitstelle an.",
      "Geh nach 2611, klick dein Telefon an und sprich mit Insa. Wähle „Ich brauche einen Code für die Sektor-Tür“ — sie verweist dich an Oberverwalter Vossbeck (3603) und gibt einen Tipp, vorher mit Frau Kowalk zu reden.",
    ],
  },

  // 12) Optional: Serverraum 5610 für Schmerz-Radio-Spurensucher
  {
    id: "act1.serverRoom5610",
    title: "Serverraum 5610 — Spur des Schmerz-Radios",
    priority: 65,
    isActive: (a) =>
      a.hasFlag("saw5610Door") &&
      !a.hasFlag("tappedNode5610") &&
      !a.hasFlag("burnedNode5610"),
    isResolved: (a) =>
      a.hasFlag("tappedNode5610") || a.hasFlag("burnedNode5610"),
    hints: [
      "Optional: hinter Tür 5610 liegt die Quelle des Brummens auf 104,6.",
      "Sobald die Wartungssperre 4711 gelöscht ist (Bodos Terminal), gibt der Magnetriegel auch hier nach.",
      "Im Raum gibt es ein Wartungsterminal — »tap« schneidet den Datenstrom mit, ohne Spuren zu hinterlassen. Für die Story nicht zwingend.",
    ],
  },

  // 13a) Frau Kowalk in der Kantine ansprechen — Vossbeck-Pfad
  {
    id: "act1.kowalkBrief",
    title: "Bei Frau Kowalk vorsprechen",
    priority: 13,
    isActive: (a) =>
      a.hasFlag("insaSentToKowalkForCode") &&
      !a.hasFlag("knowsVossbeckPath"),
    isResolved: (a) => a.hasFlag("knowsVossbeckPath"),
    hints: [
      "Insa hat dir gesagt: Vossbeck (3603) gibt den Tagescode — aber geh nicht direkt rein. Sprich vorher mit Frau Kowalk.",
      "Frau Kowalk steht am linken Tresen der Kantine 3602, im Korridor 36 (Etage 3). Sie kennt die ungeschriebene Regel für Vossbeck.",
      "Fahr ins 3. OG, geh in die Kantine 3602 und sprich Frau Kowalk an. Wähle »Insa sagt, Sie wissen, wie man bei Vossbeck reinkommt«.",
    ],
  },
  // 13b) Bei Brust das Formblatt 17/V erspielen (oder Forgery-Pfad)
  {
    id: "act1.stamp4317",
    title: "Formblatt 17/V besorgen",
    priority: 13,
    isActive: (a) =>
      a.hasFlag("knowsVossbeckPath") &&
      !a.hasItem("formblatt17V") &&
      !a.hasItem("formblatt17VForged") &&
      !a.hasFlag("kowalkOfferedForgery"),
    isResolved: (a) =>
      a.hasItem("formblatt17V") ||
      a.hasItem("formblatt17VForged") ||
      a.hasFlag("kowalkOfferedForgery"),
    hints: [
      "Vossbeck nimmt keinen Bewohner an, der ohne Formblatt 17/V kommt. Das Formblatt gibt es nur an einer Stelle — und nur nach einer Prüfung.",
      "Herr Brust am rechten Tresen der Kantine 3602 prüft, ob du „satisfaktionsfähig“ bist. Drei Trainingsfälle in Folge gewinnen — Formblatt in der Hand.",
      "Sprich Brust am Tresen an, wähle »Trainingsfall« und gewinn drei in Folge. Brust händigt dir dann Formblatt 17/V aus. Falls du an Brust scheiterst: zurück zu Kowalk — sie kennt einen anderen Weg.",
    ],
  },
  // 13c) Optional: Tillas 4317-K abschicken (Nebenakte)
  {
    id: "act1.send4317K",
    title: "Tillas Quittung 4317-K abschicken (optional)",
    priority: 55,
    isActive: (a) =>
      a.hasFlag("gotTillaTransferInfo") &&
      !a.hasItem("tillaTransfer"),
    isResolved: (a) => a.hasItem("tillaTransfer"),
    hints: [
      "Tillas Akte hängt seit einem Jahr. Frau Kowalk darf die 4317-K nicht selbst abschicken — aber du kannst.",
      "Sprich Kowalk in 3602 an und wähle »schicken wir Tillas 4317-K raus?« — sie zeichnet gegen und gibt dir die Quittung.",
      "Klick die Pneumatik-Rohrpost an der Wand der Kantine an (oder zieh die Quittung aus dem Inventar darauf). Empfänger E70-K, Code 4317-K. Antwort kommt zurück ans Rohr.",
    ],
  },

  // 14) Endduell bei Vossbeck — Tagescode erstreiten
  {
    id: "act1.callInsaForCode",
    title: "Vossbeck im Endduell schlagen — Tagescode",
    priority: 14,
    isActive: (a) =>
      (a.hasItem("formblatt17V") || a.hasItem("formblatt17VForged")) &&
      !a.hasFlag("calledForCode"),
    isResolved: (a) => a.hasFlag("calledForCode"),
    hints: [
      "Du hast das Formblatt. Jetzt zählt nur noch das eine Gespräch — bei Vossbeck nebenan in 3603.",
      "Vossbeck führt das Endduell: drei Runden, zwei Treffer. Bei Sieg legt er den Tagescode direkt in dein Terminal-Postfach.",
      "Geh in Tür 3603 (Kantinenverwaltung), gib das Formblatt 17/V ab und schlag Vossbeck im Endduell. Der Code liegt anschließend in deinem CentralOS-Postfach.",
    ],
  },

  // 15) Sektor-Tür öffnen
  {
    id: "act1.sectorDoor",
    title: "Sektor E67 verlassen",
    priority: 15,
    isActive: (a) =>
      a.hasItem("residentId") &&
      a.hasFlag("calledForCode") &&
      !a.hasFlag("sectorDoorOpen"),
    isResolved: (a) => a.hasFlag("sectorDoorOpen"),
    hints: [
      "Du hast jetzt alles, was die Schleuse von dir verlangt: dich selbst und einen Code.",
      "Geh durch die Lobby zur Sektor-Schleuse E67 → E71. Den Code findest du im Postfach deines CentralOS-Terminals in 2611 (Mail von Insa). Achtung: Zwischen dir und der Lobby liegt tagsüber die Lobby-Schleuse — siehe eigener Tipp.",
      "Lies die Mail von Insa in deinem Terminal, geh zur Sektor-Schleuse, leg deinen (schon vorhandenen) Bewohner-Ausweis in den Kartenschlitz und tippe den 8-stelligen Tagescode am Keypad ein.",
    ],
  },

  // 15b) Lobby-Schleuse E67 (Tagesmodus) — kleiner Türsteher zwischen
  //      Aufzug und Sektor-Schleuse. Kein Blocker (Auto-Eskalation nach
  //      3 Fehlversuchen), aber ohne Tipp finden Spieler den Code nicht.
  {
    id: "act1.lobbyGate",
    title: "Lobby-Schleuse E67 (Bewohner-Code)",
    priority: 15,
    isActive: (a) =>
      a.hasFlag("protocolReceived") &&
      !a.hasFlag("lobbyClearedDay"),
    isResolved: (a) => a.hasFlag("lobbyClearedDay"),
    hints: [
      "Zwischen Aufzug und Sektor-Schleuse steht tagsüber eine kleine Bewohner-Schleuse. Sie will zweierlei: dich, und eine Zahl, die nur dich meint.",
      "Leg deinen Bewohner-Ausweis in den Schlitz und tippe den 4-stelligen Bewohner-Code. Die Hausordnung §2 Abs. 7 sagt, wie er gebildet wird: aus deiner Wohnungsnummer.",
      "Code = Wohnung mod 10 000. Layard wohnt in 2611 → Code 2611. Karte einlegen, 2611 tippen, bestätigen. Bei drei Fehlversuchen ruft Insa selbst durch und öffnet für heute.",
    ],
  },


  // 16) Übergang Akt I → Akt II — Ending-Screen, Weiterspielen-Button
  {
    id: "act1.toAct2",
    title: "Weiter nach Akt II",
    priority: 16,
    isActive: (a) => a.hasFlag("sectorDoorOpen") && !a.hasFlag("act2Started"),
    isResolved: (a) => a.hasFlag("act2Started"),
    hints: [
      "Akt I ist zu Ende — aber die Geschichte ist es nicht. Insas Stimme im Kopf war kein Abschied.",
      "Auf dem Akt-I-Ending-Screen gibt es neben „Neu beginnen“ einen zweiten Button, der dich weiterspielen lässt.",
      "Klick auf dem Ending-Screen den Button „▸ Akt II — Weiterspielen“. Der nächste Morgen beginnt automatisch: Layard bricht mit dem Protokoll zur Leitstelle auf.",
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // OPTIONALE NEBENPFADE — höhere Priorität-Zahl, damit sie nicht
  // den kritischen Pfad verdecken. Werden nur angezeigt, wenn der
  // Spieler sie tatsächlich aktiv ausgelöst hat.
  // ════════════════════════════════════════════════════════════════

  // ── Optional: Vollmacht B3 für Philippe ──────────────────────────
  {
    id: "act1.b3Authorization",
    title: "B3-Ration für Philippe (optional)",
    priority: 50,
    isActive: (a) => a.hasFlag("philippeAskedFavor"),
    isResolved: (a) =>
      a.hasFlag("gotB3Authorization") ||
      a.hasFlag("gotB3Ration") ||
      a.hasFlag("duelEndgameWon") ||
      a.hasFlag("refusedB3Favor"),
    hints: [
      "Philippe hat dich um eine B3-Ration gebeten. Die Kantine gibt die nicht ohne Weiteres heraus — du brauchst entweder das Endduell oder einen anderen Hebel bei Kowalk/Brust.",
      "Gewinnst du das Endduell gegen Vossbeck (für den Tagescode), gibt er die B3-Ration automatisch mit frei. Sonst hilft nur Kowalks Kniff am Tresen.",
      "Spiel den Vossbeck-Pfad zu Ende: Brust → drei Trainingsfälle in Folge → Vossbeck in 3603 schlagen. Mit dem Sieg liegt die B3-Dose neben dem Tagescode auf dem Tresen.",
    ],
  },
  {
    id: "act1.bureaucracyDuel",
    title: "Bürokratie-Duell — Trainingsfälle gegen Brust",
    priority: 51,
    isActive: (a) =>
      a.hasFlag("knowsVossbeckPath"),
    isResolved: (a) =>
      a.hasItem("formblatt17V") ||
      a.hasItem("formblatt17VForged") ||
      a.hasFlag("duelEndgameWon") ||
      a.hasFlag("gotB3Ration") ||
      a.hasFlag("refusedB3Favor"),
    hints: [
      "Kowalk hat dir den Weg erklärt. Der nächste Schritt ist nicht Vossbeck, sondern Brust — am rechten Tresen der Kantine 3602.",
      "Sprich Brust an und wähle „Trainingsfall“. Jeder Trainingsfall ergänzt dein Phrasenbuch — verlierst du, lernst du den Konter trotzdem (Brust nennt ihn dir selbst).",
      "Geh in die Kantine 3602, sprich Brust an, wähle „Trainingsfall“ und gewinn drei in Folge — Brust händigt dir dann Formblatt 17/V aus, mit dem dich Vossbeck in 3603 annimmt.",
    ],
  },
  {
    id: "act1.vossbeckEndgame",
    title: "Endduell gegen Vossbeck",
    priority: 52,
    isActive: (a) =>
      a.hasItem("formblatt17V") || a.hasItem("formblatt17VForged"),
    isResolved: (a) =>
      a.hasFlag("duelEndgameWon") ||
      a.hasFlag("vossbeckGaveCode") ||
      a.hasFlag("calledForCode"),
    hints: [
      "Vossbeck sitzt nebenan in der Kantinenverwaltung — Tür 3603 im Korridor 36, direkt neben der Kantine. Mit dem Formblatt 17/V in der Hand nimmt er dich an.",
      "Drei Runden, zwei Treffer. Bei Sieg legt Vossbeck den Tagescode direkt in dein Terminal-Postfach.",
      "Vossbecks Phrasen sind neu formuliert, treffen aber dieselben Muster wie Brusts (Tradition, Stapel-Bluff, Vorgesetzten-Drohung). Die Konter aus dem Training passen sinngemäß — wer dort fleißig war, hat sie im Phrasenbuch.",
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // AKT II — kritischer Pfad (Eröffnung)
  // ════════════════════════════════════════════════════════════════
  {
    id: "act2.visitInsa",
    title: "Akt II — Insa in der Leitstelle besuchen",
    priority: 20,
    isActive: (a) => a.hasFlag("act2Started") && !a.hasFlag("insaAct2BriefingDone"),
    isResolved: (a) => a.hasFlag("insaAct2BriefingDone"),
    hints: [
      "Insa hat dich eingeladen — auf einem Zettel steht eine Türnummer.",
      "Tür 4602. Wohnetage. Nimm den Aufzug auf die 4 und geh in den Korridor 46.",
      "Geh in 2611 zur Wohnungstür, fahr mit dem Aufzug auf Etage 4, geh durch Korridor 46 zur Tür 4602 (gegenüber von Mira) und sprich Insa direkt an.",
    ],
  },
  {
    id: "act2.akte1978",
    title: "Akte 1978 — Marteaus verschwundenes Gutachten",
    priority: 21,
    isActive: (a) => a.hasFlag("marteauTrailOpened"),
    isResolved: () => false,
    hints: [
      "Insa hat dir eine alte Mappe in die Hand gedrückt. Der Inhalt fehlt — er liegt im Archiv 5710.",
      "Layards eigenes Ziel für Akt II: herausfinden, was Marteau 1978 über N. Sertl geschrieben hat. 5710 ist nicht ohne Vollmacht zu öffnen.",
      "Mehr Wege ergeben sich erst, wenn du in Akt II weitergespielt hast — die Akte ist dein roter Faden, kein einzelner Klick.",
    ],
  },

  // ── Optional: Mira (Vertrauenspfad) ──────────────────────────────
  {
    id: "act1.miraTrust",
    title: "Miras Vertrauen gewinnen (optional)",
    priority: 60,
    isActive: (a) => a.hasFlag("metMira"),
    isResolved: (a) =>
      a.hasFlag("miraTrustEarned") || a.hasFlag("miraTrustWithheld"),
    hints: [
      "Mira testet dich, ohne es zu sagen. Es geht weniger darum, was du tust, sondern was du dabei abschaltest.",
      "Sie hat dir ein Manifest dagelassen. Lies es — und überlege, was es bedeuten würde, das Schmerz-Radio bewusst stummzuschalten.",
      "Lies Miras Manifest in deinem Inventar, schalte das Radio im Radio-Panel aus, lass es mindestens eine Minute aus — und sprich Mira danach in 4601 erneut an. Erst das Gespräch entscheidet die Probe.",
    ],
  },

  // ── Optional: Schmerz-Radio-Erweiterung ──────────────────────────
  {
    id: "act1.hiddenFrequency",
    title: "Wartungs-Funkgerät 5610 — versteckte Frequenz (optional)",
    priority: 70,
    isActive: (a) => a.hasFlag("sawWartungsFunk5610"),
    isResolved: (a) => a.hasFlag("hiddenFrequencyFound"),
    hints: [
      "Das alte Wartungs-Funkgerät im Serverraum 5610 reagiert nicht auf eine Frequenz, die auf der Skala steht. Du brauchst Vorwissen aus mehreren Quellen.",
      "Bodo (2612) weiß, in welchem Bereich der Wartungs-Träger liegt. Helka (2610) kennt die genaue Stelle. Mikael (E71) bestätigt, wie sie klingt. Außerdem brauchst du den Bernstein-Resonator zum Feintunen.",
      "Sprich Bodo und Helka beim Smalltalk auf Trägersignale/Frequenzen an, geh zurück in den Serverraum 5610, öffne dort dein Schmerz-Radio und stelle die Frequenz exakt auf 102,7 MHz.",
    ],
  },
  {
    id: "act1.miraAmplifier",
    title: "Miras Verstärker-Antenne (optional)",
    priority: 71,
    isActive: (a) => a.hasFlag("miraAskedAmplifier"),
    isResolved: (a) => a.hasFlag("miraSentAnger"),
    hints: [
      "Mira will Wut auf das Trauer-Band drücken. Allein schafft ihr Sender das nicht — sie braucht eine Verstärker-Antenne, und du hast bereits ein zentrales Bauteil dafür.",
      "Du brauchst zwei Sachen: deinen Bernstein-Resonator (Tuning-Kristall) und ein Stück Antennen-Draht. Den Draht findest du hinter dem alten Wartungs-Funk im Serverraum 5610 — wenn du dort die richtige Frequenz triffst.",
      "Kombiniere im Inventar Tuning-Kristall + Antennen-Draht zur Verstärker-Antenne, gib sie Mira in 4601, öffne dann dein Schmerz-Radio bei ihr und halte die Frequenz mindestens fünf Sekunden bei 104,0 MHz (±0,1).",
    ],
  },
];

/**
 * Liefert alle gerade offenen Quests, sortiert nach `priority` (aufsteigend).
 */
export function getActiveHints(api: GameApi): HintQuest[] {
  return HINT_QUESTS.filter((q) => open(q.isActive(api), q.isResolved(api))).sort(
    (a, b) => a.priority - b.priority,
  );
}

/**
 * Persistenz-Schlüssel der enthüllten Hint-Stufen — identisch zum Prefix
 * im HelpOverlay. Liegt hier, damit andere Module (Ending, Cutscenes) den
 * Verbrauch zählen können, ohne die UI zu importieren.
 */
export const HINT_STATE_PREFIX = "hint:";

/**
 * Summiert über alle Quests, wie viele Tipp-Stufen der Spieler insgesamt
 * enthüllt hat. Jede gelesene Stufe (1, 2 oder 3) zählt einzeln, also kann
 * der Wert pro Quest zwischen 0 und 3 liegen. Quests, die nie geöffnet
 * wurden, zählen 0.
 *
 * Liest aus `sessionStorage`, daher pro Browser-Tab/Session. Reload mit
 * geladenem Spielstand behält den Stand; ein vollständiger Neustart
 * (anderes Tab, geleerte Session) beginnt bei 0.
 */
export function getHintsUsedCount(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (const quest of HINT_QUESTS) {
    const raw = window.sessionStorage.getItem(HINT_STATE_PREFIX + quest.id);
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) continue;
    total += Math.min(n, quest.hints.length);
  }
  return total;
}

/**
 * UI-Texte für das Tipps-Tab. Zentral, damit später in einem Schritt
 * übersetzt werden kann.
 */
export const HINTS_UI_TEXT = {
  tabHints: "Tipps",
  tabCheatsheet: "Spickzettel",
  spoilerWarning:
    "Achtung: Die folgenden Hinweise enthalten Lösungsschritte. Lies sie nur, wenn du wirklich nicht weiterkommst.",
  noOpenQuests:
    "Du hast gerade keine offene Aufgabe, zu der ich dir einen Tipp geben könnte. Schau dich um, sprich mit Leuten und lies das Handbuch.",
  questPickerLabel: "Aktuelle Aufgabe",
  hintLevelLabel: (level: 1 | 2 | 3) =>
    level === 1 ? "Hinweis 1 — Andeutung"
    : level === 2 ? "Hinweis 2 — Richtung"
    : "Hinweis 3 — Lösung",
  revealNext: "Nächsten Tipp anzeigen",
  allRevealed: "Du hast alle drei Tipps zu dieser Aufgabe gesehen.",
  reset: "Tipps zurücksetzen",
  introHint:
    "Wähle eine Aufgabe und enthülle Schritt für Schritt mehr — nur so weit du musst.",
  /** Wird in Akt-Übergängen / Endscreen angezeigt. */
  hintsUsedSummary: (n: number) =>
    n === 0
      ? "Tipps verwendet: keine."
      : n === 1
        ? "Tipps verwendet: 1."
        : `Tipps verwendet: ${n}.`,
};
