"use client";

import { useEffect } from "react";
import { preloadServiceSpaToken } from "@/presentation/@shared/helpers/axios-helper";

export function SpaTokenPreloader() {
  useEffect(() => {
    // Ejecutar una sola vez al montar la app
    preloadServiceSpaToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

