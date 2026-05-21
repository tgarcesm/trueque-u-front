import { getToken } from "../utils/auth.ts";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5088";

const NGROK_SKIP_HEADER = "ngrok-skip-browser-warning";

function mergeHeaders(options: RequestInit = {}): HeadersInit {
  const base: Record<string, string> = {
    [NGROK_SKIP_HEADER]: "true",
  };

  if (options.body != null && options.body !== "") {
    base["Content-Type"] = "application/json";
  }

  const extra = options.headers;
  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      base[key] = value;
    });
    return base;
  }
  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      base[key] = value;
    }
    return base;
  }
  return { ...base, ...(extra as Record<string, string> | undefined) };
}

/** Fetch base para todas las peticiones a la API (incluye header ngrok). */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  return fetch(url, {
    ...options,
    headers: mergeHeaders(options),
  });
};

export const authFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = getToken();
  return apiFetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    },
  });
};
