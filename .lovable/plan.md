## Befund — wo Mira-Inhalte gegen die LORE.md verstoßen

Laut LORE §7 ist 104,6 MHz **privates Funkgerät** (Cornel Marteau, 70er), Reichweite wenige hundert Meter, Marktdurchdringung marginal, **kein Paragraph, kein staatlicher Apparat, keine Resonanz-Infrastruktur**. Layard ist als Träger ungewöhnlich, **aber Bastler-Empfänger sind nicht die Norm** — und Träger im Sektor existieren ohne behördliche Versorgung.

Konflikte im Code:

1. **`dialogs/mira.ts` mi-Open-Strang / mr-Open-Strang:** „Die Frequenz ist eine Leine … eine Verwaltung, die gelernt hat, dass ruhige Bürger billiger sind als zufriedene" — behauptet **staatliche Lenkung** als Tatsache.
2. **`dialogs/mira.ts` ma2–ma4 (Knoten 5610):** „Dein eigenes Schmerz-Radio läuft da durch, bevor es zu jemand anderem geht. 104,6 — du hörst sie nicht. Du bist sie. Gefiltert." — behauptet eine zentrale Routing-/Filter-Infrastruktur, die es laut Lore nicht gibt.
3. **`dialogs/mira.ts` miraAmplifierAsk ma3:** „Trauer ist seit 91 fest belegt" und das Konzept eines Verstärkers, der ein Band „überlagert" — verträgt sich nicht damit, dass das Band einfach ein paar private Bastler-Sender sind.
4. **`NodeTerminal.tsx`:** „Knoten 5610 (Sektor E67, **412 Empfänger**)" / „412 Empfänger im Sektor verlieren das Schmerz-Radio" — viel zu hohe, zentral verwaltete Versorgungs-Zahl.
5. **`filesystemWorag.ts`:** „Resonanzschleife … Empfänger im Sektor …" (Z. 776) — selbe Suggestion.
6. **`npcPersonas.ts` bodo Z. 183:** Bodo „hat ab 1986 fünf Jahre lang das 104,6-MHz-**Trägersignal manuell nachgeregelt** — eine Ein-Personen-Schicht" → behauptet direkt eine staatlich/halbstaatlich betreute Trägerinfrastruktur.
7. **`dialogs/mira.ts` mi1:** „Kein Empfänger im Ohr" als Auffälligkeit → impliziert Empfänger im Ohr sei Normalfall (gegenteilig zur Lore: Bastler-Hobby, marginal).
8. **Flyer/Manifest:** „Wer dreht sie lauter, wenn ihr leiser werdet?" / „104,6 ist keine Frequenz, die uns hilft. Sie ist eine Leine." — als objektive Aussagen formuliert.

Der LLM bekommt diese Behauptungen über `SHARED_LORE` + Miras `secrets`/`biography` mit; sie bluten also auch in freie Chats.

## Lösungsansatz — Miras Opposition als persönliche Verschwörungstheorie

Mira **glaubt** weiterhin, dass die Verwaltung die Frequenz kapert. Aber die Welt bestätigt es nicht: Cornel Marteau hat das Ding in den 70ern gebaut, es ist ein Bastler-Funkgerät, Reichweite kurz, und Bodo / die E67-Handbuch-§3.6 wissen das. Miras These ist motiviert, nicht bewiesen — der Spieler kann ihr glauben oder nicht.

