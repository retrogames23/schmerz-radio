import { describe, expect, test } from "bun:test";
import { getSceneMusicPlaylist, MUSIC_PLAYLISTS } from "./MusicPlayer";
import feast from "@/assets/music/feast_of_a_brand_new_sun.mp3.asset.json";
import california from "@/assets/music/california_s_new_design.mp3.asset.json";
import sky from "@/assets/music/the_sky_has_turned_to_stone.mp3.asset.json";

describe("room music", () => {
  test("Hanne uses only the three uploaded songs in attachment order", () => {
    expect(getSceneMusicPlaylist("apt1104")).toBe("hanne");
    expect(MUSIC_PLAYLISTS.hanne.map((track) => track.src)).toEqual([
      feast.url, california.url, sky.url,
    ]);
  });
  test("leaving Hanne restores the destination playlist", () => {
    expect(getSceneMusicPlaylist("corridor11")).toBe("default");
    expect(getSceneMusicPlaylist("aptMira4601")).toBe("mira");
    expect(getSceneMusicPlaylist("cafeteriaE67")).toBe("cafeteria");
  });
});