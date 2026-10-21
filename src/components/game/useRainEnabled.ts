import { useEffect, useState } from "react";
import { RAIN_MEDIA_QUERY } from "@/game/rainPolicy";

/** Unmount rain rather than hiding an active animation loop. */
export function useRainEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(RAIN_MEDIA_QUERY);
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return enabled;
}