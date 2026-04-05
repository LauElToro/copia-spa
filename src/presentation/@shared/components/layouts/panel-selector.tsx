import React, { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import { useUserProfile } from "@/presentation/@shared/hooks/use-user-profile";
import Navbar from "../ui/organisms/navbar/navbar";
import Footer from "../ui/molecules/footer/footer";
import { Box, CircularProgress, Typography } from "@mui/material";

interface PanelSelectorProps {
  routes: {
    user: ReactNode;
    commerce: ReactNode;
    children: ReactNode;
  };
}

export default function PanelSelector({ routes }: Readonly<PanelSelectorProps>) {
  const { getAuthStatus } = useAuth();
  const { userProfile, isLoading, isError } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  // Redirigir al login si no está autenticado o hay error
  useEffect(() => {
    const authStatus = getAuthStatus();
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
    
    // Si no hay token, no está autenticado, o hay error, redirigir inmediatamente
    if (!hasToken || !authStatus.isAuthenticated || (isError && !isLoading)) {
      router.push("/login");
      return;
    }
    
    // Si terminó de cargar y no hay perfil, también redirigir
    if (!isLoading && !userProfile) {
      router.push("/login");
    }
  }, [getAuthStatus, router, isError, isLoading, userProfile]);

  // Mientras carga, mostrar un loading que respete el diseño
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#000000',
        }}
      >
        <CircularProgress 
          aria-label="Cargando..." 
          sx={{ color: '#34d399' }}
        />
      </Box>
    );
  }

  // Si hay error o no hay perfil, no mostrar nada (ya se redirige en el useEffect)
  if (isError || !userProfile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#000000',
        }}
      >
        <CircularProgress 
          aria-label="Redirigiendo..." 
          sx={{ color: '#34d399' }}
        />
      </Box>
    );
  }

  // Renderizar el panel correspondiente según el tipo de usuario
  // Renderizar rutas que viven en children (no en slots paralelos)
  if (pathname?.startsWith('/admin/panel/kyc')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        <Navbar hideBorder={false} />
        <Box component="main">
          {routes.children}
        </Box>
        <Footer />
      </Box>
    );
  }

  if (pathname?.startsWith('/admin/panel/kyb')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        <Navbar hideBorder={false} />
        <Box component="main">
          {routes.children}
        </Box>
        <Footer />
      </Box>
    );
  }

  if (userProfile.accountType === "user") {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        <Navbar hideBorder={false} />
        <Box component="main">
          {routes.user}
        </Box>
        <Footer />
      </Box>
    );
  } else if (userProfile.accountType === "commerce" || userProfile.accountType === "seller") {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
        <Navbar hideBorder={false} />
        <Box component="main">
          {routes.commerce}
        </Box>
        <Footer />
      </Box>
    );
  } else {
    // Fallback para tipos de usuario no reconocidos
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Tipo de usuario no reconocido
          </Typography>
          <Typography variant="body1">
            Contacta con soporte técnico.
          </Typography>
        </Box>
      </Box>
    );
  }
}