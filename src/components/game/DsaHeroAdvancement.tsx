import { useMemo, useState } from "react";
import { CloseButton } from "./CloseButton";
import { ATTR_LABEL, ATTR_ORDER, type Attr } from "@/game/dsa/dice";
import {
  availableAp,
  previewCost,
  applyAdvancement,
  isMagicClass,
  ownsSpellSchool,
  listAllTalents,
  listSpellsForClass,
  type Advancement,
} from "@/game/dsa/advancement";
import type { DsaHero } from "@/game/types";

/**
 * Steigerungs-Overlay. Zeigt verfügbare AP und erlaubt Erhöhen von
 * Eigenschaften, Talenten und (bei magischen Klassen) Zaubern. Jede
 * Steigerung wird sofort persistiert via `onChange`.
 */
export function DsaHeroAdvancement({
  hero,
  onChange,
  onClose,
}: {
  hero: DsaHero;
  onChange: (h: DsaHero) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"attrs" | "talents" | "spells">("attrs");
  const ap = availableAp(hero);
  const magic = isMagicClass(hero.classId);

  function step(a: Advancement) {
    const cost = previewCost(hero, a);
    if (ap < cost) return;
    const next = applyAdvancement(hero, a);
    if (next !== hero) onChange(next);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-3xl rounded-md shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]">
        <CloseButton onClick={onClose} />

        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Heldensteigerung · DSA 3
          </div>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl sm:text-3xl dsa-ink font-extrabold">
              {hero.name}
            </h2>
            <div className="dsa-typed text-sm dsa-ink font-bold">
              Verfügbare AP: <span className="font-display text-xl">{ap}</span>
              <span className="ml-2 opacity-70 text-[11px] uppercase tracking-widest">
                (gesamt {hero.apTotal} · ausgegeben {hero.apSpent})
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5 flex-wrap">
            <TabBtn active={tab === "attrs"} onClick={() => setTab("attrs")}>
              Eigenschaften
            </TabBtn>
            <TabBtn active={tab === "talents"} onClick={() => setTab("talents")}>
              Talente
            </TabBtn>
            {magic && (
              <TabBtn active={tab === "spells"} onClick={() => setTab("spells")}>
                Zauber
              </TabBtn>
            )}
          </div>
        </div>

        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-2">
          {tab === "attrs" && <AttrTab hero={hero} ap={ap} onStep={step} />}
          {tab === "talents" && <TalentTab hero={hero} ap={ap} onStep={step} />}
          {tab === "spells" && magic && (
            <SpellTab hero={hero} ap={ap} onStep={step} />
          )}
        </div>

        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between px-5 sm:px-6 py-3 text-xs">
          <span className="opacity-80">
            Steigerungen werden sofort gespeichert.
          </span>
          <button
            onClick={onClose}
            className="underline-offset-2 hover:underline"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "dsa-typed text-[11px] uppercase tracking-widest font-bold px-3 py-1.5 border-2 " +
        (active
          ? "bg-[rgba(30,18,8,0.85)] text-[#f1e6c8] border-[rgba(30,18,8,0.85)]"
          : "dsa-ink border-[rgba(30,18,8,0.55)] hover:bg-black/5")
      }
    >
      {children}
    </button>
  );
}

function Row({
  label,
  value,
  cost,
  ap,
  onStep,
  hint,
}: {
  label: string;
  value: string | number;
  cost: number;
  ap: number;
  onStep: () => void;
  hint?: string;
}) {
  const can = ap >= cost;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[rgba(20,12,4,0.4)] py-1.5 dsa-typed dsa-ink text-[13px] font-semibold">
      <div className="min-w-0 flex-1">
        <div className="truncate">{label}</div>
        {hint && (
          <div className="text-[10px] opacity-70 uppercase tracking-widest">{hint}</div>
        )}
      </div>
      <div className="font-display text-base font-extrabold w-10 text-right">
        {value}
      </div>
      <button
        type="button"
        onClick={onStep}
        disabled={!can}
        className={
          "px-2 py-1 border-2 text-[10px] uppercase tracking-widest font-bold rounded-sm " +
          (can
            ? "border-[rgba(30,18,8,0.85)] bg-[rgba(30,18,8,0.85)] text-[#f1e6c8] hover:bg-[rgba(30,18,8,1)]"
            : "border-[rgba(20,12,4,0.3)] opacity-40 cursor-not-allowed")
        }
        title={can ? `+1 für ${cost} AP` : `Benötigt ${cost} AP`}
      >
        +1 · {cost} AP
      </button>
    </div>
  );
}

