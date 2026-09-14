export type SceneId =
  | "apartment"
  | "hallway"
  | "sectorDoor"
  | "e71Lobby"
  | "elevatorE71"
  | "cinemaE71"
  | "corridor15"
  | "corridor11"
  | "corridor21"
  | "libraryE71"
  | "apt1102"
  | "apt1103"
  | "room1534"
  | "room1532"
  | "apt2613"
  | "apt2612"
  | "elevator"
  | "floor1Lobby"
  | "passage"
  | "corridor36"
  | "corridor46"
  | "corridor56"
  | "serverRoom5610"
  | "commonRoomE67"
  | "cafeteriaE67"
  | "aptMira4601"
  | "kantinenverwaltung3603"
  | "leitstelleE67"
  | "kellerE67"
  | "pub"
  | "pubToilet"
  | "pubVestibule"
  | "commonRoomE71"
  | "windowNiche"
  // Zentralverwaltungsstelle Sektor 28 (Akt II)
  | "zvsExterior"
  | "zvsForum"
  | "zvsRoom5011";

export type InventoryItemId =
  | "protocol"
  | "flyer"
  | "wartungsnotiz5610"
  // Ausdruck aus dem Vorgangsknoten 5610 (Papierstreifen, Beleg für 5011)
  | "vorgangsstreifen5610"
  | "residentId"
  | "e67Handbook"
  | "b3Authorization"
  | "b3Ration"
  | "paramedicsReport"
  // Akt-I-Pflichträtsel „Quittung 4317"
  | "pencilStub"
  | "siegelAbdruck"
  | "aushang71Original"
  | "quittungBlankoB"
  // Aushang-Belege für Miras Vertrauens-Strang
  | "belegAushangAufzug"
  | "belegAushangKorridor46"
  | "belegAushangGemeinschaftsraum"
  | "quittungForged4317"
  | "tillaTransfer"
  | "miraDoorNote"
  // Akt-I-Bürokratie-Duell — „Formblatt 17/V auf Vorsprache"
  // Brust händigt es nach drei gewonnenen Trainingsfällen aus;
  // Kowalk kann eine Fälschung produzieren (gleiche Wirkung an Vossbecks
  // Tür, kosmetische Folge im Endduell).
  | "formblatt17V"
  | "formblatt17VForged"
  // Bürokratie-Duell — gesammelte Verwaltungs-Paragraphen
  | "paragraphenNotizbuch"
  // Kantinenverordnung — statisches Sammelbuch (Akt I, Layards Bücherschrank)
  | "kantinenverordnung"
  // MARV-9 / Kneipenvorraum
  | "oilCan"
  // E71-Hygienevorschrift / Kondomautomat in „Zum stillen Funk"
  | "medMask"
  // Tragbares Schmerz-Radio aus Layards Wohnung (Akt I)
  | "painRadio"
  // Bodos vergessene grüne Thermoskanne aus Tech-Knoten 5610
  | "bodoThermos"
  // Vierkantschlüssel für die Wartungstür zum Keller E67 (von Bodo)
  | "vierkantschluessel"
  // Reichswährung — zählbar (count > 1).
  | "reichsmark"
  // Pfefferminzkaugummi aus dem Kondomautomaten („Zum stillen Funk").
  | "peppermint"
  // Kondom aus dem Kondomautomaten („Zum stillen Funk").
  | "condom"
  // Akt II — offizielles Schreiben zur Vor-Ort-Recherche (Vossbeck).
  | "rechercheSchreiben"
  // Manifest der „Global Future Alliance“ — von Walter Grewe (Wohnung 1103)
  | "gfaManifest"
  // Ausgeliehene Bücher der Bewohnerbibliothek 1101 (E71, Herbert)
  | "buchSumerListen"
  | "buchSchmalspur"
  | "buchResonanzhygiene"
  | "buchGespaltenerGeist"
  | "buchOrdnungEigentum"
  | "buchDrehendeDreieck"
  | "buchMandatsdeutsch"
  | "buchLobDesVorgangs"
  | "buchNichtVorgesehen"
  | "buchResonanzbegriff"
  | "buchAbsurd"
  | "buchGrundgesetz"
  | "heftSperrmuell";

export type KnowledgeFlag =
  | "responsibilityE67"
  | "radioOrigin"
  | "wordControl"
  /** Vorgangsspur aus dem Verwaltungsknoten 5610 (E67). */
  | "vorgangsspur5610"
  // Wissens-Register zur Resonanzüberlastung (Akt II)
  | "collapse2615"
  | "protocolContent"
  | "walterBearing"
  | "carrierTruth"
  | "e71Denial"
  | "miraNetwork"
  | "gfaContact"
  | "zeroIsInfinity"
  /** Der Nachbar Philippe fragt Layard systematisch aus. */
  | "philippeProbing";

/** Hat Layard ein Wissensstück offengelegt oder verschwiegen? */
export type DisclosureChoice = "shared" | "withheld";
export type DisclosureMap = Partial<Record<KnowledgeFlag, DisclosureChoice>>;

/** Identifier einer narrativen Cutscene. */
export type CutsceneId =
  | "paramedics"
  | "sectorThreshold"
  | "act2Assignment"
  | "miraRepair";

