## Ziel

Jedes Terminal im Spiel — Layards (Worag), Bodos und das Wartungsterminal im Serverraum (Node 5610) — wird zu einem **eigenständigen Modul**. Änderungen an einem Terminal haben **keine Auswirkung** auf die anderen. Auch zukünftige Terminals folgen demselben Muster.

Cross-Access auf Home-Verzeichnisse anderer Terminals geht **nur über `telnet` mit Passwort**.

---

## Neue Datei-/Modulstruktur

```text
src/components/game/terminal/
  shared.tsx           — UI-Primitives (Line-Renderer, CRT-Frame, CloseButton-Wrapper)
                          + reine Helfer (commonPrefix, formatLs, buildTree, applyOsVersion,
                          completeTelnet, NetHost-Typ)
  telnet.ts            — Pure NET_HOSTS-Definitionen + getHost(name|ip)
WoragTerminal.tsx      — Layards Terminal (TopBar, Wohnung 2611, Sektor-Türen)
BodoTerminal.tsx       — Bodos Wartungsterminal (Hotspot in Bodos Wohnung)
NodeTerminal.tsx       — bleibt unverändert in Funktion, nutzt aber jetzt shared.tsx

src/game/
  filesystemWorag.ts   — Layards komplette Datei-Hierarchie
                          (Root: /, /home/worag, /etc, /var, /sektor, …)
  filesystemBodo.ts    — Bodos komplette Datei-Hierarchie
                          (Root: /, /home/bodo, /etc, /var, …)
  filesystem.ts        — DEPRECATED, nach Migration entfernen
```

Wichtig: jedes Filesystem ist ein **separater Baum**. `/home/bodo` existiert nicht in Worags Baum, `/home/worag` nicht in Bodos. Es gibt **keinen Shared Root**.

---

## Trennung der Befehle

| Befehl | Worag | Bodo | Node 5610 |
|---|---|---|---|
| `help`, `clear`, `exit`, `pwd`, `ls`, `cd`, `cat`, `tree` | ✓ | ✓ | – |
| `inbox`, `read`, `status`, `report` | ✓ | ✓ (Bodos eigene Inbox) | – |
| `net`, `telnet` | ✓ | ✓ | – |
| `sysupdate`, `trouble` | ✓ | ✓ | – |
| `adventure`, `./adventure.bin` | **✓** | **✗ entfernt** | – |
| `lotti`, `./lotti` | **✗ entfernt** | **✓** | – |
| `maint` (WARTUNG nur Hausmeister) | **✗ entfernt** | **✓** | – |
| `tap`, `listen`, `reroute`, `burn` | – | – | ✓ |

Die Tab-Completion-Liste `COMMANDS` wird pro Terminal eigenständig definiert — `WORAG_COMMANDS`, `BODO_COMMANDS`. Wer in WoragTerminal `lotti` tippt, bekommt „Unbekannter Befehl". Wer in BodoTerminal `adventure` tippt, ebenso.

---

## Filesystem-Trennung im Detail

**`filesystemWorag.ts`** exportiert:
- `WORAG_ROOT: FsDir` — vollständiger Baum mit `/home/worag`, Worag-spezifischem `/etc/motd`, `/var/mail/worag`, `/sektor/...` (alles aus dem aktuellen Baum, das Worag sieht).
- `WORAG_HOME: string[] = ["home", "worag"]`
- `resolveWorag(parts)` und `pathStringWorag(parts)`.

**`filesystemBodo.ts`** exportiert:
- `BODO_ROOT: FsDir` — eigenständiger Baum mit `/home/bodo`, `/etc/motd` (Hausmeister-Variante: alte v2.0), `/var/mail/bodo`, `/wartung/...` (neuer Bereich für `maint`).
- `BODO_HOME: string[] = ["home", "bodo"]`
- `resolveBodo(parts)`, `pathStringBodo(parts)`.

`/home/worag` ist in Bodos Baum **nicht vorhanden**. `cd /home/worag` an Bodos Terminal liefert „Verzeichnis existiert nicht" (saubererer Schein als „Zugriff verweigert" — Layards Daten liegen schlicht nicht lokal).

Inhaltlich werden die heute schon vorhandenen Daten 1:1 in die jeweiligen Bäume übernommen. Doppelt vorhandene Dateien (z. B. `/etc/motd`) sind ab dann **echt unabhängig** — eine Änderung am Banner in `filesystemWorag.ts` betrifft Bodo nicht.

---

## `maint` (nur Bodo)

Neuer Befehl für `BodoTerminal.tsx`. Stellt Hausmeister-spezifische Wartungsaktionen bereit. Erste Ausbaustufe:

