import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  type PersistedClient,
  type Persister,
} from '@tanstack/react-query-persist-client';
import localforage from 'localforage';

localforage.config({
  name: 'hlb-platform-cache',
  storeName: 'rq-cache',
  description: 'Cache persistente de TanStack Query',
});

const KEY = 'rq-cache';

const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await localforage.setItem(KEY, client);
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    const cached = await localforage.getItem<PersistedClient | null>(KEY);
    return cached ?? undefined;
  },
  removeClient: async () => {
    await localforage.removeItem(KEY);
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      /*staleTime: 60_000, gcTime: 1000 * 60 * 60 * 24,*/ networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 1, networkMode: 'offlineFirst' },
  },
});

export function PersistedQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
      onSuccess={() => {
        // Cache restaurada desde IndexedDB
        // Puedes disparar un toast si quieres.
        // toast.success("Cache restaurada");
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
