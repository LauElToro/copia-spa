import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const defaultEmpresa = {
  nombre: '',
  slogan: '',
  valores: '',
  objetivo: '',
  ubicacion: '',
  descripcion: '',
  trayectoria: '',
  tipo_producto: '',
  marca_producto: '',
  ventajasTienda: '',
};

const defaultConfig = {
  empresa: defaultEmpresa,
  nombre_ia: '',
  imagen_url: '',
  politicas: {} as Record<string, unknown>,
  logistica: {} as Record<string, unknown>,
  pagos: {} as Record<string, unknown>,
  personalidad: { tono: [] as string[], emojis: '', identidad: '' },
  otros: { casosFrecuentes: '', derivarHumano: '', grupo3: '' },
};

/** Persistencia en memoria para desarrollo. Si LIBIA_CONFIG_API_URL está definido, se usa como backend. */
const store = new Map<string, typeof defaultConfig>();

function getBackendUrl(): string {
  const explicit = process.env.LIBIA_CONFIG_API_URL;
  if (explicit) return explicit;
  const libiaBase = process.env.NEXT_PUBLIC_LIBIA_API_URL;
  if (libiaBase) return `${libiaBase.replace(/\/$/, '')}/api/v1/comercio/config`;
  return '';
}

/** Construye estaticas en formato compatible con comercios_ia / LIBIA */
function buildEstaticas(config: typeof defaultConfig) {
  return {
    empresa: config.empresa,
    politicas: config.politicas,
    logistica: config.logistica,
    pagos: config.pagos,
    atencionCliente: (config.politicas as Record<string, unknown>)?.atencionCliente ?? {},
    otros: config.otros,
  };
}

/**
 * GET: Obtener configuración del asistente IA del comercio.
 * Requiere storeId o codigo_identificacion_comercio.
 * Si LIBIA_CONFIG_API_URL está definido, hace proxy al backend.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') ?? searchParams.get('codigo_identificacion_comercio');
  if (!storeId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Se requiere storeId o codigo_identificacion_comercio' },
      { status: 400 }
    );
  }

  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const url = `${backendUrl.replace(/\/$/, '')}?storeId=${encodeURIComponent(storeId)}&codigo_identificacion_comercio=${encodeURIComponent(storeId)}`;
      const res = await fetch(url, {
        headers: request.headers.get('authorization') ? { Authorization: request.headers.get('authorization')! } : {},
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ ...defaultConfig, ...data });
      }
    } catch (e) {
      console.warn('[libia/config] Backend fetch failed:', e);
    }
  }

  const saved = store.get(storeId);
  return NextResponse.json(saved ? { ...defaultConfig, ...saved } : defaultConfig);
}

/**
 * POST: Guardar configuración del asistente IA del comercio.
 * Si LIBIA_CONFIG_API_URL está definido, envía al backend (comercios_ia).
 * Sino, persiste en memoria (desarrollo).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const storeId = body.storeId ?? body.codigo_identificacion_comercio;
    if (!storeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Se requiere storeId o codigo_identificacion_comercio' },
        { status: 400 }
      );
    }

    const merged = {
      ...defaultConfig,
      ...(store.get(storeId) ?? {}),
      empresa: { ...defaultEmpresa, ...(body.empresa ?? {}) },
      nombre_ia: body.nombre_ia ?? store.get(storeId)?.nombre_ia ?? '',
      imagen_url: body.imagen_url ?? store.get(storeId)?.imagen_url ?? '',
      politicas: { ...(body.politicas ?? store.get(storeId)?.politicas ?? {}) },
      logistica: { ...(body.logistica ?? store.get(storeId)?.logistica ?? {}) },
      pagos: { ...(body.pagos ?? store.get(storeId)?.pagos ?? {}) },
      personalidad: {
        ...(store.get(storeId)?.personalidad ?? defaultConfig.personalidad),
        ...(body.personalidad ?? {}),
      },
      otros: {
        ...(store.get(storeId)?.otros ?? defaultConfig.otros),
        ...(body.otros ?? {}),
      },
    };

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const payload = {
          storeId,
          codigo_identificacion_comercio: storeId,
          ...merged,
          estaticas: buildEstaticas(merged),
        };
        const res = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('authorization') ? { Authorization: request.headers.get('authorization') } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return NextResponse.json(
            { error: 'Backend Error', message: (err as { message?: string }).message ?? 'Error al guardar en backend' },
            { status: res.status }
          );
        }
      } catch (e) {
        console.warn('[libia/config] Backend POST failed:', e);
        return NextResponse.json(
          { error: 'Service Unavailable', message: 'No se pudo conectar con el backend de configuración' },
          { status: 503 }
        );
      }
    } else {
      store.set(storeId, merged);
    }

    return NextResponse.json({ success: true, message: 'Configuración guardada correctamente.' });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Error al procesar' },
      { status: 500 }
    );
  }
}
