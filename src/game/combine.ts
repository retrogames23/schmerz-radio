import type { GameApi, InventoryItemId } from "./types";

/**
 * Wenn ein Item auf einen Hotspot oder ein anderes Item gezogen wird,
 * suchen wir hier nach einer passenden Reaktion. Findet sich keine,
 * fällt das System auf einen lakonischen Layard-Spruch zurück.
 */

export type CombineTargetKind = "hotspot" | "item";

export interface CombineContext {
  api: GameApi;
  targetId: string;
  targetKind: CombineTargetKind;
  targetLabel?: string;
}

type ItemReactionMap = Partial<Record<InventoryItemId, string[]>>;

// ─── Personen-Reaktionen ─────────────────────────────────────

const PHILIPPE_REACTIONS: ItemReactionMap = {
  protocol: [
    "Philippe schaut auf die Datenkapsel. Lange.",
    "„Das ist nicht für mich. Das ist für jemanden, der da oben sitzt.“",
    "„Bringen Sie das weg, Layard. Bevor jemand fragt, warum Sie es hier zeigen.“",
  ],
  exitCode: [
    "„Acht Ziffern.“ — Philippe pfeift halblaut.",
    "„Wir alle haben einen Code. Wir wissen es nur nicht.“",
  ],
  b3sample: [
    "„B3? Wirklich?“ Philippes Augen werden eine Spur wärmer.",
    "„Ich hab’s Ihnen ja gesagt. Es schmeckt nach etwas. Nach was — das",
    " müssen Sie selbst herausfinden.“",
  ],
  tuningCrystal: [
    "Philippe legt den Kopf schief. „Das ist nicht aus dem Verzeichnis.“",
    "Er hebt den Kristall ans Licht und gibt ihn schnell zurück.",
    "„Stecken Sie das weg. Ich habe es nicht gesehen.“",
  ],
  mikaelLetter: [
    "Philippe starrt auf das Wachssiegel. „Insa Bauerfeind?“",
    "Er zieht die Hand zurück, als hätte er sich verbrannt.",
    "„Solche Briefe geh’n nicht durch das Terminal. Aus gutem Grund.“",
  ],
  flyer: [
    "Philippe liest. Bewegt die Lippen mit. Wird sehr still.",
    "„Z.K.S. — das hab’ ich seit der Schulzeit nicht mehr gehört.“",
    "„Stecken Sie das weg, ja? Hier hat das Wand’ Ohren.“",
  ],
};

const HELKA_REACTIONS: ItemReactionMap = {
  protocol: [
    "Helkas Stimme hinter der Tür: „Ein Protokoll? Mit Siegel?“",
    "„Heben Sie das gut auf. Solche Dinge kommen immer zweimal zur Sprache.“",
  ],
  exitCode: [
    "„Acht Ziffern, Worag. Lernen Sie die nicht auswendig.“",
    "„Codes sind dazu da, dass man sie wieder vergisst.“",
  ],
  b3sample: [
    "„B3?“ Helka lacht trocken. „Davon krieg’ ich Bauchschmerzen.“",
    "„Mein Magen ist B2-konform. Für immer.“",
  ],
  tuningCrystal: [
    "„Was ist DAS?“ Helkas Stimme wird leiser.",
    "„Nehmen Sie das nicht in den Korridor. Hier hört einer immer mit.“",
  ],
  mikaelLetter: [
    "„Bauerfeind? Sie meinen die Insa von der Leitstelle?“",
    "„Lassen Sie das ungeöffnet, Worag. Was drin steht, will man nicht wissen,",
    " bis man es wissen MUSS.“",
  ],
  flyer: [
    "Helka schweigt lange. Dann, kaum hörbar:",
    "„Z.K.S. Mein Mann hat das mal gesagt. Bevor er gegangen ist.“",
    "„Lassen Sie es draußen, ja? Ich will das nicht in meiner Wohnung.“",
  ],
};

