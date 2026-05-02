import type { Listing } from "../types/index.ts";
import listings from "../mocks/listings.json";

export async function getListings(): Promise<Listing[]> {
  try {
    return listings as Listing[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudieron obtener los anuncios");
  }
}

export async function getListingById(id: string): Promise<Listing> {
  try {
    const listing = listings.find((l) => l.id === id);
    if (!listing) {
      throw new Error("Anuncio no encontrado");
    }
    return listing as Listing;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Anuncio no encontrado");
  }
}

export async function createListing(
  data: Omit<Listing, "id" | "sellerId">,
): Promise<Listing> {
  try {
    const listing: Listing = {
      ...data,
      id: "99",
      sellerId: "1",
    };
    return listing;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo crear el anuncio");
  }
}
