import { z } from 'zod';
import { CONTACT_TYPES } from './contactTypes';

export { CONTACT_TYPES, CONTACT_TYPE_LABELS, type ContactType } from './contactTypes';

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.string().trim().max(200).pipe(z.email('Please enter a valid email address')),
  type: z.enum(CONTACT_TYPES),
  message: z.string().trim().min(10, 'Please write at least a few words').max(5000),
  // Honeypot: real people never see or fill this field.
  // The server accepts a filled honeypot with a fake success and discards the message.
  website: z.string().max(500).optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
