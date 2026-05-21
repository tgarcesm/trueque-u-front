import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getListings } from "../api/listingsService.ts";
import {
  getAuthenticatedUserById,
  getUserById,
  type UserProfile,
} from "../api/usersService.ts";
import type { Listing } from "../types/index.ts";
import Avatar from "../components/Avatar.tsx";
import Spinner from "../components/Spinner.tsx";
import { getCurrentUserEmail, getCurrentUserId } from "../utils/auth.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { statusLabel } from "../utils/statusLabel.ts";
import { CARD, formatCop, PAGE_BG, statusBadgeClass } from "../utils/ui.ts";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const currentUserId = getCurrentUserId();
  const userId = routeUserId?.trim() || currentUserId;
  const isOwnProfile = userId === currentUserId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const available = listings.filter((l) => l.status === "available").length;
    const sold = listings.filter((l) => l.status === "sold").length;
    return { total: listings.length, available, sold };
  }, [listings]);

  const loadProfile = useCallback(
    async (silent = false) => {
      if (!userId) {
        if (!silent) {
          setLoading(false);
          setError("No se pudo identificar al usuario.");
        }
        return;
      }

      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const fetchUser = isOwnProfile
          ? getAuthenticatedUserById(userId)
          : getUserById(userId);
        const [userData, allListings] = await Promise.all([
          fetchUser,
          getListings({ pageSize: 100 }),
        ]);
        setProfile(
          isOwnProfile && !userData.email.trim()
            ? { ...userData, email: getCurrentUserEmail() }
            : userData,
        );
        setListings(allListings.filter((l) => l.sellerId === userId));
        if (silent) setError("");
      } catch (err) {
        if (!silent) {
          setProfile(null);
          setListings([]);
          setError(
            err instanceof Error ? err.message : "No se pudo cargar el perfil",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [userId, isOwnProfile],
  );

  useEffect(() => {
    void loadProfile(false);
  }, [loadProfile]);

  useEffect(() => {
    if (!userId) return;

    const intervalId = window.setInterval(() => {
      void loadProfile(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [userId, loadProfile]);

  return (
    <main className={`${PAGE_BG} px-3 py-6 sm:px-4 sm:py-8`}>
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {profile ? (
              <Avatar
                name={profile.fullName || "Usuario"}
                size="xl"
                className="ring-4 ring-white/30"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white/20" />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {profile?.fullName?.trim() ||
                  (isOwnProfile ? "Mi perfil" : "Perfil")}
              </h1>
              {profile && profile.rating > 0 ? (
                <p className="mt-2 text-lg font-semibold text-amber-200">
                  ★ {profile.rating.toFixed(1)} de reputación
                </p>
              ) : null}
            </div>
          </div>
          {!isOwnProfile ? (
            <Link
              to="/admin"
              className="mt-4 inline-block text-sm font-medium text-white/90 underline transition hover:text-white"
            >
              ← Volver al panel
            </Link>
          ) : null}
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700" role="alert">
            {error}
          </p>
        ) : profile === null ? (
          <p className="text-slate-600">Perfil no disponible.</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <article className={`${CARD} p-5 text-center transition duration-200 hover:-translate-y-0.5`}>
                <p className="text-3xl font-extrabold text-indigo-600">{stats.total}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Publicaciones</p>
              </article>
              <article className={`${CARD} p-5 text-center transition duration-200 hover:-translate-y-0.5`}>
                <p className="text-3xl font-extrabold text-emerald-600">{stats.available}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Disponibles</p>
              </article>
              <article className={`${CARD} p-5 text-center transition duration-200 hover:-translate-y-0.5`}>
                <p className="text-3xl font-extrabold text-slate-700">{stats.sold}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Vendidas</p>
              </article>
            </section>

            <section className={`${CARD} p-6`}>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                {isOwnProfile ? "Mi información" : "Información"}
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.fullName?.trim() || "—"}
                  </dd>
                </div>
                {isOwnProfile ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Correo
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {profile.email?.trim() || "—"}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Programa
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.programName?.trim() || "—"}
                  </dd>
                </div>
                {!isOwnProfile ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          profile.isSuspended
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {profile.isSuspended ? "Cuenta suspendida" : "Cuenta activa"}
                      </span>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className={`${CARD} p-6`}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {isOwnProfile ? "Mis publicaciones" : "Publicaciones"}
                </h2>
                <span className="text-sm font-medium text-slate-500">
                  {listings.length} total
                </span>
              </div>

              {listings.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                  {isOwnProfile ? (
                    <>
                      Aún no tienes publicaciones.{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/publish")}
                        className="font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Publicar ahora
                      </button>
                    </>
                  ) : (
                    "Este usuario no tiene publicaciones visibles."
                  )}
                </p>
              ) : (
                <ul className="space-y-3">
                  {listings.map((listing) => (
                    <li key={listing.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 p-3 text-left transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md"
                      >
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt=""
                            className="h-16 w-16 flex-none rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                            📦
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-slate-900">
                            {listing.title}
                          </p>
                          <p className="text-sm font-extrabold text-indigo-600">
                            {formatCop(listing.price)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {listing.category} · {listing.condition}
                          </p>
                        </div>
                        <span
                          className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(listing.status)}`}
                        >
                          {statusLabel(listing.status)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
