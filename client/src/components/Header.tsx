import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { cn } from '../lib/cn';
import { BrandIcon, Logo } from './Logo';
import { NAV_ITEMS } from './nav';

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const DESKTOP = '(min-width: 768px)';

/** True once the page has scrolled past its top. */
function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);
  return scrolled;
}

export function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Scrolled down: the header stays at the top, compact, showing only the icon.
  const scrolled = useScrolled();
  const compact = scrolled && !menuOpen;
  // Hovering or focusing the home link makes the icon play the scale again.
  const [plays, setPlays] = useState(0);
  const playScale = () => setPlays((n) => n + 1);

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
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        compact
          ? 'border-line bg-bg/95 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-bg'
          : 'border-transparent',
      )}
    >
      <div
        className={cn(
          'wrap flex items-center justify-between transition-[padding] duration-300 ease-out',
          compact ? 'py-3 md:py-4' : 'py-5 md:py-7',
        )}
      >
        <Link
          to="/"
          onClick={closeMenu}
          onMouseEnter={playScale}
          onFocus={playScale}
          className="flex items-center text-2xl md:text-[1.75rem]"
        >
          <BrandIcon flat={compact} play={plays} className="h-[1.15em]" />
          {/* Collapses away when scrolled, leaving the icon. It stays in the accessibility tree,
              so the link is still named "Aaroh". */}
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-out',
              compact ? 'ml-0 max-w-0 opacity-0' : 'ml-[0.4em] max-w-[4em] opacity-100',
            )}
          >
            <Logo />
          </span>
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
