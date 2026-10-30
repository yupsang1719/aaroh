import { useEffect, useState } from 'react';
import type { ReleaseDetail, ReleaseSummary, SiteSettings } from '@aaroh/shared';
import { DATA_KEYS } from '@aaroh/shared/data-keys';
import { api } from './api';

type State<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

// Content changes rarely, so each response is kept for the lifetime of the page.
// `resolved` holds finished results so a cached page renders immediately, with no loading state.
const pending = new Map<string, Promise<unknown>>();
const resolved = new Map<string, unknown>();

/** Seeds the cache with data the server embedded in the HTML (see main.tsx). */
export function primeCache(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) resolved.set(key, value);
}

function load<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (resolved.has(key)) return Promise.resolve(resolved.get(key) as T);
  let promise = pending.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = fetcher().then((data) => {
      resolved.set(key, data);
      return data;
    });
    pending.set(key, promise);
    // Do not keep failures: the next visit should try again.
    promise.catch(() => pending.delete(key));
  }
  return promise;
}

function stateFor<T>(key: string): State<T> {
  return resolved.has(key)
    ? { status: 'success', data: resolved.get(key) as T }
    : { status: 'loading' };
}

function useCached<T>(key: string, fetcher: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T> & { key: string }>(() => ({
    key,
    ...stateFor<T>(key),
  }));

  useEffect(() => {
    if (resolved.has(key)) return;
    let active = true;
    load(key, fetcher).then(
      (data) => active && setState({ key, status: 'success', data }),
      (error: Error) => active && setState({ key, status: 'error', error }),
    );
    return () => {
      active = false;
    };
    // `fetcher` is derived from `key`, so `key` alone decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A new key (e.g. moving between releases) never shows the previous release.
  return state.key === key ? state : stateFor<T>(key);
}

export const useSettings = () => useCached<SiteSettings>(DATA_KEYS.settings, api.settings);
export const useReleases = () => useCached<ReleaseSummary[]>(DATA_KEYS.releases, api.releases);
export const useRelease = (slug: string) =>
  useCached<ReleaseDetail>(DATA_KEYS.release(slug), () => api.release(slug));
