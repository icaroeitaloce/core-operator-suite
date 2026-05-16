import { useEffect, useState } from "react";

export type Shipment = {
  id: string;
  name: string;
  number: string;
  qty: number;
  total: number;
  createdAt: number;
  status: "Enviado" | "Entregue" | "Pago";
  sourceId?: string;
};

export function hasShipmentFor(sourceId: string): boolean {
  return read().some((s) => s.sourceId === sourceId);
}

export function markPaid(sourceId: string) {
  const list = read().map((s) => (s.sourceId === sourceId ? { ...s, status: "Pago" as const } : s));
  write(list);
}

const KEY = "shipments-v1";
const EVT = "shipments:changed";
const UNIT = 48.9;
const PAIR = 87.9;

export function priceFor(qty: number): number {
  if (qty <= 0) return 0;
  const pairs = Math.floor(qty / 2);
  const singles = qty % 2;
  return +(pairs * PAIR + singles * UNIT).toFixed(2);
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function read(): Shipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: Shipment[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function addShipment(input: { name: string; number: string; qty: number; sourceId?: string; status?: Shipment["status"] }): Shipment {
  const s: Shipment = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    number: input.number,
    qty: input.qty,
    total: priceFor(input.qty),
    createdAt: Date.now(),
    status: input.status ?? "Enviado",
    sourceId: input.sourceId,
  };
  const list = [s, ...read()];
  write(list);
  return s;
}

export function clearShipments() {
  write([]);
}

export function removeShipment(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function useShipments(): Shipment[] {
  const [list, setList] = useState<Shipment[]>([]);
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
