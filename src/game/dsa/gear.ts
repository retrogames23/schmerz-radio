import type { DsaClassId } from "./classes";
import { WEAPONS } from "./rules/weapons";
import { ARMORS } from "./rules/armor";

/** Freier Item-Slot im Held-Inventar. Story-Items dürfen frei benannt werden. */
export interface GearItem {
  /** Lower-snake-case-Identifier, vom Code oder vom Meister vergeben. */
  id: string;
  /** Anzeigename. */
  name: string;
  /** Kurzbeschreibung (1 Satz). */
  description?: string;
  /** Stückzahl (Default 1). */
  count?: number;
  /**
   * Optionale Marker: Wenn ein Item gleichzeitig eine ausrüstbare Waffe,
   * Rüstung oder ein Schild ist, zeigt diese ID auf den Eintrag in
   * WEAPONS / ARMORS. Wird vom Heldenbogen verwendet, um „Ausrüsten"
   * anzubieten. Standard-Inventar und vom Meister vergebene Story-Items
   * lassen das Feld leer.
   */
  weaponId?: string;
  armorId?: string;
  shieldId?: string;
}

export interface HeroGear {
  /** Schlüssel in WEAPONS, oder null = unbewaffnet (Faust/Stab nach Klasse). */
  weaponId: string | null;
  /** Schlüssel in ARMORS, oder null = "keine". */
  armorId: string | null;
  /** Schlüssel in ARMORS (kind="shield"), oder null. */
  shieldId: string | null;
  /** Freier Item-Topf — Heilkräuter, Briefe, Schlüssel, Trankflaschen, … */
  items: GearItem[];
}

export const MAX_GEAR_ITEMS = 25;

export function emptyGear(): HeroGear {
  return { weaponId: null, armorId: null, shieldId: null, items: [] };
}

