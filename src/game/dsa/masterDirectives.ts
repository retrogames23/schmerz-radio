/**
 * Reine Helfer für den DSA-Meister: Depth-Injection (Author's Note),
 * NSC-Zustands-Tracker und Auto-RAG-Anfrage. Deterministisch, ohne Netz.
 */

export const AUTHORS_NOTE =
  "[REGIE-NOTIZ — nicht vorlesen] Ende mit einer konkret bespielbaren Situation: Worauf kann der Held jetzt reagieren? Nicken, ‚Folgt mir‘, Aufbruch und Gefährtenblick allein reichen nicht. Bereits zugesagte ereignislose Wege knapp mit Reisezeit bis zur nächsten Begegnung, Spur oder Hürde erzählen; bei Gefahr/Wahl unterwegs dort stoppen. Keine neue Heldentat oder Untersuchung vorwegnehmen, keine Zustimmung erneut verlangen. Kein Zusatzimpuls bei reiner Outtime-Auskunft, ausstehendem Kampf/Probe oder Abenteuerende. Gefährten sparsam: meist einer, manchmal keiner. Keine Floskel wiederholen. Halte NSC-Haltungen aus dem Tracker ein.";

type Msg = { role: string; content: unknown };

/** Fügt die Regie-Notiz als System-Nachricht vor den letzten `depth` Nachrichten ein. */
export function injectAuthorsNote<T extends Msg>(messages: T[], depth = 2, note = AUTHORS_NOTE): (T | { role: "system"; content: string })[] {
  // Nur sinnvoll bei längeren Verläufen; Nachricht 0 ist der System-Prompt.
  if (messages.length < 1 + depth + 2) return messages;
  const at = messages.length - depth;
  return [...messages.slice(0, at), { role: "system" as const, content: note }, ...messages.slice(at)];
}

export type NpcState = { name: string; note: string; turn: number };

const NPC_RE = /\[NSC:\s*([^\]|:]{1,40})\s*[|:]\s*([^\]]{1,120})\]/gi;

/** Liest [NSC: Name | Haltung] aus der Antwort und entfernt die Marker. */
export function extractNpcMarkers(reply: string): { text: string; updates: { name: string; note: string }[] } {
  const updates: { name: string; note: string }[] = [];
  const text = reply
    .replace(NPC_RE, (_, n: string, note: string) => {
      updates.push({ name: n.trim(), note: note.trim() });
      return "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, updates };
}

/** Merged Updates (gleicher Name überschreibt), max. `limit` jüngste Einträge. */
export function mergeNpcStates(prev: NpcState[] | undefined, updates: { name: string; note: string }[], turn: number, limit = 8): NpcState[] {
  const map = new Map<string, NpcState>();
  for (const s of prev ?? []) map.set(s.name.toLowerCase(), s);
  for (const u of updates) map.set(u.name.toLowerCase(), { name: u.name, note: u.note, turn });
  return [...map.values()].sort((a, b) => b.turn - a.turn).slice(0, limit);
}

export function npcTrackerBlock(states: NpcState[] | undefined): string {
  const head =
    "NSC-TRACKER (Haltungen bleiben bestehen, bis etwas sie ändert). Ändert sich die Haltung eines NSC oder Gefährten spürbar (bestochen, verärgert, misstrauisch, dankbar), setze am Ende EINE Zeile [NSC: Name | neue Haltung in wenigen Worten]. Sonst kein Marker.";
  if (!states || states.length === 0) return `${head}\n(noch keine Einträge)`;
  return `${head}\n${states.map((s) => `- ${s.name}: ${s.note}`).join("\n")}`;
}

/** Ein Schauplatzwechsel liegt vor, wenn das Bild-Tag sich geändert hat oder noch keins existiert. */
export function sceneQueryFrom(lastAssistant: string | undefined): string | null {
  if (!lastAssistant) return null;
  const m = lastAssistant.match(/\[SCENE:\s*([^\]]+)\]/i);
  if (!m) return null;
  const after = lastAssistant.slice((m.index ?? 0) + m[0].length).replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  const q = `${m[1].replace(/_/g, " ")} ${after}`.slice(0, 300).trim();
  return q.length >= 8 ? q : null;
}
