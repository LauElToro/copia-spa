import React from 'react';
import { Button } from '../../atoms/button';
import { Image } from '../../atoms/image';
import { defaultTheme as buttonTheme } from '../../atoms/button/theme';

interface VerificationBadgesProps {
  kyc?: boolean;
  kyb?: boolean;
  buttonsWidth?: string | number;
}

export const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  kyc = false,
  kyb = false,
  buttonsWidth = 'fit-content'
}) => {

  const badgeTheme = {
    ...buttonTheme,
    variants: {
      ...buttonTheme.variants,
            primary: {
        ...buttonTheme.variants.primary,
        background: 'var(--bs-bg-btn-1)',
        color: 'var(--bs-font-color)',
        fontSize: 'var(--text-span-sm-size)',
        padding: '0.3rem 1rem'}
    }
  };

  return (
    <div className="d-flex d-md-block justify-content-center w-100">
      <div className="d-grid gap-2 mt-3" style={{width: buttonsWidth}}>
        {kyc && (
          <Button
            theme={badgeTheme}
            icon={
              <Image src="/images/icons/id-verified-card.svg" alt="verified_person_image" width={24} height={24} />
            }
            fullWidth={true}
          >
            Persona verificada
          </Button>
        )}
        {kyb && (
          <Button
            theme={badgeTheme}
            icon={<Image src="/images/icons/verified-store.svg" alt="verified_store_image" width={24} height={24} />}
            fullWidth={true}
          >
            Tienda verificada
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerificationBadges;