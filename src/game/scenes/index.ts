import type { Scene } from "../types";
import { apartmentAct1Scenes } from "./apartmentAct1";
import { sectorAct1Scenes } from "./sectorAct1";
import { elevatorE67Scenes } from "./elevatorE67";
import { konbiniE67Scenes } from "./konbiniE67";
import { konbiniE71Scenes } from "./konbiniE71";
import { corridorsE67Scenes } from "./corridorsE67";
import { communalE67Scenes } from "./communalE67";
import { commonRoomE71Scenes } from "./commonRoomE71";
import { cinemaE71Scenes } from "./cinemaE71";
import { corridor11Scenes } from "./corridor11";
import { corridor21Scenes } from "./corridor21";
import { libraryE71Scenes } from "./libraryE71";
import { apt1102Scenes } from "./apt1102";
import { apt1103Scenes } from "./apt1103";
import { apt1104Scenes } from "./apt1104";
import { kantinenverwaltung3603Scenes } from "./kantinenverwaltung3603";
import { leitstelleE67Scenes } from "./leitstelleE67";
import { kellerE67Scenes } from "./kellerE67";
import { pubScenes } from "./pub";
import { windowNicheScenes } from "./windowNiche";
import { zentralverwaltungScenes } from "./zentralverwaltung";

export const scenes: Record<string, Scene> = {
  ...apartmentAct1Scenes,
  ...sectorAct1Scenes,
  ...elevatorE67Scenes,
  ...konbiniE67Scenes,
  ...konbiniE71Scenes,
  ...corridorsE67Scenes,
  ...communalE67Scenes,
  ...commonRoomE71Scenes,
  ...cinemaE71Scenes,
  ...corridor11Scenes,
  ...corridor21Scenes,
  ...libraryE71Scenes,
  ...apt1102Scenes,
  ...apt1103Scenes,
  ...apt1104Scenes,
  ...kantinenverwaltung3603Scenes,
  ...leitstelleE67Scenes,
  ...kellerE67Scenes,
  ...pubScenes,
  ...windowNicheScenes,
  ...zentralverwaltungScenes,
};