export type StoryFlag =
  /** Layard hat Herbert in der Bewohnerbibliothek 1101 (E71) kennengelernt. */
  | "metHerbert"
  /** Layard weiß, dass Herbert ein wandelndes Lexikon kurioser Fakten ist. */
  | "herbertFaktenBekannt"
  /** Fortschritt der kuriosen Fakten — ein Flag pro bereits erzähltem Fakt. */
  | `hbFakt_${string}`
  /** Setsuko Arai (Wohnung 1102, E71) kennengelernt. */
  | "metSetsuko"
  | "setsukoArtTalk"
  | "setsukoBodyTalk"
  /** Setsuko hat begonnen, über Osho zu sprechen. */
  | "setsukoOshoStarted"
  | "setsukoToldGefahrUnterschied"
  | "setsukoToldRuestung"
  | "setsukoToldKomfort"
  | "setsukoToldAuthentisch"
  /** Alle vier Osho-Themen gehört. */
  | "setsukoOshoDone"
  /** Erster Hinweis auf das Kollektiv „Zero is Infinity“. */
  | "heardZeroIsInfinity"
  /** Walter Grewe (Wohnung 1103, E71) kennengelernt. */
  | "metWalter"
  /** Walter hat über seine Apparate und Messungen gesprochen. */
  | "walterTech"
  /** Walter hat seinen Resonanz-Begriff erklärt (sozial vs. technisch). */
  | "walterResonanz"
  /** Walters Peilung: verstärkter Träger 104,6, NW, 300–500 m — also E67. */
  | "walterBearing"
  // Plakat der „Global Future Alliance“ in Wohnung 1103 angesehen / Manifest genommen
  | "sawGfaPoster"
  | "gfaManifestTaken"
  | "askedBodoPhone"
  | "askedPhilippePhone"
  | "askedEnnisPhone"
  | "askedHelkaPhone"
  | "tookMedMaskFromAutomat"
  | "dsaAdventureScene2Done"
  | "duelTrainingWon1"
  | "duelTrainingWon2"
  | "duelTrainingWon3"
  | "radioTunedTo1046"
  /** Der Lehrfilm im Lichtspielsaal 5 wurde bereits einmal automatisch abgespielt. */
  | "cinemaFilmSeen"
  /** Layard hat das Schmerz-Radio vom Tisch eingesteckt (jetzt im Inventar). */
  | "tookPainRadio"
  | "doorbellRang"
  | "openedAlmanach"
  | "tookKantinenverordnung"
  | "metPhilippe"
  | "metPhilippeBefore"
  | "knockingHeard"
  | "talkedPhilippe2613"
  | "calledLeitstelle"
  | "paramedicsArrived"
  /** Cutscene "Sanitäter brechen 2615 auf" wurde abgespielt. */
  | "paramedicsCutsceneSeen"
  // Pro Besuch in Wohnung 2613 nach dem Anruf: zwei Warte-Klicks.
  // Werden beim Betreten von 2613 zurückgesetzt.
  | "wait2613Step1"
  | "wait2613Step2"
  | "doorBrokenOpen"
  | "protocolReceived"
  | "calledInsa2"
  | "reportedExit"
  | "calledStegmann"
  | "calledForCode"
  | "centralOsUpdated"
  | "centralOsUpdatedBodo"
  | "troubleReported"
  | "sectorDoorOpen"
  | "feetWontMove"
  | "sectorThresholdSeen"
  | "enteredE71"
  | "metReceptionist"
  | "metMikael"
  | "heardMikaelTruth"
  | "mikaelRejectedProtocol"
  | "calledInsaAfterE71"
  | "ending"
  | "sawEmptyOffice"
  | "rangEmptyOfficeBell"
  | "metMira"
  | "miraOpenness"
  | "miraSystemic"
  | "miraDistance1"
  | "miraDistance2"
  | "miraOfferedFlyer"
  | "tookFlyer"
  | "talkedPhilippeAfter"
  | "philippeNote1"
  | "philippeNote2"
  | "philippeNote3"
  | "philippeNote4"
  | "philippeNote5"
  | "philippeThema1"
  | "philippeThema2"
  | "philippeThema3"
  | "philippeThema4"
  | "philippeThema5"
  | "philippeThemaNotiz1"
  | "philippeThemaNotiz2"
  | "philippeThemaNotiz3"
  | "philippeThemaNotiz4"
  | "philippeThemaNotiz5"
  /** Mindestens drei der fünf Philippe-Themen abgeschlossen. */
  | "philippeThemenTief"
  // Helka Vint (2610) — Türgespräch
  | "metHelka"
  | "talkedHelka2"
  | "talkedHelka3"
  | "helkaWarned"
  | "helkaSawFlyer"
  // Helka: Heidegger-Gespräche
  | "helkaHeideggerStarted"
  | "helkaToldDasein"
  | "helkaToldGeworfenheit"
  | "helkaToldMan"
  | "helkaToldTod"
  | "helkaHeideggerDone"
  // Bodo Marschke (2612) — begehbare Wohnung
  | "metBodo"
  | "talkedBodo2"
  | "knowsLotti"
  | "bodoToldCarrierTruth"
  | "bodoSawFlyer"
  // Bodo verlässt für 15 Min die Wohnung, damit Layard ans Terminal kommt
  | "bodoLeftForB3"
  | "bodoBackAfterB3"
  // Zweiter Anlauf: Bodo geht ein weiteres Mal los (Lotti-Wasser-Argument).
  | "bodoLeftForB3Twice"
  | "bodoBackAfterB3Twice"
  // Dritter Anlauf existiert nicht: stattdessen storniert Bodo die Sperre
  // selbst, sobald er bemerkt, dass Layard nichts unternommen hat.
  // Ennis Korr (2614) — Türgespräch
  | "metEnnis"
  | "talkedEnnis2"
  | "ennisCracked"
  | "ennisSawFlyer"
  // Akt 1, Erweiterung: defekter Aufzug nach Protokoll-Übergabe.
  // Anfangs setzt das System (post-protocolReceived) eine Wartungssperre
  // 4711, die nur über Bodos Hausmeister-Account gelöscht werden kann.
  | "elevatorMaintBlocked"
  | "elevatorMaintSeen"
  | "elevatorMaintCleared"
  // Tür 5610 (Serverraum, Korridor 56) — Entdeckung & Zustand
  | "saw5610Door"
  | "serverRoom5610Open"
  // Insa hat aus der Leitstelle den Wartungs-Override scharfgeschaltet,
  // d.h. die Magnetriegel der Tür 5610 öffnen sich beim nächsten Versuch
  // ohne Karte/Code (Pflicht-Pfad).
  | "tappedNode5610"
  | "burnedNode5610"
  // Neue Bezeichner für den Vorgangsknoten 5610. Werden zusammen mit den
  // alten Flags gesetzt, damit bestehende Spielstände weiterlaufen.
  | "readVorgangsliste5610"
  | "printedVorgangsstreifen"
  | "wipedNode5610"
  // Folgen aus burn. Beendet das Spiel NICHT — wirkt nur narrativ.
  // Nach dem Burn-Anruf bei Insa: Layard hat die Tat als bewusste
  // Entscheidung benannt („… weil es uns kaputtgemacht hat.")
  | "burnedAndOwned"
  // Nach dem Burn-Anruf bei Insa: Layard konnte/wollte sich keine Haltung
  // dazu geben („Ich weiß es nicht. Ich war wütend.")
  | "burnedAndDodged"
  // Insa hat Layard zwingend zu Knoten 5610 geschickt (Pflicht-Pfad
  // für den Sektor-Code).
  // Insa-Rückruf nach burn ist gelaufen (verhindert Endlos-Trigger).
  | "insaCallbackBurnDone"
  // Dr. Adaeze Okwu (E71, Korridor 15) — progressive Dialog-Schichten
  | "metOkwu"
  | "okwuLayer2"
  | "okwuLayer3"
  | "okwuLayer4"
  // ── DSA-Runde im Gemeinschaftsraum (Erdgeschoss-Lobby) ──
  | "metRpgGroup"
  | "dsaCharacterRolled"
  | "dsaCampaignFinished"
  | "tjarkSmalltalkDone"
  | "askedTjarkAboutDsa"
  | "askedTjarkAboutGroup"
  | "askedTjarkAboutRules"
  | "askedTjarkAboutPlan"
  // E67-Handbuch & Bewohner-Ausweis (Akt I, Start-Items)
  // Lobby-Schleuse (Tagesmodus): Bewohner-Ausweis + 4-stelliger Code
  | "lobbyClearedDay"
  // Kantine 3602 + Vollmachts-Rätsel (Akt I, Erweiterung)
  | "philippeAskedFavor"
  | "gotB3Authorization"
  | "metKowalk"
  | "metBrust"
  | "kowalkToldHerDaughter"
  | "gotB3Ration"
  | "gaveB3ToPhilippe"
  | "gotParamedicsReport"
  | "refusedB3Favor"
  // Bürokratie-Duell (Akt I, Brust-Tresen) — alternativer dritter Lösungsweg
  | "duelStarted"
  // Bürokratie-Duell — Mehrstufiges Lernsystem (Vossbeck-Endgegner)
  // Transientes Ergebnis-Flag des zuletzt abgeschlossenen Trainingsfalls.
  // Wird beim Start eines Falls gelöscht und bei einem Sieg gesetzt —
  // ausschließlich für die Verzweigung im Ergebnis-Dialog.
  | "duelJustWon"
  | "vossbeckSummoned"
  // Brust hat das Formblatt 17/V (echt) ausgehändigt — Layard hält es im
  // Inventar. Verhindert Doppel-Ausgabe bei Re-Win.
  | "gotFormblatt17V"
  // Vossbeck hat im Endduell den Tagescode in Layards Terminal gelegt.
  // Folgt aus `duelEndgameWon` und setzt automatisch `calledForCode`.
  | "vossbeckGaveCode"
  // Insa hat Layard am Telefon zu Vossbeck (und vorher Kowalk) geschickt.
  // Schaltet die Code-Erklärungs-Choice bei Kowalk frei.
  | "insaSentToKowalkForCode"
  | "metVossbeck"
  | "duelEndgameWon"
  | "duelEndgameLost"
  // Layards Angriffsphrasen (Phrasen, mit denen er selbst attackiert,
  // statt nur zu kontern). Gelernt bei anderen Bewohnern, die Brust
  // schon im Phrasen-Duell besiegt haben.
  | "kowalkHintedBodoHelka"
  | "learnedAttackVorgesetzten"
  | "learnedAttackTuerschild"
  /** Layard hat erfahren, dass Vossbeck (in 3603) der einzige Weg zur 4317 ist. */
  | "knowsVossbeckPath"
  /** Layard war bei Vossbeck, bevor er wusste, was er von ihm will — Kowalk-Callback. */
  | "triedVossbeckEarly"
  // Pflicht-Verzahnung Akt I: Tilla-Quittung 4317-K hängt am Stamm 4317.
  // Endduell-Versuche bei Vossbeck (drei zugelassen).
  | "vossbeckAttempt1Lost"
  | "vossbeckAttempt2Lost"
  // Kowalk hat nach drei Niederlagen die Fälschung als Notausgang angeboten.
  | "kowalkOfferedForgery"
  // Layard hat die gefälschte Tilla-Quittung über den Notausgang erstellt.
  | "usedForgeryRoute"
  // Mira — Vertrauenspfad
  | "readMiraManifest"
  | "radioMutedAtLeast60s"
  // Mira — Beleg-Sammlung „Resonanz-Hygiene"
  | "sawResonanzAushang"
  | "belegAushangAufzug"
  | "belegAushangKorridor46"
  | "belegAushangGemeinschaftsraum"
  | "miraAskedEvidence"
  | "miraEvidenceDelivered"
  | "miraTrustEarned"
  | "miraTrustWithheld"
  | "miraAtHomeMet"
  | "miraEncounterAtHome"
  // Akt-I-Pflichträtsel „Kaputtes Telefon" (Mira / Etagenwartung)
  | "phoneBroken"
  | "miraRepairDone"
  | "phoneRepaired"
  // Akt-I-Pflichträtsel „Prüfsperre 2611" (Miras Terminal wird Pflicht)
  /** Datenport 2611 ist nach der Telefonreparatur gesperrt — kein Postfach. */
  | "port2611Locked"
  /** Bodo hat den Vierkantschlüssel für die Kellertür herausgerückt. */
  | "gotKellerKey"
  /** Layard hat Bodo schon einmal nach dem Kellerschlüssel gefragt. */
  | "askedBodoKellerKey"
  /** Layard weiß, dass Steigstrang 46 zu Korridor 46 gehört. */
  | "knowsStrang46"
  /** Steigstrang 46 ist im Keller hochgedreht. */
  | "heatingStrang46Raised"
  /** Mira hat ihre Wohnung wegen der Hitze verlassen, Tür steht offen. */
  | "miraFlatOpen"
  /** Layard hat Miras Maschine ohne Erlaubnis benutzt. */
  | "miraTerminalTrespass"
  /** Layard hat den Tagescode im Verteiler der Leitstelle gelesen. */
  | "readTagescodeViaMira"
  /** Layard weiß, dass nur eine Maschine im Wartungsnetz an die Leitstelle kommt. */
  | "knowsMiraNetAccess"
  /** Mira hat den unerlaubten Zugriff angesprochen. */
  | "miraConfrontedTrespass"
  /** Layard hat den unerlaubten Zugriff zugegeben. */
  | "miraTrespassAdmitted"
  // Ralf am Fenster (Verbindungsgang → Fensternische)
  | "metRalf"
  | "ralfToldSektoren"
  | "ralfToldMandat"
  | "ralfToldResonanz"
  | "ralfToldBewohner"
  | "ralfToldZeitungen"
  | "ralfToldSelbst"
  | "ralfToldMira"
  | "ralfStage2"
  | "ralfStage3"
  | "ralfAskedWork"
  | "ralfAskedNight"
  | "ralfKnowsLayardWriter"
  | "ralfKnowsLayardTired"
  | "ralfToldRollo"
  | "ralfToldBoxbude"
  // Akt-I-Pflichträtsel „Quittung 4317"
  | "noticedTransferCode"
  | "tookPencilStub"
  | "extractedSiegelAbdruck"
  | "extractedAushang71"
  | "tookQuittungBlanko"
  | "bodoSignedForTilla"
  | "forgedQuittung4317"
  | "sentForgedQuittung"
  | "receivedTillaTransfer"
  // Wartungskarte 5610 — Bodo übergibt sie als Gefälligkeitsauftrag,
  // bevor er zum B3-Holen aufbricht.
  | "bodoGaveWartungskarte"
  // Insa hat den Tilla-Transferauftrag erteilt (Quittung 4317-K).
  // Kowalk hat Layard erklärt, was 4317-K bedeutet — und nebenbei
  // den Aktenzusammenhang zu Philippe (Stamm 4317) offenbart.
  | "gotTillaTransferInfo"
  | "miraTerminalUnlocked"
  // ── Akt II ──────────────────────────────────────────────────────
  /** Akt II hat formell begonnen (nach „Weiterspielen" aus dem Ending). */
  | "act2Started"
  // Drei kanonische Mira-States für Akt II. Werden beim Übergang in
  // Akt II einmalig anhand der Akt-I-Flags berechnet und sind ab dort
  // die alleinige Wahrheitsquelle für Mira-Logik im zweiten Akt.
  | "miraEndFriendly"
  | "miraEndNeutral"
  | "miraEndSkeptical"
  /** Die Akt-II-Auftragsmail (Vor-Ort-Recherche) ist eingegangen. */
  | "act2MailReceived"
  /** Layard hat das offizielle Schreiben bei Vossbeck abgeholt. */
  | "act2LetterPickedUp"
  /** Vossbeck hat die Zentralverwaltungsstelle Sektor 28 genannt — Karte frei. */
  | "sectorMapUnlocked"
  // ── MARV-9 (Robo-Türsteher Kneipe) ─────────────────────────────
  /** Layard hat MARV-9 zum ersten Mal vor der Kneipentür angesprochen. */
  | "metMarv"
  /** Layard hat MARV mit dem Ölkännchen geölt. */
  | "marvOiled"
  /** MARV hat genug Empathie gespürt — die Kneipentür ist offen. */
  | "marvUnlocked"
  /** Layard hat das Ölkännchen aus Serverraum 5610 mitgenommen. */
  | "tookOilCan"
  | "tookBodoThermos"
  /** Layard hat Bodo seine grüne Thermoskanne zurückgegeben. */
  | "gaveBodoThermos"
  // ── E71-Hygiene / Maskenrätsel ─────────────────────────────────
  /** Empfangsdame hat einmalig auf die Maskenpflicht hingewiesen. */
  | "receptionRefusedNoMask"
  /** Layard trägt die OP-Maske aus dem Kondomautomat. */
  | "wearingMedMask"
  /** Der Kondomautomat hat bereits eine Maske ausgegeben. */
  /** Der Kondomautomat hat bereits ein Kondom ausgegeben. */
  | "tookCondomFromAutomat"
  /** Der Kondomautomat hat bereits eine Schachtel Pfefferminzkaugummi ausgegeben. */
  | "tookPeppermintFromAutomat"
  // Beiläufige NPC-Reaktionen auf Automatenware (rein narrativ).
  | "showedHelkaPeppermint"
  | "showedHelkaCondom"
  | "showedEnnisPeppermint"
  | "showedEnnisCondom"
  // ── Akt II · Leitstelle (erste persönliche Begegnung mit Insa) ──
  /** Layard hat Insa in der Leitstelle E67 (Tür 4602) persönlich getroffen. */
  | "insaAct2BriefingDone"
  // ── E71 Gemeinschaftsraum (Tür 1530) — Home-Computer-Nerds & Amiga ──
  /** Layard hat den Gemeinschaftsraum hinter Tür 1530 zum ersten Mal betreten. */
  | "enteredCommonRoomE71"
  /** Hat mit dem ersten Nerd (Detlef) gesprochen. */
  | "metE71Nerd1"
  /** Hat mit dem zweiten Nerd (Sigi) gesprochen. */
  | "metE71Nerd2"
  /** Hat mit dem dritten Nerd (Ruven) gesprochen. */
  | "metE71Nerd3"
  /** Layard hat das Quiz angefangen (mind. einmal). */
  /** Layard hat das Quiz bestanden — der Amiga ist freigegeben. */
  | "e71QuizPassed"
  /** Transient: jeweilige Quiz-Antwort war richtig (wird pro Versuch zurückgesetzt). */
  | "e71QuizQ1Right"
  | "e71QuizQ2Right"
  | "e71QuizQ3Right"
  | "e71QuizQ4Right"
  | "e71QuizQ5Right"
  // ── Zentralverwaltungsstelle Sektor 28 (Akt II) ──
  /** Layard steht zum ersten Mal auf dem Vorplatz der Zentralverwaltung. */
  | "enteredZvs"
  /** Der Empfang hat ihn an Zimmer 5011 verwiesen. */
  | "zvsSentTo5011"
  /** Sachbearbeiterin 5011 kennengelernt. */
  | "metSasse"
  /** Die Befragung in 5011 ist einmal vollständig durchlaufen. */
  | "zvsIntakeDone";