- `maint status` — kurze Liste: Aufzug 1 OK, Aufzug 2 Notabschaltung, Lüftung Sektor 5 grenzwertig, Knoten 5610 „nicht autorisiert".
- `maint log` — letzte 10 Wartungseinträge (statisch, atmosphärisch).
- `maint help` — Subcommands.

`maint` wird in Worags `COMMANDS`-Liste **nicht** registriert und in `WoragTerminal.handleCommand` nicht behandelt — Layard sieht nicht einmal die Hilfe.

---

## NodeTerminal bleibt eigenständig

`NodeTerminal.tsx` ist heute schon ein separater Komponentenbaum. Wir lassen Funktion und Layout unverändert und nur:

- Importiert künftig `playBeep`/`playKeypress`/`playUnlock` und den `CloseButton`-Wrapper aus `terminal/shared.tsx` (kosmetische Konsolidierung — keine Verhaltensänderung).
- Greift **nicht** auf `filesystemWorag.ts` oder `filesystemBodo.ts` zu. Hat keinen `ls`/`cd`/`cat`. Bleibt rein befehlsorientiert.

---

## Telnet bleibt der einzige Cross-Access

`terminal/telnet.ts` definiert `NET_HOSTS` als gemeinsame Hostliste (IP, Hostname, Telnet-Passwort, MOTD, Files, dynamicFiles). Beide Terminals nutzen dieselbe Liste, weil das Sektor-Netz für beide gleich aussieht — aber die **Datei-Inhalte hinter Telnet sind unabhängig** vom lokalen Filesystem des einloggenden Terminals.

Konfiguration je Host:
- `worag.e67` — Telnet aktiv, Passwort-geschützt (Default: kein Passwort bekannt → Bodo kommt nicht rein, außer er findet eines im Spiel).
- `bodo.e67` — Telnet aktiv, Passwort `Lotti` (case-insensitive). Wie heute.
- Andere Hosts (`philippe.e67`, `gateway.e67`, …) bleiben wie heute.

Damit ist die Spielregel sauber: lokal sieht jedes Terminal nur sein eigenes Home; auf das andere kommt man nur über `telnet` + Passwort.

---

## API-Anpassung

`GameApi.openTerminal` wird typisiert:

```ts
type TerminalTarget = "worag" | "bodo";
openTerminal: (target?: TerminalTarget) => void; // default "worag"
```

`GameContext` führt statt `terminalBodoMode: boolean` ein Feld `terminalTarget: TerminalTarget | null`. `terminalOpen` bleibt als abgeleitete Bedingung (`terminalTarget !== null`).

In `Game.tsx` werden statt einem `<Terminal />` jetzt zwei Komponenten gerendert (jede prüft selbst, ob sie dran ist):

```tsx
<WoragTerminal />
<BodoTerminal />
<NodeTerminal />
```

`scenes.ts` ruft weiterhin `api.openTerminal()` (Worag) bzw. `api.openTerminal("bodo")` (Bodos Hotspot bei `bodoAway`) auf — Aufrufseite ändert sich minimal.

---

## Migrationsschritte (Reihenfolge)

1. `terminal/shared.tsx` und `terminal/telnet.ts` anlegen, gemeinsame Helfer extrahieren.
2. `filesystemWorag.ts` und `filesystemBodo.ts` anlegen, Inhalte aus heutigem `filesystem.ts` aufteilen.
3. `WoragTerminal.tsx` aus heutigem `Terminal.tsx` forken — `lotti`/`maint`-Pfade entfernen, nur `WORAG_ROOT` benutzen.
4. `BodoTerminal.tsx` als zweiter Fork — `adventure`-Pfad entfernen, `maint` ergänzen, nur `BODO_ROOT`.
5. `NodeTerminal.tsx` auf `terminal/shared.tsx` umstellen (Imports), Verhalten unverändert.
6. `GameContext` + `types.ts`: `terminalTarget` einführen, `openTerminal(target?)` typisieren.
7. `Game.tsx`: beide Terminal-Komponenten einbinden.
8. `scenes.ts`: Aufrufstellen anpassen (`openTerminal("bodo")`).
9. `Terminal.tsx` und `filesystem.ts` löschen, sobald nichts mehr darauf zeigt.

---

## Was bewusst **nicht** geändert wird

- Optik/CRT-Look ist für beide Terminals identisch (Phosphor-Grün). Nur der Banner unterscheidet sie.
- NodeTerminal-Optik bleibt amber.
- `NET_HOSTS` ist geteilt — das ist das gemeinsame Netzwerk, nicht ein gemeinsames Filesystem.
- Bestehende Spielzustände (Flags, Inbox-Mails) bleiben unberührt.
