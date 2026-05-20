import type { Listing } from "../types/index.ts";
import { API_URL, authFetch } from "./config.ts";

const CATEGORY_NAMES: Record<string, string> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": "Electrónica",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": "Hogar",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": "Ropa",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": "Deportes",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": "Libros",
};

export async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${API_URL}/api/Listings?pageSize=50`);
    if (!res.ok) throw new Error("No se pudieron obtener los anuncios");
    const data = await res.json();
    return data.map((l: any) => ({
      id: l.listingId,
      title: l.title,
      description: l.description,
      price: l.price,
      location: l.location,
      category: CATEGORY_NAMES[l.categoryId] ?? l.categoryId,
      condition: l.condition === 0 ? "Nuevo" : "Usado",
      status: l.state === 0 ? "available" : "sold",
      images: l.images.map((img: any) => img.imageUrl),
      sellerId: l.userId,
    }));
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudieron obtener los anuncios");
  }
}

export async function getListingById(id: string): Promise<Listing> {
  try {
    const res = await fetch(`${API_URL}/api/Listings/${id}`);
    if (!res.ok) throw new Error("Anuncio no encontrado");
    const l = await res.json();
    return {
      id: l.listingId,
      title: l.title,
      description: l.description,
      price: l.price,
      location: l.location,
      category: CATEGORY_NAMES[l.categoryId] ?? l.categoryId,
      condition: l.condition === 0 ? "Nuevo" : "Usado",
      status: l.state === 0 ? "available" : "sold",
      images: l.images.map((img: any) => img.imageUrl),
      sellerId: l.userId,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Anuncio no encontrado");
  }
}

export async function createListing(
  data: Omit<Listing, "id" | "sellerId">,
): Promise<Listing> {
  try {
    const res = await authFetch(`${API_URL}/api/Listings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("No se pudo crear el anuncio");
    return res.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo crear el anuncio");
  }
}

export async function deleteListing(id: string): Promise<void> {
  try {
    const res = await authFetch(`${API_URL}/api/Listings/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar la publicación");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo eliminar la publicación");
  }
}