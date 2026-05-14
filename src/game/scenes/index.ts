import type { Scene } from "../types";
import { apartmentAct1Scenes } from "./apartmentAct1";
import { sectorAct1Scenes } from "./sectorAct1";
import { elevatorE67Scenes } from "./elevatorE67";
import { corridorsE67Scenes } from "./corridorsE67";
import { communalE67Scenes } from "./communalE67";
import { commonRoomE71Scenes } from "./commonRoomE71";
import { kantinenverwaltung3603Scenes } from "./kantinenverwaltung3603";
import { leitstelleE67Scenes } from "./leitstelleE67";
import { pubScenes } from "./pub";

export const scenes: Record<string, Scene> = {
  ...apartmentAct1Scenes,
  ...sectorAct1Scenes,
  ...elevatorE67Scenes,
  ...corridorsE67Scenes,
  ...communalE67Scenes,
  ...commonRoomE71Scenes,
  ...kantinenverwaltung3603Scenes,
  ...leitstelleE67Scenes,
  ...pubScenes,
};