const BODO_REACTIONS: ItemReactionMap = {
  protocol: [
    "Bodo wirft einen kurzen Blick. „Versiegelt. Schön.“",
    "„Ich hab’ vor zwölf Jahren aufgehört, Siegel zu lesen.“",
    "„Bringen Sie das weg, wo es hingehört.“",
  ],
  exitCode: [
    "„Acht Ziffern, hm.“ Bodo nickt langsam.",
    "„Schreiben Sie sich die nicht auf. Das Terminal liest mit.“",
  ],
  b3sample: [
    "Bodo grinst schief. „B3. Sie schmecken jetzt also auch wieder.“",
    "„Lotti darf das nicht. Sie wird sonst eigensinnig.“",
  ],
  tuningCrystal: [
    "Bodo lehnt sich vor. Seine Augen werden zum ersten Mal scharf.",
    "„Wer hat Ihnen das gegeben? — Schon gut. Will ich nicht wissen.“",
    "„Aber: Wenn Sie damit drehen, drehen Sie nur einmal. Hören Sie?“",
  ],
  mikaelLetter: [
    "„Ein handgeschriebener Brief.“ Bodo wiegt das Wort wie ein Edelmetall.",
    "„Den letzten habe ich 2014 bekommen. Von jemandem, der jetzt tot ist.“",
  ],
  flyer: [
    "Bodo liest, einmal, zweimal. Faltet das Blatt nicht.",
    "„Z.K.S. — ich dachte, die hätt’ es gar nicht mehr gegeben.“",
    "„Behalten Sie es. Aber lesen Sie es nicht in Ihrer Wohnung.“",
  ],
};

const ENNIS_REACTIONS: ItemReactionMap = {
  protocol: [
    "Hinter der Tür: ein leises Pfeifen. „Versiegelt? Klar versiegelt.“",
    "„Die versiegeln alles, wenn’s ihnen unangenehm wird.“",
  ],
  exitCode: [
    "„Sektor-Code? Bauerfeind hat ihn rausgerückt? Echt jetzt?“",
    "„Notieren Sie sich nichts. Wirklich nichts.“",
  ],
  b3sample: [
    "„B3.“ — Ennis lacht kurz und stoppt sich selbst.",
    "„Wer das einmal isst, geht nicht zurück zur Pampe.“",
  ],
  tuningCrystal: [
    "„Oh.“ Ennis macht eine Pause. „Sie haben ZUGRIFF.“",
    "„Worag. Versprechen Sie mir eines: nicht im Korridor benutzen.“",
  ],
  mikaelLetter: [
    "„Handschrift.“ Ennis flüstert das fast.",
    "„Manche Dinge kann man nur einmal in seinem Leben lesen.“",
  ],
  flyer: [
    "Ennis öffnet die Tür auf einen Spalt. Greift das Blatt. Liest.",
    "Schließt die Tür wieder. „Wo haben Sie das her, Worag?“",
    "Pause.",
    "„Ich wollte das schon immer mal in der Hand halten.“",
  ],
};

const MIRA_REACTIONS: ItemReactionMap = {
  protocol: [
    "Mira mustert die Kapsel. „Verschlüsselt, ja? Standardprotokoll.“",
    "„Macht Sie auch nicht zum Helden.“",
  ],
  exitCode: [
    "„Acht Ziffern. Ein Datum. Phantasielos.“",
    "„Sie machen es uns wirklich leicht.“",
  ],
  b3sample: [
    "Mira hebt eine Augenbraue. „Riech ich, oder?“",
    "„B3 ist Bestechung mit anderen Mitteln.“",
  ],
  tuningCrystal: [
    "Mira nimmt den Kristall in die Hand. Bewegt ihn gegen das Licht.",
    "„Sie wissen, dass Sie damit irgendwann auffallen werden, Worag.“",
    "„Halten Sie es trotzdem. Wir brauchen Leute, die auffallen.“",
  ],
  mikaelLetter: [
    "Mira sieht das Wachssiegel. Dann sieht sie Layard an.",
    "„Das ist Ihr Brief, nicht meiner. Aber Sie haben ihn lange genug getragen.“",
  ],
  flyer: [
    "Mira lächelt. Zum ersten Mal richtig.",
    "„Sie haben es behalten. Gut.“",
  ],
  amplifierAntenna: [
    "Mira nimmt die häßliche Spule, dreht sie einmal in der Hand.",
    "„Du hast es wirklich gebaut.“",
    "Sie hängt sie an den Draht, der aus dem Fenster führt.",
    "„Geh ein Stück weg, dreh dein Schmerz-Radio auf 104,0 und halt die",
    "Frequenz dort. Ich drücke von unten.“",
  ],
};

