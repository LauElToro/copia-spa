/**
 * Cliente HTTP para LIBIA (libia.libertyclub.io).
 * Usa la API externa de LIBIA con endpoints: /chat/user, /chat/seller/plan,
 * /chat/seller/plan/product, /chat/seller/plan/panel
 */
const LIBIA_BASE =
  process.env.NEXT_PUBLIC_LIBIA_API_URL || 'https://libia.libertyclub.io';

/** Proxy POST a LIBIA (fetch HTTP estándar para soportar HTTPS) */
export async function libiaProxyPost(
  path: string,
  body: Record<string, unknown>,
  options: { timeout?: number } = {}
): Promise<{ statusCode: number; body: string }> {
  const timeout = options.timeout ?? 30000;
  const url = `${LIBIA_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    return { statusCode: res.status, body: text };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
