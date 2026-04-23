import apartmentBg from "@/assets/scene-apartment.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2615Bg from "@/assets/scene-apt-2615.jpg";
import apt2612BgEmpty from "@/assets/scene-apt-2612.png";
import apt2612BgBodo from "@/assets/scene-apt-2612-bodo.png";
import sectorBg from "@/assets/scene-sector-door.jpg";
import e71LobbyBg from "@/assets/scene-e71-lobby.jpg";
import corridor15Bg from "@/assets/scene-corridor-15.jpg";
import room1534Bg from "@/assets/scene-room-1534.jpg";
import elevatorBg from "@/assets/scene-elevator.jpg";
import floor1LobbyBg from "@/assets/scene-floor1-lobby.jpg";
import passageBg from "@/assets/scene-passage.jpg";
import corridor36Bg from "@/assets/scene-corridor-36.jpg";
import corridor46Bg from "@/assets/scene-corridor-46.jpg";
import corridor56Bg from "@/assets/scene-corridor-56.jpg";
import miraSprite from "@/assets/npc-mira.png";
import philippeSprite from "@/assets/npc-philippe.png";
import type { Scene } from "./types";

export const scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro:
      "Layard Worag. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6 und dreh die Lautstärke voll auf.",
    hotspots: [
      {
        id: "radio",
        x: 0,
        y: 52,
        w: 14,
        h: 20,
        label: "Schmerz-Radio",
        onUse: (api) => api.openRadio(),
      },
      {
        id: "terminal",
        x: 12,
        y: 40,
        w: 22,
        h: 30,
        label: "CentralOS Terminal",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "phoneApt",
        x: 86,
        y: 32,
        w: 12,
        h: 28,
        label: "Telefon",
        // Only available after Layard saw the empty office on floor 3.
        requires: ["sawEmptyOffice"],
        hiddenWhen: ["calledForCode"],
        onUse: (api) => {
          if (!api.hasFlag("calledInsa2")) {
            api.setFlag("calledInsa2");
            api.startDialog("insa2a");
          } else if (!api.hasFlag("calledStegmann")) {
            // Spielerentscheidung merken: ohne report exit gilt als bewusst übersprungen.
            if (!api.hasFlag("reportedExit")) {
              api.setFlag("skippedExitReport");
            }
            api.setFlag("calledStegmann");
            api.startDialog("stegmann");
          } else if (!api.hasFlag("calledForCode")) {
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          }
        },
      },
      {
        id: "bed",
        x: 34,
        y: 50,
        w: 44,
        h: 30,
        label: "Bett",
        onUse: (api) =>
          api.showText([
            "Ungemacht. Wie immer.",
            "Schlaf ist B2-konform: ausreichend, geschmacklos.",
          ]),
      },
      {
        id: "b2",
        x: 12,
        y: 76,
        w: 22,
        h: 22,
        label: "B2-Ration",
        onUse: (api) =>
          api.showText([
            "Synthetische Nährpaste B2.",
            "„Vollständige Versorgung. Keine Reizüberflutung.“",
            "Sie schmeckt nach nichts. Das ist Absicht.",
            "Philippe, hat Layard gehört, schwöre auf B3. Wegen des Geschmacks.",
            "Geschmack. Layard kann sich nicht erinnern, wann er das letzte Mal etwas geschmeckt hat.",
          ]),
      },
      {
        id: "window",
        // Fenster mit grünem Schein, Bildmitte etwas nach rechts.
        x: 48,
        y: 18,
        w: 24,
        h: 34,
        label: "Fenster",
        onUse: (api) =>
          api.showText([
            "Hinter dem Fenster: derselbe Innenhof wie gestern.",
            "Auf dem Sims: die Solaranlage. Sie reicht für 48 Stunden Notstrom.",
            "Lange genug. So lange, hat noch nie etwas gedauert.",
          ]),
      },
      {
        id: "door",
        x: 86,
        y: 35,
        w: 12,
        h: 60,
        label: "Wohnungstür",
        onUse: (api) => {
          // Resonanz-Überlastung wurde ausgelöst (Radio @104,6),
          // Philippe steht beim ersten Heimkommen vor der Tür.
          if (api.hasFlag("doorbellRang") && !api.hasFlag("metPhilippe")) {
            // First open: meet Philippe at the door, then go with him to 2613
            api.setFlag("metPhilippe");
            api.startDialog("philippeAtDoor");
          } else {
            // Sonst einfach in den Korridor.
            api.goTo("hallway");
          }
        },
      },
    ],
  },

  // Philippe's own apartment (2613). Akt 1: das Klopfen aus der
  // Nachbarwohnung 2615 ist hier hörbar; Philippe steht daneben.
  // Nach den Sanitätern bleibt 2613 bewohnt — Layard kann jederzeit
  // zurückkommen und mit Philippe verschiedene Dialoge führen.
  apt2613: {
    id: "apt2613",
    background: apt2613Bg,
    title: "Wohnung 2613 — Philippe",
    intro:
      "Philippes Wohnung. Derselbe Grundriss wie bei Layard, etwas wärmer. Es riecht nach echtem Kaffee. An der Wand zur Nachbarwohnung 2615 ist das regelmäßige Klopfen zu hören.",
    hotspots: [
      {
        id: "philippeNpc",
        // Philippe steht rechts mit verschränkten Armen.
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        requires: ["knockingHeard"],
        // Nach dem ersten "Warten"-Klick verschwindet der Dialog-Hotspot.
        // Er kommt erst wieder, wenn Layard die Wohnung verlässt und neu
        // betritt (dann werden die Warte-Flags zurückgesetzt).
        hiddenWhen: ["paramedicsArrived", "wait2613Step1"],
        onUse: (api) => {
          if (!api.hasFlag("calledLeitstelle")) {
            api.setFlag("talkedPhilippe2613");
            api.startDialog("philippeIn2613");
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      // Nach den Sanitätern: Philippe bleibt in seiner Wohnung 2613.
      // Verschiedene Dialoge je nach Stand der Geschichte.
      {
        id: "philippeAfterNpc",
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        requires: ["paramedicsArrived"],
        onUse: (api) => {
          if (api.hasFlag("ending")) {
            api.startDialog("philippeSmalltalk");
          } else if (!api.hasFlag("talkedPhilippeAfter")) {
            api.setFlag("talkedPhilippeAfter");
            if (!api.hasFlag("protocolReceived")) {
              api.startDialog("philippeAfterBeforeProtocol");
            } else if (api.hasFlag("sawEmptyOffice")) {
              api.startDialog("philippeAfter");
            } else {
              api.startDialog("philippeAfterEarly");
            }
          } else if (api.hasFlag("protocolReceived")) {
            // Tür ist versiegelt → Philippe beginnt Layard auszufragen.
            // Fünf Sondierungs-Dialoge in fester Reihenfolge.
            if (!api.hasFlag("philippeProbe1")) {
              api.setFlag("philippeProbe1");
              api.startDialog("philippeProbe1");
            } else if (!api.hasFlag("philippeProbe2")) {
              api.setFlag("philippeProbe2");
              api.startDialog("philippeProbe2");
            } else if (!api.hasFlag("philippeProbe3")) {
              api.setFlag("philippeProbe3");
              api.startDialog("philippeProbe3");
            } else if (!api.hasFlag("philippeProbe4")) {
              api.setFlag("philippeProbe4");
              api.startDialog("philippeProbe4");
            } else if (!api.hasFlag("philippeProbe5")) {
              api.setFlag("philippeProbe5");
              api.startDialog("philippeProbe5");
            } else {
              api.startDialog("philippeSmalltalk");
            }
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      {
        id: "lampPhilippe",
        // Tischlampe rechts neben Philippe auf dem Nachttisch.
        x: 60,
        y: 38,
        w: 14,
        h: 24,
        label: "Lampe",
        requires: ["paramedicsArrived"],
        onUse: (api) =>
          api.showText([
            "Die einzige warme Lichtquelle in diesem Korridor.",
            "Philippe muss sie heimlich repariert haben.",
          ]),
      },
      {
        id: "wall",
        // Mittlere Betonwand zwischen Telefon und Philippe.
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand mit Klopfen (zur 2615)",
        hiddenWhen: ["doorBrokenOpen"],
        onUse: (api) => {
          api.setFlag("knockingHeard");
          api.showText([
            "Klopf. Klopf. Klopf.",
            "Regelmäßig. Aber nicht mechanisch.",
            "Layard legt die Hand an den Beton. Er fühlt es im Handballen,",
            "bevor er es im Ohr hört.",
            "„Hallo?! Jemand da?“ — Das Klopfen geht im selben Rhythmus weiter.",
          ]);
        },
      },
      // Nach Akt 1: ruhige Wand zur (jetzt versiegelten) 2615.
      {
        id: "wallAfter",
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand zur 2615 (still)",
        requires: ["doorBrokenOpen"],
        onUse: (api) =>
          api.showText([
            "Die Wand ist still. Zum ersten Mal seit Wochen, sagt Philippe.",
            "Trotzdem hält Layard kurz die Hand an den Beton.",
            "Nichts. Nur sein eigener Puls.",
          ]),
      },
      {
        id: "phone2613",
        // Beiger Bakelit-Wandapparat ganz links.
        x: 0,
        y: 18,
        w: 22,
        h: 55,
        label: "Telefon (Wandapparat)",
        requires: ["talkedPhilippe2613"],
        hiddenWhen: ["calledLeitstelle"],
        onUse: (api) => {
          api.setFlag("calledLeitstelle");
          api.startDialog("insa1");
        },
      },
      {
        id: "waitParamedics",
        x: 40,
        y: 75,
        w: 24,
        h: 18,
        label: "Warten",
        requires: ["calledLeitstelle"],
        hiddenWhen: ["paramedicsArrived"],
        onUse: (api) => {
          // Pro Besuch zwei Warte-Beats. Erst der zweite ruft die Sanitäter.
          if (!api.hasFlag("wait2613Step1")) {
            api.setFlag("wait2613Step1");
            api.showText([
              "Layard und Philippe warten. Das Klopfen aus 2615 hat sich",
              "kein einziges Mal verändert. Kein Tempo-Wechsel, keine Pause.",
              "Philippe schaut auf seine Uhr. Sagt nichts.",
            ]);
          } else if (!api.hasFlag("wait2613Step2")) {
            api.setFlag("wait2613Step2");
            api.showText([
              "Noch ein paar Minuten. Philippe stellt zwei Tassen auf den Tisch,",
              "trinkt aber nicht. Layard auch nicht.",
              "Im Korridor: Schritte. Gleichmäßig. Schwer.",
            ]);
          } else {
            // Sanitäter treffen ein.
            api.setFlag("paramedicsArrived");
            api.startDialog("paramedicsArrive");
          }
        },
      },
      {
        id: "exit2613",
        // Türrahmen ganz rechts (hinter Philippe).
        x: 94,
        y: 18,
        w: 6,
        h: 80,
        label: "In den Korridor",
        requires: ["doorBrokenOpen"],
        onUse: (api) => api.goTo("hallway"),
      },
    ],
  },

  // The neighbor's apartment, broken open by the paramedics.
  // The catatonic man stands inside, knocking against the wall.
  apt2615: {
    id: "apt2615",
    background: apt2615Bg,
    title: "Wohnung 2615 — Aufgebrochen",
    intro:
      "Die Tür hängt schief in den Angeln. Splitter auf dem Beton. Drinnen: gleicher Grundriss, kahler. Eine Lampe flackert. Und in der Mitte: er.",
    hotspots: [
      {
        id: "patient2615",
        // Älterer Mann sitzt rechts auf dem Boden, Rücken an der Wand.
        x: 62,
        y: 50,
        w: 26,
        h: 45,
        label: "Der Mann an der Wand",
        hiddenWhen: ["sawCatatonic"],
        onUse: (api) => {
          api.setFlag("sawCatatonic");
          api.showText([
            "Ein älterer Mann, ausgemergelt. Fahle Haut, graues Haar.",
            "Mitte sechzig, vielleicht älter. Schwer zu sagen.",
            "Er sitzt auf dem Boden, den Rücken an der Wand,",
            "und schlägt mit leblosem Gesicht rhythmisch mit der Faust dagegen.",
            "Die Sanitäter knien neben ihm. Sprechen ihn an.",
            "Er reagiert nicht. Er sieht sie nicht an.",
            "Er starrt apathisch ins Leere, an ihnen vorbei,",
            "irgendwohin, wo nichts ist.",
            "Layard nimmt seinen Mut zusammen und schaut ihm in die Augen.",
            "Er erwartet tote, glasige Augen.",
            "Stattdessen: grüne Augen. Eine seltsame Tiefe. Klarheit —",
            "die niemanden hier meint.",
            "Wie ein Portal in ein mystisches Universum.",
            "Layard wird das Bild nicht mehr loswerden.",
          ]);
        },
      },
      {
        id: "paramedicsHotspot2615",
        // Beide Sanitäter stehen mittig-links.
        x: 22,
        y: 35,
        w: 24,
        h: 55,
        label: "Sanitäter ansprechen",
        requires: ["sawCatatonic"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => {
          api.setFlag("protocolReceived");
          api.addItem({
            id: "protocol",
            name: "Einsatzprotokoll (verschlüsselt)",
            description:
              "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
          });
          api.setKnowledge("responsibilityE67");
          api.startDialog("paramedic");
        },
      },
      {
        id: "wallDetail2615",
        // Wand hinter dem Patienten (rechte Hälfte, oberhalb der Lampe).
        x: 50,
        y: 22,
        w: 38,
        h: 24,
        label: "Die Wand",
        requires: ["sawCatatonic"],
        onUse: (api) =>
          api.showText([
            "Beton. Nichts dahinter, das man hören könnte.",
            "Trotzdem schlägt er weiter. Der Rhythmus ist exakt.",
            "Genau der Rhythmus von 104,6.",
          ]),
      },
      {
        id: "exitTo2613",
        // Aufgebrochene Tür ganz links.
        x: 0,
        y: 18,
        w: 22,
        h: 80,
        label: "Zurück in den Korridor",
        onUse: (api) => {
          if (api.hasFlag("protocolReceived")) {
            api.showText([
              "Layard tritt zurück auf den Korridor.",
              "Hinter ihm versiegeln die Sanitäter die Tür mit gelbem Band:",
              "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
              "Niemand wird hier in absehbarer Zeit einziehen.",
            ]);
          }
          api.goTo("hallway");
        },
      },
    ],
  },

  // Philippe's own apartment is now used only as a small detour after Akt 1
  // is over - it can stay reachable from the hallway as a memory beat.
  // Bodos Wohnung (2612). Begehbar ab doorBrokenOpen.
  apt2612: {
    id: "apt2612",
    // Solange Bodo da ist: Bild mit Bodo. Sobald er für B3 unterwegs ist:
    // identisches Bild ohne Bodo.
    background: (api) =>
      (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
      (api.hasFlag("bodoLeftForB3Twice") &&
        !api.hasFlag("bodoBackAfterB3Twice"))
        ? apt2612BgEmpty
        : apt2612BgBodo,
    title: "Wohnung 2612 — Bodo Marschke",
    intro:
      "Warmes Lampenlicht. Es riecht nach altem Kraut, das jemand „Tee“ nennt. Bodo sitzt tief im Sessel, die Katze hat den vorderen Platz auf der Decke längst für sich beansprucht.",
    hotspots: [
      {
        id: "bodoNpc",
        // Hotspot deckt das Bodo-Sprite auf dem Sessel.
        x: 14,
        y: 36,
        w: 30,
        h: 60,
        label: "Bodo Marschke",
        // Wenn Bodo gerade unterwegs zum B3 holen ist, ist er nicht da.
        visible: (api) => {
          const away1 =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const away2 =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          return !away1 && !away2;
        },
        onUse: (api) => {
          if (!api.hasFlag("metBodo")) {
            api.setFlag("metBodo");
            api.startDialog("bodoIntro");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("bodoSawFlyer")
          ) {
            api.setFlag("bodoSawFlyer");
            api.startDialog("bodoFlyer");
          } else if (
            api.hasFlag("knowsLotti") &&
            !api.hasFlag("bodoBackAfterB3")
          ) {
            // Layard kann Bodo überzeugen, los zu gehen — sobald er Lotti
            // kennt und damit weiß, warum B3 wichtig ist.
            api.startDialog("bodoConvinceLeave");
          } else if (
            // Zweiter Anlauf: Bodo ist zurück, aber die Aufzugssperre
            // (oder ein anderes Terminal-Anliegen) ist noch offen.
            api.hasFlag("bodoBackAfterB3") &&
            !api.hasFlag("bodoBackAfterB3Twice") &&
            api.hasFlag("elevatorMaintBlocked") &&
            !api.hasFlag("elevatorMaintCleared")
          ) {
            api.startDialog("bodoConvinceLeave2");
          } else if (!api.hasFlag("talkedBodo2")) {
            api.setFlag("talkedBodo2");
            api.startDialog("bodoSmalltalk");
          } else {
            api.startDialog("bodoSmalltalk");
          }
        },
      },
      // Während Bodo weg ist: Hinweis statt Person.
      {
        id: "bodoEmptyChair",
        x: 2,
        y: 42,
        w: 30,
        h: 50,
        label: "Bodos leerer Sessel",
        requires: ["bodoLeftForB3"],
        hiddenWhen: ["bodoBackAfterB3Twice"],
        visible: (api) =>
          // Sichtbar während Anlauf 1 ODER während Anlauf 2.
          (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
          (api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice")),
        onUse: (api) =>
          api.showText([
            "Bodos Sessel ist leer. Die Tasse Tee dampft noch.",
            "Lotti schläft tief. Sie weiß, dass er wiederkommt.",
            "Layard nicht so ganz. Aber er hat eine Viertelstunde.",
          ]),
      },
      {
        id: "lottiSpot",
        // Katze liegt auf der Ottomane vor dem Sessel.
        x: 28,
        y: 64,
        w: 22,
        h: 22,
        label: "Lotti (Katze)",
        onUse: (api) => {
          if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Lotti rollt sich enger ein und blinzelt Layard zu.",
              "Sie hat 14 Jahre Mensch gesehen. Sie hat eine Meinung.",
              "Sie behält sie für sich.",
            ]);
          } else if (api.hasFlag("metBodo")) {
            api.startDialog("bodoLotti");
          } else {
            api.showText([
              "Auf dem Sessel: eine grau-getigerte Katze, eingerollt auf einer Strickdecke.",
              "Sie schaut Layard nicht an. Sie weiß genau, dass er da ist.",
            ]);
          }
        },
      },
      {
        id: "bodoPhone",
        // Beiges Wandtelefon rechts oberhalb des Terminal-Tisches.
        x: 70,
        y: 24,
        w: 12,
        h: 22,
        label: "Wandtelefon",
        onUse: (api) =>
          api.showText([
            "Ein schwarzer Bakelit-Apparat. Hörer staubig.",
            "Bodo, von hinten: „Den hab ich seit zwölf Jahren nicht abgenommen.“",
            "„Wer was von mir will, klopft. Oder ist die Katze.“",
          ]),
      },
      {
        id: "bodoTerminal",
        // CRT-Monitor mit Tisch in der Bildmitte rechts.
        x: 46,
        y: 38,
        w: 26,
        h: 32,
        label: "Bodos Terminal",
        onUse: (api) => {
          const bodoAway =
            (api.hasFlag("bodoLeftForB3") &&
              !api.hasFlag("bodoBackAfterB3")) ||
            (api.hasFlag("bodoLeftForB3Twice") &&
              !api.hasFlag("bodoBackAfterB3Twice"));
          if (bodoAway) {
            // Bodo ist weg → freier Zugang, eingeloggt als bodo.
            api.openTerminal(true);
          } else if (api.hasFlag("metBodo") && !api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt langsam den Kopf.",
              "„Das ist meiner. Da kommen Sie nur dran, wenn ich Sie ranlasse.“",
              "„Und ich lass’ Sie nicht ran, solange Sie nicht wissen, mit wem Sie hier eigentlich reden.“",
            ]);
          } else if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt den Kopf, ohne aufzuschauen.",
              "„Solange ich hier sitze, sitzen Sie nicht hier. Ende.“",
              "„Wenn ich mal weg bin, dann vielleicht. Aber dafür müssten Sie mich",
              " erst mal weg kriegen.“",
            ]);
          } else {
            api.showText([
              "Ein altes CRT-Terminal. Bodo hat einen Blick darauf, der",
              "deutlich macht: nicht jetzt, Worag.",
            ]);
          }
        },
      },
      {
        id: "exit2612",
        // Wohnungstür ganz rechts.
        x: 80,
        y: 14,
        w: 20,
        h: 80,
        label: "Zurück in den Korridor",
        onUse: (api) => {
          // Wenn Bodo gerade unterwegs ist: er kommt zurück, bevor Layard
          // den Raum verlassen kann. Beide treffen sich an der Tür.
          const firstTrip =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const secondTrip =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          if (firstTrip) {
            // Bodo merkt es, wenn Layard etwas Sichtbares getan hat —
            // entweder das System aktualisiert oder die Wartungssperre
            // 4711 storniert (beides hinterlässt Spuren im Log).
            if (api.hasFlag("centralOsUpdated")) {
              // v2.3.1-Schock — der eigentliche „Caught"-Dialog dreht
              // sich um die OS-Aktualisierung.
              api.startDialog("bodoReturnsCaught");
            } else if (api.hasFlag("elevatorMaintCleared")) {
              // Layard hat NICHT aktualisiert, aber das Wartungs-Ticket
              // 4711 storniert. Eigener Pfad ohne v2.3.1-Dialog.
              api.startDialog("bodoReturnsCaughtMaint");
            } else {
              api.startDialog("bodoReturnsClean");
            }
            return;
          }
          if (secondTrip) {
            // Beim zweiten Anlauf zählt nur, ob die Aufzugssperre weg ist.
            // Hat Layard wieder nichts getan → Bodo storniert sie selbst
            // (Lösung C: garantiert keine Sackgasse).
            if (api.hasFlag("elevatorMaintCleared")) {
              api.startDialog("bodoReturnsCaught2");
            } else {
              api.startDialog("bodoReturnsSelfFix");
            }
            return;
          }
          api.goTo("hallway");
        },
      },
    ],
  },

  hallway: {
    id: "hallway",
    background: hallwayBg,
    title: "Korridor 26 — Quadrant E67",
    intro:
      "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 82,
        y: 28,
        w: 18,
        h: 60,
        label: "Tür 2611 (zurück in die Wohnung)",
        onUse: (api) => api.goTo("apartment"),
      },
      // Tür 2613 — Philippes Wohnung. Bleibt jederzeit begehbar.
      {
        id: "door2613Philippe",
        x: 67,
        y: 36,
        w: 14,
        h: 50,
        label: "Tür 2613 (Philippe)",
        onUse: (api) => {
          // Vor dem Klingeln (= vor der Resonanz-Überlastung) ist Philippe
          // unterwegs im Komplex. Er öffnet nicht.
          if (!api.hasFlag("metPhilippe")) {
            api.showText([
              "Layard klopft an 2613.",
              "Drinnen: nichts. Kein Stuhl, der zurückgeschoben wird.",
              "Kein „Moment“. Nicht einmal die Lampe brummt.",
              "Philippe ist nicht zu Hause.",
            ]);
            return;
          }
          // Pro Besuch werden die Warte-Beats und der Philippe-Hotspot
          // zurückgesetzt, damit Layard wieder mit ihm reden kann.
          api.clearFlag("wait2613Step1");
          api.clearFlag("wait2613Step2");
          api.goTo("apt2613");
        },
      },
      // Tür 2615 — der Mann an der Wand. Solange aufgebrochen begehbar,
      // sobald die Sanitäter ihn abtransportiert haben: versiegelt.
      {
        id: "door2615Open",
        x: 56,
        y: 42,
        w: 12,
        h: 42,
        label: "Tür 2615 (aufgebrochen)",
        requires: ["doorBrokenOpen"],
        hiddenWhen: ["protocolReceived"],
        onUse: (api) => api.goTo("apt2615"),
      },
      {
        id: "door2615Sealed",
        x: 56,
        y: 42,
        w: 12,
        h: 42,
        label: "Tür 2615 (versiegelt)",
        requires: ["protocolReceived"],
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Niemand wird hier in absehbarer Zeit einziehen.",
          ]),
      },
      // Tür 2610 — Helka Vint. Nur Türgespräch, keine Szene.
      {
        id: "door2610Helka",
        x: 2,
        y: 38,
        w: 12,
        h: 50,
        label: "Tür 2610 (Helka Vint)",
        onUse: (api) => {
          if (!api.hasFlag("metHelka")) {
            api.setFlag("metHelka");
            api.startDialog("helkaAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("helkaSawFlyer")
          ) {
            api.setFlag("helkaSawFlyer");
            api.startDialog("helkaFlyer");
          } else if (!api.hasFlag("talkedHelka2")) {
            api.setFlag("talkedHelka2");
            api.startDialog("helkaSmalltalk");
          } else if (!api.hasFlag("talkedHelka3")) {
            api.setFlag("talkedHelka3");
            api.startDialog("helkaSmalltalk2");
          } else {
            api.showText([
              "Layard klopft. Aus der Wohnung 2610: kein Geräusch.",
              "Helka hat heute genug geredet. Mehr als in den letzten zwei Jahren.",
            ]);
          }
        },
      },
      // Tür 2612 — Bodo Marschke. Begehbare Wohnung.
      {
        id: "door2612Bodo",
        x: 18,
        y: 36,
        w: 14,
        h: 52,
        label: "Tür 2612 (Bodo Marschke)",
        onUse: (api) => api.goTo("apt2612"),
      },
      // Tür 2614 — Ennis Korr. Nur Türgespräch.
      {
        id: "door2614Ennis",
        x: 30,
        y: 38,
        w: 9,
        h: 50,
        label: "Tür 2614 (Ennis Korr)",
        onUse: (api) => {
          if (!api.hasFlag("metEnnis")) {
            api.setFlag("metEnnis");
            api.startDialog("ennisAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("ennisSawFlyer")
          ) {
            api.setFlag("ennisSawFlyer");
            api.startDialog("ennisFlyer");
          } else if (api.hasFlag("ennisCracked")) {
            api.startDialog("ennisAfterFlyer");
          } else if (!api.hasFlag("talkedEnnis2")) {
            api.setFlag("talkedEnnis2");
            api.startDialog("ennisSmalltalk");
          } else {
            api.showText([
              "Layard klopft an 2614. Drinnen: ein Stuhl, der zurückgeschoben wird.",
              "Dann nichts. Ennis hat heute Nachtschicht. Oder er tut so.",
            ]);
          }
        },
      },
      {
        id: "toSector",
        x: 42,
        y: 42,
        w: 16,
        h: 30,
        label: "Aufzug",
        // Sichtbar, solange keine aktive Wartungssperre auf dem Aufzug liegt.
        // Sobald die Sperre per `maint cancel 4711` storniert wurde
        // (elevatorMaintCleared), wird sie ignoriert und der Aufzug ist
        // wieder benutzbar.
        visible: (api) =>
          !api.hasFlag("elevatorMaintBlocked") ||
          api.hasFlag("elevatorMaintCleared"),
        onUse: (api) => api.goTo("elevator"),
      },
      // Solange Wartungssperre 4711 auf dem Aufzug liegt: er fährt nicht.
      // Layard kann an Bodos Terminal `maint cancel 4711` ausführen, sobald
      // Bodo unterwegs ist (bodoLeftForB3 && !bodoBackAfterB3).
      {
        id: "toSectorBlocked",
        x: 42,
        y: 42,
        w: 16,
        h: 30,
        label: "Aufzug (gesperrt — Wartung 4711)",
        requires: ["elevatorMaintBlocked"],
        hiddenWhen: ["elevatorMaintCleared"],
        onUse: (api) => {
          api.setFlag("elevatorMaintSeen");
          api.showText([
            "Ein roter LED-Streifen über der Aufzugstür blinkt zweimal.",
            "Display: „WARTUNGSANFRAGE 4711 — AUFZUG GESPERRT“.",
            "Darunter, kleiner: „Stornierung über Hausmeister-Konsole.“",
            "Layards eigenes Terminal kann diese Sperre nur lesen,",
            "nicht löschen. Sein Account hat dafür keine Rechte.",
          ]);
        },
      },
    ],
  },

  sectorDoor: {
    id: "sectorDoor",
    background: sectorBg,
    title: "Sektor-Tür — Etage 1, E67",
    intro:
      "Die schwere Schleusentür am Ende der Lobby. Hinter ihr: ein Verbindungsgang. Daneben: ein Keypad. Darüber: ein Monitor mit grüner Phosphor-Schrift, der „ERROR 4567“ blinkt.",
    hotspots: [
      {
        id: "monitor",
        x: 14,
        y: 30,
        w: 20,
        h: 22,
        label: "Status-Monitor",
        onUse: (api) =>
          api.showText([
            ">> CENTRALOS v2.3 — SEKTOR-GATEWAY",
            ">> ERROR 4567: Gateway-Authentifizierung fehlgeschlagen",
            ">> Wartungsfenster gemeldet — Status: bearbeitet",
            ">> Lösungspfad: Manueller Code via Leitstelle 001.",
          ]),
      },
      {
        id: "keypadCall",
        x: 16,
        y: 54,
        w: 16,
        h: 20,
        label: "Keypad — Code eingeben",
        onUse: (api) => {
          if (api.hasFlag("sectorDoorOpen")) {
            api.showText([
              "Das Keypad zeigt eine matte grüne LED.",
              "Die Tür ist bereits entriegelt.",
            ]);
            return;
          }
          if (!api.hasFlag("calledInsa2")) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Layard kennt keinen Code. Er hat hier auch nichts zu suchen —",
              "noch nicht. Er hat keinen Auftrag, der ihn hindurchschickt.",
              "[ Layard betrachtet die Tür eine Weile. Dann dreht er sich um. ]",
            ]);
            return;
          }
          if (!api.hasFlag("calledForCode")) {
            api.showText([
              "Das Keypad blinkt rot.",
              "Layard hat noch keinen Code. Es gibt nur einen Weg: 001 anrufen.",
              "[ Geh zurück in deine Wohnung und benutze dein Telefon. ]",
            ]);
            return;
          }
          api.openKeypad();
        },
      },
      {
        id: "keypadCall",
        x: 16,
        y: 54,
        w: 16,
        h: 20,
        label: "Keypad — Code eingeben",
        onUse: (api) => {
          if (!api.hasFlag("calledForCode")) {
            if (!api.hasFlag("calledInsa2")) {
              api.showText([
                "Das Keypad blinkt rot.",
                "Layard kennt keinen Code. Er hat hier auch nichts zu suchen —",
                "noch nicht. Er hat keinen Auftrag, der ihn hindurchschickt.",
                "[ Layard betrachtet die Tür eine Weile. Dann dreht er sich um. ]",
              ]);
            } else {
              api.showText([
                "Das Keypad blinkt rot.",
                "Layard hat noch keinen Code. Es gibt nur einen Weg: 001 anrufen.",
                "[ Geh zurück in deine Wohnung und benutze dein Telefon. ]",
              ]);
            }
          } else {
            api.openTerminal();
          }
        },
      },
      {
        id: "toPassage",
        x: 48,
        y: 26,
        w: 38,
        h: 60,
        label: "Sektor-Tür öffnen → Verbindungsgang",
        requires: ["sectorDoorOpen"],
        onUse: (api) => {
          if (!api.hasFlag("feetWontMove")) {
            api.setFlag("feetWontMove");
            api.showText([
              "Layard denkt intensiv daran, einen Schritt zu machen.",
              "Aus der Lobby. Durch die Schleuse. Aus E67 hinaus.",
              "Seine Füße bewegen sich nicht.",
              "Im Hinterkopf: das amber-grüne Glühen der Frequenz 104,6.",
              "Sie ist nicht mehr im Radio. Sie ist in ihm.",
              "Er zwingt das rechte Bein. Es geht. Schwer. Mechanisch.",
              "Wie eine Tür, deren Scharniere seit Jahren niemand geölt hat.",
            ]);
          } else {
            api.goTo("passage");
          }
        },
      },
      // Eine reine "Beobachten"-Fläche an der Tür, sichtbar bevor Layard
      // weiß, dass es jenseits der Tür um E71 geht.
      {
        id: "doorWonder",
        x: 48,
        y: 26,
        w: 38,
        h: 60,
        label: "Tür betrachten",
        hiddenWhen: ["calledInsa2"],
        onUse: (api) =>
          api.showText([
            "Eine schwere Schleusentür, geschlossen.",
            "Layard war noch nie hindurch. Er hat auch keinen Grund.",
            "Was hinter dieser Tür liegt, kennt er nur aus Aushängen:",
            "ein Verbindungsgang, irgendetwas weiter draußen.",
            "Er hat keinen Auftrag, der ihn jetzt nach draußen schickt.",
          ]),
      },
      {
        id: "backHallwayS",
        x: 0,
        y: 35,
        w: 18,
        h: 60,
        label: "Zurück in die Lobby",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
    ],
  },

  e71Lobby: {
    id: "e71Lobby",
    background: e71LobbyBg,
    title: "Sektor E71 — Empfang",
    intro:
      "Der Aufzug schließt hinter Layard. Andere Luft. Kühler. Sauberer. Eine Frau hinter einem Tresen sieht auf — als hätte sie ihn erwartet.",
    hotspots: [
      {
        id: "receptionist",
        x: 70,
        y: 35,
        w: 25,
        h: 50,
        label: "Empfangsdame",
        hiddenWhen: ["metReceptionist"],
        onUse: (api) => {
          api.setFlag("metReceptionist");
          api.startDialog("reception");
        },
      },
      {
        id: "directory",
        x: 35,
        y: 30,
        w: 18,
        h: 22,
        label: "Hinweisschild",
        onUse: (api) =>
          api.showText([
            ">> SEKTOR E71 — MEDIZIN",
            ">> Korridor 15  →  Zimmer 1500–1540",
            ">> Korridor 16  →  Pathologie",
            ">> Frequenzsperre 104,6 in diesem Sektor — bitte respektieren.",
          ]),
      },
      {
        id: "elevatorBack",
        x: 0,
        y: 30,
        w: 22,
        h: 65,
        label: "Aufzug zurück nach E67",
        requires: ["heardMikaelTruth"],
        onUse: (api) => {
          api.setFlag("ending");
          api.setEnding();
        },
      },
      {
        id: "toCorridor15",
        x: 50,
        y: 50,
        w: 16,
        h: 35,
        label: "Tür → Korridor 15",
        requires: ["metReceptionist"],
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },

  corridor15: {
    id: "corridor15",
    background: corridor15Bg,
    title: "Korridor 15 — Sektor E71",
    intro:
      "Spiegelblanker Linoleum. Drei Lichter flackern. Am Ende des Korridors: eine rote Tür. Zimmer 1534.",
    hotspots: [
      {
        id: "gurney",
        x: 6,
        y: 55,
        w: 22,
        h: 25,
        label: "Verlassene Trage",
        onUse: (api) =>
          api.showText([
            "Eine zurückgelassene Trage. Auf dem Laken: ein hellbrauner Fleck.",
            "Daneben: ein Klemmbrett. Name unleserlich. Datum: heute.",
          ]),
      },
      {
        id: "doors",
        x: 28,
        y: 30,
        w: 38,
        h: 50,
        label: "Türen 1530–1540",
        onUse: (api) =>
          api.showText([
            "1530, 1532, 1536, 1538 — alle grün. Alle leer.",
            "Nur 1534 zeigt ein gelbes Licht. Aktiv. Bewohnt.",
          ]),
      },
      {
        id: "door1534",
        x: 43,
        y: 32,
        w: 14,
        h: 50,
        label: "Tür 1534 (rot beleuchtet)",
        onUse: (api) => {
          api.setFlag("foundRoom1534");
          api.goTo("room1534");
        },
      },
      {
        id: "backLobby",
        x: 84,
        y: 70,
        w: 14,
        h: 28,
        label: "Zurück zum Empfang",
        onUse: (api) => api.goTo("e71Lobby"),
      },
    ],
  },

  room1534: {
    id: "room1534",
    background: room1534Bg,
    title: "Zimmer 1534 — Mikael Bauerfeind",
    intro:
      "Warmes Licht. Echtes Holz. Ein alter Mann unter einer dünnen Decke. Neben ihm ein kleiner Empfänger, der amber glüht — auf einer Frequenz, die nicht im Verzeichnis steht.",
    hotspots: [
      {
        id: "mikaelNpc",
        x: 18,
        y: 50,
        w: 40,
        h: 35,
        label: "Alter Mann",
        hiddenWhen: ["metMikael"],
        onUse: (api) => {
          api.setFlag("metMikael");
          api.setKnowledge("radioOrigin");
          api.setKnowledge("leitstelleListens");
          api.setKnowledge("frequencyControl");
          api.startDialog("mikael");
        },
      },
      {
        id: "nightstand",
        x: 0,
        y: 55,
        w: 18,
        h: 38,
        label: "Nachttisch / Schubladen",
        requires: ["metMikael"],
        hiddenWhen: ["tookCrystal"],
        onUse: (api) => {
          api.setFlag("tookCrystal");
          api.setFlag("readLetter");
          api.addItem({
            id: "tuningCrystal",
            name: "Bernstein-Kristall",
            description:
              "Ein handgeschliffener Quarz. Stimmt das Schmerz-Radio jenseits des offiziellen Bands.",
          });
          api.addItem({
            id: "mikaelLetter",
            name: "Brief an Insa",
            description:
              "Ein versiegelter, handbeschriebener Umschlag. Nicht über das Terminal zu öffnen.",
          });
          api.setFlag("heardMikaelTruth");
          api.startDialog("mikaelLast");
        },
      },
      {
        id: "monitor",
        x: 0,
        y: 60,
        w: 14,
        h: 18,
        label: "Medizinmonitor",
        requires: ["heardMikaelTruth"],
        onUse: (api) =>
          api.showText([
            "Eine flache Linie. Kein Alarm.",
            "Niemand hat ihn aktiviert. Niemand wird kommen.",
          ]),
      },
      {
        id: "photo",
        x: 38,
        y: 32,
        w: 12,
        h: 18,
        label: "Foto an der Wand",
        onUse: (api) =>
          api.showText([
            "Ein junges Mädchen, vielleicht zehn Jahre alt.",
            "Auf der Rückseite, in derselben Handschrift wie der Brief: „Insa, 1986“.",
          ]),
      },
      {
        id: "leaveRoom",
        x: 86,
        y: 60,
        w: 12,
        h: 35,
        label: "Zurück in den Korridor",
        requires: ["heardMikaelTruth"],
        onUse: (api) => {
          if (!api.hasFlag("insa3Called")) {
            api.setFlag("insa3Called");
            api.startDialog("insa3");
          }
          api.goTo("corridor15");
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // E67 — Aufzug. Erreicht den Heim-Korridor (Etage 2) und drei
  // andere Etagen des Gebäudes. E71 ist NICHT per Aufzug zu
  // erreichen — dafür muss man Etage 1 → Sektor-Tür → Passage.
  // ───────────────────────────────────────────────────────────
  elevator: {
    id: "elevator",
    background: elevatorBg,
    title: "Aufzug — E67",
    intro:
      "Käfig aus Edelstahl, halb so groß wie eine Wohnung. Fünf Knöpfe. Ein Schild: „E67 · 5 ETAGEN · max. 6 Personen“.",
    hotspots: [
      // Knöpfe von oben (5) nach unten (1) — passend zum Hintergrundbild.
      // Hotspots decken Zahlen UND farbige Knöpfe ab.
      {
        id: "btn5",
        x: 60,
        y: 22,
        w: 28,
        h: 11,
        label: "Etage 5 — Wohnen / Dach",
        onUse: (api) => api.goTo("corridor56"),
      },
      {
        id: "btn4",
        x: 60,
        y: 35,
        w: 28,
        h: 11,
        label: "Etage 4 — Wohnen",
        onUse: (api) => api.goTo("corridor46"),
      },
      {
        id: "btn3",
        x: 60,
        y: 48,
        w: 28,
        h: 11,
        label: "Etage 3 — Verwaltung",
        onUse: (api) => api.goTo("corridor36"),
      },
      {
        id: "btn2",
        x: 60,
        y: 61,
        w: 28,
        h: 11,
        label: "Etage 2 — Korridor 26 (Heim)",
        onUse: (api) => api.goTo("hallway"),
      },
      {
        id: "btn1",
        x: 60,
        y: 74,
        w: 28,
        h: 11,
        label: "Etage 1 — Lobby",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
      {
        id: "elevatorSign",
        x: 8,
        y: 4,
        w: 38,
        h: 10,
        label: "Schild „E67 · 5 ETAGEN“",
        onUse: (api) =>
          api.showText([
            "E67 — fünf Etagen, neun Sektionen, bis zu 25 Einheiten je Sektion.",
            "Maximalbelegung Aufzug: 6 Personen.",
            "Wartung: Sektor-Technik, Etage 1.",
            "Anschlussgebäude E71 nur über Sektor-Tür Etage 1 erreichbar.",
          ]),
      },
    ],
  },

  // Etage 1 — Lobby mit Sektor-Tür nach draußen.
  floor1Lobby: {
    id: "floor1Lobby",
    background: floor1LobbyBg,
    title: "Lobby — Etage 1, E67",
    intro:
      "Ein leerer Empfangstresen. Eine Anzeigetafel. Hinten links: der Aufzug. Rechts: die schwere Sektor-Tür.",
    npcs: [
      {
        id: "philippeLobby",
        src: philippeSprite,
        x: 32,
        y: 28,
        w: 14,
        h: 56,
        alt: "Philippe wartet vor dem Tresen",
        hiddenWhen: ["doorbellRang"],
      },
    ],
    hotspots: [
      {
        id: "philippeLobbySpot",
        x: 32,
        y: 30,
        w: 14,
        h: 54,
        label: "Philippe (Nachbar)",
        hiddenWhen: ["doorbellRang"],
        onUse: (api) => api.startDialog("philippeInLobby"),
      },
      {
        id: "lobbyDesk",
        x: 8,
        y: 50,
        w: 22,
        h: 30,
        label: "Empfangstresen (unbesetzt)",
        onUse: (api) =>
          api.showText([
            "Niemand hinter dem Tresen. Eine Kaffeetasse, halb voll, kalt.",
            "Auf einem Klemmbrett: Schichtplan. Heutige Schicht: durchgestrichen.",
          ]),
      },
      {
        id: "lobbyBoard",
        x: 38,
        y: 38,
        w: 14,
        h: 14,
        label: "Schwarzes Brett",
        onUse: (api) =>
          api.showText([
            "Aushang: „Resonanz-Hygiene — Pflichtinformation für alle Hörer.“",
            "Aushang: „Quadrant E67 — Zuständigkeitsregelung Vertretung E71/1534.“",
            "Aushang, halb abgerissen: „… revolutionärer Umtriebe. Meldungen an 001.“",
          ]),
      },
      {
        id: "lobbyElevator",
        x: 78,
        y: 22,
        w: 18,
        h: 70,
        label: "Aufzug",
        onUse: (api) => api.goTo("elevator"),
      },
      {
        id: "lobbySectorDoor",
        x: 52,
        y: 35,
        w: 18,
        h: 50,
        label: "Sektor-Tür → E71",
        onUse: (api) => api.goTo("sectorDoor"),
      },
    ],
  },

  // Verbindungsgang zwischen E67 und E71. Außenluft.
  passage: {
    id: "passage",
    background: passageBg,
    title: "Verbindungsgang E67 ↔ E71",
    intro:
      "Außenluft. Das erste Mal seit Jahren. Ein Geländer, kalter Beton, irgendwo ein Lautsprecher, der nichts sagt.",
    hotspots: [
      {
        id: "lookE67",
        x: 5,
        y: 35,
        w: 30,
        h: 50,
        label: "Wand E67 (zurück)",
        onUse: (api) => api.goTo("sectorDoor"),
      },
      {
        id: "lookSky",
        x: 38,
        y: 8,
        w: 24,
        h: 22,
        label: "Himmel",
        onUse: (api) =>
          api.showText([
            "Grau. Niedrig. Kein Vogel.",
            "Trotzdem: Luft, die sich bewegt. Auf Layards Wange ein Frösteln.",
            "Etwas, das er aus dem Schmerz-Radio nicht kennt.",
          ]),
      },
      {
        id: "toE71",
        x: 65,
        y: 32,
        w: 30,
        h: 60,
        label: "Eingang E71 →",
        onUse: (api) => {
          api.setFlag("elevatorTaken");
          api.setFlag("enteredE71");
          api.goTo("e71Lobby");
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Etage 3 — Verwaltungsetage. Hier ist das Büro des
  // Abschnittsverantwortlichen E67 (Tür 3601). Heute leer.
  // ───────────────────────────────────────────────────────────
  corridor36: {
    id: "corridor36",
    background: corridor36Bg,
    title: "Korridor 36 — Verwaltung E67",
    intro:
      "Andere Beleuchtung als zuhause. Sterilere Türen. Vor einer davon — 3601 — ein handgeschriebenes Schild.",
    npcs: [
      {
        id: "miraSprite36",
        src: miraSprite,
        x: 22,
        y: 36,
        w: 14,
        h: 54,
        alt: "Junge Frau, an die Wand gelehnt",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 3,
      },
      {
        id: "philippeSprite36",
        src: philippeSprite,
        x: 70,
        y: 34,
        w: 14,
        h: 54,
        alt: "Philippe, etwas verloren im Korridor",
        hiddenWhen: ["doorbellRang"],
      },
    ],
    hotspots: [
      {
        id: "philippeSpot36",
        x: 70,
        y: 36,
        w: 14,
        h: 54,
        label: "Philippe (Nachbar)",
        hiddenWhen: ["doorbellRang"],
        onUse: (api) => api.startDialog("philippeInCorridor36"),
      },
      {
        id: "officeDoor",
        x: 17,
        y: 32,
        w: 18,
        h: 50,
        label: "Tür 3601 — Abschnittsverantwortlicher E67",
        onUse: (api) => {
          api.setFlag("sawEmptyOffice");
          api.startDialog("emptyOfficeSign");
        },
      },
      {
        id: "officeBell",
        x: 36,
        y: 47,
        w: 6,
        h: 8,
        label: "Klingelknopf",
        requires: ["sawEmptyOffice"],
        hiddenWhen: ["rangEmptyOfficeBell"],
        onUse: (api) => {
          api.setFlag("rangEmptyOfficeBell");
          api.startDialog("emptyOfficeBell");
        },
      },
      {
        id: "miraSpot36",
        x: 22,
        y: 38,
        w: 14,
        h: 50,
        label: "Junge Frau an der Wand",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 3,
        onUse: (api) => {
          if (api.hasFlag("tookFlyer")) {
            api.startDialog("miraAfter");
          } else if (api.hasFlag("metMira")) {
            api.startDialog("miraReturn");
          } else {
            api.setFlag("metMira");
            api.startDialog("miraIntro");
          }
        },
      },
      {
        id: "back36",
        x: 50,
        y: 27,
        w: 22,
        h: 60,
        label: "Zurück zum Aufzug",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },

  corridor46: {
    id: "corridor46",
    background: corridor46Bg,
    title: "Korridor 46 — Wohnetage",
    intro:
      "Wie zuhause, nur eine Etage höher. Ein Plakat „RESONANZ-HYGIENE“ blättert ab.",
    npcs: [
      {
        id: "miraSprite46",
        src: miraSprite,
        x: 22,
        y: 36,
        w: 14,
        h: 54,
        alt: "Junge Frau, an die Wand gelehnt",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 4,
      },
      {
        id: "philippeSprite46",
        src: philippeSprite,
        x: 62,
        y: 34,
        w: 14,
        h: 54,
        alt: "Philippe vor dem Plakat",
        hiddenWhen: ["doorbellRang"],
      },
    ],
    hotspots: [
      {
        id: "philippeSpot46",
        x: 62,
        y: 36,
        w: 14,
        h: 54,
        label: "Philippe (Nachbar)",
        hiddenWhen: ["doorbellRang"],
        onUse: (api) => api.startDialog("philippeInCorridor46"),
      },
      {
        id: "miraSpot46",
        x: 22,
        y: 38,
        w: 14,
        h: 50,
        label: "Junge Frau an der Wand",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 4,
        onUse: (api) => {
          if (api.hasFlag("tookFlyer")) {
            api.startDialog("miraAfter");
          } else if (api.hasFlag("metMira")) {
            api.startDialog("miraReturn");
          } else {
            api.setFlag("metMira");
            api.startDialog("miraIntro");
          }
        },
      },
      {
        id: "poster46",
        x: 42,
        y: 30,
        w: 18,
        h: 22,
        label: "Plakat „Resonanz-Hygiene“",
        onUse: (api) =>
          api.showText([
            "„HÖREN HEISST GEHÖREN.“",
            "Darunter, kleiner: „104,6 — Ihre Frequenz. Ihre Verantwortung.“",
            "Jemand hat mit Bleistift dazugeschrieben: „und ihr Käfig.“",
          ]),
      },
      {
        id: "back46",
        x: 80,
        y: 30,
        w: 18,
        h: 60,
        label: "Zurück zum Aufzug",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },

  corridor56: {
    id: "corridor56",
    background: corridor56Bg,
    title: "Korridor 56 — Dachetage",
    intro:
      "Oben. Am Ende des Korridors: ein vergittertes Fenster auf einen grauen Himmel.",
    npcs: [
      {
        id: "miraSprite56",
        src: miraSprite,
        x: 22,
        y: 36,
        w: 14,
        h: 54,
        alt: "Junge Frau, an die Wand gelehnt",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 5,
      },
    ],
    hotspots: [
      {
        id: "miraSpot56",
        x: 22,
        y: 38,
        w: 14,
        h: 50,
        label: "Junge Frau an der Wand",
        hiddenWhen: ["tookFlyer"],
        visible: (api) => api.getMiraFloor() === 5,
        onUse: (api) => {
          if (api.hasFlag("tookFlyer")) {
            api.startDialog("miraAfter");
          } else if (api.hasFlag("metMira")) {
            api.startDialog("miraReturn");
          } else {
            api.setFlag("metMira");
            api.startDialog("miraIntro");
          }
        },
      },
      {
        id: "window56",
        x: 42,
        y: 30,
        w: 18,
        h: 30,
        label: "Vergittertes Fenster",
        onUse: (api) =>
          api.showText([
            "Hinter den Gitterstäben: Dächer. Antennenwald. Eine Möwe.",
            "Darunter, in den Beton geritzt: „Z.K.S. war hier.“",
          ]),
      },
      {
        id: "hatch56",
        x: 50,
        y: 6,
        w: 14,
        h: 10,
        label: "Wartungsluke (verriegelt)",
        onUse: (api) =>
          api.showText([
            "Schwere Stahlluke, mit zwei Riegeln und einem Schloss gesichert.",
            "Layard rüttelt nicht einmal. Er weiß, was er nicht öffnet.",
          ]),
      },
      {
        id: "back56",
        x: 80,
        y: 30,
        w: 18,
        h: 60,
        label: "Zurück zum Aufzug",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },
};
