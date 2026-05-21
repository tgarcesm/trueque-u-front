import { API_URL, authFetch } from "./config.ts";

export async function reportListing(
  listingId: string,
  reason: string,
  comment: string,
): Promise<void> {
  try {
    const res = await authFetch(`${API_URL}/reports/listings/${listingId}`, {
      method: "POST",
      body: JSON.stringify({ reason, comment }),
    });
    if (!res.ok) throw new Error("No se pudo enviar el reporte");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo enviar el reporte");
  }
}

export async function reportUser(
  userId: string,
  reason: string,
  comment: string,
): Promise<void> {
  try {
    const res = await authFetch(`${API_URL}/reports/users/${userId}`, {
      method: "POST",
      body: JSON.stringify({ reason, comment }),
    });
    if (!res.ok) throw new Error("No se pudo enviar el reporte");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo enviar el reporte");
  }
}