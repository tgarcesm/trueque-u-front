import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../api/listingsService.ts";
import { ApiValidationError } from "../utils/apiErrors.ts";
import { PAGE_BG } from "../utils/ui.ts";

export default function PublishPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Libros");
  const [condition, setCondition] = useState("Nuevo");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const priceNumber = Number(price);
  const priceError = (() => {
    const trimmed = price.trim();
    if (trimmed === "") return "";
    if (Number.isNaN(priceNumber)) return "Ingresa un precio válido.";
    if (priceNumber < 0) return "El precio no puede ser negativo.";
    if (priceNumber === 0) return "El precio debe ser mayor a 0.";
    return "";
  })();
  const isPublishDisabled =
    loading ||
    title.trim() === "" ||
    price.trim() === "" ||
    priceError !== "" ||
    !(priceNumber > 0);

    const CATEGORY_IDS: Record<string, string> = {
  "Electrónica": "bbbbbbbb-bbbb-bbbb-bbbb-000000000001",
  "Hogar":       "bbbbbbbb-bbbb-bbbb-bbbb-000000000002",
  "Ropa":        "bbbbbbbb-bbbb-bbbb-bbbb-000000000003",
  "Deportes":    "bbbbbbbb-bbbb-bbbb-bbbb-000000000004",
  "Libros":      "bbbbbbbb-bbbb-bbbb-bbbb-000000000005",
};

const CONDITION_IDS: Record<string, number> = {
  "Nuevo": 0,
  "Usado - Buen estado": 1,
  "Usado - Desgastado": 2,
};

  function isValidHttpUrl(url: string) {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();

    if (!isValidHttpUrl(url)) {
      setErrorMessages(["La URL debe empezar por http:// o https://"]);
      return;
    }
    if (imageUrls.includes(url)) {
      setErrorMessages(["Esa imagen ya fue agregada."]);
      return;
    }

    setImageUrls((prev) => [...prev, url]);
    setImageUrlInput("");
    setErrorMessages([]);
  }

  function removeImageUrl(url: string) {
    setImageUrls((prev) => prev.filter((x) => x !== url));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setErrorMessages([]);
  if (priceError !== "") return;
  if (imageUrls.length < 3) {
    setErrorMessages(["Debes agregar al menos 3 imágenes para publicar."]);
    return;
  }
  setLoading(true);
  try {
    await createListing({
      title: title.trim(),
      description: description.trim(),
      categoryId: CATEGORY_IDS[category] ?? CATEGORY_IDS["Libros"],
      condition: CONDITION_IDS[condition] ?? 0,
      price: priceNumber,
      location: location.trim(),
      imageUrls,
    });
    navigate("/listings");
  } catch (err) {
    if (err instanceof ApiValidationError) {
      setErrorMessages(err.messages);
    } else {
      setErrorMessages([
        err instanceof Error ? err.message : "No se pudo publicar el anuncio",
      ]);
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <main className={`flex min-h-screen justify-center ${PAGE_BG} px-4 py-8`}>
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
                <option value="Hogar">Hogar</option>
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
                min={0}
                step={1}
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={priceError !== ""}
                aria-describedby={priceError !== "" ? "publish-price-error" : undefined}
                className={`w-full rounded-md border px-3 py-2 text-neutral-900 shadow-sm outline-none focus:ring-2 ${
                  priceError !== ""
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-neutral-300 focus:border-neutral-400 focus:ring-neutral-300"
                }`}
                disabled={loading}
              />
              {priceError !== "" ? (
                <p
                  id="publish-price-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {priceError}
                </p>
              ) : null}
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
                        <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Imágenes (links) — mínimo 3
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={loading || imageUrlInput.trim() === ""}
                  className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>

              <p className="mt-2 text-xs text-neutral-600">
                Agregadas: {imageUrls.length}/3
              </p>

              {imageUrls.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {imageUrls.map((url) => (
                    <li
                      key={url}
                      className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-2"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={url}
                          alt="preview"
                          className="h-10 w-10 flex-none rounded object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <span className="truncate text-xs text-neutral-800">{url}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImageUrl(url)}
                        className="flex-none rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 hover:bg-neutral-100"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {imageUrls.length > 0 && imageUrls.length < 3 ? (
                <p className="mt-2 text-sm text-red-600">
                  Debes agregar al menos 3 imágenes para publicar.
                </p>
              ) : null}
            </div>
          </div>

          {errorMessages.length > 0 ? (
            <div
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {errorMessages.length === 1 ? (
                <p>{errorMessages[0]}</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5">
                  {errorMessages.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
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
