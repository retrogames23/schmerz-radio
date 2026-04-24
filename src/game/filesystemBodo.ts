/**
 * Bodos Filesystem — eigenständiger Baum, getrennt von Worags.
 *
 * /home enthält NUR /home/bodo. Worags Home liegt nicht hier; auf Worags
 * Daten kommt man von Bodos Konsole nur via `telnet worag.e67`. Das
 * /etc-Verzeichnis ist bewusst dupliziert: Bodos Hausmeister-Konsole
 * läuft vor dem `sysupdate` auf altem CentralOS v2.0, das Banner und
 * /etc/motd unterscheiden sich von Worags Maschine.
 */

export interface FsFile {
  type: "file";
  name: string;
  kind?: "text" | "log" | "image" | "news" | "mail" | "audio" | "config";
  size?: number;
  date?: string;
  /** Optional StoryFlag required to reveal this file. */
  requires?: string;
  content: string[];
}

export interface FsDir {
  type: "dir";
  name: string;
  desc?: string;
  children: FsNode[];
}

export type FsNode = FsFile | FsDir;

export const HOME_PATH_BODO: string[] = ["home", "bodo"];

const HOME_BODO: FsDir = {
  type: "dir",
  name: "bodo",
  desc: "Persönliches Verzeichnis — Marschke, B.",
  children: [
    {
      type: "file",
      name: "lotti.txt",
      kind: "text",
      size: 480,
      date: "—",
      content: [
        "── notiz an mich, weil ich vergesse ─────────",
        "",
        "wenn du heute morgen wieder nicht weißt, warum",
        "du aufgestanden bist:",
        "",
        "          LOTTI.",
        "",
        "vierzehn jahre, grau-getigert, frisst nur B3.",
        "schläft auf dem sessel mit der decke.",
        "wenn der napf leer ist, wird sie laut. das ist",
        "die einzige stelle in dieser wohnung, an der",
        "noch jemand laut wird.",
      ],
    },
    {
      type: "file",
      name: "b3_bestand.txt",
      kind: "text",
      size: 360,
      date: "06.11.1997",
      content: [
        "── B3-vorrat, stand 06.11. ───────────────────",
        "",
        "  rind-äquivalent     2 dosen   (knapp)",
        "  fisch-äquivalent    0 dosen   (aus)",
        "  trockenfutter       1/4 packung",
        "",
        "anmerkung: nächste lieferung erst freitag.",
        "wenn ich nicht heute noch los, wird sie laut.",
        "und wenn lotti laut wird, wird der korridor laut.",
      ],
    },
    {
      type: "file",
      name: "stadtwerke_alt.txt",
      kind: "text",
      size: 540,
      date: "1991",
      content: [
        "── persönlicher auszug, mitgenommen 1991 ─────",
        "",
        "trägersignal 104,6 MHz — manuell nachregeln,",
        "alle 90 sekunden, schicht: 1 person.",
        "",
        "ich war diese person, von 1986 bis 1991.",
        "ich hab nie jemandem davon erzählt.",
        "vielleicht habe ich gerade jetzt jemandem",
        "davon erzählt. ich weiß nicht mehr genau,",
        "wer heute hier war.",
      ],
    },
    {
      type: "file",
      name: "todo.txt",
      kind: "text",
      size: 220,
      date: "—",
      content: [
        "  [ ] B3 nachholen (rind + fisch)",
        "  [ ] kratzbaum reparieren",
        "  [ ] decke waschen — oder nicht. lotti riecht",
        "      sich selbst gern.",
        "  [ ] das system irgendwann mal aktualisieren.",
        "      vielleicht. v2.0 läuft seit jahren stabil.",
      ],
    },
    {
      type: "file",
      name: ".alt_brief.txt",
      kind: "text",
      size: 420,
      date: "—",
      content: [
        "── nie abgeschickt ───────────────────────────",
        "",
        "liebe e.,",
        "",
        "es ist jetzt zwölf jahre her. ich glaube,",
        "ich erkenne deine handschrift nicht mehr,",
        "wenn sie käme. aber ich erkenne, dass keine",
        "kommt. das ist auch eine art handschrift.",
        "",
        "die katze ist gut. sie schläft viel.",
        "ich auch.",
        "",
        "                                          — b.",
      ],
    },
  ],
};

