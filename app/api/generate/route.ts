import { NextRequest, NextResponse } from 'next/server'
import { nanoBanana2Adapter } from '@/lib/adapters/nano-banana-2'
import { checkRateLimit } from '@/lib/rate-limit'
import type { PromptParams, GenerateResponse } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const { allowed, retryAfter } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Trop de requêtes — réessaie dans ${retryAfter}s` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let body: PromptParams

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.positiveText?.trim()) {
    return NextResponse.json({ success: false, error: 'positiveText is required' }, { status: 400 })
  }

  const apiKey = req.headers.get('x-api-key') ?? undefined

  try {
    const result = await nanoBanana2Adapter.generate(body, apiKey)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate]', message)

    const clientMessage = /api.key|api key|authentication|unauthorized/i.test(message)
      ? 'Clé API invalide ou manquante'
      : /quota|rate.limit|resource.exhausted/i.test(message)
      ? 'Quota API dépassé'
      : /no image/i.test(message)
      ? 'Aucune image retournée par le modèle'
      : 'Erreur lors de la génération'

    return NextResponse.json({ success: false, error: clientMessage }, { status: 500 })
  }
}
