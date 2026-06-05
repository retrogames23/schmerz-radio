import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import { DSA_MASTER_MODELS } from "@/lib/aiModel";
import { getDsaModel, setDsaModel, getDsaModelOption } from "@/lib/dsaModelPreference";
import { useDonationStatus } from "@/hooks/useDonationStatus";

/**
 * Kleiner Dropdown-Schalter, mit dem Unterstützer*innen das LLM-Modell
 * für den DSA-Meister wählen. Für alle anderen unsichtbar — der Server
 * fällt zudem hart auf den Default zurück.
 */
export function DsaModelSwitcher() {
  const donation = useDonationStatus();
  const [current, setCurrent] = useState<string>(() => getDsaModel());

  useEffect(() => {
    const handler = () => setCurrent(getDsaModel());
    window.addEventListener("dsa-model-changed", handler);
    return () => window.removeEventListener("dsa-model-changed", handler);
  }, []);

  if (!donation.unlocked) return null;

  const opt = getDsaModelOption();

  return (
    <label
      className="inline-flex items-center gap-1.5 rounded border border-[#3a2c1a]/40 bg-[#f5e6c8]/60 px-2 py-1 text-[11px] font-serif text-[#2a1f10] shadow-sm"
      title={`KI-Modell für den Meister: ${opt.label}\n${opt.hint}\n(Nur für Unterstützer*innen)`}
    >
      <Cpu className="h-3 w-3 opacity-70" strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline opacity-70">KI:</span>
      <select
        value={current}
        onChange={(e) => {
          setDsaModel(e.target.value);
          setCurrent(e.target.value);
        }}
        className="bg-transparent text-[11px] font-serif outline-none focus:ring-1 focus:ring-[#3a2c1a]/40 rounded"
        aria-label="KI-Modell für den DSA-Meister wählen"
      >
        {DSA_MASTER_MODELS.map((m) => (
          <option key={m.id} value={m.id} title={m.hint}>
            {m.short}
          </option>
        ))}
      </select>
    </label>
  );
}