import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { getDialog } from "@/game/dialogs/lookup";
import { useSettings } from "@/audio/SettingsContext";
import { speak, stopSpeech } from "@/audio/speech";
import { CloseButton } from "./CloseButton";
import { getPersona, getPersonaBySpeaker } from "@/game/npcPersonas";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useDevMode } from "@/dev/devMode";
import {
  useEditActive,
  useDialogPatchTick,
  setField,
  pushOp,
  clearLineFields,
} from "@/dev/dialogPatchState";

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
  const dev = useDevMode();
  const editActive = useEditActive();
  useDialogPatchTick();
  const editing = dev && editActive;

  const tree = dialogId ? (getDialog(dialogId) ?? null) : null;
  const line = tree && dialogLineId ? tree.lines[dialogLineId] : null;

  // Speak the line whenever it changes
  useEffect(() => {
    if (!line) {
      stopSpeech();
      return;
    }
    if (editing) {
      // Im Edit-Modus keine TTS — sonst quatscht's bei jedem Tastenanschlag.
      stopSpeech();
      return;
    }
    if (!ttsEnabled) {
      stopSpeech();
      return;
    }
    speak(line.speaker, line.text);
    return () => stopSpeech();
  }, [line, ttsEnabled, editing]);

  // Tastatur: Space/Enter → weiter (wenn keine Auswahl ansteht)
  useEffect(() => {
    if (!line) return;
    if (editing) return;
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
  }, [line, radioActive, advanceDialog, editing]);

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
    // Im Edit-Modus advancen wir nicht über den Backdrop-Klick — sonst
    // springt der Dialog beim Klicken neben dem Textarea weg.
    if (editing) return;
    advanceDialog();
  };

  // Liste der erlaubten Sprecher — synchron mit DialogLine["speaker"] in types.ts.
  const SPEAKERS: string[] = [
    "LAYARD","INSA","PHILIPPE","SANITÄTER","SYSTEM","RADIO","MIKAEL",
    "RECEPTION","MIRA","BODO","HELKA","ENNIS","STEGMANN","OKWU","TJARK",
    "BREM","YELVA","KOWALK","BRUST","VOSSBECK","BRAM","MARV",
  ];

  // Vorgängerzeile finden (für „Merge ↑").
  const prevId = (() => {
    if (!editing || !line) return null;
    const candidates: string[] = [];
    for (const k of Object.keys(tree.lines)) {
      const l = tree.lines[k];
      if (l.id === line.id) continue;
      if (l.next === line.id) candidates.push(l.id);
    }
    if (candidates.length !== 1) return null;
    const prev = tree.lines[candidates[0]];
    if (prev.choices && prev.choices.length > 0) return null;
    return prev.id;
  })();

  const handleSplit = (ratio: number) => {
    if (!line || !dialogId) return;
    const text = line.text ?? "";
    if (text.length < 4) return;
    // Caret im Editor-Textarea bevorzugen, sonst nahe `text.length * ratio`
    // auf Wortgrenze schneiden.
    const ta = document.querySelector<HTMLTextAreaElement>(
      "textarea[data-dlg-edit-text]",
    );
    let cut = -1;
    if (ta && document.activeElement === ta) {
      const pos = ta.selectionStart ?? -1;
      const liveText = ta.value;
      if (pos > 0 && pos < liveText.length) {
        // Wenn der User im Textarea editiert hat, vor dem Split den
        // aktuellen Stand als Field-Override sichern.
        if (liveText !== text) {
          setField(dialogId, line.id, { text: liveText });
        }
        const a = liveText.slice(0, pos).trimEnd();
        const b = liveText.slice(pos).trimStart();
        if (a && b) {
          pushOp(dialogId, { kind: "split", at: line.id, parts: [a, b] });
          return;
        }
      }
    }
    if (cut < 0) {
      const target = Math.max(1, Math.min(text.length - 1, Math.round(text.length * ratio)));
      // Suche nächstgelegene Wortgrenze.
      const fwd = text.indexOf(" ", target);
      const bwd = text.lastIndexOf(" ", target);
      cut = fwd === -1 ? bwd : (bwd === -1 ? fwd : (Math.abs(fwd - target) < Math.abs(target - bwd) ? fwd : bwd));
      if (cut <= 0 || cut >= text.length) cut = target;
    }
    const a = text.slice(0, cut).trimEnd();
    const b = text.slice(cut).trimStart();
    if (!a || !b) return;
    pushOp(dialogId, { kind: "split", at: line.id, parts: [a, b] });
  };

  const handleMerge = () => {
    if (!line || !dialogId || !prevId) return;
    pushOp(dialogId, { kind: "merge", from: line.id, into: prevId });
    // Nach dem Merge ist die aktuelle LineId weg → zur Vorgängerzeile springen.
    advanceDialog(prevId);
  };

  const handleInsertAfter = () => {
    if (!line || !dialogId) return;
    if (line.choices && line.choices.length > 0) return;
    pushOp(dialogId, {
      kind: "insertAfter",
      after: line.id,
      text: "…",
      speaker: line.speaker,
    });
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
    BRAM: "text-amber-glow",
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
          {editing ? (
            <select
              value={line.speaker}
              onChange={(e) => {
                if (!dialogId) return;
                setField(dialogId, line.id, {
                  speaker: e.target.value as typeof line.speaker,
                });
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-sm border border-amber-glow/60 bg-background/80 px-2 py-0.5 font-mono-crt text-xs uppercase tracking-[0.2em] text-amber-glow"
            >
              {SPEAKERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <span
              className={`font-mono-crt text-sm uppercase tracking-[0.3em] ${
                speakerColor[line.speaker] ?? "text-foreground"
              }`}
            >
              {line.speaker}
            </span>
          )}
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

        {editing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex flex-wrap items-center gap-1 text-[10px] font-mono-crt text-amber-glow/80">
              <span className="opacity-60">id:</span>
              <span className="rounded-sm bg-amber-glow/10 px-1">{line.id}</span>
              {line.next && (
                <>
                  <span className="opacity-60">→</span>
                  <span className="rounded-sm bg-amber-glow/10 px-1">{line.next}</span>
                </>
              )}
              {line.end && <span className="rounded-sm bg-amber-glow/10 px-1">end</span>}
              <span className="ml-auto flex gap-1">
                <button
                  type="button"
                  title="Override für diese Zeile zurücksetzen"
                  onClick={() => {
                    if (!dialogId) return;
                    clearLineFields(dialogId, line.id);
                  }}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10"
                >
                  ↶ Original
                </button>
                <button
                  type="button"
                  title="An Caret bzw. bei 1/2 splitten"
                  onClick={() => handleSplit(0.5)}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10"
                >
                  ✂ 1/2
                </button>
                <button
                  type="button"
                  title="Bei 1/3 splitten"
                  onClick={() => handleSplit(1 / 3)}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10"
                >
                  ✂ 1/3
                </button>
                <button
                  type="button"
                  title="Bei 2/3 splitten"
                  onClick={() => handleSplit(2 / 3)}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10"
                >
                  ✂ 2/3
                </button>
                <button
                  type="button"
                  title={
                    prevId
                      ? `In Vorgängerzeile ${prevId} mergen`
                      : "Kein eindeutiger Vorgänger ohne Choices"
                  }
                  disabled={!prevId}
                  onClick={handleMerge}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10 disabled:opacity-40"
                >
                  ⨯ Merge ↑
                </button>
                <button
                  type="button"
                  title="Leere Zeile danach einfügen"
                  disabled={!!(line.choices && line.choices.length > 0)}
                  onClick={handleInsertAfter}
                  className="rounded-sm border border-amber-glow/40 px-1 hover:bg-amber-glow/10 disabled:opacity-40"
                >
                  ＋ Zeile
                </button>
              </span>
            </div>
            <textarea
              key={`text:${line.id}`}
              data-dlg-edit-text
              defaultValue={line.text}
              rows={Math.max(2, Math.ceil(line.text.length / 70))}
              onBlur={(e) => {
                if (!dialogId) return;
                const v = e.currentTarget.value.trim();
                if (v !== line.text) setField(dialogId, line.id, { text: v });
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  (e.currentTarget as HTMLTextAreaElement).blur();
                }
              }}
              className="w-full resize-y rounded-sm border border-dashed border-amber-glow/40 bg-background/60 px-2 py-1 font-display text-lg leading-relaxed text-foreground outline-none focus:border-amber-glow"
            />
            <div className="mt-2 text-[10px] uppercase tracking-widest text-amber-glow/60">
              Subtext (Schmerz-Radio)
            </div>
            <textarea
              key={`sub:${line.id}`}
              defaultValue={line.subtext ?? ""}
              rows={2}
              placeholder="— kein Subtext —"
              onBlur={(e) => {
                if (!dialogId) return;
                const v = e.currentTarget.value.trim();
                if (v !== (line.subtext ?? ""))
                  setField(dialogId, line.id, { subtext: v });
              }}
              className="w-full resize-y rounded-sm border border-dashed border-amber-glow/30 bg-background/60 px-2 py-1 font-mono-crt text-base italic text-amber-glow/80 outline-none focus:border-amber-glow"
            />
          </div>
        ) : (
          <>
            <p className="font-display text-lg leading-relaxed text-foreground text-shadow-hard">
              {line.text}
            </p>
            {radioActive && line.subtext && (
              <p className="slow-fade-in mt-3 font-mono-crt text-base italic text-amber-glow amber-glow">
                ◉ {line.subtext}
              </p>
            )}
          </>
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
                {editing ? (
                  <input
                    key={`ch:${line.id}:${i}`}
                    defaultValue={choice.text}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (!dialogId) return;
                      const v = e.currentTarget.value.trim();
                      if (v !== choice.text)
                        setField(dialogId, line.id, {
                          choices: { [i]: { text: v } },
                        });
                    }}
                    className="flex-1 bg-transparent outline-none"
                  />
                ) : (
                  <span>{choice.text}</span>
                )}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                advanceDialog();
              }}
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