'use client';

import { Box } from '@mui/material';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface Props {
  freeShipping?: boolean;
  interestFreeInstallments?: boolean;
  deliveryTimeInDays?: number;
}

export const ShippingBadges: React.FC<Props> = ({
  freeShipping,
  interestFreeInstallments,
  deliveryTimeInDays
}) => {
  const { t } = useLanguage();
  const items = [];

  if (freeShipping) {
    items.push({
      icon: '/store-vector/free.svg',
      label: t.productCard.freeShipping
    });
  }

  if (typeof deliveryTimeInDays === 'number') {
    const label =
      deliveryTimeInDays === 1
        ? t.productCard.arrivesIn24h
        : deliveryTimeInDays === 2
        ? t.productCard.arrivesIn48h
        : t.productCard.arrivesInDays.replace('{days}', deliveryTimeInDays.toString());

    items.push({
      icon: '/store-vector/time.svg',
      label
    });

    if (deliveryTimeInDays === 1) {
      items.push({
        icon: '/store-vector/free.svg',
        label: t.productCard.fastShipping
      });
    }
  }

  if (interestFreeInstallments) {
    items.push({
      icon: '/store-vector/cuotas.svg',
      label: t.productCard.interestFreeInstallments
    });
  }

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        alignItems: 'flex-start'
      }}
    >
      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(41, 196, 128, 0.1)',
            border: '1px solid rgba(41, 196, 128, 0.2)',
            transition: 'all 0.2s ease',
            width: '100%',
            minHeight: '36px',
            '&:hover': {
              backgroundColor: 'rgba(41, 196, 128, 0.15)',
              borderColor: 'rgba(41, 196, 128, 0.3)',
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: '18px',
              height: '18px'
            }}
          >
            <Image src={item.icon} alt={item.label} width={18} height={18} />
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              fontWeight: 500,
              color: '#29C480',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            {item.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