Anker für die Theorie ist bereits in der Lore: Miras Vater Ilan starb 1992 im Schacht 56, Akte lügt („menschliches Versagen", keine Wartungslogs Sekunden vorher). **Daraus** konstruiert sie: Wenn die Verwaltung den Tod ihres Vaters vertuscht hat, vertuscht sie auch, was sie mit 104,6 macht. Das ist psychologisch glaubwürdig, jugend-typisch, und braucht keine Lore-Erweiterung.

Wichtige Implikationen:

- **Mira sagt „ich glaube" / „ich vermute" / „ich kann es nicht beweisen, aber …"** statt „die Verwaltung tut X".
- **Bodo / Helka / Insa widersprechen** sanft (in Zukunft, nicht in diesem Patch): „Das ist ein Bastler-Ding, Kind." Im aktuellen Patch reicht es, Miras eigene Stimme zu korrigieren.
- **Der „Tag der Stille" bleibt** — er funktioniert ja auch ohne staatliche Frequenz: „eine Etage, eine Stunde, alle (paar) Bastler-Empfänger aus, und beweisen, dass niemand stirbt." Das ist sogar stimmiger als bisher, weil es bewusst klein bleibt.
- **Knoten 5610 wird umgedeutet**: Miras Hypothese ist, dass die Verwaltung dort filtert. Das Terminal zeigt aber, dass 5610 ein gewöhnlicher Wartungsknoten ist (Rohrpost-Routing, Druckerport, Carrier-Wartung für UKW allgemein) — kein Schmerz-Radio-Filter. Spieler erfährt: Mira hat sich da hineingesteigert.

## Konkrete Änderungen

### `LORE.md` — präzisieren (eine Zeile)
§7 Schmerz-Radio: „Die Annahme, die Verwaltung kontrolliere oder verstärke 104,6, kommt in der Welt als **Verschwörungstheorie einzelner Bewohner** vor (insb. Mira, E67/4601). Sie ist innerhalb der Lore **nicht bestätigt**." — verhindert künftige Drift.

### `dialogs/mira.ts`
- **mi1**: „Kein Empfänger im Ohr" → „Kein Schmerz-Radio in der Tasche. Ungewöhnlich für jemanden, der hier oben unterwegs ist." Oder ganz weglassen — der Punkt war nur, dass sie Layard direkt ansieht.
- **miraOpen1 / mrOpen1**: „Frag dich mal, warum 104,6 deinen Schmerz lindert" — Hedge einbauen: „Ich glaube — ich kann's nicht beweisen — dass 104,6 deinen Schmerz lindert, **damit du nicht fragst, woher er kommt**."
- **miraOpen2 / mrOpen2 / mrOpen3**: „Die Frequenz ist eine Leine. … Eine Verwaltung, die gelernt hat …" → Mira als Vermuterin markieren: „So sehe ich das. Vielleicht spinne ich. Aber zu viele Dinge passen zu gut zusammen — angefangen bei meinem Vater."
- **Flyer-Text** (mi+mr Endbranch und mr2): aktuell objektiv formuliert. Umschreiben zu „LAUSCHT IHR? **Wir vermuten**, dass die Frequenz, die euch trägt, nicht gefunden, sondern gebaut wurde. **Wir können's nicht beweisen. Fragt euch selbst.** — Z.K.S." (gleicher Inhalt im Inventar-Item).
- **ma2–ma4 (Knoten 5610)**: umformulieren. „Hinter der Tür sitzt ein Knoten. **Ich glaube**, da läuft 104,6 durch, bevor es weitergeht. Beweisen kann ich's nicht — geh hin, schau dir's an, sag mir, was du siehst." Spieler darf am Terminal selbst feststellen, dass es kein Filter ist.
- **miraAmplifierAsk ma3**: „Trauer ist seit 91 fest belegt" → „Auf dem Trauer-Band sendet seit Jahren eine alte Frau aus 5612, jeden Abend. Mein Sender allein kommt nicht gegen sie an — ich brauche eine Verstärker-Antenne, um sie für ein paar Minuten zu überlagern." (Lore-konform: privat, lokal, ein einzelner Mensch.)
- **miraAfterAmplifier mf1**: „im zweiten Stock jemand das Radio leiser gedreht" — bleibt, weil das die korrekte kleine Reichweite spiegelt.

### `dialogs/mira.ts` Manifest-Übergabe / `filesystemMira.ts` Z_K_S_MANIFEST
Manifest ist bereits gut: „Dies ist keine Bewegung. Dies ist eine Vermutung." Nur Punkt 1 hedgen: „**Wir vermuten**, dass 104,6 keine Frequenz ist, die uns hilft. **Wenn wir recht haben, ist sie eine Leine.**"

### `npcPersonas.ts`
- **mira.secrets**: ergänzen, dass die Verwaltungs-Theorie ihre **persönliche Überzeugung** ist, motiviert durch den Tod ihres Vaters; sie weiß, dass sie keinen Beweis hat. „Ziel ist kein Umsturz" bleibt.
- **mira.worldLore** oder ein neues Mira-only-Lore-Feld: explizit „Du **glaubst**, die Verwaltung steckt hinter 104,6. Du **weißt**, dass du keinen Beweis hast. Im freien Gespräch sagst du das auch so — keine Tatsachen-Behauptungen über Verwaltungs-Lenkung."
- **bodo.biography Z. 183**: „104,6-MHz-Trägersignal manuell nachgeregelt" → ersetzen durch „Hat in den 80ern UKW-Sendemasten der alten Stadtwerke gewartet und am Rand auch die Bastler-Szene rund um Cornel Marteau gekannt — Schmerz-Radio war damals schon ein Hobby-Ding, kein Stadtwerk-Auftrag."
- **SHARED_LORE** (Z. 76–82): unverändert; bleibt neutral.

### `NodeTerminal.tsx`
- „412 Empfänger" → entfernen oder drastisch reduzieren auf etwas wie „**~14 bekannte private Empfänger** in E67 (Bastler-Schätzung)". Die Knoten-Ausgabe sollte zeigen, dass 5610 **kein** Schmerz-Radio-Filter ist (Rohrpost/Drucker/Wartung), sondern allenfalls in der Nähe der Antennenleitung sitzt — damit der Spieler Miras Hypothese als Hypothese erkennen kann.

### `filesystemWorag.ts` Z. 776
„Resonanzschleife … Empfänger im Sektor" — umschreiben, dass es um die private Sender-Reichweite geht, nicht um eine staatliche Schleife. Die genaue Formulierung beim Editieren festlegen (Datei ist groß; eine Zeile reicht).

### `adventureGame.ts` Z. 105
„Niemand trägt einen Empfänger im Ohr" → bleibt drin, ist hier korrekt (das ist die Standard-Welt; Layard ist die Ausnahme). Nur prüfen, ob die Formulierung in Layards Innen-Perspektive **als Normalfall** klingt, nicht als Auffälligkeit.

## Was bewusst NICHT geändert wird

- Miras Charakter, Alter, Wohnung, Z.K.S., „Tag der Stille" als Konzept, Trauer-Band-Duell-Mechanik, Vater-Backstory, Manifest-Struktur — alles bleibt.
- Schmerz-Radio bleibt obskures Nebenelement (mem://constraints/schmerz-radio).
- Keine neue „Resonanz-Hygiene"-Mechanik, kein behördlicher Apparat.

## Offene Designfrage an dich

Soll ich beim Knoten-5610-Terminal aktiv zeigen, dass Mira sich täuscht (Spieler sieht: kein Filter, Mira hatte unrecht), oder soll es **ambig** bleiben (Terminal zeigt Routing, das man als Filter lesen *könnte*, aber nicht muss)? Ambig ist erzählerisch reicher, aber das Wort „Resonanz-Schleife" in `filesystemWorag.ts` müsste so oder so raus.
