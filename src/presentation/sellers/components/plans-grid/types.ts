// src/presentation/@shared/components/organisms/PlansGrid/types.ts
export type Plan = {
  name: string;
  price: string;
  trial: string;
  label?: string;
};

export type Feature = {
  name: string;
  values: Array<boolean | string | number>;
};

export type PlansGridProps = {
  variant?: 'auto' | 'desktop' | 'mobile';
  activeIndex?: number;
  onSelectPlan?: (index: number) => void;
  onOpenPlan?: (index: number) => void;
  ctaLabel?: string;
  plans?: Plan[];
  features?: Feature[];
};

export const defaultPlans: Plan[] = [
  { name: 'Plan Starter',       price: 'Gratuito',      trial: '15 días gratis' },
  { name: 'Plan Liberty',       price: '20 USD/mes',  trial: '30 días gratis', label: 'RECOMENDADO' },
  { name: 'Plan Pro Liberty',   price: '269 USD/mes', trial: '30 días gratis' },
  { name: 'Plan Experiencia Liberty', price: '697 USD/mes', trial: '45 días gratis' },
];

export const defaultFeatures: Feature[] = [
  { name: 'Tienda Liberty',           values: [true,  true,  true,  true] },
  { name: 'Pagos en crypto',          values: [true,  true,  true,  true] },
  { name: 'Asistente IA',             values: [false, true,  true,  true] },
  { name: 'Publicidad personalizada', values: [false, false, true,  true] },
  { name: 'Gestor de cuenta',         values: [false, false, false, true] },
];
