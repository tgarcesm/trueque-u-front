import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Favorite } from "../types/index.ts";
import { getFavorites, removeFavorite } from "../api/favoritesService.ts";
import Spinner from "../components/Spinner.tsx";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { BTN_PRIMARY, BTN_SECONDARY, CARD, PAGE_BG } from "../utils/ui.ts";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getFavorites();
      setFavorites(data);
      if (silent) setError("");
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los favoritos",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFavorites(false);
  }, [fetchFavorites]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchFavorites(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchFavorites]);

  async function handleRemove(favorite: Favorite) {
    try {
      await removeFavorite(favorite.listingId);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el favorito",
      );
    }
  }

  return (
    <main className={`${PAGE_BG} px-4 py-8`}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Favoritos</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <section aria-label="Lista de favoritos">
            {favorites.length === 0 ? (
              <p className="text-neutral-700">No tienes favoritos aún</p>
            ) : (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <article
                    key={favorite.id}
                    className={`${CARD} p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                  >
                    <p className="text-lg font-semibold text-neutral-900">
                      {favorite.title}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/listings/${favorite.listingId}`)
                        }
                        className={BTN_PRIMARY}
                      >
                        Ver publicación
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(favorite)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={() => navigate("/listings")}
          className={`${BTN_SECONDARY} w-full sm:w-auto`}
        >
          ← Volver
        </button>
      </div>
    </main>
  );
}
