import { API_URL, authFetch } from "./config.ts";

export type UserProfile = {
  id: string;
  fullName: string;
  programName: string;
  rating: number;
  isSuspended: boolean;
};

function mapUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    fullName: String(raw.fullName ?? raw.FullName ?? ""),
    programName: String(raw.programName ?? raw.ProgramName ?? ""),
    rating: Number(raw.rating ?? raw.Rating ?? 0),
    isSuspended: Boolean(raw.isSuspended ?? raw.IsSuspended),
  };
}

export async function getUserById(userId: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("No se pudo cargar el perfil");
  const data = await res.json();
  return mapUserProfile(data as Record<string, unknown>);
}

export async function getAuthenticatedUserById(
  userId: string,
): Promise<UserProfile> {
  const res = await authFetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("No se pudo cargar el perfil");
  const data = await res.json();
  return mapUserProfile(data as Record<string, unknown>);
}

/** Carga varios usuarios en paralelo (p. ej. vendedores de un listado). */
export async function getUsersByIds(
  userIds: string[],
): Promise<Record<string, UserProfile>> {
  const unique = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return {};

  const results = await Promise.all(
    unique.map(async (id) => {
      try {
        const user = await getUserById(id);
        return { id, user } as const;
      } catch {
        return { id, user: null } as const;
      }
    }),
  );

  const map: Record<string, UserProfile> = {};
  for (const { id, user } of results) {
    if (user) map[id] = user;
  }
  return map;
}
