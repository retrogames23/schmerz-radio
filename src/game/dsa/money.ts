/**
 * DSA3-Geldsystem: Münzen liegen als zählbare Inventar-Items im Gepäck.
 * 1 Dukat = 10 Silbertaler = 100 Heller = 1000 Kreuzer.
 * Rechenbasis ist der Kreuzer; Zahlungen wechseln automatisch.
 */
import type { GearItem, HeroGear } from "./gear";

export interface CoinDef {
  id: "dukaten" | "silbertaler" | "heller" | "kreuzer";
  name: string;
  short: string;
  kreuzer: number;
  description: string;
}

export const COINS: CoinDef[] = [
  { id: "dukaten", name: "Dukaten", short: "D", kreuzer: 1000, description: "Gold, mittelreichische Prägung." },
  { id: "silbertaler", name: "Silbertaler", short: "S", kreuzer: 100, description: "Gängige Silbermünze." },
  { id: "heller", name: "Heller", short: "H", kreuzer: 10, description: "Kupfermünze für den Alltag." },
  { id: "kreuzer", name: "Kreuzer", short: "K", kreuzer: 1, description: "Kleinste Münze." },
];

export const MAX_COIN_COUNT = 9999;

/** Erkennt Münznamen (Dukat, Silberling, Taler, Heller, Kreuzer). */
export function coinFor(nameOrId: string): CoinDef | null {
  const s = (nameOrId || "").toLowerCase();
  if (/dukat/.test(s)) return COINS[0];
  if (/silber(taler|ling|münz)|^taler|^silbertaler$|^reisegeld$/.test(s)) return COINS[1];
  if (/heller/.test(s)) return COINS[2];
  if (/kreuzer/.test(s)) return COINS[3];
  return null;
}

/** Wert der Münzen im Inventar in Kreuzer. */
export function purseKreuzer(gear: HeroGear): number {
  let sum = 0;
  for (const it of gear.items) {
    const c = coinFor(it.id);
    if (c) sum += c.kreuzer * (it.count ?? 1);
  }
  return sum;
}

/** "3 D, 4 S, 2 H" bzw. "leer". */
export function formatKreuzer(k: number): string {
  if (k <= 0) return "leer";
  const parts: string[] = [];
  let rest = k;
  for (const c of COINS) {
    const n = Math.floor(rest / c.kreuzer);
    rest -= n * c.kreuzer;
    if (n > 0) parts.push(`${n} ${c.short}`);
  }
  return parts.join(", ");
}

/** Zerlegt einen Kreuzer-Betrag in möglichst wenige Münzen. */
function toCoinItems(k: number): GearItem[] {
  const out: GearItem[] = [];
  let rest = Math.max(0, Math.round(k));
  for (const c of COINS) {
    const n = Math.min(MAX_COIN_COUNT, Math.floor(rest / c.kreuzer));
    rest -= n * c.kreuzer;
    if (n > 0) out.push({ id: c.id, name: c.name, description: c.description, count: n > 1 ? n : undefined });
  }
  return out;
}

/** Ersetzt alle Münz-Items durch eine normalisierte Geldkatze. */
function withPurse(gear: HeroGear, k: number): HeroGear {
  const items = gear.items.filter((it) => !coinFor(it.id));
  return { ...gear, items: [...items, ...toCoinItems(k)] };
}

/** Zählt den Betrag zur Geldkatze (Münzen bleiben gestückelt, wie erhalten). */
export function addCoins(gear: HeroGear, coin: CoinDef, count: number): HeroGear {
  const n = Math.max(1, Math.min(MAX_COIN_COUNT, Math.round(count)));
  const items = [...gear.items];
  const idx = items.findIndex((it) => it.id === coin.id);
  if (idx >= 0) {
    const cur = items[idx];
    const next = Math.min(MAX_COIN_COUNT, (cur.count ?? 1) + n);
    items[idx] = { ...cur, name: coin.name, count: next > 1 ? next : undefined };
  } else {
    items.push({ id: coin.id, name: coin.name, description: coin.description, count: n > 1 ? n : undefined });
  }
  return { ...gear, items };
}