export interface InventoryItem {
  id: InventoryItemId;
  name: string;
  description: string;
  /** Stückzahl (Default: 1). Wird im Inventar als kleines Badge gezeigt. */
  count?: number;
}

export interface Hotspot {
  id: string;
  /** % positions on background image */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /**
   * Welche Art von Interaktion bietet dieser Hotspot? Bestimmt den
   * kontext-sensitiven Mauszeiger (Broken-Sword-Stil):
   *  - "look": weiße Lupe (anschauen, lesen, Schild)
   *  - "use":  animierte Hand (Tür öffnen, Gerät bedienen, aufheben) — Default
   *  - "talk": Sprechblase (NPC-Dialog, Sprechanlage)
   *  - "exit": Pfeil (Szenenwechsel, Korridor-Ausgang, Aufzug)
   */
  kind?: "look" | "use" | "talk" | "exit";
  /**
   * Nur für `kind: "exit"` relevant: in welche Richtung zeigt der Pfeil?
   * Wird sonst automatisch aus der Hotspot-Position auf dem Bildschirm
   * abgeleitet (Rand, der am nächsten ist).
   */
  exitDir?: "left" | "right" | "up" | "down";
  /** required flags before this hotspot is active */
  requires?: StoryFlag[];
  /** hide once these flags are present */
  hiddenWhen?: StoryFlag[];
  /** custom visibility predicate, evaluated after requires/hiddenWhen */
  visible?: (api: GameApi) => boolean;
  onUse: (api: GameApi) => void;
}

