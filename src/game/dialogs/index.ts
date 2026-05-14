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
import { vossbeckAct2Dialogs } from "./vossbeckAct2";
import { miscDialogs } from "./misc";
import { e71NerdsDialogs } from "./e71Nerds";

export const dialogs: Record<string, DialogTree> = {
  ...philippeDialogs,
  ...insaDialogs,
  ...miraDialogs,
  ...bodoDialogs,
  ...okwuDialogs,
  ...mikaelDialogs,
  ...helkaDialogs,
  ...ennisDialogs,
  ...cafeteriaDialogs,
  ...vossbeckAct2Dialogs,
  ...miscDialogs,
  ...e71NerdsDialogs,
};
