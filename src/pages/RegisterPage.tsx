import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authService.ts";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [program, setProgram] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSubmitDisabled =
    loading ||
    name.trim() === "" ||
    email.trim() === "" ||
    password === "" ||
    program.trim() === "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, program);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
          Crear cuenta
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="register-name"
              className="mb-1 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-1 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-1 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none ring-offset-2 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="register-program"
              className="mb-1 block text-sm font-medium text-neutral-800"
            >
              Programa académico
            </label>
            <input
              id="register-program"
              type="text"
              name="program"
              autoComplete="organization"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
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
          {loading ? "Cargando..." : "Crear cuenta"}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            to="/login"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}