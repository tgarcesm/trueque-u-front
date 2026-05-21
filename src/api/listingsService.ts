import type { Listing } from "../types/index.ts";
import { ApiValidationError, parseErrorResponse } from "../utils/apiErrors.ts";
import { getToken } from "../utils/auth.ts";
import { API_URL, apiFetch, authFetch } from "./config.ts";

export const CATEGORY_IDS: Record<string, string> = {
  Electrónica: "bbbbbbbb-bbbb-bbbb-bbbb-000000000001",
  Hogar: "bbbbbbbb-bbbb-bbbb-bbbb-000000000002",
  Ropa: "bbbbbbbb-bbbb-bbbb-bbbb-000000000003",
  Deportes: "bbbbbbbb-bbbb-bbbb-bbbb-000000000004",
  Libros: "bbbbbbbb-bbbb-bbbb-bbbb-000000000005",
};

const CATEGORY_NAMES: Record<string, string> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": "Electrónica",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": "Hogar",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": "Ropa",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": "Deportes",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": "Libros",
};

export const CONDITION_LABELS: Record<number, string> = {
  0: "Nuevo",
  1: "Como nuevo",
  2: "Bueno",
  3: "Regular",
  4: "Malo",
};

export type ListingsQueryParams = {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: number;
  state?: number;
  postedAfter?: string;
  postedBefore?: string;
  page?: number;
  pageSize?: number;
};

function mapListingState(state: unknown): Listing["status"] {
  if (state === 0) return "available";
  if (state === 1) return "reserved";
  return "sold";
}

function mapCondition(condition: unknown): Listing["condition"] {
  const n = Number(condition);
  return CONDITION_LABELS[n] ?? "—";
}

function buildListingsQuery(params?: ListingsQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("pageSize", String(params?.pageSize ?? 50));
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.keyword?.trim()) searchParams.set("keyword", params.keyword.trim());
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.minPrice != null && !Number.isNaN(params.minPrice)) {
    searchParams.set("minPrice", String(params.minPrice));
  }
  if (params?.maxPrice != null && !Number.isNaN(params.maxPrice)) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }
  if (params?.condition != null) searchParams.set("condition", String(params.condition));
  if (params?.state != null) searchParams.set("state", String(params.state));
  if (params?.postedAfter) searchParams.set("postedAfter", params.postedAfter);
  if (params?.postedBefore) searchParams.set("postedBefore", params.postedBefore);
  return `?${searchParams.toString()}`;
}

function mapListing(raw: Record<string, unknown>): Listing {
  const images = raw.images ?? raw.Images;
  return {
    id: String(raw.id ?? raw.Id ?? raw.listingId ?? raw.ListingId ?? ""),
    title: String(raw.title ?? raw.Title ?? ""),
    description: String(raw.description ?? raw.Description ?? ""),
    price: Number(raw.price ?? raw.Price ?? 0),
    location: String(raw.location ?? raw.Location ?? ""),
    category:
      CATEGORY_NAMES[String(raw.categoryId ?? raw.CategoryId ?? "")] ??
      String(raw.categoryId ?? raw.CategoryId ?? ""),
    condition: mapCondition(raw.condition ?? raw.Condition),
    status: mapListingState(raw.state ?? raw.State),
    images: Array.isArray(images)
      ? images.map((img) =>
          String(
            (img as Record<string, unknown>).imageUrl ??
              (img as Record<string, unknown>).ImageUrl ??
              "",
          ),
        )
      : [],
    sellerId: String(raw.userId ?? raw.UserId ?? raw.sellerId ?? raw.SellerId ?? ""),
    isHidden: Boolean(raw.isHidden ?? raw.IsHidden ?? false),
  };
}

export async function getListings(params?: ListingsQueryParams): Promise<Listing[]> {
  try {
    const res = getToken()
      ? await authFetch(`${API_URL}/api/Listings${buildListingsQuery(params)}`)
      : await apiFetch(`${API_URL}/api/Listings${buildListingsQuery(params)}`);
    if (!res.ok) throw new Error("No se pudieron obtener los anuncios");
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.items ?? []);
    return items.map(mapListing);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudieron obtener los anuncios");
  }
}

export async function getListingById(
  id: string,
  options?: { useAuth?: boolean },
): Promise<Listing> {
  try {
    const useAuth = options?.useAuth ?? false;
    const res = useAuth
      ? await authFetch(`${API_URL}/api/Listings/${id}`)
      : await apiFetch(`${API_URL}/api/Listings/${id}`);
    if (!res.ok) throw new Error("Anuncio no encontrado");
    const data = await res.json();
    return mapListing(data as Record<string, unknown>);
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
    const messages = await parseErrorResponse(res);
    if (messages.length > 0) {
      throw new ApiValidationError(messages);
    }
    throw new Error("No se pudo crear el anuncio");
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

export async function updateListingState(listingId: string, state: 0 | 1 | 2) {
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