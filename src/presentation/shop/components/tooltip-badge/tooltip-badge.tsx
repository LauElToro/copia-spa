"use client";

import React from 'react';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface TooltipBadgeProps {
  type: "KYC" | "KYB";
  status: boolean;
  message?: string;
  colorComplete?: string;
  colorIncomplete?: string;
}

const TooltipBadge: React.FC<TooltipBadgeProps> = ({
  type,
  status,
  message,
  colorComplete = "bg-success",
  colorIncomplete = "bg-secondary"
}) => {
  const { t } = useLanguage();
  
  // Texto dinámico según tipo y estado
  const getLabel = () => {
    if (type === "KYC") {
      return status ? t.shop.personVerified : t.shop.personNotVerified;
    }
    return status ? t.shop.storeVerified : t.shop.storeNotVerified;
  };
  
  const label = getLabel();

  return (
    <div className="tooltip-badge">
      <span className={`badge ${status ? colorComplete : colorIncomplete}`}>
        {label}
      </span>

      {message && (
        <div className="tooltip-content">
          {message}
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default TooltipBadge;
