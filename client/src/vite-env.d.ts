/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_API_BASE?: string;
}

/** The brand icon's dots, read from client/public/brand/icon.svg at build time (null if absent). */
declare const __BRAND_ICON__: {
  viewBox: string;
  /** `flat`: the dot's centre when the icon lies flat. */
  dots: { cx: number; cy: number; r: number; fill: string; flat: { x: number; y: number } }[];
} | null;
