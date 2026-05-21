import type { User } from "../types/index.ts";
import { setToken } from "../utils/auth.ts";
import { API_URL } from "./config.ts";

export async function login(email: string, password: string): Promise<User> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciales inválidas");
    const data = await res.json();
    setToken(data.token);
    return data as User;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Credenciales inválidas");
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  programName: string,
): Promise<User> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        email,
        password,
        programName: programName.trim(),
      }),
    });
    if (!res.ok) throw new Error("No se pudo registrar el usuario");
    const data = await res.json();
    const token =
      (data as { token?: string; Token?: string }).token ??
      (data as { token?: string; Token?: string }).Token;
    if (token) {
      setToken(token);
      return data as User;
    }
    return login(email, password);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No se pudo registrar el usuario");
  }
}