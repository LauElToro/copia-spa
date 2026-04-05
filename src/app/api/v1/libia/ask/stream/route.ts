import { NextRequest, NextResponse } from 'next/server';
import { libiaProxyPost } from '../../libia-http';

export const dynamic = 'force-dynamic';

function getLibiaEndpoint(userType?: string): string {
  const m: Record<string, string> = {
    user: '/chat/user',
    buyer: '/chat/user',
    usuario: '/chat/user',
    seller: '/chat/seller/plan',
    panel: '/chat/seller/plan/panel',
    commerce: '/chat/seller/plan/panel',
    product: '/chat/seller/plan/product',
  };
  return m[userType || ''] || '/chat/user';
}

/** LIBIA (libia.libertyclub.io) no soporta streaming. Simulamos SSE enviando la respuesta completa en un chunk. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body.question || body.message;

    if (!body || !question) {
      return NextResponse.json(
        { error: 'Bad Request', detail: 'Se requiere "question" o "message"' },
        { status: 400 }
      );
    }

    const userType = body.userType;
    const codigoUsuario = (body.codigoIdentificacionUsuario ?? '').toString().trim() || '';
    const codigoComercio = (body.codigoIdentificacionComercio ?? '').toString().trim() || '';
    const rawPlan = (body.plan ?? '').toString().trim().toLowerCase();
    const VALID_PLANS = ['proliberter', 'partner', 'partners', 'liberter'];
    const plan = rawPlan && VALID_PLANS.includes(rawPlan) ? rawPlan : 'proliberter';
    const productId = body.productId || '';

    const libiaPayload: Record<string, unknown> = {
      message: question,
      codigo_identificacion_usuario: codigoUsuario,
      codigo_identificacion_comercio: codigoComercio,
      plan,
      ...(productId && { productId }),
    };

    const endpoint = getLibiaEndpoint(userType);
    const { statusCode, body: responseBody } = await libiaProxyPost(endpoint, libiaPayload, {
      timeout: 60000,
    });

    if (statusCode < 200 || statusCode >= 300) {
      return NextResponse.json(
        {
          response: null,
          error: 'Service Unavailable',
          detail: 'LIBIA no está disponible. Verifica tu conexión a libia.libertyclub.io',
        },
        { status: 200 }
      );
    }

    let data: { response?: string; answer?: string };
    try {
      data = JSON.parse(responseBody);
    } catch {
      return NextResponse.json(
        { response: null, error: 'Internal Server Error', detail: 'Respuesta inválida de LIBIA' },
        { status: 200 }
      );
    }

    const text = data.response ?? data.answer ?? '';
    // Simular SSE: el cliente espera data: {"chunk":"...","done":true,"full":"..."}
    const ssePayload = JSON.stringify({ chunk: text, done: true, full: `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${ssePayload}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        response: null,
        error: 'Service Unavailable',
        detail: err.message || 'LIBIA no está disponible. Verifica tu conexión.',
      },
      { status: 200 }
    );
  }
}
