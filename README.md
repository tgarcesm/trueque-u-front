# TruequeU — Frontend

---

## Autores

- [@tgarcesm](https://github.com/tgarcesm) — Tomás Garcés
- [@FreedPandorad78](https://github.com/FreedPandorad78) — David Orozco
---

Marketplace pensado para la vida universitaria: un lugar donde los estudiantes pueden comprar, vender o intercambiar cosas (libros, electrónica, ropa de club, lo que necesiten) sin complicarse.

---

## Requisitos previos

- [Node.js](https://nodejs.org) instalado
- Backend [PTruequeU](https://github.com/FreedPandorad78/PTruequeU) corriendo

---

## Configuración

### 1. Clonar repositorio

```bash
git clone https://github.com/tgarcesm/trueque-u-front.git
cd trueque-u-front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

VITE_API_URL=http://localhost:5088

> Ajusta el puerto según el que use el backend en tu máquina.

### 4. Correr el proyecto

```bash
npm run dev
```

Abrir **http://localhost:5173** en el navegador.

---

## Credenciales de prueba

Los siguientes usuarios existen en el seed del backend:

| Usuario | Email            | Contraseña |
|---------|------------------|------------|
| admin   | admin@email.com  | Test1234!  |
| andrea  | andrea@email.com | Test1234!  |
| bruno   | bruno@email.com  | Test1234!  |
| carla   | carla@email.com  | Test1234!  |

> También puedes registrar un usuario nuevo desde `/register`.

---

## Tecnologías

- **Vite** — tooling y servidor de desarrollo
- **React** — interfaz
- **TypeScript** — tipado
- **Tailwind CSS v3** — estilos utility-first
- **React Router DOM** — rutas y navegación

---

## Vistas disponibles

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/listings` | Listado de publicaciones con búsqueda y filtro por categoría |
| `/listings/:id` | Detalle de una publicación |
| `/publish` | Formulario para publicar un artículo |
| `/favorites` | Lista de favoritos guardados |
| `/chat/:id` | Conversación de chat asociada a un listing |

---

## Flujo recomendado para probar

1. Correr el backend primero
2. Correr el frontend con `npm run dev`
3. Ir a `/login` e iniciar sesión con una de las credenciales de prueba
4. Explorar listings, entrar al detalle, agregar favoritos
5. Iniciar un chat en una publicación de **otro usuario** (por ejemplo, entrar como bruno e iniciar chat en una publicación de andrea)
6. Registrar un usuario nuevo desde `/register`

---

## Integración con el backend

El frontend consume la API REST de [PTruequeU](https://github.com/FreedPandorad78/PTruequeU) mediante los servicios en `src/api/`:

| Endpoint (backend) | Servicio / función |
|-------------------|---------------------|
| `POST /auth/login` | `authService.login` |
| `POST /auth/register` | `authService.register` |
| `GET /api/Listings` | `listingsService.getListings` |
| `GET /api/Listings/:id` | `listingsService.getListingById` |
| `POST /api/Listings` | `listingsService.createListing` |
| `GET /favorites` | `favoritesService.getFavorites` |
| `POST /favorites/:listingId` | `favoritesService.addFavorite` |
| `DELETE /favorites/:id` | `favoritesService.removeFavorite` |
| `POST /chats/start` | `chatsService.startChat` |
| `GET /chats/:id/messages` | `chatsService.getChatMessages` |
| `POST /chats/:id/messages` | `chatsService.sendMessage` |

La URL base se configura mediante `VITE_API_URL` en el archivo `.env`. La autenticación usa JWT almacenado en `localStorage` y se envía en el header `Authorization: Bearer <token>` en cada request protegido.


## Estructura del proyecto

Árbol resumido de **`src/`** y para qué sirve cada zona:

```
src/
├── api/        # Servicios mocks.
├── components/ # Piezas reutilizables de UI (Navbar, etc.).
├── mocks/      # Datos ficticios en JSON para desarrollo sin API.
├── pages/      # Pantallas por ruta (login, listings, publish, favorites, chat…).
└── types/      # Interfaces TypeScript compartidas (User, Listing, etc.).
└── utils/      # Utilidades compartidas (statusLabel, etc.)
```
