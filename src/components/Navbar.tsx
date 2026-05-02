import { NavLink } from 'react-router-dom'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm transition-colors',
    isActive
      ? 'font-semibold text-blue-600'
      : 'font-normal text-neutral-700 hover:text-neutral-900',
  ].join(' ')
}

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-lg font-bold text-neutral-900">TruequeU</span>
        <nav aria-label="Principal">
          <ul className="flex flex-row gap-4">
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
          </ul>
        </nav>
      </div>
    </header>
  )
}
