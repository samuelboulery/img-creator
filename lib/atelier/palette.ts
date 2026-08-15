export type Palette = [string, string, string]

/** Taille de l'échantillon : 16×16 suffit pour des couleurs dominantes. */
const SAMPLE = 16

/** En dessous, la couleur est quasi neutre et ne colore pas le fond. */
const MIN_SATURATION = 0.08

const HUE_BUCKETS = 12

function toHex(r: number, g: number, b: number): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === 0) return 0
  return (max - min) / max
}

function hue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0

  const delta = max - min
  let value: number

  if (max === r) value = ((g - b) / delta) % 6
  else if (max === g) value = (b - r) / delta + 2
  else value = (r - g) / delta + 4

  return (value * 60 + 360) % 360
}

/**
 * Quantifie des pixels RGBA en trois couleurs dominantes, triées par
 * population, les valeurs quasi neutres écartées. Fonction pure : c'est elle
 * qui est testée, pas le canvas.
 */
export function quantize(pixels: Uint8ClampedArray | number[]): Palette | null {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const [r, g, b, a] = [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]]
    if (a < 128) continue
    if (saturation(r, g, b) < MIN_SATURATION) continue

    const key = Math.floor(hue(r, g, b) / (360 / HUE_BUCKETS))
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 }
    buckets.set(key, {
      count: bucket.count + 1,
      r: bucket.r + r,
      g: bucket.g + g,
      b: bucket.b + b,
    })
  }

  if (buckets.size === 0) return null

  const sorted = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map((bucket) => toHex(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count))

  // Moins de trois teintes distinctes : on complète avec la dominante.
  while (sorted.length < 3) sorted.push(sorted[sorted.length - 1])

  return [sorted[0], sorted[1], sorted[2]]
}

/**
 * Extrait la palette d'une image base64. Tout se passe dans le navigateur :
 * aucun octet ne part sur le réseau, le coût est négligeable.
 */
export function extractPalette(dataUrl: string): Promise<Palette | null> {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = SAMPLE
      canvas.height = SAMPLE

      const context = canvas.getContext('2d')
      if (!context) {
        resolve(null)
        return
      }

      context.drawImage(image, 0, 0, SAMPLE, SAMPLE)
      resolve(quantize(context.getImageData(0, 0, SAMPLE, SAMPLE).data))
    }

    image.onerror = () => resolve(null)
    image.src = dataUrl
  })
}
