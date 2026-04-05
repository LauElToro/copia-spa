import { Suspense } from "react";
import CheckoutPlanPage from "@/presentation/admin/panel/commerce/pages/checkout-plan";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ color: "#fff", textAlign: "center", padding: 40 }}>Cargando...</div>}>
      <CheckoutPlanPage />
    </Suspense>
  );
} 