const MIKAEL_REACTIONS: ItemReactionMap = {
  protocol: [
    "Mikael wendet den Kopf, langsam. „Ein Protokoll. Wofür dachten Sie,",
    " ist es geschrieben worden?“",
    "„Damit jemand wie ich es liest. Und nichts daraus folgt.“",
  ],
  exitCode: [
    "Ein müdes Lächeln. „Acht Ziffern, hm? Auch das hat Insa noch im Kopf.“",
  ],
  b3sample: [
    "Mikael atmet flach. „B3. Davon hab ich nur noch gehört.“",
    "„Die Welt ist klein geworden für mich. Aber sie hat noch Geschmack.“",
  ],
  tuningCrystal: [
    "Mikael lächelt schwach. „Sie haben einen davon. Gut.“",
    "„Drehen Sie damit, wenn Sie wissen, wofür.“",
  ],
  mikaelLetter: [
    "Mikael berührt das Siegel mit zwei Fingern.",
    "„Sie wird ihn lesen, bevor er ihr ausgehändigt wird. Sie liest alles zuerst.“",
    "„Aber zwischen den Zeilen — da liest sie wie keine Zweite.“",
  ],
  flyer: [
    "Mikael lacht. Es ist ein trockenes, glückliches Geräusch.",
    "„Z.K.S. Die sind also noch unterwegs.“",
    "„Dann bin ich nicht der Einzige gewesen.“",
  ],
};

const KOWALK_REACTIONS: ItemReactionMap = {
  protocol: ["Kowalk: „Das ist nicht meine Theke, Worag.“"],
  exitCode: ["Kowalk: „Stecken Sie den weg, bevor jemand reinkommt.“"],
  b3sample: [
    "Kowalk hebt eine Augenbraue. „Originalverpackung. Wo haben Sie die her?“",
  ],
  tuningCrystal: ["Kowalk: „Hübsch. Nicht essbar.“"],
  mikaelLetter: [
    "Kowalk liest stumm. Faltet ihn sehr sorgfältig wieder zusammen.",
    "„Behalten Sie das. Und reden Sie mit niemandem darüber.“",
  ],
  flyer: [
    "Kowalk: „Die haben uns auch welche unter der Tür durchgeschoben.",
    " Brust hat sie weggeworfen. Ich nicht.“",
  ],
  wartungsnotiz5610: [
    "Kowalk: „Bodos Schrift. Was tun Sie damit, Worag?“",
  ],
  residentId: ["Kowalk: „Worag, E67, 2611. In Ordnung.“"],
  e67Handbook: [
    "Kowalk: „Das alte Ding. Vorne im Hygiene-Kapitel ist ein Eselsohr — meins.“",
  ],
  b3Authorization: [
    "Kowalk nimmt die Vollmacht. „Vier-Drei-Eins-Sieben. Marteau.“",
    "„Reden Sie mich an, nicht den Tresen, dann kümmere ich mich.“",
  ],
  b3Ration: [
    "Kowalk: „Bringen Sie die hoch. Nicht hier öffnen.“",
  ],
  paramedicsReport: [
    "Kowalk wirft einen kurzen Blick. Sieht weg.",
    "„So ein Papier hab’ ich noch nie gesehen, Worag. Verstehen wir uns?“",
  ],
};

