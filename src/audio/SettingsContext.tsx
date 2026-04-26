import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// v2: Default für `ttsEnabled` von true auf false geändert. Key-Bump
// erzwingt, dass auch bestehende Spieler die neue Voreinstellung
// übernehmen — sonst würde der alte v1-Eintrag (mit ttsEnabled: true)
// die neue Default-Logik überschreiben.
const STORAGE_KEY = "schmerz-radio.settings.v2";

export interface Settings {
  musicEnabled: boolean;
  ttsEnabled: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
}

const DEFAULTS: Settings = {
  musicEnabled: true,
  // Standardmäßig aus, solange die Dialoge noch nicht final sind
  // (TTS-Credits sollen nicht für Zwischenversionen verbraucht werden).
  ttsEnabled: false,
  musicVolume: 0.45,
  sfxVolume: 0.7,
};

interface Ctx extends Settings {
  set: (patch: Partial<Settings>) => void;
  toggleMusic: () => void;
  toggleTts: () => void;
}

const SettingsCtx = createContext<Ctx | null>(null);

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Settings>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const set = useCallback(
    (patch: Partial<Settings>) => setState((s) => ({ ...s, ...patch })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      set,
      toggleMusic: () => set({ musicEnabled: !state.musicEnabled }),
      toggleTts: () => set({ ttsEnabled: !state.ttsEnabled }),
    }),
    [state, set],
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}