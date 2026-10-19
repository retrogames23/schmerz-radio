import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Kleine, bedienbare Workbench-3.0-Programme (Prefs / Utilities / System).
 * Ersetzen die früheren Platzhaltertexte in den Datei-Fenstern.
 */

const GREY = "#aaaaaa";
const LIGHT = "#cccccc";
const BLUE = "#6688bb";
const WHITE = "#ffffff";
const BLACK = "#000000";
const FONT = '"Courier New", "Topaz-8", monospace';

const OUT: CSSProperties = {
  borderTop: `2px solid ${WHITE}`, borderLeft: `2px solid ${WHITE}`,
  borderRight: `2px solid ${BLACK}`, borderBottom: `2px solid ${BLACK}`,
};
const IN: CSSProperties = {
  borderTop: `2px solid ${BLACK}`, borderLeft: `2px solid ${BLACK}`,
  borderRight: `2px solid ${WHITE}`, borderBottom: `2px solid ${WHITE}`,
};

function Pane({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: GREY, color: BLACK, fontFamily: FONT, fontSize: 12, height: "100%", overflow: "auto", padding: 10, boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, active, style }: { children: ReactNode; onClick?: () => void; active?: boolean; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...(active ? IN : OUT), background: active ? LIGHT : GREY, color: BLACK,
        fontFamily: FONT, fontSize: 12, padding: "3px 10px", cursor: "pointer",
        touchAction: "manipulation", minWidth: 0, ...style,
      }}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset style={{ border: "none", ...IN, padding: "8px 8px 6px", margin: "0 0 10px" }}>
      <legend style={{ padding: "0 4px", background: GREY }}>{label}</legend>
      {children}
    </fieldset>
  );
}

function PrefsButtons({ onSave, status }: { onSave: (msg: string) => void; status: string }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 8 }}>
        <Btn onClick={() => onSave("Gespeichert in ENVARC:.")}>Speichern</Btn>
        <Btn onClick={() => onSave("Für diese Sitzung benutzt.")}>Benutzen</Btn>
        <Btn onClick={() => onSave("Abgebrochen.")}>Abbrechen</Btn>
      </div>
      <div style={{ minHeight: 16, marginTop: 6, fontSize: 11 }}>{status}</div>
    </>
  );
}

// ─── Prefs/Palette ───────────────────────────────────────────
export function PaletteTool() {
  const [cols, setCols] = useState([GREY, BLACK, WHITE, BLUE]);
  const [sel, setSel] = useState(0);
  const [status, setStatus] = useState("");
  const hex = cols[sel];
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) >> 4);
  const setChan = (c: number, v: number) => {
    const n = rgb.slice(); n[c] = v;
    const h = "#" + n.map((x) => (x * 17).toString(16).padStart(2, "0")).join("");
    setCols((cs) => cs.map((x, i) => (i === sel ? h : x)));
  };
  return (
    <Pane>
      <Group label="Farbe wählen">
        <div style={{ display: "flex", gap: 6 }}>
          {cols.map((c, i) => (
            <button key={i} type="button" onClick={() => setSel(i)} aria-label={`Farbe ${i}`}
              style={{ width: 36, height: 24, background: c, ...(i === sel ? IN : OUT), cursor: "pointer" }} />
          ))}
        </div>
      </Group>
      <Group label="Mischen (12 Bit)">
        {["Rot", "Grün", "Blau"].map((n, c) => (
          <label key={n} style={{ display: "grid", gridTemplateColumns: "48px 1fr 22px", alignItems: "center", gap: 6 }}>
            {n}
            <input type="range" min={0} max={15} value={rgb[c]} onChange={(e) => setChan(c, Number(e.target.value))} />
            <span>{rgb[c]}</span>
          </label>
        ))}
      </Group>
      <Btn onClick={() => { setCols([GREY, BLACK, WHITE, BLUE]); setStatus("Voreinstellung geladen."); }}>Voreinstellung</Btn>
      <PrefsButtons onSave={setStatus} status={status} />
    </Pane>
  );
}

