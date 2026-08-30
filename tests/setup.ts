import '@testing-library/jest-dom/vitest'

/**
 * Node ≥ 24 expose un `localStorage` natif expérimental, inerte tant que
 * `--localstorage-file` n'est pas fourni. Sous Vitest `window === globalThis`,
 * si bien que ce getter natif masque l'implémentation de jsdom et rend
 * `window.localStorage` indéfini — les tests de `lib/atelier/storage.ts`
 * échouent alors sur Node récent tout en passant sur la version du CI.
 *
 * On réinstalle donc un stockage fonctionnel quand celui de l'environnement
 * est absent. Node 22 conserve celui de jsdom, intact.
 */
class MemoryStorage implements Storage {
  #entries = new Map<string, string>()

  get length(): number {
    return this.#entries.size
  }

  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.#entries.get(String(key)) ?? null
  }

  setItem(key: string, value: string): void {
    this.#entries.set(String(key), String(value))
  }

  removeItem(key: string): void {
    this.#entries.delete(String(key))
  }

  clear(): void {
    this.#entries.clear()
  }
}

function ensureStorage(name: 'localStorage' | 'sessionStorage') {
  const existing = Reflect.get(globalThis, name) as Storage | undefined
  if (existing && typeof existing.getItem === 'function') return

  Object.defineProperty(globalThis, name, {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}

ensureStorage('localStorage')
ensureStorage('sessionStorage')
