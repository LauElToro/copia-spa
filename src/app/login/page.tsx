"use client";

import { useEffect } from "react";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import LoginPage from "@/presentation/login/pages/login-page";

export default function Login() {
  const { requireGuest } = useAuth();

    useEffect(() => {
      requireGuest('/admin/panel/home');
    }, [requireGuest]);

  return <LoginPage />;
}
