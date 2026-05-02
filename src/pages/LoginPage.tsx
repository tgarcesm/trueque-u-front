import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authService.ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSubmitDisabled =
    loading || email.trim() === "" || password === "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-12">
      <form
        className="w-full max-w-[400px] rounded-lg bg-white p-8 shadow-md"
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className="mb-6 text-center text-xl font-semibold text-neutral-900">
          Iniciar sesión
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              disabled={loading}
            />
          </div>
        </div>

        {error !== "" ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿No tienes cuenta?{" "}
          <Link
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            to="/register"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </main>
  );
}
