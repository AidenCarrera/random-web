import { useSyncExternalStore, type SetStateAction } from "react";

type PersistentStore<T> = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (update: SetStateAction<T>) => void;
};

/** One store per storage key, so every reader of a key shares a snapshot. */
const stores = new Map<string, PersistentStore<unknown>>();

function createStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
): PersistentStore<T> {
  const listeners = new Set<() => void>();
  // Read lazily: the store may be created during a server render.
  let snapshot: T | null = null;

  const read = (): T => {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored === null ? null : parse(JSON.parse(stored));
      if (parsed !== null) return parsed;
    } catch {
      // Unreadable or malformed storage falls back to the defaults.
    }
    return fallback;
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const getSnapshot = () => {
    if (snapshot === null) snapshot = read();
    return snapshot;
  };

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      // Another tab writing the same key invalidates this snapshot.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== key) return;
        snapshot = read();
        emit();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => fallback,
    set(update) {
      const current = getSnapshot();
      const next =
        typeof update === "function"
          ? (update as (value: T) => T)(current)
          : update;
      if (Object.is(next, current)) return;

      snapshot = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private browsing and full quotas fail the write; the session still works.
      }
      emit();
    },
  };
}

function getStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
): PersistentStore<T> {
  const existing = stores.get(key);
  if (existing) return existing as PersistentStore<T>;

  const created = createStore(key, fallback, parse);
  stores.set(key, created as PersistentStore<unknown>);
  return created;
}

/**
 * State mirrored into `localStorage`. Storage is only read on the client, so the
 * server render and the hydrating client render both start from `fallback`.
 *
 * `fallback` and `parse` are read once per key, when its store is first created.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
) {
  const store = getStore(key, fallback, parse);
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return [value, store.set] as const;
}
