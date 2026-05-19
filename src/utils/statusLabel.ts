import type { Listing } from "../types/index.ts";

export function statusLabel(status: Listing["status"]): string {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    default:
      return status;
  }
}