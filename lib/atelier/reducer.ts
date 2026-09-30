import type { AdapterId, DrawerId, Mode } from '@/lib/types'

/**
 * Ce que l'utilisateur peut faire de l'erreur. `missing-key` est le seul cas où
 * réessayer est inutile tant que rien n'a changé.
 */
export type ErrorKind = 'missing-key' | 'generic' | null

/**
 * État d'interface de l'atelier. Aucune donnée serveur : ce qui doit survivre
 * au rechargement est persisté séparément dans localStorage.
 */
export interface AtelierState {
  mode: Mode
  adapterId: AdapterId
  /** Second modèle lancé à chaque Générer, ou null. */
  parallelId: AdapterId | null
  selectedId: string | null
  openDrawer: DrawerId | null
  viewerOpen: boolean
  cmdOpen: boolean
  error: string | null
  /**
   * Nature de l'erreur courante : elle décide de l'action proposée par le
   * bandeau. Une clé manquante appelle « Ouvrir les réglages », pas « Réessayer »
   * — réessayer à l'identique ne peut que réechouer.
   */
  errorKind: ErrorKind
  /** Cases cochées de la planche contact (mode Produire). */
  sheetSelection: string[]
  /** Sous ~1100 px, le panneau de paramètres se déplie à la demande. */
  panelOpen: boolean
}

export const initialAtelierState: AtelierState = {
  mode: 'explore',
  adapterId: 'nano-banana-2',
  parallelId: null,
  selectedId: null,
  openDrawer: null,
  viewerOpen: false,
  cmdOpen: false,
  error: null,
  errorKind: null,
  sheetSelection: [],
  panelOpen: false,
}

export type AtelierAction =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setAdapter'; adapterId: AdapterId }
  | { type: 'setParallel'; adapterId: AdapterId | null }
  | { type: 'select'; id: string | null }
  | { type: 'toggleDrawer'; drawer: DrawerId }
  | { type: 'closeDrawer' }
  | { type: 'openViewer' }
  | { type: 'closeViewer' }
  | { type: 'toggleCmd' }
  | { type: 'closeOverlays' }
  | { type: 'setError'; error: string | null; kind?: ErrorKind }
  | { type: 'toggleSheet'; id: string }
  | { type: 'selectSheet'; ids: string[] }
  | { type: 'togglePanel' }

export function atelierReducer(state: AtelierState, action: AtelierAction): AtelierState {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode }

    // Le modèle parallèle promu en principal cesse d'être parallèle.
    case 'setAdapter':
      return {
        ...state,
        adapterId: action.adapterId,
        parallelId: state.parallelId === action.adapterId ? null : state.parallelId,
      }

    case 'setParallel':
      return {
        ...state,
        parallelId: action.adapterId === state.adapterId ? null : action.adapterId,
      }

    case 'select':
      return { ...state, selectedId: action.id }

    // Un bouton de rail déjà actif referme son tiroir.
    case 'toggleDrawer':
      return {
        ...state,
        openDrawer: state.openDrawer === action.drawer ? null : action.drawer,
      }

    case 'closeDrawer':
      return { ...state, openDrawer: null }

    case 'openViewer':
      return { ...state, viewerOpen: true }

    case 'closeViewer':
      return { ...state, viewerOpen: false }

    case 'toggleCmd':
      return { ...state, cmdOpen: !state.cmdOpen }

    // Échap : ferme d'abord ce qui est au-dessus, sans toucher aux réglages.
    case 'closeOverlays':
      return { ...state, viewerOpen: false, cmdOpen: false }

    case 'setError':
      return {
        ...state,
        error: action.error,
        errorKind: action.error ? (action.kind ?? 'generic') : null,
      }

    case 'toggleSheet':
      return {
        ...state,
        sheetSelection: state.sheetSelection.includes(action.id)
          ? state.sheetSelection.filter((id) => id !== action.id)
          : [...state.sheetSelection, action.id],
      }

    case 'selectSheet':
      return { ...state, sheetSelection: action.ids }

    case 'togglePanel':
      return { ...state, panelOpen: !state.panelOpen }
  }
}

/** Le panneau de paramètres se replie tant qu'un tiroir est ouvert. */
export function isPanelVisible(state: AtelierState): boolean {
  return state.openDrawer === null
}
