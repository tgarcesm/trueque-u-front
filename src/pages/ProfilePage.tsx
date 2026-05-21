import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getListings } from "../api/listingsService.ts";
import { getUserById, type UserProfile } from "../api/usersService.ts";
import type { Listing } from "../types/index.ts";
import { getCurrentUserId } from "../utils/auth.ts";
import { statusLabel } from "../utils/statusLabel.ts";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("No se pudo identificar al usuario.");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const [userData, allListings] = await Promise.all([
          getUserById(userId),
          getListings({ pageSize: 100 }),
        ]);
        setProfile(userData);
        setListings(allListings.filter((l) => l.sellerId === userId));
      } catch (err) {
        setProfile(null);
        setListings([]);
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el perfil",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [userId]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
          <p className="mt-1 text-sm text-white/80">
            Tu información y publicaciones en TruequeU
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : error !== "" ? (
          <p className="rounded-xl bg-red-50 p-6 text-red-600" role="alert">
            {error}
          </p>
        ) : profile === null ? (
          <p className="text-neutral-600">Perfil no disponible.</p>
        ) : (
          <>
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Información personal
              </h2>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Nombre completo
                  </dt>
                  <dd className="mt-1 text-base font-medium text-neutral-900">
                    {profile.fullName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Programa
                  </dt>
                  <dd className="mt-1 text-base font-medium text-neutral-900">
                    {profile.programName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Rating
                  </dt>
                  <dd className="mt-1 text-base font-medium text-indigo-600">
                    ⭐ {profile.rating.toFixed(1)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Mis publicaciones
                </h2>
                <span className="text-sm text-neutral-500">
                  {listings.length} publicación{listings.length !== 1 ? "es" : ""}
                </span>
              </div>

              {listings.length === 0 ? (
                <p className="rounded-xl bg-neutral-50 p-8 text-center text-neutral-500">
                  Aún no tienes publicaciones.{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/publish")}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Publicar ahora
                  </button>
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {listings.map((listing) => (
                    <li key={listing.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="flex w-full items-center gap-4 rounded-xl px-2 py-4 text-left transition hover:bg-indigo-50/60"
                      >
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt=""
                            className="h-16 w-16 flex-none rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-indigo-50 text-2xl">
                            📦
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-neutral-900">
                            {listing.title}
                          </p>
                          <p className="text-sm font-bold text-indigo-600">
                            {listing.price.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {listing.category} · {listing.condition}
                          </p>
                        </div>
                        <span
                          className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_COLORS[listing.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
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
