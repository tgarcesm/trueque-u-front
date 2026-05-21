import { API_URL } from "./config.ts";

export type UserProfile = {
  id: string;
  fullName: string;
  programName: string;
  rating: number;
};

function mapUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    fullName: String(raw.fullName ?? raw.FullName ?? ""),
    programName: String(raw.programName ?? raw.ProgramName ?? ""),
    rating: Number(raw.rating ?? raw.Rating ?? 0),
  };
}

export async function getUserById(userId: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("No se pudo cargar el perfil");
  const data = await res.json();
  return mapUserProfile(data as Record<string, unknown>);
}
