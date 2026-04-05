'use client';

import React, { useMemo } from 'react';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface PaymentOptions {
  crypto: boolean;
  virtualWallets?: {
    mercadoPago?: boolean;
    lemon?: boolean;
    brubank?: boolean;
    naranjaX?: boolean;
  };
  bankCards?: {
    visa?: boolean;
    mastercard?: boolean;
    amex?: boolean;
    maestro?: boolean;
    visacred?: boolean;
  };
  cash?: {
    pagoFacil?: boolean;
    rapipago?: boolean;
  };
}

interface Props {
  paymentOptions: PaymentOptions;
}

export const PaymentIcons: React.FC<Props> = ({ paymentOptions }) => {
  const ICONS = {
    crypto: ['/store-vector/btc.svg', '/store-vector/eth.svg', '/store-vector/usdt.svg', '/store-vector/bnb.svg'],
    virtualWallets: {
      mercadoPago: '/store-vector/mercado.svg',
      lemon: '/store-vector/lemon.svg',
      brubank: '/store-vector/brubank.svg',
      naranjaX: '/store-vector/naranja.svg'
    },
    bankCards: {
      visa: '/store-vector/visadeb.svg',
      maestro: '/store-vector/maestro.svg',
      amex: '/store-vector/amex.svg',
      mastercard: '/store-vector/mastercard.svg',
      visacred: '/store-vector/visacred.svg',
    },
    cash: {
      pagoFacil: '/store-vector/pago.svg',
      rapipago: '/store-vector/rapi.svg'
    }
  };

  const { hasCrypto, activeWallets, activeCards, activeCash, hasAny } = useMemo(() => {
    const hasCrypto = Boolean(paymentOptions.crypto);
    const activeWallets = paymentOptions.virtualWallets
      ? Object.entries(paymentOptions.virtualWallets).filter(([, enabled]) => enabled)
      : [];
    const activeCards = paymentOptions.bankCards
      ? Object.entries(paymentOptions.bankCards).filter(([, enabled]) => enabled)
      : [];
    const activeCash = paymentOptions.cash
      ? Object.entries(paymentOptions.cash).filter(([, enabled]) => enabled)
      : [];

    return {
      hasCrypto,
      activeWallets,
      activeCards,
      activeCash,
      hasAny:
        hasCrypto ||
        activeWallets.length > 0 ||
        activeCards.length > 0 ||
        activeCash.length > 0,
    };
  }, [paymentOptions]);

  if (!hasAny) {
    return null;
  }

  return (
    <div className="d-flex flex-column align-items-start gap-4">
      {hasCrypto && (
        <div className="me-3">
          <Text variant="p" className="mb-1 fw-semibold">Criptomonedas</Text>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {ICONS.crypto.map((src, i) => (
              <Image key={i} src={src} alt="crypto" width={50} height={30} className="img-fluid" />
            ))}
          </div>
        </div>
      )}

      {activeWallets.length > 0 && (
        <div className="me-3">
          <Text variant="p" className="mb-1 fw-semibold">Billeteras Virtuales</Text>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {activeWallets.map(([wallet]) => (
              <Image
                key={wallet}
                src={ICONS.virtualWallets[wallet as keyof typeof ICONS.virtualWallets]}
                alt={wallet}
                width={60}
                height={30}
                className="img-fluid"
              />
            ))}
          </div>
        </div>
      )}

      {activeCards.length > 0 && (
        <div className="me-3">
          <Text variant="p" className="mb-1 fw-semibold">Tarjetas Bancarias</Text>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {activeCards.map(([card]) => (
              <Image
                key={card}
                src={ICONS.bankCards[card as keyof typeof ICONS.bankCards]}
                alt={card}
                width={60}
                height={30}
                className="img-fluid"
              />
            ))}
          </div>
        </div>
      )}

      {activeCash.length > 0 && (
        <div className="me-3">
          <Text variant="p" className="mb-1 fw-semibold">Efectivo</Text>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {activeCash.map(([method]) => (
              <Image
                key={method}
                src={ICONS.cash[method as keyof typeof ICONS.cash]}
                alt={method}
                width={60}
                height={30}
                className="img-fluid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
