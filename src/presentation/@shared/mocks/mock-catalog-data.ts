import type { CategoryEntity } from '../types/product';

/** Usuario demo para login simulado y checkout */
export const MOCK_DEMO_ACCOUNT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const now = new Date().toISOString();

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const MOCK_CATEGORIES: CategoryEntity[] = [
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    name: 'Electronica',
    description: 'Tecnología y gadgets',
    parent_id: null,
    parentId: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc02',
    name: 'Moda',
    description: 'Indumentaria',
    parent_id: null,
    parentId: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc03',
    name: 'Deportes',
    description: 'Fitness y outdoor',
    parent_id: null,
    parentId: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc04',
    name: 'Hogar',
    description: 'Decoración y muebles',
    parent_id: null,
    parentId: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc05',
    name: 'Libros',
    description: 'Lectura',
    parent_id: null,
    parentId: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccc06',
    name: 'Inversiones',
    description: 'Cursos y activos digitales',
    parent_id: null,
    parentId: null,
  },
];

export const MOCK_STORES = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    account_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    accountId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Crypto Andes',
    description: 'Hardware wallets y accesorios crypto con envío express.',
    information: {
      description: 'Tienda especializada en seguridad para tus activos digitales.',
      location: { city: 'Buenos Aires', country: 'AR' },
      phone: { country_code: '+54', number: '11 5555-0101' },
      banner: img('store-crypto-andes-banner', 1200, 400),
      logo: img('store-crypto-andes-logo', 200, 200),
    },
    kyc: { status: 'approved' },
    kyb: { status: 'approved' },
    rating: 4.7,
    totalReviews: 128,
    plan: 'Pro',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    account_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    accountId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Moda Urbana Libre',
    description: 'Streetwear y sneakers edición limitada.',
    information: {
      description: 'Indumentaria urbana con pagos en stablecoins.',
      location: { city: 'Córdoba', country: 'AR' },
      phone: { country_code: '+54', number: '351 600-9090' },
      banner: img('store-moda-banner', 1200, 400),
      logo: img('store-moda-logo', 200, 200),
    },
    kyc: { status: 'approved' },
    kyb: { status: 'approved' },
    rating: 4.5,
    totalReviews: 86,
    plan: 'Liberty',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    account_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    accountId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Tech House',
    description: 'Notebooks, audio y smart home.',
    information: {
      description: 'Electrónica con garantía oficial y factura A.',
      location: { city: 'Rosario', country: 'AR' },
      banner: img('store-tech-banner', 1200, 400),
      logo: img('store-tech-logo', 200, 200),
    },
    kyc: { status: 'approved' },
    kyb: { status: 'approved' },
    rating: 4.9,
    totalReviews: 240,
    plan: 'Experiencia',
  },
];

type MockProduct = Record<string, unknown>;

const baseProduct = (
  id: string,
  name: string,
  storeId: string,
  accountId: string,
  categoryId: string,
  priceUsdt: number,
  extra: Partial<MockProduct> = {}
): MockProduct => ({
  id,
  name,
  price: priceUsdt,
  crypto: 'USDT',
  description: `${name} — producto de demostración del prototipo Liberty Club.`,
  category_identification_code: categoryId,
  creation_date: now,
  status: 'approved',
  visits: Math.floor(Math.random() * 500) + 50,
  sales: Math.floor(Math.random() * 80) + 5,
  stock: 25,
  year: 2025,
  condition: 'new',
  active_status: 1,
  account_id: accountId,
  accountId,
  store_id: storeId,
  storeId,
  pricing: {
    values: [
      { amount: priceUsdt, currency: 'USDT', usdPerUnit: 1, note: null },
      { amount: priceUsdt * 1400, currency: 'ARS', usdPerUnit: 1 / 1400, note: null },
    ],
    referenceAt: now,
    referenceBase: 'USDT',
  },
  photos: [
    {
      id: `${id}-p1`,
      image_url: img(`prod-${id}-1`),
      product_id: id,
    },
  ],
  engagementStats: {
    rating: {
      average: 4.6,
      totalOpinions: 34,
      totalWithRating: 30,
      distribution: { '1': 0, '2': 1, '3': 3, '4': 10, '5': 20 },
    },
    visits: { total: 120, uniqueVisitors: 90, lastVisitAt: now },
    sales: { unitsSold: 12 },
  },
  ...extra,
});

