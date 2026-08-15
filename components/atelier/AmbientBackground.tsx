'use client'

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
 * Une couche par image, seule celle de la sélection est visible : changer de
 * sélection fait un fondu de 900 ms d'une ambiance à l'autre. Les images
 * elles-mêmes ne portent aucun effet.
 */
export default function AmbientBackground({
  layers,
  selectedId,
  enabled,
}: AmbientBackgroundProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {enabled &&
        layers.map((layer) => (
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
