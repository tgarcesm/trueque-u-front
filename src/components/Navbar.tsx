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

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <NavLink
          to="/listings"
          className="text-xl font-bold text-white tracking-tight transition hover:text-white/90"
        >
          🔄 TruequeU
        </NavLink>
        <nav aria-label="Principal">
          <ul className="flex flex-row items-center gap-2">
            <li>
              <NavLink to="/listings" className={navLinkClass}>
                Inicio
              </NavLink>
            </li>
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
            <li>
              <NavLink to="/profile" className={navLinkClass}>
                Mi perfil
              </NavLink>
            </li>
            {isAdmin() ? (
              <li>
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              </li>
            ) : null}
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