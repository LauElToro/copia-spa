"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import useDevice from "@/presentation/@shared/hooks/use-device";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";

interface PopupVerifyProps {
  type: "kyb" | "kyc";
  verified: boolean;
  label: string;
}

export const PopupVerify: React.FC<PopupVerifyProps> = ({
  type,
  verified,
  label}) => {
  const { isMobile } = useDevice();
  const [show, setShow] = useState(false);

  // ✅ Determina el mensaje en función del tipo y estado
  const getMessage = (): string => {
    if (type === "kyb") {
      return verified
        ? "La identidad de la persona fue verificada mediante documentación oficial."
        : "La persona aún no ha completado el proceso de verificación.";
    }

    return verified
      ? "Esta tienda está verificada y cumple los requisitos correspondientes."
      : "La tienda no ha completado su verificación KYC.";
  };

  const message = getMessage();

  // ✅ Manejo de tooltip en mobile
  const handleToggleMobile = (): void => {
    if (isMobile) setShow((prev) => !prev);
  };

  // ✅ Mostrar/ocultar popup con accesibilidad (sin divs clicables)
  const handleShow = (): void => {
    if (!isMobile) setShow(true);
  };

  const handleHide = (): void => {
    if (!isMobile) setShow(false);
  };

  // ✅ Determina el ícono correspondiente
  const getIcon = (): string => {
    if (type === "kyb") {
      return "/images/icons/verified-person.svg";
    }
    return "/images/icons/verified-store.svg";
  };

  return (
    <Box
      component="button"
      type="button"
      sx={{
        background: 'transparent',
        border: 0,
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onClick={handleToggleMobile}
      aria-label={label}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: verified ? 'var(--bs-primary)' : 'rgba(255, 255, 255, 0.1)',
          color: verified ? '#fff' : 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
        }}
      >
        <Image src={getIcon()} alt={label} width={24} height={24} objectFit="contain" />
        {!isMobile && label}
      </Box>

      {show && (
        <Box
          component="div"
          role="tooltip"
          aria-hidden={!show}
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            borderRadius: '8px',
            minWidth: '200px',
            maxWidth: '300px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            '& strong': {
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            },
            '& p': {
              margin: 0,
              fontSize: '0.875rem',
              lineHeight: 1.5,
            },
          }}
        >
          <strong>{label}</strong>
          <p>{message}</p>
        </Box>
      )}
    </Box>
  );
};
