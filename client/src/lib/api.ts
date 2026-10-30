import type { ContactInput, ReleaseDetail, ReleaseSummary, SiteSettings } from '@aaroh/shared';

// The client only ever talks to our own Express API, never to a CMS directly.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `Request failed (${res.status})`,
      body?.fieldErrors,
    );
  }
  return body as T;
}

export const api = {
  settings: () => request<SiteSettings>('/settings'),
  releases: () => request<ReleaseSummary[]>('/releases'),
  release: (slug: string) => request<ReleaseDetail>(`/releases/${encodeURIComponent(slug)}`),
  sendContact: (input: ContactInput) =>
    request<{ ok: true }>('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
};
