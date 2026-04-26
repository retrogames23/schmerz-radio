import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/game/dsa/classes";

type Phase = "intro" | "rolling" | "review" | "done";

function emptyAttrs(): Partial<Attrs> {
  return {};
}

/** Glühender Würfel-Wurf eines einzelnen Eigenschaftswerts. */
function DiceCell({
  attr,
  finalValue,
  rolling,
}: {
  attr: Attr;
  finalValue: number | null;
  rolling: boolean;
}) {
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!rolling) {
      setShown(finalValue);
      return;
    }
    let cancelled = false;
    let frame = 0;
    const interval = window.setInterval(() => {
      if (cancelled) return;
      frame += 1;
      setShown(8 + Math.floor(Math.random() * 6));
      if (frame > 12) {
        window.clearInterval(interval);
      }
    }, 50);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [rolling, finalValue]);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-sm border px-2 py-2 transition ${
        finalValue !== null
          ? "border-amber-glow/60 bg-amber-glow/10 text-amber-glow"
          : "border-border bg-secondary/40 text-muted-foreground"
      }`}
    >
      <div className="font-mono-crt text-[10px] uppercase tracking-widest">
        {attr}
      </div>
      <div
        className={`font-display text-2xl leading-none ${
          finalValue !== null ? "amber-glow" : ""
        }`}
      >
        {shown ?? "–"}
      </div>
      <div className="text-[9px] text-muted-foreground">{ATTR_LABEL[attr]}</div>
    </div>
  );
}

export function DsaCharacterCreator() {
  const { dsaCreatorOpen, closeDsaCreator, setDsaCharacter, flags, api } =
    useGame();
  const [phase, setPhase] = useState<Phase>("intro");
  const [attrs, setAttrs] = useState<Partial<Attrs>>(emptyAttrs());
  const [le, setLe] = useState<number | null>(null);
  const [rollingIdx, setRollingIdx] = useState<number>(-1);
  const [chosenClassId, setChosenClassId] = useState<string | null>(null);
  const [rerolled, setRerolled] = useState<boolean>(false);
  const cancelRef = useRef(false);

  // Beim Öffnen alles zurücksetzen.
  useEffect(() => {
    if (!dsaCreatorOpen) return;
    cancelRef.current = false;
    setPhase("intro");
    setAttrs(emptyAttrs());
    setLe(null);
    setRollingIdx(-1);
    setChosenClassId(null);
    setRerolled(flags.has("dsaCharacterRerolled"));
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

  async function rollAll() {
    setPhase("rolling");
    setAttrs(emptyAttrs());
    setLe(null);
    const rolled: Partial<Attrs> = {};
    for (let i = 0; i < ATTR_ORDER.length; i++) {
      if (cancelRef.current) return;
      setRollingIdx(i);
      // Animations-Pause während die Ziffern flackern.
      await new Promise((r) => window.setTimeout(r, 700));
      const a = ATTR_ORDER[i];
      rolled[a] = roll1d6plus7();
      setAttrs({ ...rolled });
    }
    setRollingIdx(-1);
    const finalAttrs = rolled as Attrs;
    setLe(rollLE(finalAttrs.KK));
    setPhase("review");
  }

  function handleReroll() {
    if (rerolled) return;
    setRerolled(true);
    api.setFlag("dsaCharacterRerolled");
    rollAll();
  }

  function handleConfirm() {
    if (!fullAttrs || !chosenClassId || le === null) return;
    const cls = DSA_CLASSES.find((c) => c.id === chosenClassId)!;
    const ae = cls.magic ? rollAE(fullAttrs.MU, fullAttrs.IN) : null;
    setDsaCharacter({
      classId: cls.id,
      className: cls.name,
      name: DEFAULT_NAME[cls.id],
      attrs: { ...fullAttrs },
      le,
      ae,
      rerolled,
    });
    api.setFlag("dsaCharacterRolled");
    api.setFlag("dsaSeatedAtTable");
    closeDsaCreator();
  }

  function handleCancel() {
    cancelRef.current = true;
    closeDsaCreator();
  }

  if (!dsaCreatorOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-sm border border-amber-glow/50 bg-background/95 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CloseButton
          onClick={handleCancel}
          label="Charakter-Erschaffung abbrechen"
          className="absolute right-3 top-3 z-10"
        />
        <div className="border-b border-amber-glow/30 bg-amber-glow/5 px-5 py-3">
          <div className="font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow">
            ▣ Heldenerschaffung — Das Schwarze Auge, 2. Edition
          </div>
          <div className="mt-1 font-display text-lg text-foreground">
            Sieben Eigenschaften, ein Wurf je 1W6+7.
          </div>
        </div>

        <div className="px-5 py-5">
          {phase === "intro" && (
            <div className="space-y-4">
              <p className="font-display text-base leading-relaxed text-foreground">
                Tjark schiebt dir einen sechsseitigen Würfel zu.
                <br />
                Sieben Eigenschaften, sagt er. Mut, Klugheit, Charisma,
                Fingerfertigkeit, Gewandtheit, Intuition, Körperkraft. Für
                jede einmal würfeln, plus sieben.
              </p>
              <p className="font-display text-sm leading-relaxed text-muted-foreground">
                {rerolled
                  ? "Du hast deinen zweiten Wurf — danach bleibt es, wie es ist."
                  : "Wenn du keinen Krieger erschaffen kannst, darfst du noch einmal alles neu würfeln."}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={rollAll}
                  className="rounded-sm border border-amber-glow/60 bg-amber-glow/10 px-4 py-2 text-sm uppercase tracking-widest text-amber-glow hover:bg-amber-glow/20"
                >
                  ▸ Würfeln
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-sm border border-border px-4 py-2 text-sm uppercase tracking-widest text-muted-foreground hover:border-amber-glow/40 hover:text-foreground"
                >
                  Doch nicht
                </button>
              </div>
            </div>
          )}

          {(phase === "rolling" || phase === "review") && (
            <div className="space-y-5">
              <div className="grid grid-cols-7 gap-2">
                {ATTR_ORDER.map((a, idx) => (
                  <DiceCell
                    key={a}
                    attr={a}
                    finalValue={attrs[a] ?? null}
                    rolling={phase === "rolling" && rollingIdx === idx}
                  />
                ))}
              </div>

              {phase === "review" && fullAttrs && le !== null && (
                <>
                  <div className="rounded-sm border border-border/60 bg-secondary/30 px-3 py-2 text-sm">
                    <span className="font-mono-crt text-xs uppercase tracking-widest text-muted-foreground">
                      Lebensenergie
                    </span>{" "}
                    <span className="font-display text-lg amber-glow">{le}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      (KK {fullAttrs.KK} + 1W6 + 15)
                    </span>
                  </div>

                  <div>
                    <div className="mb-2 font-mono-crt text-xs uppercase tracking-widest text-muted-foreground">
                      Mögliche Klassen
                    </div>
                    {qualifying.length === 0 ? (
                      <p className="font-display text-sm text-rust">
                        Keine Standardklasse erfüllt diese Werte. Das passiert
                        statistisch eigentlich nie — würfle nochmal.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {DSA_CLASSES.map((c) => {
                          const ok = qualifying.includes(c);
                          const selected = chosenClassId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              disabled={!ok}
                              onClick={() => setChosenClassId(c.id)}
                              className={`rounded-sm border px-3 py-2 text-left transition ${
                                selected
                                  ? "border-amber-glow bg-amber-glow/15"
                                  : ok
                                  ? "border-border bg-secondary/40 hover:border-amber-glow/60 hover:bg-amber-glow/5"
                                  : "cursor-not-allowed border-border/40 bg-secondary/20 opacity-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-display text-base text-foreground">
                                  {c.name}
                                </span>
                                <span className="font-mono-crt text-[10px] uppercase tracking-widest">
                                  {ok ? (
                                    <span className="text-amber-glow">✓</span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      ✗
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {c.blurb}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!chosenClassId}
                      className="rounded-sm border border-amber-glow/60 bg-amber-glow/10 px-4 py-2 text-sm uppercase tracking-widest text-amber-glow hover:bg-amber-glow/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ▣ Mit dieser Klasse spielen
                    </button>
                    {!kriegerOk && !rerolled && (
                      <button
                        type="button"
                        onClick={handleReroll}
                        className="rounded-sm border border-rust/60 bg-rust/10 px-4 py-2 text-sm uppercase tracking-widest text-rust hover:bg-rust/20"
                      >
                        ↻ Nochmal — der Krieger fehlt euch ja
                      </button>
                    )}
                    {rerolled && !kriegerOk && (
                      <span className="self-center font-mono-crt text-xs uppercase tracking-widest text-muted-foreground">
                        zweiter Wurf — kein dritter mehr
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}