export const MOCK_PRODUCTS: MockProduct[] = [
  baseProduct(
    'p10101010-1010-4101-8101-101010101010',
    'Ledger Nano X',
    MOCK_STORES[0].id,
    MOCK_STORES[0].account_id as string,
    MOCK_CATEGORIES[0].id,
    149,
    { promotion: '10%' }
  ),
  baseProduct(
    'p10101010-1010-4101-8101-101010101011',
    'Trezor Safe 3',
    MOCK_STORES[0].id,
    MOCK_STORES[0].account_id as string,
    MOCK_CATEGORIES[0].id,
    98
  ),
  baseProduct(
    'p20202020-2020-4202-8202-202020202020',
    'Remera Liberty Club edición limitada',
    MOCK_STORES[1].id,
    MOCK_STORES[1].account_id as string,
    MOCK_CATEGORIES[1].id,
    35,
    { promotion: '15%' }
  ),
  baseProduct(
    'p20202020-2020-4202-8202-202020202021',
    'Zapatillas urbanas Pro',
    MOCK_STORES[1].id,
    MOCK_STORES[1].account_id as string,
    MOCK_CATEGORIES[1].id,
    210
  ),
  baseProduct(
    'p30303030-3030-4303-8303-303030303030',
    'Mat de yoga eco',
    MOCK_STORES[1].id,
    MOCK_STORES[1].account_id as string,
    MOCK_CATEGORIES[2].id,
    28
  ),
  baseProduct(
    'p40404040-4040-4404-8404-404040404040',
    'MacBook Air M3 16GB',
    MOCK_STORES[2].id,
    MOCK_STORES[2].account_id as string,
    MOCK_CATEGORIES[0].id,
    1180,
    { promotion: '5%' }
  ),
  baseProduct(
    'p40404040-4040-4404-8404-404040404041',
    'Auriculares ANC Studio',
    MOCK_STORES[2].id,
    MOCK_STORES[2].account_id as string,
    MOCK_CATEGORIES[0].id,
    199
  ),
  baseProduct(
    'p50505050-5050-4505-8505-505050505050',
    'Lámpara smart RGB',
    MOCK_STORES[2].id,
    MOCK_STORES[2].account_id as string,
    MOCK_CATEGORIES[3].id,
    45
  ),
  baseProduct(
    'p60606060-6060-4606-8606-606060606060',
    'Pack curso DeFi para principiantes',
    MOCK_STORES[0].id,
    MOCK_STORES[0].account_id as string,
    MOCK_CATEGORIES[5].id,
    75,
    { promotion: '20%' }
  ),
  baseProduct(
    'p70707070-7070-4707-8707-707070707070',
    'Guía inversión en stablecoins',
    MOCK_STORES[0].id,
    MOCK_STORES[0].account_id as string,
    MOCK_CATEGORIES[5].id,
    22
  ),
];

export function findStoreById(id: string) {
  return MOCK_STORES.find((s) => s.id === id);
}

export function findProductById(id: string) {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

function parsePromotionPercent(promotion: unknown): number | null {
  if (typeof promotion !== 'string') return null;
  const m = promotion.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function filterMockProducts(params: Record<string, string | undefined>): MockProduct[] {
  let list = [...MOCK_PRODUCTS];

  const storeId = params.storeId;
  if (storeId) {
    list = list.filter((p) => (p.storeId as string) === storeId || (p.store_id as string) === storeId);
  }

  const accountId = params.account_id;
  if (accountId) {
    list = list.filter((p) => (p.accountId as string) === accountId || (p.account_id as string) === accountId);
  }

  const cat = params.category_identification_code;
  if (cat) {
    list = list.filter((p) => p.category_identification_code === cat);
  }

  if (params.has_promotion === 'true') {
    list = list.filter((p) => parsePromotionPercent(p.promotion) != null);
  }

  if (params.status === 'approved') {
    list = list.filter((p) => p.status === 'approved');
  }
  if (params.active_status === '1') {
    list = list.filter((p) => p.active_status === 1);
  }

  return list;
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const p = Math.max(1, page);
  const l = Math.max(1, Math.min(limit, 500));
  const offset = (p - 1) * l;
  const slice = items.slice(offset, offset + l);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / l));
  return {
    data: slice,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
      offset,
    },
  };
}
