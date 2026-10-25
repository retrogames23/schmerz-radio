/**
 * Nachbearbeitung der Meister-Antworten, bevor sie gespeichert und an den
 * Spieler ausgeliefert werden (vgl. Regex-Skripte in SillyTavern).
 * Rein deterministisch, keine Netzaufrufe.
 */
export function sanitizeReply(reply: string): string {
  if (!reply) return "";
  let out = reply;
  // 1) Interne Gedankengänge moderner Reasoning-Modelle
  out = out.replace(/<(think|thinking|reasoning|reflection|scratchpad)>[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(?:think|thinking|reasoning|reflection|scratchpad)>[\s\S]*$/i, "");
  // 2) Reste von Tool-/Funktion-Aufrufen
  out = out.replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "");
  out = out.replace(/<tool_response>[\s\S]*?<\/tool_response>/gi, "");
  out = out.replace(/<function_calls?>[\s\S]*?<\/function_calls?>/gi, "");
  out = out.replace(/<\|tool_calls?_begin\|>[\s\S]*?<\|tool_calls?_end\|>/gi, "");
  // 3) Chat-Template-Steuerzeichen (ChatML, Llama, DeepSeek, etc.)
  out = out.replace(/<\|im_(?:start|end)\|>(?:\s*(?:system|assistant|user))?/gi, "");
  out = out.replace(/<\|[a-z_]+\|>/gi, "");
  // 4) Tokenizer-Ausreißer: CJK-, Hangul-, Kana- und Vollbreiten-Zeichen
  //    kommen in deutschem DSA-Text nie vor (z. B. „＿日本").
  out = out.replace(/[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uff00-\uffef]+/g, "");
  // Weitere fremde Schriften (Thai, Arabisch, Hebräisch, Devanagari, Kyrillisch …)
  // — z. B. Spam-Token wie „ฟรีเครดิต" mitten im Text.
  out = out.replace(/[\u0400-\u04ff\u0590-\u06ff\u0900-\u0dff\u0e00-\u0e7f\u0e80-\u0eff\u1000-\u109f]+/g, " ");
  out = out.replace(/([.!?…“"])\s{2,}/g, "$1 ");
  // 4b) Doppelt ausgegebene Antwort: taucht der erste Satz (≥ 40 Zeichen)
  //     später wörtlich erneut auf, ab dort abschneiden.
  out = cutRepeatedStart(out);
  out = cutParaphrasedRestart(out);
  // Verstümmelte, leere System-Klammern wie „[ ?]“, „[]“, „[ … ]“
  out = out.replace(/\[\s*[?….\-_*]*\s*\]/g, "");
  // Unsichtbare Steuer-/Breitenzeichen
  out = out.replace(/[\u200b-\u200f\u2060\ufeff]/g, "");
  // 5) Assistenten-Floskeln am Anfang
  out = out.replace(
    /^\s*(?:Hier ist (?:die|meine) (?:Fortsetzung|Antwort|nächste Szene)[^\n]*:|Gerne!?[^\n]{0,40}:|Natürlich!?[^\n]{0,40}:)\s*/i,
    "",
  );
  // 6) Abgebrochene Marker ohne schließende Klammer am Zeilenende verwerfen
  out = out.replace(/\[(?:CHECK|SCENE|MOOD|COMBAT|LE|AE|ITEM|END|AP)[^\]\n]*$/gim, "");
  // 7) Whitespace glätten
  out = out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function cutRepeatedStart(text: string): string {
  const body = text.replace(/^\s*\[(?:TJARK|BREM|YELVA)\]\s*(?:\(Outtime\)\s*)?/i, "");
  const m = /^([\s\S]{40,}?[.!?])(?:\s|$)/.exec(body);
  if (!m) return text;
  const probe = m[1].slice(0, 40);
  const first = text.indexOf(probe);
  const again = text.indexOf(probe, first + probe.length);
  if (first < 0 || again < 0) return text;
  let cut = again;
  const tag = text.slice(0, again).match(/\[(?:TJARK|BREM|YELVA)\][^\S\n]*(?:\(Outtime\)\s*)?$/i);
  if (tag) cut = again - tag[0].length;
  return text.slice(0, cut).trimEnd();
}

const STOP = new Set("der die das den dem des ein eine einen einem einer und oder aber mit von zu im in am an auf aus bei für über unter vor nach ist sind war wird sich nicht noch schon auch nur wie als dass ihr euch du dich dir er sie es wir uns so da hier dort wenn während".split(" "));

function contentWords(p: string): Set<string> {
  const words = p.toLowerCase().replace(/\[[^\]]*\]/g, " ").match(/[a-zäöüß]{4,}/g) ?? [];
  return new Set(words.filter((w) => !STOP.has(w)).map((w) => w.slice(0, 6)));
}

/** Schneidet einen späteren Tjark-Absatz ab, der den ersten Erzählabsatz
 *  nur umformuliert wiederholt (≥ 55 % gemeinsame Inhaltswörter). */
export function cutParaphrasedRestart(text: string): string {
  const paras = text.split(/\n\s*\n/);
  if (paras.length < 2) return text;
  const isNarr = (p: string) => !/^\s*\[(?:BREM|YELVA)\]/i.test(p) && !/\(Outtime\)/i.test(p);
  const firstIdx = paras.findIndex((p) => isNarr(p) && p.length >= 120);
  if (firstIdx < 0) return text;
  const a = contentWords(paras[firstIdx]);
  if (a.size < 8) return text;
  for (let i = firstIdx + 1; i < paras.length; i++) {
    if (!isNarr(paras[i]) || paras[i].length < 120) continue;
    const b = contentWords(paras[i]);
    let shared = 0;
    for (const w of b) if (a.has(w)) shared++;
    if (shared / Math.min(a.size, b.size) >= 0.55) return paras.slice(0, i).join("\n\n").trimEnd();
  }
  return text;
}
