'use client'

import {
  BookmarkSimpleIcon,
  CaretDownIcon,
  ClockCounterClockwiseIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  QuestionIcon,
  SlidersHorizontalIcon,
  SunIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { ReactNode } from 'react'
import Mark from './Mark'
import { Button, IconButton, Kbd } from './ui'
import type { Overlay } from '@/lib/atelier/reducer'
import type { Theme } from '@/lib/atelier/storage'
import { useT, type Lang } from '@/lib/i18n'

interface TopBarProps {
  overlay: Overlay | null
  onOverlay: (overlay: Overlay) => void
  theme: Theme
  onTheme: () => void
  lang: Lang
  onLang: () => void
  sheetOpen: boolean
  onSheet: () => void
  /** Le menu Presets, accroché sous son bouton. */
  presetsMenu: ReactNode
}

/** Barre du niveau application : identité, puis ce qui ne dépend pas de l'image. */
export default function TopBar({ overlay, onOverlay, theme, onTheme, lang, onLang, sheetOpen, onSheet, presetsMenu }: TopBarProps) {
  const t = useT()
  // Sous 1100 px, les libellés passent en infobulle et « Réglages » ouvre la feuille.
  const label = 'max-[1100px]:sr-only'

  return (
    <header className="relative z-20 flex h-[58px] shrink-0 items-center gap-0.5 border-b border-hairline bg-solid pr-3 pl-5 max-sm:pr-2 max-sm:pl-3">
      <div className="flex items-center gap-2.5">
        <Mark />
        <span className="text-[15px] font-bold tracking-[-0.02em] max-[420px]:sr-only">obskura</span>
        <span className="rounded-xs border border-hairline-strong px-[5px] font-mono text-10 leading-4 tracking-[0.08em] text-ink-soft max-sm:hidden">
          {t.app.local}
        </span>
      </div>
      <h1 className="sr-only">{t.app.title}</h1>

      <div className="flex-1" />

      <Button
        variant="secondary"
        icon={SlidersHorizontalIcon}
        active={sheetOpen}
        aria-pressed={sheetOpen}
        onClick={onSheet}
        className="mr-1.5 min-[1101px]:hidden max-sm:!px-2"
      >
        <span className="max-sm:sr-only">{t.top.settings}</span>
      </Button>

      <div className="relative">
        <Button
          icon={BookmarkSimpleIcon}
          active={overlay === 'presets'}
          aria-haspopup="dialog"
          aria-expanded={overlay === 'presets'}
          aria-label={t.top.presets}
          onClick={() => onOverlay('presets')}
        >
          <span className={label}>{t.top.presets}</span>
          <CaretDownIcon size={12} aria-hidden className="max-[1100px]:hidden" />
        </Button>
        {overlay === 'presets' && presetsMenu}
      </div>
      <Button
        icon={ClockCounterClockwiseIcon}
        active={overlay === 'history'}
        aria-label={t.top.history}
        onClick={() => onOverlay('history')}
      >
        <span className={label}>{t.top.history}</span>
      </Button>
      <Button icon={KeyIcon} active={overlay === 'keys'} aria-label={t.top.keys} onClick={() => onOverlay('keys')}>
        <span className={label}>{t.top.keys}</span>
      </Button>

      <div aria-hidden className="mx-1.5 h-5 w-px bg-hairline max-sm:hidden" />

      <Button
        icon={MagnifyingGlassIcon}
        active={overlay === 'palette'}
        aria-label={t.top.search}
        title={t.top.search}
        onClick={() => onOverlay('palette')}
        className="!px-2"
      >
        <span className="max-sm:hidden">
          <Kbd keys={['mod', 'K']} />
        </span>
      </Button>
      <IconButton
        icon={QuestionIcon}
        label={t.top.shortcuts}
        active={overlay === 'shortcuts'}
        onClick={() => onOverlay('shortcuts')}
        className="max-sm:hidden"
      />
      <Button
        aria-label={t.top.switchLanguage}
        title={t.top.language}
        onClick={onLang}
        className="!px-2 font-mono"
      >
        {lang.toUpperCase()}
      </Button>
      <IconButton
        icon={theme === 'dark' ? SunIcon : MoonIcon}
        label={theme === 'dark' ? t.top.themeToLight : t.top.themeToDark}
        onClick={onTheme}
      />
    </header>
  )
}