/** Standardausrüstung pro Klasse — wird bei der Erschaffung verteilt. */
export function defaultGearFor(classId: DsaClassId | string): HeroGear {
  switch (classId) {
    case "krieger":
      return {
        weaponId: "langschwert",
        armorId: "kettenhemd",
        shieldId: "rundschild",
        items: [
          { id: "dolch_im_guertel", name: "Dolch im Gürtel", description: "Schmal, gut versteckt.", count: 1 },
          { id: "reisegeld", name: "Reisegeld", description: "10 Silbertaler in einem Lederbeutel.", count: 10 },
          { id: "trinkschlauch", name: "Trinkschlauch", description: "Halber Liter Wasser, leicht abgestanden." },
        ],
      };
    case "thorwaler":
      return {
        weaponId: "streitaxt",
        armorId: "lederruestung",
        shieldId: "rundschild",
        items: [
          { id: "metflasche", name: "Metflasche", description: "Süßer Honigmet aus Thorwal." },
          { id: "walzahn_amulett", name: "Walzahn-Amulett", description: "Glücksbringer, von Mutter geschnitzt." },
          { id: "reisegeld", name: "Reisegeld", description: "8 Silbertaler.", count: 8 },
        ],
      };
    case "zwerg":
      return {
        weaponId: "streitaxt",
        armorId: "kettenhemd",
        shieldId: null,
        items: [
          { id: "schmiedehammer", name: "kleiner Schmiedehammer", description: "Werkzeug und Waffe." },
          { id: "zunder_und_feuerstein", name: "Zunder und Feuerstein", description: "Macht überall Feuer." },
          { id: "reisegeld", name: "Reisegeld", description: "12 Silbertaler, gut gezählt.", count: 12 },
          { id: "doerrfleisch", name: "Dörrfleisch", description: "Drei Streifen, zäh aber nahrhaft.", count: 3 },
        ],
      };
    case "streuner":
      return {
        weaponId: "dolch",
        armorId: "lederwams",
        shieldId: null,
        items: [
          { id: "wurfmesser", name: "Wurfmesser", description: "Drei kleine, gut ausbalanciert.", count: 3 },
          { id: "dietrich_set", name: "Dietrich-Set", description: "Kleines Lederetui mit fünf Dietrichen." },
          { id: "geldbeutel", name: "geschnittener Geldbeutel", description: "Mit anderer Leute Münzen.", count: 14 },
          { id: "doppelbecher", name: "präparierter Doppelbecher", description: "Für unehrliche Trinkspiele." },
        ],
      };
    case "gaukler":
      return {
        weaponId: "dolch",
        armorId: "lederwams",
        shieldId: null,
        items: [
          { id: "spielkarten", name: "abgegriffene Spielkarten", description: "Komplett, manche markiert." },
          { id: "jonglierbaelle", name: "drei Jonglierbälle", description: "Aus Leder, mit Sand gefüllt.", count: 3 },
          { id: "fluestertoetchen", name: "Flötchen aus Knochen", description: "Klingt schief, aber lustig." },
          { id: "reisegeld", name: "Reisegeld", description: "6 Silbertaler, der Rest ist Kupfer.", count: 6 },
        ],
      };
    case "magier":
      return {
        weaponId: "stab",
        armorId: "robe",
        shieldId: null,
        items: [
          { id: "zauberbuch", name: "Zauberbuch", description: "Schwer, abgegriffen, voller Notizen." },
          { id: "tintenfass", name: "Tintenfass mit Feder", description: "Akademie-Standard, gut gefüllt." },
          { id: "kraeuter_beutel", name: "Kräuterbeutel", description: "Mistelblätter, Salbei, drei Wurzeln." },
          { id: "reisegeld", name: "Reisegeld", description: "20 Silbertaler — die Akademie zahlt anständig.", count: 20 },
        ],
      };
    case "druide":
      return {
        weaponId: "stab",
        armorId: "lederwams",
        shieldId: null,
        items: [
          { id: "sichelmesser", name: "Sichelmesser", description: "Bronzene Klinge, Eichengriff." },
          { id: "mistelzweig", name: "geweihter Mistelzweig", description: "Frisch geschnitten, leicht klebrig." },
          { id: "heilkraeuter", name: "Heilkräuter", description: "Drei Dosen Salbe (W6 LE pro Anwendung).", count: 3 },
          { id: "reisegeld", name: "Reisegeld", description: "4 Silbertaler — mehr braucht ein Druide nicht.", count: 4 },
        ],
      };
    case "elf":
      return {
        weaponId: "langbogen",
        armorId: "lederwams",
        shieldId: null,
        items: [
          { id: "pfeile", name: "Pfeile im Köcher", description: "Mit Federn aus dem heimischen Wald.", count: 20 },
          { id: "saebel_kurz", name: "kurzer Säbel", description: "Für den Fall, dass jemand zu nah kommt." },
          { id: "elfenbrot", name: "Elfenbrot", description: "Zwei Stücke. Sättigen eine ganze Tagesreise.", count: 2 },
          { id: "silberkette", name: "Silberne Halskette", description: "Familienschmuck, blasses Mondsilber." },
        ],
      };
    default:
      return emptyGear();
  }
}

/** Feste Ausrüstung der Begleitfiguren — narrative Quelle der Wahrheit. */
export const COMPANION_GEAR: Record<"brem" | "yelva", HeroGear> = {
  brem: {
    weaponId: "dolch",
    armorId: "lederwams",
    shieldId: null,
    items: [
      { id: "wurfmesser", name: "Wurfmesser", description: "Vier Stück, im Stiefel und am Gürtel.", count: 4 },
      { id: "dietrich_set", name: "Dietrich-Set", description: "Klein, ledergefaßt, oft benutzt." },
      { id: "geldbeutel", name: "kleiner Geldbeutel", description: "Selten voll, immer halbleer." },
      { id: "schwarzbrot", name: "Schwarzbrot", description: "Trocken, hält ewig.", count: 2 },
    ],
  },
  yelva: {
    weaponId: "langbogen",
    armorId: "lederwams",
    shieldId: null,
    items: [
      { id: "pfeile", name: "Pfeile im Köcher", description: "Mit grünen Federn aus dem Salamandersteinwald.", count: 18 },
      { id: "saebel_kurz", name: "Säbel", description: "Schmal, elfischer Schmiedearbeit." },
      { id: "heilkraeuter", name: "Heilkräuter", description: "Zwei Dosen Salbe, wirken auch bei Vergiftung.", count: 2 },
      { id: "silberkette", name: "Silberkette mit Mondstein", description: "Erbstück, leuchtet schwach in Vollmondnächten." },
      { id: "elfenbrot", name: "Elfenbrot", description: "Vier Stücke, geteilt mit Brem nur ungern.", count: 4 },
    ],
  },
};

