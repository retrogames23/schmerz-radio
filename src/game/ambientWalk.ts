/** One traversal per mounted scene visit; ordinary re-renders never restart it. */
export const PLAZA_WALK = {
  delayMs: 2500,
  durationMs: 30000,
  cycleMs: 960,
  frames: 8,
  height: 0.19,
  baseline: 0.65,
  cellWidth: 160,
  cellHeight: 304,
} as const;

export function createWalkVisit() {
  let startedAt: number | undefined;
  let finished = false;
  return {
    sample(now: number) {
      if (finished) return null;
      startedAt ??= now;
      const elapsed = now - startedAt - PLAZA_WALK.delayMs;
      if (elapsed < 0) return null;
      if (elapsed >= PLAZA_WALK.durationMs) {
        finished = true;
        return null;
      }
      return {
        progress: elapsed / PLAZA_WALK.durationMs,
        frame: Math.floor(elapsed / (PLAZA_WALK.cycleMs / PLAZA_WALK.frames)) % PLAZA_WALK.frames,
      };
    },
    get finished() { return finished; },
  };
}