import { expect, test, type Page } from '@playwright/test'

/** PNG 1×1 orange — sert de réponse d'API mockée. */
const PIXEL =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function withKey(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('gemini_api_key', 'AIza-test')
    window.localStorage.setItem('imgc.onboarded', 'true')
  })
}

async function mockGenerate(page: Page) {
  await page.route('**/api/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ imageBase64: PIXEL, mimeType: 'image/png' }],
      }),
    })
  })
}

test("sans clé, l'écran d'accueil s'affiche et laisse entrer", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')

  const dialog = page.getByRole('dialog', { name: 'Connecte un modèle' })
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('Google AI Studio').fill('AIza-test')
  await dialog.getByRole('button', { name: "Entrer dans l'atelier" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole('navigation', { name: 'Panneaux' })).toBeVisible()
})

test('une génération remplit le canvas et le compteur', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')

  await page.getByLabel('Prompt', { exact: true }).fill('un vase en céramique')
  await page.getByRole('button', { name: 'Générer' }).click()

  await expect(page.getByAltText('un vase en céramique').first()).toBeVisible()
  await expect(page.getByText('1 variante · session locale')).toBeVisible()
})

test('la session est restaurée au rechargement', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')

  await page.getByLabel('Prompt', { exact: true }).fill('un vase en céramique')
  await page.getByRole('button', { name: 'Générer' }).click()
  await expect(page.getByAltText('un vase en céramique').first()).toBeVisible()

  await page.reload()
  await expect(page.getByAltText('un vase en céramique').first()).toBeVisible()
})

test('⌘K ouvre la palette, Échap la ferme', async ({ page }) => {
  await withKey(page)
  await page.goto('/')

  await page.keyboard.press('ControlOrMeta+k')
  const palette = page.getByRole('dialog', { name: 'Palette de commandes' })
  await expect(palette).toBeVisible()

  await palette.getByLabel('Chercher une commande').fill('modèle')
  await expect(palette.getByRole('button', { name: 'Changer de modèle' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(palette).toBeHidden()
})

test("le panneau de paramètres se replie sous 1100 px", async ({ page }) => {
  await withKey(page)
  await page.setViewportSize({ width: 1024, height: 800 })
  await page.goto('/')

  await expect(page.getByRole('complementary', { name: 'Paramètres' })).toBeHidden()

  await page.getByRole('button', { name: 'Paramètres', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Paramètres' })).toBeVisible()
})

test("une clé manquante mène aux réglages, pas à un « Réessayer » stérile", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())

  // L'échec que renvoie réellement /api/generate quand aucune clé n'est
  // configurée — cf. lib/adapters/errors.ts.
  await page.route('**/api/generate', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'Clé API invalide ou manquante' }),
    })
  })

  await page.goto('/')
  await page.getByRole('dialog').getByRole('button', { name: "Entrer dans l'atelier" }).click()

  await page.getByLabel('Prompt', { exact: true }).fill('un phare dans la tempête')
  await page.getByRole('button', { name: /^Générer/ }).click()

  // Next ajoute son propre role=alert (route announcer) : viser le bandeau.
  const banner = page.getByRole('alert').filter({ hasText: 'Clé API' })
  await expect(banner).toContainText('Clé API invalide ou manquante')

  // Réessayer à l'identique ne peut que réechouer : l'action mène aux clés.
  const action = banner.getByRole('button', { name: 'Ouvrir les réglages' })
  await expect(action).toBeVisible()
  await action.click()

  await expect(page.getByRole('alert').filter({ hasText: 'Clé API' })).toHaveCount(0)
  await expect(page.getByLabel('Google AI Studio')).toBeVisible()
})

test("l'écran d'accueil tient dans un téléphone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')

  const dialog = page.getByRole('dialog', { name: 'Connecte un modèle' })
  await expect(dialog).toBeVisible()

  // La carte et son bouton principal restent dans le viewport.
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)

  await expect(dialog.getByRole('button', { name: "Entrer dans l'atelier" })).toBeInViewport()

  const debordement = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
  expect(debordement).toBe(false)
})
