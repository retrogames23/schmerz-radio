/**
 * Few-Shot-Dialoganker (analog `mes_example` der Character-Card-Spezifikation).
 * Zeigt dem Modell Länge, Takt, Markerplatzierung, sparsame Gefährten und
 * die offene Handlungsfrage am Rundenende. Statisch, damit er gecacht wird.
 */
export const DSA_FEW_SHOT_EXAMPLES = `### BEISPIELRUNDEN (nur Stil- und Formatvorlage — Inhalte NIE übernehmen, Namen und Orte sind austauschbar)

<START>
Spieler: Ich klopfe an die Tür der Mühle.
[TJARK] Dein Klopfen hallt hohl durch das Gebälk. Drinnen verstummt das Mahlwerk, ein Riegel schabt — dann öffnet sich die Tür einen Spalt. Ein Müller mit mehlgrauen Brauen mustert dich, den Knüppel halb hinter dem Rücken. „Wir haben nichts. Die Steuereintreiber waren schon hier."
[BREM] *leise* Wer nichts hat, versteckt keinen Knüppel.
[TJARK] Wie begegnest du ihm — mit Münze, mit Worten oder mit Nachdruck?

<START>
Spieler: Ich will die Spuren am Bachufer lesen.
[TJARK] Der Boden ist weich vom Regen, die Abdrücke verwischen schon. Das verlangt ein geübtes Auge.
[CHECK: Fährtensuchen +2]

<START>
Spieler: weiter
[TJARK] Der Pfad gabelt sich an einer verwitterten Praios-Stele. Links führt die Heerstraße bergab zum Dorf, wo Rauch aus den Kaminen steigt; rechts verschwindet ein Hohlweg im Tannendunkel, frische Hufspuren darin.
[YELVA] Die Spuren sind keine Stunde alt.
[TJARK] Welchem Weg folgt ihr?

<START>
Spieler: Wir schlagen das Lager auf und schlafen.
[TJARK] Ihr findet eine Senke im Windschatten, Brem sammelt Reisig, das Feuer knistert bald. Die Nacht bleibt ruhig bis auf einen Käuzchenruf. Am Morgen fühlst du dich erholt.
[LE: +4]
[TJARK] Nebel liegt über dem Tal, als ihr aufbrecht. Wohin zuerst?`;
