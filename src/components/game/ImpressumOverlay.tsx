import { CloseButton } from "./CloseButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImpressumOverlay({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 px-4">
      <div className="fade-in relative w-full max-w-lg rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        <CloseButton
          onClick={onClose}
          label="Schließen"
          className="absolute right-3 top-3"
        />
        <h2 className="mb-5 font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
          Impressum
        </h2>
        <div className="space-y-4 font-mono-crt text-sm leading-relaxed text-foreground">
          <div>
            <div>Stephan Dörner</div>
            <div>Bornholmer Str. 89</div>
            <div>10439 Berlin</div>
          </div>
          <div>
            <span className="text-muted-foreground">Kontakt: </span>
            <a
              href="mailto:stephan.doerner@posteo.de"
              className="text-amber-glow underline-offset-4 hover:underline amber-glow"
            >
              stephan.doerner@posteo.de
            </a>
          </div>
          <p className="text-xs italic leading-relaxed text-muted-foreground">
            Dies ist ein privates Hobbyprojekt, das ich in meiner Freizeit
            entwickle. Um die Kosten der Entwicklung mit{" "}
            <a
              href="https://lovable.dev/invite/LN0I260"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-glow/80 underline-offset-4 hover:underline"
            >
              lovable.dev
            </a>{" "}
            und der Cloud-AI-Chats zu finanzieren, nehme ich gerne Spenden
            entgegen.
          </p>
        </div>
      </div>
    </div>
  );
}