import { API_URL, authFetch } from "./config.ts";

export type AdminReport = {
  reportId: string;
  reporterId: string;
  targetType: "listing" | "user";
  reason: string;
  comment: string;
  createdAt: string;
};

function mapTargetType(value: unknown): AdminReport["targetType"] {
  if (value === 0 || value === "Listing" || value === "listing") return "listing";
  if (value === 1 || value === "User" || value === "user") return "user";
  return "listing";
}

function mapReport(raw: Record<string, unknown>): AdminReport {
  return {
    reportId: String(raw.reportId ?? raw.ReportId ?? ""),
    reporterId: String(raw.reporterId ?? raw.ReporterId ?? ""),
    targetType: mapTargetType(raw.targetType ?? raw.TargetType),
    reason: String(raw.reason ?? raw.Reason ?? ""),
    comment: String(raw.comment ?? raw.Comment ?? ""),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
  };
}

export async function getAdminReports(): Promise<AdminReport[]> {
  const res = await authFetch(`${API_URL}/admin/reports`);
  if (!res.ok) throw new Error("No se pudieron cargar los reportes");
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.map((item) => mapReport(item as Record<string, unknown>));
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
