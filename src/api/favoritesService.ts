import type { Favorite } from "../types/index.ts";
import favorites from "../mocks/favorites.json";

export async function getFavorites(): Promise<Favorite[]> {
  try {
    return favorites as Favorite[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudieron obtener los favoritos");
  }
}

export async function addFavorite(listingId: string): Promise<Favorite> {
  try {
    const favorite: Favorite = {
      id: "fav-99",
      userId: "1",
      listingId,
    };
    return favorite;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo agregar el favorito");
  }
}

export async function removeFavorite(id: string): Promise<void> {
  try {
    void id;
    await Promise.resolve();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo eliminar el favorito");
  }
}
