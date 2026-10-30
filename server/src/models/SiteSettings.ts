import { Schema, model, type InferSchemaType } from 'mongoose';

const imageSchema = new Schema(
  { url: { type: String, required: true }, alt: { type: String, default: '' }, caption: String },
  { _id: false },
);

// There is only ever one settings document, identified by key "site".
export const SETTINGS_KEY = 'site';

const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SETTINGS_KEY },
    companyName: { type: String, default: 'Aaroh' },
    tagline: { type: String, default: '' },
    hero: {
      mode: { type: String, enum: ['collage', 'video'], default: 'collage' },
      videoUrl: String,
      posterUrl: String,
      collageImages: { type: [imageSchema], default: [] },
    },
    about: {
      intro: { type: String, default: '' },
      story: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    team: { type: [{ name: String, role: String, photoUrl: String, _id: false }], default: [] },
    processSteps: {
      type: [{ title: String, text: String, imageUrl: String, imageAlt: String, _id: false }],
      default: [],
    },
    contactEmail: { type: String, required: true },
    socials: { instagram: String, youtube: String, tiktok: String, spotify: String },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettingsModel = model('SiteSettings', siteSettingsSchema);
