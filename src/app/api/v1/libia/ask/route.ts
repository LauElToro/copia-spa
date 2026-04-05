import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LIBIA_BASE =
  process.env.NEXT_PUBLIC_LIBIA_API_URL || 'https://libia.libertyclub.io';

/**
 * Patrón marketplace: pega directo a libia.libertyclub.io, moldea el payload
 * según el contexto (user/seller/panel/product) y devuelve la respuesta tal cual.
 * Ver marketplace/assets/components/fetch-libia.php, fetchAiSeller.php, etc.
 */

const ENDPOINTS: Record<string, string> = {
  user: '/chat/user',
  buyer: '/chat/user',
  usuario: '/chat/user',
  seller: '/chat/seller/plan',
  panel: '/chat/seller/plan/panel',
  commerce: '/chat/seller/plan/panel',
  product: '/chat/seller/plan/product',
};

const VALID_PLANS = ['proliberter', 'partner', 'partners', 'liberter'];

/** Moldea el payload del frontend al formato exacto que LIBIA espera (snake_case). */
function moldPayload(body: Record<string, unknown>, userType: string): Record<string, unknown> {
  const message = (body.message ?? body.question ?? '').toString().trim();
  const rawPlan = (body.plan != null ? String(body.plan) : '').trim().toLowerCase();
  const plan = rawPlan && VALID_PLANS.includes(rawPlan) ? rawPlan : 'proliberter';
  const codigoUsuario =
    (body.codigo_identificacion_usuario ??
      body.codigoIdentificacionUsuario ??
      '').toString().trim() || '';
  const codigoComercio =
    (body.codigo_identificacion_comercio ??
      body.codigoIdentificacionComercio ??
      '').toString().trim() || '';

  const payload: Record<string, unknown> = {
    message,
    user_type: userType === 'user' || userType === 'usuario' ? 'usuario' : userType,
    codigo_identificacion_usuario: codigoUsuario,
    codigo_identificacion_comercio: codigoComercio,
    plan,
  };

  if (body.productId) payload.productId = body.productId;
  if (body.nombre_producto) payload.nombre_producto = body.nombre_producto;
  if (body.descripcion_producto) payload.descripcion_producto = body.descripcion_producto;
  if (body.imagenes) payload.imagenes = body.imagenes;
  if (body.precio != null) payload.precio = body.precio;
  if (body.categoria) payload.categoria = body.categoria;

  return payload;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Use POST' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.question ?? body.message;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { detail: 'Se requiere "question" o "message"' },
        { status: 400 }
      );
    }

    const userType = (body.userType ?? 'user').toString();
    const path = ENDPOINTS[userType] ?? ENDPOINTS.user;
    const url = `${LIBIA_BASE.replace(/\/$/, '')}${path}`;
    const payload = moldPayload(body, userType);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(t);

    const text = await res.text();
    const status = res.status;

    // Devolver la respuesta de LIBIA tal cual (patrón marketplace)
    return new NextResponse(text, {
      status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (err) {
    const e = err as Error & { name?: string; cause?: unknown };
    console.error('LIBIA /ask error:', e?.message ?? e);
    if (e?.cause) console.error('LIBIA /ask cause:', e.cause);

    if (e?.name === 'AbortError') {
      return NextResponse.json(
        { response: null, detail: 'Tiempo de espera agotado. Inténtalo de nuevo.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        response: null,
        detail:
          'LIBIA (libia.libertyclub.io) no está disponible. Verifica tu conexión.',
      },
      { status: 502 }
    );
  }
}
