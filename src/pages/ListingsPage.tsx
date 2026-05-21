import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Listing } from "../types/index.ts";
import {
  CATEGORY_IDS,
  getListings,
  type ListingsQueryParams,
} from "../api/listingsService.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";
import { statusLabel } from "../utils/statusLabel.ts";

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

const STATUS_COLORS: Record<string, string> = {
  "available": "bg-green-100 text-green-700",
  "reserved": "bg-yellow-100 text-yellow-700",
  "sold": "bg-red-100 text-red-700",
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
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Hero banner */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg sm:p-8">
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : error !== "" ? (
          <p className="rounded-xl bg-red-50 p-6 text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <section aria-label="Listado de publicaciones">
            {listings.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-neutral-500 shadow-sm">
                No hay publicaciones disponibles
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-neutral-500">
                  {listings.length} publicación{listings.length !== 1 ? "es" : ""} encontrada{listings.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm outline-none ring-offset-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <div className="relative overflow-hidden">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex aspect-[4/3] w-full items-center justify-center bg-indigo-50 text-4xl">
                            {CATEGORY_EMOJI[listing.category] ?? "📦"}
                          </div>
                        )}
                        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[listing.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {statusLabel(listing.status)}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h2 className="line-clamp-2 text-base font-semibold text-neutral-900 leading-snug">
                            {listing.title}
                          </h2>
                        </div>
                        <p className="mb-3 text-xl font-bold text-indigo-600">
                          {listing.price.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {CATEGORY_EMOJI[listing.category]} {listing.category}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
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