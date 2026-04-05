type SearchParams = URLSearchParams | null;

const noop = () => undefined;

export const useRouter = () => ({
  push: noop,
  replace: noop,
  refresh: noop,
  back: noop,
  forward: noop,
  prefetch: async () => undefined,
});

export const usePathname = () => '';

export const useSearchParams = (): SearchParams => null;

export const useParams = <T extends Record<string, string>>() => ({} as T);

export const redirect = noop;
export const notFound = noop;

