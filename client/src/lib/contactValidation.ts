import { z } from 'zod';
import { contactInputSchema, type ContactInput } from '@aaroh/shared/contact';

// Loaded on demand by <ContactForm> (zod is ~25 kB gzipped; most visitors never need it).

export type ContactField = 'name' | 'email' | 'type' | 'message';
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_FIELDS: ContactField[] = ['name', 'email', 'type', 'message'];

export function firstErrors(fieldErrors: Record<string, string[] | undefined>): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const message = fieldErrors[field]?.[0];
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateContact(values: ContactInput): ContactErrors {
  const result = contactInputSchema.safeParse(values);
  return result.success ? {} : firstErrors(z.flattenError(result.error).fieldErrors);
}
