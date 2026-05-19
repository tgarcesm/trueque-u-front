import type { Favorite } from "../types/index.ts";
import { API_URL, authFetch } from "./config.ts";

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const res = await authFetch(`${API_URL}/favorites`);
    if (!res.ok) throw new Error("No se pudieron obtener los favoritos");
    const data = await res.json();
    return data.map((f: any) => ({
      id: f.favoriteId,
      userId: f.userId,
      listingId: f.listingId,
      title: f.title,
    }));
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudieron obtener los favoritos");
  }
}

export async function addFavorite(listingId: string): Promise<Favorite> {
  try {
    const res = await authFetch(`${API_URL}/favorites/${listingId}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("No se pudo agregar el favorito");
    const f = await res.json();
    return {
      id: f.favoriteId,
      userId: f.userId,
      listingId: f.listingId,
      title: f.title,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo agregar el favorito");
  }
}

export async function removeFavorite(id: string): Promise<void> {
  try {
    const res = await authFetch(`${API_URL}/favorites/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el favorito");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo eliminar el favorito");
  }
}