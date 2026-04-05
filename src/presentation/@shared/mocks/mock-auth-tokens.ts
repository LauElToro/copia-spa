import { MOCK_DEMO_ACCOUNT_ID } from './mock-catalog-data';

export function buildMockAccessToken(accountId: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ accountId, sub: accountId }));
  return `${header}.${payload}.mock`;
}

export function mockDemoAccessToken(): string {
  return buildMockAccessToken(MOCK_DEMO_ACCOUNT_ID);
}
