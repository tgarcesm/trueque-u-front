import type { Listing } from "../types/index.ts";
import { API_URL, authFetch } from "./config.ts";

const CATEGORY_NAMES: Record<string, string> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": "Electrónica",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": "Hogar",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": "Ropa",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": "Deportes",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": "Libros",
};

const DEFAULT_IMAGES: Record<string, string[]> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": [
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
  ],
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  ],
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  ],
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
    "https://images.unsplash.com/photo-1617083934551-ac453d8f7097?w=400",
  ],
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": [
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
  ],
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

export async function createListing(data: any): Promise<Listing> {
  try {
    const res = await authFetch(`${API_URL}/api/Listings`, {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        categoryId: data.category,
        condition: data.condition,
        price: data.price,
        location: data.location || "Campus universitario",
        imageUrls: DEFAULT_IMAGES[data.category] ?? DEFAULT_IMAGES["bbbbbbbb-bbbb-bbbb-bbbb-000000000005"],
      }),
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