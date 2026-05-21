import { useEffect, useState } from "react";
import {
  getAdminListingById,
  hideListing,
  showListing,
} from "../api/adminService.ts";

const DEFAULT_HIDE_REASON = "Ocultación por reporte de moderación";

type ReportListingActionProps = {
  listingId: string;
  reportReason: string;
  reportComment?: string;
};

function buildHideReason(reason: string, comment?: string): string {
  const parts = [reason.trim(), comment?.trim() ?? ""].filter((p) => p.length > 0);
  return parts.join(" — ") || DEFAULT_HIDE_REASON;
}

export default function ReportListingAction({
  listingId,
  reportReason,
  reportComment = "",
}: ReportListingActionProps) {
  const [isHidden, setIsHidden] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setStatusLoading(true);
      setError("");
      try {
        const listing = await getAdminListingById(listingId);
        if (!cancelled) {
          if (listing == null) {
            setIsHidden(null);
            setError("Publicación no encontrada");
          } else {
            setIsHidden(listing.isHidden);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setIsHidden(null);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo consultar la publicación",
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
  }, [listingId]);

  async function handleToggle() {
    if (isHidden == null) return;

    setActionLoading(true);
    setError("");
    try {
      if (isHidden) {
        await showListing(listingId);
        setIsHidden(false);
      } else {
        await hideListing(
          listingId,
          buildHideReason(reportReason, reportComment),
        );
        setIsHidden(true);
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

  if (isHidden == null) {
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
          isHidden
            ? "rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:opacity-50"
            : "rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        }
      >
        {actionLoading
          ? "Procesando…"
          : isHidden
            ? "Reactivar"
            : "Ocultar"}
      </button>
      {error !== "" ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
