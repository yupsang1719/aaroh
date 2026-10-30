import {
  useEffect,
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

/** Fades content up once as it scrolls into view. Does nothing with reduced motion. */
export function Reveal({ children, as: Tag = 'div', className, delay = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

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
      className={cn('reveal', className)}
      data-hidden={hidden || undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
