"use client";

import React from "react";
import PolicyPageTemplate from "@/presentation/@shared/components/layouts/policy-page-layaut";
import { SecuritySections } from "./security-sections";

const SecurityPolicyPage: React.FC = () => {
return ( <PolicyPageTemplate
   heroTitle="Políticas de Seguridad y Confianza"
   heroSubtitle="Última actualización: 21/07/2025"
   heroDescription="Protegemos tus cuentas y operaciones para que actúes con total seguridad y confianza."
   sections={SecuritySections}
 />
);
};

export default SecurityPolicyPage;


