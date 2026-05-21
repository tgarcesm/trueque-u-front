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
import { getUserById, type UserProfile } from "../api/usersService.ts";
import Avatar from "../components/Avatar.tsx";
import Spinner from "../components/Spinner.tsx";
import { getCurrentUserId, isAdmin } from "../utils/auth.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  formatCop,
  PAGE_BG,
  statusBadgeClass,
} from "../utils/ui.ts";

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
  const [seller, setSeller] = useState<UserProfile | null>(null);

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
        const data = await getListingById(listingId, { useAuth: isAdmin() });
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
    if (listing && selectedImageIndex >= listing.images.length) {
      setSelectedImageIndex(0);
    }
  }, [listing, selectedImageIndex]);

  useEffect(() => {
    const listingId = id?.trim();
    if (!listingId) return;

    const intervalId = window.setInterval(() => {
      void fetchListing(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [id, fetchListing]);

  useEffect(() => {
    const sellerId = listing?.sellerId?.trim();
    if (!sellerId) {
      setSeller(null);
      return;
    }
    void getUserById(sellerId)
      .then(setSeller)
      .catch(() => setSeller(null));
  }, [listing?.sellerId]);

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
      const refreshed = await getListingById(id, { useAuth: isAdmin() });
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
    <main className={`${PAGE_BG} px-3 py-6 sm:px-4 sm:py-8`}>
      <div className="mx-auto w-full max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700" role="alert">
            {error}
          </p>
        ) : listing === null ? (
          <p className="text-slate-600">Publicación no encontrada</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <section aria-label="Galería" className="space-y-4 lg:sticky lg:top-24">
              {listing.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg sm:h-72 md:h-80">
                    <img
                      src={
                        listing.images[selectedImageIndex] ?? listing.images[0]
                      }
                      alt={listing.title}
                      className="h-56 w-full object-cover sm:h-72 md:h-80"
                    />
                  </div>

                  {listing.images.length > 1 ? (
                    <div
                      className={
                        listing.images.length > 4
                          ? "flex gap-2 overflow-x-auto pb-1"
                          : "flex flex-wrap gap-2"
                      }
                    >
                      {listing.images.map((url, idx) => {
                        const isActive = idx === selectedImageIndex;

                        return (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 p-0 transition duration-200 ${
                              isActive
                                ? "border-indigo-500 ring-2 ring-indigo-200"
                                : "border-slate-200 hover:border-indigo-300"
                            }`}
                            aria-label={`Ver imagen ${idx + 1}`}
                            aria-current={isActive ? "true" : undefined}
                          >
                            <img
                              src={url}
                              alt={`${listing.title} ${idx + 1}`}
                              className="h-20 w-20 object-cover"
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
                  className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-slate-500 sm:h-72 md:h-80"
                  role="img"
                  aria-label="Sin imagen"
                >
                  Sin imagen
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className={`${CARD} p-4 sm:p-6 md:p-8`}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                    {listing.title}
                  </h1>
                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(listing.status)}`}
                  >
                    {statusLabel(listing.status)}
                  </span>
                </div>
                <p className="mb-6 text-2xl font-extrabold text-indigo-600 sm:text-3xl">
                  {formatCop(listing.price)}
                </p>
                <p className="mb-6 whitespace-pre-wrap leading-relaxed text-slate-600">
                  {listing.description}
                </p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Categoría
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {listing.category}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Condición
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {listing.condition}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Ubicación
                    </dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {listing.location}
                    </dd>
                  </div>
                </dl>
              </section>

              {listing.sellerId ? (
                <section className={`${CARD} p-4 sm:p-5`}>
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Vendedor</h2>
                  {seller ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar name={seller.fullName || "Usuario"} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-slate-900">
                          {seller.fullName || "Usuario"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {seller.programName || "Programa no indicado"}
                        </p>
                      </div>
                      {!isOwner ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${seller.id}`)}
                          className="w-full shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 sm:w-auto"
                        >
                          Ver perfil
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Cargando vendedor…</p>
                  )}
                </section>
              ) : null}

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
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&_button]:w-full sm:[&_button]:w-auto"
              >
                {!isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleAddFavorite()}
                      className={BTN_PRIMARY}
                    >
                      ♥ Agregar a favoritos
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleStartChat()}
                      disabled={chatLoading}
                      className={`${BTN_SECONDARY} min-w-[10rem]`}
                    >
                      {chatLoading ? "Cargando..." : "💬 Iniciar chat"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReportError("");
                        setReportMsg("");
                        setReportModalOpen(true);
                      }}
                      disabled={reportLoading}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-100 disabled:opacity-50"
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
                      className={`${BTN_SECONDARY} border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100`}
                    >
                      Ver mis chats
                    </button>

                    {getOwnerStateActions(listing.status).map((action) => (
                      <button
                        key={action.targetState}
                        type="button"
                        onClick={() => void handleUpdateState(action.targetState)}
                        disabled={stateLoading}
                        className={
                          action.variant === "primary"
                            ? BTN_PRIMARY
                            : BTN_SECONDARY
                        }
                      >
                        {stateLoading ? "Actualizando..." : action.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      disabled={deleteLoading}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleteLoading ? "Eliminando..." : "Eliminar publicación"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/listings")}
                  className={BTN_SECONDARY}
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}