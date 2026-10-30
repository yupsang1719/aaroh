import type { ContactInput } from '@aaroh/shared';
import { ContactMessageModel } from '../models/ContactMessage';

export type ContactRecord = Omit<ContactInput, 'website'> & { ipHash: string };

// Contact messages always live in MongoDB, whatever the content source is.
export interface ContactStore {
  save(message: ContactRecord): Promise<void>;
}

export const mongoContactStore: ContactStore = {
  async save(message) {
    await ContactMessageModel.create(message);
  },
};
