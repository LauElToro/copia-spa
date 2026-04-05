'use client';

import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';

interface LogoSectionProps {
  logoSrc?: string;
  logoAlt?: string;
  brandName?: string;
  href?: string;
}

export function LogoSection({
  logoSrc = "/images/logo-full.svg",
  logoAlt = "Liberty logo",
  brandName: _brandName, // eslint-disable-line @typescript-eslint/no-unused-vars
  href = "/"
}: LogoSectionProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <Box
      component="a"
      onClick={handleClick}
      href={href}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        cursor: 'pointer',
        height: '100%',
        marginRight: 10,
        '&:hover': {
          textDecoration: 'none',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={150}
          height={60}
          style={{
            objectFit: 'contain',
            height: 'auto'
          }}
          unoptimized={logoSrc.startsWith('/') || logoSrc.toLowerCase().endsWith('.svg')}
        />
      </Box>
    </Box>
  );
}

export default LogoSection;
