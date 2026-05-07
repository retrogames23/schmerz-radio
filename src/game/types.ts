export type SceneId =
  | "apartment"
  | "hallway"
  | "sectorDoor"
  | "e71Lobby"
  | "corridor15"
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
  | "pub"
  | "pubToilet"
  | "pubVestibule";

export type InventoryItemId =
  | "protocol"
  | "exitCode"
  | "b3sample"
  | "tuningCrystal"
  | "mikaelLetter"
  | "flyer"
  | "wartungsnotiz5610"
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
  | "quittungForged4317"
  | "tillaTransfer"
  | "miraDoorNote"
  // Schmerz-Radio-Erweiterung (Akt I)
  | "antennaWire"
  | "amplifierAntenna"
  | "wartungsDiktat"
  // Bürokratie-Duell — gesammelte Verwaltungs-Paragraphen
  | "paragraphenNotizbuch"
  // MARV-9 / Kneipenvorraum
  | "oilCan"
  // E71-Hygienevorschrift / Kondomautomat in „Zum stillen Funk"
  | "medMask"
  // Tragbares Schmerz-Radio aus Layards Wohnung (Akt I)
  | "painRadio"
  // Bodos vergessene grüne Thermoskanne aus Tech-Knoten 5610
  | "bodoThermos"
  // Reichswährung — zählbar (count > 1).
  | "reichsmark"
  // Pfefferminzkaugummi aus dem Kondomautomaten („Zum stillen Funk").
  | "peppermint"
  // Kondom aus dem Kondomautomaten („Zum stillen Funk").
  | "condom";

export type KnowledgeFlag =
  | "responsibilityE67"
  | "radioOrigin"
  | "frequencyControl";

/** Identifier einer narrativen Cutscene. */
export type CutsceneId = "paramedics" | "act2Bridge";

