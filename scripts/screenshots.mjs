import { chromium } from '@playwright/test'

/**
 * Regénère les captures du README. La session est fabriquée dans la page —
 * des compositions géométriques dessinées au canvas, pas des sorties de modèle :
 * les captures montrent l'interface à l'usage, sans clé d'API ni réseau.
 *
 *   pnpm dev              # dans un autre terminal
 *   node scripts/screenshots.mjs
 *
 * ponytail: pas de reporter, pas de fixture Playwright — un script qui ouvre un
 * navigateur, remplit localStorage, et écrit deux PNG.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const PROMPT = 'a ceramic vase on raw concrete, low winter light, shallow depth of field'

const browser = await chromium.launch()
// ponytail: DPR 1. Le README affiche ces captures sur 900 px de large ; en DPR 2
// le PNG pèse 3 Mo pour un gain invisible.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

await page.goto(BASE_URL)
await page.evaluate((prompt) => {
  const palettes = [
    ['#c0553a', '#2e4a6b', '#e8dcc4'],
    ['#6b8f71', '#e8dcc4', '#27302a'],
    ['#1d2b3a', '#8aa1b1', '#d9c6a5'],
    ['#8c5e3c', '#f0e4cf', '#3b3a36'],
    ['#44546a', '#c9b79c', '#1b1d22'],
    ['#a3473a', '#f2d7a6', '#2a2522'],
  ]
  const ratios = { '4:3': [1200, 900], '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1024, 1024] }

  function draw([w, h], [a, b, c], index) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const g = canvas.getContext('2d')
    const sky = g.createLinearGradient(0, 0, w, h)
    sky.addColorStop(0, a)
    sky.addColorStop(1, b)
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    g.fillStyle = c
    g.fillRect(0, h * 0.68, w, h * 0.32)
    g.globalAlpha = 0.9
    g.beginPath()
    g.ellipse(w * (0.35 + (index % 3) * 0.12), h * 0.5, w * 0.11, h * 0.2, 0, 0, Math.PI * 2)
    g.fill()
    g.globalAlpha = 0.25
    g.fillStyle = '#000'
    g.fillRect(w * 0.2, h * 0.7, w * 0.5, h * 0.03)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  const now = Date.now()
  const models = ['nano-banana-2', 'gpt-image-2', 'gpt-image-2.5-flare']
  const shapes = ['4:3', '4:3', '16:9', '9:16', '1:1', '4:3']
  const items = shapes.map((ratio, index) => {
    const url = draw(ratios[ratio], palettes[index], index)
    return {
      id: crypto.randomUUID(),
      result: { imageBase64: url.split(',')[1], mimeType: 'image/jpeg' },
      adapterId: models[index % models.length],
      prompt: index < 2 ? prompt : `${prompt}, variation ${index}`,
      negative: '',
      seed: 4471902 + index,
      params: {
        aspectRatio: ratio, resolution: '2K', batch: 2, seed: null, seedLock: false,
        fileFormat: 'png', transparent: false, compression: 80, personGeneration: 'allow_adult',
        moderation: 'auto', language: 'auto', extraParams: [],
      },
      palette: palettes[index],
      thumb: null,
      parentId: null,
      recipeId: null,
      latencyMs: 12_000 + index * 900,
      costEur: 0.04,
      createdAt: new Date(now - Math.floor(index / 2) * 60_000).toISOString(),
    }
  })
  localStorage.setItem('imgc.session', JSON.stringify(items))
  localStorage.setItem('gemini_api_key', 'demo')
}, PROMPT)
await page.reload()

await page.getByRole('navigation', { name: 'Session' }).getByRole('button').first().waitFor()
// L'indicateur du serveur de dev n'a rien à faire sur une capture.
await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
await page.getByLabel('Prompt', { exact: true }).fill(PROMPT)
// Sans ça, le composeur garde l'anneau de focus sur la capture.
await page.evaluate(() => document.activeElement?.blur())
await page.waitForTimeout(500)
await page.screenshot({ path: 'docs/screenshot.png' })

// La requête réelle, dans la section Avancé de l'inspecteur.
await page.getByText('Avancé', { exact: true }).click()
await page.evaluate(() => {
  const panel = document.querySelector('aside .overflow-y-auto')
  if (panel) panel.scrollTop = panel.scrollHeight
})
await page.waitForTimeout(400)
await page.screenshot({ path: 'docs/screenshot-json.png' })

await browser.close()
console.log('docs/screenshot.png et docs/screenshot-json.png regénérés')
