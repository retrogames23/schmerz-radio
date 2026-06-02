## Ziel

DSA-Helden bekommen eine sichtbare Ausrüstungssicht (Inventar + Waffe + Rüstung). Standardausrüstung pro Klasse, Wirkung auf AT/PA/TP/RS im Kampf, der LLM-Meister verwaltet sie und kennt zusätzlich Inventar von Brem und Yelva. Kein Bruchfaktor.

## Datenmodell

Erweiterung von `DsaHero` (in `src/game/types.ts`) — wird in `dsa_heroes.hero` JSONB persistiert, kein DB-Migrations-Bedarf:

```text
gear: {
  weaponId: string | null   // ref WEAPONS aus rules/weapons.ts
  armorId:  string | null   // ref neuer ARMORS-Tabelle
  shieldId: string | null   // optional, für Schild-PA-Bonus
  items: { id: string; name: string; description?: string; count?: number }[]
}
```

`items` ist ein freier Topf (keine `InventoryItemId`-Enum-Pflicht), damit der Meister auch Story-Gegenstände vergeben kann („Brief des Barons", „silberner Schlüssel").

## Neue Module

**`src/game/dsa/rules/armor.ts`** — Tabelle `ARMORS` analog zu `WEAPONS`: id, name, rs, beBonus (Behinderung), gewicht. Standardrüstungen: keine, Lederrüstung (RS 1), Kettenhemd (RS 3), Plattenharnisch (RS 5), Robe (RS 0), Schild (PA +2). Plus `armorsForPrompt()` für den System-Prompt.

**`src/game/dsa/gear.ts`** — Helfer:
- `defaultGearFor(classId)` → Standard­ausrüstung pro Klasse (z. B. Krieger: Anderthalbhänder + Kettenhemd; Streuner: Dolch + Lederrüstung + Wurfmesser ×3; Magier: Stab + Robe; Thorwaler: Streitaxt + Schild + Lederrüstung; usw.)
- `defaultGearForCompanion("brem" | "yelva")` → feste Ausrüstung der Begleiter
- `addItem(gear, item)`, `removeItem(gear, idOrName)` — reine Funktionen
- `serializeGearForPrompt(gear)` → kompakte Textzeile für den Meister

## Kampfwerte vom Equipment ableiten

`heroCombatantFromCharacter` in `src/game/dsa/combat.ts` zieht künftig AT/PA/TP/RS aus der Ausrüstung, nicht mehr (allein) aus `CLASS_COMBAT_PROFILES`:

- Wenn `gear.weaponId` gesetzt: TP aus `WEAPONS[id].tp` parsen, AT/PA-Modifier addieren, Waffenname für Log.
- Wenn `gear.armorId` gesetzt: RS aus `ARMORS[id].rs`.
- Wenn `gear.shieldId` gesetzt: PA-Bonus.
- Fallback (kein Gear gesetzt) bleibt das alte `CLASS_COMBAT_PROFILES` — bestehende Helden ohne Gear brechen nicht.

Bestehende Eigenschafts-Boni (KK/GE/IN) bleiben unverändert.

## LLM-Meister: Marker und Wissen

`src/game/dsa/llmMasterPrompt.ts` und `llmAdventure.ts`:

1. Neuer Inventar-Block im System-Prompt:
   - Layards Inventar/Waffe/Rüstung + alle Items mit Kurzbeschreibung
   - Brems Inventar (fest: Dolch, Diebeswerkzeug, Wurfmesser, kleiner Geldbeutel)
   - Yelvas Inventar (fest: Elfenbogen, 20 Pfeile, Säbel, Heilkräuter, Silberkette)
   - Pflicht-Regel: „Wenn Layard sein Inventar einsetzen will, prüfe ob das Item dort steht. Entscheide als Meister, was geschieht."

2. Neue optionale Marker im Ausgabeformat:
   - `[ITEM+: name | kurzbeschreibung]` — fügt Layards Inventar etwas hinzu
   - `[ITEM-: name]` — streicht ein Item (verloren, verbraucht, kaputt, verpatzte Probe)
   - Mehrere Marker pro Antwort erlaubt. Keine Wirkung auf Brem/Yelva-Inventar (das verwaltet der Spielleiter narrativ).

3. Parser in `parseMasterTurn` ergänzen: `itemsAdded[]`, `itemsRemoved[]` ins `ParsedMasterTurn`.

4. Server (`src/routes/api/public/dsa-master.ts`) wendet die Item-Marker nach jedem Meisterzug auf `dsa_heroes.hero.gear.items` an und schreibt zurück. Hartlimit: max 25 Items.

## UI

**`DsaCharacterSheet.tsx`** bekommt eine neue Sektion „Ausrüstung":
- Waffe (Name + TP/AT/PA), Rüstung (Name + RS), Schild falls vorhanden
- Item-Liste (Name, Kurzbeschreibung, Anzahl)
- Rein lesend — Vergabe/Streichung kommt nur vom Meister
- Die bestehende „Kampfwerte (im Abenteuer)"-Sektion zeigt automatisch die abgeleiteten Werte (kommt schon aus `heroCombatantFromCharacter`)

**Charakter-Erstellung** (`DsaCharacterCreator.tsx`): am Ende `defaultGearFor(classId)` einfüllen, sodass jeder neue Held mit Standardausrüstung startet. Bestehende Helden ohne `gear` bekommen beim ersten Laden lazy ein `defaultGearFor(classId)` (Migration in `upgradeToHero` in `advancement.ts`).

## Was nicht passiert

- Keine DB-Migration (Gear liegt im bestehenden `hero` JSONB).
- Kein Bruchfaktor, keine Waffenkampf-Patzer-Effekte.
- Keine Änderung der scripted Mini-Kampagne (`DsaAdventureScene`) — die nutzt fest verdrahtete Klassenwerte und wird nicht angefasst, falls keine ausdrückliche Bitte kommt.
- Brem/Yelva-Inventar wird im Code fest definiert; der Meister darf es erzählerisch nutzen, aber nicht per Marker ändern (sonst wird die Quelle der Wahrheit unklar).

## Geänderte/neue Dateien

- neu: `src/game/dsa/rules/armor.ts`, `src/game/dsa/gear.ts`
- geändert: `src/game/types.ts` (DsaHero.gear), `src/game/dsa/combat.ts` (Equipment → Kampfwerte), `src/game/dsa/advancement.ts` (Lazy-Gear bei Upgrade), `src/game/dsa/creator/data.ts` oder `DsaCharacterCreator.tsx` (Default-Gear bei Erschaffung), `src/components/game/DsaCharacterSheet.tsx` (Ausrüstungs-Sektion), `src/game/dsa/llmAdventure.ts` (Marker-Parser), `src/game/dsa/llmMasterPrompt.ts` (Inventar-Block + Marker-Doku), `src/routes/api/public/dsa-master.ts` (Marker auf Heldenakte anwenden), `src/game/dsa/rules/index.ts` (armorsForPrompt einbinden).