function normalizeId(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "item";
}

/** Fügt ein Item hinzu (oder zählt den count hoch, wenn es schon da ist). */
export function addItem(
  gear: HeroGear,
  input: { name: string; description?: string; count?: number; id?: string },
): HeroGear {
  const name = (input.name || "").trim().slice(0, 60);
  if (!name) return gear;
  const id = input.id ? normalizeId(input.id) : normalizeId(name);
  const count = Math.max(1, Math.min(99, Math.round(input.count ?? 1)));
  const description = (input.description || "").trim().slice(0, 160) || undefined;
  const items = [...gear.items];
  const existing = items.findIndex((it) => it.id === id);
  if (existing >= 0) {
    const cur = items[existing];
    items[existing] = {
      ...cur,
      count: (cur.count ?? 1) + count,
      description: cur.description ?? description,
    };
  } else {
    if (items.length >= MAX_GEAR_ITEMS) return gear;
    items.push({ id, name, description, count: count > 1 ? count : undefined });
  }
  return { ...gear, items };
}

/** Streicht ein Item per ID oder Name (case-insensitive, Teilstring erlaubt). */
export function removeItem(gear: HeroGear, idOrName: string): HeroGear {
  const needle = (idOrName || "").trim().toLowerCase();
  if (!needle) return gear;
  const normNeedle = normalizeId(needle);
  const idx = gear.items.findIndex(
    (it) =>
      it.id === normNeedle ||
      it.name.toLowerCase() === needle ||
      it.name.toLowerCase().includes(needle),
  );
  if (idx < 0) return gear;
  const items = [...gear.items];
  items.splice(idx, 1);
  return { ...gear, items };
}

/** Wirft das Item mit der gegebenen id raus (genaues Match). */
export function discardItemById(gear: HeroGear, id: string): HeroGear {
  const idx = gear.items.findIndex((it) => it.id === id);
  if (idx < 0) return gear;
  const items = [...gear.items];
  items.splice(idx, 1);
  return { ...gear, items };
}

/**
 * Rüstet eine Waffe aus dem Inventar aus. Die bisherige Hauptwaffe wandert
 * zurück ins Inventar (mit weaponId-Marker, damit man sie wieder anlegen
 * kann). Items ohne weaponId-Marker bleiben unverändert.
 */
export function equipWeapon(gear: HeroGear, itemId: string): HeroGear {
  const idx = gear.items.findIndex((it) => it.id === itemId && it.weaponId);
  if (idx < 0) return gear;
  const target = gear.items[idx];
  const items = gear.items.filter((_, i) => i !== idx);
  const prevId = gear.weaponId;
  if (prevId) {
    const w = WEAPONS[prevId];
    if (w && items.length < MAX_GEAR_ITEMS) {
      items.push({
        id: `weapon_${prevId}`,
        name: w.name,
        description: `Waffe · TP ${w.tp}`,
        weaponId: prevId,
      });
    }
  }
  return { ...gear, weaponId: target.weaponId!, items };
}

/** Legt die Waffe ab — Slot wird leer, Waffe als Item ins Inventar. */
export function unequipWeapon(gear: HeroGear): HeroGear {
  const prevId = gear.weaponId;
  if (!prevId) return gear;
  const w = WEAPONS[prevId];
  const items = [...gear.items];
  if (w && items.length < MAX_GEAR_ITEMS) {
    items.push({
      id: `weapon_${prevId}`,
      name: w.name,
      description: `Waffe · TP ${w.tp}`,
      weaponId: prevId,
    });
  }
  return { ...gear, weaponId: null, items };
}

