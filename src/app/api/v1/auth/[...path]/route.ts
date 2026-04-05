import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MS_AUTH_BASE =
  process.env.MS_AUTH_URL ||
  process.env.NEXT_PUBLIC_MS_AUTH_URL ||
  'http://ms-auth:3001';

/**
 * Proxy a /api/v1/auth/* hacia ms-auth.
 * Usado cuando las peticiones llegan a la SPA (p. ej. sin Nginx delante).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToAuth(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToAuth(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToAuth(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToAuth(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyToAuth(request, await params);
}

async function proxyToAuth(
  request: NextRequest,
  { path }: { path: string[] }
): Promise<NextResponse> {
  const pathSegments = Array.isArray(path) ? path : [];
  const subPath = pathSegments.join('/');
  const url = `${MS_AUTH_BASE.replace(/\/$/, '')}/api/v1/auth${subPath ? `/${subPath}` : ''}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
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
    console.error('[Auth proxy]', err);
    return NextResponse.json(
      { ok: false, error: 'Auth service unavailable', code: 'AUTH_PROXY_ERROR' },
      { status: 503 }
    );
  }
}
