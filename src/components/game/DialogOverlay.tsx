import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { dialogs } from "@/game/dialogs";
import { useSettings } from "@/audio/SettingsContext";
import { speak, stopSpeech } from "@/audio/speech";
import { CloseButton } from "./CloseButton";

export function DialogOverlay() {
  const {
    dialogId,
    dialogLineId,
    advanceDialog,
    closeDialog,
    radioActive,
    api,
  } = useGame();
  const { ttsEnabled } = useSettings();

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

  if (!line || !tree) return null;

  const visibleChoices =
    line.choices?.filter((c) => {
      if (c.requiresRadio && !radioActive) return false;
      return true;
    }) ?? [];

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

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/55 px-4 pb-6">
      <div className="fade-in relative w-full max-w-3xl rounded-sm border border-amber-glow/40 bg-background/95 p-5 pr-12 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={() => {
            stopSpeech();
            closeDialog();
          }}
          label="Dialog schließen"
          className="absolute right-3 top-3"
        />
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`font-mono-crt text-sm uppercase tracking-[0.3em] ${
              speakerColor[line.speaker] ?? "text-foreground"
            }`}
          >
            {line.speaker}
          </span>
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