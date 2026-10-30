import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import './index.css';
import { INITIAL_DATA_ID } from '@aaroh/shared/data-keys';
import { App } from './App';
import { primeCache } from './lib/useApi';

// In production the server embeds the data for the requested page, so it renders at once
// without waiting for the API.
const initialData = document.getElementById(INITIAL_DATA_ID);
if (initialData?.textContent) {
  try {
    primeCache(JSON.parse(initialData.textContent));
  } catch {
    // Ignore: the page simply fetches its data instead.
  }
}

// The server also writes page meta into the HTML for link previews. Remove those tags before
// React takes over, so they are not duplicated by the <Seo> component.
document.querySelectorAll('[data-server-meta]').forEach((el) => el.remove());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
