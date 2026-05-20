import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Listing } from "../types/index.ts";
import { getListings } from "../api/listingsService.ts";
import { statusLabel } from "../utils/statusLabel.ts";

const CATEGORY_OPTIONS = [
  "Todos",
  "Libros",
  "Electrónica",
  "Ropa",
  "Deportes",
  "Hogar",
] as const;


export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError("");
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los anuncios",
        );
      } finally {
        setLoading(false);
      }
    }
    void fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const haystack = listing.title.toLowerCase();
    const needle = search.trim().toLowerCase();
    const matchesSearch = needle === "" || haystack.includes(needle);

    const matchesCategory =
      categoryFilter === "Todos" || listing.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <section
          aria-label="Buscar publicaciones"
          className="mb-8 rounded-lg bg-white p-4 shadow-md sm:p-6"
        >
          <h1 className="mb-4 text-2xl font-semibold text-neutral-900">
            Marketplace universitario
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="listings-search"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Buscar
              </label>
              <input
                id="listings-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              />
            </div>
            <div className="w-full sm:w-56">
              <label
                htmlFor="listings-category"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Categoría
              </label>
              <select
                id="listings-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-neutral-700">Cargando...</p>
        ) : error !== "" ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <section aria-label="Listado de publicaciones">
            {filteredListings.length === 0 ? (
              <p className="rounded-lg bg-white p-6 text-neutral-700 shadow-md">
                No hay publicaciones disponibles
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <article
                    key={listing.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/listings/${listing.id}`);
                      }
                    }}
                    className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md outline-none ring-offset-2 transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-neutral-400"
                  >
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500"
                        aria-hidden
                      >
                        Sin imagen
                      </div>
                    )}
                    <div className="space-y-2 p-4">
                      <h2 className="line-clamp-2 text-lg font-semibold text-neutral-900">
                        {listing.title}
                      </h2>
                      <p className="text-xl font-semibold text-neutral-800">
                        {listing.price.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-700">
                          Categoría:
                        </span>{" "}
                        {listing.category}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-700">
                          Condición:
                        </span>{" "}
                        {listing.condition}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-700">
                          Estado:
                        </span>{" "}
                        {statusLabel(listing.status)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
