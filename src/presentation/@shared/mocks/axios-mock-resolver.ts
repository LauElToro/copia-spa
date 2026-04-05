import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { buildMockAccessToken } from './mock-auth-tokens';
import {
  filterMockProducts,
  findProductById,
  findStoreById,
  MOCK_CATEGORIES,
  MOCK_DEMO_ACCOUNT_ID,
  MOCK_PRODUCTS,
  MOCK_STORES,
  paginate,
} from './mock-catalog-data';

const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1').replace(/\/$/, '');

function wrapApi<T>(data: T) {
  return {
    success: true,
    message: 'OK (mock)',
    correlationId: 'mock-correlation',
    data,
    meta: { timestamp: new Date().toISOString(), version: 'mock-1' },
  };
}

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const d = config.data;
  if (!d) return {};
  if (typeof d === 'string') {
    try {
      return JSON.parse(d) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof d === 'object' && !Array.isArray(d)) {
    return d as Record<string, unknown>;
  }
  return {};
}

function requestPathAndQuery(config: InternalAxiosRequestConfig): { pathname: string; searchParams: URLSearchParams } {
  let uri: string;
  try {
    uri = axios.getUri(config);
  } catch {
    uri = `${config.baseURL || ''}${config.url || ''}`;
  }
  let pathname = '/';
  let search = '';
  try {
    const u = new URL(uri, 'http://mock.local');
    pathname = u.pathname;
    search = u.search;
  } catch {
    pathname = (config.url || '/').split('?')[0];
    search = '';
  }
  return { pathname, searchParams: new URLSearchParams(search) };
}

function mockResponse<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  } as AxiosResponse<T>;
}

