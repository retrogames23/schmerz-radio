import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { dialogs } from "@/game/dialogs";
import { useSettings } from "@/audio/SettingsContext";
import { speak, stopSpeech } from "@/audio/speech";
import { CloseButton } from "./CloseButton";
import { getPersona, getPersonaBySpeaker } from "@/game/npcPersonas";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

export function DialogOverlay() {
  const {
    dialogId,
    dialogLineId,
    advanceDialog,
    closeDialog,
    radioActive,
    api,
    openFreeChat,
  } = useGame();
  const { ttsEnabled } = useSettings();
  const isCoarsePointer = useCoarsePointer();

  const tree = dialogId ? dialogs[dialogId] : null;
  const line = tree && dialogLineId ? tree.lines[dialogLineId] : null;

  // Speak the line whenever it changes
  useEffect(() => {
    if (!line) {
      stopSpeech();
      return;
    }
    if (!ttsEnabled) {
      stopSpeech();
      return;
    }
    speak(line.speaker, line.text);
    return () => stopSpeech();
  }, [line, ttsEnabled]);

  // Tastatur: Space/Enter → weiter (wenn keine Auswahl ansteht)
  useEffect(() => {
    if (!line) return;
    const hasChoices =
      (line.choices?.filter((c) => {
        if (c.requiresRadio && !radioActive) return false;
        if (c.requires && c.requires.some((f) => !api.hasFlag(f))) return false;
        if (c.hiddenWhen && c.hiddenWhen.some((f) => api.hasFlag(f))) return false;
        return true;
      }) ?? []).length > 0;
    if (hasChoices) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advanceDialog();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [line, radioActive, advanceDialog]);

  if (!line || !tree) return null;

  const visibleChoices =
    line.choices?.filter((c) => {
      if (c.requiresRadio && !radioActive) return false;
      if (c.requires && c.requires.some((f) => !api.hasFlag(f))) return false;
      if (c.hiddenWhen && c.hiddenWhen.some((f) => api.hasFlag(f))) return false;
      return true;
    }) ?? [];

  const canAdvance = visibleChoices.length === 0;

  // Free-Mode-Einstieg: nur am Endsatz eines Baums anbieten, wenn dieser
  // Baum eine Persona hinterlegt hat (DialogTree.npcId).
  const npcId = (tree as unknown as { npcId?: string }).npcId ?? null;
  const persona = getPersona(npcId) ?? getPersonaBySpeaker(line.speaker);
  // Free-Chat ist auf Touch-/Mobile-Geräten deaktiviert (zu speicher-/leistungsintensiv).
  // Sobald eine Persona hinterlegt ist, ist der Wechsel jederzeit möglich —
  // diskreter Knopf in der Header-Zeile, nicht erst am Endsatz.
  const showFreeMode = !!persona && !isCoarsePointer;

  const enterFreeChat = () => {
    if (!persona) return;
    stopSpeech();
    closeDialog();
    openFreeChat(persona.id);
  };

  const handleAdvance = () => {
    if (!canAdvance) return;
    advanceDialog();
  };

  // Manche NPCs stehen am linken oder rechten Bildrand. Damit die
  // Sprechblase sie nicht verdeckt, richten wir sie pro Sprecher aus.
  // KOWALK steht in der Kantine links → Bubble nach rechts.
  const speakerAlign: Record<string, "start" | "center" | "end"> = {
    KOWALK: "end",
  };
  const align = speakerAlign[line.speaker] ?? "center";
  const justifyClass =
    align === "end"
      ? "justify-end"
      : align === "start"
        ? "justify-start"
        : "justify-center";

  const speakerColor: Record<string, string> = {
    LAYARD: "text-foreground",
    INSA: "text-amber-glow",
    PHILIPPE: "text-foreground",
    SANITÄTER: "text-rust",
    SYSTEM: "text-phosphor",
    RADIO: "text-amber-glow",
    MIKAEL: "text-amber-glow",
    RECEPTION: "text-phosphor",
    MIRA: "text-phosphor",
    BODO: "text-foreground",
    HELKA: "text-foreground",
    ENNIS: "text-foreground",
    STEGMANN: "text-amber-glow",
    OKWU: "text-foreground",
    TJARK: "text-foreground",
    BREM: "text-foreground",
    YELVA: "text-foreground",
  };

  // Tastatur: Space / Enter / Klick-irgendwohin → weiter (nur wenn keine Auswahl)
  // Esc → schließen
  // (eigene useEffect, damit Listener mit jeder Zeile aktuell sind)
  // eslint-disable-next-line react-hooks/rules-of-hooks

  return (
    <div
      className={`absolute inset-0 z-40 flex items-end ${justifyClass} bg-black/80 px-4 pb-6 ${
        canAdvance ? "cursor-pointer" : ""
      }`}
      onClick={handleAdvance}
    >
      <div
        className="fade-in relative w-full max-w-3xl rounded-sm border border-amber-glow/40 bg-background/95 p-5 pr-12 shadow-[0_0_40px_rgba(0,0,0,0.7)]"
        onClick={(e) => {
          // Klick auf die Bubble selbst zählt nur als „weiter“,
          // wenn keine Auswahl ansteht. Sonst stoppen wir die Propagation
          // damit Choice-Buttons nicht versehentlich auch das Backdrop triggern.
          if (!canAdvance) {
            e.stopPropagation();
          }
        }}
      >
        <span
          className="absolute right-3 top-3"
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton
            onClick={() => {
              stopSpeech();
              closeDialog();
            }}
            label="Dialog schließen"
          />
        </span>
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`font-mono-crt text-sm uppercase tracking-[0.3em] ${
              speakerColor[line.speaker] ?? "text-foreground"
            }`}
          >
            {line.speaker}
          </span>
          {showFreeMode && persona && (
            <button
              type="button"
              title="Wechsle ins freie Gespräch (lokales KI-Modell)"
              onClick={(e) => {
                e.stopPropagation();
                enterFreeChat();
              }}
              className="mr-6 font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow/60 transition hover:text-amber-glow"
            >
              ▸ Frei reden …
            </button>
          )}
        </div>

        <p className="font-display text-lg leading-relaxed text-foreground text-shadow-hard">
          {line.text}
        </p>

        {radioActive && line.subtext && (
          <p className="slow-fade-in mt-3 font-mono-crt text-base italic text-amber-glow amber-glow">
            ◉ {line.subtext}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {visibleChoices.length > 0 ? (
            visibleChoices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  choice.action?.(api);
                  if (choice.next) advanceDialog(choice.next);
                  else advanceDialog();
                }}
                className="group flex items-center gap-2 rounded-sm border border-border bg-secondary/60 px-3 py-2 text-left text-sm text-foreground transition hover:border-amber-glow/70 hover:bg-amber-glow/10"
              >
                <span className="text-amber-glow opacity-60 group-hover:opacity-100">
                  ▸
                </span>
                <span>{choice.text}</span>
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => advanceDialog()}
              className="self-end rounded-sm border border-amber-glow/40 px-3 py-1 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
            >
              {line.end || !line.next ? "▣ Beenden" : "▸ Weiter"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}