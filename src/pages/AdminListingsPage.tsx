import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminListings, hideListing, type AdminListing } from "../api/adminService.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { statusLabel } from "../utils/statusLabel.ts";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-red-100 text-red-700",
};

export default function AdminListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [hidingId, setHidingId] = useState<string | null>(null);

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
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg sm:p-8">
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
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
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-600">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Visibilidad</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-neutral-100 last:border-0"
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
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_COLORS[listing.status] ?? "bg-gray-100 text-gray-700"
                        }`}
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
                      {!listing.isHidden ? (
                        <button
                          type="button"
                          onClick={() => void handleHide(listing)}
                          disabled={hidingId === listing.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {hidingId === listing.id ? "Ocultando..." : "Ocultar"}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
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
