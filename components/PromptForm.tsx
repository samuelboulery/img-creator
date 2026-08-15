'use client'

import { useRef, useState } from 'react'
import type { PromptParams, ReferenceImage, ExtraParam } from '@/lib/types'

const ASPECT_RATIOS: PromptParams['aspectRatio'][] = ['1:1', '16:9', '9:16', '4:3', '3:4']

const PARAM_SUGGESTIONS = [
  { key: 'Steps', value: '30' },
  { key: 'CFG', value: '7' },
  { key: 'Sampler', value: 'DPM++ 2M Karras' },
  { key: 'imageSize', value: '2K' },
]

// ── Image state (includes preview URL for display, not sent to API) ──────────
interface ImageState extends ReferenceImage {
  id: string
  preview: string
}

function readImageFile(file: File): Promise<ImageState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const [header, base64] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      resolve({ id: crypto.randomUUID(), base64, mimeType, preview: dataUrl })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Weight slider ─────────────────────────────────────────────────────────────
function WeightSlider({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number
  onChange: (v: number) => void
  lowLabel: string
  highLabel: string
}) {
  const pct = value // 0–100
  const label =
    pct <= 20 ? 'Très libre'
    : pct <= 40 ? 'Libre'
    : pct <= 60 ? 'Équilibré'
    : pct <= 80 ? 'Proche'
    : 'Très proche'

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Fidélité à la référence</span>
        <span className="text-xs font-medium text-violet-400">{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-violet-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

// ── Reusable multi-image upload grid ─────────────────────────────────────────
function ImageGrid({
  images,
  onAdd,
  onRemove,
  label,
  hint,
}: {
  images: ImageState[]
  onAdd: (imgs: ImageState[]) => void
  onRemove: (id: string) => void
  label: string
  hint: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const loaded = await Promise.all(Array.from(files).map(readImageFile))
    onAdd(loaded)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-xs text-gray-500">{hint}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.preview}
              alt=""
              className="h-20 w-20 rounded-lg object-cover border border-gray-600"
            />
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute -top-1.5 -right-1.5 bg-gray-700 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add button */}
        <label className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 transition-colors text-gray-500 hover:text-violet-400">
          <span className="text-xl leading-none">+</span>
          <span className="text-[10px] mt-0.5">Ajouter</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}

// ── Extra params editor ───────────────────────────────────────────────────────
function ExtraParamsEditor({
  params,
  onChange,
}: {
  params: ExtraParam[]
  onChange: (params: ExtraParam[]) => void
}) {
  function update(index: number, field: 'key' | 'value', val: string) {
    const next = params.map((p, i) => (i === index ? { ...p, [field]: val } : p))
    onChange(next)
  }

  function remove(index: number) {
    onChange(params.filter((_, i) => i !== index))
  }

  function addSuggestion(suggestion: { key: string; value: string }) {
    const already = params.some((p) => p.key === suggestion.key)
    if (already) return
    onChange([...params, { key: suggestion.key, value: suggestion.value }])
  }

  return (
    <div className="space-y-3">
      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5">
        {PARAM_SUGGESTIONS.map((s) => {
          const active = params.some((p) => p.key === s.key)
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => addSuggestion(s)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                active
                  ? 'bg-violet-900/50 border-violet-600 text-violet-300 cursor-default'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-violet-500 hover:text-gray-200'
              }`}
            >
              {active ? '✓ ' : '+ '}{s.key}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onChange([...params, { key: '', value: '' }])}
          className="px-2 py-0.5 rounded text-xs border border-dashed border-gray-600 text-gray-500 hover:border-violet-500 hover:text-gray-300 transition-colors"
        >
          + Personnalisé
        </button>
      </div>

      {/* Key-value rows */}
      {params.length > 0 && (
        <div className="space-y-1.5">
          {params.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={p.key}
                onChange={(e) => update(i, 'key', e.target.value)}
                placeholder="Paramètre"
                className="w-28 rounded bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <input
                value={p.value}
                onChange={(e) => update(i, 'value', e.target.value)}
                placeholder="Valeur"
                className="flex-1 rounded bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-500 hover:text-red-400 transition-colors text-sm px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section wrapper with collapsible toggle ───────────────────────────────────
function Section({
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string
  badge?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/60 hover:bg-gray-800 text-sm font-medium text-gray-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="bg-violet-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
              {badge}
            </span>
          )}
        </span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-3 py-3">{children}</div>}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface Props {
  onSubmit: (params: PromptParams) => void
  loading: boolean
}

export default function PromptForm({ onSubmit, loading }: Props) {
  const [positiveText, setPositiveText] = useState('')
  const [negativeText, setNegativeText] = useState('')
  const [aspectRatio, setAspectRatio] = useState<PromptParams['aspectRatio']>('1:1')
  const [styleImages, setStyleImages] = useState<ImageState[]>([])
  const [styleWeight, setStyleWeight] = useState(50)
  const [subjectImages, setSubjectImages] = useState<ImageState[]>([])
  const [subjectWeight, setSubjectWeight] = useState(50)
  const [extraParams, setExtraParams] = useState<ExtraParam[]>([])

  function addImages(
    setter: React.Dispatch<React.SetStateAction<ImageState[]>>,
    newImgs: ImageState[]
  ) {
    setter((prev) => [...prev, ...newImgs])
  }

  function removeImage(
    setter: React.Dispatch<React.SetStateAction<ImageState[]>>,
    id: string
  ) {
    setter((prev) => prev.filter((img) => img.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!positiveText.trim()) return

    const toRefImage = ({ base64, mimeType }: ImageState): ReferenceImage => ({ base64, mimeType })

    onSubmit({
      positiveText: positiveText.trim(),
      negativeText: negativeText.trim() || undefined,
      styleImages: styleImages.length > 0 ? styleImages.map(toRefImage) : undefined,
      styleWeight: styleImages.length > 0 ? styleWeight : undefined,
      subjectImages: subjectImages.length > 0 ? subjectImages.map(toRefImage) : undefined,
      subjectWeight: subjectImages.length > 0 ? subjectWeight : undefined,
      aspectRatio,
      extraParams: extraParams.filter((p) => p.key.trim() && p.value.trim()),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Positive prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Prompt positif <span className="text-red-400">*</span>
        </label>
        <textarea
          value={positiveText}
          onChange={(e) => setPositiveText(e.target.value)}
          placeholder="Décris l'image que tu veux générer…"
          rows={4}
          required
          className="w-full rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Negative prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Prompt négatif
        </label>
        <textarea
          value={negativeText}
          onChange={(e) => setNegativeText(e.target.value)}
          placeholder="Ce que tu veux éviter dans l'image…"
          rows={2}
          className="w-full rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Style references */}
      <Section title="Références de style" badge={styleImages.length}>
        <ImageGrid
          images={styleImages}
          onAdd={(imgs) => addImages(setStyleImages, imgs)}
          onRemove={(id) => removeImage(setStyleImages, id)}
          label="Images de style"
          hint="Ambiance, couleurs, rendu"
        />
        {styleImages.length > 0 && (
          <WeightSlider
            value={styleWeight}
            onChange={setStyleWeight}
            lowLabel="Inspiration libre"
            highLabel="Reproduction stricte"
          />
        )}
      </Section>

      {/* Subject references */}
      <Section title="Références de sujet" badge={subjectImages.length}>
        <ImageGrid
          images={subjectImages}
          onAdd={(imgs) => addImages(setSubjectImages, imgs)}
          onRemove={(id) => removeImage(setSubjectImages, id)}
          label="Images de sujet"
          hint="Personnes, objets, scènes"
        />
        {subjectImages.length > 0 && (
          <WeightSlider
            value={subjectWeight}
            onChange={setSubjectWeight}
            lowLabel="Inspiration libre"
            highLabel="Reproduction stricte"
          />
        )}
      </Section>

      {/* Extra params */}
      <Section title="Paramètres avancés" badge={extraParams.filter(p => p.key && p.value).length}>
        <ExtraParamsEditor params={extraParams} onChange={setExtraParams} />
      </Section>

      {/* Aspect ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Format</label>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                aspectRatio === ratio
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-violet-500'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !positiveText.trim()}
        className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
      >
        {loading ? 'Génération…' : 'Générer'}
      </button>
    </form>
  )
}
