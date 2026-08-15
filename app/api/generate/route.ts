import { NextRequest, NextResponse } from 'next/server'
import { nanoBanana2Adapter } from '@/lib/adapters/nano-banana-2'
import { gptImage2Adapter } from '@/lib/adapters/gpt-image-2'
import { checkRateLimit } from '@/lib/rate-limit'
import type { GenerateResponse, GenerationRequest } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const { allowed, retryAfter } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Trop de requêtes — réessaie dans ${retryAfter}s` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let body: GenerationRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ success: false, error: 'prompt is required' }, { status: 400 })
  }

  if (!body.params) {
    return NextResponse.json({ success: false, error: 'params is required' }, { status: 400 })
  }

  const apiKey = req.headers.get('x-api-key') ?? undefined
  const adapter = body.adapterId === 'gpt-image-2' ? gptImage2Adapter : nanoBanana2Adapter

  try {
    const results = await adapter.generate(body, apiKey)
    return NextResponse.json({ success: true, data: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate]', message)

    const clientMessage = /api.key|api key|authentication|unauthorized|incorrect api key/i.test(
      message
    )
      ? 'Clé API invalide ou manquante'
      : /quota|rate.limit|resource.exhausted|billing/i.test(message)
        ? 'Quota API dépassé'
        : /no image/i.test(message)
          ? 'Aucune image retournée par le modèle'
          : 'Erreur lors de la génération'

    return NextResponse.json({ success: false, error: clientMessage }, { status: 500 })
  }
}
