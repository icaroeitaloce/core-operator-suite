import { useEffect, useState } from "react";

export type ManualEntry = {
  id: string;
  type: "in" | "out";
  description: string;
  category: string;
  amount: number;
  createdAt: number;
};

const KEY = "manual-entries-v1";
const EVT = "manual-entries:changed";
export const PROFIT_PER_UNIT = 32;

function read(): ManualEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: ManualEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function addManualEntry(input: Omit<ManualEntry, "id" | "createdAt">): ManualEntry {
  const e: ManualEntry = {
    ...input,
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
  write([e, ...read()]);
  return e;
}

export function removeManualEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function useManualEntries(): ManualEntry[] {
  const [list, setList] = useState<ManualEntry[]>(() => read());
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
