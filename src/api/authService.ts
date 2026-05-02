import type { User } from "../types/index.ts";
import users from "../mocks/users.json";

export async function login(email: string, password: string): Promise<User> {
  try {
    void password;
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    return user as User;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Credenciales inválidas");
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  program: string,
): Promise<User> {
  try {
    void password;
    const user: User = {
      id: "99",
      name,
      email,
      program,
      rating: 5,
    };
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo registrar el usuario");
  }
}
