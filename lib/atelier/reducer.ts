import type { AdapterId, DrawerId, Mode, PanelTab } from '@/lib/types'

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
  selectedId: string | null
  openDrawer: DrawerId | null
  panelTab: PanelTab
  openSections: Record<string, boolean>
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

export const DEFAULT_OPEN_SECTIONS: Record<string, boolean> = {
  references: true,
  framing: true,
  render: false,
  people: false,
  raw: false,
}

export const initialAtelierState: AtelierState = {
  mode: 'explore',
  adapterId: 'nano-banana-2',
  selectedId: null,
  openDrawer: null,
  panelTab: 'recipe',
  openSections: DEFAULT_OPEN_SECTIONS,
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
  | { type: 'toggleAdapter' }
  | { type: 'select'; id: string | null }
  | { type: 'toggleDrawer'; drawer: DrawerId }
  | { type: 'closeDrawer' }
  | { type: 'setPanelTab'; tab: PanelTab }
  | { type: 'toggleSection'; section: string }
  | { type: 'openViewer' }
  | { type: 'closeViewer' }
  | { type: 'toggleCmd' }
  | { type: 'closeOverlays' }
  | { type: 'setError'; error: string | null; kind?: ErrorKind }
  | { type: 'toggleSheet'; id: string }
  | { type: 'selectSheet'; ids: string[] }
  | { type: 'togglePanel' }

const OTHER_ADAPTER: Record<AdapterId, AdapterId> = {
  'nano-banana-2': 'gpt-image-2',
  'gpt-image-2': 'nano-banana-2',
}

export function atelierReducer(state: AtelierState, action: AtelierAction): AtelierState {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode }

    case 'setAdapter':
      return { ...state, adapterId: action.adapterId }

    case 'toggleAdapter':
      return { ...state, adapterId: OTHER_ADAPTER[state.adapterId] }

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

    case 'setPanelTab':
      return { ...state, panelTab: action.tab }

    case 'toggleSection':
      return {
        ...state,
        openSections: {
          ...state.openSections,
          [action.section]: !state.openSections[action.section],
        },
      }

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
