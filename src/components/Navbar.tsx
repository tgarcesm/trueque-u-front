import { NavLink, useNavigate } from "react-router-dom";
import { clearToken, isAdmin } from "../utils/auth.ts";

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    "relative text-sm font-medium transition-all duration-200 px-4 py-2 rounded-xl",
    isActive
      ? "bg-white/20 text-white shadow-inner"
      : "text-white/85 hover:text-white hover:bg-white/10 hover:-translate-y-px",
  ].join(" ");
}

function LogoIcon() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/20">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 10h5M13 10l-2-2M13 10l-2 2" />
        <path d="M16 14h-5M11 14l2 2M11 14l2-2" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const admin = isAdmin();
  const homePath = admin ? "/admin" : "/listings";

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-700 px-4 py-3 shadow-nav md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <NavLink
          to={homePath}
          className="group flex items-center gap-3 transition duration-200 hover:opacity-95"
        >
          <LogoIcon />
          <span className="text-xl font-bold tracking-tight text-white">
            Trueque<span className="text-blue-200">U</span>
          </span>
        </NavLink>
        <nav aria-label="Principal">
          <ul className="flex flex-row flex-wrap items-center justify-end gap-1 sm:gap-2">
            <li>
              <NavLink to={homePath} className={navLinkClass} end={admin}>
                Inicio
              </NavLink>
            </li>
            {admin ? (
              <li>
                <NavLink to="/admin/listings" className={navLinkClass}>
                  Publicaciones
                </NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/publish" className={navLinkClass}>
                    Publicar
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/favorites" className={navLinkClass}>
                    Favoritos
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <NavLink to="/chats" className={navLinkClass} aria-label="Chats">
                Chats
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={navLinkClass}>
                {admin ? "Admin" : "Mi perfil"}
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-white/20 hover:-translate-y-px"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
