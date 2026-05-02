import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Favorite } from "../types/index.ts";
import { getFavorites, removeFavorite } from "../api/favoritesService.ts";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError("");
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los favoritos",
        );
      } finally {
        setLoading(false);
      }
    }
    void fetchFavorites();
  }, []);

  async function handleRemove(favorite: Favorite) {
    try {
      await removeFavorite(favorite.id);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el favorito",
      );
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Favoritos</h1>

        {loading ? (
          <p className="text-neutral-700">Cargando...</p>
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
                    className="rounded-lg bg-white p-5 shadow-md"
                  >
                    <p className="text-xs text-neutral-500">
                      Publicación:{" "}
                      <span className="font-mono text-neutral-700">
                        {favorite.listingId}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      ID favorito:{" "}
                      <span className="font-mono text-neutral-800">
                        {favorite.id}
                      </span>
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/listings/${favorite.listingId}`)
                        }
                        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                      >
                        Ver publicación
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(favorite)}
                        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
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
          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 sm:w-auto"
        >
          ← Volver
        </button>
      </div>
    </main>
  );
}
