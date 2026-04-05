import RegisterPage from "@/presentation/login/pages/register-page";
import { Suspense } from "react";

export default function Register() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
