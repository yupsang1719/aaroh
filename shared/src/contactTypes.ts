// Contact form options, kept free of zod so the client can import them cheaply.
export const CONTACT_TYPES = ['general', 'collaboration', 'press', 'licensing'] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  general: 'General enquiry',
  collaboration: 'Collaboration',
  press: 'Press',
  licensing: 'Licensing',
};
