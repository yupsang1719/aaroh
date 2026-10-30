import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Seo } from './Seo';

/** Shown when a route fails to load (e.g. a network error fetching page code). */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="wrap py-24 md:py-40">
      <Seo title={notFound ? 'Not found' : 'Something went wrong'} noindex />
      <h1 className="font-display text-display-lg font-semibold">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        {notFound
          ? 'This page does not exist, or it has moved.'
          : 'Please refresh the page. If it keeps happening, try again a little later.'}
      </p>
      <Link to="/" className="link mt-10 inline-block text-lg">
        Back to the home page
      </Link>
    </div>
  );
}
