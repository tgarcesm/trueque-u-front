import { useEffect, useState } from "react";
import { suspendUser, unsuspendUser } from "../api/adminService.ts";
import { getUserById } from "../api/usersService.ts";

const DEFAULT_SUSPEND_REASON = "Suspensión por reporte de moderación";

type ReportUserActionProps = {
  userId: string;
  reportReason: string;
  reportComment?: string;
};

function buildSuspendReason(reason: string, comment?: string): string {
  const parts = [reason.trim(), comment?.trim() ?? ""].filter((p) => p.length > 0);
  return parts.join(" — ") || DEFAULT_SUSPEND_REASON;
}

export default function ReportUserAction({
  userId,
  reportReason,
  reportComment = "",
}: ReportUserActionProps) {
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setStatusLoading(true);
      setError("");
      try {
        const user = await getUserById(userId);
        if (!cancelled) setIsSuspended(user.isSuspended);
      } catch (err) {
        if (!cancelled) {
          setIsSuspended(null);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo consultar el estado del usuario",
          );
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggle() {
    if (isSuspended == null) return;

    setActionLoading(true);
    setError("");
    try {
      if (isSuspended) {
        await unsuspendUser(userId);
        setIsSuspended(false);
      } else {
        await suspendUser(
          userId,
          buildSuspendReason(reportReason, reportComment),
        );
        setIsSuspended(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo completar la acción",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (statusLoading) {
    return <span className="text-xs text-neutral-400">Consultando…</span>;
  }

  if (isSuspended == null) {
    return (
      <span className="text-xs text-red-600" role="alert">
        {error || "Estado no disponible"}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={actionLoading}
        className={
          isSuspended
            ? "rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:opacity-50"
            : "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
        }
      >
        {actionLoading
          ? "Procesando…"
          : isSuspended
            ? "Reactivar"
            : "Suspender"}
      </button>
      {error !== "" ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