/**
 * Zahlt einen Betrag (Kreuzer). Reicht das Geld nicht, bleibt das Inventar
 * unverändert und ok=false. Wechselgeld wird automatisch herausgegeben.
 */
export function payKreuzer(gear: HeroGear, k: number): { gear: HeroGear; ok: boolean } {
  const amount = Math.max(0, Math.round(k));
  if (amount === 0) return { gear, ok: true };
  const have = purseKreuzer(gear);
  if (have < amount) return { gear, ok: false };
  // Erst exakt mit vorhandenen Münzen versuchen, sonst wechseln.
  let rest = amount;
  let g = gear;
  for (const c of [...COINS].reverse()) {
    const it = g.items.find((x) => x.id === c.id);
    if (!it || rest <= 0) continue;
    const use = Math.min(it.count ?? 1, Math.floor(rest / c.kreuzer));
    if (use > 0) {
      g = removeCoinCount(g, c.id, use);
      rest -= use * c.kreuzer;
    }
  }
  if (rest === 0) return { gear: g, ok: true };
  return { gear: withPurse(g, purseKreuzer(g) - rest), ok: true };
}

function removeCoinCount(gear: HeroGear, id: string, n: number): HeroGear {
  const items = [...gear.items];
  const idx = items.findIndex((it) => it.id === id);
  if (idx < 0) return gear;
  const left = (items[idx].count ?? 1) - n;
  if (left <= 0) items.splice(idx, 1);
  else items[idx] = { ...items[idx], count: left > 1 ? left : undefined };
  return { ...gear, items };
}

/** Wandelt Altlasten wie „Reisegeld ×10" in echte Silbertaler um. */
export function normalizeCoins(gear: HeroGear): HeroGear {
  const legacy = gear.items.find((it) => it.id === "reisegeld");
  if (!legacy) return gear;
  const g = { ...gear, items: gear.items.filter((it) => it.id !== "reisegeld") };
  return addCoins(g, COINS[1], legacy.count ?? 10);
}

/**
 * Parst "+5 Dukaten", "-3 S 4 H", "12 Silbertaler" in Kreuzer (mit Vorzeichen).
 * Liefert null bei unlesbarer Angabe.
 */
export function parseMoney(raw: string): number | null {
  const s = (raw || "").trim();
  const sign = /^-|^−/.test(s) ? -1 : 1;
  const body = s.replace(/^[+\-−]\s*/, "");
  const re = /(\d{1,5})\s*([A-Za-zÄÖÜäöü]+)/g;
  let total = 0;
  let found = false;
  for (const m of body.matchAll(re)) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    const coin =
      coinFor(unit) ??
      (unit === "d" ? COINS[0] : unit === "s" ? COINS[1] : unit === "h" ? COINS[2] : unit === "k" ? COINS[3] : null);
    if (!coin) continue;
    total += n * coin.kreuzer;
    found = true;
  }
  if (!found) return null;
  return sign * Math.min(total, 1000 * 500);
}

/**
 * Wendet einen Geld-Delta an. Positiv: Münzen werden passend gestückelt
 * zugefügt; negativ: Zahlung mit Wechselgeld (bei zu wenig Geld: alles weg).
 */
export function applyMoneyDelta(gear: HeroGear, k: number): HeroGear {
  if (k > 0) {
    let g = gear;
    for (const it of toCoinItems(k)) {
      const c = coinFor(it.id)!;
      g = addCoins(g, c, it.count ?? 1);
    }
    return g;
  }
  if (k < 0) {
    const res = payKreuzer(gear, -k);
    return res.ok ? res.gear : withPurse(gear, 0);
  }
  return gear;
}
