import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import { formatPlanNameForDisplay } from '../helpers/plan-display';

export interface Plan {
  id: number;
  name: string;
  level: number;
  price: number;
  currency: string;
  isFree: boolean;
  benefits: Array<{
    id: number;
    name: string;
    level: number;
    permissions: Array<{
      id: number;
      name: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

/** Planes de respaldo cuando ms-plans no devuelve datos (ej. seed no ejecutado) */
const FALLBACK_PLANS: Plan[] = [
  { id: 1, name: 'Plan Starter', level: 1, price: 0, currency: 'USD', isFree: true, benefits: [], createdAt: '', updatedAt: '' },
  { id: 2, name: 'Plan Liberty - Monthly', level: 2, price: 20, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 3, name: 'Plan Liberty - Annual', level: 2, price: 216, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 4, name: 'Plan Pro Liberty - Monthly', level: 3, price: 269, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 5, name: 'Plan Pro Liberty - Annual', level: 3, price: 2905, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 6, name: 'Plan Experiencia Liberty - Monthly', level: 4, price: 697, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 7, name: 'Plan Experiencia Liberty - Annual', level: 4, price: 7524, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
];

export interface PlanOption {
  value: string;
  label: string;
}

/** Etiqueta legible en español para selects (precio + período). */
export function buildPlanDropdownLabel(plan: Plan): string {
  const displayName = formatPlanNameForDisplay(plan.name);

  if (plan.isFree) {
    return `${displayName} — gratuito`;
  }

  const priceFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: plan.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(plan.price);

  if (plan.name.includes('Monthly')) {
    return `${displayName.replace(/\s*-\s*Monthly\s*$/i, '').trim()} — ${priceFormatted}/mes`;
  }
  if (plan.name.includes('Annual')) {
    return `${displayName.replace(/\s*-\s*Annual\s*$/i, '').trim()} — ${priceFormatted}/año`;
  }
  return `${displayName} — ${priceFormatted}`;
}

/**
 * Hook to fetch all plans from ms-plans
 */
export const usePlans = () => {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      try {
        const response = await axiosHelper.plans.getAll();
        const plans = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response) ? response : [];
        if (plans.length > 0) return plans;
      } catch {
        // API falló o ms-plans sin seed
      }
      return FALLBACK_PLANS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a specific plan by name
 */
export const usePlanByName = (name: string | null) => {
  return useQuery<Plan>({
    queryKey: ['plan', name],
    queryFn: async () => {
      if (!name) throw new Error('Plan name is required');
      const response = await axiosHelper.plans.getByName(name);
      return response.data;
    },
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a specific plan by ID
 */
export const usePlanById = (id: string | number | null) => {
  return useQuery<Plan>({
    queryKey: ['plan', id],
    queryFn: async () => {
      if (!id) throw new Error('Plan ID is required');
      const response = await axiosHelper.plans.getById(String(id));
      return response.data.data || response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Transform plans into dropdown options
 */
export const transformPlansToOptions = (plans: Plan[]): PlanOption[] => {
  if (!plans || plans.length === 0) return [];

  return plans
    .sort((a, b) => a.level - b.level)
    .map((plan) => ({
      value: plan.name,
      label: buildPlanDropdownLabel(plan),
    }));
};


