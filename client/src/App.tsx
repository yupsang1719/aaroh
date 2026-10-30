import type { ComponentType } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { Layout } from './components/Layout';
import { RouteError } from './components/RouteError';

// Each page is its own chunk, loaded when first visited.
const page =
  (load: () => Promise<{ default: ComponentType }>): RouteObject['lazy'] =>
  async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('./pages/Home')) },
          { path: 'work', lazy: page(() => import('./pages/Work')) },
          { path: 'work/:slug', lazy: page(() => import('./pages/WorkDetail')) },
          { path: 'process', lazy: page(() => import('./pages/Process')) },
          { path: 'about', lazy: page(() => import('./pages/About')) },
          { path: 'contact', lazy: page(() => import('./pages/Contact')) },
          { path: '*', lazy: page(() => import('./pages/NotFound')) },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
