import { useEffect, useMemo, useRef, useState } from "react";
import { Dices } from "lucide-react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import {
  ATTR_LABEL,
  ATTR_ORDER,
  rollAE,
  rollLE,
  roll1d6plus7,
  type Attr,
  type Attrs,
} from "@/game/dsa/dice";
import {
  DEFAULT_NAME,
  DSA_CLASSES,
  qualifiesFor,
  type DsaClass,
  type DsaClassId,
} from "@/game/dsa/classes";
import {
  CLASS_FLAVOR,
  NEGATIVE_ATTRS,
  SNIPPY_COMMENTS,
  balancedAttrsFor,
  emptyAttrs,
  pickRandomName,
  talentsFor,
  type Geschlecht,
} from "@/game/dsa/creator/data";
import { AttrBox, Field } from "./dsa/AttrBox";

type Phase = "class" | "rolling" | "review" | "done";

export function DsaCharacterCreator() {
  const { dsaCreatorOpen, closeDsaCreator, setDsaCharacter, flags, api } =
    useGame();
  const [phase, setPhase] = useState<Phase>("class");
  const [attrs, setAttrs] = useState<Partial<Attrs>>(emptyAttrs());
  const [le, setLe] = useState<number | null>(null);
  const [rollingIdx, setRollingIdx] = useState<number>(-1);
  /** Pool gewürfelter Werte, die noch keiner Eigenschaft zugewiesen sind. */
  const [pool, setPool] = useState<number[]>([]);
  /** Aktuell rollender Würfel-Wert (vor Zuweisung). null = bereit zum Wurf. */
  const [pendingRoll, setPendingRoll] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [chosenClassId, setChosenClassId] = useState<DsaClassId | null>(null);
  const [rollCount, setRollCount] = useState<number>(0);
  const [snippy, setSnippy] = useState<{ speaker: string; text: string } | null>(null);
  const [chosenName, setChosenName] = useState<string>("");
  const [chosenGender, setChosenGender] = useState<Geschlecht>("männlich");
  const [nameTouched, setNameTouched] = useState<boolean>(false);
  const [signingOpen, setSigningOpen] = useState<boolean>(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!dsaCreatorOpen) return;
    cancelRef.current = false;
    setPhase("class");
    setAttrs(emptyAttrs());
    setLe(null);
    setRollingIdx(-1);
    setPool([]);
    setPendingRoll(null);
    setDiceRolling(false);
    setChosenClassId(null);
    setRollCount(0);
    setSnippy(null);
    setChosenName("");
    setChosenGender("männlich");
    setNameTouched(false);
    setSigningOpen(false);
  }, [dsaCreatorOpen, flags]);

  const fullAttrs: Attrs | null = useMemo(() => {
    const filled = ATTR_ORDER.every((a) => typeof attrs[a] === "number");
    if (!filled) return null;
    return ATTR_ORDER.reduce((acc, a) => {
      acc[a] = attrs[a]!;
      return acc;
    }, {} as Attrs);
  }, [attrs]);

  const qualifying: DsaClass[] = useMemo(() => {
    if (!fullAttrs) return [];
    return DSA_CLASSES.filter((c) => qualifiesFor(c, fullAttrs));
  }, [fullAttrs]);

  const kriegerOk = useMemo(() => {
    if (!fullAttrs) return false;
    const k = DSA_CLASSES.find((c) => c.id === "krieger")!;
    return qualifiesFor(k, fullAttrs);
  }, [fullAttrs]);

  const chosenClass = chosenClassId
    ? DSA_CLASSES.find((c) => c.id === chosenClassId) ?? null
    : null;

  // Sobald der Bogen geprüft wird, schlagen wir einen passenden
  // Default-Namen vor (aus der Krieger-Liste, bis eine Klasse gewählt wird).
  // Wechselt die Klasse oder das Geschlecht und der Spieler hat den Namen
  // noch nicht selbst getippt, wird der Vorschlag aktualisiert.
  useEffect(() => {
    if (phase !== "review") return;
    if (nameTouched) return;
    const cid = chosenClass?.id ?? "krieger";
    setChosenName(pickRandomName(cid, chosenGender));
  }, [phase, chosenClass, chosenGender, nameTouched]);

  const ae = useMemo(() => {
    if (!fullAttrs || !chosenClass) return null;
    if (!chosenClass.magic) return null;
    return rollAE(fullAttrs.MU, fullAttrs.IN);
  }, [fullAttrs, chosenClass]);

  /** Klasse gewählt → wechselt in die Würfel-Phase, Pool wird leer initialisiert. */
  function handleConfirmClass() {
    if (!chosenClassId) return;
    setAttrs(emptyAttrs());
    setLe(null);
    setPool([]);
    setPendingRoll(null);
    setDiceRolling(false);
    setPhase("rolling");
  }

  /** Einen einzelnen Wurf (1W6+7) ausführen. Animiert kurz, dann liegt
   *  der Wert im pendingRoll und wartet auf Zuweisung. */
  async function rollOne() {
    if (pendingRoll !== null || diceRolling) return;
    setDiceRolling(true);
    // Kurze Animation (~500ms) mit wechselnden Zwischenwerten.
    const start = Date.now();
    while (Date.now() - start < 500) {
      if (cancelRef.current) return;
      await new Promise((r) => window.setTimeout(r, 60));
    }
    const v = roll1d6plus7();
    setPendingRoll(v);
    setDiceRolling(false);
  }

  /** Aktuellen Wurf einer freien Eigenschaft zuweisen. */
  function assignRollTo(attr: Attr) {
    if (pendingRoll === null) return;
    if (typeof attrs[attr] === "number") return; // schon belegt
    const next = { ...attrs, [attr]: pendingRoll };
    setAttrs(next);
    setPendingRoll(null);
    // Wenn alle 7 belegt sind → in Review wechseln.
    if (ATTR_ORDER.every((a) => typeof next[a] === "number")) {
      const filled = next as Attrs;
      setLe(rollLE(filled.KK));
      setPhase("review");
      setRollCount((prev) => {
        const n = prev + 1;
        if (n > 1) {
          const rerolls = n - 1;
          if (rerolls > 0 && rerolls % 10 === 0) {
            const idx = Math.floor((rerolls / 10 - 1) % SNIPPY_COMMENTS.length);
            setSnippy(SNIPPY_COMMENTS[idx]);
          }
        }
        return n;
      });
    }
  }

  /** Alle Würfe verwerfen und neu beginnen (gleiche Klasse). */
  function handleReroll() {
    setAttrs(emptyAttrs());
    setLe(null);
    setPool([]);
    setPendingRoll(null);
    setDiceRolling(false);
    setPhase("rolling");
  }

  /** Erfüllt die aktuelle (Teil-)Verteilung die Mindestwerte der Klasse? */
  function meetsMinimums(): boolean {
    if (!chosenClass) return true;
    const cls = chosenClass;
    if (!cls.min) return true;
    for (const k of Object.keys(cls.min) as Array<keyof Attrs>) {
      const need = cls.min[k];
      const have = attrs[k];
      if (need !== undefined && (typeof have !== "number" || have < need)) return false;
    }
    if (cls.max) {
      for (const k of Object.keys(cls.max) as Array<keyof Attrs>) {
        const cap = cls.max[k];
        const have = attrs[k];
        if (cap !== undefined && typeof have === "number" && have > cap) return false;
      }
    }
    return true;
  }

  /**
   * Direktwahl: vorgefertigter, gebalancter Charakter ohne Würfeln.
   * Setzt Werte, LE/AE, Klasse — und springt direkt zum Unterschreiben.
   */
  function handlePickPremade(cid: DsaClassId) {
    const cls = DSA_CLASSES.find((c) => c.id === cid);
    if (!cls) return;
    const a = balancedAttrsFor(cls);
    setAttrs(a);
    setLe(rollLE(a.KK));
    setChosenClassId(cid);
    setRollingIdx(-1);
    setSnippy(null);
    setRollCount(1);
    setPhase("review");
    // Namensvorschlag passend zur Klasse + aktuellem Geschlecht.
    setChosenName(pickRandomName(cid, chosenGender));
    setNameTouched(false);
    // Direkt den Unterschreiben-Dialog öffnen, damit Spieler nur noch Name
    // und Geschlecht festlegen muss.
    setSigningOpen(true);
  }

  function handleConfirm() {
    if (!fullAttrs || !chosenClass || le === null) return;
    const finalName = chosenName.trim() || DEFAULT_NAME[chosenClass.id];
    setDsaCharacter({
      classId: chosenClass.id,
      className: chosenClass.name,
      name: finalName,
      attrs: { ...fullAttrs },
      le,
      leMax: le,
      ae,
      rerolled: rollCount > 1,
    });
    api.setFlag("dsaCharacterRolled");
    api.setFlag("dsaSeatedAtTable");
    if (rollCount > 1) api.setFlag("dsaCharacterRerolled");
    closeDsaCreator();
    // Abenteuer sofort starten, sobald der Bogen unterschrieben ist.
    api.openDsaAdventure();
  }

  function handleOpenSigning() {
    if (!chosenClassId) return;
    // Falls noch kein Name vorgeschlagen wurde, einen pre-fillen.
    if (!chosenName.trim()) {
      const cid = chosenClass?.id ?? "krieger";
      setChosenName(pickRandomName(cid, chosenGender));
    }
    setSigningOpen(true);
  }

  function handleCancel() {
    cancelRef.current = true;
    closeDsaCreator();
  }

  if (!dsaCreatorOpen) return null;

  const flavor = chosenClass ? CLASS_FLAVOR[chosenClass.id] : null;
  const persona = {
    name: chosenName,
    typus: chosenClass?.name ?? "",
    stand: flavor?.stand ?? "",
    heimat: flavor?.heimat ?? "",
    goetter: flavor?.goetter ?? "",
    haar: flavor?.haar ?? "",
    augen: flavor?.augen ?? "",
    geschlecht: chosenGender,
  };
  const rerollLabel =
    rollCount === 0
      ? "Würfeln"
      : `Nochmal würfeln (${rollCount}× geworfen)`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-x-hidden overflow-y-auto bg-black/85 px-2 py-2 sm:absolute sm:items-center sm:px-4 sm:py-4">
      <div className="relative my-2 w-full max-w-4xl sm:my-auto">
        <CloseButton
          onClick={handleCancel}
          label="Charakter-Erschaffung abbrechen"
          className="absolute -right-1 -top-1 z-20"
        />

        {/* Der Bogen */}
        <div className="dsa-paper relative w-full max-w-full overflow-hidden px-3 py-4 sm:px-10 sm:py-7">
          {/* Kopfzeile */}
          <div className="flex min-w-0 items-start justify-between border-b-2 border-[rgba(30,18,8,0.85)] pb-3 mb-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[rgba(30,18,8,0.85)] dsa-ink sm:h-12 sm:w-12">
                <span className="font-display text-xl sm:text-2xl">◉</span>
              </div>
              <div className="min-w-0">
                <div className="dsa-typed truncate text-[8px] uppercase tracking-[0.18em] dsa-ink-faded sm:text-[10px] sm:tracking-[0.35em]">
                  Schmidt-Spiele · Verlag
                </div>
                <div className="font-display text-xl sm:text-3xl dsa-ink leading-tight">
                  HELDEN-DOKUMENT
                </div>
                <div className="dsa-typed truncate text-[9px] tracking-normal dsa-ink-faded sm:text-[11px] sm:tracking-widest">
                  DAS SCHWARZE AUGE · Zweite Edition
                </div>
              </div>
            </div>
            {phase === "review" && chosenClass && (
              <div className="dsa-stamp text-xs sm:text-sm">
                {chosenClass.name}
              </div>
            )}
            {rollCount > 1 && (
              <div className="absolute right-12 top-3 dsa-stamp text-[10px] opacity-70">
                {rollCount}. Wurf
              </div>
            )}
          </div>

          {/* Persönliche Angaben */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
            {/* Name — editierbar, sobald eine Klasse gewählt wurde */}
            <div className="flex min-w-0 items-end gap-2">
              <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded shrink-0">
                Name
              </span>
              {phase === "review" ? (
                <>
                  <input
                    type="text"
                    value={chosenName}
                    onChange={(e) => {
                      setChosenName(e.target.value);
                      setNameTouched(true);
                    }}
                    placeholder="Charaktername eintragen …"
                    className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 bg-transparent outline-none focus:bg-[rgba(255,250,230,0.4)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cid = chosenClass?.id ?? "krieger";
                      setChosenName(pickRandomName(cid, chosenGender));
                      setNameTouched(true);
                    }}
                    title="Zufallsname"
                    className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink underline shrink-0"
                  >
                    🎲
                  </button>
                </>
              ) : (
                <span className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 truncate">
                  {persona.name || "\u00A0"}
                </span>
              )}
            </div>
            <Field label="Typus" value={persona.typus} />
            <Field label="Stand" value={persona.stand} />
            {/* Geschlecht — Auswahl */}
            <div className="flex min-w-0 items-end gap-2">
              <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded shrink-0">
                Geschlecht
              </span>
              {phase === "review" ? (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 pb-0.5">
                  {(["männlich", "weiblich"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setChosenGender(g)}
                      className={`dsa-typed text-xs px-2 py-0.5 border transition ${
                        chosenGender === g
                          ? "border-[#6b1a0e] bg-[rgba(180,60,40,0.15)] dsa-ink"
                          : "border-[rgba(30,18,8,0.45)] dsa-ink-faded hover:bg-[rgba(255,250,230,0.5)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 truncate">
                  {persona.geschlecht}
                </span>
              )}
            </div>
            <Field label="Heimat" value={persona.heimat} />
            <Field label="Götter" value={persona.goetter} />
            <Field label="Haar" value={persona.haar} />
            <Field label="Augen" value={persona.augen} />
          </div>

          {/* Eigenschaften + LE/AE */}
          <div className="flex flex-col lg:flex-row gap-5 mb-5">
            <div className="flex-1">
              <div className="dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink-faded mb-2 border-b border-[rgba(30,18,8,0.55)] pb-1">
                Eigenschaftswerte (1W6 + 7)
              </div>
              <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
                {ATTR_ORDER.map((a, idx) => (
                  <AttrBox
                    key={a}
                    attr={a}
                    finalValue={attrs[a] ?? null}
                    rolling={phase === "rolling" && rollingIdx === idx}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 lg:w-32">
              <div className="flex-1">
                <div className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded text-center mb-1">
                  Lebensenergie
                </div>
                <div className="dsa-box-thick flex h-14 items-center justify-center">
                  <span className="font-display text-3xl dsa-ink">
                    {le ?? "—"}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded text-center mb-1">
                  Astralenergie
                </div>
                <div className="dsa-box-thick flex h-14 items-center justify-center">
                  <span className="font-display text-3xl dsa-ink">
                    {ae ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Negative Eigenschaften (Deko) + Talente-Andeutung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <div className="dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink-faded mb-2 border-b border-[rgba(30,18,8,0.55)] pb-1">
                Negative Eigenschaften
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 dsa-typed text-[11px] dsa-ink">
                {NEGATIVE_ATTRS.map((n) => (
                  <div key={n} className="flex items-center justify-between border-b border-[rgba(40,25,5,0.35)]">
                    <span>{n}</span>
                    <span className="dsa-ink-faded">3W+4</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink-faded mb-2 border-b border-[rgba(30,18,8,0.55)] pb-1">
                Talente · Auswahl
              </div>
              <div className="dsa-typed text-[11px] dsa-ink space-y-1">
                {talentsFor(chosenClass?.id).map((t) => (
                  <div key={t} className="flex items-center justify-between border-b border-[rgba(40,25,5,0.35)]">
                    <span>{t.split(" ").slice(0, -1).join(" ") || t}</span>
                    <span className="dsa-ink-faded">{t.split(" ").slice(-1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aktions-Bereich (am Tisch) */}
          <div className="border-t-2 border-[rgba(30,18,8,0.85)] pt-4 space-y-3">
            {phase === "class" && (
              <>
                <p className="dsa-typed text-sm dsa-ink leading-relaxed">
                  „Bevor wir würfeln," sagt Tjark, „sag mir, wen du spielen
                  willst. Klasse zuerst, Werte danach. So weißt du, worauf du
                  hinwürfelst." Er klopft auf das Regelheft.
                </p>
                <p className="dsa-typed text-xs dsa-ink-faded">
                  Wähle eine Klasse — die Mindestwerte siehst du dann unter
                  jeder Eigenschaft. Du würfelst sieben Mal nacheinander
                  (1W6+7) und verteilst jeden Wurf selbst.
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  {DSA_CLASSES.map((c) => {
                    const selected = chosenClassId === c.id;
                    const minBits = c.min
                      ? Object.entries(c.min)
                          .map(([k, v]) => `${k} ≥ ${v}`)
                          .join(" · ")
                      : "";
                    const maxBits = c.max
                      ? Object.entries(c.max)
                          .map(([k, v]) => `${k} ≤ ${v}`)
                          .join(" · ")
                      : "";
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChosenClassId(c.id)}
                        title={c.blurb}
                        className={`dsa-typed text-xs px-2 py-1.5 text-left transition border ${
                          selected
                            ? "border-[#6b1a0e] bg-[rgba(180,60,40,0.18)] dsa-ink"
                            : "border-[rgba(30,18,8,0.6)] dsa-ink hover:bg-[rgba(255,250,230,0.5)]"
                        }`}
                      >
                        <div className="font-semibold">{c.name}</div>
                        {(minBits || maxBits) && (
                          <div className="text-[10px] dsa-ink-faded mt-0.5">
                            {minBits}
                            {minBits && maxBits ? " · " : ""}
                            {maxBits}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {chosenClass && (
                  <p className="dsa-typed text-xs dsa-ink italic">
                    {chosenClass.blurb}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmClass}
                    disabled={!chosenClassId}
                    className="dsa-stamp text-sm hover:bg-[rgba(255,250,230,0.5)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▸ Klasse wählen — los würfeln
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded underline px-2"
                  >
                    Doch nicht
                  </button>
                </div>

                {/* Shortcut: vorgefertigter Charakter ohne Würfeln */}
                <div className="mt-4 pt-3 border-t border-dashed border-[rgba(30,18,8,0.45)]">
                  <p className="dsa-typed text-xs dsa-ink-faded italic mb-2">
                    Keinen Nerv mehr? Gib mir einfach einen fertigen …
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                    {DSA_CLASSES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handlePickPremade(c.id)}
                        title={c.blurb}
                        className="dsa-typed text-xs px-2 py-1.5 text-left transition border border-[rgba(30,18,8,0.6)] dsa-ink hover:bg-[rgba(255,250,230,0.5)] cursor-pointer"
                      >
                        … {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {phase === "rolling" && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={rollOne}
                    disabled={pendingRoll !== null || diceRolling}
                    className="dsa-stamp inline-flex items-center gap-2 text-base px-4 py-2 cursor-pointer hover:bg-[rgba(255,250,230,0.5)] disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Einen Wurf (1W6+7) machen"
                  >
                    <Dices className="h-5 w-5" aria-hidden="true" />
                    <span>{diceRolling ? "Würfel rollt …" : "1W6 + 7 würfeln"}</span>
                  </button>
                  {pendingRoll !== null && (
                    <div className="flex items-center gap-2">
                      <span className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink-faded">
                        Ergebnis:
                      </span>
                      <div className="dsa-box-thick flex h-12 w-12 items-center justify-center bg-amber-100/60">
                        <span className="font-display text-2xl dsa-ink">{pendingRoll}</span>
                      </div>
                      <span className="dsa-typed text-xs dsa-ink italic">
                        → einer Eigenschaft zuweisen:
                      </span>
                    </div>
                  )}
                </div>
                {pendingRoll !== null && (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {ATTR_ORDER.map((a) => {
                      const taken = typeof attrs[a] === "number";
                      const need = chosenClass?.min?.[a];
                      const cap = chosenClass?.max?.[a];
                      const wouldFailMin = need !== undefined && pendingRoll < need;
                      const wouldFailMax = cap !== undefined && pendingRoll > cap;
                      return (
                        <button
                          key={a}
                          type="button"
                          disabled={taken}
                          onClick={() => assignRollTo(a)}
                          title={
                            taken
                              ? `${ATTR_LABEL[a]} schon belegt`
                              : wouldFailMin
                              ? `${ATTR_LABEL[a]} verlangt ≥ ${need}`
                              : wouldFailMax
                              ? `${ATTR_LABEL[a]} maximal ${cap}`
                              : `${pendingRoll} → ${ATTR_LABEL[a]}`
                          }
                          className={`dsa-typed text-xs px-1 py-2 border transition ${
                            taken
                              ? "border-[rgba(30,18,8,0.2)] dsa-ink-faded opacity-30 cursor-not-allowed"
                              : wouldFailMin || wouldFailMax
                              ? "border-[#6b1a0e]/60 dsa-ink hover:bg-[rgba(180,60,40,0.12)]"
                              : "border-[rgba(30,18,8,0.6)] dsa-ink hover:bg-[rgba(255,250,230,0.6)]"
                          }`}
                        >
                          <div className="font-bold">{a}</div>
                          {need !== undefined && (
                            <div className="text-[9px] dsa-ink-faded">≥{need}</div>
                          )}
                          {cap !== undefined && need === undefined && (
                            <div className="text-[9px] dsa-ink-faded">≤{cap}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="dsa-typed text-[11px] dsa-ink-faded">
                  Klasse: <span className="dsa-ink font-semibold">{chosenClass?.name}</span>
                  {" · "}
                  Geworfen: {ATTR_ORDER.filter((a) => typeof attrs[a] === "number").length} / 7
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleReroll}
                    className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded underline px-2"
                  >
                    Alles zurücksetzen
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("class")}
                    className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded underline px-2"
                  >
                    Klasse ändern
                  </button>
                </div>
              </>
            )}

            {phase === "review" && fullAttrs && (
              <>
                {snippy && (
                  <div className="dsa-table-aside text-sm italic">
                    <span className="font-semibold not-italic mr-1">
                      {snippy.speaker}:
                    </span>
                    „{snippy.text}"
                  </div>
                )}
                {!meetsMinimums() && chosenClass && (
                  <div className="dsa-typed text-sm" style={{ color: "#6b1a0e" }}>
                    Die Werte erfüllen die Voraussetzungen für „{chosenClass.name}" nicht.
                    Du kannst nochmal würfeln oder die Klasse ändern.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReroll}
                    className="dsa-stamp inline-flex items-center gap-2 text-base px-4 py-2 cursor-pointer hover:bg-[rgba(255,250,230,0.5)]"
                    title="Eigenschaften neu auswürfeln"
                  >
                    <Dices className="h-5 w-5" aria-hidden="true" />
                    <span>{rerollLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("class")}
                    className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded underline px-2"
                  >
                    Klasse ändern
                  </button>
                  {chosenClassId && meetsMinimums() && (
                    <button
                      type="button"
                      onClick={handleOpenSigning}
                      title="Bogen unterschreiben"
                      className="dsa-stamp text-sm cursor-pointer"
                    >
                      ▣ Bogen unterschreiben
                    </button>
                  )}
                </div>

                {/* Shortcut: vorgefertigter Charakter ohne Würfeln */}
                <div className="mt-3 pt-3 border-t border-dashed border-[rgba(30,18,8,0.45)]">
                  <p className="dsa-typed text-xs dsa-ink-faded italic mb-2">
                    Keinen Nerv mehr? Gib mir einfach einen fertigen …
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                    {DSA_CLASSES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handlePickPremade(c.id)}
                        title={c.blurb}
                        className="dsa-typed text-xs px-2 py-1.5 text-left transition border border-[rgba(30,18,8,0.6)] dsa-ink hover:bg-[rgba(255,250,230,0.5)] cursor-pointer"
                      >
                        … {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Fußzeile */}
          <div className="mt-4 pt-2 border-t border-[rgba(30,18,8,0.4)] flex items-center justify-between dsa-typed text-[9px] dsa-ink-faded uppercase tracking-widest">
            <span>Formular HD-2 / 1988</span>
            <span>© Schmidt-Spiele · Ulisses</span>
          </div>
        </div>

        {signingOpen && chosenClass && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-3 py-3"
            onClick={() => setSigningOpen(false)}
          >
            <div
              className="dsa-paper relative w-full max-w-md px-5 py-5 sm:px-7 sm:py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-display text-xl dsa-ink leading-tight mb-1">
                Bogen unterschreiben
              </div>
              <p className="dsa-typed text-xs dsa-ink-faded mb-4">
                Trag noch deinen Charakternamen und das Geschlecht ein. Danach
                wird der Bogen versiegelt — und das Abenteuer beginnt.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded mb-1">
                    Geschlecht
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(["männlich", "weiblich"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setChosenGender(g)}
                        className={`dsa-typed text-xs px-3 py-1 border transition ${
                          chosenGender === g
                            ? "border-[#6b1a0e] bg-[rgba(180,60,40,0.15)] dsa-ink"
                            : "border-[rgba(30,18,8,0.45)] dsa-ink-faded hover:bg-[rgba(255,250,230,0.5)]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded mb-1">
                    Charaktername
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={chosenName}
                      onChange={(e) => {
                        setChosenName(e.target.value);
                        setNameTouched(true);
                      }}
                      placeholder="z. B. Hjalmar von Salzgar"
                      className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 bg-transparent outline-none focus:bg-[rgba(255,250,230,0.4)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cid = chosenClass.id;
                        setChosenName(pickRandomName(cid, chosenGender));
                        setNameTouched(true);
                      }}
                      title="Zufallsname"
                      className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink underline shrink-0"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[rgba(30,18,8,0.4)]">
                <button
                  type="button"
                  onClick={() => setSigningOpen(false)}
                  className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded underline px-2"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!chosenName.trim()}
                  className="dsa-stamp text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ✒ Unterschreiben
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}