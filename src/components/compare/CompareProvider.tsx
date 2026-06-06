"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CompareBar } from "./CompareBar";

export type CompareItem = { slug: string; name: string };

const MAX_COMPARE = 3;
const STORAGE_KEY = "compare:ngos";

type CompareContextValue = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  max: number;
  /** Transient message (e.g. the "Maximum 3 NGOs" toast). */
  toast: string | null;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within <CompareProvider>");
  return ctx;
}

/** App-wide provider for the NGO comparison shortlist (persisted to localStorage). */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CompareItem[]);
    } catch {
      // ignore malformed storage
    }

    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(e.newValue ? (JSON.parse(e.newValue) as CompareItem[]) : []);
      } catch {
        setItems([]);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CompareItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota / availability errors
    }
  }, []);

  const flashToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const add = useCallback(
    (item: CompareItem) => {
      setItems((current) => {
        if (current.some((i) => i.slug === item.slug)) return current;
        if (current.length >= MAX_COMPARE) {
          flashToast(`Maximum ${MAX_COMPARE} NGOs`);
          return current;
        }
        const next = [...current, item];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [flashToast]
  );

  const remove = useCallback(
    (slug: string) => {
      setItems((current) => {
        const next = current.filter((i) => i.slug !== slug);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const clear = useCallback(() => persist([]), [persist]);

  const has = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  return (
    <CompareContext.Provider
      value={{ items, add, remove, clear, has, max: MAX_COMPARE, toast }}
    >
      {children}
      {/* Reserve space at the bottom so the fixed bar never covers the footer. */}
      {items.length > 0 && <div aria-hidden className="h-28 sm:h-20" />}
      <CompareBar />
    </CompareContext.Provider>
  );
}
