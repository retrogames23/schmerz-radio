/** Scene-local clock, never stored in story flags or saves. */
export const PLAZA_WALK = {
  delayMs: 2500, minIntervalMs: 60000, maxIntervalMs: 240000,
  cellWidth: 160, cellHeight: 304, baseline: 0.65,
} as const;

export const PLAZA_CHARACTERS = [
  { id: "walker", label: "Mann mit Aktentasche", frames: 8, durationMs: 30000, cycleMs: 960, height: 0.19 },
  { id: "beamtin", label: "Frau mit Aktenmappe", frames: 9, durationMs: 27000, cycleMs: 860, height: 0.18 },
  { id: "bote", label: "Bote mit Schultertasche", frames: 8, durationMs: 21000, cycleMs: 720, height: 0.19 },
  { id: "handwerker", label: "Handwerker mit Werkzeugkasten", frames: 9, durationMs: 34000, cycleMs: 1080, height: 0.19 },
  { id: "rentner", label: "Älterer Mann mit Stock", frames: 8, durationMs: 48000, cycleMs: 1500, height: 0.18 },
  { id: "schirmfrau", label: "Frau mit Regenschirm", frames: 8, durationMs: 29000, cycleMs: 920, height: 0.23 },
] as const;
export type PlazaCharacter = typeof PLAZA_CHARACTERS[number];

export function createWalkVisit(random: () => number = Math.random) {
  const order: PlazaCharacter[] = [...PLAZA_CHARACTERS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = order[i], b = order[j];
    if (a && b) { order[i] = b; order[j] = a; }
  }
  const schedule = order.map((character, index) => ({
    character,
    intervalMs: index === 0 ? PLAZA_WALK.delayMs :
      PLAZA_WALK.minIntervalMs + random() * (PLAZA_WALK.maxIntervalMs - PLAZA_WALK.minIntervalMs),
  }));
  let lastNow: number | undefined;
  let elapsed = 0;
  let index = 0;
  let entrance = PLAZA_WALK.delayMs as number;
  return {
    schedule,
    sample(now: number, paused = false) {
      if (lastNow !== undefined && !paused) elapsed += Math.max(0, now - lastNow);
      lastNow = now;
      while (index < schedule.length) {
        const entry = schedule[index];
        if (!entry || elapsed < entrance) return null;
        const local = elapsed - entrance;
        if (local < entry.character.durationMs) return {
          character: entry.character,
          progress: local / entry.character.durationMs,
          frame: paused ? 2 : Math.floor(local / (entry.character.cycleMs / entry.character.frames)) % entry.character.frames,
        };
        index++;
        entrance += schedule[index]?.intervalMs ?? 0;
      }
      return null;
    },
    get finished() { return index >= schedule.length; },
  };
}