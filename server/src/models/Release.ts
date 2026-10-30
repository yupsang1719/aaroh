import { Schema, model, type InferSchemaType } from 'mongoose';

const imageSchema = new Schema(
  { url: { type: String, required: true }, alt: { type: String, default: '' }, caption: String },
  { _id: false },
);

const releaseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    artist: { type: String, required: true, trim: true },
    releaseDate: { type: Date, required: true },
    summary: { type: String, default: '' },
    story: { type: String, default: '' },
    youtubeId: { type: String, required: true },
    streamingLinks: {
      spotify: String,
      appleMusic: String,
      youtubeMusic: String,
      other: { type: [{ label: String, url: String, _id: false }], default: [] },
    },
    coverImage: { type: imageSchema, required: true },
    stills: { type: [imageSchema], default: [] },
    credits: { type: [{ role: String, name: String, _id: false }], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

releaseSchema.index({ published: 1, order: 1, releaseDate: -1 });

export type ReleaseDoc = InferSchemaType<typeof releaseSchema>;
export const ReleaseModel = model('Release', releaseSchema);
