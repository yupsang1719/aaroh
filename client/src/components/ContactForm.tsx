import { useRef, useState, type FormEvent } from 'react';
import type { ContactInput } from '@aaroh/shared/contact';
import { CONTACT_TYPES, CONTACT_TYPE_LABELS } from '@aaroh/shared/contact-types';
import { ApiError, api } from '../lib/api';
import { cn } from '../lib/cn';

type Field = 'name' | 'email' | 'type' | 'message';
type Errors = Partial<Record<Field, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELDS: Field[] = ['name', 'email', 'type', 'message'];
const EMPTY: ContactInput = { name: '', email: '', type: 'general', message: '', website: '' };

// Validation (zod) is loaded on first interaction rather than with the page. If the download
// fails, the form still submits and the server validates; the next attempt retries the download.
let validation: Promise<typeof import('../lib/contactValidation')> | undefined;
const loadValidation = () =>
  (validation ??= import('../lib/contactValidation').catch((err) => {
    validation = undefined;
    throw err;
  }));

const inputClass =
  'mt-2 block w-full rounded-none border-0 border-b border-fg/30 bg-transparent px-0 py-3 text-lg ' +
  // Focus: the underline turns solid and doubles in weight (box-shadow, so nothing shifts).
  'focus:border-fg focus:shadow-[0_1px_0_0_theme(colors.fg)] focus:outline-none focus-visible:outline-none ' +
  'aria-[invalid=true]:border-accent aria-[invalid=true]:focus:shadow-[0_1px_0_0_theme(colors.accent)]';

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);

  const set = (field: keyof ContactInput, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field has shown an error, re-check it as the visitor fixes it.
    if (field in errors) {
      loadValidation().then(
        ({ validateContact }) =>
          setErrors((prev) => ({ ...prev, [field]: validateContact(next)[field as Field] })),
        () => {},
      );
    }
  };

  const focusFirstError = (errs: Errors) => {
    const first = FIELDS.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    const errs: Errors = await loadValidation().then(
      ({ validateContact }) => validateContact(values),
      () => ({}),
    );
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setStatus('sending');
    setServerMessage('');
    try {
      await api.sendContact(values);
      setStatus('sent');
      setValues(EMPTY);
      requestAnimationFrame(() => sentRef.current?.focus());
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError && err.fieldErrors) {
        const serverErrors = await loadValidation().then(
          ({ firstErrors }) => firstErrors(err.fieldErrors!),
          () => ({}),
        );
        setErrors(serverErrors);
        focusFirstError(serverErrors);
      }
      setServerMessage(
        err instanceof ApiError && err.status === 429
          ? 'You have sent several messages in a short time. Please try again later, or email us directly.'
          : 'Your message could not be sent. Please try again, or email us directly.',
      );
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="border-t border-fg pt-8">
        <h2 ref={sentRef} tabIndex={-1} className="font-display text-display-sm font-semibold">
          Thank you. Your message is on its way.
        </h2>
        <p className="mt-4 text-lg text-muted">
          We read everything and will reply as soon as we can.
        </p>
        <button type="button" className="link mt-8 text-lg" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  const fieldProps = (field: Field) => ({
    id: `contact-${field}`,
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  const errorText = (field: Field) =>
    errors[field] && (
      <p id={`contact-${field}-error`} className="mt-2 text-sm font-medium text-accent">
        {errors[field]}
      </p>
    );

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onFocus={() => void loadValidation().catch(() => {})}
      noValidate
      className="space-y-10"
    >
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
        <div>
          <label htmlFor="contact-name" className="eyebrow">
            Name
          </label>
          <input
            {...fieldProps('name')}
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
          />
          {errorText('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className="eyebrow">
            Email
          </label>
          <input
            {...fieldProps('email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
          />
          {errorText('email')}
        </div>
      </div>

      <div>
        <label htmlFor="contact-type" className="eyebrow">
          What is it about?
        </label>
        <select
          {...fieldProps('type')}
          value={values.type}
          onChange={(e) => set('type', e.target.value)}
          className={cn(inputClass, 'cursor-pointer')}
        >
          {CONTACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTACT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {errorText('type')}
      </div>

      <div>
        <label htmlFor="contact-message" className="eyebrow">
          Message
        </label>
        <textarea
          {...fieldProps('message')}
          required
          rows={6}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          className={cn(inputClass, 'resize-y')}
        />
        {errorText('message')}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ''}
          onChange={(e) => set('website', e.target.value)}
        />
      </div>

      <div className="flex flex-col items-start gap-4">
        <button
          type="submit"
          aria-disabled={status === 'sending'}
          className="inline-flex items-center gap-3 rounded-full bg-fg px-8 py-4 text-lg font-medium text-bg transition-colors duration-200 hover:bg-accent aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p role="alert" className="text-sm font-medium text-accent empty:hidden">
          {status === 'error' ? serverMessage : ''}
        </p>
      </div>
    </form>
  );
}
