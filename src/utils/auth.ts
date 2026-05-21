const TOKEN_KEY = "token";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== "number") return false;
  return exp * 1000 < Date.now();
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }
  return true;
}

export function getCurrentUserId(): string {
  const token = getToken();
  if (!token || isTokenExpired(token)) return "";
  const payload = decodeTokenPayload(token);
  if (!payload) return "";
  const id = payload[
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
  ];
  return typeof id === "string" ? id : "";
}

export function getUserRole(): string {
  const token = getToken();
  if (!token || isTokenExpired(token)) return "";
  const payload = decodeTokenPayload(token);
  if (!payload) return "";

  const role = payload[ROLE_CLAIM] ?? payload.role;
  if (typeof role === "string") return role;
  if (Array.isArray(role) && typeof role[0] === "string") return role[0];
  return "";
}

export function isAdmin(): boolean {
  return getUserRole() === "Admin";
}

export const LOGIN_NOTICE_KEY = "loginNotice";

export const SUSPENDED_SESSION_MESSAGE =
  "Tu cuenta está suspendida. Tu sesión ha sido cerrada.";
