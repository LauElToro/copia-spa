import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MS_STORAGE_URL = process.env.NEXT_PUBLIC_MS_STORAGE_URL || 'http://localhost:3004';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * POST: Sube el logo del asistente IA del comercio.
 * Proxea a ms-storage y devuelve la URL pública.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Se requiere un archivo' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Formato no permitido. Use PNG, JPG o JPEG.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Tamaño máximo: 5 MB' },
        { status: 400 }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(`${MS_STORAGE_URL.replace(/\/$/, '')}/api/v1/storages/files/upload`, {
      method: 'POST',
      body: uploadFormData,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: 'Storage Error', message: errText || 'Error al subir archivo' },
        { status: res.status }
      );
    }

    const json = (await res.json()) as { data?: { id?: string; url?: string; filename?: string } };
    const url = json?.data?.url;

    if (!url) {
      return NextResponse.json(
        { error: 'Storage Error', message: 'La respuesta no incluyó la URL del archivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url, success: true });
  } catch (err) {
    console.error('[upload-logo] Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (err as Error).message },
      { status: 500 }
    );
  }
}
