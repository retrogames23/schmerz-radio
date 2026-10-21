/** Touch devices stay excluded even in landscape or a wide virtual stage. */
export const RAIN_MEDIA_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function canAnimateRain(width: number, hasHover: boolean, finePointer: boolean, reducedMotion: boolean) {
  return width >= 768 && hasHover && finePointer && !reducedMotion;
}