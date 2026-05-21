import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Listing } from "../types/index.ts";
import {
  getListingById,
  deleteListing,
  updateListingState,
} from "../api/listingsService.ts";
import { addFavorite } from "../api/favoritesService.ts";
import { startChat } from "../api/chatsService.ts";
import { statusLabel } from "../utils/statusLabel.ts";
import { getOwnerStateActions } from "../utils/listingStateActions.ts";
import ReportListingModal from "../components/ReportListingModal.tsx";
import { reportListing } from "../api/reportsService.ts";
import { getCurrentUserId } from "../utils/auth.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteMsg, setFavoriteMsg] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [stateLoading, setStateLoading] = useState(false);

  const currentUserId = getCurrentUserId();
  const isOwner = listing?.sellerId === currentUserId;

  const fetchListing = useCallback(
    async (silent = false) => {
      const listingId = id?.trim();
      if (!listingId) {
        setListing(null);
        if (!silent) {
          setError("");
          setLoading(false);
        }
        return;
      }

      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await getListingById(listingId);
        setListing(data);
        if (!silent) setSelectedImageIndex(0);
        if (silent) setError("");
      } catch (err) {
        if (!silent) {
          setListing(null);
          setError(
            err instanceof Error ? err.message : "No se pudo cargar la publicación",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void fetchListing(false);
  }, [fetchListing]);

  useEffect(() => {
    const listingId = id?.trim();
    if (!listingId) return;

    const intervalId = window.setInterval(() => {
      void fetchListing(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [id, fetchListing]);

  async function handleAddFavorite() {
    if (!id) return;
    setFavoriteMsg("");
    setFavoriteError("");
    try {
      await addFavorite(id);
      setFavoriteMsg("¡Agregado a favoritos!");
    } catch (err) {
      setFavoriteError(
        err instanceof Error ? err.message : "No se pudo agregar el favorito",
      );
    }
  }

  async function handleStartChat() {
    if (!id) return;
    setChatLoading(true);
    setChatError("");
    try {
      const chat = await startChat(id);
      navigate(`/chat/${chat.id}`);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : "No se pudo iniciar el chat",
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const confirm = window.confirm("¿Seguro que quieres eliminar esta publicación?");
    if (!confirm) return;
    setDeleteLoading(true);
    try {
      await deleteListing(id);
      navigate("/listings");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la publicación",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleReportSubmit(reason: string, comment: string) {
    if (!id) return;

    setReportLoading(true);
    setReportMsg("");
    setReportError("");
    try {
      await reportListing(id, reason, comment);
      setReportModalOpen(false);
      setReportMsg("Reporte enviado correctamente.");
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "No se pudo enviar el reporte",
      );
    } finally {
      setReportLoading(false);
    }
  }

  async function handleUpdateState(newState: 0 | 1 | 2) {
    if (!id || listing === null) return;
    const allowed = getOwnerStateActions(listing.status).some(
      (action) => action.targetState === newState,
    );
    if (!allowed) return;

    setError("");
    setStateLoading(true);
    try {
      await updateListingState(id, newState);
      const refreshed = await getListingById(id);
      setListing(refreshed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar el estado",
      );
    } finally {
      setStateLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {loading ? (
          <p className="text-neutral-700">Cargando...</p>
        ) : error !== "" ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : listing === null ? (
          <p className="text-neutral-700">Publicación no encontrada</p>
        ) : (
          <>
            <section aria-label="Detalle del anuncio" className="space-y-6">
              {listing.images.length > 0 ? (
                <div className="space-y-3">
                  {/* Imagen principal (cambia cuando das click) */}
                  <img
                    src={listing.images[selectedImageIndex] ?? listing.images[0]}
                    alt={listing.title}
                    className="w-full rounded-lg border border-neutral-200 object-cover shadow-sm"
                  />

                  {/* Miniaturas */}
                  {listing.images.length > 1 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {listing.images.map((url, idx) => {
                        const isActive = idx === selectedImageIndex;

                        return (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`rounded-md border p-0 transition ${
                              isActive
                                ? "border-neutral-900 ring-2 ring-neutral-300"
                                : "border-neutral-200 hover:border-neutral-400"
                            }`}
                            aria-label={`Ver imagen ${idx + 1}`}
                          >
                            <img
                              src={url}
                              alt={`${listing.title} ${idx + 1}`}
                              className="aspect-square w-full rounded-md object-cover"
                              loading="lazy"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-100 text-neutral-500"
                  role="img"
                  aria-label="Sin imagen"
                >
                  Sin imagen
                </div>
              )}

              <div className="rounded-lg bg-white p-6 shadow-md">
                <h1 className="mb-4 text-2xl font-semibold text-neutral-900">
                  {listing.title}
                </h1>
                <p className="mb-4 whitespace-pre-wrap text-neutral-700">
                  {listing.description}
                </p>
                <p className="mb-2 text-2xl font-semibold text-neutral-900">
                  {listing.price.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  })}
                </p>
                <ul className="space-y-1 text-sm text-neutral-600">
                  <li>
                    <span className="font-medium text-neutral-800">Categoría:</span>{" "}
                    {listing.category}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">Condición:</span>{" "}
                    {listing.condition}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">Estado:</span>{" "}
                    {statusLabel(listing.status)}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">Ubicación:</span>{" "}
                    {listing.location}
                  </li>
                </ul>
              </div>
            </section>

            {favoriteMsg !== "" && (
              <p className="mt-4 text-sm text-green-600" role="status">
                {favoriteMsg}
              </p>
            )}
            {favoriteError !== "" && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {favoriteError}
              </p>
            )}
            {reportMsg !== "" && (
              <p className="mt-4 text-sm text-green-600" role="status">
                {reportMsg}
              </p>
            )}
            {reportError !== "" && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {reportError}
              </p>
            )}
            {chatError !== "" && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {chatError}
              </p>
            )}

            <section
              aria-label="Acciones"
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              {!isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => void handleAddFavorite()}
                    className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Agregar a favoritos
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleStartChat()}
                    disabled={chatLoading}
                    className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {chatLoading ? "Cargando..." : "Iniciar chat"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReportError("");
                      setReportMsg("");
                      setReportModalOpen(true);
                    }}
                    disabled={reportLoading}
                    className="rounded-md border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reportar
                  </button>
                </>
              )}

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/chats?listingId=${id}`)}
                    className="rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-800 transition hover:bg-indigo-100"
                  >
                    Ver mis chats sobre esta publicación
                  </button>

                  {getOwnerStateActions(listing.status).map((action) => (
                    <button
                      key={action.targetState}
                      type="button"
                      onClick={() => void handleUpdateState(action.targetState)}
                      disabled={stateLoading}
                      className={
                        action.variant === "primary"
                          ? "rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                          : "rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                      }
                    >
                      {stateLoading ? "Actualizando..." : action.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleteLoading}
                    className="rounded-md border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleteLoading ? "Eliminando..." : "Eliminar publicación"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate("/listings")}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                ← Volver
              </button>
            </section>

            <ReportListingModal
              open={reportModalOpen}
              loading={reportLoading}
              onClose={() => setReportModalOpen(false)}
              onSubmit={handleReportSubmit}
            />
          </>
        )}
      </div>
    </main>
  );
}