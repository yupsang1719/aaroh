import type { ReactNode } from 'react';
import type { LegalDetails } from '@aaroh/shared';

/**
 * Registered company details, as UK trading disclosure rules require on a company website.
 * `compact` is the one-paragraph footer version; otherwise a definition list.
 */
export function CompanyDetails({ legal, compact }: { legal: LegalDetails; compact?: boolean }) {
  const office = legal.registeredOffice
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (compact) {
    return (
      <p>
        {legal.companyName} is a company registered in {legal.registeredIn}, company number{' '}
        {legal.companyNumber}. Registered office: {office.join(', ')}.
        {legal.vatNumber && <> VAT number {legal.vatNumber}.</>}
      </p>
    );
  }

  const rows: Array<[string, ReactNode]> = [
    ['Company name', legal.companyName],
    ['Company number', legal.companyNumber],
    ['Registered in', legal.registeredIn],
    [
      'Registered office',
      <address key="office" className="not-italic">
        {office.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>,
    ],
  ];
  if (legal.vatNumber) rows.push(['VAT number', legal.vatNumber]);
  if (legal.icoRegistrationNumber) rows.push(['ICO registration', legal.icoRegistrationNumber]);

  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6"
        >
          <dt className="text-muted">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
