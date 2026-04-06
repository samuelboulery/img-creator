'use client'

import { useState } from 'react'
import PromptForm from '@/components/PromptForm'
import ImageGallery, { type GalleryItem } from '@/components/ImageGallery'
import ApiKeyInput from '@/components/ApiKeyInput'
import type { PromptParams, GenerateResponse } from '@/lib/types'

export default function Home() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

  async function handleGenerate(params: PromptParams) {
    setLoading(true)
    setError(null)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['x-api-key'] = apiKey

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      })

      const json: GenerateResponse = await res.json()

      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Erreur inconnue')
      }

      const newItem: GalleryItem = {
        id: crypto.randomUUID(),
        result: json.data,
        prompt: params.positiveText,
        createdAt: new Date(),
      }

      setItems((prev) => [newItem, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">
          img-creator{' '}
          <span className="text-xs text-gray-500 font-normal">Nano Banana 2</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <div className="space-y-4">
          <ApiKeyInput onChange={setApiKey} />
          <PromptForm onSubmit={handleGenerate} loading={loading} />
          {error && (
            <p className="rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400">
              {items.length > 0 ? `${items.length} image${items.length > 1 ? 's' : ''}` : 'Résultats'}
            </h2>
            {items.length > 0 && (
              <button
                onClick={() => setItems([])}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Tout effacer
              </button>
            )}
          </div>
          <ImageGallery items={items} />
        </div>
      </main>
    </div>
  )
}
