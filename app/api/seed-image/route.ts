import { NextResponse } from 'next/server'

/**
 * Proxy des photos de démonstration. Le client ne peut pas appeler picsum
 * directement — la CSP limite `connect-src` à l'origine, et la règle du projet
 * veut que tout appel externe passe par `app/api/`.
 *
 * L'URL amont est construite ici à partir d'un simple index numérique : rien de
 * ce que l'appelant envoie ne se retrouve dans l'hôte contacté.
 */
const UPSTREAM = 'https://picsum.photos/seed'
const EDGE = 1024
const MAX_INDEX = 200

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Indisponible en production' }, { status: 404 })
  }

  const raw = Number(new URL(request.url).searchParams.get('i'))
  if (!Number.isInteger(raw) || raw < 0 || raw > MAX_INDEX) {
    return NextResponse.json({ error: 'Index invalide' }, { status: 400 })
  }

  const upstream = await fetch(`${UPSTREAM}/imgc-${raw}/${EDGE}/${EDGE}.jpg`)
  if (!upstream.ok) {
    return NextResponse.json({ error: `Source indisponible (${upstream.status})` }, { status: 502 })
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  })
}