const BRUST_REACTIONS: ItemReactionMap = {
  protocol: [
    "Brust: „Formular ist korrekt ausgefüllt. Bitte an zuständiger Stelle abgeben.“",
  ],
  exitCode: [
    "Brust: „Bewohnercodes gehören nicht in die Ausgabezone, Herr Worag.“",
  ],
  b3sample: [
    "Brust: „Diese Charge ist offiziell aus dem Verkehr — bitte zurückgeben.“",
  ],
  tuningCrystal: [
    "Brust: „Das ist kein Bewohnergegenstand. Bitte beim Fundbüro abgeben.“",
  ],
  mikaelLetter: [
    "Brust: „Privater Schriftverkehr. Bitte nicht in der Ausgabezone.“",
  ],
  flyer: [
    "Brust: „Nicht-genehmigte Druckerzeugnisse. Bitte umgehend entsorgen.“",
  ],
  wartungsnotiz5610: [
    "Brust: „Wartungsdokumente sind technisch. Nicht hier.“",
  ],
  residentId: [
    "Brust: „Identität bestätigt. Was möchten Sie aufnehmen?“",
  ],
  e67Handbook: [
    "Brust blättert. Stockt. „… die Ausgabe von 91 ist offiziell noch gültig?“",
  ],
  b3Authorization: [
    "Brust: „Vollmacht 4317. Schicht A. Heute Schicht B. Ich kann das nicht.“",
  ],
  b3Ration: [
    "Brust: „Bitte vor Verlassen der Etage übergeben.“",
  ],
  paramedicsReport: [
    "Brust liest. Wird sehr still. „Bitte zeigen Sie mir das nicht noch einmal.“",
  ],
};

/** NPC-Hotspot-IDs → Reaktionsmap. */
const NPC_REACTIONS: Record<string, ItemReactionMap> = {
  philippeNpc: PHILIPPE_REACTIONS,
  philippeAfterNpc: PHILIPPE_REACTIONS,
  door2610Helka: HELKA_REACTIONS,
  bodoNpc: BODO_REACTIONS,
  door2614Ennis: ENNIS_REACTIONS,
  mikaelNpc: MIKAEL_REACTIONS,
  mikaelNpcAfter: MIKAEL_REACTIONS,
  miraSpot36: MIRA_REACTIONS,
  miraSpot46: MIRA_REACTIONS,
  miraSpot56: MIRA_REACTIONS,
  miraInRoom: MIRA_REACTIONS,
  kowalkSpot: KOWALK_REACTIONS,
  brustSpot: BRUST_REACTIONS,
};

// ─── Spezielle Hotspot-Reaktionen (Geräte) ────────────────────

const RADIO_REACTIONS: ItemReactionMap = {
  tuningCrystal: [
    "Layard hält den Bernstein-Kristall an die Skala des Schmerz-Radios.",
    "Die Nadel zuckt. Sie zeigt auf eine Zahl, die nicht aufgedruckt ist —",
    "knapp jenseits der 104,6.",
    "Eine Sekunde lang ist das Brummen klar und nah. Dann ist es wieder weg.",
    "Layard legt den Kristall zurück in die Tasche. Noch nicht. Aber bald.",
  ],
  flyer: [
    "„Lauscht ihr?“ — Layard hält das Flugblatt an den Lautsprecher.",
    "Das Brummen ändert sich nicht. Die Worte schon.",
  ],
};

const TERMINAL_REACTIONS: ItemReactionMap = {
  exitCode: [
    "Acht Ziffern wollen ins Keypad, nicht ins Terminal.",
    "Layard nimmt den Zettel wieder runter.",
  ],
  protocol: [
    "Das Terminal hat keinen Schlitz für versiegelte Kapseln.",
    "Layard erinnert sich: Rohrpost. Manche Dinge gehen noch immer den Weg.",
  ],
  mikaelLetter: [
    "Layard hebt den Brief vor den Bildschirm. Hält ihn dort.",
    "„Nicht über das Terminal zu öffnen“, hat Mikael gesagt. Er hatte Recht.",
  ],
};

const KEYPAD_REACTIONS: ItemReactionMap = {
  exitCode: [
    "Layard tippt die acht Ziffern ein. Das Keypad piept einmal — grün.",
    "Hinter ihm ein leises Klacken: die Sektor-Tür ist entriegelt.",
  ],
};

const PHONE_REACTIONS: ItemReactionMap = {
  protocol: [
    "Man kann eine Datenkapsel nicht durch ein Telefonkabel schicken.",
    "Layard weiß das. Er versucht es trotzdem nicht.",
  ],
  mikaelLetter: [
    "„Nicht über das Terminal“, hat Mikael gesagt. „Nicht über das Telefon“,",
    "ergänzt Layard für sich.",
  ],
};