const SYSTEM_DIR_BODO: FsDir = {
  type: "dir",
  name: "system",
  desc: "Konfigurationsdateien. Hausmeister-Konsole.",
  children: [
    {
      type: "file",
      name: "wartung.cfg",
      kind: "config",
      size: 220,
      date: "—",
      content: [
        "# wartung.cfg — Hausmeister-Profil 2/E67",
        "user        = bodo",
        "gid         = hausmeister",
        "block       = 26",
        "schicht     = halbtags (de facto: durchgehend)",
        "pager       = 4711",
      ],
    },
    {
      type: "file",
      name: "anleitungen_alt.txt",
      kind: "text",
      size: 410,
      date: "1991",
      content: [
        "── notiz für mich, falls ich's vergesse ──────",
        "",
        "trägersignal 104,6: nicht anfassen.",
        "aufzug E67/2:        bei sperrung 4711 prüfen.",
        "lüftung 5:           grenzwert ist NICHT alarm.",
        "",
        "wer mehr will, soll bei der zentral-it fragen.",
        "ich bin nur der hausmeister.",
      ],
    },
  ],
};

/** Unix-like root für Bodos Hausmeister-Maschine. */
export const FILESYSTEM_BODO: FsDir = {
  type: "dir",
  name: "",
  desc: "CentralOS Wurzelverzeichnis (Hausmeister)",
  children: [
    SYSTEM_DIR_BODO,
    {
      type: "dir",
      name: "home",
      desc: "Benutzerverzeichnisse.",
      children: [HOME_BODO],
    },
    {
      type: "dir",
      name: "etc",
      desc: "Systemkonfiguration.",
      children: [
        {
          type: "file",
          name: "hosts",
          kind: "config",
          size: 180,
          date: "—",
          content: [
            "# /etc/hosts — CentralOS",
            "127.0.0.1    localhost",
            "10.67.0.1    gateway.e67",
            "10.67.0.2    leitstelle.e67   # 001",
            "10.67.26.10  helka.e67        # 2610",
            "10.67.26.11  worag.e67        # 2611",
            "10.67.26.13  philippe.e67     # 2613",
            "10.67.26.14  ennis.e67        # 2614",
            "10.71.0.1    gateway.e71",
            "10.71.15.34  sprechzimmer.e71",
          ],
        },
        {
          type: "file",
          name: "passwd",
          kind: "config",
          size: 200,
          date: "—",
          content: [
            "# /etc/passwd — Auszug",
            "root:x:0:0:CentralOS:/root:/bin/sh",
            "bodo:x:2612:200:Marschke, B.:/home/bodo:/bin/sh",
            "leitstelle:x:1:1:Leitstelle 001:/var/leitstelle:/bin/false",
          ],
        },
        {
          type: "file",
          name: "motd",
          kind: "text",
          size: 240,
          date: "—",
          content: [
            "── CentralOS v2.0 ─────────────────────────────",
            "Hausmeister-Konsole 2/E67.",
            "Frequenz 104,6: NICHT anfassen.",
            "Bei Wartungs-Alarmen siehe »maint list«.",
            "Stadtwerke. Schicht: halbtags.",
          ],
        },
        {
          type: "file",
          name: "sektor.conf",
          kind: "config",
          size: 300,
          date: "—",
          content: [
            "# /etc/sektor.conf",
            "sektor        = E67",
            "korridor      = 26",
            "gateway       = E67/E71",
            "frequency     = 104.600 MHz",
            "quiet_hours   = none",
          ],
        },
        {
          type: "file",
          name: "fstab",
          kind: "config",
          size: 260,
          date: "—",
          content: [
            "# /etc/fstab — CentralOS",
            "# device           mount         type     opts",
            "/dev/sda1          /             ext2     ro,sync",
            "/dev/sda2          /home         ext2     rw",
            "/dev/carrier0      /var/carrier  pcmstrm  ro",
            "tmpfs              /tmp          tmpfs    rw,size=4M",
          ],
        },
        {
          type: "file",
          name: "resolv.conf",
          kind: "config",
          size: 120,
          date: "—",
          content: [
            "# /etc/resolv.conf",
            "nameserver  10.67.0.1",
            "nameserver  10.0.0.1",
            "search      e67.zentrale",
          ],
        },
        {
          type: "file",
          name: "issue",
          kind: "text",
          size: 90,
          date: "—",
          content: [
            "CentralOS v2.0 — Hausmeister-Konsole E67",
            "Login: \\u   TTY: \\l",
          ],
        },
        {
          type: "file",
          name: "shadow",
          kind: "config",
          size: 140,
          date: "—",
          content: [
            "── /etc/shadow ────────────────────────────────",
            "cat: shadow: Zugriff verweigert.",
          ],
        },
        {
          type: "file",
          name: "cron.tab",
          kind: "config",
          size: 220,
          date: "—",
          content: [
            "# /etc/cron.tab",
            "# m  h  dom mon dow  cmd",
            "0   *  *   *   *    /usr/bin/carrier-daemon --keepalive",
            "0   3  *   *   *    /usr/bin/centralos --rotate-logs",
            "*/15 *  *  *   *    /usr/bin/maint --pull",
          ],
        },
      ],
    },
    {
      type: "dir",
      name: "var",
      desc: "Variable Daten, Logs.",
      children: [
        {
          type: "dir",
          name: "log",
          desc: "Systemlogs.",
          children: [
            {
              type: "file",
              name: "maint.log",
              kind: "log",
              size: 540,
              date: "06.11.1997",
              content: [
                "── maint.log ──────────────────────────────────",
                "1997-11-06 09:42:00  Aufzug E67/2  GESPERRT (4711)",
                "1997-11-06 08:12:00  gateway E67/E71  ERROR 4567",
                "1997-11-04 12:08:00  Lüftung 5     grenzwertig",
                "1997-11-02 06:30:00  Routine      Tech-Knoten 5/6",
                "── Ende ───────────────────────────────────────",
              ],
            },
            {
              type: "file",
              name: "auth.log",
              kind: "log",
              size: 380,
              date: "06.11.1997",
              content: [
                "── auth.log ───────────────────────────────────",
                "1997-11-06 06:14:00  login bodo         OK (lokal)",
                "1997-11-06 07:02:00  sudo  bodo         OK (maint)",
                "── Ende ───────────────────────────────────────",
              ],
            },
            {
              type: "file",
              name: "kern.log",
              kind: "log",
              size: 540,
              date: "06.11.1997",
              content: [
                "── kern.log ───────────────────────────────────",
                "kernel: CentralOS 2.0 boot OK",
                "kernel: carrier0 attached at 104.600 MHz",
                "kernel: WARN /dev/null write throttled",
                "── Ende ───────────────────────────────────────",
              ],
            },
            {
              type: "file",
              name: "dmesg",
              kind: "log",
              size: 380,
              date: "—",
              content: [
                "[    0.00] CentralOS v2.0 starting",
                "[    0.12] cpu0: 33 MHz (synthetisch)",
                "[    0.40] mem: 4096 KB",
                "[    1.10] carrier0: lock 104.600 MHz",
              ],
            },
          ],
        },
        {
          type: "dir",
          name: "mail",
          desc: "Postfächer.",
          children: [
            {
              type: "file",
              name: "bodo",
              kind: "mail",
              size: 80,
              date: "—",
              content: [
                "Mailbox-Verweis — siehe 'inbox' im Terminal.",
              ],
            },
          ],
        },
        {
          type: "dir",
          name: "spool",
          desc: "Spool-Verzeichnis.",
          children: [
            {
              type: "file",
              name: "cron.last",
              kind: "text",
              size: 80,
              date: "—",
              content: [
                "carrier-daemon  OK   06.11.1997 09:00",
                "maint           OK   06.11.1997 09:15",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "dir",
      name: "usr",
      desc: "Installierte Programme.",
      children: [
        {
          type: "dir",
          name: "bin",
          desc: "Ausführbare Dateien.",
          children: [
            {
              type: "file",
              name: "centralos",
              kind: "config",
              size: 65536,
              date: "—",
              content: ["[binary — 65536 Bytes]"],
            },
            {
              type: "file",
              name: "maint",
              kind: "config",
              size: 12288,
              date: "—",
              content: [
                "[binary — 12288 Bytes]",
                "Hausmeister-Werkzeug. Befehl: maint list / maint cancel <id>.",
              ],
            },
            {
              type: "file",
              name: "lotti",
              kind: "config",
              size: 4096,
              date: "—",
              content: [
                "[binary — 4096 Bytes]",
                "Privat. Fütterungskalender. Tippe: lotti",
              ],
            },
          ],
        },
        {
          type: "dir",
          name: "share",
          desc: "Gemeinsam genutzte Daten.",
          children: [
            {
              type: "file",
              name: "README",
              kind: "text",
              size: 200,
              date: "—",
              content: [
                "CentralOS v2.0 — Hausmeister-Konsole.",
                "Wartungswerkzeug: maint. Privat: lotti.",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "dir",
      name: "bin",
      desc: "Grundlegende Befehle.",
      children: [
        { type: "file", name: "sh",   kind: "config", size: 8192, date: "—", content: ["[binary]"] },
        { type: "file", name: "ls",   kind: "config", size: 2048, date: "—", content: ["[binary]"] },
        { type: "file", name: "cat",  kind: "config", size: 1920, date: "—", content: ["[binary]"] },
        { type: "file", name: "cd",   kind: "config", size: 1024, date: "—", content: ["[builtin]"] },
        { type: "file", name: "pwd",  kind: "config", size: 1024, date: "—", content: ["[binary]"] },
        { type: "file", name: "tree", kind: "config", size: 3840, date: "—", content: ["[binary]"] },
        { type: "file", name: "echo", kind: "config", size: 720,  date: "—", content: ["[binary]"] },
      ],
    },
    {
      type: "dir",
      name: "tmp",
      desc: "Flüchtige Daten.",
      children: [
        {
          type: "file",
          name: "scratch.txt",
          kind: "text",
          size: 180,
          date: "—",
          content: [
            "[notiz, vermutlich von gestern]",
            "- B3 nachholen",
            "- aufzug 4711 prüfen",
            "- lüftung 5 ggf. drücken",
          ],
        },
      ],
    },
    {
      type: "dir",
      name: "dev",
      desc: "Geräte.",
      children: [
        { type: "file", name: "null",     kind: "config", size: 0, date: "—", content: [""] },
        { type: "file", name: "carrier0", kind: "config", size: 0, date: "—", content: ["[device — Trägersignal 104.600 MHz, read-only]"] },
        { type: "file", name: "tty0",     kind: "config", size: 0, date: "—", content: ["[device — Terminal]"] },
      ],
    },
  ],
};

/** Resolve a path array (e.g. ['home','bodo']) starting from root. */
export function resolveBodo(parts: string[]): FsNode | null {
  let node: FsNode = FILESYSTEM_BODO;
  for (const p of parts) {
    if (node.type !== "dir") return null;
    const child: FsNode | undefined = node.children.find((c) => c.name === p);
    if (!child) return null;
    node = child;
  }
  return node;
}

export function pathStringBodo(parts: string[]): string {
  return "/" + parts.join("/");
}
