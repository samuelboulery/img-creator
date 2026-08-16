/** Côté le plus long de l'aperçu, en pixels. */
const MAX_EDGE = 320

/** Qualité JPEG de l'aperçu — au-delà, le gain visuel ne paie plus les octets. */
const QUALITY = 0.72

/**
 * Réduit une image base64 en aperçu JPEG. Même patron que `extractPalette` :
 * tout se passe dans le navigateur, et un échec vaut `null` — jamais une
 * exception, la génération ne doit pas tomber pour un aperçu manquant.
 */
export function makeThumbnail(dataUrl: string, maxEdge = MAX_EDGE): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) {
        resolve(null)
        return
      }

      context.drawImage(image, 0, 0, width, height)

      try {
        resolve(canvas.toDataURL('image/jpeg', QUALITY))
      } catch {
        // Canvas teinté (image d'une autre origine) : pas d'aperçu, pas d'erreur.
        resolve(null)
      }
    }

    image.onerror = () => resolve(null)
    image.src = dataUrl
  })
}
