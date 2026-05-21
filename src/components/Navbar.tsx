import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken, isAdmin } from "../utils/auth.ts";

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 md:inline-block md:w-auto md:py-2 md:text-center",
    isActive
      ? "bg-white/20 text-white shadow-inner md:bg-white/20"
      : "text-white/90 hover:bg-white/10 hover:text-white md:hover:-translate-y-px",
  ].join(" ");
}

function LogoIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner">
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

type NavbarProps = {
  admin: boolean;
  homePath: string;
  onNavigate: () => void;
  onLogout: () => void;
};

function NavItems({ admin, homePath, onNavigate, onLogout }: NavbarProps) {
  return (
    <>
      <li>
        <NavLink to={homePath} className={navLinkClass} end={admin} onClick={onNavigate}>
          Inicio
        </NavLink>
      </li>
      {admin ? (
        <li>
          <NavLink to="/admin/listings" className={navLinkClass} onClick={onNavigate}>
            Publicaciones
          </NavLink>
        </li>
      ) : (
        <>
          <li>
            <NavLink to="/publish" className={navLinkClass} onClick={onNavigate}>
              Publicar
            </NavLink>
          </li>
          <li>
            <NavLink to="/favorites" className={navLinkClass} onClick={onNavigate}>
              Favoritos
            </NavLink>
          </li>
        </>
      )}
      <li>
        <NavLink to="/chats" className={navLinkClass} onClick={onNavigate} aria-label="Chats">
          Chats
        </NavLink>
      </li>
      <li>
        <NavLink to="/profile" className={navLinkClass} onClick={onNavigate}>
          {admin ? "Admin" : "Mi perfil"}
        </NavLink>
      </li>
      <li className="md:ml-1">
        <button
          type="button"
          onClick={() => {
            onNavigate();
            onLogout();
          }}
          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/20 md:w-auto md:py-2"
        >
          Cerrar sesión
        </button>
      </li>
    </>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const admin = isAdmin();
  const homePath = admin ? "/admin" : "/listings";
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearToken();
    setMenuOpen(false);
    navigate("/login");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const navProps: NavbarProps = {
    admin,
    homePath,
    onNavigate: closeMenu,
    onLogout: handleLogout,
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-700 shadow-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <NavLink
          to={homePath}
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-2.5 transition duration-200 hover:opacity-95 sm:gap-3"
        >
          <LogoIcon />
          <span className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
            Trueque<span className="text-blue-200">U</span>
          </span>
        </NavLink>

        <nav
          aria-label="Principal"
          className="hidden md:block"
        >
          <ul className="flex flex-row flex-wrap items-center justify-end gap-1 lg:gap-2">
            <NavItems {...navProps} />
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[3.25rem] z-30 bg-slate-900/40 md:hidden"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          />
          <nav
            id="mobile-nav"
            aria-label="Menú móvil"
            className="relative z-40 border-t border-white/10 bg-indigo-800/98 px-4 py-3 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-1">
              <NavItems {...navProps} />
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
