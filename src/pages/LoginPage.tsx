import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authService.ts";
import { isAdmin } from "../utils/auth.ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSubmitDisabled = loading || email.trim() === "" || password === "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(isAdmin() ? "/admin" : "/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🔄</span>
          <h1 className="mt-2 text-2xl font-bold text-indigo-700">TruequeU</h1>
          <p className="mt-1 text-sm text-neutral-500">El marketplace universitario</p>
        </div>

        <form
          className="rounded-2xl bg-white p-8 shadow-lg"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="mb-6 text-xl font-semibold text-neutral-900">
            Iniciar sesión
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                disabled={loading}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                disabled={loading}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error !== "" && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition enabled:hover:from-indigo-700 enabled:hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión →"}
          </button>

          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿No tienes cuenta?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-700"
              to="/register"
            >
              Regístrate gratis
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}