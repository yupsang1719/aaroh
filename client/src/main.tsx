import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import './index.css';
import { App } from './App';

// In production the server writes page meta into the HTML for link previews. Remove those
// tags before React takes over, so they are not duplicated by the <Seo> component.
document.querySelectorAll('[data-server-meta]').forEach((el) => el.remove());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
