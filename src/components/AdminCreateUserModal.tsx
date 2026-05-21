import { type FormEvent, useEffect, useState } from "react";
import type { CreateAdminUserPayload } from "../api/adminService.ts";

type AdminCreateUserModalProps = {
  open: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: CreateAdminUserPayload) => Promise<void>;
};

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const emptyForm = (): CreateAdminUserPayload => ({
  fullName: "",
  email: "",
  password: "",
  programName: "",
  role: "User",
});

export default function AdminCreateUserModal({
  open,
  loading,
  error = "",
  onClose,
  onSubmit,
}: AdminCreateUserModalProps) {
  const [form, setForm] = useState<CreateAdminUserPayload>(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setFormError("");
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const password = form.password;
    const programName = form.programName.trim();

    if (!fullName || !email || !password || !programName) {
      setFormError("Completa todos los campos.");
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setFormError("");
    await onSubmit({
      fullName,
      email,
      password,
      programName,
      role: form.role,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-modal-title"
      onClick={onClose}
    >
      <form
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
      >
        <h2
          id="create-user-modal-title"
          className="text-lg font-semibold text-neutral-900"
        >
          Crear usuario
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Registra un nuevo usuario en la plataforma
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="create-user-fullname"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Nombre completo
            </label>
            <input
              id="create-user-fullname"
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              className={INPUT_CLASS}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="create-user-email"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="create-user-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className={INPUT_CLASS}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="create-user-password"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Contraseña
            </label>
            <input
              id="create-user-password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className={INPUT_CLASS}
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <div>
            <label
              htmlFor="create-user-program"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Programa académico
            </label>
            <input
              id="create-user-program"
              type="text"
              value={form.programName}
              onChange={(e) =>
                setForm((f) => ({ ...f, programName: e.target.value }))
              }
              className={INPUT_CLASS}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="create-user-role"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Rol
            </label>
            <select
              id="create-user-role"
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as CreateAdminUserPayload["role"],
                }))
              }
              className={INPUT_CLASS}
              disabled={loading}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {formError !== "" || error !== "" ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {formError || error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
