import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { useReducedMotion } from '../lib/useReducedMotion';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms, for gentle staggering. */
  delay?: number;
}

/**
 * Fades content up once as it scrolls into view. Content already on screen when the page
 * loads shows at once (fading it in would only delay the first paint); with reduced motion
 * nothing animates.
 */
export function Reveal({ children, as: Tag = 'div', className, delay = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  // Shown at load without a fade: measuring the element has already applied its hidden style,
  // so the transition must be switched off or it would still fade in.
  const [instant, setInstant] = useState(false);

  // Before the first paint: if this is already in view, skip the reveal.
  useLayoutEffect(() => {
    const top = ref.current?.getBoundingClientRect().top;
    if (top !== undefined && top < window.innerHeight) {
      setInstant(true);
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, visible]);

  const hidden = !reduced && !visible;
  return (
    <Tag
      {...rest}
      ref={ref}
      className={cn('reveal', instant && '!transition-none', className)}
      data-hidden={hidden || undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
