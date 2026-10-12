import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getSceneMusicPlaylist, MUSIC_PLAYLISTS } from "./MusicPlayer";
import feast from "@/assets/music/feast_of_a_brand_new_sun.mp3.asset.json";
import california from "@/assets/music/california_s_new_design.mp3.asset.json";
import sky from "@/assets/music/the_sky_has_turned_to_stone.mp3.asset.json";

describe("room music", () => {
  test("Hanne uses only the three uploaded songs in attachment order", () => {
    assert.equal(getSceneMusicPlaylist("apt1104"), "hanne");
    assert.deepEqual(MUSIC_PLAYLISTS.hanne.map((track) => track.src), [
      feast.url, california.url, sky.url,
    ]);
  });
  test("leaving Hanne restores the destination playlist", () => {
    assert.equal(getSceneMusicPlaylist("corridor11"), "default");
    assert.equal(getSceneMusicPlaylist("aptMira4601"), "mira");
    assert.equal(getSceneMusicPlaylist("cafeteriaE67"), "cafeteria");
  });
});