export interface Scene {
  id: SceneId;
  /**
   * Hintergrundbild der Szene. Entweder ein statischer Pfad oder eine
   * Funktion, die abhängig vom Spielzustand das passende Bild liefert
   * (z.B. „Bodo im Sessel“ vs. „leerer Sessel“).
   */
  background: string | ((api: GameApi) => string);
  title: string;
  intro?: string | ((api: GameApi) => string);
  hotspots: Hotspot[];
  /** Optional sichtbare Figuren / Sprites, die über dem Hintergrund liegen. */
  npcs?: NpcSprite[];
  /**
   * Optional sichtbare „Aufkleber" auf dem Hintergrund (z.B. ein Wandgerät,
   * für das es kein eigenes Hintergrundbild gibt). Werden unter den Hotspots
   * gerendert und sind selbst nicht klickbar — der zugehörige Hotspot liegt
   * darüber.
   */
  decals?: SceneDecal[];
  /**
   * Optionaler Bild-Zoom für Szenen, deren Hintergrund-Asset zu kleinteilig
   * wirkt (z. B. Aufzug, in dem das Bedienpanel nur einen schmalen Bereich
   * einnimmt). Sowohl das Hintergrundbild als auch der 4:3-Hotspot-Layer
   * bekommen dieselbe CSS-Transform, damit Hotspot-Koordinaten weiterhin
   * deckungsgleich mit dem sichtbaren Motiv bleiben.
   *
   * scale: Skalierungsfaktor (1 = unverändert, 1.4 = 40 % größer)
   * originX/Y: Zoom-Mittelpunkt in Prozent (0..100), bezogen auf das Bild.
   */
  bgFocus?: { scale: number; originX: number; originY: number };
  /**
   * Bild-Anpassung an die Bühne. "cover" (Default) füllt die Bühne
   * komplett und schneidet ggf. Über­lapp ab — passend für 16:9-nahe
   * Assets. "contain" zeigt das Bild immer vollständig (mit Letterbox),
   * nötig für sehr breite oder schmale Asset-Formate, deren Ränder
   * sonst auf vielen Monitoren weggeschnitten würden.
   */
  bgFit?: "cover" | "contain";
}

