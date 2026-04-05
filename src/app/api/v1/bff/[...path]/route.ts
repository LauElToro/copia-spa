import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BFF_BASE =
  process.env.BFF_API_URL ||
  process.env.NEXT_PUBLIC_BFF_API_URL ||
  'http://bff-api:3005';

/**
 * Proxy a /api/v1/bff/* hacia el BFF (bff-api).
 * Usado cuando las peticiones llegan a la SPA (p. ej. sin Nginx delante o mismo origen).
 * En Docker, bff-api:3005 resuelve en la red compartida.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBff(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBff(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBff(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBff(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToBff(request, await params);
}

async function proxyToBff(
  request: NextRequest,
  { path }: { path: string[] }
): Promise<NextResponse> {
  const pathSegments = Array.isArray(path) ? path : [];
  const subPath = pathSegments.join('/');
  const url = `${BFF_BASE.replace(/\/$/, '')}/api/v1/bff${subPath ? `/${subPath}` : ''}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      key.toLowerCase() !== 'host' &&
      key.toLowerCase() !== 'connection'
    ) {
      headers.set(key, value);
    }
  });

  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    // no body
  }

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
      duplex: 'half',
    } as RequestInit);

    const resBody = await res.text();
    let parsed: unknown;
    if (resBody.trim() === '') {
      parsed = { ok: true };
    } else {
      try {
        parsed = JSON.parse(resBody);
      } catch {
        parsed = resBody;
      }
    }

    return NextResponse.json(parsed, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err) {
    console.error('[BFF proxy]', err);
    return NextResponse.json(
      { ok: false, error: 'BFF unavailable', code: 'BFF_PROXY_ERROR' },
      { status: 503 }
    );
  }
}
