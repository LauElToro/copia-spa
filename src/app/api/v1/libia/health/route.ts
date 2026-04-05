import { NextResponse } from 'next/server';

const LIBIA_BASE =
  process.env.NEXT_PUBLIC_LIBIA_API_URL || 'https://libia.libertyclub.io';

export const dynamic = 'force-dynamic';

/** Verifica si LIBIA (libia.libertyclub.io) está disponible */
export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(LIBIA_BASE, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status === 404) {
      return NextResponse.json({ status: 'healthy', available: true, source: 'libia.libertyclub.io' }, { status: 200 });
    }

    return NextResponse.json(
      {
        status: 'unavailable',
        available: false,
        message: 'LIBIA no respondió correctamente.',
        hint: 'Verifica tu conexión a libia.libertyclub.io',
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: 'unavailable',
        available: false,
        message: 'LIBIA no está disponible.',
        hint: 'Verifica tu conexión a libia.libertyclub.io',
      },
      { status: 200 }
    );
  }
}
