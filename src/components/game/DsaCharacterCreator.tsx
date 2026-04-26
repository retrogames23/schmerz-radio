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

type Phase = "intro" | "rolling" | "review" | "done";

/** Ein paar typische DSA2-Vornamen je Klasse + Geschlecht — für den
 *  Würfel-Knopf neben dem Namensfeld. */
const NAME_POOL: Record<DsaClassId, { männlich: string[]; weiblich: string[] }> = {
  krieger: {
    männlich: ["Hjalmar von Salzgar", "Edur von Tannstein", "Roban Greifenklau", "Aldred von Eberstamm"],
    weiblich: ["Sigwine von Salzgar", "Brynja Greifenklau", "Hilde von Tannstein", "Roana von Eberstamm"],
  },
  streuner: {
    männlich: ["Knut Schattenstrich", "Marek Pfennigfuchs", "Dietrich Krummfinger"],
    weiblich: ["Lisbeth Schattenstrich", "Mara Pfennigfuchs", "Yala Krummfinger"],
  },
  magier: {
    männlich: ["Wendelmir der Genaue", "Halmir vom Drachenstein", "Aldebrand der Stille"],
    weiblich: ["Wendelmira die Genaue", "Halma vom Drachenstein", "Aldebranda die Stille"],
  },
  elf: {
    männlich: ["Niamhal Silberlied", "Faenor Mondhauch", "Cael Tiefwurzel"],
    weiblich: ["Niamhuin Silberlied", "Faelin Mondhauch", "Caela Tiefwurzel"],
  },
  zwerg: {
    männlich: ["Angbar, Sohn des Angrosch", "Torin Steinaxt", "Brogar Erzhand"],
    weiblich: ["Anga, Tochter des Angrosch", "Torina Steinaxt", "Brogina Erzhand"],
  },
  gaukler: {
    männlich: ["Tjelvar mit dem doppelten Gesicht", "Riko Buntfuß", "Faldur Lautenklang"],
    weiblich: ["Tjelva mit dem doppelten Gesicht", "Rika Buntfuß", "Faldura Lautenklang"],
  },
  thorwaler: {
    männlich: ["Asleif Walfangsohn", "Garm Eisbart", "Sven Sturmhand"],
    weiblich: ["Asleif Walfangstochter", "Gerda Eisbart", "Svenja Sturmhand"],
  },
  druide: {
    männlich: ["Brandil von der Eiche", "Ailwin Mistelzweig", "Tarvil Hainwacht"],
    weiblich: ["Brandila von der Eiche", "Ailwina Mistelzweig", "Tarvila Hainwacht"],
  },
};

type Geschlecht = "männlich" | "weiblich";

