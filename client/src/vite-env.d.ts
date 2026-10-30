/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_API_BASE?: string;
}

/** True when client/public/brand/logo.svg existed at build (or dev-server start) time. */
declare const __HAS_LOGO__: boolean;
