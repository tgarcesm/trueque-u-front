import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminListings,
  hideListing,
  showListing,
  type AdminListing,
} from "../api/adminService.ts";
import Spinner from "../components/Spinner.tsx";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { statusLabel } from "../utils/statusLabel.ts";
import {
  CARD,
  PAGE_BG,
  TABLE_HEAD,
  TABLE_ROW_EVEN,
  TABLE_ROW_ODD,
  statusBadgeClass,
} from "../utils/ui.ts";

export default function AdminListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [hidingId, setHidingId] = useState<string | null>(null);
  const [showingId, setShowingId] = useState<string | null>(null);

  const loadListings = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getAdminListings();
      setListings(data);
      if (silent) setError("");
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las publicaciones",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings(false);
  }, [loadListings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadListings(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadListings]);

  async function handleShow(listing: AdminListing) {
    setShowingId(listing.id);
    setActionMsg("");
    setError("");
    try {
      await showListing(listing.id);
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, isHidden: false } : l,
        ),
      );
      setActionMsg(`"${listing.title}" reactivada correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo reactivar la publicación",
      );
    } finally {
      setShowingId(null);
    }
  }

  async function handleHide(listing: AdminListing) {
    const reason = window.prompt("Motivo para ocultar la publicación:");
    if (!reason || reason.trim().length < 3) return;

    setHidingId(listing.id);
    setActionMsg("");
    try {
      await hideListing(listing.id, reason.trim());
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, isHidden: true } : l,
        ),
      );
      setActionMsg(`"${listing.title}" ocultada correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo ocultar la publicación",
      );
    } finally {
      setHidingId(null);
    }
  }

  return (
    <main className={`${PAGE_BG} px-4 py-8`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Publicaciones</h1>
          <p className="mt-1 text-sm text-white/80">
            Todas las publicaciones del marketplace, incluidas las ocultas
          </p>
          <Link
            to="/admin"
            className="mt-3 inline-block text-sm font-medium text-white/90 underline hover:text-white"
          >
            ← Volver al panel
          </Link>
        </section>

        {actionMsg !== "" ? (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
            {actionMsg}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="rounded-xl bg-red-50 p-6 text-red-600" role="alert">
            {error}
          </p>
        ) : listings.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-neutral-500 shadow-sm">
            No hay publicaciones registradas.
          </p>
        ) : (
          <div className={`overflow-x-auto ${CARD}`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className={`border-b border-slate-200 ${TABLE_HEAD}`}>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Visibilidad</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, index) => (
                  <tr
                    key={listing.id}
                    className={`border-b border-slate-100 transition hover:bg-indigo-50/40 ${index % 2 === 0 ? TABLE_ROW_ODD : TABLE_ROW_EVEN}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500 max-w-[140px] truncate">
                      {listing.id}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="font-medium text-indigo-600 hover:text-indigo-800 text-left"
                      >
                        {listing.title}
                      </button>
                      <p className="text-xs text-neutral-500">{listing.category}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-800">
                      {listing.price.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(listing.status)}`}
                      >
                        {statusLabel(listing.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          listing.isHidden
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {listing.isHidden ? "Oculta" : "Visible"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {listing.isHidden ? (
                          <button
                            type="button"
                            onClick={() => void handleShow(listing)}
                            disabled={showingId === listing.id}
                            className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            {showingId === listing.id ? "Reactivando..." : "Reactivar"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleHide(listing)}
                            disabled={hidingId === listing.id}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            {hidingId === listing.id ? "Ocultando..." : "Ocultar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
