import { NavLink, useNavigate } from 'react-router-dom'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm transition-colors',
    isActive
      ? 'font-semibold text-blue-600'
      : 'font-normal text-neutral-700 hover:text-neutral-900',
  ].join(' ')
}

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className="border-b border-neutral-200 bg-white px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-lg font-bold text-neutral-900">TruequeU</span>
        <nav aria-label="Principal">
          <ul className="flex flex-row items-center gap-4">
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
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
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