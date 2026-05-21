import { NavLink, useNavigate } from 'react-router-dom'
import { clearToken, isAdmin } from '../utils/auth.ts'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm font-medium transition-colors px-3 py-1.5 rounded-full',
    isActive
      ? 'bg-white text-indigo-700 shadow-sm'
      : 'text-white/80 hover:text-white hover:bg-white/10',
  ].join(' ')
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
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <NavLink
          to={homePath}
          className="text-xl font-bold text-white tracking-tight transition hover:text-white/90"
        >
          🔄 TruequeU
        </NavLink>
        <nav aria-label="Principal">
          <ul className="flex flex-row flex-wrap items-center gap-2">
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
              <NavLink
                to="/chats"
                className={navLinkClass}
                aria-label="Chats"
                title="Chats"
              >
                💬 Chats
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
                className="ml-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}