/**
 * Pixel-Größe (Original-Asset) eines Szenen-Hintergrundbildes. Wird
 * benötigt, damit Hotspots/NPCs/Decals pixelgenau auf dem sichtbaren
 * Bildbereich liegen — auch wenn das Asset nicht exakt 16:9 ist.
 */
export type SceneImageSize = { w: number; h: number };

export interface SceneDecal {
  id: string;
  kind: "television";
  x: number;
  y: number;
  w: number;
  h: number;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
}

export interface NpcSprite {
  id: string;
  src: string;
  /** % positions on background image (top-left anchor of the sprite box) */
  x: number;
  y: number;
  /** width as % of the scene */
  w: number;
  /** height as % of the scene */
  h: number;
  alt: string;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
  /** custom visibility predicate (e.g. nur auf Miras Etage anzeigen) */
  visible?: (api: GameApi) => boolean;
}

export interface DialogChoice {
  text: string;
  next?: string;
  /** Wechselt nach der Action direkt in einen anderen Dialog-Baum. */
  nextDialog?: string | ((api: GameApi) => string);
  action?: (api: GameApi) => void;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
  /** show only when radio is active */
  requiresRadio?: boolean;
}

export interface DialogLine {
  id: string;
  speaker:
    | "LAYARD"
    | "INSA"
    | "PHILIPPE"
    | "SANITÄTER"
    | "SYSTEM"
    | "RADIO"
    | "MIKAEL"
    | "RECEPTION"
    | "MIRA"
    | "BODO"
    | "HELKA"
    | "ENNIS"
    | "STEGMANN"
    | "OKWU"
    | "TJARK"
    | "BREM"
    | "YELVA"
    | "KOWALK"
    | "BRUST"
    | "VOSSBECK"
    | "BRAM"
    | "MARV"
    | "DETLEF"
    | "SIGI"
    | "RUVEN"
    | "RALF"
    | "HERBERT"
    | "SETSUKO"
    | "WALTER"
    | "ZVSEMPFANG"
    | "SASSE";
  text: string;
  /** subtext appears only when Schmerz-Radio active */
  subtext?: string;
  next?: string;
  choices?: DialogChoice[];
  /**
   * Dynamische Choice-Erzeugung — wird aufgerufen, sobald diese Zeile
   * zum ersten Mal angezeigt wird. Ergebnis wird für die Dauer des
   * Line-Besuchs eingefroren, damit Zufallsauswahl nicht neu würfelt.
   * Wird zusammen mit `choices` gesetzt, gewinnt `choices`.
   */
  choicesFn?: (api: GameApi) => DialogChoice[];
  /** auto-end dialog */
  end?: boolean;
  /** Skip this line entirely if any required flag is missing (jumps to `next`). */
  requires?: StoryFlag[];
  /** Skip this line entirely if any of these flags is set (jumps to `next`). */
  hiddenWhen?: StoryFlag[];
}

