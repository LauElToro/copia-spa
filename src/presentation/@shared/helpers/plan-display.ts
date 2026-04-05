/**
 * Normaliza el nombre de un plan para mostrarlo en la UI.
 * Corrige errores frecuentes: inglés "plane", confusiones "Avión/Avion" con "plan".
 */
export function formatPlanNameForDisplay(name: string): string {
  if (!name) return name;
  let s = name.trim();
  s = s.replace(/\bplane\b/gi, 'Plan');
  s = s.replace(/\bavion\b/gi, 'Plan');
  s = s.replace(/\bAvion\b/g, 'Plan');
  s = s.replace(/\bAvión\b/g, 'Plan');
  s = s.replace(/\bPlan\s+Plan\b/gi, 'Plan');
  return s;
}
