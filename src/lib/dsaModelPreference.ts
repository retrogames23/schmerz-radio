/**
 * Client-seitige Modell-Wahl für DSA. Wird im localStorage persistiert
 * und an jeden DSA-LLM-Request angehängt. Server validiert gegen die
 * Donor-Allowlist — Nicht-Spender*innen fallen automatisch auf den
 * Default zurück.
 */
import {
  AI_MODEL_DSA_MASTER,
  DSA_MASTER_MODELS,
  type DsaMasterModelOption,
} from "@/lib/aiModel";

const STORAGE_KEY = "dsa.model";

const VALID_IDS = new Set(DSA_MASTER_MODELS.map((m) => m.id));

export function getDsaModel(): string {
  // Manuelle Wahl entfernt: Server entscheidet nach Unterstützer-Status.
  void STORAGE_KEY;
  void VALID_IDS;
  return AI_MODEL_DSA_MASTER;
}

export function setDsaModel(id: string): void {
  if (typeof window === "undefined") return;
  if (!VALID_IDS.has(id)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("dsa-model-changed", { detail: { id } }));
  } catch {
    /* ignore */
  }
}

export function getDsaModelOption(): DsaMasterModelOption {
  const id = getDsaModel();
  return DSA_MASTER_MODELS.find((m) => m.id === id) ?? DSA_MASTER_MODELS[0]!;
}