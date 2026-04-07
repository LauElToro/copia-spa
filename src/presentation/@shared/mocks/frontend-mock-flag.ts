/**
 * Prototipo solo frontend (p. ej. Netlify sin BFF).
 * Por defecto activo: sin variable o distinto de "false"/"0".
 * Para volver a usar APIs reales: NEXT_PUBLIC_FRONTEND_ONLY=false
 */
export function isFrontendMockMode(): boolean {
  const v = process.env.NEXT_PUBLIC_FRONTEND_ONLY;
  if (v === 'false' || v === '0') return false;
  return true;
}

/**
 * Mock solo de Libia (chat, health, config comercio). Por defecto desactivado → fetch real a `/api/v1/libia/*`.
 * Para demo sin backend Libia: `NEXT_PUBLIC_LIBIA_MOCK=true`
 */
export function isLibiaMockMode(): boolean {
  const v = process.env.NEXT_PUBLIC_LIBIA_MOCK;
  return v === 'true' || v === '1';
}
