import { memo } from "react";
import type { Channel } from "@/game/tv/channels";

interface Props {
  channel: Channel;
  bulletinIdx: number;
  bulletin: string;
  bulletinTotal: number;
  time: string;
}

/**
 * Reines Präsentations-Layer der Mattscheibe (Header + Video + Bauchbinde
 * + Footer + Ticker). Memoisiert: rendert nur, wenn sich Channel oder
 * Bulletin ändern — das per-Sekunden-Tick (für die Uhr) führt zu einem
 * harmlosen Re-Render mit derselben Time-String-Optimierung.
 */
function TvScreenImpl({
  channel,
  bulletinIdx,
  bulletin,
  bulletinTotal,
  time,
}: Props) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[oklch(0.16_0.02_120)] scanlines">
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <div
            className={`font-mono-crt text-2xl amber-glow ${channel.accentClass}`}
          >
            {channel.name}
          </div>
          <div className="mt-1 font-display text-xs uppercase tracking-widest text-muted-foreground">
            {channel.tag}
          </div>
        </div>
        <div className="text-right font-mono-crt text-amber-glow/80">
          <div className="text-lg leading-none">{time}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Live · Sektorfunk
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-4">
        <video
          key={channel.id}
          src={channel.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-auto max-w-full object-contain"
        />
        <div
          key={`${channel.id}-${bulletinIdx}`}
          className="fade-in pointer-events-none absolute inset-x-4 bottom-3 rounded-sm border border-amber-glow/30 bg-black/80 px-4 py-2 backdrop-blur-sm"
        >
          <div
            className={`font-mono-crt text-[10px] uppercase tracking-widest ${channel.accentClass}`}
          >
            {channel.name}
          </div>
          <p className="mt-0.5 font-display text-xs leading-snug text-foreground sm:text-sm">
            {bulletin}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-amber-glow/20 px-5 py-2 font-mono-crt text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>
          Meldung {bulletinIdx + 1} / {bulletinTotal}
        </span>
        <span className="text-amber-glow/70">▌Programm läuft</span>
      </div>

      <div className="overflow-hidden border-t border-amber-glow/30 bg-black/60 py-1">
        <div className="tv-ticker whitespace-nowrap font-mono-crt text-sm text-amber-glow amber-glow">
          {channel.ticker}
          <span className="px-8">·</span>
          {channel.ticker}
        </div>
      </div>
    </div>
  );
}

export const TvScreen = memo(TvScreenImpl);
