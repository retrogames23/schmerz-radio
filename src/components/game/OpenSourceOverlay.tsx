import { CloseButton } from "./CloseButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Component {
  name: string;
  license: string;
  url: string;
  note?: string;
}

const components: Component[] = [
  { name: "React", license: "MIT", url: "https://github.com/facebook/react" },
  { name: "React DOM", license: "MIT", url: "https://github.com/facebook/react" },
  { name: "TanStack Router", license: "MIT", url: "https://github.com/TanStack/router" },
  { name: "TanStack Start", license: "MIT", url: "https://github.com/TanStack/router" },
  { name: "Vite", license: "MIT", url: "https://github.com/vitejs/vite" },
  { name: "Tailwind CSS", license: "MIT", url: "https://github.com/tailwindlabs/tailwindcss" },
  { name: "tw-animate-css", license: "MIT", url: "https://github.com/Wombosvideo/tw-animate-css" },
  { name: "Lucide Icons", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
  { name: "shadcn/ui (Komponenten-Vorlagen)", license: "MIT", url: "https://github.com/shadcn-ui/ui" },
  { name: "Radix UI Primitives", license: "MIT", url: "https://github.com/radix-ui/primitives" },
  { name: "class-variance-authority", license: "Apache-2.0", url: "https://github.com/joe-bell/cva" },
  { name: "clsx", license: "MIT", url: "https://github.com/lukeed/clsx" },
  { name: "tailwind-merge", license: "MIT", url: "https://github.com/dcastil/tailwind-merge" },
  { name: "@mlc-ai/web-llm", license: "Apache-2.0", url: "https://github.com/mlc-ai/web-llm", note: "Lokales LLM für Free-Mode-Dialoge" },
  { name: "@supabase/supabase-js", license: "MIT", url: "https://github.com/supabase/supabase-js" },
  { name: "Cloudflare Workers Runtime", license: "Apache-2.0 / MIT", url: "https://github.com/cloudflare/workers-sdk" },
  { name: "Framer Motion", license: "MIT", url: "https://github.com/motiondivision/motion", note: "Animationen & Cutscene-Choreografie" },
];

const fonts: Component[] = [
  {
    name: "Special Elite",
    license: "SIL Open Font License 1.1",
    url: "https://fonts.google.com/specimen/Special+Elite",
    note: "Display- & Body-Schrift, von Astigmatic",
  },
  {
    name: "VT323",
    license: "SIL Open Font License 1.1",
    url: "https://fonts.google.com/specimen/VT323",
    note: "CRT-/Terminal-Schrift, von Peter Hull",
  },
];

export function OpenSourceOverlay({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="fade-in relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col">
        <CloseButton
          onClick={onClose}
          label="Schließen"
          className="absolute right-3 top-3"
        />
        <h2 className="mb-4 font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
          Freie-Software-Komponenten
        </h2>

        <div className="overflow-y-auto pr-2 font-mono-crt text-sm leading-relaxed text-foreground space-y-5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Schmerz-Radio ist ein freies Hobbyprojekt und nutzt zahlreiche
            Open-Source-Komponenten. Der Sourcecode des Spiels selbst steht
            unter der MIT-Lizenz und ist auf GitHub einsehbar.
          </p>

          <div>
            <div className="text-amber-glow uppercase tracking-[0.2em] text-xs mb-1">
              Sourcecode dieses Spiels
            </div>
            <a
              href="https://github.com/retrogames23/adventure-whisper-quest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-glow underline-offset-4 hover:underline amber-glow break-all"
            >
              github.com/retrogames23/adventure-whisper-quest
            </a>
            <div className="text-xs text-muted-foreground mt-1">
              Lizenz: MIT
            </div>
          </div>

          <div>
            <div className="text-amber-glow uppercase tracking-[0.2em] text-xs mb-2">
              Verwendete Open-Source-Komponenten
            </div>
            <ul className="space-y-2">
              {components.map((c) => (
                <li key={c.name} className="border-l-2 border-amber-glow/30 pl-3">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({c.license})
                    </span>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-glow/80 underline-offset-4 hover:underline break-all"
                  >
                    {c.url}
                  </a>
                  {c.note && (
                    <div className="text-xs italic text-muted-foreground">
                      {c.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-amber-glow uppercase tracking-[0.2em] text-xs mb-2">
              Verwendete Schriftarten
            </div>
            <ul className="space-y-2">
              {fonts.map((c) => (
                <li key={c.name} className="border-l-2 border-amber-glow/30 pl-3">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({c.license})
                    </span>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-glow/80 underline-offset-4 hover:underline break-all"
                  >
                    {c.url}
                  </a>
                  {c.note && (
                    <div className="text-xs italic text-muted-foreground">
                      {c.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs italic leading-relaxed text-muted-foreground">
            Spielmusik, Bilder, Texte und Story-Inhalte sind eigenständige
            Werke und nicht Teil der MIT-Lizenz des Quellcodes — sie
            unterliegen ihren jeweiligen eigenen Lizenzbedingungen.
          </p>
        </div>
      </div>
    </div>
  );
}
