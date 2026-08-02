import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { synth } from '../audio/synth';
import { TIMBRES } from '../theory/catalog';
import type { Timbre } from '../theory/types';

const STORAGE_KEY = 'ear-training.settings.v1';
const TIMBRE_IDS = new Set(TIMBRES.map((t) => t.id));

type Settings = {
  timbre: Timbre;
};

type SettingsContextValue = {
  ready: boolean;
  timbre: Timbre;
  setTimbre: (timbre: Timbre) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const defaults: Settings = {
  timbre: 'sine',
};

function isTimbre(value: unknown): value is Timbre {
  return typeof value === 'string' && TIMBRE_IDS.has(value as Timbre);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [timbre, setTimbreState] = useState<Timbre>(defaults.timbre);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        const next = isTimbre(parsed.timbre) ? parsed.timbre : defaults.timbre;
        setTimbreState(next);
        synth.setTimbre(next);
      } else {
        synth.setTimbre(defaults.timbre);
      }
    } catch {
      synth.setTimbre(defaults.timbre);
    } finally {
      setReady(true);
    }
  }, []);

  const setTimbre = useCallback((next: Timbre) => {
    if (!isTimbre(next)) return;
    setTimbreState(next);
    synth.setTimbre(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timbre: next }));
    } catch {
      // Local-only preference; ignore persistence failures.
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      timbre,
      setTimbre,
    }),
    [ready, timbre, setTimbre],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
