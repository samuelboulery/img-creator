'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { en } from './en'
import { fr, type Dict } from './fr'
import type { Lang } from './langs'

export { LANGS, type Lang } from './langs'
export type { Dict }

const DICTS: Record<Lang, Dict> = { fr, en }

export function dict(lang: Lang): Dict {
  return DICTS[lang] ?? fr
}

const I18nContext = createContext<Dict>(fr)

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <I18nContext.Provider value={dict(lang)}>{children}</I18nContext.Provider>
}

/** Le dictionnaire de la langue choisie dans les préférences. */
export function useT(): Dict {
  return useContext(I18nContext)
}
