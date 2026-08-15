'use client'

import { DiceFive } from '@phosphor-icons/react/dist/ssr'
import Choice from './Choice'
import RawParams from './RawParams'
import ReferenceGrid from './ReferenceGrid'
import Section from './Section'
import Slider from './Slider'
import Switch from './Switch'
import { randomSeed, SAMPLERS, setParam, weightLabel } from '@/lib/atelier/params'
import { supports } from '@/lib/adapters/capabilities'
import type { ImageState } from '@/lib/atelier/image-file'
import type {
  AdapterId,
  AspectRatio,
  Batch,
  FileFormat,
  GenerationParams,
  Language,
  Moderation,
  PersonGeneration,
  Resolution,
} from '@/lib/types'

/** Références et poids : la part de la recette qui n'est pas un réglage. */
export interface RecipeState {
  subjectImages: ImageState[]
  subjectWeight: number
  identityLock: boolean
  styleImages: ImageState[]
  styleWeight: number
  paletteTransfer: boolean
}

export const DEFAULT_RECIPE_STATE: RecipeState = {
  subjectImages: [],
  subjectWeight: 75,
  identityLock: false,
  styleImages: [],
  styleWeight: 65,
  paletteTransfer: false,
}

const RATIOS: { value: AspectRatio; ratio: number }[] = [
  { value: '1:1', ratio: 1 },
  { value: '16:9', ratio: 16 / 9 },
  { value: '9:16', ratio: 9 / 16 },
  { value: '4:3', ratio: 4 / 3 },
]

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
]

const FILE_FORMATS: { value: FileFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WEBP' },
]

const BATCHES: { value: Batch; label: string }[] = [
  { value: 1, label: '×1' },
  { value: 2, label: '×2' },
  { value: 4, label: '×4' },
  { value: 8, label: '×8' },
]

const PERSON_OPTIONS: { value: PersonGeneration; label: string }[] = [
  { value: 'allow_adult', label: 'allow_adult' },
  { value: 'allow_all', label: 'allow_all' },
  { value: 'dont_allow', label: 'dont_allow' },
]

const MODERATIONS: { value: Moderation; label: string }[] = [
  { value: 'auto', label: 'auto' },
  { value: 'low', label: 'low' },
]

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'auto', label: 'auto' },
  { value: 'fr', label: 'fr' },
  { value: 'en', label: 'en' },
]

