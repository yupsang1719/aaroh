import { Link } from 'react-router';
import { ApiError } from '../lib/api';
import { Seo } from './Seo';

/** Loading spacer: keeps the footer from jumping up while content loads. */
export function PageLoading() {
  return (
    <div className="wrap min-h-[60vh] py-20" aria-busy="true">
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function PageError({ error }: { error: Error }) {
  const notFound = error instanceof ApiError && error.status === 404;
  return (
    <div className="wrap py-24 md:py-40">
      <Seo title={notFound ? 'Not found' : 'Something went wrong'} noindex />
      <h1 className="font-display text-display-lg font-semibold">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        {notFound
          ? 'This page does not exist, or it has moved.'
          : 'We could not load this page. Please refresh, or try again a little later.'}
      </p>
      <Link to={notFound ? '/work' : '/'} className="link mt-10 inline-block text-lg">
        {notFound ? 'See our work' : 'Back to the home page'}
      </Link>
    </div>
  );
}
