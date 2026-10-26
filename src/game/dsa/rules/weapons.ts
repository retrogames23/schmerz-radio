/** DSA3 / Kaiser Retos Waffenkammer, uploaded 1998 scan, physical PDF pages 82–84.
 * Only tabular facts are transcribed. Duplicate category rows are merged;
 * different handedness, ammunition and throwing profiles remain distinct.
 * `at`/`pa` and `reach` are existing simplified game parameters, NOT book WV.
 * Original WV and ranges are preserved separately without inventing a conversion.
 */
export interface WeaponStats {
  id: string;
  name: string;
  tp: string;
  at: number;
  pa: number;
  hands: 1 | 2 | 4;
  reach: "kurz" | "mittel" | "lang";
  kind: "hieb" | "stich" | "schuss" | "wurf";
  sourcePage: number;
  sourceHandedness: string | null;
  category: string;
  wv: string | null;
  rangeSteps?: number;
  tpByDistance?: string;
  special?: string;
  aliasOf?: string;
}

export const WEAPONS: Record<string, WeaponStats> = {
  beil: {"id": "beil", "name": "Beil", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "6/2"},
  byakka: {"id": "byakka", "name": "Byakka", "tp": "1W+5", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "9/4"},
  kriegsbeil: {"id": "kriegsbeil", "name": "Kriegsbeil", "tp": "1W+4", "at": 0, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "8/4"},
  lindwurmschlaeger: {"id": "lindwurmschlaeger", "name": "Lindwurmschläger", "tp": "1W+4", "at": 0, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "7/5"},
  molokdeschnaja: {"id": "molokdeschnaja", "name": "Molokdeschnaja", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "7/5"},
  orknase: {"id": "orknase", "name": "Orknase (einhändig)", "tp": "1W+5", "at": -1, "pa": -2, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "8/3"},
  schneidzahn: {"id": "schneidzahn", "name": "Schneidzahn", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "5/1"},
  skraja: {"id": "skraja", "name": "Skraja", "tp": "1W+3", "at": 0, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "7/6"},
  wurfbeil: {"id": "wurfbeil", "name": "Wurfbeil", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "wurf", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "6/2"},
  zwergenskraja: {"id": "zwergenskraja", "name": "Zwergenskraja", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "7/6"},
  barbarenstreitaxt: {"id": "barbarenstreitaxt", "name": "Barbarenstreitaxt", "tp": "2W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "10/2"},
  echsische_axt: {"id": "echsische_axt", "name": "Echsische Axt", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "8/6"},
  felsspalter: {"id": "felsspalter", "name": "Felsspalter", "tp": "2W+2", "at": -1, "pa": -2, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "9/2"},
  holzfaelleraxt: {"id": "holzfaelleraxt", "name": "Holzfälleraxt", "tp": "2W", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "9/1"},
  langaxt: {"id": "langaxt", "name": "Langaxt", "tp": "2W", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "6/1"},
  orknase_zweihaendig: {"id": "orknase_zweihaendig", "name": "Orknase (zweihändig)", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "9/4"},
  pailos: {"id": "pailos", "name": "Pailos", "tp": "2W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Äxte und Beile", "wv": "5/2"},
  drachentoeter: {"id": "drachentoeter", "name": "Drachentöter", "tp": "7W", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "3/0"},
  dreschflegel: {"id": "dreschflegel", "name": "Dreschflegel", "tp": "1W+2", "at": -1, "pa": -2, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "4/2"},
  glefe: {"id": "glefe", "name": "Glefe", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "4/2"},
  hakenspiess: {"id": "hakenspiess", "name": "Hakenspieß", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "3/1"},
  hellebarde: {"id": "hellebarde", "name": "Hellebarde", "tp": "1W+4", "at": 0, "pa": -1, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "5/2"},
  kriegsflegel: {"id": "kriegsflegel", "name": "Kriegsflegel", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "5/1"},
  kriegslanze: {"id": "kriegslanze", "name": "Kriegslanze", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "1/0"},
  partisane: {"id": "partisane", "name": "Partisane", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "5/3"},
  pike: {"id": "pike", "name": "Pike", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "4/0"},
  prunkhellebarde: {"id": "prunkhellebarde", "name": "Prunkhellebarde", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "5/2"},
  sense: {"id": "sense", "name": "Sense", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "3/1"},
  sturmsense: {"id": "sturmsense", "name": "Sturmsense", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "4/2"},
  turnierlanze: {"id": "turnierlanze", "name": "Turnierlanze", "tp": "1W", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "1/0"},
  wurmspiess: {"id": "wurmspiess", "name": "Wurmspieß", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Infanteriewaffen", "wv": "5/2"},
  drachentoeter_vierhaendig: {"id": "drachentoeter_vierhaendig", "name": "Drachentöter vierhändig", "tp": "7W", "at": 0, "pa": 0, "hands": 4, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "vierhändig", "category": "Infanteriewaffen", "wv": "6/0", "special": "Gemeinsame Führung durch zwei Personen; kein einzelner Held."},
  pike_vierhaendig: {"id": "pike_vierhaendig", "name": "Pike vierhändig", "tp": "2W+5", "at": 0, "pa": 0, "hands": 4, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "vierhändig", "category": "Infanteriewaffen", "wv": "10/0", "special": "Gemeinsame Führung durch zwei Personen; kein einzelner Held."},
  morgenstern: {"id": "morgenstern", "name": "Morgenstern", "tp": "1W+5", "at": -1, "pa": -2, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Kettenwaffen", "wv": "7/2"},
  ochsenherde: {"id": "ochsenherde", "name": "Ochsenherde", "tp": "3W+3", "at": -2, "pa": -3, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Kettenwaffen", "wv": "9/0"},
  ogerschelle: {"id": "ogerschelle", "name": "Ogerschelle", "tp": "2W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Kettenwaffen", "wv": "8/1"},
  kettenstab: {"id": "kettenstab", "name": "Kettenstab", "tp": "1W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig", "category": "Kettenwaffen", "wv": "6/3"},
  basiliskenzunge: {"id": "basiliskenzunge", "name": "Basiliskenzunge", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/1"},
  basiliskenzunge_meisterlich: {"id": "basiliskenzunge_meisterlich", "name": "Basiliskenzunge, meisterlich", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/1"},
  borndorn: {"id": "borndorn", "name": "Borndorn", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/0"},
  dolch: {"id": "dolch", "name": "Dolch", "tp": "1W+1", "at": 0, "pa": -1, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/1"},
  drachenzahn: {"id": "drachenzahn", "name": "Drachenzahn", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "4/3"},
  eberfaenger: {"id": "eberfaenger", "name": "Eberfänger", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "4/2"},
  hakendolch: {"id": "hakendolch", "name": "Hakendolch", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "1/3"},
  jagdmesser: {"id": "jagdmesser", "name": "Jagdmesser", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/1"},
  jagdmesser_firnelfisches: {"id": "jagdmesser_firnelfisches", "name": "Jagdmesser, firnelfisches", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/1"},
  kurzschwert: {"id": "kurzschwert", "name": "Kurzschwert", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "5/5"},
  langdolch: {"id": "langdolch", "name": "Langdolch", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "3/4"},
  linkhand: {"id": "linkhand", "name": "Linkhand", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/5"},
  mengbilar: {"id": "mengbilar", "name": "Mengbilar", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/0"},
  messer: {"id": "messer", "name": "Messer", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "1/0"},
  ogerfaenger: {"id": "ogerfaenger", "name": "Ogerfänger", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "3/2"},
  schwerer_dolch: {"id": "schwerer_dolch", "name": "Schwerer Dolch", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "3/3"},
  vulkanglasdolch: {"id": "vulkanglasdolch", "name": "Vulkanglasdolch", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "stich", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/0"},
  wurfdolch: {"id": "wurfdolch", "name": "Wurfdolch", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "wurf", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "2/0"},
  wurfmesser: {"id": "wurfmesser", "name": "Wurfmesser", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "wurf", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Messer und Dolche", "wv": "1/0"},
  andergaster: {"id": "andergaster", "name": "Andergaster", "tp": "3W+2", "at": -2, "pa": -3, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "7/3"},
  anderthalbhand: {"id": "anderthalbhand", "name": "Bastardschwert", "tp": "1W+5", "at": 0, "pa": -1, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "8/6"},
  boronssichel: {"id": "boronssichel", "name": "Boronssichel", "tp": "2W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "8/3"},
  nachtwind_zweihaendig: {"id": "nachtwind_zweihaendig", "name": "Nachtwind (zweihändig)", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "7/7"},
  rondrakamm_aus_arivor: {"id": "rondrakamm_aus_arivor", "name": "Rondrakamm aus Arivor", "tp": "2W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "9/6"},
  rondrakamm: {"id": "rondrakamm", "name": "Rondrakamm", "tp": "2W+2", "at": 0, "pa": -1, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "9/6"},
  tuzakmesser: {"id": "tuzakmesser", "name": "Tuzakmesser", "tp": "1W+6", "at": 0, "pa": -1, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "7/7"},
  zweihaender: {"id": "zweihaender", "name": "Zweihänder", "tp": "2W+4", "at": -1, "pa": -2, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "zweihändig (Kategorie; keine eigene Händigkeitsspalte)", "category": "Zweihänder", "wv": "9/5"},
  neunschwaenzige: {"id": "neunschwaenzige", "name": "Neunschwänzige", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": null, "category": "Peitschen", "wv": "7/0"},
  peitsche: {"id": "peitsche", "name": "Peitsche", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": null, "category": "Peitschen", "wv": "8/0"},
  amazonensaebel: {"id": "amazonensaebel", "name": "Amazonensäbel", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/5"},
  arbach: {"id": "arbach", "name": "Arbach", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/7"},
  entermesser: {"id": "entermesser", "name": "Entermesser", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/5"},
  fleischerbeil: {"id": "fleischerbeil", "name": "Fleischerbeil", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "2/1"},
  haumesser: {"id": "haumesser", "name": "Haumesser", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "6/3"},
  kharkush_arbach: {"id": "kharkush_arbach", "name": "Kharkush-Arbach", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/7"},
  khunchomer: {"id": "khunchomer", "name": "Khunchomer", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/5"},
  robbentoeter: {"id": "robbentoeter", "name": "Robbentöter", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/6"},
  saebel: {"id": "saebel", "name": "Säbel", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/7"},
  schnitter: {"id": "schnitter", "name": "Schnitter", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/6"},
  schnitter_alanfanisch: {"id": "schnitter_alanfanisch", "name": "Schnitter, alanfanisch", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/6"},
  sichel: {"id": "sichel", "name": "Sichel", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "3/1"},
  sklaventod: {"id": "sklaventod", "name": "Sklaventod", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "7/6"},
  waqqif: {"id": "waqqif", "name": "Waqqif", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Scharfe Hiebwaffen", "wv": "4/2"},
  doppelkhunchomer: {"id": "doppelkhunchomer", "name": "Doppelkhunchomer", "tp": "1W+6", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Scharfe Hiebwaffen", "wv": "10/3"},
  grosser_sklaventod: {"id": "grosser_sklaventod", "name": "Großer Sklaventod", "tp": "2W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Scharfe Hiebwaffen", "wv": "9/4"},
  schnitter_zweihaendig: {"id": "schnitter_zweihaendig", "name": "Schnitter (zweihändig)", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Scharfe Hiebwaffen", "wv": "7/7"},
  schnitter_alanfanisch_zweihaendig: {"id": "schnitter_alanfanisch_zweihaendig", "name": "Schnitter, alanfanisch (zweihändig)", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Scharfe Hiebwaffen", "wv": "7/6"},
  barbarenschwert: {"id": "barbarenschwert", "name": "Barbarenschwert", "tp": "1W+5", "at": -1, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "8/6"},
  bastardschwert_einhaendig: {"id": "bastardschwert_einhaendig", "name": "Bastardschwert (einhändig)", "tp": "1W+5", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/5"},
  breitschwert: {"id": "breitschwert", "name": "Breitschwert", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/6"},
  kusliker_saebel: {"id": "kusliker_saebel", "name": "Kusliker Säbel", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/6"},
  langschwert: {"id": "langschwert", "name": "Langschwert", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/7"},
  nachtwind: {"id": "nachtwind", "name": "Nachtwind", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/7"},
  turnierschwert: {"id": "turnierschwert", "name": "Turnierschwert", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Schwerter", "wv": "7/7"},
  dschadra_vom_pferd: {"id": "dschadra_vom_pferd", "name": "Dschadra, vom Pferd", "tp": "1W+7", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Speere und Stäbe", "wv": "5/2"},
  jagdspiess_einhaendig: {"id": "jagdspiess_einhaendig", "name": "Jagdspieß (einhändig)", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Speere und Stäbe", "wv": "4/3"},
  speer: {"id": "speer", "name": "Speer", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Speere und Stäbe", "wv": "4/3"},
  dreizack: {"id": "dreizack", "name": "Dreizack", "tp": "1W+3", "at": 0, "pa": -1, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "4/4"},
  dschadra: {"id": "dschadra", "name": "Dschadra", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "4/3"},
  efferdbart: {"id": "efferdbart", "name": "Efferdbart", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "5/6"},
  holzspeer: {"id": "holzspeer", "name": "Holzspeer", "tp": "1W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "4/3"},
  jagdspiess: {"id": "jagdspiess", "name": "Jagdspieß", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "5/4"},
  jagdspiess_elfisch: {"id": "jagdspiess_elfisch", "name": "Jagdspieß, elfisch", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "5/4"},
  stab: {"id": "stab", "name": "Kampfstab", "tp": "1W+1", "at": 0, "pa": 1, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "6/6"},
  speer_zweihaendig: {"id": "speer_zweihaendig", "name": "Speer (zweihändig)", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "5/4"},
  stossspeer: {"id": "stossspeer", "name": "Stoßspeer", "tp": "2W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "5/4"},
  zweililien: {"id": "zweililien", "name": "Zweililien", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "stich", "sourcePage": 83, "sourceHandedness": "zweihändig", "category": "Speere und Stäbe", "wv": "7/7"},
  degen: {"id": "degen", "name": "Degen", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "6/6"},
  florett: {"id": "florett", "name": "Florett", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "7/5"},
  magierflorett: {"id": "magierflorett", "name": "Magierflorett", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "5/5"},
  rapier: {"id": "rapier", "name": "Rapier", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "7/6"},
  stockdegen: {"id": "stockdegen", "name": "Stockdegen", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "6/4"},
  wolfsmesser: {"id": "wolfsmesser", "name": "Wolfsmesser", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "stich", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stichwaffen", "wv": "7/6"},
  brabakbengel: {"id": "brabakbengel", "name": "Brabakbengel", "tp": "1W+5", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "7/5"},
  fackel: {"id": "fackel", "name": "Fackel", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "4/3"},
  gruufhai: {"id": "gruufhai", "name": "Gruufhai", "tp": "1W+6", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "10/3"},
  keule: {"id": "keule", "name": "Keule", "tp": "1W+2", "at": 0, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "7/3"},
  knueppel: {"id": "knueppel", "name": "Knüppel", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "5/3"},
  rabenschnabel_vom_pferd: {"id": "rabenschnabel_vom_pferd", "name": "Rabenschnabel, vom Pferd", "tp": "1W+5", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "9/3"},
  rabenschnabel: {"id": "rabenschnabel", "name": "Rabenschnabel", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "8/3"},
  rabenschnabel_rituell: {"id": "rabenschnabel_rituell", "name": "Rabenschnabel, rituell", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "8/3"},
  schmiedehammer: {"id": "schmiedehammer", "name": "Schmiedehammer", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "7/4"},
  sonnenzepter: {"id": "sonnenzepter", "name": "Sonnenzepter", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "7/5"},
  streitkolben: {"id": "streitkolben", "name": "Streitkolben", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "7/5"},
  stuhlbein: {"id": "stuhlbein", "name": "Stuhlbein", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "4/3"},
  wurfkeule: {"id": "wurfkeule", "name": "Wurfkeule", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "mittel", "kind": "wurf", "sourcePage": 83, "sourceHandedness": "einhändig", "category": "Stumpfe Hiebwaffen", "wv": "5/3"},
  kriegshammer: {"id": "kriegshammer", "name": "Kriegshammer", "tp": "2W+3", "at": 0, "pa": -2, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 84, "sourceHandedness": "zweihändig", "category": "Stumpfe Hiebwaffen", "wv": "9/3"},
  magierstab: {"id": "magierstab", "name": "Magierstab", "tp": "1W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 84, "sourceHandedness": "zweihändig", "category": "Stumpfe Hiebwaffen", "wv": "6/6"},
  spitzhacke: {"id": "spitzhacke", "name": "Spitzhacke", "tp": "1W+6", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 84, "sourceHandedness": "zweihändig", "category": "Stumpfe Hiebwaffen", "wv": "8/1"},
  vorschlaghammer: {"id": "vorschlaghammer", "name": "Vorschlaghammer", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 84, "sourceHandedness": "zweihändig", "category": "Stumpfe Hiebwaffen", "wv": "8/1"},
  zwergenschlaegel: {"id": "zwergenschlaegel", "name": "Zwergenschlägel", "tp": "1W+5", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "hieb", "sourcePage": 84, "sourceHandedness": "zweihändig", "category": "Stumpfe Hiebwaffen", "wv": "9/3"},
  bock: {"id": "bock", "name": "Bock", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "hieb", "sourcePage": 84, "sourceHandedness": null, "category": "Waffenlos", "wv": "2/5"},
  orchidee: {"id": "orchidee", "name": "Orchidee", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "hieb", "sourcePage": 84, "sourceHandedness": null, "category": "Waffenlos", "wv": "1/0"},
  panzerarm: {"id": "panzerarm", "name": "Panzerarm", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "hieb", "sourcePage": 84, "sourceHandedness": null, "category": "Waffenlos", "wv": "1/3"},
  schlagring: {"id": "schlagring", "name": "Schlagring", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "hieb", "sourcePage": 84, "sourceHandedness": null, "category": "Waffenlos", "wv": "1/0"},
  veteranenhand: {"id": "veteranenhand", "name": "Veteranenhand", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "kurz", "kind": "hieb", "sourcePage": 84, "sourceHandedness": null, "category": "Waffenlos", "wv": "1/1"},
  kurzbogen: {"id": "kurzbogen", "name": "Kurzbogen", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 60, "tpByDistance": "(+1/+1/0/0/0/-1)"},
  kompositbogen: {"id": "kompositbogen", "name": "Kompositbogen", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 80, "tpByDistance": "(+3/+2/+1/+1/0/0)"},
  kriegsbogen: {"id": "kriegsbogen", "name": "Kriegsbogen", "tp": "1W+6", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 150, "tpByDistance": "(+3/+2/+1/0/0/0/-1)"},
  langbogen: {"id": "langbogen", "name": "Langbogen", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 200, "tpByDistance": "(+3/+2/+1/0/0/0/-1)"},
  elfenbogen: {"id": "elfenbogen", "name": "Elfenbogen", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 200, "tpByDistance": "(+3/+2/+1/+1/0/0/0)"},
  orkischer_reiterbogen: {"id": "orkischer_reiterbogen", "name": "Orkischer Reiterbogen", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Bogen", "wv": null, "rangeSteps": 100, "tpByDistance": "(+3/+2/+1/0/0/-1/-2)"},
  armbrust: {"id": "armbrust", "name": "Leichte Armbrust", "tp": "2W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 60, "tpByDistance": "(+1/+1/0/0/0/-1)"},
  windenarmbrust: {"id": "windenarmbrust", "name": "Windenarmbrust", "tp": "2W+6", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 200, "tpByDistance": "(+4/+2/+1/0/-1/-2/-3)"},
  eisenwalder: {"id": "eisenwalder", "name": "Eisenwalder", "tp": "1W+3", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 40, "tpByDistance": "(0/0/0/0/-1)"},
  ballaester: {"id": "ballaester", "name": "Balläster", "tp": "1W+4", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 100, "tpByDistance": "(+3/+2/+1/0/0/-1/-1)"},
  arbalone: {"id": "arbalone", "name": "Arbalone", "tp": "3W+8", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 250, "tpByDistance": "(+4/+2/+1/0/-1/-2/-3)"},
  arbalette: {"id": "arbalette", "name": "Arbalette (Bolzen)", "tp": "2W+8", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 100, "tpByDistance": "(+4/+2/+1/0/-1/-2/-3)"},
  arbalette_kugeln: {"id": "arbalette_kugeln", "name": "Arbalette (Kugeln)", "tp": "2W+6", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 100, "tpByDistance": "(+4/+2/+1/0/-1/-2/-3)"},
  balestra: {"id": "balestra", "name": "Balestra", "tp": "2W+2", "at": 0, "pa": 0, "hands": 2, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 60, "tpByDistance": "(+4/+2/+1/0/-1/-2)"},
  balestrina: {"id": "balestrina", "name": "Balestrina", "tp": "1W+5", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Armbrust", "wv": null, "rangeSteps": 25, "tpByDistance": "(+4/+2/+1/0)"},
  blasrohr: {"id": "blasrohr", "name": "Blasrohr", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Blasrohr", "wv": null, "rangeSteps": 25, "tpByDistance": "(0/0/-1/-2)"},
  stein_flasche: {"id": "stein_flasche", "name": "Stein, Flasche", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 25, "tpByDistance": "(+1/0/-1/-2)"},
  dolch_geworfen: {"id": "dolch_geworfen", "name": "Dolch (geworfen)", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 10, "tpByDistance": "(+1/0/-1/-2)"},
  wurfbeil_geworfen: {"id": "wurfbeil_geworfen", "name": "Wurfbeil (geworfen)", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 25, "tpByDistance": "(+3/+1/0/-1)"},
  schneidzahn_geworfen: {"id": "schneidzahn_geworfen", "name": "Schneidzahn (geworfen)", "tp": "1W+4", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 25, "tpByDistance": "(+3/+2/-1/-2)"},
  speer_geworfen: {"id": "speer_geworfen", "name": "Speer (geworfen)", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 40, "tpByDistance": "(+1/0/0/-1/-3)"},
  wurfkeule_geworfen: {"id": "wurfkeule_geworfen", "name": "Wurfkeule (geworfen)", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 20, "tpByDistance": "(+3/+1/0/-1)"},
  granatapfel: {"id": "granatapfel", "name": "Granatapfel", "tp": "4W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Axt", "wv": null, "rangeSteps": 40, "tpByDistance": "–", "special": "Brandschaden; nicht frei erhältlich."},
  wurfmesser_geworfen: {"id": "wurfmesser_geworfen", "name": "Wurfmesser (geworfen)", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Messer", "wv": null, "rangeSteps": 25, "tpByDistance": "(+1/0/0/-1)"},
  wurfdolch_geworfen: {"id": "wurfdolch_geworfen", "name": "Wurfdolch (geworfen)", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Messer", "wv": null, "rangeSteps": 25, "tpByDistance": "(+1/0/0/-1)"},
  borndorn_geworfen: {"id": "borndorn_geworfen", "name": "Borndorn (geworfen)", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Messer", "wv": null, "rangeSteps": 25, "tpByDistance": "(+1/0/0/-1)"},
  wurfscheibe: {"id": "wurfscheibe", "name": "Wurfscheibe", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Messer", "wv": null, "rangeSteps": 15, "tpByDistance": "(+1/0/0)"},
  wurfscheibe_aus_stahl: {"id": "wurfscheibe_aus_stahl", "name": "Wurfscheibe aus Stahl", "tp": "1W+1", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Messer", "wv": null, "rangeSteps": 25, "tpByDistance": "(+1/0/0/-1)"},
  holzspeer_geworfen: {"id": "holzspeer_geworfen", "name": "Holzspeer (geworfen)", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Speer", "wv": null, "rangeSteps": 40, "tpByDistance": "(+1/0/-1/-1/-2)"},
  wurfspeer: {"id": "wurfspeer", "name": "Wurfspeer", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Speer", "wv": null, "rangeSteps": 40, "tpByDistance": "(+3/+1/0/0/-1)"},
  efferdbart_geworfen: {"id": "efferdbart_geworfen", "name": "Efferdbart (geworfen)", "tp": "1W+3", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Wurfwaffen: Speer", "wv": null, "rangeSteps": 25, "tpByDistance": "(+2/+1/0/0)"},
  fledermaus: {"id": "fledermaus", "name": "Fledermaus", "tp": "1W-2", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Schleuder", "wv": null, "rangeSteps": 25, "tpByDistance": "–", "special": "Fesselt das Opfer zusätzlich zum Schaden."},
  schleuder_steine: {"id": "schleuder_steine", "name": "Schleuder mit Steinen", "tp": "1W", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Schleuder", "wv": null, "rangeSteps": 40, "tpByDistance": "(-1/0/0/0/-1)"},
  schleuder: {"id": "schleuder", "name": "Schleuder mit Bleigeschossen", "tp": "1W+2", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "schuss", "sourcePage": 84, "sourceHandedness": null, "category": "Schleuder", "wv": null, "rangeSteps": 40, "tpByDistance": "(-1/0/0/0/-1)"},
  wurfnetz: {"id": "wurfnetz", "name": "Wurfnetz", "tp": "speziell", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Schleuder", "wv": null, "rangeSteps": 5, "tpByDistance": "–", "special": "Fesselt das Opfer; keine normalen Trefferpunkte. Nur erzählerisch abwickeln."},
  wurfnetz_schwer: {"id": "wurfnetz_schwer", "name": "Wurfnetz, schwer", "tp": "speziell", "at": 0, "pa": 0, "hands": 1, "reach": "lang", "kind": "wurf", "sourcePage": 84, "sourceHandedness": null, "category": "Schleuder", "wv": null, "rangeSteps": 5, "tpByDistance": "–", "special": "Fesselt das Opfer; keine normalen Trefferpunkte. Nur erzählerisch abwickeln."},
  streitaxt: {"id": "streitaxt", "name": "Streitaxt", "tp": "1W+4", "at": 0, "pa": -1, "hands": 1, "reach": "mittel", "kind": "hieb", "sourcePage": 82, "sourceHandedness": "einhändig", "category": "Äxte und Beile", "wv": "8/4", "aliasOf": "kriegsbeil"},
};

function normalizeWeaponName(name: string): string {
  return name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe")
    .replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();
}

// Every catalog name is recognized automatically. Only colloquial/legacy aliases
// live here; sort globally so generic Schwert/Armbrust never win over variants.
const ALIASES: Array<[string, string]> = [
  ["anderthalbhänder", "anderthalbhand"], ["bastardschwert", "anderthalbhand"],
  ["leichte armbrust", "armbrust"], ["armbrust", "armbrust"],
  ["arbalette", "arbalette"], ["arbalette mit kugeln", "arbalette_kugeln"],
  ["schleuder", "schleuder"], ["schleuder mit steinen", "schleuder_steine"],
  ["orknase", "orknase"], ["zweihändige orknase", "orknase_zweihaendig"],
  ["zweihändiger schnitter", "schnitter_zweihaendig"],
  ["schweres wurfnetz", "wurfnetz_schwer"],
  ["meisterliche basiliskenzunge", "basiliskenzunge_meisterlich"],
  ["firnelfisches jagdmesser", "jagdmesser_firnelfisches"],
  ["elfischer jagdspieß", "jagdspiess_elfisch"],
  ["ritueller rabenschnabel", "rabenschnabel_rituell"],
  ["orkischer reiterbogen", "orkischer_reiterbogen"],
  ["großer sklaventod", "grosser_sklaventod"],
  ["zwergenaxt", "streitaxt"], ["sichelmesser", "dolch"],
  ["flegel", "dreschflegel"], ["schwert", "langschwert"],
  ["axt", "streitaxt"], ["bogen", "kurzbogen"], ["lanze", "kriegslanze"],
];
const WEAPON_KEYWORDS: Array<[string, string]> = [
  ...Object.values(WEAPONS).map((w): [string, string] => [w.name, w.id]),
  ...ALIASES,
].map(([kw, id]): [string, string] => [normalizeWeaponName(kw), id])
  .sort((a, b) => b[0].length - a[0].length);

const NON_WEAPON_HINTS = ["scheide", "pfeil", "sehne", "wetzstein", "holster", "koecher", "griff", "klingenbruch"];

export function matchWeaponId(name: string): string | null {
  const n = normalizeWeaponName(name || "");
  if (!n || NON_WEAPON_HINTS.some((h) => n.includes(h))) return null;
  // Bolzen/Kugeln specify ammunition only when a complete crossbow is named.
  if (n.includes("bolzen") && !/arbalette|armbrust|arbalone|balestra|eisenwalder/.test(n)) return null;
  if (/^(?:\d+ )?(?:bolzen|kugeln)(?: fuer| der|$)/.test(n)) return null;
  for (const [kw, id] of WEAPON_KEYWORDS) {
    if (` ${n} `.includes(` ${kw} `)) return id;
  }
  return null;
}

/** Source facts plus explicit labels for the existing simplified combat model. */
export function weaponDetails(w: WeaponStats): string {
  return `${w.name} — TP ${w.tp}, ${w.hands}H, ${w.kind}`
    + (w.wv ? `, WV ${w.wv}` : "")
    + (w.rangeSteps !== undefined ? `, Reichweite ${w.rangeSteps} Schritt, TP/Entfernung ${w.tpByDistance}` : "")
    + `; vereinfachtes Spiel: AT ${w.at}, PA ${w.pa}, Reichweite ${w.reach}`
    + (w.special ? `; ${w.special}` : "")
    + ` (KRW, PDF-S. ${w.sourcePage}).`;
}

export function weaponsForPrompt(): string {
  return [
    "WAFFEN (DSA3 / Kaiser Retos Waffenkammer):",
    "WV ist der originale Waffenvergleichswert, NICHT ein AT/PA-Modifikator. AT/PA und kurz/mittel/lang sind vereinfachte Spielparameter. Spezialwaffen nicht als normale Schadenswaffen behandeln.",
    ...Object.values(WEAPONS).filter((w) => !w.aliasOf).map(weaponDetails),
  ].join("\n");
}
