# Architecture rules

- Ambient walkers use real sprite-sheet frames and a scene-mounted shuffled finite timeline in image coordinates; pause the local clock for conversations, mobile focus sheets and hidden tabs, and use existing Hotspot controls plus registered optional dialog trees. Moving NPCs opt into direct touch interaction to avoid history-backed focus sheets interrupting conversations. Never use story flags or opacity fades, so re-renders preserve a visit and leaving resets it.
- Generated walk-cycle sheets must be post-processed before use: drop duplicate loop-closure frames and incomplete repeated strides; keep a complete contact/support/passing sequence for both legs, isolate each connected figure and align its stable torso rather than swinging props. Use the actual retained frame count, match cycleMs to sprite height and crossing duration, and freeze the current frame during pauses rather than substituting another pose.
- Plaza foreground occlusion uses traced alpha contours at the background's native resolution; outdoor rain shares its local image box, renders above scenery without intercepting input, and uses elapsed time rather than frame counts.

- Keep title rain artwork and mask in the same cover/center layout box; size the canvas backing buffer from local layout dimensions without setting inline CSS dimensions, so resizing and transformed stages retain alignment.
- Gate all animated rain with the shared device media policy and unmount excluded effects; CSS hiding alone leaves canvas animation loops running.

- Position ambient speech bubbles in image coordinates and clamp their measured bounds to the visible stage crop; animation must not apply a second horizontal offset, so tails remain attached to speakers across screen sizes.

- Preserve the game React context identity through Vite hot data during development refreshes; mounted providers and refreshed consumers must share the same context without resetting the game.

- Resolve room-specific music with `getSceneMusicPlaylist` and play it through the shared MusicPlayer; this keeps room entry, departure and player controls consistent.- The administration is indifferent, not malicious: it never evicts, seals or punishes residents for their private actions (e.g. Mira stays in 4601 in every state); Mira's end state only shapes her personal attitude toward the protagonist.
- DSA combat spells resolve only through `castCombatSpell` in `combat.ts`, with values from `rules/spells.ts` (`combat` field marks in-combat spells); talent and spell probes share `rules/probe.ts`, and class gear limits live in `gearRestriction` — one source of rules keeps master prompt, combat and character sheet consistent.
- DSA master prompt helpers (authors-note depth injection, `[NSC: Name | Haltung]` tracker stored in `character_snapshot.npcStates`, scene-change auto-RAG) live in `src/game/dsa/masterDirectives.ts`; keeping them pure keeps the cached system prompt stable and testable.
- DSA money lives in `src/game/dsa/money.ts` (coins as gear items, Kreuzer base, `[GELD]` markers; group markers carry the hero name) — one source keeps solo, group and prompts consistent.
