'use client'

import { useState } from 'react'
import { Image as ImageIcon, X } from '@phosphor-icons/react/dist/ssr'
import { readImageFile, type ImageState } from '@/lib/atelier/image-file'

interface ReferenceGridProps {
  images: ImageState[]
  onAdd: (images: ImageState[]) => void
  onRemove: (id: string) => void
  /** Rappelle d'où viennent les images dans le payload. */
  hint?: string
}

/** Vignettes 52 px + zone de dépôt. Les fichiers ne quittent jamais le client. */
export default function ReferenceGrid({ images, onAdd, onRemove, hint }: ReferenceGridProps) {
  const [dragging, setDragging] = useState(false)

  async function load(files: FileList | null) {
    if (!files || files.length === 0) return
    const loaded = await Promise.all(Array.from(files).map(readImageFile))
    onAdd(loaded)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-[6px]">
        {images.map((image) => (
          <div key={image.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.preview}
              alt=""
              className="h-[52px] w-[52px] rounded-ref object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              aria-label="Retirer la référence"
              className="absolute -right-1 -top-1 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-field text-icon opacity-0 transition-opacity duration-[240ms] group-hover:opacity-100"
            >
              <X size={9} />
            </button>
          </div>
        ))}

        <label
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void load(event.dataTransfer.files)
          }}
          className={`flex h-[52px] cursor-pointer flex-col items-center justify-center gap-[2px] rounded-ref border border-dashed px-3 text-center transition-colors duration-[240ms] ${
            dragging ? 'border-accent text-accent-light' : 'border-dash text-meta'
          }`}
        >
          <ImageIcon size={14} />
          <span className="text-[10px]">glisser</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void load(event.target.files)}
          />
        </label>
      </div>

      {hint && <p className="mt-[6px] font-mono text-[10px] text-meta">{hint}</p>}
    </div>
  )
}