/** Rüstet eine Rüstung aus dem Inventar an; bisherige wandert zurück. */
export function equipArmor(gear: HeroGear, itemId: string): HeroGear {
  const idx = gear.items.findIndex((it) => it.id === itemId && it.armorId);
  if (idx < 0) return gear;
  const target = gear.items[idx];
  const items = gear.items.filter((_, i) => i !== idx);
  const prevId = gear.armorId;
  if (prevId) {
    const a = ARMORS[prevId];
    if (a && items.length < MAX_GEAR_ITEMS) {
      items.push({
        id: `armor_${prevId}`,
        name: a.name,
        description: `Rüstung · RS ${a.rs}`,
        armorId: prevId,
      });
    }
  }
  return { ...gear, armorId: target.armorId!, items };
}

export function unequipArmor(gear: HeroGear): HeroGear {
  const prevId = gear.armorId;
  if (!prevId) return gear;
  const a = ARMORS[prevId];
  const items = [...gear.items];
  if (a && items.length < MAX_GEAR_ITEMS) {
    items.push({
      id: `armor_${prevId}`,
      name: a.name,
      description: `Rüstung · RS ${a.rs}`,
      armorId: prevId,
    });
  }
  return { ...gear, armorId: null, items };
}

export function equipShield(gear: HeroGear, itemId: string): HeroGear {
  const idx = gear.items.findIndex((it) => it.id === itemId && it.shieldId);
  if (idx < 0) return gear;
  const target = gear.items[idx];
  const items = gear.items.filter((_, i) => i !== idx);
  const prevId = gear.shieldId;
  if (prevId) {
    const s = ARMORS[prevId];
    if (s && items.length < MAX_GEAR_ITEMS) {
      items.push({
        id: `shield_${prevId}`,
        name: s.name,
        description: `Schild · PA+${s.paBonus ?? 0}`,
        shieldId: prevId,
      });
    }
  }
  return { ...gear, shieldId: target.shieldId!, items };
}

export function unequipShield(gear: HeroGear): HeroGear {
  const prevId = gear.shieldId;
  if (!prevId) return gear;
  const s = ARMORS[prevId];
  const items = [...gear.items];
  if (s && items.length < MAX_GEAR_ITEMS) {
    items.push({
      id: `shield_${prevId}`,
      name: s.name,
      description: `Schild · PA+${s.paBonus ?? 0}`,
      shieldId: prevId,
    });
  }
  return { ...gear, shieldId: null, items };
}

/** Kompakte Textzeile für den System-Prompt. */
export function serializeGearForPrompt(gear: HeroGear): string {
  const weapon = gear.weaponId && WEAPONS[gear.weaponId];
  const armor = gear.armorId && ARMORS[gear.armorId];
  const shield = gear.shieldId && ARMORS[gear.shieldId];
  const lines: string[] = [];
  lines.push(
    `  Waffe:   ${weapon ? `${weapon.name} (TP ${weapon.tp})` : "— unbewaffnet —"}`,
  );
  lines.push(
    `  Rüstung: ${armor ? `${armor.name} (RS ${armor.rs})` : "— keine —"}`,
  );
  if (shield) lines.push(`  Schild:  ${shield.name} (PA+${shield.paBonus ?? 0})`);
  if (gear.items.length === 0) {
    lines.push("  Inventar: (leer)");
  } else {
    lines.push("  Inventar:");
    for (const it of gear.items) {
      const qty = (it.count ?? 1) > 1 ? ` ×${it.count}` : "";
      const desc = it.description ? ` — ${it.description}` : "";
      lines.push(`    • ${it.name}${qty}${desc}`);
    }
  }
  return lines.join("\n");
}

/** Inventar-Block für Brem und Yelva (statisch). */
export function serializeCompanionGearForPrompt(): string {
  const parts: string[] = [];
  parts.push("BREM (Streuner):");
  parts.push(serializeGearForPrompt(COMPANION_GEAR.brem));
  parts.push("");
  parts.push("YELVA (Elfe):");
  parts.push(serializeGearForPrompt(COMPANION_GEAR.yelva));
  return parts.join("\n");
}