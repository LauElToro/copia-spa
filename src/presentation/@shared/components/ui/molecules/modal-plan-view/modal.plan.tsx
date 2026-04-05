"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

export interface ModalPlan {
  name: string;
  description?: string;
  intro?: string;
  price?: string;
  monthly?: string; 
  annual?: string; 
  benefits?: string[];
}

interface ModalPlanViewProps {
  plan: ModalPlan;
  onClose: () => void;
}

const ModalPlanView: React.FC<ModalPlanViewProps> = ({ plan, onClose }) => {
  const { t } = useLanguage();
  const isStarter = formatPlanNameForDisplay(plan.name) === "Plan Starter";
  const displayMonthly = plan.monthly;
  const displayAnnual = plan.annual;
  const displayPrice = plan.price;

  return (
    <div
      className="modal d-flex position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75"
      style={{ zIndex: 1050, alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="position-relative bg-black rounded-4 p-5"
        style={{ width: "70%", maxHeight: "80%", overflowY: "auto" }}
      >
        {/* Botón cerrar */}
        <div className="position-absolute top-0 end-0 p-3">
          <Button variant="danger" size="sm" onClick={onClose}>X</Button>
        </div>

        {/* Header */}
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="text-success">{formatPlanNameForDisplay(plan.name)}</h2>
            {plan.description && <p className="fs-5 text-white">{plan.description}</p>}
            {plan.intro && <p className="fs-5 text-white">{plan.intro}</p>}
          </div>
          <div className="col-md-4 d-flex flex-column align-items-end justify-content-center">
            <div>
              <span className="text-white fw-bold">{t.sellers.value}</span>{" "}
              {isStarter ? (
                <span className="text-success fw-bold fs-4">{displayPrice}</span>
              ) : (
                <div className="d-flex flex-column align-items-end gap-1 mt-1">
                  {displayMonthly && <span className="text-success fw-bold fs-5">{displayMonthly}</span>}
                  {displayAnnual && <span className="text-success fw-bold fs-5">{displayAnnual}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="row g-4 justify-content-center mb-4">
          {plan.benefits?.map((b, i) => (
            <div key={`${plan.name}-benefit-${i}`} className="col-md-6 d-flex align-items-start mb-2">
              <Image src="/logo.svg" alt="benefit" width={32} height={32} className="me-3" />
              <p className="text-white mb-0">{b}</p>
            </div>
          ))}
        </div>

        {/* Botones Mensual/Anual */}
        {!isStarter && (
          <div className="text-center mt-5 d-flex justify-content-center gap-3">
            {displayMonthly && <Button variant="primary" size="md">{t.sellers.get} {displayMonthly}</Button>}
            {displayAnnual && <Button variant="primary" size="md">{t.sellers.get} {displayAnnual}</Button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalPlanView;
