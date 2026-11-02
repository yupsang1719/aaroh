import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { ContactType } from '@aaroh/shared/contact-types';

/** Enquiry topics. Each opens a new email with the subject filled in. */
const TOPICS: Array<{ type: ContactType; title: string; text: string; subject: string }> = [
  {
    type: 'general',
    title: 'General',
    text: 'A question, a thought, a hello.',
    subject: 'General enquiry',
  },
  {
    type: 'collaboration',
    title: 'Collaborations',
    text: 'Artists, directors and crews with something to make.',
    subject: 'Collaboration enquiry',
  },
  {
    type: 'press',
    title: 'Press',
    text: 'Interviews, features and press materials.',
    subject: 'Press enquiry',
  },
  {
    type: 'licensing',
    title: 'Licensing',
    text: 'Our music and films, in your work.',
    subject: 'Licensing enquiry',
  },
];

const mailto = (email: string, subject?: string) =>
  `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/**
 * Email-only contact: the address in large type, a copy button (many computers have no email
 * app set up, so a mailto link alone can do nothing) and topic links with the subject prefilled.
 */
export function EmailContact({ email }: { email: string }) {
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied('copied');
    } catch {
      setCopied('failed');
    }
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied('idle'), 4000);
  };

  return (
    <div>
      <p className="eyebrow">Email</p>
      <a
        href={mailto(email)}
        className="mt-4 inline-block break-all font-display text-display-md font-semibold transition-colors duration-200 hover:text-accent"
      >
        {email}
      </a>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={mailto(email)}
          className="inline-flex items-center gap-2 rounded-full bg-fg px-7 py-3.5 text-base font-medium text-bg transition-colors duration-200 hover:bg-accent"
        >
          Write to us
          <span aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center rounded-full border border-fg/20 px-7 py-3.5 text-base font-medium transition-colors duration-200 hover:border-fg"
        >
          {copied === 'copied' ? 'Copied' : 'Copy address'}
        </button>
        <p aria-live="polite" className="text-sm text-muted">
          {copied === 'copied' && 'Email address copied.'}
          {copied === 'failed' && 'Could not copy. Please select the address above.'}
        </p>
      </div>

      <h2 className="eyebrow mt-16 md:mt-20">Or choose a subject</h2>
      <ul className="mt-4 border-t border-line">
        {TOPICS.map((topic) => (
          <li key={topic.type} className="border-b border-line">
            <a
              href={mailto(email, topic.subject)}
              className="group -mx-3 grid gap-1 rounded-xl px-3 py-5 transition-colors duration-300 hover:bg-accent/[0.06] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-baseline sm:gap-6 md:py-6"
            >
              <span className="font-display text-xl font-semibold transition-colors duration-200 group-hover:text-accent md:text-2xl">
                {topic.title}
              </span>
              <span className="text-muted">{topic.text}</span>
              <span
                aria-hidden="true"
                className="hidden transition-transform duration-300 group-hover:translate-x-1 sm:block"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-xl text-sm text-muted">
        We use the details you send us only to reply to you. See our{' '}
        <Link to="/privacy" className="link">
          privacy notice
        </Link>
        .
      </p>
    </div>
  );
}
