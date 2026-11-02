import { Link } from 'react-router';
import { NOT_FOUND_META } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';

export default function NotFound() {
  return (
    <div className="wrap py-24 md:py-40">
      <Seo meta={NOT_FOUND_META} />
      <h1 className="font-display text-display-lg font-semibold">Off the scale</h1>
      <p className="mt-6 max-w-xl text-lg text-muted">This page has drifted away, or never was.</p>
      <Link to="/work" className="link mt-10 inline-block text-lg">
        Return to the work
      </Link>
    </div>
  );
}
