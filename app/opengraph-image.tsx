import { ImageResponse } from 'next/og'

export const alt = "img-creator — atelier de génération d'images multi-modèles"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// ponytail: police système par défaut de next/og — pas de Space Grotesk ici,
// ça demanderait d'embarquer le .woff et de le lire à chaque build.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08090d',
          padding: 72,
          color: '#eceff4',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 620,
            background:
              'radial-gradient(circle, rgba(232,177,94,0.20) 0%, rgba(232,177,94,0) 70%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              width: 20,
              height: 20,
              borderRadius: 20,
              background: '#e8b15e',
            }}
          />
          <div
            style={{ fontSize: 30, letterSpacing: 6, color: '#8f98a8' }}
          >
            IMG-CREATOR
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1.05 }}>
            Atelier de génération d’images
          </div>
          <div style={{ fontSize: 34, color: '#cfd6e1', lineHeight: 1.35 }}>
            Un prompt, deux API, trois modes de travail et une comparaison A/B.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 26,
            color: '#7f8896',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid #1c222d',
            }}
          >
            nano-banana-2
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid #1c222d',
            }}
          >
            gpt-image-2
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid #1c222d',
            }}
          >
            sans compte
          </div>
        </div>
      </div>
    ),
    size,
  )
}
