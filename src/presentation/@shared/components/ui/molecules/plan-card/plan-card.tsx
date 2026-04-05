"use client";

import React from "react";
import Image from "next/image";
import { Button } from "../../atoms/button";
import { Text } from "../../atoms/text";

interface PlanCardProps {
  name: string;
  description?: string;
  intro?: string;
  monthly?: string;
  annual?: string;
  price?: string;
  icon?: string;
  buttonText: string;
  onButtonClick: () => void;
  isRecommended?: boolean;
  currentPlanLabel?: string;
}

const PLAN_STYLES: Record<string, { background: string; boxShadow: string }> = {
  "Plan Starter": { background: "#0C0E10", boxShadow: "none" },
  "Plan Liberty": { background: "#08090B", boxShadow: "none" },
  "Plan Pro Liberty": { background: "linear-gradient(120deg, rgba(0,0,0,1) 0%, rgba(8,9,11,1) 80%, rgba(41,196,128,1) 100%)", boxShadow: "0 0 10px rgba(41,196,128,0.6)" },
  "Plan Experiencia Liberty": { background: "linear-gradient(180deg, #0F3124 0%, #08090B 10%, #000000 100%)", boxShadow: "0 0 10px rgba(41,196,128,0.6)" }
};

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  description,
  intro,
  monthly,
  annual,
  price,
  icon,
  buttonText,
  onButtonClick,
  isRecommended,
  currentPlanLabel
}) => {
  const { background, boxShadow } = PLAN_STYLES[name] || PLAN_STYLES["Plan Starter"];
  const displayPrice = monthly || price;

  return (
    <div style={{ position: "relative" }}>
      {currentPlanLabel && (
        <Text
          variant="p"
          className="mb-1"
          sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}
        >
          {currentPlanLabel}
        </Text>
      )}
    <div
      className={`plan-card d-flex flex-column text-center p-3 rounded-2 w-100 ${isRecommended ? "border border-success" : ""}`}
      style={{
        minHeight: "600px",
        justifyContent: "space-between",
        color: "white",
        background,
        boxShadow}}
    >
      <Text variant="h5" weight="black" className="mb-2 text-success text-center">
        {name}
      </Text>

      {description && <Text variant="p" className="text-white mb-5 text-center">{description}</Text>}
      {intro && <Text variant="p" className="text-white mb-2 text-center">{intro}</Text>}

      <div>
        <Text variant="p" className="text-white mb-1 text-center mt-5">Valor:</Text>
        <div className="mb-3">
          {displayPrice && <Text variant="p" className="text-success mb-1 text-center">{displayPrice}</Text>}
          {annual && <Text variant="p" className="text-success text-center">{annual}</Text>}
        </div>
      </div>

      <div className="mt-auto">
        <Button size="md" variant="primary" onClick={onButtonClick} className="mb-3">{buttonText}</Button>
      </div>

      {icon && (
        <Image
          src={icon}
          alt={name}
          width={180}
          height={160}
          className="mb-3 mx-auto"
          unoptimized={icon.toLowerCase().endsWith('.svg')}
        />
      )}
    </div>
    </div>
  );
};

export default PlanCard;
