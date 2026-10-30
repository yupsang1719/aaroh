import { Link } from 'react-router';
import { Seo } from '../components/Seo';

export default function NotFound() {
  return (
    <div className="wrap py-24 md:py-40">
      <Seo title="Not found" noindex />
      <h1 className="font-display text-display-lg font-semibold">Page not found</h1>
      <p className="mt-6 max-w-xl text-lg text-muted">This page does not exist, or it has moved.</p>
      <Link to="/work" className="link mt-10 inline-block text-lg">
        See our work
      </Link>
    </div>
  );
}