export interface DialogTree {
  id: string;
  start: string;
  lines: Record<string, DialogLine>;
  /** Optional callback fired when the dialog tree opens. */
  onStart?: (api: GameApi) => void;
  /** Optional callback fired exactly once when the dialog tree closes. */
  onEnd?: (api: GameApi) => void;
  /**
   * Optional NPC-Persona-ID für den Free-Mode-Chat. Ist sie gesetzt UND
   * existiert ein Eintrag in `npcPersonas`, bietet das DialogOverlay am
   * Endsatz einen Knopf an, den freien Chat zu starten.
   */
  npcId?: string;
}

export interface GameApi {
  goTo: (scene: SceneId) => void;
  setFlag: (flag: StoryFlag) => void;
  clearFlag: (flag: StoryFlag) => void;
  hasFlag: (flag: StoryFlag) => boolean;
  setKnowledge: (k: KnowledgeFlag) => void;
  hasKnowledge: (k: KnowledgeFlag) => boolean;
  /** Merkt, ob Layard ein Wissensstück offengelegt oder verschwiegen hat. */
  setDisclosure: (k: KnowledgeFlag, choice: DisclosureChoice) => void;
  getDisclosure: (k: KnowledgeFlag) => DisclosureChoice | null;
  addItem: (item: InventoryItem) => void;
  hasItem: (id: InventoryItemId) => boolean;
  /** Anzahl eines Items im Inventar (0, wenn nicht vorhanden). */
  getItemCount: (id: InventoryItemId) => number;
  /** Zieht `n` Stück vom Item ab; entfernt es bei 0. No-op, wenn nicht vorhanden. */
  removeItem: (id: InventoryItemId, n?: number) => void;
  showText: (lines: string[], onClose?: () => void) => void;
  startDialog: (id: string) => void;
  /**
   * Öffnet ein Terminal-Overlay.
   * - `true` (legacy) oder `{ bodo: true }` → Bodos Hausmeister-Konsole.
   * - `{ mira: true }` → Miras gehackter Rechner (FuckTheSystemOS 0.2).
   * - sonst → Layards eigenes CentralOS.
   */
  openTerminal: (asBodoOrOpts?: boolean | { bodo?: boolean; mira?: boolean }) => void;
  openRadio: () => void;
  openKeypad: (target?: KeypadTarget) => void;
  openTelevision: () => void;
  /** Amiga-Workbench-Overlay (Gemeinschaftsraum E71) öffnen. */
  openAmigaWorkbench: () => void;
  /** Sektoren-Almanach (Lese-Overlay) öffnen. */
  openAlmanach: () => void;
  /** „Die kürzeste Geschichte der Menschheit" (Lese-Overlay) öffnen. */
  openHistoryBook: () => void;
  /** Beliebiges registriertes Buch öffnen (id aus der Buch-Registry). */
  openBook: (bookId: string) => void;
  /** Aktuelles Buch-Overlay schließen. */
  closeBook: () => void;
  /** Wartungsterminal hinter Tür 5610 (eigenes UI, kein CentralOS). */
  openNode5610: () => void;
  /** Pneumatik-Rohrpost-Overlay in der Kantine 3602. */
  openPneumaticTube: () => void;
  /** Kondomautomat-Overlay in der Kneipen-Toilette. */
  openCondomAutomat: () => void;
  /** Notizbuch-Overlay öffnen (gelernte Paragraphen). */
  openParagraphenNotizbuch: () => void;
  /** Kantinenverordnung-Lese-Overlay öffnen. */
  openKantinenverordnung: () => void;
  /** Hat Layard den Paragraphen schon im Notizbuch? */
  hasParagraph: (id: string) => boolean;
  /** Paragraph ins Notizbuch eintragen (idempotent). */
  learnParagraph: (id: string) => void;
  /** Aktueller Brust-Trainings-Streak (gewonnene in Folge). */
  getBrustWinStreak: () => number;
  /** Streak inkrementieren oder zurücksetzen. */
  bumpBrustWinStreak: () => number;
  resetBrustWinStreak: () => void;
  /**
   * Transiente Trefferzählung innerhalb eines einzelnen Trainings- oder
   * Endduell-Falls (3 Runden). `bumpDuelHit` zählt einen Treffer für
   * Layard, `getDuelHits` liest den Stand, `resetDuelHits` setzt ihn auf
   * 0 (zu Beginn jedes Falls).
   */
  bumpDuelHit: () => number;
  getDuelHits: () => number;
  resetDuelHits: () => void;
  /**
   * Markiert MARV-9 als geölt — sofort lokal im Spielstand, damit die
   * wärmere Tonfärbung schon beim nächsten Free-Mode-Talk greift und
   * nicht erst nach einer Server-Antwort (bzw. gar nicht, wenn der
   * Spieler anonym ohne Account spielt).
   */
  markMarvOiled: () => void;
  isRadioActive: () => boolean;
  setEnding: () => void;
  /** Ending-Overlay wieder schließen (z. B. beim Akt-II-Einstieg). */
  clearEnding: () => void;
  /**
   * Spielt eine Fullscreen-Sequenz nach burn.
   * Beendet das Spiel NICHT.
   */
  playBurnSequence: () => void;
  /**
   * Spielt eine narrative Cutscene als Fullscreen-Sequenz.
   * Beendet das Spiel NICHT — die Szene bleibt erhalten und wird beim
   * Schließen wieder sichtbar. Aktuell unterstützt: "paramedics".
   */
  startCutscene: (id: CutsceneId) => void;
  /**
   * Floors (subset of {3,4,5}) where Mira appears this run. Currently 2
   * of 3 floors are picked at random so the player is more likely to
   * encounter her without making her omnipresent.
   */
  getMiraFloors: () => ReadonlyArray<3 | 4 | 5>;
  /**
   * The single floor (3, 4 or 5) where Philippe appears in the corridor
   * this run. Always picked from the floor that Mira does NOT occupy,
   * so the two NPCs never crowd the same etage. Philippe is also
   * always present in the lobby (handled separately).
   */
  getPhilippeFloor: () => 3 | 4 | 5;
  /**
   * Öffnet die DSA-Charaktererschaffung (Eigenschaften auswürfeln,
   * Klasse wählen). Schließt sich selbst, wenn Layard fertig ist oder
   * abbricht.
   */
  openDsaCreator: () => void;
  /**
   * Aktueller DSA-Charakter, mit dem Layard am Tisch sitzt — `null`,
   * wenn er noch keinen erwürfelt hat.
   */
  getDsaCharacter: () => DsaCharacterSummary | null;
  /** Verwirft den aktuellen DSA-Charakter (nur intern für Reset gebraucht). */
  clearDsaCharacter: () => void;
  /**
   * Pro Spielinstanz/Save-Slot stabile UUID. Wird beim Start einer
   * frischen Sitzung generiert und beim Laden eines Saves
   * wiederhergestellt. Identifiziert das laufende DSA-Abenteuer
   * serverseitig, damit jeder neue Spielstand sein eigenes
   * Meister-Gedächtnis hat.
   */
  getDsaSessionId: () => string;
  /**
   * Öffnet das DSA-Abenteuer-Overlay. Ohne `beatId` springt es zum
   * gespeicherten Beat oder — wenn keiner existiert — an den Anfang
   * des ersten Akts.
   */
  openDsaAdventure: (beatId?: string) => void;
  /** Aktueller Beat im Abenteuer, oder `null`. */
  getDsaBeat: () => string | null;
  /** Speichert den aktuellen Beat (z. B. nach einer Wahl). */
  setDsaBeat: (beatId: string | null) => void;
}

