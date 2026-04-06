'use client'

import { useState } from 'react'
import type { GenerationResult } from '@/lib/types'

interface GalleryItem {
  id: string
  result: GenerationResult
  prompt: string
  createdAt: Date
}

interface Props {
  items: GalleryItem[]
}

export default function ImageGallery({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 text-sm">
        Les images générées apparaîtront ici
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const { result, prompt } = item
  const [imgError, setImgError] = useState(false)
  const src = `data:${result.mimeType};base64,${result.imageBase64}`

  function handleDownload() {
    const ext = result.mimeType.split('/')[1] ?? 'png'
    const filename = `img-creator-${item.id}.${ext}`
    const link = document.createElement('a')
    link.href = src
    link.download = filename
    link.click()
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
      {imgError ? (
        <div className="w-full h-48 flex items-center justify-center text-gray-500 text-xs">
          Impossible de charger l&apos;image
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={prompt}
          onError={() => setImgError(true)}
          className="w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <p className="text-xs text-gray-300 line-clamp-3">{prompt}</p>
        <button
          onClick={handleDownload}
          className="self-end px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          Télécharger
        </button>
      </div>
    </div>
  )
}

export type { GalleryItem }
