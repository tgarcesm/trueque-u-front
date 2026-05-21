import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Listing } from "../types/index.ts";
import {
  CATEGORY_IDS,
  getListings,
  type ListingsQueryParams,
} from "../api/listingsService.ts";
import Spinner from "../components/Spinner.tsx";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { statusLabel } from "../utils/statusLabel.ts";
import { formatCop, PAGE_BG, statusBadgeClass } from "../utils/ui.ts";

const CATEGORY_OPTIONS = [
  "Todos",
  "Libros",
  "Electrónica",
  "Ropa",
  "Deportes",
  "Hogar",
] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  "Libros": "📚",
  "Electrónica": "💻",
  "Ropa": "👕",
  "Deportes": "⚽",
  "Hogar": "🏠",
};

const FILTER_SELECT_CLASS =
  "rounded-xl border-0 bg-white/20 px-4 py-2.5 text-white outline-none backdrop-blur-sm focus:bg-white/30 focus:ring-2 focus:ring-white/50";

const FILTER_INPUT_CLASS =
  "w-full rounded-xl border-0 bg-white/20 px-4 py-2.5 text-white placeholder-white/60 outline-none backdrop-blur-sm focus:bg-white/30 focus:ring-2 focus:ring-white/50 sm:w-36";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchListings = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const min = minPrice.trim() !== "" ? Number(minPrice) : undefined;
        const max = maxPrice.trim() !== "" ? Number(maxPrice) : undefined;
        const filters: ListingsQueryParams = {
          keyword: debouncedSearch.trim() || undefined,
          categoryId:
            categoryFilter !== "Todos" ? CATEGORY_IDS[categoryFilter] : undefined,
          minPrice: min != null && !Number.isNaN(min) ? min : undefined,
          maxPrice: max != null && !Number.isNaN(max) ? max : undefined,
          condition:
            conditionFilter !== "" ? Number(conditionFilter) : undefined,
          state: stateFilter !== "" ? Number(stateFilter) : undefined,
          pageSize: 50,
        };
        const data = await getListings(filters);
        setListings(data);
        if (silent) setError("");
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los anuncios",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      debouncedSearch,
      categoryFilter,
      minPrice,
      maxPrice,
      conditionFilter,
      stateFilter,
    ],
  );

  useEffect(() => {
    void fetchListings(false);
  }, [fetchListings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchListings(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchListings]);

  return (
    <main className={`${PAGE_BG} px-4 py-8`}>
      <div className="mx-auto max-w-6xl">

        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
          <h1 className="mb-1 text-3xl font-bold tracking-tight">
            Marketplace universitario 🎓
          </h1>
          <p className="mb-6 text-white/80 text-sm">
            Compra, vende e intercambia con otros estudiantes
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="listings-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Buscar por título..."
                className="flex-1 rounded-xl border-0 bg-white/20 px-4 py-2.5 text-white placeholder-white/60 outline-none backdrop-blur-sm focus:bg-white/30 focus:ring-2 focus:ring-white/50"
              />
              <select
                id="listings-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${FILTER_SELECT_CLASS} sm:w-48`}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="text-neutral-900">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <input
                id="listings-min-price"
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Precio mín."
                className={FILTER_INPUT_CLASS}
              />
              <input
                id="listings-max-price"
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Precio máx."
                className={FILTER_INPUT_CLASS}
              />
              <select
                id="listings-condition"
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className={`${FILTER_SELECT_CLASS} sm:w-44`}
              >
                <option value="" className="text-neutral-900">
                  Condición: todas
                </option>
                <option value="0" className="text-neutral-900">
                  Nuevo
                </option>
                <option value="1" className="text-neutral-900">
                  Como nuevo
                </option>
                <option value="2" className="text-neutral-900">
                  Bueno
                </option>
                <option value="3" className="text-neutral-900">
                  Regular
                </option>
                <option value="4" className="text-neutral-900">
                  Malo
                </option>
              </select>
              <select
                id="listings-state"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className={`${FILTER_SELECT_CLASS} sm:w-44`}
              >
                <option value="" className="text-neutral-900">
                  Estado: todos
                </option>
                <option value="0" className="text-neutral-900">
                  Disponible
                </option>
                <option value="1" className="text-neutral-900">
                  Reservado
                </option>
                <option value="2" className="text-neutral-900">
                  Vendido
                </option>
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : error !== "" ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <section aria-label="Listado de publicaciones">
            {listings.length === 0 ? (
              <p className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-lg">
                No hay publicaciones disponibles
              </p>
            ) : (
              <>
                <p className="mb-5 text-sm font-medium text-slate-500">
                  {listings.length} publicación{listings.length !== 1 ? "es" : ""}{" "}
                  encontrada{listings.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
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
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 outline-none transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-200/40 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <div className="relative h-52 overflow-hidden bg-slate-100">
                        {listing.images.length > 0 ? (
                          <>
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <p className="absolute bottom-3 left-3 right-3 translate-y-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 line-clamp-2">
                              Ver detalle →
                            </p>
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-5xl">
                            {CATEGORY_EMOJI[listing.category] ?? "📦"}
                          </div>
                        )}
                        <span
                          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${statusBadgeClass(listing.status)}`}
                        >
                          {statusLabel(listing.status)}
                        </span>
                      </div>

                      <div className="p-5">
                        <h2 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-slate-900">
                          {listing.title}
                        </h2>
                        <p className="mb-4 text-2xl font-extrabold tracking-tight text-indigo-600">
                          {formatCop(listing.price)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {CATEGORY_EMOJI[listing.category]} {listing.category}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {listing.condition}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}