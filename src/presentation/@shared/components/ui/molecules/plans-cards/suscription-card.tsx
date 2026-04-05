"use client";
import React from "react";
import Image from "next/image";
import { Button } from "../../atoms/button";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";


export interface SuscriptionCardProps {
  
  plan: {
    name: string;
    cost: string;
    start: string;
    end: string;
  };
  benefits: {
    title: string;
    desc: string;
    icon: string;
  }[];
}

export const SuscriptionCard: React.FC<SuscriptionCardProps> = ({

  plan,
  benefits}) => {

  return (
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-body">
        <h2 className="text-center mb-4">{formatPlanNameForDisplay(plan.name)}</h2>
        <div className="text-center mb-4">
          <Image
            src="/suscription-card.png"
            alt="Tarjeta de suscripción"
            width={300}
            height={200}
            className="img-fluid"
          />
        </div>
        <h3 className="text-center mb-3">Costo: {plan.cost}</h3>
        <p className="text-center mb-4">Desde {plan.start} hasta {plan.end}</p>
        <h4 className="mb-3">Beneficios:</h4>
        <ul className="list-unstyled">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="d-flex align-items-start mb-2">
              <i className={`bi ${benefit.icon} me-2`}></i>
              <div>
                <strong>{benefit.title}</strong>: {benefit.desc}
              </div>
            </li>
          ))}
        </ul>
        <Button variant="primary" size="lg" className="w-100 mt-3">
          ¡Suscribirse!
        </Button>
      </div>
    </div>
  );
}
  export default SuscriptionCard; /* cambiar por card nueva en primera vista de panel de suscripcion */