export type StoryFlag =
  | "radioTunedTo1046"
  /** Layard hat das Schmerz-Radio vom Tisch eingesteckt (jetzt im Inventar). */
  | "tookPainRadio"
  | "doorbellRang"
  | "openedAlmanach"
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
  | "skippedExitReport"
  | "calledStegmann"
  | "calledForCode"
  | "centralOsUpdated"
  | "centralOsUpdatedBodo"
  | "troubleReported"
  | "sectorDoorOpen"
  | "feetWontMove"
  | "elevatorTaken"
  | "enteredE71"
  | "metReceptionist"
  | "foundRoom1534"
  | "metMikael"
  | "heardMikaelTruth"
  | "mikaelRejectedProtocol"
  | "insaInvitedToDispatch"
  | "calledInsaAfterE71"
  | "ending"
  | "sawEmptyOffice"
  | "rangEmptyOfficeBell"
  | "metMira"
  | "miraOpenness"
  | "miraSystemic"
  | "miraOfferedFlyer"
  | "miraDeferred"
  | "tookFlyer"
  | "hackedPhilippe"
  | "talkedPhilippeAfter"
  | "philippeNote1"
  | "philippeNote2"
  | "philippeNote3"
  | "philippeNote4"
  | "philippeNote5"
  | "philippeProbe1"
  | "philippeProbe2"
  | "philippeProbe3"
  | "philippeProbe4"
  | "philippeProbe5"
  | "philippeProbeNote1"
  | "philippeProbeNote2"
  | "philippeProbeNote3"
  | "philippeProbeNote4"
  | "philippeProbeNote5"
  // Helka Vint (2610) — Türgespräch
  | "metHelka"
  | "talkedHelka2"
  | "talkedHelka3"
  | "helkaWarned"
  | "helkaSawFlyer"
  // Bodo Marschke (2612) — begehbare Wohnung
  | "metBodo"
  | "talkedBodo2"
  | "knowsLotti"
  | "bodoToldCarrierTruth"
  | "bodoSawFlyer"
  // Bodo verlässt für 15 Min die Wohnung, damit Layard ans Terminal kommt
  | "bodoLeftForB3"
  | "bodoBackAfterB3"
  | "bodoNoticedIntrusion"
  // Zweiter Anlauf: Bodo geht ein weiteres Mal los (Lotti-Wasser-Argument).
  | "bodoLeftForB3Twice"
  | "bodoBackAfterB3Twice"
  // Dritter Anlauf existiert nicht: stattdessen storniert Bodo die Sperre
  // selbst, sobald er bemerkt, dass Layard nichts unternommen hat.
  | "bodoSelfCanceledMaint"
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
  | "serverRoom5610OverrideArmed"
  | "tappedNode5610"
  | "burnedNode5610"
  // Folgen aus burn. Beendet das Spiel NICHT — wirkt nur narrativ.
  | "crossLinkSevered"
  // Nach dem Burn-Anruf bei Insa: Layard hat die Tat als bewusste
  // Entscheidung benannt („… weil es uns kaputtgemacht hat.")
  | "burnedAndOwned"
  // Nach dem Burn-Anruf bei Insa: Layard konnte/wollte sich keine Haltung
  // dazu geben („Ich weiß es nicht. Ich war wütend.")
  | "burnedAndDodged"
  // Insa hat Layard zwingend zu Knoten 5610 geschickt (Pflicht-Pfad
  // für den Sektor-Code).
  | "insaSentTo5610"
  // Insa-Rückruf nach burn ist gelaufen (verhindert Endlos-Trigger).
  | "insaCallbackBurnDone"
  // Dr. Adaeze Okwu (E71, Korridor 15) — progressive Dialog-Schichten
  | "metOkwu"
  | "okwuLayer2"
  | "okwuLayer3"
  | "okwuLayer4"
  // ── DSA-Runde im Gemeinschaftsraum (Erdgeschoss-Lobby) ──
  | "enteredCommonRoom"
  | "metRpgGroup"
  | "dsaCharacterRolled"
  | "dsaCharacterRerolled"
  | "dsaSeatedAtTable"
  | "dsaAdventureScene1Done"
  | "dsaAdventureScene2Done"
  | "dsaAdventureScene3Done"
  | "dsaCampaignFinished"
  | "tjarkSmalltalkDone"
  | "askedTjarkAboutDsa"
  | "askedTjarkAboutGroup"
  | "askedTjarkAboutRules"
  | "askedTjarkAboutPlan"
  // E67-Handbuch & Bewohner-Ausweis (Akt I, Start-Items)
  | "readHandbook"
  | "examinedResidentId"
  // Lobby-Schleuse (Tagesmodus): Bewohner-Ausweis + 4-stelliger Code
  | "lobbyClearedDay"
  | "insaLobbyEscalated"
  // Kantine 3602 + Vollmachts-Rätsel (Akt I, Erweiterung)
  | "philippeAskedFavor"
  | "gotB3Authorization"
  | "metKowalk"
  | "metBrust"
  | "kowalkToldHerDaughter"
  | "brustOutruled"
  | "kowalkSidedWithLayard"
  | "gotB3Ration"
  | "gaveB3ToPhilippe"
  | "gotParamedicsReport"
  | "refusedB3Favor"
  // Bürokratie-Duell (Akt I, Brust-Tresen) — alternativer dritter Lösungsweg
  | "duelOffered"
  | "duelStarted"
  | "duelWon"
  | "duelLost"
  // Bürokratie-Duell — Mehrstufiges Lernsystem (Vossbeck-Endgegner)
  | "duelTrainingWon1"
  | "duelTrainingWon2"
  | "duelTrainingWon3"
  | "vossbeckSummoned"
  | "metVossbeck"
  | "duelEndgameWon"
  | "duelEndgameLost"
  | "duelTutorialShown"
  /** Layard hat erfahren, dass Vossbeck (in 3603) der einzige Weg zur 4317 ist. */
  | "knowsVossbeckPath"
  // Pflicht-Verzahnung Akt I: Tilla-Quittung 4317-K hängt am Stamm 4317.
  | "needsMarteauAuthForTilla"
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
  | "miraTrustEarned"
  | "miraTrustWithheld"
  | "miraAtHomeMet"
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
  | "insaGaveTransferTask"
  // Kowalk hat Layard erklärt, was 4317-K bedeutet — und nebenbei
  // den Aktenzusammenhang zu Marteau (Philippe) offenbart.
  | "gotTillaTransferInfo"
  | "learnedMarteauPhilippeLink"
  // ── Schmerz-Radio-Erweiterung (Akt I) ──────────────────────────────
  // Hidden Frequency 102,7 — Wartungs-Funkgerät im Serverraum 5610
  | "sawWartungsFunk5610"
  | "hiddenFrequencyFound"
  // Mira-Verstärker-Antenne (Resonanz-Duell)
  | "miraAskedAmplifier"
  | "miraHasAmplifier"
  | "miraSentAnger"
  | "miraTerminalUnlocked"
  // Lose Wartungs-Hinweise von NPCs (für Hidden Frequency)
  | "bodoHintHiddenFreqBand"
  | "helkaHintHiddenFreqStep"
  | "mikaelHintHiddenFreqMood"
  // ── Akt II ──────────────────────────────────────────────────────
  /** Akt II hat formell begonnen (nach „Weiterspielen“ aus dem Ending). */
  | "act2Started"
  /** Akt-II-Bridge-Cutscene wurde komplett abgespielt. */
  | "act2BridgeSeen"
  // Drei kanonische Mira-States für Akt II. Werden beim Übergang in
  // Akt II einmalig anhand der Akt-I-Flags berechnet und sind ab dort
  // die alleinige Wahrheitsquelle für Mira-Logik im zweiten Akt.
  | "miraEndFriendly"
  | "miraEndNeutral"
  | "miraEndSkeptical"
  /** Dr. Okwu hat eine weiche Resonanz-Pause für das Schmerz-Radio verhängt. */
  | "radioOnPause"
  /** Layard hat während der Pause das Radio trotzdem eingeschaltet. */
  | "cheatedRadioOnPause"
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
  // ── E71-Hygiene / Maskenrätsel ─────────────────────────────────
  /** Empfangsdame hat einmalig auf die Maskenpflicht hingewiesen. */
  | "receptionRefusedNoMask"
  /** Layard trägt die OP-Maske aus dem Kondomautomat. */
  | "wearingMedMask"
  /** Der Kondomautomat hat bereits eine Maske ausgegeben. */
  | "tookMedMaskFromAutomat"
  /** Der Kondomautomat hat bereits ein Kondom ausgegeben. */
  | "tookCondomFromAutomat"
  /** Der Kondomautomat hat bereits eine Schachtel Pfefferminzkaugummi ausgegeben. */
  | "tookPeppermintFromAutomat"
  // Beiläufige NPC-Reaktionen auf Automatenware (rein narrativ).
  | "showedHelkaPeppermint"
  | "showedHelkaCondom"
  | "showedEnnisPeppermint"
  | "showedEnnisCondom";

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
  intro?: string;
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
    | "MARV";
  text: string;
  /** subtext appears only when Schmerz-Radio active */
  subtext?: string;
  next?: string;
  choices?: DialogChoice[];
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
  /** Quadranten-Almanach (Lese-Overlay) öffnen. */
  openAlmanach: () => void;
  /** Wartungsterminal hinter Tür 5610 (eigenes UI, kein CentralOS). */
  openNode5610: () => void;
  /** Pneumatik-Rohrpost-Overlay in der Kantine 3602. */
  openPneumaticTube: () => void;
  /** Kondomautomat-Overlay in der Kneipen-Toilette. */
  openCondomAutomat: () => void;
  /**
   * Bürokratie-Duell am Brust-Tresen (Akt I, Kantine 3602). Öffnet das
   * Overlay und startet einen frischen Versuch. `mode` steuert, ob es
   * ein Trainingsfall gegen Brust ist oder das Endduell gegen Vossbeck.
   */
  openBureaucracyDuel: (mode?: "training" | "endgame") => void;
  /** Notizbuch-Overlay öffnen (gelernte Paragraphen). */
  openParagraphenNotizbuch: () => void;
  /** Hat Layard den Paragraphen schon im Notizbuch? */
  hasParagraph: (id: string) => boolean;
  /** Paragraph ins Notizbuch eintragen (idempotent). */
  learnParagraph: (id: string) => void;
  /** Aktueller Brust-Trainings-Streak (gewonnene in Folge). */
  getBrustWinStreak: () => number;
  /** Streak inkrementieren oder zurücksetzen. */
  bumpBrustWinStreak: () => number;
  resetBrustWinStreak: () => void;
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
}