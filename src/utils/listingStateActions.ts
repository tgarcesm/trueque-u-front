import type { Listing } from "../types/index.ts";

export type ListingStateAction = {
  targetState: 0 | 1 | 2;
  label: string;
  variant: "primary" | "secondary";
};

/** Transiciones permitidas por el backend para el dueño del listing. */
export function getOwnerStateActions(
  status: Listing["status"],
): ListingStateAction[] {
  switch (status) {
    case "available":
      return [
        {
          targetState: 1,
          label: "Marcar como reservado",
          variant: "secondary",
        },
      ];
    case "reserved":
      return [
        {
          targetState: 0,
          label: "Marcar como disponible",
          variant: "secondary",
        },
        {
          targetState: 2,
          label: "Marcar como vendido",
          variant: "primary",
        },
      ];
    case "sold":
      return [];
    default:
      return [];
  }
}
