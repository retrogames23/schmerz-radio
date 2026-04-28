import { useEffect, useState } from "react";
import { CloseButton } from "./CloseButton";
import portraitLayard from "@/assets/portrait-layard.png";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Lese-Overlay für den E67-Bewohner-Ausweis.
 * Zwei Seiten: Vorderseite (Lichtbild & Daten) und Rückseite mit
 * geprägtem Bewohner-Code „2611“ (siehe §2 Abs. 7 im Handbuch).
 */
export function IdCardOverlay({ open, onClose }: Props) {
  const [side, setSide] = useState<"front" | "back">("front");

  useEffect(() => {
    if (!open) return;
    setSide("front");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setSide((s) => (s === "front" ? "back" : "front"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl"
      >
        <CloseButton
          onClick={onClose}
          tone="amber"
          label="Ausweis schließen"
          className="absolute -right-2 -top-2 z-10"
        />

        {/* Card */}
        <button
          type="button"
          onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
          aria-label="Ausweis umdrehen"
          className="block w-full perspective"
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative aspect-[1.586/1] w-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform:
                side === "front" ? "rotateY(0deg)" : "rotateY(180deg)",
            }}
          >
            {/* Vorderseite */}
            <div
              className="absolute inset-0 overflow-hidden rounded-lg border border-[#7a5a20]/60 shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
              style={{
                backfaceVisibility: "hidden",
                background:
                  "linear-gradient(150deg, #ece2c4 0%, #d8c69a 45%, #c4a86a 100%)",
              }}
            >
              {/* Guilloche-Hintergrund */}
              <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(90,64,21,0.18) 0 1px, transparent 1px 6px), repeating-linear-gradient(-45deg, rgba(90,64,21,0.12) 0 1px, transparent 1px 9px)",
                }}
              />
              {/* Wasserzeichen-Siegel */}
              <div className="pointer-events-none absolute right-4 bottom-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#5a4015]/30 text-center font-display text-[7px] uppercase tracking-[0.3em] text-[#5a4015]/30">
                <div className="leading-tight">
                  Leitstelle<br />E67<br />· 26 ·
                </div>
              </div>

              <div className="relative flex h-full flex-col p-5 text-[#2a1c0a]">
                {/* Kopfzeile */}
                <div className="flex items-start justify-between border-b border-[#5a4015]/40 pb-2">
                  <div>
                    <div className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#3a2810]">
                      Wohnkomplex E67 · Leitstelle
                    </div>
                    <div className="font-mono-crt text-[9px] uppercase tracking-widest text-[#7a5a20]">
                      Bewohner-Ausweis — Quadrant 26 / Etage 26
                    </div>
                  </div>
                  <div className="text-right font-mono-crt text-[9px] leading-tight text-[#5a4015]">
                    <div>Ausweis-Nr.</div>
                    <div className="text-[13px] font-bold tracking-widest text-[#2a1c0a]">
                      2611-26-26
                    </div>
                  </div>
                </div>

                {/* Hauptbereich */}
                <div className="mt-3 flex flex-1 items-stretch gap-4">
                  {/* Lichtbild */}
                  <div className="flex flex-col items-center">
                    <div className="relative h-[8.5rem] w-[6.5rem] overflow-hidden rounded-sm border-2 border-[#3a2810] shadow-inner">
                      <img
                        src={portraitLayard}
                        alt="Lichtbild Layard Worag"
                        className="h-full w-full object-cover"
                        style={{ filter: "sepia(0.35) saturate(0.85) contrast(1.05)" }}
                      />
                      {/* Sicherheits-Hologramm-Schimmer */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.6) 48%, transparent 62%)",
                        }}
                      />
                    </div>
                    <div className="mt-1 font-mono-crt text-[7px] uppercase tracking-widest text-[#5a4015]/70">
                      Lichtbild · 26
                    </div>
                  </div>

                  {/* Daten in zwei Spalten */}
                  <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 self-center font-mono-crt text-[11px] leading-tight">
                    <Field label="Nachname" value="Worag" wide />
                    <Field label="Vorname" value="Layard" />
                    <Field label="Geburtsjahr" value="unleserlich" italic />
                    <Field label="Wohnung" value="2611" mono />
                    <Field label="Status" value="Bewohner · ständig" />
                    <Field label="Klasse" value="C-7" />
                    <Field label="Ausgestellt" value="??.??.????" italic />
                    <Field label="Gültig bis" value="unleserlich" italic />
                  </div>
                </div>

                {/* Unterschrift & Hinweise */}
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="flex-1">
                    <div className="border-t border-[#5a4015]/60 pt-0.5 text-[7px] uppercase tracking-widest text-[#5a4015]/70">
                      Unterschrift Bewohner
                    </div>
                    <div
                      className="-mt-3 font-display text-[15px] italic text-[#2a1c0a]/80"
                      style={{ fontFamily: "cursive" }}
                    >
                      L. Worag
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="border-t border-[#5a4015]/60 pt-0.5 text-[7px] uppercase tracking-widest text-[#5a4015]/70">
                      Leitstelle · Sachbearbeitung
                    </div>
                    <div
                      className="-mt-2 font-display text-[12px] italic text-[#2a1c0a]/70"
                      style={{ fontFamily: "cursive" }}
                    >
                      I. Brendt
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between font-mono-crt text-[8px] uppercase tracking-widest text-[#5a4015]/70">
                  <span>Rückseite klicken</span>
                  <span>Nicht knicken · nicht laminieren</span>
                </div>
              </div>
            </div>

            {/* Rückseite */}
            <div
              className="absolute inset-0 overflow-hidden rounded-lg border border-[#7a5a20]/60 shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background:
                  "linear-gradient(150deg, #e0d4a8 0%, #c9b78a 50%, #a88a4c 100%)",
              }}
            >
              <div className="relative flex h-full flex-col p-5 text-[#2a1c0a]">
                {/* Magnetstreifen */}
                <div className="-mx-5 -mt-5 h-9 bg-gradient-to-b from-[#1a1208] to-[#0a0604]" />

                <div className="mt-4 grid flex-1 grid-cols-[1fr_auto] items-center gap-4">
                  {/* linke Spalte: Code */}
                  <div className="text-center">
                    <div className="font-mono-crt text-[9px] uppercase tracking-widest text-[#5a4015]">
                      Bewohner-Code (§2 Abs. 7)
                    </div>
                    <div
                      className="mt-2 font-mono-crt text-5xl font-bold tracking-[0.4em] text-[#2a1c0a]"
                      style={{
                        textShadow:
                          "0 0 1px rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.45), 0 -1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      2611
                    </div>
                    <div className="mt-2 font-display text-[9px] italic text-[#5a4015]">
                      geprägt — bitte vor Lichteinfall schützen
                    </div>
                  </div>
                  {/* rechte Spalte: Unterschriftsfeld + Strichcode */}
                  <div className="flex h-full flex-col items-center justify-between py-1">
                    <div className="flex items-end gap-[1px] opacity-80">
                      {[3,1,2,4,1,3,2,1,4,2,1,3,2,4,1,2,3,1,2,4,1,3].map((w, i) => (
                        <div
                          key={i}
                          className="bg-[#1a1208]"
                          style={{ width: `${w}px`, height: "44px" }}
                        />
                      ))}
                    </div>
                    <div className="mt-1 font-mono-crt text-[8px] tracking-widest text-[#5a4015]">
                      26·26·2611·C7
                    </div>
                  </div>
                </div>

                {/* MRZ */}
                <div className="mt-2 border-t border-[#5a4015]/40 pt-1 font-mono-crt text-[10px] tracking-[0.15em] text-[#2a1c0a]/80">
                  <div>E67&lt;&lt;WORAG&lt;&lt;LAYARD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                  <div>2611262600C7&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;0001</div>
                </div>

                <div className="mt-1 flex items-center justify-between font-mono-crt text-[8px] uppercase tracking-widest text-[#5a4015]/70">
                  <span>Eigentum der Leitstelle E67</span>
                  <span>Bei Fund: 001</span>
                </div>
              </div>
            </div>
          </div>
        </button>
        <div className="mt-3 text-center font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow/70">
          Klick auf den Ausweis: umdrehen · ESC: schließen
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  wide,
  mono,
  italic,
}: {
  label: string;
  value: string;
  wide?: boolean;
  mono?: boolean;
  italic?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-[7px] uppercase tracking-[0.2em] text-[#7a5a20]">
        {label}
      </div>
      <div
        className={[
          "border-b border-[#5a4015]/30 pb-0.5 text-[#2a1c0a]",
          mono ? "font-mono-crt font-bold tracking-widest" : "font-bold",
          italic ? "italic font-normal opacity-75" : "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}