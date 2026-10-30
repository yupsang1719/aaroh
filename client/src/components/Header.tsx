import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router';
import { cn } from '../lib/cn';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const DESKTOP = '(min-width: 768px)';

export function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // While the mobile menu is open: Escape closes it, the page behind does not scroll,
  // and growing to desktop width closes it (the inline nav takes over).
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => {
      setMenuOpen(false);
      buttonRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const media = window.matchMedia(DESKTOP);
    const onMedia = () => media.matches && setMenuOpen(false);

    document.addEventListener('keydown', onKey);
    media.addEventListener('change', onMedia);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      media.removeEventListener('change', onMedia);
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen, setMenuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-50">
      <div className="wrap flex items-center justify-between py-5 md:py-7">
        <Link to="/" onClick={closeMenu} className="text-2xl md:text-[1.75rem]">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-8 text-[0.95rem] font-medium">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      // Underline that sweeps in from the left on hover; stays for the current page.
                      'relative py-2 transition-colors duration-200 hover:text-fg',
                      'after:absolute after:inset-x-0 after:bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out',
                      isActive
                        ? 'text-fg after:scale-x-100'
                        : 'text-muted after:scale-x-0 hover:after:scale-x-100',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="-mr-2 px-2 py-2 text-[0.95rem] font-medium md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-0 -z-10 overflow-y-auto bg-bg pt-24 md:hidden"
      >
        <nav aria-label="Main" className="wrap">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'block py-1 font-display text-display-lg font-semibold',
                      isActive ? 'text-accent' : 'text-fg',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
