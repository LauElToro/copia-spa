"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { AnimatedSection } from "@/presentation/@shared/components/ui/atoms/animated-section";
import { useRouter } from "next/navigation";
import useDevice from "@/presentation/@shared/hooks/use-device";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import type { CardStoreProps } from "./type";
import { PopupVerify } from "../popup-verify/popup-verify";

export const CardStore: React.FC<CardStoreProps> = ({
  id,
  name,
  description,
  imageUrl,
  delay = 100,
  rating = 4.8,
  totalReviews = 0,
  location,
  phone,
  kyb = false,
  kyc = false,
  plan}) => {
  const router = useRouter();
  const { isMobile } = useDevice();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // 🔹 Detecta si la descripción está truncada
  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return;
    setIsTruncated(element.scrollHeight > element.clientHeight + 1);
  }, [description]);

  // 🔹 Determina color del plan
  const getPlanColor = (plan?: string): string => {
    switch (plan) {
      case "Liberty":
        return "azul";
      case "Pro Liberty":
        return "verde";
      case "Experiencia Liberty":
        return "dorado";
      default:
        return "";
    }
  };

  // 🔹 Render de badges de verificación
  const renderVerificationBadges = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <PopupVerify
        type="kyb"
        verified={kyb}
        label={kyb ? t.stores.personVerified : t.stores.personNotVerified}
      />
      <PopupVerify
        type="kyc"
        verified={kyc}
        label={kyc ? t.stores.storeVerified : t.stores.storeNotVerified}
      />
    </Box>
  );

  // 🔹 Render de datos de contacto (desktop)
  const renderContactInfo = () => (
    <div
      className="d-flex flex-column align-items-end overflow-hidden"
      style={{ minWidth: 0 }}
    >
      {location && (
        <Text
          className="text-truncate text-nowrap overflow-hidden"
          style={{ minWidth: 0, maxWidth: "100%" }}
          title={location}
        >
          📍 {location}
        </Text>
      )}
      {phone && (
        <Text
          className="text-truncate text-nowrap overflow-hidden"
          style={{ minWidth: 0, maxWidth: "100%" }}
          title={phone}
        >
          📞 {phone}
        </Text>
      )}
    </div>
  );

  // 🔹 Toggle descripción
  const handleToggleDescription = (): void => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <AnimatedSection direction="up" delay={delay}>
      <Box className="card-store">
        {/* Imagen superior */}
        <Box sx={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
          <Image
            src={imageUrl}
            alt={name}
            width={500}
            height={300}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* ✅ Mostrar badges solo si NO es mobile (sin usar negación directa) */}
          {isMobile ? null : renderVerificationBadges()}
        </Box>

        <Image
          src={imageUrl}
          alt={`Logo de ${name}`}
          width={70}
          height={70}
          style={{ borderRadius: '50%', border: '3px solid white', marginTop: '-35px', marginLeft: '20px', position: 'relative', zIndex: 1 }}
        />

        {/* Contenido */}
        <Box sx={{ padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Text variant="h5">
              {name}{" "}
              {plan && plan !== "Starter" && (
                <Image
                  src={`/images/icons/check-${getPlanColor(plan)}.svg`}
                  alt={t.stores.plan.replace('{plan}', plan)}
                  width={20}
                  height={20}
                />
              )}
            </Text>
            <Box>
              {rating} ⭐ <span className="text-light">({totalReviews})</span>
            </Box>
          </Box>

          {/* 🔽 Descripción truncada o expandida */}
          <Box
            ref={descriptionRef}
            sx={{ maxHeight: isExpanded ? 'none' : '100px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}
          >
            <Text>{description}</Text>
          </Box>

          {/* ✅ Mostrar botón solo si el texto está truncado */}
          {isTruncated && (
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={handleToggleDescription}
            >
              {isExpanded ? t.stores.seeLess : t.stores.seeMore}
            </button>
          )}

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <button
              type="button"
              onClick={() => router.push(`/stores/${id}`)}
              style={{ padding: '0.5rem 1rem', background: 'var(--bs-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {t.stores.visitStore}
            </button>

            {/* ✅ Desktop → ubicación y teléfono */}
            {isMobile ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <PopupVerify
                  type="kyb"
                  verified={kyb}
                  label={kyb ? t.stores.personVerified : t.stores.personNotVerified}
                />
                <PopupVerify
                  type="kyc"
                  verified={kyc}
                  label={kyc ? t.stores.storeVerified : t.stores.storeNotVerified}
                />
              </Box>
            ) : (
              renderContactInfo()
            )}
          </Box>
        </Box>
      </Box>
    </AnimatedSection>
  );
};
