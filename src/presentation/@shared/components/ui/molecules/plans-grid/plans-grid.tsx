"use client";

import React, { useState } from "react";
import { Plan } from "@/presentation/@shared/components/ui/molecules/plan-card/plans-data";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

interface PlanFeature {
  pregunta: string;
  respuesta: string;
}

interface PlansGridProps {
  plans: Plan[];
  features: Record<number, PlanFeature[]>;
  isDesktop: boolean;
}

const PlansGrid: React.FC<PlansGridProps> = ({ plans, features, isDesktop }) => {
  const [currentPlan, setCurrentPlan] = useState<number>(1);

  return (
    <section className="plans-grid-section">
      <div className="plans-grid-wrapper">

        {isDesktop && (
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                {plans.map((plan) => (
                  <th key={plan.name}>{formatPlanNameForDisplay(plan.name)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features[1].map((feature, idx) => (
                <tr key={feature.pregunta}>
                  <td>{feature.pregunta}</td>
                  {plans.map((plan, i) => (
                    <td key={plan.name}>
                      {features[i + 1][idx].respuesta}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isDesktop && (
          <div className="mobile-plans-grid">
            <div className="plans-grid-buttons">
              {plans.map((plan, i) => (
                <button
                  key={plan.name}
                  className={`plans-grid-btn ${currentPlan === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPlan(i + 1)}
                >
                  {formatPlanNameForDisplay(plan.name)}
                </button>
              ))}
            </div>

            <table>
              <tbody>
                {features[currentPlan].map((feature) => (
                  <tr key={feature.pregunta}>
                    <td>{feature.pregunta}</td>
                    <td>{feature.respuesta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlansGrid;
