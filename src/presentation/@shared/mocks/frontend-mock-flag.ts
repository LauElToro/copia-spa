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