/**
 * Welches Schloss steckt hinter dem aktuellen Keypad-Aufruf.
 * Aktuell nur die Sektor-Tür E67/E71 (8-stellig). Tür 5610 öffnet
 * über Wartungs-Override bzw. Wartungskarte ohne Keypad.
 */
export type KeypadTarget = "sectorDoor";

/** Snapshot des im Gemeinschaftsraum gespielten DSA-Helden. */
export interface DsaCharacterSummary {
  className: string;
  classId: string;
  name: string;
  attrs: Record<string, number>;
  le: number;
  /** Maximaler LE-Wert beim Erschaffen (für Heilung als Obergrenze). */
  leMax: number;
  ae: number | null;
  rerolled: boolean;
  /** "m" | "w" (oder freier Text). Steuert u.a. die Porträt-Auswahl. */
  geschlecht?: string;
  /**
   * Eigenes hochgeladenes Porträt als Data-URL (JPEG/PNG, max ~512px,
   * vom Client herunterskaliert). Hat Vorrang vor dem Klassen-Default.
   */
  portraitDataUrl?: string;
}

/**
 * Voller Held inkl. Steigerung. Erweitert den Charakter-Snapshot um
 * Abenteuerpunkte (AP) sowie gelernte/gesteigerte Talente und Zauber.
 * Wird sowohl im Standalone-Modus (Slot 1/2/3) als auch im Hauptspiel
 * (Save-Slot-Held) verwendet — die beiden Pools sind getrennt.
 */
export interface DsaHero extends DsaCharacterSummary {
  /** AP, die der Meister bisher vergeben hat (Summe aller Abenteuer). */
  apTotal: number;
  /** AP, die bereits in Steigerung investiert wurden. */
  apSpent: number;
  /** Talent-IDs → aktueller TaW (>= 0). */
  talents: Record<string, number>;
  /** Zauber-IDs → aktueller ZfW (>= 0). Leer bei nicht-magischen Klassen. */
  spells: Record<string, number>;
  /** Anzahl beendeter Abenteuer (Sieg + Niederlage + Abbruch). */
  adventuresPlayed: number;
  /** Anzahl mit Sieg beendeter Abenteuer. */
  adventuresWon: number;
  /** Zeitstempel der Erschaffung (ISO-String). */
  createdAt: string;
  /**
   * Ausrüstung: Waffe, Rüstung, Schild, freier Item-Topf. Wird vom
   * LLM-Meister via [ITEM+/ITEM-]-Marker und im Charakterbogen verwaltet.
   * Optional, weil Helden vor diesem Feld existieren — `upgradeToHero`
   * füllt Standardausrüstung beim Laden nach.
   */
  gear?: import("@/game/dsa/gear").HeroGear;
}
