import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../api/listingsService.ts";

export default function PublishPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Libros");
  const [condition, setCondition] = useState("Nuevo");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const priceNumber = Number(price);
  const isPublishDisabled =
    loading ||
    title.trim() === "" ||
    price.trim() === "" ||
    !(priceNumber > 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createListing({
        title: title.trim(),
        description,
        category,
        condition,
        price: priceNumber,
        location,
        images: [],
        status: "available",
      });
      navigate("/listings");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo publicar el anuncio",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-neutral-100 px-4 py-8">
      <div className="w-full max-w-lg space-y-4">
        <form
          className="rounded-lg bg-white p-6 shadow-lg sm:p-8"
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
        >
          <h1 className="mb-6 text-xl font-semibold text-neutral-900">
            Nueva publicación
          </h1>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="publish-title"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Título
              </label>
              <input
                id="publish-title"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="publish-description"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Descripción
              </label>
              <textarea
                id="publish-description"
                name="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-y rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="publish-category"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Categoría
              </label>
              <select
                id="publish-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              >
                <option value="Libros">Libros</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Ropa">Ropa</option>
                <option value="Deportes">Deportes</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="publish-condition"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Condición
              </label>
              <select
                id="publish-condition"
                name="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Usado - Buen estado">Usado - Buen estado</option>
                <option value="Usado - Desgastado">Usado - Desgastado</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="publish-price"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Precio (COP)
              </label>
              <input
                id="publish-price"
                type="number"
                name="price"
                min={1}
                step={1}
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="publish-location"
                className="mb-1 block text-sm font-medium text-neutral-800"
              >
                Campus / Ubicación
              </label>
              <input
                id="publish-location"
                type="text"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                disabled={loading}
              />
            </div>
          </div>

          {error !== "" ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPublishDisabled}
            className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publicar
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/listings")}
          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50"
        >
          ← Volver
        </button>
      </div>
    </main>
  );
}
