import type { DialogTree } from "../types";

export const cafeteriaDialogs: Record<string, DialogTree> = {
  cafeteriaKowalk: {
    id: "cafeteriaKowalk",
    start: "k0",
    lines: {
      k0: {
        id: "k0",
        speaker: "KOWALK",
        text: "Worag, E67, 2611. — Steht in der Liste. Was brauchen Sie?",
        subtext:
          "Sie hat die Liste nicht angesehen. Sie kennt die Leute auf E67.",
        choices: [
          {
            // Notausgang nach drei Niederlagen bei Vossbeck — Kowalk
            // tritt von sich aus an Layard heran, wenn er noch nicht
            // mit ihr darüber gesprochen hat.
            text: "[ Frau Kowalk … wegen 4317-K. Ich habe Vossbeck nicht geschlagen. ]",
            next: "kForge1",
            requires: ["duelEndgameLost", "insaGaveTransferTask"],
            hiddenWhen: ["kowalkOfferedForgery", "usedForgeryRoute"],
          },
          {
            // Hilfe nochmal hören, falls der Spieler aus dem Dialog raus ist.
            text: "[ Wegen der Quittung 4317-K. Wie kommen wir da raus? ]",
            next: "kForgeRecap",
            requires: ["kowalkOfferedForgery"],
            hiddenWhen: ["usedForgeryRoute"],
          },
          {
            text: "Ich habe eine Vollmacht. Vier-Drei-Eins-Sieben.",
            next: "kAuth1",
            requires: ["gotB3Authorization"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            text: "[ Insas Auftrag ] Insa hat mich geschickt. Quittung 4317-K — Transferbogen für Ihre Tochter.",
            next: "kInsa1",
            requires: ["insaGaveTransferTask"],
            hiddenWhen: ["gotTillaTransferInfo"],
          },
          {
            // Recap-Choice: Kowalk nimmt Layard die Last, sich den Pfad zu merken.
            text: "Was war nochmal der Weg?",
            next: "kRecap",
            requires: ["knowsVossbeckPath"],
            hiddenWhen: ["vossbeckSummoned", "gotB3Ration"],
          },
          {
            text: "Ich wollte mich nur umsehen.",
            next: "kSmall1",
          },
          {
            text: "Sie streiten ständig über die Hygieneordnung.",
            next: "kHyg1",
          },
          {
            text: "Ihre Tochter — Sie haben sie vorhin erwähnt.",
            next: "kDaughter1",
            requires: ["metPhilippe"],
            hiddenWhen: ["kowalkToldHerDaughter"],
          },
          {
            text: "[ Beenden ]",
            next: "kBye",
          },
        ],
      },
      kSmall1: {
        id: "kSmall1",
        speaker: "KOWALK",
        text: "Umsehen ist nicht verboten. Mitnehmen schon.",
        next: "k0",
      },
      kHyg1: {
        id: "kHyg1",
        speaker: "KOWALK",
        text: "Brust ist neu. Brust glaubt, was im neuesten Aushang steht. Ich halte mich an das, was funktioniert. Manchmal überschneidet sich das. Manchmal nicht.",
        next: "kHyg2",
      },
      kHyg2: {
        id: "kHyg2",
        speaker: "KOWALK",
        text: "Wir streiten nicht über Hygiene, Worag. Wir streiten darüber, wer nachher schuld ist.",
        next: "k0",
      },
      kDaughter1: {
        id: "kDaughter1",
        speaker: "KOWALK",
        text: "Tilla. Ja. War zwei Jahre bei Resonanz-Hygiene. Ist letztes Frühjahr ohne Erklärung gegangen.",
        next: "kDaughter2",
      },
      kDaughter2: {
        id: "kDaughter2",
        speaker: "KOWALK",
        text: "Sie isst seitdem keine B2. Nur noch B3. Sagt, sie braucht was, das schmeckt. Klingt blöd, ich weiß.",
        next: "kDaughter3",
      },
      kDaughter3: {
        id: "kDaughter3",
        speaker: "KOWALK",
        text: "Vergessen Sie das wieder, ja? Ich rede sonst nicht über sowas.",
        choices: [
          {
            text: "Verstanden.",
            action: (api) => api.setFlag("kowalkToldHerDaughter"),
            next: "k0",
          },
        ],
      },
      // ── Insa-Auftrag — Brücke 4317-K ↔ Marteau (Philippe) ─────
      kInsa1: {
        id: "kInsa1",
        speaker: "KOWALK",
        text: "4317-K.",
        subtext: "Sie wird einen Moment still. Wischt mit dem Tuch über den Tresen, obwohl der Tresen sauber ist.",
        next: "kInsa2",
      },
      kInsa2: {
        id: "kInsa2",
        speaker: "KOWALK",
        text: "Das ist ihre alte Aktennummer. Schicht A. Damals haben sie Nummern nicht doppelt vergeben — sie haben Buchstaben drangehängt. Tilla war 4317-K. Marteau war 4317. Lischke war 4317-L. Drei, vier andere noch.",
        next: "kInsa3",
      },
      kInsa3: {
        id: "kInsa3",
        speaker: "KOWALK",
        text: "Heute ist Tilla die Einzige aus der Liste, die noch eine offene Akte hat. — Außer Marteau. Den haben sie nie geschlossen. Und der lebt noch hier.",
        subtext: "Sie sagt »Marteau« mit der Selbstverständlichkeit von jemandem, der den Namen seit zwanzig Jahren kennt.",
        choices: [
          {
            text: "[ Marteau — das ist Philippe? Mein Nachbar? ]",
            requires: ["metPhilippe"],
            next: "kInsa3b",
          },
          {
            text: "Was muss ich für die Quittung tun?",
            next: "kInsa4",
          },
        ],
      },
      kInsa3b: {
        id: "kInsa3b",
        speaker: "KOWALK",
        text: "Philippe Marteau, ja. 2613. — Er war damals das Pendant auf der Männer-Liste. Wenn er Ihnen jemals eine 4317 in die Hand drückt: das ist nicht zufällig, das ist die alte Schicht-A-Akte. Er weiß genau, was die Nummer heißt.",
        subtext: "Sie schaut Layard kurz direkt an. Etwas hängt zwischen ihnen, das sie nicht ausspricht.",
        next: "kInsa4",
      },
      kInsa4: {
        id: "kInsa4",
        speaker: "KOWALK",
        text: "Sie brauchen einen Quittungsblanko, Schicht B. Tragen 4317-K ein, gegenzeichnen, ans linke Pneumatikrohr — Ziel E70-K. Antwort kommt zurück: Transferbogen, Bewohnernummer, Heim. Ich darf das selber nicht abschicken. Aushang. Aber Sie können.",
        subtext: "Sie tippt zweimal mit dem Finger auf den Tresen. So lautlos, dass Brust nichts hört.",
        next: "kInsa5",
      },
      kInsa5: {
        id: "kInsa5",
        speaker: "KOWALK",
        text: "Aber — und das ist die Bedingung, Worag — E70-K nimmt eine 4317-K nur an, wenn der Stamm-Vorgang 4317 frisch gegengezeichnet vorliegt. Ohne den landet Ihre Quittung im Aushang. Das wird sie sehen, ohne hinzusehen.",
        subtext: "Sie sagt »ohne hinzusehen« mit der Müdigkeit von jemandem, der das hundertmal erlebt hat.",
        next: "kInsa6",
      },
      kInsa6: {
        id: "kInsa6",
        speaker: "KOWALK",
        text: "Heißt für Sie: Sie brauchen jemanden, der die 4317 jetzt freigibt. Vossbeck. Sitzt nebenan, Tür 3603, Kantinenverwaltung. Sonst läuft hier gar nichts.",
        next: "kInsa6b",
      },
      kInsa6b: {
        id: "kInsa6b",
        speaker: "KOWALK",
        text: "Keine Angst, Worag — Sie müssen sich das nicht alles merken. Vossbeck hat den Vorgang auf dem Tisch. Sie müssen nur zu ihm durchkommen.",
        subtext: "Sie sagt es, ohne den Tresen-Lappen aus der Hand zu legen. Es klingt, als hätte sie den Satz schon öfter zu jemandem gesagt.",
        next: "kInsa6c",
      },
      kInsa6c: {
        id: "kInsa6c",
        speaker: "KOWALK",
        text: "Und durchkommen heißt: erst Brust. Trainingsfall. Drei in Folge. Vossbeck nimmt nur Bewohner an, die paragraphenfest sind. — Den Rest mache ich von hier aus.",
        choices: [
          {
            text: "Verstanden. Ich rede mit Vossbeck.",
            action: (api) => {
              api.setFlag("gotTillaTransferInfo");
              api.setFlag("learnedMarteauPhilippeLink");
              api.setFlag("needsMarteauAuthForTilla");
              api.setFlag("knowsVossbeckPath");
            },
            next: "k0",
          },
        ],
      },
      // ── Notausgang nach drei verlorenen Versuchen bei Vossbeck ──
      // Kowalk hat das Duell vom Tresen aus mit angesehen. Sie tritt
      // einen halben Schritt vor, leise, abseits des Hochregals.
      kForge1: {
        id: "kForge1",
        speaker: "KOWALK",
        text: "Worag.",
        subtext: "Sie sagt es so leise, dass Brust am anderen Ende der Theke nicht aufschaut. Sie zieht ihn mit dem Blick einen halben Schritt zur Seite, weg von der Ausgabe.",
        next: "kForge2",
      },
      kForge2: {
        id: "kForge2",
        speaker: "KOWALK",
        text: "Sie haben es versucht. Dreimal. Das wird Vossbeck Ihnen nicht zum vierten Mal anhören. Vorgang 4317 ist für ihn geschlossen — und damit auch der Stamm für Tilla.",
        next: "kForge3",
      },
      kForge3: {
        id: "kForge3",
        speaker: "KOWALK",
        text: "Aber für eine 4317-K brauche ich seinen Stempel nicht selbst in der Hand. Ich brauche eine Quittung, die aussieht, als hätte sie ihn.",
        subtext: "Sie schaut nicht weg, als sie das sagt. Es ist keine Verschwörung. Es ist Routine, die einmal benannt wird.",
        next: "kForge4",
      },
      kForge4: {
        id: "kForge4",
        speaker: "KOWALK",
        text: "Sie brauchen drei Sachen. Erstens einen Quittungsblanko — nehmen Sie sich einen vom Block hier. Zweitens den Trockensiegel-Abdruck »Schicht A« von Philippes Vollmacht 4317. Bleistift drüber, Carbon-Papier — Sie werden's sehen.",
        next: "kForge5",
      },
      kForge5: {
        id: "kForge5",
        speaker: "KOWALK",
        text: "Und drittens das Original von Aushang sieben Punkt eins, 1991. Hängt in E71. Holen Sie das mit. Stegmann lässt das durchgehen, der weiß, was die Welt aushält.",
        next: "kForge6",
      },
      kForge6: {
        id: "kForge6",
        speaker: "KOWALK",
        text: "Wenn Sie alles haben: zusammensetzen — Bodos Terminal kann das, er hat noch die alten Vorlagen — und dann ans linke Pneumatikrohr. Ich frage nicht, wie sie zustande kam.",
        choices: [
          {
            text: "Verstanden. Danke, Frau Kowalk.",
            action: (api) => {
              api.setFlag("kowalkOfferedForgery");
            },
            next: "kBye",
          },
        ],
      },
      kForgeRecap: {
        id: "kForgeRecap",
        speaker: "KOWALK",
        text: "Quittungsblanko. Trockensiegel-Abdruck von Philippes 4317. Original Aushang 7.1 aus E71. Bei Bodo zusammensetzen. Linkes Rohr. — Mehr sage ich nicht, Worag.",
        end: true,
      },
      // Vollmacht-Pfad ──────────────────────────────────────
      kAuth1: {
        id: "kAuth1",
        speaker: "KOWALK",
        text: "4317. Marteau, Philippe. — Brust, was sagst du?",
        next: "kAuth2",
      },
      kAuth2: {
        id: "kAuth2",
        speaker: "BRUST",
        text: "Vollmacht 4317 ist von Schicht A gegengezeichnet. Heute ist Schicht B. Ich kann das nicht freigeben.",
        next: "kAuth3",
      },
      kAuth3: {
        id: "kAuth3",
        speaker: "KOWALK",
        text: "Brust.",
        next: "kAuth4",
      },
      kAuth4: {
        id: "kAuth4",
        speaker: "BRUST",
        text: "Es steht im Aushang.",
        next: "kAuth5",
      },
      kAuth5: {
        id: "kAuth5",
        speaker: "KOWALK",
        text: "Welcher.",
        subtext: "Es ist keine Frage.",
        next: "kAuth6",
      },
      kAuth6: {
        id: "kAuth6",
        speaker: "KOWALK",
        text: "Worag. Hier kommen Sie an mir nicht vorbei — und an Brust auch nicht. Nicht über die Theke.",
        next: "kAuth7",
      },
      kAuth7: {
        id: "kAuth7",
        speaker: "KOWALK",
        text: "Brust hat das vor zwei Wochen weiterdelegiert. Bei der Vollmacht 4317 entscheidet jetzt Oberinspektor Vossbeck. Sitzt nebenan in 3603, Kantinenverwaltung. Mit Ihm reden — nicht mit uns.",
        subtext: "Sie sagt »Vossbeck« mit der Vorsicht von jemandem, der den Namen schon einmal verloren hat.",
        next: "kAuth8",
      },
      kAuth8: {
        id: "kAuth8",
        speaker: "KOWALK",
        text: "Aber Vossbeck redet nur mit Leuten, die Paragraphen können. Brust trainiert die Bewohner manchmal — fiktive Kantinenfälle. Wer ihn dreimal in Folge schlägt, gilt als satisfaktionsfähig. Wer das nicht ist, läuft bei Vossbeck gegen eine Wand.",
        choices: [
          {
            text: "Verstanden. Ich übe mit Brust.",
            next: "k0",
            action: (api) => api.setFlag("knowsVossbeckPath"),
          },
          {
            text: "Vergessen Sie’s. Komme später wieder.",
            next: "kAuthLater",
            action: (api) => api.setFlag("knowsVossbeckPath"),
          },
        ],
      },
      // Lösungsweg A — Kowalk handelt unter der Theke
      kSideA1: {
        id: "kSideA1",
        speaker: "KOWALK",
        text: "Marteau. — Marteau wohnt neben der Klopfwand. Ich weiß.",
        subtext: "Sie hat die Vollmacht halb hochgehoben und tippt mit dem Finger auf die Unterschrift, bevor sie den Namen ausspricht.",
        next: "kSideA2",
      },
      kSideA2: {
        id: "kSideA2",
        speaker: "KOWALK",
        text: "Brust, mach mir die Liste fertig für E70. Ich übergebe Worag noch einen Restposten aus dem Vortag.",
        next: "kSideA3",
      },
      kSideA3: {
        id: "kSideA3",
        speaker: "BRUST",
        text: "Restposten sind im Inventur—",
        next: "kSideA4",
      },
      kSideA4: {
        id: "kSideA4",
        speaker: "KOWALK",
        text: "E70-Liste. Brust.",
        subtext: "Brust geht. Sehr gerade.",
        next: "kSideA5",
      },
      kSideA5: {
        id: "kSideA5",
        speaker: "KOWALK",
        text: "Hier. Eine Dose. Sie haben sie nie gesehen, und ich habe sie nie gegeben. Bringen Sie die hoch und öffnen Sie sie nicht im Korridor.",
        choices: [
          {
            text: "[ Dose annehmen ]",
            action: (api) => {
              api.setFlag("kowalkSidedWithLayard");
              api.setFlag("gotB3Ration");
              api.addItem({
                id: "b3Ration",
                name: "B3-Ration",
                description:
                  "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Auf der Bodenseite mit Bleistift gekritzelt: »Marteau«. Frau Kowalk hat sie unter der Theke hervorgeholt, ohne dass Brust es sah.",
              });
            },
            next: "kSideA6",
          },
        ],
      },
      kSideA6: {
        id: "kSideA6",
        speaker: "KOWALK",
        text: "Und Worag — wenn Sie Marteau sehen: ich frage nicht, was er hat. Aber sagen Sie ihm, er soll runterkommen, wenn’s wieder geht. Tilla hat auch immer gesagt, sie kann nicht. Bis sie nicht mehr konnte.",
        choices: [{ text: "[ Beenden ]", next: "kBye" }],
      },
      // Lösungsweg B — Brust kapituliert vor seiner eigenen Logik
      kSideB1: {
        id: "kSideB1",
        speaker: "BRUST",
        text: "Das … das ist die alte Ausgabe. Die ist offiziell …",
        next: "kSideB2",
      },
      kSideB2: {
        id: "kSideB2",
        speaker: "BRUST",
        text: "… nicht widerrufen. Korrekt. Punkt sieben Eins ist nicht widerrufen. Nur überlagert.",
        next: "kSideB3",
      },
      kSideB3: {
        id: "kSideB3",
        speaker: "KOWALK",
        text: "Überlagert ist nicht widerrufen, Brust.",
        next: "kSideB4",
      },
      kSideB4: {
        id: "kSideB4",
        speaker: "BRUST",
        text: "Bei gegengezeichneten Vollmachten greift im Zweifel der jeweils ältere Aushang, sofern er nicht ausdrücklich—",
        next: "kSideB5",
      },
      kSideB5: {
        id: "kSideB5",
        speaker: "KOWALK",
        text: "— widerrufen wurde. Genau. — Brust, geben Sie ihm die B3.",
        next: "kSideB6",
      },
      kSideB6: {
        id: "kSideB6",
        speaker: "BRUST",
        text: "Bitte … bitte nehmen Sie die Ration. Quittung am Pneumatikrohr links abgeben. Danke.",
        subtext: "Er sieht Layard nicht an.",
        choices: [
          {
            text: "[ Dose annehmen ]",
            action: (api) => {
              api.setFlag("brustOutruled");
              api.setFlag("gotB3Ration");
              api.addItem({
                id: "b3Ration",
                name: "B3-Ration",
                description:
                  "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Brust hat sie freigegeben, weil sein eigenes Regelwerk ihn dazu zwang. Er hat dabei nicht aufgeschaut.",
              });
            },
            next: "kBye",
          },
        ],
      },
      kAuthLater: {
        id: "kAuthLater",
        speaker: "KOWALK",
        text: "Tun Sie das. Aber heute Abend ist Schichtwechsel.",
        next: "k0",
      },
      kRecap: {
        id: "kRecap",
        speaker: "KOWALK",
        text: "Brust. Trainingsfall. Drei in Folge. Dann Vossbeck. — Den Rest mache ich von hier aus, Worag.",
        subtext: "Sie sagt es ruhig. Wie jemand, der einen Tresen schon viele Bewohner überstehen sehen hat.",
        next: "k0",
      },
      kBye: {
        id: "kBye",
        speaker: "KOWALK",
        text: "Bis dann, Worag.",
        end: true,
      },
    },
  },
  cafeteriaBrust: {
    id: "cafeteriaBrust",
    start: "b0",
    lines: {
      b0: {
        id: "b0",
        speaker: "BRUST",
        text: "Bewohner Worag. Identität gegengezeichnet. Anliegen?",
        subtext: "Er notiert die Frage, bevor sie beantwortet ist.",
        choices: [
          {
            // Kowalk hat Layard hergeschickt — Brust kennt den Pfad.
            text: "Frau Kowalk hat mich geschickt. Trainingsfall.",
            next: "bDuelOffer",
            requires: ["knowsVossbeckPath"],
            hiddenWhen: ["duelStarted", "vossbeckSummoned", "gotB3Ration"],
          },
          {
            text: "Ich habe eine Vollmacht. 4317.",
            next: "bAuth1",
            requires: ["gotB3Authorization"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            // Trainingsfall — fiktive Kantinenfälle, lehrt Paragraphen.
            // Bleibt verfügbar, bis Layard das Endduell gewonnen hat.
            text: "Ich würde mit Ihnen einen Trainingsfall durchgehen.",
            next: "bDuelOffer",
            // Erst sichtbar, sobald Layard weiß, warum er paragraphenfest
            // werden muss (Vossbeck-Pfad über Kowalk/Brust erfahren).
            requires: ["knowsVossbeckPath"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            // Erst sichtbar nach 3-Streak — Brust verweist explizit auf Vossbeck.
            text: "Ich glaube, ich bin bereit für Vossbeck.",
            next: "bVossbeckHint",
            requires: ["vossbeckSummoned"],
            hiddenWhen: ["gotB3Ration"],
          },
          {
            text: "Welcher Aushang gilt jetzt eigentlich?",
            next: "bHyg1",
          },
          {
            text: "Wofür ist das Pneumatikrohr?",
            next: "bTube1",
          },
          {
            text: "[ Beenden ]",
            next: "bBye",
          },
        ],
      },
      bAuth1: {
        id: "bAuth1",
        speaker: "BRUST",
        text: "4317 — Marteau. Schicht A gegengezeichnet. Heute Schicht B. Aushang vier Punkt zwei. Ich kann das nicht entscheiden.",
        next: "bAuth2",
      },
      bAuth2: {
        id: "bAuth2",
        speaker: "BRUST",
        text: "Vorgang Vollmacht 4317 ist seit zwei Wochen Vossbeck-Sache. Bewohnervertretung E67, Bürokratiemeisterschaft. Sitzt nebenan in 3603 — Kantinenverwaltung.",
        next: "bAuth3",
      },
      bAuth3: {
        id: "bAuth3",
        speaker: "BRUST",
        text: "Vossbeck nimmt aber nur Vorgänge von Bewohnern an, die paragraphenfest sind. Wenn Sie wollen — wir können vorher einen Trainingsfall durchgehen. Drei in Folge bei mir, dann sind Sie für Vossbeck satisfaktionsfähig.",
        choices: [
          {
            text: "Trainingsfall, ja.",
            next: "bDuelOffer",
            action: (api) => api.setFlag("knowsVossbeckPath"),
          },
          {
            text: "Verstanden.",
            next: "b0",
            action: (api) => api.setFlag("knowsVossbeckPath"),
          },
        ],
      },
      bDuelOffer: {
        id: "bDuelOffer",
        speaker: "BRUST",
        text: "Trainingsfall. Fiktive Konstellation aus dem Kantinenbetrieb. Ich eröffne mit einem Paragraphen, Sie kontern. Zwei Treffer mehr als Fehler — Sie haben gewonnen. Drei Fehler — Trainingsfall verloren.",
        next: "bDuelOffer2",
      },
      bDuelOffer2: {
        id: "bDuelOffer2",
        speaker: "BRUST",
        text: "Was Sie aus jedem Fall mitnehmen, landet in Ihrem Notizbuch. Drei gewonnene Trainingsfälle in Folge — und Vossbeck nimmt Sie ernst.",
        choices: [
          {
            text: "[ Trainingsfall beginnen ]",
            action: (api) => {
              api.setFlag("duelOffered");
              api.setFlag("duelStarted");
              api.openBureaucracyDuel("training");
            },
            // Dialog beendet sich; das Overlay übernimmt.
          },
          {
            text: "Lieber nicht. Ich überlege es mir.",
            next: "b0",
          },
        ],
      },
      bDuelRetry: {
        id: "bDuelRetry",
        speaker: "BRUST",
        text: "Bewohner Worag. Sie sind hartnäckig. (Pause.) Gut. Neuer Trainingsfall.",
        choices: [
          {
            text: "[ Trainingsfall beginnen ]",
            action: (api) => {
              api.setFlag("duelStarted");
              api.openBureaucracyDuel("training");
            },
          },
          {
            text: "Ich überlege es mir.",
            next: "b0",
          },
        ],
      },
      bVossbeckHint: {
        id: "bVossbeckHint",
        speaker: "BRUST",
        text: "Drei in Folge. Korrekt notiert. — Direkt nebenan, Tür 3603, Kantinenverwaltung. Dahinter sitzt Vossbeck. Er weiß bereits, dass Sie kommen. Klopfen Sie nicht. Er hasst das.",
        next: "b0",
      },
      bHyg1: {
        id: "bHyg1",
        speaker: "BRUST",
        text: "Aushang vier Punkt zwei vom 14. März 1996. Eindeutig. Frau Kowalk verweist auf Aushang sieben Punkt eins, von 91. Der ist überschrieben.",
        next: "bHyg2",
      },
      bHyg2: {
        id: "bHyg2",
        speaker: "BRUST",
        text: "Bei mehrfacher Überlagerung gilt der jüngere, sofern der ältere ausdrücklich widerrufen wurde. Das Wort »widerrufen« kommt im neuen Aushang nicht vor. Das ist … unschön.",
        subtext: "Das ist das erste Mal, dass er die Stimme leiser macht.",
        next: "b0",
      },
      bTube1: {
        id: "bTube1",
        speaker: "BRUST",
        text: "Pneumatik nach E70. Quittungen, Schichtprotokolle, Anträge. Eingehende Sendungen sehr selten.",
        next: "bTube2",
      },
      bTube2: {
        id: "bTube2",
        speaker: "BRUST",
        text: "Heute morgen drei Sendungen ausgegangen. Eingehend: keine. Das Licht oben blinkt seit gestern. Frau Kowalk sagt, das blinkt manchmal einfach.",
        next: "b0",
      },
      bBye: {
        id: "bBye",
        speaker: "BRUST",
        text: "Auf Wiedersehen, Bewohner Worag.",
        end: true,
      },
    },
  },
  cafeteriaVossbeck: {
    id: "cafeteriaVossbeck",
    start: "v0",
    lines: {
      v0: {
        id: "v0",
        speaker: "SYSTEM",
        text: "[ Hinter der Tür 3603: ein schmales Zimmer, kaum drei Schritte breit. Ein Mann in dunklem Kittel, etwa fünfzig, kein Namensschild. Aktendeckel aufgeschlagen. Bleistift senkrecht in der Hand. ]",
        hiddenWhen: ["metVossbeck"],
        next: "v1",
      },
      v1: {
        id: "v1",
        speaker: "VOSSBECK",
        text: "Oberinspektor Vossbeck. Bewohnervertretung E67, Bürokratiemeisterschaft.",
        subtext: "Er sagt es, ohne den Kopf zu heben. Als läse er den Satz aus der Akte ab.",
        hiddenWhen: ["metVossbeck"],
        next: "v2",
      },
      v2: {
        id: "v2",
        speaker: "VOSSBECK",
        text: "Bewohner Worag. Vorgang Vollmacht 4317. Drei Trainingssiege bei Brust — dokumentiert, gegengezeichnet.",
        hiddenWhen: ["metVossbeck"],
        next: "v3",
      },
      v3: {
        id: "v3",
        speaker: "SYSTEM",
        text: "[ Vossbeck legt den Aktendeckel auf den Tisch. Schaut zum ersten Mal hoch. ]",
        hiddenWhen: ["metVossbeck"],
        next: "v4",
      },
      vReturn: {
        id: "vReturn",
        speaker: "SYSTEM",
        text: "[ Vossbeck schaut auf, ohne den Bleistift abzulegen. ]",
        requires: ["metVossbeck"],
        hiddenWhen: ["duelEndgameWon"],
        next: "v4",
      },
      v4: {
        id: "v4",
        speaker: "VOSSBECK",
        text: "Worag. Sie wollen Vorgang Vollmacht 4317 verhandelt sehen.",
        hiddenWhen: ["duelEndgameWon"],
        next: "v5",
      },
      v5: {
        id: "v5",
        speaker: "VOSSBECK",
        text: "Drei Runden. Drei Treffer in Folge — und ich gebe die Ration frei. Drei Fehler — und der Vorgang ist abschlägig beschieden. Permanent.",
        hiddenWhen: ["duelEndgameWon"],
        next: "v6",
      },
      v6: {
        id: "v6",
        speaker: "VOSSBECK",
        text: "Ich verwende ausschließlich Paragraphen, die in Ihrem Notizbuch stehen sollten. Wenn nicht — ist das Ihr Versäumnis.",
        hiddenWhen: ["duelEndgameWon"],
        choices: [
          {
            text: "[ Endduell beginnen ]",
            action: (api) => {
              api.setFlag("metVossbeck");
              api.openBureaucracyDuel("endgame");
            },
          },
          {
            text: "Ich brauche noch einen Moment.",
            action: (api) => api.setFlag("metVossbeck"),
            next: "vWait",
          },
        ],
      },
      vWait: {
        id: "vWait",
        speaker: "VOSSBECK",
        text: "Nehmen Sie sich. Ich gehe nirgendwo hin.",
        end: true,
      },
      // Nach gewonnenem Endduell — sehr knapper Smalltalk.
      vAfter: {
        id: "vAfter",
        speaker: "VOSSBECK",
        text: "Worag. Vorgang abgeschlossen. Ich notiere Sie für Folgetermine.",
        requires: ["duelEndgameWon"],
        end: true,
      },
    },
  },
  // Vossbeck winkt jeden Bewohner ab, der sich nicht vorher bei Brust
  // qualifiziert hat — Tür 3603 ist offen, der Vorgang aber nicht.
  // Solange Layard noch keinen freigegebenen Vorgang hat (drei Trainingssiege
  // bei Brust → vossbeckSummoned), winkt Vossbeck ihn ohne Federlesens ab.
  vossbeckUnready: {
    id: "vossbeckUnready",
    start: "u0",
    lines: {
      u0: {
        id: "u0",
        speaker: "SYSTEM",
        text: "[ Vossbeck blättert weiter, ohne den Bleistift abzulegen. ]",
        next: "u1",
      },
      u1: {
        id: "u1",
        speaker: "VOSSBECK",
        text: "Fallnummer.",
        next: "u2",
      },
      u2: {
        id: "u2",
        speaker: "VOSSBECK",
        text: "Vier-Drei-Eins-Sieben. Vorgang Vollmacht 4317. Bewohner Worag. — Habe ich auf dem Tisch.",
        subtext: "Er sagt es, ohne aufzusehen. Der Bleistift bleibt senkrecht.",
        next: "u3",
      },
      u3: {
        id: "u3",
        speaker: "VOSSBECK",
        text: "Trainingssiege bei Herrn Brust: keine dokumentiert. Ich verhandle nicht mit Bewohnern, die nicht satisfaktionsfähig sind.",
        next: "u4",
      },
      u4: {
        id: "u4",
        speaker: "VOSSBECK",
        text: "Drei in Folge bei Brust. Dann reden wir. Vorher nicht. — Tür ist da.",
        end: true,
      },
    },
  },
  // Layard kennt den Vorgang noch gar nicht — Vossbeck schickt ihn weg,
  // ohne überhaupt aufzuschauen.
  vossbeckNoBusiness: {
    id: "vossbeckNoBusiness",
    start: "n0",
    lines: {
      n0: {
        id: "n0",
        speaker: "SYSTEM",
        text: "[ Vossbeck blättert weiter, ohne den Bleistift abzulegen. ]",
        next: "n1",
      },
      n1: {
        id: "n1",
        speaker: "VOSSBECK",
        text: "Fallnummer?",
        next: "n2",
      },
      n2: {
        id: "n2",
        speaker: "VOSSBECK",
        text: "Sie haben keine. Was wollen Sie dann hier? Ich habe zu tun.",
        end: true,
      },
    },
  },
  tjarkSmalltalk: {
    id: "tjarkSmalltalk",
    start: "t0",
    onEnd: (api) => {
      api.setFlag("tjarkSmalltalkDone");
    },
    lines: {
      // Erstkontakt — vor der Charaktererschaffung
      t0: {
        id: "t0",
        speaker: "TJARK",
        text: "Du musst Layard sein. Setz dich. Ich bin Tjark — ich leite das hier.",
        hiddenWhen: ["dsaCharacterRolled"],
        next: "t1",
      },
      t1: {
        id: "t1",
        speaker: "TJARK",
        text: "Das hier ist meine kleine Runde. Yelva spielt eine Elfe, Brem einen Streuner. Wir brauchen wirklich noch einen Vierten — am liebsten einen Krieger, ehrlich gesagt. Aber bring her, was du willst.",
        hiddenWhen: ["dsaCharacterRolled"],
        next: "tHub",
      },
      // Wiedereintritt — Charakter steht schon
      tBack: {
        id: "tBack",
        speaker: "TJARK",
        text: "Schön, dass du wieder da bist, Layard. Wir warten nur noch auf dich. Soll ich nochmal was erklären, oder sollen wir loslegen?",
        requires: ["dsaCharacterRolled"],
        next: "tHub",
      },
      // Hub mit allen Smalltalk-Optionen
      tHub: {
        id: "tHub",
        speaker: "TJARK",
        text: "Was willst du wissen?",
        choices: [
          { text: "Was ist das hier eigentlich?", next: "tWhat", hiddenWhen: ["askedTjarkAboutDsa"] },
          { text: "Wer seid ihr drei?", next: "tWho", hiddenWhen: ["askedTjarkAboutGroup"] },
          { text: "Wie funktioniert das?", next: "tRules", hiddenWhen: ["askedTjarkAboutRules"] },
          { text: "Was ist der Plan heute?", next: "tPlan", hiddenWhen: ["askedTjarkAboutPlan"] },
          { text: "Lass uns spielen.", next: "tPlay" },
        ],
      },
      tWhat: {
        id: "tWhat",
        speaker: "TJARK",
        text: "„Das Schwarze Auge“. Zweite Edition. Schmidt-Spiele, vor zwei Jahren rausgekommen. Wir spielen in Aventurien — das ist ein Kontinent, kein Wohnkomplex. Götter, Magie, ein Haufen Würfel.",
        next: "tWhat2",
      },
      tWhat2: {
        id: "tWhat2",
        speaker: "TJARK",
        text: "Ich erzähle, ihr handelt. Wenn etwas schiefgehen kann, würfelt ihr. Wenn etwas klappt, war es entweder gut geplant oder ihr hattet Glück. Mehr ist es eigentlich nicht.",
        choices: [
          { text: "Verstanden.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutDsa") },
        ],
      },
      tWho: {
        id: "tWho",
        speaker: "TJARK",
        text: "Yelva, links von dir, spielt seit ich das hier mache. Genau, präzise, manchmal eine Spur zu nüchtern. Ihre Elfe heißt Niamhuin und schießt besser als jeder Mensch, den ich kenne.",
        next: "tWho2",
      },
      tWho2: {
        id: "tWho2",
        speaker: "TJARK",
        text: "Brem ist neu. Drei Sitzungen jetzt. Spielt einen Streuner, weil er „mal jemanden ohne Regeln“ wollte. Ich versuche ihm beizubringen, dass auch Streuner Regeln haben.",
        next: "tWho3",
      },
      tWho3: {
        id: "tWho3",
        speaker: "TJARK",
        text: "Und ich bin der Spielleiter. Ich werfe Steine, Räuber und gelegentlich einen Drachen. Mein Job ist, dass ihr eine gute Geschichte erlebt. Nicht, dass ihr alle überlebt.",
        choices: [
          { text: "Beruhigend.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutGroup") },
        ],
      },
      tRules: {
        id: "tRules",
        speaker: "TJARK",
        text: "Sieben Eigenschaften: Mut, Klugheit, Charisma, Fingerfertigkeit, Gewandtheit, Intuition, Körperkraft. Du würfelst pro Eigenschaft 1W6 plus 7. Macht Werte zwischen acht und dreizehn.",
        next: "tRules2",
      },
      tRules2: {
        id: "tRules2",
        speaker: "TJARK",
        text: "Danach suchst du dir eine Klasse, deren Mindestwerte du erreichst. Krieger, Streuner, Magier, Elf, Zwerg, Gaukler, Thorwaler, Druide. Wenn nichts passt, wirfst du nochmal. Und nochmal, wenn du magst.",
        choices: [
          { text: "Klingt machbar.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutRules") },
        ],
      },
      tPlan: {
        id: "tPlan",
        speaker: "TJARK",
        text: "Heute: Anreise nach Phexcaer durch den Reichsforst. Unterwegs Übernachtung in einem Wirtshaus — ein Magister sucht dort Leute. Und dann eine alte Tempelruine. Hesindes Auge.",
        next: "tPlan2",
      },
      tPlan2: {
        id: "tPlan2",
        speaker: "TJARK",
        text: "Drei Akte, ein Abend. Wenn ihr euch nicht zu blöd anstellt, sind wir gegen Mitternacht durch. Wenn doch, eben morgen weiter.",
        choices: [
          { text: "Gut.", next: "tHub", action: (api) => api.setFlag("askedTjarkAboutPlan") },
        ],
      },
      tPlay: {
        id: "tPlay",
        speaker: "TJARK",
        text: "Dann wirf erstmal deine Eigenschaften. Setz dich auf den Stuhl, dann legen wir los.",
        requires: [],
        hiddenWhen: ["dsaCharacterRolled"],
        end: true,
      },
      tPlayGo: {
        id: "tPlayGo",
        speaker: "TJARK",
        text: "Gut. Dann: Vorhang auf.",
        requires: ["dsaCharacterRolled"],
        end: true,
      },
    },
  },
};
