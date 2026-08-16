'use client'

import { useState } from 'react'
import type { Palette } from '@/lib/atelier/palette'

interface AmbientLayer {
  id: string
  palette: Palette
}

interface AmbientBackgroundProps {
  layers: AmbientLayer[]
  selectedId: string | null
  enabled: boolean
}

function mix([c0, c1, c2]: Palette): string {
  return [
    `radial-gradient(58% 52% at 26% 24%, ${c1}, transparent 62%)`,
    `radial-gradient(54% 48% at 76% 34%, ${c0}, transparent 64%)`,
    `radial-gradient(72% 62% at 54% 88%, ${c2}, transparent 68%)`,
    c2,
  ].join(', ')
}

/**
 * Deux couches au plus — l'ambiance sortante et l'entrante — pour un fondu de
 * 900 ms d'une image à l'autre. Monter une couche par image de la session
 * coûterait un flou de 96 px animé en continu pour chacune, invisible ou non.
 * Les images elles-mêmes ne portent aucun effet.
 */
export default function AmbientBackground({
  layers,
  selectedId,
  enabled,
}: AmbientBackgroundProps) {
  // Ajusté pendant le rendu, pas dans un effet : la couche sortante doit être
  // présente dès le premier rendu qui suit le changement, sinon il n'y a rien à
  // faire fondre.
  const [seen, setSeen] = useState<{ current: string | null; previous: string | null }>({
    current: selectedId,
    previous: null,
  })

  if (seen.current !== selectedId) {
    setSeen({ current: selectedId, previous: seen.current })
  }

  const visible = layers.filter(
    (layer) => layer.id === selectedId || layer.id === seen.previous
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {enabled &&
        visible.map((layer) => (
          <div
            key={layer.id}
            className="absolute animate-drift"
            style={{
              left: '-12%',
              top: '-32%',
              width: '124%',
              height: '96%',
              background: mix(layer.palette),
              filter: 'blur(96px) saturate(1.25)',
              opacity: layer.id === selectedId ? 0.35 : 0,
              // La couche entrante vient d'être montée : une transition n'aurait
              // rien à interpoler, c'est l'animation qui fait son fondu d'entrée.
              // La sortante, elle, passe de 0.35 à 0 et transitionne.
              animation:
                layer.id === selectedId
                  ? 'drift 34s ease-in-out infinite, ambient-in 900ms var(--ease-ambient)'
                  : undefined,
              transition: 'opacity 900ms var(--ease-ambient)',
            }}
          />
        ))}

      {/* Voile : l'interface reste sobre quelle que soit l'image. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #08090D 0%, rgba(8,9,13,.55) 34%, rgba(8,9,13,.9) 68%, #08090D 100%)',
        }}
      />
    </div>
  )
}
