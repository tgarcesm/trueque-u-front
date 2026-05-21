import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authService.ts";
import { isAdmin } from "../utils/auth.ts";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSubmitDisabled =
    loading ||
    name.trim() === "" ||
    email.trim() === "" ||
    password === "" ||
    programName.trim() === "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, programName);
      navigate(isAdmin() ? "/admin" : "/listings", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
            Crear cuenta
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                disabled={loading}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Correo electrónico
              </label>
              <input
                id="register-email"
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
                htmlFor="register-password"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="register-program"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Programa académico
              </label>
              <input
                id="register-program"
                type="text"
                name="programName"
                autoComplete="organization"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                disabled={loading}
                placeholder="Ingeniería de Sistemas"
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
            {loading ? "Cargando..." : "Crear cuenta →"}
          </button>

          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-700"
              to="/login"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}