function pickRandomName(cid: DsaClassId, g: Geschlecht): string {
  const pool = NAME_POOL[cid][g];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Bissige Kommentare nach 10 Re-Rolls — rotieren mit jeder weiteren 10er-Schwelle. */
const SNIPPY_COMMENTS: { speaker: "BREM" | "YELVA" | "TJARK"; text: string }[] = [
  { speaker: "BREM", text: "Zehn Würfe. Zehn! Wir sind hier nicht bei der Lotterie." },
  { speaker: "YELVA", text: "Du weißt schon, dass die Würfel sich nicht ändern, wenn man sie öfter wirft?" },
  { speaker: "TJARK", text: "Spätestens beim Zwanzigsten erwarte ich eine Bestechung." },
  { speaker: "BREM", text: "Bei mir hat's beim ersten Mal geklappt. Nur so." },
  { speaker: "YELVA", text: "Statistisch gesehen … nein, lass es. Würfel einfach." },
];

/** Flavor-Default-Felder je Klasse — handgeschriebene Persona auf dem Bogen. */
const CLASS_FLAVOR: Record<
  DsaClassId,
  { stand: string; heimat: string; goetter: string; haar: string; augen: string }
> = {
  krieger: { stand: "Edelmann", heimat: "Mittelreich, Gareth", goetter: "Rondra · Praios", haar: "dunkelbraun", augen: "graublau" },
  streuner: { stand: "Bürgerlich", heimat: "Havena, Albernia", goetter: "Phex", haar: "strohblond", augen: "braun" },
  magier: { stand: "Magier-Adept", heimat: "Akademie zu Punin", goetter: "Hesinde", haar: "schwarz", augen: "grün" },
  elf: { stand: "Auelf", heimat: "Salamandersteine", goetter: "Pheks · Tairach", haar: "kupferrot", augen: "moosgrün" },
  zwerg: { stand: "Erzzwerg", heimat: "Xorlosch, Koschberge", goetter: "Angrosch", haar: "rotbraun", augen: "stahlgrau" },
  gaukler: { stand: "Fahrendes Volk", heimat: "Khunchom, Tulamidenlande", goetter: "Phex · Rahja", haar: "pechschwarz", augen: "haselnuss" },
  thorwaler: { stand: "Hetfrau", heimat: "Thorwal, Olport", goetter: "Swafnir · Travia", haar: "honigblond", augen: "eisblau" },
  druide: { stand: "Hain-Druide", heimat: "Salamandersteine", goetter: "Sumu · Tairach", haar: "ergraut", augen: "tief schwarz" },
};

function emptyAttrs(): Partial<Attrs> {
  return {};
}

/**
 * Stellt einen gebalancten Satz Eigenschaftswerte für eine Klasse zusammen.
 * Mindestwerte werden um +1 angehoben (komfortabel), Maximalwerte respektiert,
 * der Rest landet bei einem soliden 11. So erfüllt der Bogen garantiert die
 * Voraussetzungen, ohne übertrieben stark zu wirken.
 */
function balancedAttrsFor(cls: DsaClass): Attrs {
  const base: Attrs = { MU: 11, KL: 11, CH: 11, FF: 11, GE: 11, IN: 11, KK: 11 };
  if (cls.min) {
    for (const k of Object.keys(cls.min) as Array<keyof Attrs>) {
      const need = cls.min[k];
      if (need !== undefined) {
        base[k] = Math.min(13, need + 1);
      }
    }
  }
  if (cls.max) {
    for (const k of Object.keys(cls.max) as Array<keyof Attrs>) {
      const cap = cls.max[k];
      if (cap !== undefined && base[k] > cap) {
        base[k] = cap;
      }
    }
  }
  return base;
}

/** Ein Eigenschafts-Kästchen in DSA2-Optik. */
function AttrBox({
  attr,
  finalValue,
  rolling,
}: {
  attr: Attr;
  finalValue: number | null;
  rolling: boolean;
}) {
  const [shown, setShown] = useState<number | null>(finalValue);
  const lastFinal = useRef<number | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (rolling) {
      const interval = window.setInterval(() => {
        setShown(8 + Math.floor(Math.random() * 6));
      }, 55);
      return () => window.clearInterval(interval);
    }
    setShown(finalValue);
    if (finalValue !== null && finalValue !== lastFinal.current) {
      lastFinal.current = finalValue;
      setPulseKey((k) => k + 1);
    }
  }, [rolling, finalValue]);

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="dsa-typed hidden w-full truncate text-center text-[8px] uppercase tracking-[0.2em] dsa-ink-faded mb-0.5 sm:block">
        {ATTR_LABEL[attr]}
      </div>
      <div
        className={`dsa-box-thick flex h-9 w-9 items-center justify-center sm:h-14 sm:w-14 ${
          rolling ? "bg-amber-100/60" : ""
        }`}
      >
        <span
          key={pulseKey}
          className={`font-display text-xl sm:text-3xl dsa-ink ${
            finalValue !== null && !rolling ? "dsa-value-in" : ""
          }`}
        >
          {shown ?? "—"}
        </span>
      </div>
      <div className="dsa-typed text-[10px] font-bold tracking-widest dsa-ink mt-0.5">
        {attr}
      </div>
    </div>
  );
}

