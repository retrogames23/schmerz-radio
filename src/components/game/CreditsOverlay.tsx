import { CloseButton } from "./CloseButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Credit {
  title: string;
  creators: string;
  note?: string;
}

const inspirations: Credit[] = [
  {
    title: "Monkey Island",
    creators: "Ron Gilbert, Tim Schafer, Dave Grossman (LucasArts)",
    note: "Die gesamte Reihe, insbesondere die Teile von Ron Gilbert — Meisterwerk des Humors und der Erzählkunst im Adventure-Genre.",
  },
  {
    title: "Unavowed",
    creators: "Dave Gilbert (Wadjet Eye Games)",
    note: "Zeitgenössisches Urban-Fantasy-Adventure mit tiefer Charakterarbeit und gewichtigen Entscheidungen.",
  },
  {
    title: "Das Schwarze Auge (DSA)",
    creators: "Ursprüngliche DSA-Redaktion, Ulisses Spiele GmbH, aktuelle DSA-Redaktion",
    note: "Die dritte Regel-Edition hat den Grundstein gelegt — danke für die unvergessliche Welt Aventuriens.",
  },
  {
    title: "Nordland-Trilogie",
    creators: "DSA-Abenteuer-Reihe",
    note: "Eine der prägendsten DSA-Abenteuerreihen, die das Gefühl echter epischer Reisen eingefangen hat.",
  },
  {
    title: "Baphomets Fluch / Broken Sword",
    creators: "Charles Cecil (Revolution Software)",
    note: "Vor allem die ersten beiden Teile — zeitlose Vorbilder für handgezeichnete Ästhetik und rätselreiche Erzählung.",
  },
  {
    title: "Amiga & Commodore",
    creators: "Commodore International",
    note: "Die Plattform, die eine ganze Generation an Kreativen geprägt hat — und deren Design-Ästhetik bis heute nachhallt.",
  },
];

export function CreditsOverlay({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="fade-in relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        <CloseButton
          onClick={onClose}
          label="Schließen"
          className="absolute right-3 top-3"
        />
        <h2 className="mb-4 font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
          Inspirationen & Dank
        </h2>

        <div className="space-y-5 overflow-y-auto pr-2 font-mono-crt text-sm leading-relaxed text-foreground">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Schmerz-Radio steht auf den Schultern riesiger. Diese Projekte,
            Menschen und Gemeinschaften haben das Spiel maßgeblich inspiriert
            oder es überhaupt erst ermöglicht.
          </p>

          <div className="space-y-4">
            {inspirations.map((item) => (
              <div
                key={item.title}
                className="rounded border border-amber-glow/15 bg-background/50 p-3"
              >
                <div className="font-display text-base text-amber-glow/90">
                  {item.title}
                </div>
                <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {item.creators}
                </div>
                {item.note && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded border border-amber-glow/15 bg-background/50 p-3">
            <div className="font-display text-base text-amber-glow/90">
              Open-Source-Community
            </div>
            <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
              Alle Beteiligten weltweit
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Pauschal und von Herzen: Danke an jeden einzelnen Menschen, der
              freie Software geschrieben, gepflegt, dokumentiert oder
              weitergegeben hat. Ohne diese gewaltige gemeinsame Leistung wäre
              ein Solo-Hobbyprojekt wie Schmerz-Radio technisch unmöglich.
              Details zu den konkret verwendeten Komponenten findest du unter
              <button
                type="button"
                onClick={onClose}
                className="ml-1 text-amber-glow/80 underline-offset-4 hover:underline"
              >
                Freie-Software-Komponenten &amp; Lizenzen
              </button>
              .
            </p>
          </div>

          <p className="text-xs italic leading-relaxed text-muted-foreground">
            Alle genannten Marken und Werke gehören ihren jeweiligen
            Rechteinhabern. Schmerz-Radio ist ein unabhängiges Fan-Projekt und
            steht in keiner offiziellen Verbindung zu den genannten
            Rechteinhabern.
          </p>
        </div>
      </div>
    </div>
  );
}
