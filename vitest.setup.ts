import '@testing-library/jest-dom/vitest';

// zustand's persist middleware needs localStorage; provide an in-memory stub
// when the test environment doesn't expose one.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const localStorageStub: Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageStub,
    writable: true,
  });
}
