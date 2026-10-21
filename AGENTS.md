# Architecture rules

- Ambient walkers use real sprite-sheet frames and a scene-mounted shuffled finite timeline in image coordinates; pause the local clock for conversations, mobile focus sheets and hidden tabs, and use existing Hotspot controls plus registered optional dialog trees. Never use story flags or opacity fades, so re-renders preserve a visit and leaving resets it.

- Keep title rain artwork and mask in the same cover/center layout box; size the canvas backing buffer from local layout dimensions without setting inline CSS dimensions, so resizing and transformed stages retain alignment.

- Position ambient speech bubbles in image coordinates and clamp their measured bounds to the visible stage crop; animation must not apply a second horizontal offset, so tails remain attached to speakers across screen sizes.

- Preserve the game React context identity through Vite hot data during development refreshes; mounted providers and refreshed consumers must share the same context without resetting the game.

- Resolve room-specific music with `getSceneMusicPlaylist` and play it through the shared MusicPlayer; this keeps room entry, departure and player controls consistent.- The administration is indifferent, not malicious: it never evicts, seals or punishes residents for their private actions (e.g. Mira stays in 4601 in every state); Mira's end state only shapes her personal attitude toward the protagonist.