const FALLBACK_PLANS = [
  { id: 1, name: 'Plan Starter', level: 1, price: 0, currency: 'USD', isFree: true, benefits: [], createdAt: '', updatedAt: '' },
  { id: 2, name: 'Plan Liberty - Monthly', level: 2, price: 20, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 3, name: 'Plan Liberty - Annual', level: 2, price: 216, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 4, name: 'Plan Pro Liberty - Monthly', level: 3, price: 269, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
  { id: 5, name: 'Plan Pro Liberty - Annual', level: 3, price: 2905, currency: 'USD', isFree: false, benefits: [], createdAt: '', updatedAt: '' },
];

export function tryResolveAxiosMock(config: InternalAxiosRequestConfig): AxiosResponse | null {
  const method = (config.method || 'get').toLowerCase();
  const { pathname, searchParams } = requestPathAndQuery(config);

  const p = (key: string) => searchParams.get(key) ?? undefined;

  const isApi = pathname.startsWith(API_PREFIX) || pathname.startsWith('/api/v1');
  const rel = pathname.includes(API_PREFIX)
    ? pathname.slice(pathname.indexOf(API_PREFIX) + API_PREFIX.length) || '/'
    : pathname.replace(/^\/api\/v1/, '') || '/';

  // --- Auth (ms-auth) ---
  if (rel === '/auth/login' && method === 'post') {
    const body = parseBody(config);
    const email = typeof body.email === 'string' ? body.email : 'demo@libertyclub.io';
    const accountId = MOCK_DEMO_ACCOUNT_ID;
    const accessToken = buildMockAccessToken(accountId);
    return mockResponse(
      config,
      wrapApi({
        accessToken,
        refreshToken: `refresh-${accessToken}`,
        user: { id: accountId, email, name: email.split('@')[0] || 'Demo' },
        accountId,
      })
    );
  }

  if (rel === '/auth/register' && method === 'post') {
    const accountId = MOCK_DEMO_ACCOUNT_ID;
    const accessToken = buildMockAccessToken(accountId);
    return mockResponse(
      config,
      wrapApi({
        accessToken,
        refreshToken: `refresh-${accessToken}`,
        user: { id: accountId, email: 'nuevo@demo.io', name: 'Nuevo usuario' },
        accountId,
      })
    );
  }

  if (rel === '/auth/validate-token' && method === 'post') {
    return mockResponse(config, wrapApi({ valid: true }));
  }

  if (rel === '/auth/logout' && method === 'post') {
    return mockResponse(config, wrapApi({ ok: true }));
  }

  if (rel === '/auth/token/refresh' && method === 'post') {
    const accountId = MOCK_DEMO_ACCOUNT_ID;
    return mockResponse(
      config,
      wrapApi({
        accessToken: buildMockAccessToken(accountId),
        refreshToken: `refresh-${Date.now()}`,
      })
    );
  }

  if ((rel === '/auth/request-otp' || rel === '/auth/verify-otp') && method === 'post') {
    return mockResponse(
      config,
      wrapApi({ message: 'OTP mock', userId: MOCK_DEMO_ACCOUNT_ID, expiresIn: 600 })
    );
  }

  // --- Account ---
  if (rel.startsWith('/accounts/users') && method === 'get') {
    const id = p('id');
    const email = p('email');
    const uid = id || MOCK_DEMO_ACCOUNT_ID;
    return mockResponse(
      config,
      wrapApi({
        id: uid,
        name: email?.split('@')[0] || 'Usuario Demo',
        accountType: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }

  if (rel === '/accounts' && method === 'post') {
    return mockResponse(
      config,
      wrapApi({
        id: MOCK_DEMO_ACCOUNT_ID,
        name: 'Nuevo',
        accountType: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }

  if (rel.startsWith('/accounts/users/') && method === 'put') {
    return mockResponse(config, wrapApi({ id: MOCK_DEMO_ACCOUNT_ID, updated: true }));
  }

  if (rel.startsWith('/accounts/store') && method === 'get') {
    const store = MOCK_STORES[0];
    return mockResponse(config, wrapApi(store));
  }

  if (rel.includes('/accounts/store/') && method === 'put') {
    return mockResponse(config, wrapApi({ id: MOCK_STORES[0].id, updated: true }));
  }

  // --- Ambassadors (404 evita error en UI) ---
  if (rel.includes('/accounts/ambassadors/me') && method === 'get') {
    return mockResponse(config, { message: 'Not ambassador' }, 404);
  }

  if (rel.includes('/accounts/ambassadors/') && method === 'get') {
    return mockResponse(config, wrapApi([]));
  }

  if (rel.includes('/accounts/ambassadors/activate') && method === 'post') {
    return mockResponse(config, wrapApi({ ok: true }));
  }

  // --- Plans ---
  if (rel === '/plans' && method === 'get' && searchParams.has('name')) {
    const name = searchParams.get('name') || '';
    const plan = FALLBACK_PLANS.find((x) => x.name === name) || FALLBACK_PLANS[1];
    return mockResponse(config, plan as unknown as Record<string, unknown>);
  }

  if (rel === '/plans' && method === 'get') {
    return mockResponse(config, wrapApi(FALLBACK_PLANS));
  }

  if (/^\/plans\/[^/]+$/.test(rel) && method === 'get') {
    const id = rel.split('/')[2];
    const plan = FALLBACK_PLANS.find((x) => String(x.id) === id) || FALLBACK_PLANS[0];
    return mockResponse(config, wrapApi(plan));
  }

  if (rel.startsWith('/subscriptions/') && method === 'get') {
    return mockResponse(config, wrapApi(null));
  }

  if (rel.includes('/subscriptions/downgrade') && method === 'post') {
    return mockResponse(config, wrapApi({ ok: true }));
  }

  // --- Products ---
  if (rel === '/products/categories' && method === 'get') {
    return mockResponse(config, wrapApi(MOCK_CATEGORIES));
  }

  const productEngagementsRe = /^\/products\/([^/]+)\/engagements\/?$/;
  const productEngagementsStatsRe = /^\/products\/([^/]+)\/engagements\/stats\/?$/;
  const productPhotosRe = /^\/products\/([^/]+)\/photos\/?$/;
  const productIdRe = /^\/products\/([^/]+)\/?$/;

  if (rel.match(productEngagementsStatsRe) && method === 'get') {
    return mockResponse(
      config,
      wrapApi({
        rating: { average: 4.5, totalOpinions: 10, distribution: { '1': 0, '2': 0, '3': 1, '4': 3, '5': 6 } },
        visits: { total: 50, uniqueVisitors: 40 },
        sales: { unitsSold: 5 },
      })
    );
  }

  if (rel.match(productEngagementsRe) && method === 'get') {
    return mockResponse(
      config,
      wrapApi({
        items: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false, offset: 0 },
      })
    );
  }

  if (rel.match(productEngagementsRe) && method === 'post') {
    return mockResponse(config, wrapApi({ recorded: true }));
  }

  if (rel.match(productPhotosRe) && method === 'get') {
    const m = rel.match(productPhotosRe);
    const pid = m?.[1];
    const pr = pid ? findProductById(pid) : undefined;
    const photos = (pr?.photos as unknown[]) || [];
    return mockResponse(config, wrapApi(photos));
  }

  if (rel.match(productIdRe) && method === 'get' && !rel.includes('/engagements') && !rel.includes('/photos')) {
    const m = rel.match(productIdRe);
    const pid = m?.[1];
    if (pid && pid !== 'categories' && pid !== 'bulk' && pid !== 'stats' && pid !== 'engagements') {
      const prod = findProductById(pid);
      if (prod) return mockResponse(config, wrapApi(prod));
    }
  }

  if ((rel === '/products' || rel === '/products/') && method === 'get') {
    const params: Record<string, string | undefined> = {
      storeId: p('storeId'),
      account_id: p('account_id'),
      category_identification_code: p('category_identification_code'),
      has_promotion: p('has_promotion'),
      status: p('status'),
      active_status: p('active_status'),
    };
    const page = Number(p('page') || '1');
    const limit = Number(p('limit') || '24');
    const filtered = filterMockProducts(params);
    const pageData = paginate(filtered, page, limit);
    return mockResponse(config, wrapApi(pageData));
  }

  if (rel === '/products/bulk' && method === 'post') {
    return mockResponse(config, wrapApi({ created: 0 }));
  }

  if ((rel === '/products' || rel.startsWith('/products')) && method === 'post') {
    const body = parseBody(config);
    const newId = `mock-${Date.now()}`;
    const created = {
      ...body,
      id: newId,
      name: String(body.name || 'Producto nuevo'),
      status: 'approved',
      stock: Number(body.stock) || 10,
      creation_date: new Date().toISOString(),
    };
    return mockResponse(config, wrapApi(created));
  }

  if (rel.match(/^\/products\/[^/]+$/) && method === 'put') {
    const body = parseBody(config);
    return mockResponse(config, wrapApi({ ...body, updated: true }));
  }

  if (rel.match(/^\/products\/[^/]+$/) && method === 'delete') {
    return mockResponse(config, wrapApi({ deleted: true }));
  }

  // --- Stores ---
  if (rel === '/stores/list' && method === 'get') {
    const page = Number(p('page') || '1');
    const limit = Number(p('limit') || '12');
    const search = (p('search') || '').toLowerCase();
    let items = [...MOCK_STORES];
    if (search) {
      items = items.filter((s) => (s.name as string).toLowerCase().includes(search));
    }
    const pageData = paginate(items, page, limit);
    return mockResponse(config, wrapApi(pageData));
  }

  if (rel.startsWith('/stores/public/by-account/') && method === 'get') {
    const accountId = rel.split('/').pop() || '';
    const store = MOCK_STORES.find((s) => (s.account_id as string) === accountId) || MOCK_STORES[0];
    return mockResponse(config, wrapApi(store));
  }

  const publicStoreRe = /^\/stores\/public\/([^/]+)\/?$/;
  if (rel.match(publicStoreRe) && method === 'get') {
    const id = rel.match(publicStoreRe)?.[1];
    const store = id ? findStoreById(id) : undefined;
    if (store) return mockResponse(config, wrapApi(store));
  }

  if (rel.startsWith('/stores/kyc/') || rel.startsWith('/stores/kyb/')) {
    if (method === 'get') {
      return mockResponse(config, wrapApi({ status: 'approved', reviewResult: { reviewAnswer: 'GREEN' } }));
    }
    return mockResponse(config, wrapApi({ ok: true }));
  }

  if (rel.match(/^\/stores\/[^/]+$/) && method === 'get') {
    const id = rel.split('/')[2];
    const store = findStoreById(id);
    if (store) return mockResponse(config, wrapApi(store));
  }

  if (rel === '/stores' && method === 'post') {
    const body = parseBody(config);
    return mockResponse(
      config,
      wrapApi({
        id: 'new-store-mock',
        ...body,
      })
    );
  }

  if (rel.match(/^\/stores\/[^/]+$/) && (method === 'put' || method === 'delete')) {
    return mockResponse(config, wrapApi({ ok: true }));
  }

  if (rel.includes('/integrations/crypto-wallets') && method === 'get') {
    return mockResponse(
      config,
      wrapApi({
        wallets: [
          { network: 'ERC-20', token: 'USDT', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
        ],
      })
    );
  }

  // --- Payments ---
  if (rel.includes('/payments/payment-orders') && method === 'post') {
    const body = parseBody(config);
    const orderId = typeof body.orderId === 'string' ? body.orderId : `ORD-MOCK-${Date.now()}`;
    return mockResponse(
      config,
      wrapApi({
        id: `pay-${Date.now()}`,
        orderId,
        userId: String(body.userId || MOCK_DEMO_ACCOUNT_ID),
        status: 'PENDING',
        transactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }

  if (rel.includes('/payments/payment-orders') && method === 'get') {
    return mockResponse(config, wrapApi({ items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } }));
  }

  if (rel.includes('/payments/uala-payments/') && method === 'post') {
    return mockResponse(
      config,
      wrapApi({ checkoutId: `uala-${Date.now()}`, redirectUrl: 'https://ejemplo.netlify.app/checkout/success?orderId=demo' })
    );
  }

  if (rel.includes('/payments/uala-payments/') && method === 'get') {
    return mockResponse(config, wrapApi({ status: 'approved' }));
  }

  if (rel.includes('/payments/currencies') && method === 'get') {
    const currencies = [
      { code: 'USDT', name: 'Tether', symbol: '₮', usdPerUnit: 1, type: 'CRYPTO' as const, network: 'ERC-20' },
      { code: 'USDT', name: 'Tether BSC', symbol: '₮', usdPerUnit: 1, type: 'CRYPTO' as const, network: 'BEP-20' },
      { code: 'BTC', name: 'Bitcoin', symbol: '₿', usdPerUnit: 65000, type: 'CRYPTO' as const, network: 'BTC' },
    ];
    return mockResponse(config, wrapApi(currencies));
  }

  if (rel.includes('/payments/banks') && method === 'get') {
    return mockResponse(
      config,
      wrapApi([
        {
          id: 'bank-1',
          bcra: { entityCode: 7, name: 'Banco Galicia' },
          status: 'ACTIVE',
        },
      ])
    );
  }

  if (rel.includes('/payments/crypto/validate') && method === 'post') {
    return mockResponse(
      config,
      wrapApi({
        transactionId: 'mock',
        txHash: '0xmock',
        status: 'confirmed',
        amount: '1',
        currency: 'USDT',
        network: 'ERC-20',
        sender: '0xsender',
        receiver: '0xreceiver',
        timestamp: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
      })
    );
  }

  if (rel.includes('/payments/crypto/status/') && method === 'get') {
    return mockResponse(config, { txHash: '0xmock', status: 'confirmed', network: 'ERC-20' });
  }

  if (rel.includes('/payments/crypto/wallet/') && method === 'get') {
    return mockResponse(
      config,
      wrapApi({
        wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        network: 'ERC-20',
        currency: 'USDT',
        storeId: MOCK_STORES[0].id,
      })
    );
  }

  if (rel.includes('/payments/crypto/networks') && method === 'get') {
    return mockResponse(config, { networks: ['ERC-20', 'BEP-20', 'TRC-20', 'BTC'] });
  }

  // --- Shippings ---
  if (rel.includes('/shippings') && method === 'post') {
    const body = parseBody(config);
    const id = `SHIP-MOCK-${Date.now()}`;
    return mockResponse(
      config,
      wrapApi({
        id,
        orderId: body.orderId,
        storeId: body.storeId,
        status: body.status || 'PENDING',
        carrier: body.carrier || 'CUSTOM',
        origin: body.origin,
        destination: body.destination,
        dimensions: body.dimensions,
        shippingCost: body.shippingCost ?? 0,
        currency: body.currency || 'USD',
        creationDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }

  if (rel.includes('/shippings') && method === 'get') {
    return mockResponse(config, wrapApi([]));
  }

  // --- Transactions ---
  if (rel.startsWith('/transactions') && method === 'get') {
    return mockResponse(config, wrapApi({ items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } }));
  }

  // --- Questions ---
  if (rel.includes('/questions/product/') && method === 'get') {
    return mockResponse(
      config,
      wrapApi({
        items: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false, offset: 0 },
      })
    );
  }

  if (rel.startsWith('/questions') && method === 'get') {
    return mockResponse(config, wrapApi([]));
  }

  if (rel.includes('/questions') && (method === 'post' || method === 'put' || method === 'delete')) {
    return mockResponse(config, wrapApi({ ok: true }));
  }

  // --- Wallets ---
  if (rel.startsWith('/wallets') && method === 'get') {
    return mockResponse(config, wrapApi([]));
  }

  if (rel.startsWith('/wallets') && (method === 'post' || method === 'put' || method === 'delete')) {
    return mockResponse(config, wrapApi({ id: `wlt-${Date.now()}`, ok: true }));
  }

  // --- Roles ---
  if (rel.includes('/roles-permissions/roles') && method === 'get') {
    const ts = new Date().toISOString();
    return mockResponse(
      config,
      wrapApi({
        roles: [
          { id: 'role-1', name: 'user', created_at: ts, updated_at: ts },
          { id: 'role-2', name: 'seller', created_at: ts, updated_at: ts },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    );
  }

  // --- Notifications ---
  if (rel.startsWith('/notifications') && method === 'get') {
    return mockResponse(config, wrapApi([]));
  }

  // --- Storage upload ---
  if (rel.includes('/storages/files/upload') && method === 'post') {
    const url = `https://picsum.photos/seed/upload-mock/400/300`;
    return mockResponse(config, wrapApi({ id: `file-${Date.now()}`, url }));
  }

  // --- BFF register ---
  if (rel.includes('/bff/accounts/register') && method === 'post') {
    return mockResponse(config, wrapApi({ registered: true, accountId: MOCK_DEMO_ACCOUNT_ID }));
  }

  // --- Health ---
  if (rel === '/health' && method === 'get') {
    return mockResponse(config, { status: 'ok' });
  }

  if (!isApi) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn('[frontend-mock] Ruta API no mockeada, respuesta vacía:', method, pathname);
  }
  return mockResponse(config, wrapApi(null));
}
