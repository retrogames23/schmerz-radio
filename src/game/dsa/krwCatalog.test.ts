import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import source from './rules/krw-source.fixture.json';
import { WEAPONS, matchWeaponId } from './rules/weapons';
import { addItem, emptyGear, equipWeapon, withWeaponIds, gearRestriction } from './gear';
import { heroCombatantFromCharacter } from './combat';

describe('KRW original table facts', () => {
  for (const row of source) {
    test(`${row.name}: ${row.tp}, ${row.hands ?? 'ranged/special'}`, () => {
      const weapon = WEAPONS[row.id];
      assert.ok(weapon, row.id);
      assert.equal(weapon.tp, row.tp);
      assert.equal(weapon.wv, row.wv);
      assert.equal(weapon.rangeSteps ?? null, row.rangeSteps);
      assert.equal(weapon.sourceHandedness, row.hands);
    });
  }
  for (const weapon of Object.values(WEAPONS)) {
    test(`${weapon.name} is recognized and equippable as loot`, () => {
      assert.equal(matchWeaponId(weapon.name), weapon.id);
      const gear = addItem(emptyGear(), { name: weapon.name });
      assert.equal(gear.items[0]?.weaponId, weapon.id);
      assert.equal(equipWeapon(gear, gear.items[0]?.id ?? '').weaponId, weapon.id);
    });
  }
});

test('Specific names do not collapse into old generic aliases', () => {
  assert.equal(matchWeaponId('alter Doppelkhunchomer'), 'doppelkhunchomer');
  assert.equal(matchWeaponId('meisterliche Basiliskenzunge'), 'basiliskenzunge_meisterlich');
  assert.equal(matchWeaponId('schweres Wurfnetz'), 'wurfnetz_schwer');
  assert.equal(matchWeaponId('zweihändige Orknase'), 'orknase_zweihaendig');
  assert.equal(matchWeaponId('Arbalette mit Kugeln'), 'arbalette_kugeln');
});

test('Ammunition, sheaths and handles are not weapons', () => {
  for (const name of ['Bolzen für Arbalette', 'Pfeile im Köcher', 'Dolchscheide', 'Schwertgriff']) {
    assert.equal(matchWeaponId(name), null);
  }
});

test('Old generic loot is upgraded and generated TP descriptions are refreshed', () => {
  const gear = withWeaponIds({ ...emptyGear(), items: [
    { id: 'f', name: 'Florett', weaponId: 'rapier' },
    { id: 's', name: 'Streitkolben', weaponId: 'keule', description: 'Waffe · TP 1W+3' },
    { id: 'd', name: 'Dolch', weaponId: 'dolch', description: 'Geschenk von Alrik.' },
  ] });
  assert.equal(gear.items[0].weaponId, 'florett');
  assert.equal(gear.items[1].weaponId, 'streitkolben');
  assert.equal(gear.items[1].description, 'Waffe · TP 1W+4');
  assert.equal(gear.items[2].description, 'Geschenk von Alrik.');
  assert.deepEqual(withWeaponIds(gear), gear);
});

test('Corrected Kriegshammer damage reaches combat', () => {
  const gear = equipWeapon(addItem(emptyGear(), { name: 'Kriegshammer' }), 'kriegshammer');
  const ch = { name: 'Test', className: 'Krieger', classId: 'krieger', le: 30, leMax: 30, ae: null,
    rerolled: false, attrs: { MU: 12, KL: 12, CH: 12, FF: 12, GE: 12, IN: 12, KK: 12 } };
  const fighter = heroCombatantFromCharacter(ch, { gear });
  assert.equal(fighter.tpDice, 2);
  assert.equal(fighter.tpBonus, 3);
});

test('Special nets cannot invent damage or bypass mage weapon limits', () => {
  assert.notEqual(gearRestriction('magier', emptyGear(), { weaponId: 'arbalone' }), null);
  assert.notEqual(gearRestriction('krieger', emptyGear(), { weaponId: 'wurfnetz' }), null);
  assert.notEqual(gearRestriction('krieger', emptyGear(), { weaponId: 'pike_vierhaendig' }), null);
});
