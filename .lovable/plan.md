## DSA-Mood-Music umgesetzt

- 16 Mood-Tracks in `src/assets/music/dsa/` (16 Slots inkl. `joyful` = ausgelassen_froehlich)
- Manifest `src/audio/dsaMusic.ts` (DSA_MOODS + DSA_MOOD_TRACKS + pickMoodTrack)
- MusicPlayer: `setMoodPool(mood|null)`, `setMood(mood)` — wechselt erst beim Trackende
- LLM-Marker `[MOOD: <id>]` (Parser + System-Prompt)
- DsaLlmAdventureScene aktiviert Pool mit `intro`, GameShell-Bridge gibt Override bei offener Tafelrunde frei