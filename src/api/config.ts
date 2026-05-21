import { getToken } from "../utils/auth.ts";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5088";

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};