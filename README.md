# TruequeU — Frontend

Integrantes:
- Tomas Garces  
- David Orozco  

---

Marketplace pensado para la vida universitaria: un lugar donde los estudiantes pueden comprar, vender o intercambiar cosas (libros, electrónica, ropa de club, lo que necesiten) sin complicarse.

## Cómo correr el proyecto

En la carpeta raíz del repo:

```bash
npm install
npm run dev
```

Después abrí **http://localhost:5173** en el navegador. Listo para ver la app.

## Tecnologías

- **Vite** — tooling y servidor de desarrollo
- **React** — interfaz
- **TypeScript** — tipado
- **Tailwind CSS v3** — estilos utility-first
- **React Router DOM** — rutas y navegación

## Vistas disponibles

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/listings` | Listado de publicaciones (home del marketplace después del login conceptual) |
| `/listings/:id` | Detalle de una publicación |
| `/publish` | Formulario para publicar un artículo |
| `/favorites` | Lista de favoritos guardados |
| `/chat/:id` | Conversación de chat asociada a un id de chat |

## Cómo probar cada vista

Al correr `npm run dev` la app abre directamente en `/listings`. Para ver el resto:

| Vista | Qué hacer |
|-------|-----------|
| **Login** | Ir a `http://localhost:5173/login`. Usar cualquier email que esté en `src/mocks/users.json` (por ejemplo `carlos.ruiz@universidad.edu`). La contraseña puede ser cualquier cosa (el mock no la valida). |
| **Register** | Ir a `http://localhost:5173/register`. |
| **Detalle de publicación** | Desde `/listings`, hacer click en cualquier tarjeta. O ir directo a `http://localhost:5173/listings/1`. |
| **Chat** | Ir a `http://localhost:5173/chat/chat-1`. Los mensajes del mock aparecen con burbujas (azul = tú, gris = el otro). Se pueden enviar mensajes nuevos (solo persisten mientras no recargues). |
| **Favoritos** | Ir a `http://localhost:5173/favorites`. Aparecen los 3 favoritos del mock. El botón "Eliminar" los quita del estado local. |
| **Publicar** | Ir a `http://localhost:5173/publish` o click en "Publicar" en la navbar. Completar título y precio mínimo para habilitar el botón. |

## Datos mockeados

Por ahora todo lo que ves viene de JSON en **`src/mocks/`** (`listings.json`, `users.json`, `favorites.json`, `chats.json`). Son datos de ejemplo para armar pantallas sin depender del servidor.

Los módulos en **`src/api/`** ya tienen forma de funciones async (login, listings, favoritos, mensajes): el día de mañana reemplazás la lectura de mocks por llamadas HTTP reales sin rehacer desde cero cómo consume la UI esa capa.

## Conectar el backend

El backend es una API ASP.NET Core: [PTruequeU en GitHub](https://github.com/FreedPandorad78/PTruequeU). Para enlazar este front con ese repo:

1. **Configurá la URL base** — En la raíz del front abrís **`.env`** y ajustás `VITE_API_URL`. Por defecto viene `http://localhost:5000`; si tu API corre en otro puerto (por ejemplo el típico `http://localhost:5088`), poné esa URL.
2. **Dejá de usar mocks en los servicios** — En cada archivo bajo **`src/api/`**, en lugar de importar los JSON, hacés `fetch` a `${API_URL}/…` usando la **`API_URL`** definida en `src/api/config.ts` (la que levanta la variable `VITE_API_URL`).
3. **Autenticación** — Para rutas protegidas, mandá el JWT desde **`localStorage`** (por ejemplo en el header `Authorization: Bearer …`) igual que espere tu API.

Mapeo aproximado entre endpoints del back y lo que hay hoy en el front:

| Endpoint (backend) | Servicio / función |
|-------------------|---------------------|
| `POST /auth/login` | `authService.login` |
| `POST /auth/register` | `authService.register` |
| `GET /api/Listings` | `listingsService.getListings` |
| `GET /api/Listings/:id` | `listingsService.getListingById` |
| `POST /api/Listings` | `listingsService.createListing` |
| `GET /favorites` | `favoritesService.getFavorites` |
| `POST /favorites/:id` | `favoritesService.addFavorite` |
| `DELETE /favorites/:id` | `favoritesService.removeFavorite` |
| `GET /chats/{id}/messages` | `chatsService.getChatMessages` |

(Los paths exactos pueden variar según cómo exponga el controller el back — siempre cruzalo con ese repo antes de cerrar integración.)

## Estructura del proyecto

Árbol resumido de **`src/`** y para qué sirve cada zona:

```
src/
├── api/        # Servicios mocks.
├── components/ # Piezas reutilizables de UI (Navbar, etc.).
├── mocks/      # Datos ficticios en JSON para desarrollo sin API.
├── pages/      # Pantallas por ruta (login, listings, publish, favorites, chat…).
└── types/      # Interfaces TypeScript compartidas (User, Listing, etc.).
```
