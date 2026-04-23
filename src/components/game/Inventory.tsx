import { useGame } from "@/game/GameContext";

export function Inventory() {
  const { inventory, api } = useGame();

  return (
    <aside className="border-t border-border bg-background/95 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-start gap-3">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Inventar
        </div>
        <div className="flex flex-wrap gap-2">
          {inventory.length === 0 && (
            <span className="text-xs italic text-muted-foreground/70">
              — leer —
            </span>
          )}
          {inventory.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => api.showText([item.name, item.description])}
              className="rounded-sm border border-border bg-secondary px-2 py-1 text-xs text-secondary-foreground transition hover:border-amber-glow/60 hover:text-amber-glow"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}