import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { useMusic } from "@/audio/MusicPlayer";
import { useSettings } from "@/audio/SettingsContext";
import { CHANNELS } from "@/game/tv/channels";
import { useTvBulletinPlayer } from "@/game/tv/useTvBulletinPlayer";
import { TvScreen } from "./tv/TvScreen";
import { ChannelTabs } from "./tv/ChannelTabs";

/**
 * Teleempfänger — drei Kanäle in zermürbender Bürokraten-Sprache.
 * Daten in `@/game/tv/channels`, Audio-Loop in `useTvBulletinPlayer`,
 * Render aufgesplittet in `TvScreen` und `ChannelTabs`.
 */
export function Television() {
  const { tvOpen, closeTelevision } = useGame();
  const { setDuck } = useMusic();
  const { ttsEnabled } = useSettings();
  const [channelIdx, setChannelIdx] = useState(0);
  // Cursor pro Kanal — bleibt erhalten, wenn der Spieler umschaltet.
  const cursorsRef = useRef<number[]>(CHANNELS.map(() => 0));
  const [tick, setTick] = useState(0);
  const advanceLockRef = useRef(false);

  useEffect(() => {
    if (!tvOpen) {
      cursorsRef.current = CHANNELS.map(() => 0);
      setChannelIdx(0);
      setTick(0);
      setDuck(1);
    }
    return () => {
      setDuck(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvOpen]);

  const channel = CHANNELS[channelIdx];
  const bulletinIdx = cursorsRef.current[channelIdx];
  const bulletin = channel.bulletins[bulletinIdx];

  const advanceBulletin = useCallback(() => {
    if (advanceLockRef.current) return;
    advanceLockRef.current = true;
    cursorsRef.current[channelIdx] =
      (cursorsRef.current[channelIdx] + 1) % channel.bulletins.length;
    setTick((t) => t + 1);
    window.setTimeout(() => {
      advanceLockRef.current = false;
    }, 50);
  }, [channelIdx, channel.bulletins.length]);

  useTvBulletinPlayer({
    open: tvOpen,
    channel,
    bulletin,
    ttsEnabled,
    setDuck,
    onAdvance: advanceBulletin,
  });

  const time = useMemo(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  if (!tvOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 px-4 py-6">
      <div className="relative flex h-full max-h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-amber-glow/40 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CloseButton
          onClick={closeTelevision}
          label="Aus"
          className="absolute right-3 top-3 z-20"
        />

        <TvScreen
          channel={channel}
          bulletinIdx={bulletinIdx}
          bulletin={bulletin}
          bulletinTotal={channel.bulletins.length}
          time={time}
        />

        <ChannelTabs
          channels={CHANNELS}
          channelIdx={channelIdx}
          onSelect={setChannelIdx}
        />
      </div>
    </div>
  );
}
