import { expect, test, type Page } from '@playwright/test'

/** PNG 1×1 — sert de réponse d'API mockée. */
const PIXEL =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function withKey(page: Page) {
  await page.addInitScript(() => window.localStorage.setItem('gemini_api_key', 'AIza-test'))
}

/** Compte les appels : une génération sans clé ne doit rien envoyer. */
async function mockGenerate(page: Page) {
  const calls: string[] = []
  await page.route('**/api/generate', async (route) => {
    calls.push(route.request().postData() ?? '')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ imageBase64: PIXEL, mimeType: 'image/png' }] }),
    })
  })
  return calls
}

async function generate(page: Page, prompt: string) {
  await page.getByLabel('Prompt', { exact: true }).fill(prompt)
  await page.getByRole('button', { name: /^Générer/ }).click()
}

const strip = (page: Page) => page.getByRole('navigation', { name: 'Session' })

test('premier contact : la scène invite à décrire une image', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')

  await expect(page).toHaveTitle(/Obskura/)
  await expect(page.getByRole('heading', { name: 'Décrire une image.' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Inspecteur' })).toContainText('Modèle')
})

test('sans clé, Générer demande la clé sur la scène et n’envoie rien', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  const calls = await mockGenerate(page)
  await page.goto('/')

  await generate(page, 'un phare dans la tempête')
  const card = page.getByRole('form', { name: 'Coller une clé Google' })
  await expect(card).toBeVisible()
  expect(calls).toHaveLength(0)

  // La clé enregistrée, la génération demandée part d'elle-même.
  await card.getByLabel('Clé Google').fill('AIza-test')
  await card.getByRole('button', { name: 'Enregistrer la clé' }).click()
  await expect(page.getByAltText('un phare dans la tempête')).toBeVisible()
  expect(calls).toHaveLength(1)
})

test('une génération remplit la bande et la scène, et survit au rechargement', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')

  await generate(page, 'un vase en céramique')
  await expect(page.getByAltText('un vase en céramique')).toBeVisible()
  await expect(strip(page).getByRole('button', { name: /un vase en céramique/ })).toBeVisible()
  await expect(strip(page)).toContainText('1 image')

  await page.reload()
  await expect(page.getByAltText('un vase en céramique')).toBeVisible()
})

test('cliquer une vignette ouvre sa fiche ; Supprimer est annulable', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')
  await generate(page, 'une chaise en rotin')

  await strip(page).getByRole('button', { name: /une chaise en rotin/ }).click()
  const inspector = page.getByRole('complementary', { name: 'Inspecteur' })
  await expect(inspector.getByRole('button', { name: 'Reprendre les réglages' })).toBeVisible()

  await inspector.getByRole('button', { name: /^Supprimer/ }).click()
  await expect(strip(page).getByRole('button', { name: /une chaise en rotin/ })).toHaveCount(0)
  await expect(page.getByText('Image supprimée')).toBeVisible()

  await page.getByRole('button', { name: /^Annuler/ }).click()
  await expect(strip(page).getByRole('button', { name: /une chaise en rotin/ })).toBeVisible()
})

test('un échec de clé propose la clé, pas un « Relancer » stérile', async ({ page }) => {
  await withKey(page)
  await page.route('**/api/generate', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'Clé API invalide ou manquante' }),
    })
  )
  await page.goto('/')
  await generate(page, 'un phare dans la tempête')

  const stage = page.getByRole('region', { name: 'Scène' })
  await expect(stage.getByRole('heading', { name: 'Clé requise' })).toBeVisible()
  await expect(stage.getByRole('button', { name: 'Relancer' })).toHaveCount(0)
  await stage.getByRole('button', { name: 'Coller une clé Google' }).click()
  await expect(page.getByRole('form', { name: 'Coller une clé Google' })).toBeVisible()
})

test('⌘K ouvre la palette, Échap la ferme', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('ControlOrMeta+k')
  const palette = page.getByRole('dialog')
  await expect(palette).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(palette).toBeHidden()
})

test('⇧-clic sur deux vignettes : comparaison, puis garder une image (annulable)', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')
  await generate(page, 'un vase bleu')
  await expect(page.getByAltText('un vase bleu')).toBeVisible()
  await generate(page, 'un vase rouge')
  await expect(page.getByAltText('un vase rouge')).toBeVisible()

  await strip(page).getByRole('button', { name: /un vase bleu/ }).click()
  await strip(page).getByRole('button', { name: /un vase rouge/ }).click({ modifiers: ['Shift'] })

  const inspector = page.getByRole('complementary', { name: 'Inspecteur' })
  await expect(inspector).toContainText('Comparaison')
  await expect(inspector).toContainText('un vase rouge')

  await inspector.getByRole('button', { name: 'Garder celle de gauche' }).click()
  await expect(strip(page).getByRole('button', { name: /un vase rouge/ })).toHaveCount(0)
  await page.getByRole('button', { name: /^Annuler/ }).click()
  await expect(strip(page).getByRole('button', { name: /un vase rouge/ })).toBeVisible()
})

test('trois images sélectionnées : la fiche propose l’export', async ({ page }) => {
  await withKey(page)
  await mockGenerate(page)
  await page.goto('/')
  for (const prompt of ['une pomme', 'une poire', 'une prune']) {
    await generate(page, prompt)
    await expect(page.getByAltText(prompt)).toBeVisible()
  }
  await strip(page).getByRole('button', { name: /une pomme/ }).click()
  await strip(page).getByRole('button', { name: /une poire/ }).click({ modifiers: ['Shift'] })
  await strip(page).getByRole('button', { name: /une prune/ }).click({ modifiers: ['Shift'] })

  const inspector = page.getByRole('complementary', { name: 'Inspecteur' })
  await expect(inspector.getByRole('button', { name: /Télécharger 3 images/ })).toBeVisible()
  const download = page.waitForEvent('download')
  await inspector.getByRole('button', { name: /Télécharger 3 images/ }).click()
  expect((await download).suggestedFilename()).toMatch(/^obskura-0\d-gen_\w{4}\.png$/)
})
