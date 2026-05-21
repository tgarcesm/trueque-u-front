import { type FormEvent, useEffect, useState } from "react";

type ReportListingModalProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => Promise<void>;
};

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-neutral-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const MIN_LENGTH = 3;

export default function ReportListingModal({
  open,
  loading,
  onClose,
  onSubmit,
}: ReportListingModalProps) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setComment("");
      setFormError("");
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedReason = reason.trim();
    const trimmedComment = comment.trim();

    if (trimmedReason.length < MIN_LENGTH) {
      setFormError("El motivo debe tener al menos 3 caracteres.");
      return;
    }
    if (trimmedComment.length < MIN_LENGTH) {
      setFormError("El comentario debe tener al menos 3 caracteres.");
      return;
    }

    setFormError("");
    await onSubmit(trimmedReason, trimmedComment);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-listing-title"
      onClick={onClose}
    >
      <form
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
      >
        <h2
          id="report-listing-title"
          className="text-lg font-semibold text-neutral-900"
        >
          Reportar publicación
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Indica el motivo y un comentario (mínimo 3 caracteres cada uno).
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="report-reason"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Motivo
            </label>
            <input
              id="report-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Contenido inapropiado"
              className={INPUT_CLASS}
              disabled={loading}
              minLength={MIN_LENGTH}
              required
            />
          </div>

          <div>
            <label
              htmlFor="report-comment"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Comentario
            </label>
            <textarea
              id="report-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe el problema con más detalle"
              className={`${INPUT_CLASS} resize-y`}
              disabled={loading}
              minLength={MIN_LENGTH}
              required
            />
          </div>
        </div>

        {formError !== "" ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {formError}
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
            disabled={
              loading ||
              reason.trim().length < MIN_LENGTH ||
              comment.trim().length < MIN_LENGTH
            }
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar reporte"}
          </button>
        </div>
      </form>
    </div>
  );
}
