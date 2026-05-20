import type { Listing } from "../types/index.ts";
import { API_URL, authFetch } from "./config.ts";

const CATEGORY_NAMES: Record<string, string> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": "Electrónica",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": "Hogar",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": "Ropa",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": "Deportes",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": "Libros",
};

function mapListingState(state: unknown): Listing["status"] {
  if (state === 0) return "available";
  if (state === 1) return "reserved";
  return "sold";
}

function mapCondition(condition: unknown): Listing["condition"] {
  // Si quieres diferenciar mejor, ajusta esto según tu UI.
  // Por ahora respetamos el comportamiento que tenías:
  return condition === 0 ? "Nuevo" : "Usado";
}

function mapListing(l: any): Listing {
  return {
    id: l.listingId,
    title: l.title,
    description: l.description,
    price: l.price,
    location: l.location,
    category: CATEGORY_NAMES[l.categoryId] ?? l.categoryId,
    condition: mapCondition(l.condition),
    status: mapListingState(l.state),
    images: Array.isArray(l.images) ? l.images.map((img: any) => img.imageUrl) : [],
    sellerId: l.userId,
  };
}

export async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${API_URL}/api/Listings?pageSize=50`);
    if (!res.ok) throw new Error("No se pudieron obtener los anuncios");
    const data = await res.json();
    return data.map(mapListing);
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
    return mapListing(l);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Anuncio no encontrado");
  }
}

export type CreateListingPayload = {
  title: string;
  description: string;
  condition: number; // 0 nuevo, 1 buen estado, 2 desgastado
  price: number;
  location: string;
  categoryId: string; // GUID
  imageUrls: string[]; // mínimo 3
};

export async function createListing(data: CreateListingPayload) {
  const res = await authFetch(`${API_URL}/api/Listings`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let msg = "No se pudo crear el anuncio";
    try {
      const err = await res.json();
      msg = err?.message ?? JSON.stringify(err);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
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

export async function updateListingState(listingId: string, state: number) {
  const res = await authFetch(`${API_URL}/api/Listings/${listingId}/state`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  });

  if (!res.ok) {
    let msg = "No se pudo cambiar el estado";
    try {
      const err = await res.text();
      msg = err || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }


  return res.json();
}