/** Kleine beschriftete Linie wie auf dem Originalbogen. */
function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-end gap-2 ${className}`}>
      <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded shrink-0">
        {label}
      </span>
      <span className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 truncate">
        {value || "\u00A0"}
      </span>
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
    setPhase("intro");
    setAttrs(emptyAttrs());
    setLe(null);
    setRollingIdx(-1);
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

  async function rollAll() {
    setPhase("rolling");
    setAttrs(emptyAttrs());
    setLe(null);
    setChosenClassId(null);
    setSnippy(null);
    const rolled: Partial<Attrs> = {};
    for (let i = 0; i < ATTR_ORDER.length; i++) {
      if (cancelRef.current) return;
      setRollingIdx(i);
      await new Promise((r) => window.setTimeout(r, 650));
      const a = ATTR_ORDER[i];
      rolled[a] = roll1d6plus7();
      setAttrs({ ...rolled });
    }
    setRollingIdx(-1);
    const finalAttrs = rolled as Attrs;
    setLe(rollLE(finalAttrs.KK));
    setPhase("review");
    // Reroll-Zähler erhöhen + ggf. bissigen Spruch zeigen.
    setRollCount((prev) => {
      const next = prev + 1;
      // Erst ab dem 2. Wurf zählt es als "Re-Roll".
      if (next > 1) {
        const rerolls = next - 1; // 1, 2, 3, …
        if (rerolls > 0 && rerolls % 10 === 0) {
          const idx = Math.floor((rerolls / 10 - 1) % SNIPPY_COMMENTS.length);
          setSnippy(SNIPPY_COMMENTS[idx]);
        }
      }
      return next;
    });
  }

  function handleReroll() {
    rollAll();
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
                {["Aberglaube", "Höhenangst", "Goldgier", "Jähzorn", "Neugier", "Raumangst", "Totenangst"].map((n) => (
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
                {(chosenClass?.id === "magier" || chosenClass?.id === "druide"
                  ? ["Stab+5", "Lesen/Schreiben +6", "Sprachen +4", "Pflanzenkunde +3"]
                  : chosenClass?.id === "streuner" || chosenClass?.id === "gaukler"
                  ? ["Dolch +5", "Schleichen +6", "Taschendieb +5", "Lügen +4"]
                  : chosenClass?.id === "elf"
                  ? ["Bogen +7", "Sinnenschärfe +6", "Wildnisleben +5", "Singen +4"]
                  : chosenClass?.id === "thorwaler"
                  ? ["Hiebwaffen +7", "Boote fahren +5", "Zechen +5"]
                  : chosenClass?.id === "zwerg"
                  ? ["Hiebwaffen +6", "Mineralogie +5", "Bergbau +5"]
                  : ["Hiebwaffen +6", "Schild +5", "Reiten +4", "Athletik +4"]
                ).map((t) => (
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
            {phase === "intro" && (
              <>
                <p className="dsa-typed text-sm dsa-ink leading-relaxed">
                  „Sieben Eigenschaften", sagt Tjark. „Mut, Klugheit, Charisma,
                  Fingerfertigkeit, Gewandtheit, Intuition, Körperkraft.
                  Jeweils einen Sechser plus sieben." Er schiebt dir den Würfel
                  zu.
                </p>
                <p className="dsa-typed text-xs dsa-ink-faded">
                  Du kannst so oft neu würfeln, wie du willst — solange du den
                  Bogen noch nicht unterschrieben hast.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={rollAll}
                    className="dsa-stamp text-sm hover:bg-[rgba(255,250,230,0.5)] cursor-pointer"
                  >
                    ▸ Würfeln
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
              <p className="dsa-typed text-sm dsa-ink-faded italic">
                Der Würfel rollt über das Tischtuch …
              </p>
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
                <div>
                  <div className="dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink-faded mb-2">
                    Typus wählen — möglich mit diesen Werten:
                  </div>
                  {qualifying.length === 0 ? (
                    <p className="dsa-typed text-sm" style={{ color: "#6b1a0e" }}>
                      Keine Standardklasse erfüllt diese Werte. Würfle nochmal.
                    </p>
                  ) : (
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                      {DSA_CLASSES.map((c) => {
                        const ok = qualifying.includes(c);
                        const selected = chosenClassId === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={!ok}
                            onClick={() => setChosenClassId(c.id)}
                            title={c.blurb}
                            className={`dsa-typed text-xs px-2 py-1.5 text-left transition border ${
                              selected
                                ? "border-[#6b1a0e] bg-[rgba(180,60,40,0.15)] dsa-ink"
                                : ok
                                ? "border-[rgba(30,18,8,0.6)] dsa-ink hover:bg-[rgba(255,250,230,0.5)]"
                                : "border-[rgba(30,18,8,0.2)] dsa-ink-faded opacity-40 cursor-not-allowed line-through"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

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
                  {chosenClassId && (
                    <button
                      type="button"
                      onClick={handleOpenSigning}
                      title="Bogen unterschreiben"
                      className="dsa-stamp text-sm cursor-pointer"
                    >
                      ▣ Bogen unterschreiben
                    </button>
                  )}
                  {!kriegerOk && (
                    <span className="dsa-typed text-[10px] dsa-ink-faded italic">
                      (kein Krieger möglich)
                    </span>
                  )}
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