const HOTSPOT_REACTIONS: Record<string, ItemReactionMap> = {
  radio: RADIO_REACTIONS,
  terminal: TERMINAL_REACTIONS,
  bodoTerminal: TERMINAL_REACTIONS,
  keypadCall: KEYPAD_REACTIONS,
  phoneApt: PHONE_REACTIONS,
  phone2613: PHONE_REACTIONS,
  bodoPhone: PHONE_REACTIONS,
};

// ─── Item × Item Kombinationen ────────────────────────────────

function pairKey(a: InventoryItemId, b: InventoryItemId): string {
  return [a, b].sort().join("|");
}

const ITEM_PAIRS: Record<string, string[]> = {
  [pairKey("tuningCrystal", "flyer")]: [
    "Layard legt den Bernstein-Kristall auf das Flugblatt.",
    "Die Buchstaben werden nicht klarer. Aber er liest sie zum ersten Mal,",
    "ohne kurz wegschauen zu wollen.",
  ],
  [pairKey("mikaelLetter", "flyer")]: [
    "Brief und Flugblatt nebeneinander. Dieselbe Tinte? Schwer zu sagen.",
    "Aber dieselbe Hand, die nichts mehr verlieren kann.",
  ],
  [pairKey("protocol", "exitCode")]: [
    "Das Protokoll braucht keinen Code. Der Code braucht kein Protokoll.",
    "Sie liegen für einen Moment auf Layards Hand wie zwei Steine.",
  ],
  [pairKey("b3sample", "tuningCrystal")]: [
    "Layard hält den Kristall vor die grüne Flüssigkeit.",
    "Die B3-Probe leuchtet kurz auf, als hätte sie ihm zugezwinkert.",
    "Layard ist sich nicht sicher, ob das gerade wirklich passiert ist.",
  ],
};

// ─── Layards Standard-Sprüche ────────────────────────────────

const LAYARD_NOPE: string[] = [
  "Das hat aber nun wirklich noch nie funktioniert.",
  "Das ist so sinnvoll wie eine Nachricht der Leitstelle.",
  "Layard schaut beide Dinge an und kommt zu keinem Ergebnis.",
  "Nein. Auch beim zweiten Mal nicht.",
  "Das passt zusammen wie B2-Pampe und Geschmack.",
  "Layard legt es zurück, ohne es ausgesprochen zu haben.",
  "Das gibt das Standardprotokoll nicht her.",
  "Es bleibt, was es ist. Das ist meistens schon zu viel.",
  "Vielleicht später. Vielleicht morgen. Vielleicht nie.",
  "Layard wartet auf eine Eingebung. Es kommt keine.",
  "Das wäre eine Geschichte für Philippe. Die er nicht erzählen würde.",
  "Insa würde sagen: »Das ist nicht im Verzeichnis, Worag.« Und auflegen.",
];

function pickLakonisch(): string[] {
  const idx = Math.floor(Math.random() * LAYARD_NOPE.length);
  return ["LAYARD: " + LAYARD_NOPE[idx]];
}

// ─── Öffentliche API ─────────────────────────────────────────

