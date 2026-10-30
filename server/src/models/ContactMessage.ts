import { Schema, model } from 'mongoose';
import { CONTACT_TYPES } from '@aaroh/shared';

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, enum: CONTACT_TYPES, required: true },
    message: { type: String, required: true },
    // Salted SHA-256 of the sender's IP: enough to spot abuse, without storing the address.
    ipHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ContactMessageModel = model('ContactMessage', contactMessageSchema);
