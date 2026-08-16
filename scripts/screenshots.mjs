import { chromium } from '@playwright/test'

/**
 * Regénère les captures du README. L'atelier est rempli par la commande de
 * démonstration — des photos libres de droit, pas des sorties de modèle : les
 * captures montrent l'interface à l'usage, sans dépendre d'une clé d'API.
 *
 *   pnpm dev              # dans un autre terminal
 *   node scripts/screenshots.mjs
 *
 * ponytail: pas de reporter, pas de fixture Playwright — un script qui ouvre un
 * navigateur, clique, et écrit deux PNG.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const PROMPT = 'a ceramic vase on raw concrete, low winter light, shallow depth of field'

const browser = await chromium.launch()
// ponytail: DPR 1. Le README affiche ces captures sur 900 px de large ; en DPR 2
// le PNG pèse 3 Mo pour un gain invisible.
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

await page.goto(BASE_URL)

// L'écran d'accueil s'affiche tant qu'aucune clé n'a été saisie.
// Il n'apparaît qu'après l'hydratation, une fois le localStorage relu.
const enter = page.getByRole('button', { name: /entrer dans l/i })
await enter.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {})
if (await enter.isVisible().catch(() => false)) await enter.click()

await page.keyboard.press('ControlOrMeta+k')
await page.getByPlaceholder(/Chercher une commande/).fill('démo')
await page.getByRole('button', { name: /Charger 24 images/ }).click()

// La commande télécharge 24 photos : on attend que la galerie soit remplie.
await page
  .getByText(/24 variantes/)
  .waitFor({ timeout: 60_000 })
  .catch(async (error) => {
    await page.screenshot({ path: process.env.DEBUG_SHOT ?? 'debug-screenshot.png' })
    throw error
  })
await page.waitForTimeout(1500)

await page.getByPlaceholder(/Décris l/).fill(PROMPT)
// Sans ça, le composer garde l'anneau de focus sur la capture.
await page.evaluate(() => document.activeElement?.blur())
await page.screenshot({ path: 'docs/screenshot.png' })

await page.getByRole('button', { name: 'JSON', exact: true }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: 'docs/screenshot-json.png' })

await browser.close()
console.log('docs/screenshot.png et docs/screenshot-json.png regénérés')
