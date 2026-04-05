import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import { useAmbassador } from '../use-ambassador';
import { axiosHelper } from '../../helpers/axios-helper';

jest.mock('../../helpers/axios-helper', () => ({
  axiosHelper: {
    ambassadors: {
      activate: jest.fn(),
      me: jest.fn(),
      referrals: jest.fn(),
      earnings: jest.fn(),
      payouts: jest.fn(),
      getWallet: jest.fn(),
      upsertWallet: jest.fn()}}}));

const mockedAxiosHelper = axiosHelper as jest.Mocked<typeof axiosHelper>;
const ambassadorMocks = mockedAxiosHelper.ambassadors as unknown as {
  activate: jest.Mock;
  me: jest.Mock;
  referrals: jest.Mock;
  earnings: jest.Mock;
  payouts: jest.Mock;
  getWallet: jest.Mock;
  upsertWallet: jest.Mock;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false}}});

  const QueryClientWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  QueryClientWrapper.displayName = "QueryClientTestWrapper";

  return QueryClientWrapper;
};

const buildAxiosResponse = <T,>(data: T) => ({
  data: {
    success: true,
    message: 'ok',
    data,
    meta: { timestamp: new Date().toISOString(), version: '1.0.0' }}});

describe('useAmbassador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns safe fallbacks when the user is not an ambassador (404)', async () => {
    const axiosConfig = { headers: {} } as InternalAxiosRequestConfig<unknown>;
    const notFoundResponse: AxiosResponse = {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: axiosConfig,
      data: {}};
    const notFoundError = new AxiosError('Not Found', '404', axiosConfig);
    notFoundError.response = notFoundResponse;

    ambassadorMocks.me.mockRejectedValueOnce(notFoundError);
    ambassadorMocks.referrals.mockResolvedValue(
      buildAxiosResponse({
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          offset: 0}})
    );
    ambassadorMocks.earnings.mockResolvedValue(
      buildAxiosResponse({
        month: '',
        initialUSD: 0,
        residualUSD: 0,
        bonusesUSD: 0,
        lifetimeUSD: 0})
    );
    ambassadorMocks.payouts.mockResolvedValue(
      buildAxiosResponse([])
    );
    ambassadorMocks.getWallet.mockResolvedValue(
      buildAxiosResponse(null)
    );

    const { result } = renderHook(() => useAmbassador(), {
      wrapper: createWrapper()});

    await waitFor(() =>
      expect(result.current.profile.data).toBeNull()
    );
    expect(result.current.profile.isError).toBe(false);
    expect(result.current.referrals.data?.items ?? []).toHaveLength(0);
  });

  it('maps referrals response with pagination details', async () => {
    ambassadorMocks.me.mockResolvedValue(
      buildAxiosResponse({
        code: 'ABC123',
        shareLink: 'https://example.com/ref/ABC123',
        totals: {
          month: { initialUSD: 10, residualUSD: 5, bonusesUSD: 0 },
          lifetime: { earningsUSD: 15 }}})
    );
    ambassadorMocks.referrals.mockResolvedValue(
      buildAxiosResponse({
        items: [
          {
            id: 'ref-1',
            email: 'user@example.com',
            plan: 'PRO_LIBERTER',
            status: 'active',
            firstPaymentAt: '2024-02-01T00:00:00.000Z',
            planValue: 197},
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          offset: 0}})
    );
    ambassadorMocks.earnings.mockResolvedValue(
      buildAxiosResponse({
        month: '2024-02',
        initialUSD: 15,
        residualUSD: 7,
        bonusesUSD: 2,
        lifetimeUSD: 24})
    );
    ambassadorMocks.payouts.mockResolvedValue(
      buildAxiosResponse([])
    );
    ambassadorMocks.getWallet.mockResolvedValue(
      buildAxiosResponse(null)
    );

    const { result } = renderHook(
      () =>
        useAmbassador({
          referrals: { page: 1, pageSize: 10 }}),
      {
        wrapper: createWrapper()}
    );

    await waitFor(() =>
      expect(result.current.referrals.isSuccess).toBe(true)
    );

    const referralsData = result.current.referrals.data;
    expect(referralsData?.items).toHaveLength(1);
    expect(referralsData?.pagination.page).toBe(1);
    expect(referralsData?.pagination.total).toBe(1);
  });
});