// ─── Prefs/Pointer ───────────────────────────────────────────
const DEFAULT_PTR = [
  "1100000000", "1210000000", "1221000000", "1222100000", "1222210000",
  "1222221000", "1222100000", "1212210000", "1101221000", "0000110000",
];
export function PointerTool() {
  const [grid, setGrid] = useState(DEFAULT_PTR.map((r) => r.split("").map(Number)));
  const [pen, setPen] = useState(1);
  const [status, setStatus] = useState("");
  const colors = ["transparent", BLACK, WHITE];
  return (
    <Pane>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ ...IN, background: GREY, display: "grid", gridTemplateColumns: "repeat(10, 16px)" }}>
          {grid.flatMap((row, y) => row.map((v, x) => (
            <button key={`${x}-${y}`} type="button"
              onClick={() => setGrid((g) => g.map((r, yy) => r.map((c, xx) => (xx === x && yy === y ? pen : c))))}
              style={{ width: 16, height: 16, padding: 0, border: `1px solid ${LIGHT}`, background: colors[v], cursor: "crosshair" }} />
          )))}
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Stift:</div>
          {["Leer", "Schwarz", "Weiß"].map((n, i) => (
            <Btn key={n} active={pen === i} onClick={() => setPen(i)} style={{ display: "block", width: 90, marginBottom: 4 }}>{n}</Btn>
          ))}
          <Btn onClick={() => setGrid(DEFAULT_PTR.map((r) => r.split("").map(Number)))} style={{ width: 90 }}>Löschen</Btn>
        </div>
      </div>
      <PrefsButtons onSave={setStatus} status={status} />
    </Pane>
  );
}

// ─── Prefs/Serial ────────────────────────────────────────────
export function SerialTool() {
  const [baud, setBaud] = useState("2400");
  const [hs, setHs] = useState("RTS/CTS");
  const [status, setStatus] = useState("");
  const Cycle = ({ label, value, opts, set }: { label: string; value: string; opts: string[]; set: (v: string) => void }) => (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", alignItems: "center", marginBottom: 6 }}>
      {label}
      <Btn onClick={() => set(opts[(opts.indexOf(value) + 1) % opts.length])} style={{ textAlign: "left" }}>↻ {value}</Btn>
    </div>
  );
  return (
    <Pane>
      <Group label="Schnittstelle">
        <Cycle label="Baudrate" value={baud} opts={["1200", "2400", "4800", "9600"]} set={setBaud} />
        <Cycle label="Handshake" value={hs} opts={["RTS/CTS", "XON/XOFF", "Keiner"]} set={setHs} />
        <div>Datenformat: 8N1</div>
      </Group>
      {baud !== "2400" && <div style={{ fontSize: 11 }}>Achtung: Ruvens Modem kann nur 2400.</div>}
      <PrefsButtons onSave={setStatus} status={status} />
    </Pane>
  );
}

// ─── Utilities/Clock ─────────────────────────────────────────
export function ClockTool() {
  const [now, setNow] = useState(() => new Date());
  const [digital, setDigital] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const hand = (deg: number, len: number, w: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return <line x1="60" y1="60" x2={60 + Math.cos(a) * len} y2={60 + Math.sin(a) * len} stroke={BLACK} strokeWidth={w} />;
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <Pane style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {digital ? (
        <div style={{ ...IN, background: BLACK, color: "#33ff66", fontSize: 32, padding: "10px 18px", marginTop: 20 }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
      ) : (
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill={WHITE} stroke={BLACK} strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <rect key={i} x={60 + Math.sin(a) * 46 - 2} y={60 - Math.cos(a) * 46 - 2} width="4" height="4" fill={BLACK} />;
          })}
          {hand((h % 12) * 30 + m / 2, 28, 4)}
          {hand(m * 6, 42, 3)}
          <line x1="60" y1="60" x2={60 + Math.sin((s * 6 * Math.PI) / 180) * 46} y2={60 - Math.cos((s * 6 * Math.PI) / 180) * 46} stroke={BLUE} strokeWidth="1.5" />
        </svg>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <Btn active={!digital} onClick={() => setDigital(false)}>Analog</Btn>
        <Btn active={digital} onClick={() => setDigital(true)}>Digital</Btn>
      </div>
      <div>{pad(now.getDate())}.{pad(now.getMonth() + 1)}.1997</div>
    </Pane>
  );
}