export function combineItem(
  itemId: InventoryItemId,
  ctx: CombineContext,
): void {
  let lines: string[] | undefined;

  if (ctx.targetKind === "item") {
    const otherId = ctx.targetId as InventoryItemId;
    if (otherId === itemId) {
      lines = ["Layard schaut sich das eine Ding an. Es bleibt eines."];
    } else {
      // ── Akt-I-Pflichträtsel: Bleistift auf Vollmacht 4317 reibt
      //    den Trockensiegel-Abdruck heraus. Items bleiben erhalten —
      //    Layard braucht beide noch.
      const pair = pairKey(itemId, otherId);
      if (pair === pairKey("pencilStub", "b3Authorization")) {
        // Layard braucht ein dünnes Papier für die Reibung — der
        // Quittungsblock liefert es. Ohne den geht's nicht.
        if (!ctx.api.hasItem("quittungBlankoB")) {
          ctx.api.showText([
            "Layard braucht ein dünnes Stück Papier, um die Kontur",
            "des Trockensiegels herauszureiben. Carbon-Formularpapier",
            "wäre perfekt — aus der Kantine zum Beispiel.",
          ]);
          return;
        }
        if (!ctx.api.hasItem("siegelAbdruck")) {
          ctx.api.addItem({
            id: "siegelAbdruck",
            name: "Trockensiegel-Abdruck",
            description:
              "Ein dünnes, vergilbtes Blatt mit einer mit Bleistift abgeriebenen Kontur des Trockensiegels »BEWOHNERVERTRETUNG E67 / SCHICHT A«. Nicht ganz so scharf wie das Original, aber an den richtigen Stellen schwarz.",
          });
          ctx.api.setFlag("extractedSiegelAbdruck");
          ctx.api.showText([
            "Layard legt ein Stück Papier (vom Quittungsblock abgerissen) über",
            "die Vollmacht 4317 und reibt mit dem Stumpf des Bleistifts darüber.",
            "Langsam tritt der Trockensiegel-Stempel hervor:",
            "»BEWOHNERVERTRETUNG E67 / SCHICHT A«.",
            "Der Abdruck landet in der Aktentasche, beide Originale auch.",
          ]);
          return;
        } else {
          ctx.api.showText([
            "Einen Abdruck hat Layard schon. Mehr braucht er nicht.",
          ]);
          return;
        }
      }
      // ── Schmerz-Radio-Erweiterung: Verstärker-Antenne bauen.
      //    Bernstein-Kristall + Antennen-Draht → Verstärker-Antenne.
      //    Beide Bauteile bleiben in Layards Tasche (er braucht den
      //    Kristall noch, der Draht ist Teil der Antenne — narrativ
      //    abstrahiert).
      if (pair === pairKey("tuningCrystal", "antennaWire")) {
        if (!ctx.api.hasItem("amplifierAntenna")) {
          ctx.api.addItem({
            id: "amplifierAntenna",
            name: "Verstärker-Antenne (improvisiert)",
            description:
              "Eine kleine, gewickelte Spule — Antennen-Draht um den Bernstein-Resonator gelegt. Sieht selbstgebastelt aus. Soll Miras Sender so weit verstärken, dass er das alte Trauer-Band überschreibt.",
          });
          ctx.api.showText([
            "Layard wickelt den Antennen-Draht eng um den Bernstein-Resonator.",
            "Eine kleine, häßliche Spule entsteht. Sie summt, wenn er sie näher",
            "ans Schmerz-Radio hält.",
            "„Mira müsste damit was anfangen können.“",
          ]);
        } else {
          ctx.api.showText([
            "Eine Verstärker-Antenne hat Layard bereits.",
            "Eine zweite würde dasselbe tun.",
          ]);
        }
        return;
      }
      lines = ITEM_PAIRS[pairKey(itemId, otherId)];
    }
  } else {
    // Spezialfall: Code-Zettel auf das Keypad gezogen → Tür öffnet sich
    // direkt, ohne Umweg über das Tastenpad-Overlay.
    if (ctx.targetId === "keypadCall" && itemId === "exitCode") {
      if (!ctx.api.hasFlag("sectorDoorOpen")) {
        ctx.api.setFlag("sectorDoorOpen");
      }
    }
    // Spezialfall: Verstärker-Antenne an Mira (in jeder Mira-Szene).
    // Setzt das Flag, das das Resonanz-Duell im Schmerz-Radio scharf
    // schaltet. Item bleibt im Inventar — narrativ ist die Antenne
    // jetzt an Miras Sender; Layards Notiz davon bleibt.
    const miraHotspots = new Set([
      "miraSpot36",
      "miraSpot46",
      "miraSpot56",
      "miraInRoom",
    ]);
    if (
      itemId === "amplifierAntenna" &&
      miraHotspots.has(ctx.targetId) &&
      !ctx.api.hasFlag("miraHasAmplifier")
    ) {
      ctx.api.setFlag("miraHasAmplifier");
    }
    const hotspotMap = HOTSPOT_REACTIONS[ctx.targetId];
    const npcMap = NPC_REACTIONS[ctx.targetId];
    lines = hotspotMap?.[itemId] ?? npcMap?.[itemId];
  }

  if (!lines || lines.length === 0) {
    lines = pickLakonisch();
  }
  ctx.api.showText(lines);
}

export const LAYARD_LAKONISCH = LAYARD_NOPE;
