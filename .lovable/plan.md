## Ziel

Das Kampf-Overlay soll nicht mehr nur eine abstrakte Taktik auswerten, sondern auch die unmittelbar vor Kampfbeginn formulierten Befehle berücksichtigen:

- „Yelva, bleib hinten und leg Pfeile auf“ soll ihre Rolle im Kampf tatsächlich ändern.
- Befehle wie „Yelva, blend den Gegner“ sollen sichtbare Kampfwert-Auswirkungen haben.
- Magiebegabte Helden sollen ihre bekannten Zauber per Prompt im Kampf einsetzen können.
- Magier/Elfen/Druiden dürfen nicht mehr fälschlich als unmagisch behandelt werden, wenn ihr Zauberbuch vorhanden oder ableitbar ist.

## Befund

- Der LLM-Meister löst Kämpfe nicht selbst aus; er setzt nur `[COMBAT: ...]`. Danach übernimmt `DsaCombatInteractive` deterministisch.
- Dieses Overlay bekommt aktuell nur `heroes`, `foes`, `player`, aber keine freie Spieleranweisung aus dem Dialog.
- Yelva/Brem werden immer mit festen Standardwerten erzeugt; Formation/Rolle wird nicht gespeichert.
- Gegner wählen als Ziel aktuell meist den schwächsten Helden. Dadurch landet Yelva trotz „bleib hinten“ plausibilitätswidrig in der ersten Reihe.
- Kampfzauber existieren nur für Layard über Magie-Taktiken, aber nicht als konkrete Prompt-Absicht („ich wirke Ignifaxius“, „ich blende ihn“).
- Die Magier-Fehlmeldung entsteht wahrscheinlich, weil manche Pfade nur `DsaCharacterSummary` nutzen. Dieser Snapshot enthält kein `spells`; `upgradeToHero/defaultSpells` füllt das Zauberbuch erst später. Wenn `loadHeroSpells` nichts liefert, interpretiert der Prompt das als „nicht magiebegabt“.

## Plan

1. **Combat-Intent-Datenmodell ergänzen**
   - Einen kleinen Typ für Kampfbefehle einführen, z. B.:
     - Layard: gewünschter Zauber / Magiefokus / defensive Position
     - Yelva: `backline`, `ranged`, `blind`, `protective`
     - Brem: `flank`, `protect`, `cunning`, `holdBack`
   - Keine offene LLM-Mechanik: nur eine feste, sichere Menge an erkannten Absichten.

2. **Freie Spielerprompts vor Kampfbeginn auswerten**
   - Beim Eingang eines `[COMBAT]` im Client die letzte Spieler-Eingabe auswerten.
   - Zusätzlich die letzten sichtbaren Meister-/Yelva-/Brem-Zeilen berücksichtigen, falls die LLM den Befehl gerade bestätigt hat.
   - Einfache deutsche Heuristiken reichen zunächst:
     - „Yelva/Elfe … hinten“, „bleib hinten“, „Deckung“, „Pfeile“, „Bogen“ → Yelva bleibt hinten und nutzt Fernkampf.
     - „Yelva … blenden“, „blend(e)“ → Yelva versucht einen Blend-/Ablenkungseffekt.
     - „Brem … flank“, „ablenken“, „hinterhalt“, „trick“ → Brem stört Gegner statt stumpf zuzustechen.
     - „ich wirke <Zaubername>“, „Ignifaxius“, „Fulminictus“, „Balsam“, „Blitz“ → konkreter Layard-Zauberwunsch.

3. **Gefährtenrollen mechanisch wirksam machen**
   - `Combatant` um Rolle/Position erweitern (`frontline`, `backline`, `support`).
   - Zielauswahl der Gegner anpassen:
     - Frontlinie wird bevorzugt angegriffen.
     - Backline wird deutlich seltener Ziel, außer alle Frontkämpfer liegen oder es gibt Fernkämpfer-Gegner.
   - Yelva im Backline-Modus:
     - weniger Parade-/Nahkampf-Interaktion,
     - bleibt mit Elfenbogen auf Distanz,
     - wird im Log auch so beschrieben.
   - Brem/Yelva-Aktionen bekommen je nach Befehl kleine, transparente Modifikatoren statt nur Flavour.

4. **Blend-/Kontrollzauber als Kampfwert-Effekt abbilden**
   - Für „blenden“ einen klaren Effekt implementieren: z. B. ein Gegner erhält für 1 Runde `AT -3` und `PA -2` oder verliert seinen Angriff bei sehr gutem Erfolg.
   - Der Effekt erscheint im Kampfprotokoll mit Würfel-/Erfolgsinformation.
   - Falls der Effekt von Yelva kommt, wird er als Yelvas Aktion dargestellt und nicht Layard zugeschrieben.

5. **Konkrete Zauber per Prompt für Layard ermöglichen**
   - Neben „Magie niedrig/mittel/hoch“ ein konkretes `requestedSpellId` an `resolveRound` übergeben.
   - Wenn Layard den Zauber kennt und genug AsP hat, wird genau dieser Zauber zuerst versucht.
   - Wenn der Zauber nicht bekannt/zu teuer ist, erscheint eine klare Logzeile statt falscher Meisterbehauptung.
   - Schadens-/Heilzauber laufen weiter deterministisch über die vorhandenen DSA3-Proben.

6. **Magiebegabung/Zauberbuch robust machen**
   - Server-Prompt: Wenn `knownSpells` leer ist, aber die Klasse magisch ist und AE vorhanden sind, Default-Zauber der Klasse verwenden statt „nicht magiebegabt“.
   - Client-Kampf: vor `heroCombatantFromCharacter` immer `upgradeToHero` nutzen, damit Magier/Elf/Druide sicher `spells` und Default-Ausrüstung haben.
   - `loadHeroSpells` ggf. mit Default-Fallback ergänzen, falls alte/teilweise gespeicherte Helden keinen `spells`-Block haben.

7. **UI minimal anpassen**
   - Im Taktik-Picker eine kurze Zeile anzeigen, wenn ein freier Kampfbefehl erkannt wurde, z. B. „Befehl erkannt: Yelva bleibt hinten · Layard wirkt Ignifaxius“.
   - Keine neue komplizierte Befehlseingabe im Overlay; die normale Prompt-Eingabe vor dem Kampf bleibt die Quelle.

8. **Validierung**
   - Mit gezielten lokalen Checks für die Parser-Fälle prüfen:
     - „Yelva bleib hinten und leg Pfeile auf“ → Yelva Backline/Ranged.
     - „Yelva blende den Anführer“ → Gegner-Modifikator erscheint.
     - Magier mit Default-Zaubern → Prompt sagt nicht mehr „unmagisch“.
     - „Ich wirke Ignifaxius“ → Kampf versucht Ignifaxius, zieht AsP ab und protokolliert Probe/Schaden.