// ─── Utilities/Calculator ────────────────────────────────────
export function CalculatorTool() {
  const [disp, setDisp] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const calc = (a: number, b: number, o: string) =>
    o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b === 0 ? NaN : a / b;
  const press = (k: string) => {
    if (/^[0-9]$/.test(k)) { setDisp(fresh || disp === "0" ? k : (disp + k).slice(0, 12)); setFresh(false); return; }
    if (k === ",") { if (fresh) { setDisp("0."); setFresh(false); } else if (!disp.includes(".")) setDisp(disp + "."); return; }
    if (k === "CA") { setDisp("0"); setAcc(null); setOp(null); setFresh(true); return; }
    const cur = parseFloat(disp);
    if (k === "=") {
      if (op != null && acc != null) { const r = calc(acc, cur, op); setDisp(isNaN(r) ? "Fehler" : String(+r.toPrecision(10))); }
      setAcc(null); setOp(null); setFresh(true); return;
    }
    const base = op != null && acc != null && !fresh ? calc(acc, cur, op) : cur;
    setAcc(base); setDisp(isNaN(base) ? "Fehler" : String(+base.toPrecision(10))); setOp(k); setFresh(true);
  };
  const keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ",", "=", "+"];
  return (
    <Pane style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...IN, background: WHITE, width: 196, textAlign: "right", padding: "4px 6px", fontSize: 16, marginBottom: 8 }}>
        {disp.replace(".", ",")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 46px)", gap: 4 }}>
        {keys.map((k) => <Btn key={k} onClick={() => press(k)} style={{ padding: "6px 0" }}>{k}</Btn>)}
        <Btn onClick={() => press("CA")} style={{ gridColumn: "span 4", padding: "4px 0" }}>CA</Btn>
      </div>
    </Pane>
  );
}

// ─── Utilities/More ──────────────────────────────────────────
export function MoreTool({ files }: { files: { name: string; text: string }[] }) {
  const [file, setFile] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  if (file == null) {
    return (
      <Pane>
        <div style={{ marginBottom: 6 }}>Datei zum Anzeigen wählen:</div>
        <div style={{ ...IN, background: WHITE }}>
          {files.map((f, i) => (
            <button key={f.name} type="button" onClick={() => { setFile(i); setPage(0); }}
              style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "2px 6px", fontFamily: FONT, fontSize: 12, cursor: "pointer" }}>
              {f.name}
            </button>
          ))}
        </div>
      </Pane>
    );
  }
  const lines = files[file].text.split("\n");
  const per = 10;
  const pages = Math.max(1, Math.ceil(lines.length / per));
  return (
    <Pane style={{ display: "flex", flexDirection: "column" }}>
      <pre style={{ ...IN, background: WHITE, flex: 1, margin: 0, padding: 6, whiteSpace: "pre-wrap", fontFamily: FONT }}>
        {lines.slice(page * per, page * per + per).join("\n")}
      </pre>
      <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
        <Btn onClick={() => setFile(null)}>Dateien</Btn>
        <Btn onClick={() => setPage((p) => Math.max(0, p - 1))}>◀</Btn>
        <Btn onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>▶ SPACE</Btn>
        <span>{files[file].name} · {Math.round(((page + 1) / pages) * 100)}%</span>
      </div>
    </Pane>
  );
}

// ─── System/Format + DiskCopy ────────────────────────────────
function useProgress(onDone: () => void) {
  const [p, setP] = useState<number | null>(null);
  useEffect(() => {
    if (p == null || p >= 100) return;
    const t = setTimeout(() => { const n = p + 4; setP(n); if (n >= 100) onDone(); }, 90);
    return () => clearTimeout(t);
  }, [p, onDone]);
  return [p, setP] as const;
}

function Bar({ p }: { p: number }) {
  return (
    <div style={{ ...IN, background: WHITE, height: 16, margin: "8px 0" }}>
      <div style={{ width: `${p}%`, height: "100%", background: BLUE }} />
    </div>
  );
}

