import type { DialogTree } from "../types";
import { philippeDialogs } from "./philippe";
import { insaDialogs } from "./insa";
import { miraDialogs } from "./mira";
import { bodoDialogs } from "./bodo";
import { okwuDialogs } from "./okwu";
import { mikaelDialogs } from "./mikael";
import { helkaDialogs } from "./helka";
import { ennisDialogs } from "./ennis";
import { cafeteriaDialogs } from "./cafeteria";
import { bureaucracyDuelDialogs } from "./bureaucracyDuel";
import { vossbeckAct2Dialogs } from "./vossbeckAct2";
import { miscDialogs } from "./misc";
import { e71NerdsDialogs } from "./e71Nerds";
import { ralfDialogs } from "./ralf";
import { herbertDialogs } from "./herbert";
import { setsukoDialogs } from "./setsuko";
import { walterDialogs } from "./walter";
import { hanneDialogs } from "./hanne";
import { zentralverwaltungDialogs } from "./zentralverwaltung";
import { aushangDialogs } from "./aushaenge";
import { krollDialogs } from "./kroll";
import { mindenDialogs } from "./minden";
import { withAct2Greetings } from "./act2Greetings";
import { plazaDialogs } from "./plaza";

export const dialogs: Record<string, DialogTree> = withAct2Greetings({
  ...philippeDialogs,
  ...insaDialogs,
  ...miraDialogs,
  ...bodoDialogs,
  ...okwuDialogs,
  ...mikaelDialogs,
  ...helkaDialogs,
  ...ennisDialogs,
  ...cafeteriaDialogs,
  ...bureaucracyDuelDialogs,
  ...vossbeckAct2Dialogs,
  ...miscDialogs,
  ...e71NerdsDialogs,
  ...ralfDialogs,
  ...herbertDialogs,
  ...setsukoDialogs,
  ...walterDialogs,
  ...hanneDialogs,
  ...zentralverwaltungDialogs,
  ...aushangDialogs,
  ...krollDialogs,
  ...mindenDialogs,
  ...plazaDialogs,
});
