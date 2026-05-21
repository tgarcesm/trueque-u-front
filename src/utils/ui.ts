import type { Listing } from "../types/index.ts";

export const PAGE_BG = "min-h-screen bg-[#f8fafc]";
export const CARD =
  "rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100";
export const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
export const BTN_PRIMARY =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:from-indigo-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
export const BTN_SECONDARY =
  "rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-50";
export const GRADIENT_HERO =
  "bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600";
export const TABLE_HEAD = "bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500";
export const TABLE_ROW_ODD = "bg-white";
export const TABLE_ROW_EVEN = "bg-slate-50/70";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function statusBadgeClass(
  status: Listing["status"] | string,
): string {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
    case "reserved":
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
    case "sold":
      return "bg-red-100 text-red-800 ring-1 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

export function formatCop(price: number): string {
  return price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
