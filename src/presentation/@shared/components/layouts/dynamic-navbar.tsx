'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Button,
  Container} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import useDevice from '../../hooks/use-device';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

type AccountType = 'user' | 'commerce' | 'seller';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

interface DynamicNavbarProps {
  userProfile: UserProfile;
  useHomeBackground?: boolean;
}

const DynamicNavbar: React.FC<DynamicNavbarProps> = ({ userProfile, useHomeBackground = false }) => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Definir menús según el tipo de usuario
  const getMenuItems = (accountType: AccountType) => {
    const isSellerOrCommerce = accountType === 'commerce' || accountType === 'seller';

    if (isSellerOrCommerce) {
      // Menú para vendedores/comercios
      return [
        {
          href: "/admin/panel/home",
          icon: "bi-house",
          label: t.admin?.home || "Inicio"
        },
        {
          href: "/admin/panel/products",
          icon: "bi-box",
          label: t.menu?.products || "Productos"
        },
        {
          href: "/admin/panel/configuration-subscription",
          icon: "bi-gem",
          label: t.admin?.subscription || "Suscripción"
        },
        {
          href: "/admin/panel/transactions",
          icon: "bi-arrow-left-right",
          label: t.admin?.transactions || "Transacciones"
        },
        {
          href: "/admin/panel/questions",
          icon: "bi-question-circle",
          label: t.admin?.questions || "Preguntas"
        },
        {
          href: "/admin/panel/configuration",
          icon: "bi-gear",
          label: t.admin?.settings || "Ajustes"
        },
        {
          href: "/admin/panel/ambassador",
          icon: "bi-people",
          label: t.admin?.referrals || "Referidos"
        },
        {
          href: "/admin/panel/panel-proliberter",
          icon: "bi-bar-chart-line",
          label: "Métricas e IA"
        },
        {
          href: "/",
          icon: "bi-arrow-left",
          label: "Volver a Liberty Club"
        }
      ];
    } else {
      // Menú para usuarios/compradores
      return [
        {
          href: "/admin/panel/home",
          icon: "bi-house",
          label: t.admin?.home || "Inicio"
        },
        {
          href: "/admin/panel/transactions",
          icon: "bi-bag",
          label: "Mis Compras"
        },
        {
          href: "/admin/panel/questions",
          icon: "bi-question-circle",
          label: t.admin?.questionsAndAnswers || "Preguntas y respuestas"
        },
        {
          href: "/admin/panel/configuration",
          icon: "bi-gear",
          label: t.admin?.settings || "Ajustes"
        },
        {
          href: "/admin/panel/ambassador",
          icon: "bi-people",
          label: t.admin?.referrals || "Referidos"
        },
        {
          href: "/",
          icon: "bi-arrow-left",
          label: "Volver a Liberty Club"
        }
      ];
    }
  };

  let menuItems = getMenuItems(userProfile.accountType);

  // Override de menú para página de métricas
  if (pathname?.startsWith('/admin/panel/metrics')) {
    menuItems = [
      { href: '/admin/panel/metrics', icon: 'bi-graph-up-arrow', label: t.admin?.analytics || 'Analíticas' },
      { href: '/admin/panel/panel-proliberter/assistant/mark', icon: 'bi-robot', label: t.admin?.aiAssistant || 'Asistente AI' },
      { href: '/admin/panel/home', icon: 'bi-shop', label: t.menu?.back || 'Volver' },
    ];
  }

  return (
    <>
      <AppBar
        position="relative"
        sx={{
          ...(useHomeBackground ? {
            background: `
              radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
              radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
              radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
            `,
            backgroundColor: 'transparent',
            borderTop: "1px solid rgba(41, 196, 128, 0.05)",
            overflow: 'hidden',
            position: 'relative'
          } : {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid #29C480'
          }),
          top: 0,
          zIndex: 1000, // Menor que el Navbar principal (1100) y el dropdown de categorías (1300)
          margin: 0,
          marginTop: 0,
          padding: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
          ...(useHomeBackground && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)',
              boxShadow: '0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)',
              borderRadius: '9999px',
              zIndex: 1001 // Mayor que el AppBar pero menor que el dropdown de categorías (1300)
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '2px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  rgba(0, 0, 0, 0.25) 0px,
                  rgba(0, 0, 0, 0.25) 1px,
                  transparent 1px,
                  transparent 2px,
                  rgba(10, 40, 32, 0.3) 2px,
                  rgba(10, 40, 32, 0.3) 3px,
                  transparent 3px,
                  transparent 4px
                ),
                repeating-linear-gradient(
                  -45deg,
                  rgba(0, 0, 0, 0.25) 0px,
                  rgba(0, 0, 0, 0.25) 1px,
                  transparent 1px,
                  transparent 2px,
                  rgba(10, 40, 32, 0.3) 2px,
                  rgba(10, 40, 32, 0.3) 3px,
                  transparent 3px,
                  transparent 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  rgba(0, 0, 0, 0.15) 0px,
                  rgba(0, 0, 0, 0.15) 1px,
                  transparent 1px,
                  transparent 2px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(0, 0, 0, 0.15) 0px,
                  rgba(0, 0, 0, 0.15) 1px,
                  transparent 1px,
                  transparent 2px
                )
              `,
              backgroundSize: '6px 6px, 6px 6px, 3px 3px, 3px 3px',
              opacity: 0.9,
              zIndex: 1,
              pointerEvents: 'none',
              mixBlendMode: 'overlay'
            }
          })
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3, lg: 4 },
            py: 0,
          }}
        >
          <Toolbar 
            sx={{ 
              justifyContent: 'flex-end', 
              padding: '8px 0',
              minHeight: 'auto !important',
              margin: 0,
              marginTop: 0,
              position: 'relative', 
              zIndex: 2,
              backgroundColor: useHomeBackground ? 'transparent' : undefined,
              background: useHomeBackground ? 'transparent' : undefined
            }}
          >
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: { xs: 2, md: 5 },
                flexGrow: 1}}
            >
              {menuItems.map((item, idx) => (
                <Button
                  key={`${item.href}-${item.label}-${idx}`}
                  component={NextLink}
                  href={item.href}
                  sx={{
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textTransform: 'none'}}
                >
                  <Typography variant="body2">{item.label}</Typography>
                </Button>
              ))}
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

    </>
  );
};

export default DynamicNavbar;
