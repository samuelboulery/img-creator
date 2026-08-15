'use client'

import { useState } from 'react'
import PromptForm from '@/components/PromptForm'
import ImageGallery, { type GalleryItem } from '@/components/ImageGallery'
import ApiKeyInput from '@/components/ApiKeyInput'
import type { AdapterId, PromptParams, GenerateResponse } from '@/lib/types'

const ADAPTERS: { id: AdapterId; label: string; storageKey: string; placeholder: string; apiKeyLabel: string }[] = [
  {
    id: 'nano-banana-2',
    label: 'Nano Banana 2',
    storageKey: 'gemini_api_key',
    placeholder: 'AIza…',
    apiKeyLabel: 'Clé API Gemini',
  },
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    storageKey: 'openai_api_key',
    placeholder: 'sk-…',
    apiKeyLabel: 'Clé API OpenAI',
  },
]

export default function Home() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAdapter, setSelectedAdapter] = useState<AdapterId>('nano-banana-2')
  const [geminiKey, setGeminiKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')

  const activeKey = selectedAdapter === 'gpt-image-2' ? openaiKey : geminiKey

  async function handleGenerate(params: PromptParams) {
    setLoading(true)
    setError(null)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (activeKey) headers['x-api-key'] = activeKey

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...params, adapterId: selectedAdapter }),
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

  const adapter = ADAPTERS.find((a) => a.id === selectedAdapter)!

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight shrink-0">img-creator</h1>
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-0.5">
          {ADAPTERS.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAdapter(a.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedAdapter === a.id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <div className="space-y-4">
          <ApiKeyInput
            key={adapter.id}
            label={adapter.apiKeyLabel}
            storageKey={adapter.storageKey}
            placeholder={adapter.placeholder}
            onChange={adapter.id === 'gpt-image-2' ? setOpenaiKey : setGeminiKey}
          />
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
