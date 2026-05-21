import type { Listing } from "../types/index.ts";
import { API_URL, authFetch } from "./config.ts";

const CATEGORY_NAMES: Record<string, string> = {
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000001": "Electrónica",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000002": "Hogar",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000003": "Ropa",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000004": "Deportes",
  "bbbbbbbb-bbbb-bbbb-bbbb-000000000005": "Libros",
};

const CONDITION_LABELS: Record<number, string> = {
  0: "Nuevo",
  1: "Como nuevo",
  2: "Bueno",
  3: "Regular",
  4: "Malo",
};

export type AdminListing = Listing & {
  isHidden: boolean;
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  programName: string;
  rating: number;
  isSuspended: boolean;
};

/** 0 = Listing, 1 = User (enum del backend) */
export type ReportTargetType = 0 | 1;

export type AdminReport = {
  reportId: string;
  reporterId: string;
  targetType: ReportTargetType;
  reportedListingId: string | null;
  reportedUserId: string | null;
  reason: string;
  comment: string;
  createdAt: string;
};

function mapTargetType(value: unknown): ReportTargetType {
  if (value === 1 || value === "1") return 1;
  if (value === 0 || value === "0") return 0;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "user") return 1;
    if (lower === "listing") return 0;
  }
  return 0;
}

function mapReport(raw: Record<string, unknown>): AdminReport {
  const listingId = raw.reportedListingId ?? raw.ReportedListingId;
  const userId = raw.reportedUserId ?? raw.ReportedUserId;
  return {
    reportId: String(raw.reportId ?? raw.ReportId ?? ""),
    reporterId: String(raw.reporterId ?? raw.ReporterId ?? ""),
    targetType: mapTargetType(raw.targetType ?? raw.TargetType),
    reportedListingId: listingId != null ? String(listingId) : null,
    reportedUserId: userId != null ? String(userId) : null,
    reason: String(raw.reason ?? raw.Reason ?? ""),
    comment: String(raw.comment ?? raw.Comment ?? ""),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
  };
}

function mapAdminListing(raw: Record<string, unknown>): AdminListing {
  const state = raw.state ?? raw.State;
  const condition = raw.condition ?? raw.Condition;
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
    condition: CONDITION_LABELS[Number(condition)] ?? "—",
    status: state === 0 ? "available" : state === 1 ? "reserved" : "sold",
    images: Array.isArray(images)
      ? images.map((img) =>
          String((img as Record<string, unknown>).imageUrl ?? (img as Record<string, unknown>).ImageUrl ?? ""),
        )
      : [],
    sellerId: String(raw.userId ?? raw.UserId ?? raw.sellerId ?? raw.SellerId ?? ""),
    isHidden: Boolean(raw.isHidden ?? raw.IsHidden),
  };
}

export async function getAdminListings(): Promise<AdminListing[]> {
  let res = await authFetch(`${API_URL}/admin/listings`);
  if (!res.ok) {
    res = await authFetch(`${API_URL}/api/Listings?pageSize=200`);
  }
  if (!res.ok) throw new Error("No se pudieron cargar las publicaciones");
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return (items as Record<string, unknown>[])
    .map(mapAdminListing)
    .filter((l) => l.id.trim() !== "");
}

function mapAdminUser(raw: Record<string, unknown>): AdminUser {
  return {
    id: String(raw.id ?? raw.Id ?? raw.userId ?? raw.UserId ?? ""),
    fullName: String(raw.fullName ?? raw.FullName ?? ""),
    email: String(raw.email ?? raw.Email ?? ""),
    programName: String(raw.programName ?? raw.ProgramName ?? ""),
    rating: Number(raw.rating ?? raw.Rating ?? 0),
    isSuspended: Boolean(raw.isSuspended ?? raw.IsSuspended),
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await authFetch(`${API_URL}/admin/users`);
  if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return (items as Record<string, unknown>[]).map(mapAdminUser);
}

export type CreateAdminUserPayload = {
  fullName: string;
  email: string;
  password: string;
  programName: string;
  role: "User" | "Admin";
};

async function parseAdminError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const err = await res.json();
    return (err as { message?: string }).message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function createUser(
  payload: CreateAdminUserPayload,
): Promise<AdminUser> {
  const res = await authFetch(`${API_URL}/admin/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      await parseAdminError(res, "No se pudo crear el usuario"),
    );
  }
  const data = await res.json();
  return mapAdminUser(data as Record<string, unknown>);
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(
      await parseAdminError(res, "No se pudo eliminar el usuario"),
    );
  }
}

export async function getAdminReports(): Promise<AdminReport[]> {
  const res = await authFetch(`${API_URL}/admin/reports`);
  if (!res.ok) throw new Error("No se pudieron cargar los reportes");
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.map((item) => mapReport(item as Record<string, unknown>));
}

export async function getAdminListingById(
  listingId: string,
): Promise<AdminListing | null> {
  try {
    const res = await authFetch(`${API_URL}/api/Listings/${listingId}`);
    if (res.ok) {
      const data = await res.json();
      return mapAdminListing(data as Record<string, unknown>);
    }
  } catch {
    // fallback: listado admin incluye publicaciones ocultas
  }

  const listings = await getAdminListings();
  return listings.find((l) => l.id === listingId) ?? null;
}

export async function hideListing(listingId: string, reason: string): Promise<void> {
  const res = await authFetch(`${API_URL}/admin/listings/${listingId}/hide`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    let msg = "No se pudo ocultar la publicación";
    try {
      const err = await res.json();
      msg = (err as { message?: string }).message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}

export async function showListing(listingId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/admin/listings/${listingId}/show`, {
    method: "PATCH",
  });
  if (!res.ok) {
    let msg = "No se pudo reactivar la publicación";
    try {
      const err = await res.json();
      msg = (err as { message?: string }).message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}

export async function suspendUser(userId: string, reason: string): Promise<void> {
  const res = await authFetch(`${API_URL}/admin/users/${userId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    let msg = "No se pudo suspender al usuario";
    try {
      const err = await res.json();
      msg = (err as { message?: string }).message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}

export async function unsuspendUser(userId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/admin/users/${userId}/unsuspend`, {
    method: "PATCH",
  });
  if (!res.ok) {
    let msg = "No se pudo reactivar al usuario";
    try {
      const err = await res.json();
      msg = (err as { message?: string }).message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}
