import { useEffect, useState } from 'react';
import type { ReleaseDetail, ReleaseSummary, SiteSettings } from '@aaroh/shared';
import { api } from './api';

type State<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

// Content changes rarely, so each response is kept for the lifetime of the page.
// Going back to a page you have seen is then instant.
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = load();
    cache.set(key, promise);
    // Do not keep failures: the next visit should try again.
    promise.catch(() => cache.delete(key));
  }
  return promise;
}

function useCached<T>(key: string, load: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T> & { key: string }>({ key, status: 'loading' });

  useEffect(() => {
    let active = true;
    cached(key, load).then(
      (data) => active && setState({ key, status: 'success', data }),
      (error: Error) => active && setState({ key, status: 'error', error }),
    );
    return () => {
      active = false;
    };
    // `load` is derived from `key`, so `key` alone decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A new key (e.g. moving between releases) shows loading, not the previous release.
  return state.key === key ? state : { status: 'loading' };
}

export const useSettings = () => useCached<SiteSettings>('settings', api.settings);
export const useReleases = () => useCached<ReleaseSummary[]>('releases', api.releases);
export const useRelease = (slug: string) =>
  useCached<ReleaseDetail>(`release:${slug}`, () => api.release(slug));
