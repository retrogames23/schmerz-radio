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

/** NPC-Hotspot-IDs → Reaktionsmap. */
const NPC_REACTIONS: Record<string, ItemReactionMap> = {
  philippeNpc: PHILIPPE_REACTIONS,
  philippeAfterNpc: PHILIPPE_REACTIONS,
  door2610Helka: HELKA_REACTIONS,
  bodoNpc: BODO_REACTIONS,
  door2614Ennis: ENNIS_REACTIONS,
  mikaelNpc: MIKAEL_REACTIONS,
  miraSpot36: MIRA_REACTIONS,
  miraSpot46: MIRA_REACTIONS,
  miraSpot56: MIRA_REACTIONS,
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
  "Worag legt es zurück, ohne es ausgesprochen zu haben.",
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
