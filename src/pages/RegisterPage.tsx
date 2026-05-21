import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthField, { AUTH_INPUT_CLASS, AuthIcons } from "../components/AuthField.tsx";
import { register } from "../api/authService.ts";
import { isAdmin } from "../utils/auth.ts";
import { BTN_PRIMARY } from "../utils/ui.ts";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-600 px-4 py-12">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/25">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M8 10h5M13 10l-2-2M13 10l-2 2" />
              <path d="M16 14h-5M11 14l2 2M11 14l2-2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">TruequeU</h1>
          <p className="mt-2 text-sm text-indigo-100">
            El marketplace universitario
          </p>
        </div>

        <form
          className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur-sm"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="mb-6 text-xl font-bold text-slate-900">Crear cuenta</h2>

          <div className="space-y-4">
            <AuthField id="register-name" label="Nombre completo" icon={AuthIcons.user}>
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={loading}
                placeholder="Tu nombre"
              />
            </AuthField>

            <AuthField id="register-email" label="Correo electrónico" icon={AuthIcons.email}>
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={loading}
                placeholder="tu@email.com"
              />
            </AuthField>

            <AuthField id="register-password" label="Contraseña" icon={AuthIcons.lock}>
              <input
                id="register-password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={loading}
                placeholder="••••••••"
              />
            </AuthField>

            <AuthField
              id="register-program"
              label="Programa académico"
              icon={AuthIcons.school}
            >
              <input
                id="register-program"
                type="text"
                name="programName"
                autoComplete="organization"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={loading}
                placeholder="Ingeniería de Sistemas"
              />
            </AuthField>
          </div>

          {error !== "" && (
            <div
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`mt-6 w-full ${BTN_PRIMARY}`}
          >
            {loading ? "Cargando..." : "Crear cuenta →"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
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
