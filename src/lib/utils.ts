import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number | null): string {
  return n ? n.toLocaleString("es-ES") + " €" : "—";
}

export function fmtM(n: number | null): string {
  return n ? n + " m²" : "—";
}

export function shortAddr(a: { nvia?: string; pob?: string; prov?: string }): string {
  const via = a.nvia && a.nvia !== "—" ? a.nvia : "";
  return [via, a.pob, a.prov].filter(Boolean).join(", ") || a.pob || a.prov || "";
}