function AttrTab({
  hero,
  ap,
  onStep,
}: {
  hero: DsaHero;
  ap: number;
  onStep: (a: Advancement) => void;
}) {
  return (
    <div>
      {ATTR_ORDER.map((a) => {
        const cur = (hero.attrs as Record<string, number>)[a] ?? 0;
        return (
          <Row
            key={a}
            label={`${ATTR_LABEL[a]} (${a})`}
            value={cur}
            cost={previewCost(hero, { kind: "attr", attr: a as Attr })}
            ap={ap}
            onStep={() => onStep({ kind: "attr", attr: a as Attr })}
            hint={
              a === "KK" ? "+1 LE" : a === "IN" && hero.ae !== null ? "+1 AE" : undefined
            }
          />
        );
      })}
    </div>
  );
}

function TalentTab({
  hero,
  ap,
  onStep,
}: {
  hero: DsaHero;
  ap: number;
  onStep: (a: Advancement) => void;
}) {
  const talents = useMemo(() => listAllTalents(), []);
  const byCat = useMemo(() => {
    const m: Record<string, typeof talents> = {};
    for (const t of talents) (m[t.category] ??= []).push(t);
    return m;
  }, [talents]);
  const order = ["koerper", "gesellschaft", "natur", "wissen", "handwerk", "kampf"];
  const labels: Record<string, string> = {
    koerper: "Körper",
    gesellschaft: "Gesellschaft",
    natur: "Natur",
    wissen: "Wissen",
    handwerk: "Handwerk",
    kampf: "Kampf",
  };
  return (
    <div className="space-y-4">
      {order
        .filter((k) => byCat[k]?.length)
        .map((k) => (
          <section key={k}>
            <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-1 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
              {labels[k]}
            </div>
            {byCat[k].map((t) => {
              const cur = hero.talents[t.id];
              const known = cur !== undefined;
              return (
                <Row
                  key={t.id}
                  label={t.name}
                  value={known ? cur! : "—"}
                  cost={previewCost(hero, { kind: "talent", id: t.id })}
                  ap={ap}
                  onStep={() => onStep({ kind: "talent", id: t.id })}
                  hint={
                    known
                      ? `Probe ${t.probe.join("/")}`
                      : `neu lernen · Probe ${t.probe.join("/")}`
                  }
                />
              );
            })}
          </section>
        ))}
    </div>
  );
}

function SpellTab({
  hero,
  ap,
  onStep,
}: {
  hero: DsaHero;
  ap: number;
  onStep: (a: Advancement) => void;
}) {
  const spells = useMemo(() => listSpellsForClass(hero.classId), [hero.classId]);
  return (
    <div className="space-y-2">
      {spells.map((s) => {
        const cur = hero.spells[s.id];
        const known = cur !== undefined;
        const own = ownsSpellSchool(hero.classId, s.id);
        return (
          <Row
            key={s.id}
            label={`${s.name}${own ? "" : " *"}`}
            value={known ? cur! : "—"}
            cost={previewCost(hero, { kind: "spell", id: s.id })}
            ap={ap}
            onStep={() => onStep({ kind: "spell", id: s.id })}
            hint={
              (known ? "" : "neu lernen · ") +
              `Probe ${s.probe.join("/")} · ${s.cost} AsP` +
              (own ? "" : " · Fremdzauber")
            }
          />
        );
      })}
      <p className="dsa-typed text-[11px] dsa-ink opacity-70 italic pt-2">
        * = Fremdzauber (doppelte Kosten).
      </p>
    </div>
  );
}