function RatioButtons({
  value,
  onChange,
  ignored,
}: {
  value: AspectRatio
  onChange: (value: AspectRatio) => void
  ignored: boolean
}) {
  return (
    <div>
      <div className="mb-[6px] text-[12.5px] text-label">
        Format
        {ignored && <span className="ml-2 font-mono text-[10px] text-meta">ignoré ici</span>}
      </div>
      <div className="flex gap-[6px]">
        {RATIOS.map((entry) => {
          const width = entry.ratio >= 1 ? 22 : 22 * entry.ratio
          const height = entry.ratio >= 1 ? 22 / entry.ratio : 22
          return (
            <button
              key={entry.value}
              type="button"
              aria-pressed={value === entry.value}
              onClick={() => onChange(entry.value)}
              className={`flex h-[44px] w-[44px] flex-col items-center justify-center gap-[3px] rounded-chip transition-colors duration-[240ms] ${
                value === entry.value
                  ? 'bg-selected ring-selected'
                  : 'bg-field hover:bg-field-hover'
              }`}
            >
              <span
                className={value === entry.value ? 'bg-accent-light' : 'bg-icon'}
                style={{ width, height, borderRadius: 2 }}
              />
              <span className="font-mono text-[9px] text-meta">{entry.value}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface RecipeTabProps {
  adapterId: AdapterId
  params: GenerationParams
  onParamsChange: (params: GenerationParams) => void
  recipe: RecipeState
  onRecipeChange: (recipe: RecipeState) => void
  openSections: Record<string, boolean>
  onToggleSection: (section: string) => void
  activeRecipeName: string | null
}

export default function RecipeTab({
  adapterId,
  params,
  onParamsChange,
  recipe,
  onRecipeChange,
  openSections,
  onToggleSection,
  activeRecipeName,
}: RecipeTabProps) {
  const set = <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) =>
    onParamsChange(setParam(params, key, value))

  const patch = (partial: Partial<RecipeState>) => onRecipeChange({ ...recipe, ...partial })

  const referenceCount = recipe.subjectImages.length + recipe.styleImages.length

  return (
    <div>
      <Section
        title="Références"
        meta={`${referenceCount} réf · ${recipe.styleWeight} %`}
        open={openSections.references}
        onToggle={() => onToggleSection('references')}
      >
        <p className="font-mono text-[10px] tracking-[.1em] text-label">SUJET</p>
        <ReferenceGrid
          images={recipe.subjectImages}
          onAdd={(images) => patch({ subjectImages: [...recipe.subjectImages, ...images] })}
          onRemove={(id) =>
            patch({ subjectImages: recipe.subjectImages.filter((image) => image.id !== id) })
          }
          hint="envoyées en inlineData base64"
        />
        <Slider
          label="Fidélité au sujet"
          valueLabel={`${weightLabel(recipe.subjectWeight)} · ${recipe.subjectWeight}`}
          value={recipe.subjectWeight}
          min={0}
          max={100}
          step={5}
          lowBound="inspiration"
          highBound="reproduction"
          onChange={(value) => patch({ subjectWeight: value })}
        />
        <Switch
          label="Verrouiller l'identité"
          checked={recipe.identityLock}
          onChange={(checked) => patch({ identityLock: checked })}
        />

        <div className="h-px bg-separator" />

        <p className="font-mono text-[10px] tracking-[.1em] text-label">STYLE</p>
        <ReferenceGrid
          images={recipe.styleImages}
          onAdd={(images) => patch({ styleImages: [...recipe.styleImages, ...images] })}
          onRemove={(id) =>
            patch({ styleImages: recipe.styleImages.filter((image) => image.id !== id) })
          }
          hint={activeRecipeName ? `preset actif : ${activeRecipeName}` : undefined}
        />
        <Slider
          label="Fidélité au style"
          valueLabel={`${weightLabel(recipe.styleWeight)} · ${recipe.styleWeight}`}
          value={recipe.styleWeight}
          min={0}
          max={100}
          step={5}
          lowBound="inspiration"
          highBound="reproduction"
          onChange={(value) => patch({ styleWeight: value })}
        />
        <Switch
          label="Transfert de palette"
          checked={recipe.paletteTransfer}
          onChange={(checked) => patch({ paletteTransfer: checked })}
        />
      </Section>

      <Section
        title="Cadrage & sortie"
        meta={`${params.aspectRatio} · ${params.resolution}`}
        open={openSections.framing}
        onToggle={() => onToggleSection('framing')}
      >
        <RatioButtons
          value={params.aspectRatio}
          ignored={!supports(adapterId, 'aspectRatio')}
          onChange={(value) => set('aspectRatio', value)}
        />
        <Choice
          label="Résolution"
          options={RESOLUTIONS}
          value={params.resolution}
          ignored={!supports(adapterId, 'resolution')}
          onChange={(value) => set('resolution', value)}
        />
        <Choice
          label="Fichier"
          options={FILE_FORMATS}
          value={params.fileFormat}
          ignored={!supports(adapterId, 'fileFormat')}
          onChange={(value) => set('fileFormat', value)}
        />
        <Switch
          label="Fond transparent"
          checked={params.transparent}
          ignored={!supports(adapterId, 'transparent')}
          onChange={(checked) => set('transparent', checked)}
        />
        {/* La compression n'existe pas en PNG. */}
        {params.fileFormat !== 'png' && (
          <Slider
            label="Compression"
            valueLabel={String(params.compression)}
            value={params.compression}
            min={20}
            max={100}
            step={1}
            lowBound="20"
            highBound="100"
            ignored={!supports(adapterId, 'compression')}
            onChange={(value) => set('compression', value)}
          />
        )}
      </Section>

      <Section
        title="Rendu"
        meta={`×${params.batch}`}
        open={openSections.render}
        onToggle={() => onToggleSection('render')}
      >
        <Choice
          label="Variantes"
          options={BATCHES}
          value={params.batch}
          ignored={!supports(adapterId, 'batch')}
          onChange={(value) => set('batch', value)}
        />

        <div>
          <div className="mb-[6px] flex items-center justify-between">
            <span className="text-[12.5px] text-label">
              Graine
              {!supports(adapterId, 'seed') && (
                <span className="ml-2 font-mono text-[10px] text-meta">ignoré ici</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onParamsChange({ ...params, seed: randomSeed(), seedLock: true })}
              className="flex items-center gap-[5px] font-mono text-[10.5px] text-meta transition-colors duration-[240ms] hover:text-body-soft"
            >
              <DiceFive size={13} />
              relancer
            </button>
          </div>
          <div className="flex items-center gap-[6px]">
            <input
              value={params.seed ?? ''}
              onChange={(event) => {
                const parsed = Number(event.target.value)
                set('seed', event.target.value.trim() === '' || Number.isNaN(parsed) ? null : parsed)
              }}
              placeholder="aléatoire"
              aria-label="Graine"
              className="w-[110px] rounded-chip bg-field px-2 py-[5px] font-mono text-[11.5px] text-mono placeholder:text-faint focus:outline-none"
            />
            <Switch
              label="Verrou"
              checked={params.seedLock}
              onChange={(checked) => set('seedLock', checked)}
            />
          </div>
          <p className="mt-[4px] font-mono text-[10px] text-meta">
            {params.seed !== null && params.seedLock
              ? `${params.seed} · figée`
              : 'aléatoire à chaque envoi'}
          </p>
        </div>

        <Slider
          label="Guidage (CFG)"
          valueLabel={params.guidance.toLocaleString('fr-FR')}
          value={params.guidance}
          min={1}
          max={20}
          step={0.5}
          lowBound="1"
          highBound="20"
          ignored={!supports(adapterId, 'guidance')}
          onChange={(value) => set('guidance', value)}
        />
        <Slider
          label="Étapes"
          valueLabel={String(params.steps)}
          value={params.steps}
          min={10}
          max={80}
          step={1}
          lowBound="10"
          highBound="80"
          ignored={!supports(adapterId, 'steps')}
          onChange={(value) => set('steps', value)}
        />
        <Choice
          label="Échantillonneur"
          options={SAMPLERS.map((sampler) => ({ value: sampler, label: sampler }))}
          value={params.sampler}
          ignored={!supports(adapterId, 'sampler')}
          onChange={(value) => set('sampler', value)}
        />
      </Section>

      <Section
        title="Personnes & modération"
        open={openSections.people}
        onToggle={() => onToggleSection('people')}
      >
        <Choice
          label="personGeneration"
          options={PERSON_OPTIONS}
          value={params.personGeneration}
          ignored={!supports(adapterId, 'personGeneration')}
          onChange={(value) => set('personGeneration', value)}
        />
        <Choice
          label="Modération"
          options={MODERATIONS}
          value={params.moderation}
          ignored={!supports(adapterId, 'moderation')}
          onChange={(value) => set('moderation', value)}
        />
        <Choice
          label="Langue envoyée"
          options={LANGUAGES}
          value={params.language}
          onChange={(value) => set('language', value)}
        />
      </Section>

      <Section
        title="Paramètres bruts"
        meta={`${params.extraParams.length}`}
        open={openSections.raw}
        onToggle={() => onToggleSection('raw')}
      >
        <RawParams
          params={params.extraParams}
          onChange={(extraParams) => set('extraParams', extraParams)}
        />
      </Section>
    </div>
  )
}
