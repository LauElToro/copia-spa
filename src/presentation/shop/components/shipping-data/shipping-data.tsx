'use client';

import { Image } from '@/presentation/@shared/components/ui/atoms/image';

interface ShippingOptions {
  andreani?: boolean;
  oca?: boolean;
  correoArgentino?: boolean;
  particular?: boolean;
}

interface Props {
  shippingOptions?: ShippingOptions;
}

export const ShippingIcons: React.FC<Props> = ({ shippingOptions }) => {
  if (!shippingOptions) return null;

  const ICONS = {
    andreani: '/store-vector/andreani.svg',
    oca: '/store-vector/oca.svg',
    correoArgentino: '/store-vector/correo.svg',
    particular: '/store-vector/particular.svg'
  };

  const LABELS = {
    andreani: 'Andreani',
    oca: 'OCA',
    correoArgentino: 'Correo Argentino',
    particular: 'Particular'
  };

  const activeShippers = Object.entries(shippingOptions).filter(([, enabled]) => enabled);

  if (activeShippers.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-column gap-2 items-center">
      <p className="font-medium w-full m-0">Empresas de envío</p>
      <div className="d-flex flex-wrap">
        {activeShippers.map(([key]) => (
          <div key={key}>
            <Image
              src={ICONS[key as keyof typeof ICONS]}
              alt={LABELS[key as keyof typeof LABELS]}
              width={62}
              height={32}
              className="me-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