export function FormatTool() {
  const [drive, setDrive] = useState("DF0:");
  const [name, setName] = useState("Leer");
  const [msg, setMsg] = useState("");
  const [p, setP] = useProgress(() => setMsg(drive === "DF0:" ? "Abbruch: Diskette in DF0: ist schreibgeschützt. Detlef hat Glück gehabt." : "Fehler: Kein Laufwerk DF1: angeschlossen."));
  return (
    <Pane>
      <Group label="Laufwerk">
        <div style={{ display: "flex", gap: 6 }}>
          {["DF0:", "DF1:"].map((d) => <Btn key={d} active={drive === d} onClick={() => setDrive(d)}>{d}</Btn>)}
        </div>
      </Group>
      <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
        Name:
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))}
          style={{ ...IN, background: WHITE, fontFamily: FONT, fontSize: 12, flex: 1, padding: 2 }} />
      </label>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn onClick={() => { setMsg(""); setP(0); }}>Formatieren</Btn>
        <Btn onClick={() => { setMsg(""); setP(0); }}>Schnell formatieren</Btn>
      </div>
      {p != null && <Bar p={Math.min(p, 100)} />}
      <div>{msg}</div>
    </Pane>
  );
}

export function DiskCopyTool() {
  const [msg, setMsg] = useState("Von DF0: nach DF0: kopieren.");
  const [p, setP] = useProgress(() => setMsg("Bitte ZIEL-Diskette in DF0: einlegen. (Es ist keine da.)"));
  return (
    <Pane>
      <Group label="Quelle → Ziel">
        <div>DF0: Workbench3.0 → DF0: (wechseln)</div>
      </Group>
      <Btn onClick={() => { setMsg("Lese Quelle …"); setP(0); }}>Kopieren</Btn>
      {p != null && <Bar p={Math.min(p, 100)} />}
      <div style={{ marginTop: 6 }}>{msg}</div>
    </Pane>
  );
}

// ─── System/FixFonts ─────────────────────────────────────────
const FONTS = [
  { name: "topaz", sizes: [8, 11], family: '"Courier New", monospace' },
  { name: "courier", sizes: [11, 13, 15], family: '"Courier New", monospace' },
  { name: "times", sizes: [11, 13, 15, 18], family: "Times New Roman, serif" },
  { name: "helvetica", sizes: [9, 11, 13, 18], family: "Arial, sans-serif" },
  { name: "garnet", sizes: [9, 16], family: "Georgia, serif" },
];
export function FixFontsTool() {
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState("");
  const f = FONTS[sel];
  return (
    <Pane>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ ...IN, background: WHITE, minWidth: 110 }}>
          {FONTS.map((x, i) => (
            <button key={x.name} type="button" onClick={() => setSel(i)}
              style={{ display: "block", width: "100%", textAlign: "left", border: "none", padding: "2px 6px", fontFamily: FONT, fontSize: 12, cursor: "pointer", background: i === sel ? BLUE : "transparent", color: BLACK }}>
              {x.name}.font
            </button>
          ))}
        </div>
        <div style={{ ...IN, background: WHITE, flex: 1, padding: 6, overflow: "hidden" }}>
          {f.sizes.map((s) => <div key={s} style={{ fontFamily: f.family, fontSize: s }}>{s}: Mandatsgebiet 1997</div>)}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <Btn onClick={() => setMsg(`FONTS: geprüft — ${FONTS.length} Schriften, ${FONTS.reduce((n, x) => n + x.sizes.length, 0)} Größen, keine Fehler.`)}>Fonts reparieren</Btn>
      </div>
      <div style={{ marginTop: 6 }}>{msg}</div>
    </Pane>
  );
}

// ─── Info-Requester (für Binärdateien ohne Programm) ─────────
export function InfoRequester({ name, size, kind, comment }: { name: string; size: number; kind: string; comment: string }) {
  const [note, setNote] = useState(comment);
  return (
    <Pane>
      <Group label="Information">
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", rowGap: 4 }}>
          <span>Name:</span><span>{name}</span>
          <span>Typ:</span><span>{kind}</span>
          <span>Größe:</span><span>{size.toLocaleString("de-DE")} Bytes · {Math.ceil(size / 488)} Blöcke</span>
          <span>Schutz:</span><span>----rwed</span>
        </div>
      </Group>
      <label style={{ display: "block" }}>
        Kommentar:
        <input value={note} onChange={(e) => setNote(e.target.value)}
          style={{ ...IN, background: WHITE, fontFamily: FONT, fontSize: 12, width: "100%", padding: 2, boxSizing: "border-box", marginTop: 4 }} />
      </label>
    </Pane>
  );
}

export function EmptyDrawerNote({ text }: { text: string }) {
  return <Pane><div style={{ ...IN, background: GREY, padding: 10 }}>{text}</div></Pane>;
}
