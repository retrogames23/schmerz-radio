# Architecture rules

- Resolve room-specific music with `getSceneMusicPlaylist` and play it through the shared MusicPlayer; this keeps room entry, departure and player controls consistent.