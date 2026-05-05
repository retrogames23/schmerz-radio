import { memo } from "react";
import type { Channel } from "@/game/tv/channels";

interface Props {
  channels: Channel[];
  channelIdx: number;
  onSelect: (idx: number) => void;
}

function ChannelTabsImpl({ channels, channelIdx, onSelect }: Props) {
  return (
    <div className="flex items-stretch gap-px bg-amber-glow/20 p-px">
      {channels.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(i)}
          className={`flex-1 px-3 py-2 text-left font-mono-crt text-xs uppercase tracking-widest transition-colors ${
            i === channelIdx
              ? "bg-amber-glow/20 text-amber-glow amber-glow"
              : "bg-black text-muted-foreground hover:bg-amber-glow/10 hover:text-amber-glow"
          }`}
          aria-pressed={i === channelIdx}
        >
          <span className="mr-2 opacity-60">K{i + 1}</span>
          {c.name}
        </button>
      ))}
    </div>
  );
}

export const ChannelTabs = memo(ChannelTabsImpl);
