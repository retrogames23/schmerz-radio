import { X } from "lucide-react";

interface Props {
  onClick: () => void;
  /** "amber" (default, Story-Dialoge) oder "phosphor" (Terminal). */
  tone?: "amber" | "phosphor";
  /** Aria-Label, z. B. „Dialog schließen“. */
  label?: string;
  /** Optional: zusätzliche Tailwind-Klassen, z. B. Positionierung. */
  className?: string;
}

/**
 * Einheitlicher Schließen-Button rechts oben in jedem Overlay.
 * Klein, dezent, klar als Wegklick-Element erkennbar.
 */
export function CloseButton({
  onClick,
  tone = "amber",
  label = "Schließen",
  className = "",
}: Props) {
  const palette =
    tone === "phosphor"
      ? "border-phosphor/40 text-phosphor hover:border-phosphor hover:bg-phosphor/15 hover:text-phosphor"
      : "border-amber-glow/40 text-amber-glow/80 hover:border-amber-glow hover:bg-amber-glow/15 hover:text-amber-glow";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-sm border bg-background/70 transition ${palette} ${className}`}
    >
      <X className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );
}