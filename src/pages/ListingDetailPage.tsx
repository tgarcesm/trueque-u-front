import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Listing } from "../types/index.ts";
import { getListingById } from "../api/listingsService.ts";
import { addFavorite } from "../api/favoritesService.ts";

function statusLabel(status: Listing["status"]): string {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    default:
      return status;
  }
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListing(listingId: string) {
      setLoading(true);
      setError("");
      try {
        const data = await getListingById(listingId);
        setListing(data);
      } catch (err) {
        setListing(null);
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la publicación",
        );
      } finally {
        setLoading(false);
      }
    }

    const listingId = id?.trim();
    if (!listingId) {
      setListing(null);
      setError("");
      setLoading(false);
      return;
    }

    void fetchListing(listingId);
  }, [id]);

  async function handleAddFavorite() {
    if (!id) {
      alert("Publicación no encontrada");
      return;
    }

    try {
      await addFavorite(id);
      alert("Agregado a favoritos");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo agregar el favorito");
    }
  }

  function handleStartChat() {
    if (!id) return;
    navigate(`/chat/${id}`);
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
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full rounded-lg border border-neutral-200 object-cover shadow-sm"
                />
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
                    <span className="font-medium text-neutral-800">
                      Categoría:
                    </span>{" "}
                    {listing.category}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">
                      Condición:
                    </span>{" "}
                    {listing.condition}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">Estado:</span>{" "}
                    {statusLabel(listing.status)}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-800">
                      Ubicación:
                    </span>{" "}
                    {listing.location}
                  </li>
                </ul>
              </div>
            </section>

            <section
              aria-label="Acciones"
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <button
                type="button"
                onClick={() => void handleAddFavorite()}
                className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Agregar a favoritos
              </button>
              <button
                type="button"
                onClick={handleStartChat}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Iniciar chat
              </button>
              <button
                type="button"
                onClick={() => navigate("/listings")}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                ← Volver
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
