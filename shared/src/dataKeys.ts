// Cache keys for API data. The server embeds data under these keys in the HTML it serves
// (server/src/seo/serveClient.ts) and the client reads them (client/src/lib/useApi.ts).
export const DATA_KEYS = {
  settings: 'settings',
  releases: 'releases',
  release: (slug: string) => `release:${slug}`,
};

/** id of the <script type="application/json"> holding that embedded data. */
export const INITIAL_DATA_ID = 'initial-data';
