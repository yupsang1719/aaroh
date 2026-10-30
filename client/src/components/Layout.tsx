import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  // After client-side navigation, move focus to the new page so keyboard and
  // screen reader users start at its content, as they would on a full page load.
  // Comparing paths (not "first render") keeps this correct when StrictMode re-runs effects.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[60] bg-fg px-4 py-3 text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {/* `inert` keeps keyboard focus inside the open mobile menu. */}
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1" inert={menuOpen}>
        <Outlet />
      </main>
      <div inert={menuOpen}>
        <Footer />
      </div>
      <ScrollRestoration />
    </div>
  );
}
