"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { Box, Container, Grid, Typography, CircularProgress, useTheme, useMediaQuery, Button as MuiButton } from "@mui/material";
import { AccountBalance, AccountBalanceWallet, Payment, LocalAtm, CheckCircle, Wallet } from "@mui/icons-material";
import { Close as CloseIcon } from '@mui/icons-material';

import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { IconButton } from '@/presentation/@shared/components/ui/atoms/icon-button';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import { useConfigurationPaymentMethods } from '../hooks/use-configuration-payment-methods';
import { useConfigurationBankAccounts } from '../hooks/use-configuration-bank-accounts';
import { useConfigurationWallets } from '../hooks/use-configuration-wallets';
import { useConfigurationForm } from '@/presentation/@shared/hooks/use-configuration-form';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';

interface Tab {
  id: string;
  label: string;
  disabled: boolean;
  isActive: boolean;
}

const PaymentMethodsPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { openModal, closeModal } = useModal();

  // Obtener accountId del hook de configuración
  const { accountId } = useConfigurationForm(toast);

  // Hooks para los diferentes medios de cobro
  const paymentMethods = useConfigurationPaymentMethods(toast);
  const bankAccounts = useConfigurationBankAccounts(toast);
  const wallets = useConfigurationWallets(toast);

  // Obtener los métodos de pago físico del hook (sincronizado con el backend)
  const {
    physicalPaymentMethods,
    handlePhysicalPaymentMethodToggle,
    handleUpdatePhysicalPayments,
    updatePhysicalPaymentsMutation,
    virtualWallets,
    handleVirtualWalletToggle,
    handleUpdateVirtualWallets,
    updateVirtualWalletsMutation,
  } = paymentMethods;

  // Estados para búsqueda
  const [bankAccountSearchTerm, setBankAccountSearchTerm] = useState('');
  const [walletSearchTerm, setWalletSearchTerm] = useState('');
  const [isDeletingBankAccount, setIsDeletingBankAccount] = useState(false);
  const [isDeletingWallet, setIsDeletingWallet] = useState(false);

  // Estado para los tabs: Cuentas Bancarias, Wallets, MercadoPago, Efectivo en puntos físicos, Billeteras virtuales
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', label: 'Cuentas Bancarias', disabled: false, isActive: true },
    { id: '2', label: 'Wallets', disabled: false, isActive: false },
    { id: '3', label: 'MercadoPago', disabled: false, isActive: false },
    { id: '4', label: 'Efectivo en puntos físicos', disabled: false, isActive: false },
    { id: '5', label: 'Billeteras virtuales', disabled: false, isActive: false },
  ]);

  // Handler para cambiar de tab
  const handleTabClick = (tabId: string) => {
    setTabs(tabs.map(t => ({ ...t, isActive: t.id === tabId })));
  };

  // Función para manejar la eliminación de cuenta bancaria
  const handleDeleteBankAccount = useCallback((bankAccountId: string, cbu: string) => {
    const handleConfirm = async () => {
      try {
        setIsDeletingBankAccount(true);
        if (!bankAccountId || bankAccountId.trim() === '') {
          toast?.error('ID de cuenta bancaria inválido');
          setIsDeletingBankAccount(false);
          return;
        }
        await bankAccounts.handleDeleteBankAccount(bankAccountId.trim());
        closeModal();
        setIsDeletingBankAccount(false);
      } catch (error) {
        console.error('Error al eliminar cuenta bancaria:', error);
        setIsDeletingBankAccount(false);
      }
    };

    openModal(
      <Box
        sx={{
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#fff",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
          }}
        >
          <IconButton
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 700,
              color: '#34d399',
              mb: 1,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Eliminar Cuenta Bancaria
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              CBU/CVU
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "#34d399",
                fontWeight: 600,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {cbu}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              ¿Desea eliminar esta cuenta bancaria con CBU/CVU: {cbu}? Esta acción no se puede deshacer.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <MuiButton
              type="button"
              onClick={closeModal}
              variant="outlined"
              disabled={isDeletingBankAccount}
              sx={{
                px: 4,
                py: 1.5,
                borderWidth: '2px !important',
                borderColor: '#ef4444 !important',
                borderStyle: 'solid !important',
                color: '#ef4444 !important',
                backgroundColor: 'transparent !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '& fieldset': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                },
                '&:hover': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                  backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                  boxShadow: 'none !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                  },
                },
              }}
            >
              Cancelar
            </MuiButton>
            <MuiButton
              type="button"
              onClick={handleConfirm}
              variant="contained"
              disabled={isDeletingBankAccount}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#ef4444 !important',
                color: '#ffffff !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '&:hover': {
                  backgroundColor: '#dc2626 !important',
                  boxShadow: 'none !important',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(239, 68, 68, 0.5) !important',
                  color: 'rgba(255, 255, 255, 0.5) !important',
                },
              }}
            >
              {isDeletingBankAccount ? (
                <>
                  <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                  {t.admin?.deleting || 'Eliminando...'}
                </>
              ) : (
                'Eliminar Cuenta'
              )}
            </MuiButton>
          </Box>
        </Box>
      </Box>
    );
  }, [bankAccounts, toast, openModal, closeModal, isDeletingBankAccount, t.admin?.deleting]);

  // Función para manejar la eliminación de wallet
  const handleDeleteWallet = useCallback((walletId: string, walletAddress: string) => {
    const handleConfirm = async () => {
      try {
        setIsDeletingWallet(true);
        if (!walletId || walletId.trim() === '') {
          toast?.error('ID de wallet inválido');
          setIsDeletingWallet(false);
          return;
        }
        await wallets.handleDeleteWallet(walletId.trim());
        closeModal();
        setIsDeletingWallet(false);
      } catch (error) {
        console.error('Error al eliminar wallet:', error);
        setIsDeletingWallet(false);
      }
    };

    openModal(
      <Box
        sx={{
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#fff",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
          }}
        >
          <IconButton
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 700,
              color: '#34d399',
              mb: 1,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Eliminar Wallet
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              WALLET
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "#34d399",
                fontWeight: 600,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {walletAddress}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              ¿Desea eliminar esta Wallet: {walletAddress}? Esta acción no se puede deshacer.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <MuiButton
              type="button"
              onClick={closeModal}
              variant="outlined"
              disabled={isDeletingWallet}
              sx={{
                px: 4,
                py: 1.5,
                borderWidth: '2px !important',
                borderColor: '#ef4444 !important',
                borderStyle: 'solid !important',
                color: '#ef4444 !important',
                backgroundColor: 'transparent !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '& fieldset': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                },
                '&:hover': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                  backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                  boxShadow: 'none !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                  },
                },
              }}
            >
              Cancelar
            </MuiButton>
            <MuiButton
              type="button"
              onClick={handleConfirm}
              variant="contained"
              disabled={isDeletingWallet}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#ef4444 !important',
                color: '#ffffff !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '&:hover': {
                  backgroundColor: '#dc2626 !important',
                  boxShadow: 'none !important',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(239, 68, 68, 0.5) !important',
                  color: 'rgba(255, 255, 255, 0.5) !important',
                },
              }}
            >
              {isDeletingWallet ? (
                <>
                  <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} />
                  {t.admin?.deleting || 'Eliminando...'}
                </>
              ) : (
                t.admin?.deleteWallet || 'Eliminar Wallet'
              )}
            </MuiButton>
          </Box>
        </Box>
      </Box>
    );
  }, [wallets, toast, openModal, closeModal, isDeletingWallet, t.admin?.deleteWallet, t.admin?.deleting]);

  // Preparar opciones de bancos para el select
  const bankOptions = React.useMemo(() => {
    const banks = bankAccounts.banksQuery.data || [];
    // Sort banks alphabetically by name
    const sortedBanks = [...banks].sort((a, b) =>
      a.bcra.name.localeCompare(b.bcra.name, 'es', { sensitivity: 'base' })
    );
    return [
      { value: '', label: 'Seleccione un Banco', native: 'Seleccione un Banco' },
      ...sortedBanks.map((bank) => ({
        value: bank.id,
        label: bank.bcra.name,
        native: bank.bcra.name,
      })),
    ];
  }, [bankAccounts.banksQuery.data]);

  // Exponer las funciones globalmente para que DataTable pueda llamarlas
  useEffect(() => {
    const windowWithHandler = window as Window & {
      handleDeleteBankAccountClick?: (bankAccountId: string, cbu: string) => void;
      handleDeleteWalletClick?: (walletId: string, walletAddress: string) => void;
    };
    windowWithHandler.handleDeleteBankAccountClick = handleDeleteBankAccount;
    windowWithHandler.handleDeleteWalletClick = handleDeleteWallet;
    return () => {
      delete windowWithHandler.handleDeleteBankAccountClick;
      delete windowWithHandler.handleDeleteWalletClick;
    };
  }, [handleDeleteBankAccount, handleDeleteWallet]);

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: 'Medios de cobro' }
              ]}
            />

            {/* Tabs */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                mb: 4,
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: isMobile ? '100%' : 'auto',
                overflowX: isMobile ? 'auto' : 'visible',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {tabs.map((tab, index) => (
                <RenderTabs
                  key={`tab-${tab.id}`}
                  id={tab.id}
                  label={tab.label}
                  isActive={tab.isActive}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={tab.disabled}
                  isFirst={index === 0}
                  isLast={index === tabs.length - 1}
                  isMobile={isMobile}
                />
              ))}
            </Box>

            {/* Content */}
            <Grid container spacing={4}>
              {/* Tab 1: Cuentas Bancarias */}
              {tabs.find(tab => tab.id === '1')?.isActive && (
                <>
                  {/* Card: Configuración de Cuenta Bancaria */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                        border: "2px solid rgba(41, 196, 128, 0.1)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                        "&:hover": {
                          backgroundColor: "rgba(41, 196, 128, 0.08)",
                          borderColor: "rgba(41, 196, 128, 0.4)",
                        },
                        padding: { xs: 3, md: 4 },
                        gap: 3,
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          fontWeight: 700,
                          color: '#34d399',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Configuración de Cuenta Bancaria
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#ffffff',
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Banco
                          </Typography>
                          <DropdownButton
                            options={bankOptions}
                            value={bankAccounts.selectedBankId || ''}
                            onChange={(option) => {
                              bankAccounts.setSelectedBankId(option.value);
                            }}
                            placeholder="Seleccionar banco..."
                            renderValue={(option) => option ? option.label : ''}
                            fullWidth={true}
                            searchable={true}
                            disabled={bankAccounts.banksQuery.isLoading}
                            sx={{
                              width: '100%',
                              '& button': {
                                height: '56px',
                                minHeight: '56px',
                                alignItems: 'center',
                                display: 'flex',
                                '& .MuiTypography-root': {
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  lineHeight: '1.5',
                                }
                              }
                            }}
                          />
                          {bankAccounts.banksQuery.isLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                              <CircularProgress size={24} sx={{ color: '#29C480' }} />
                            </Box>
                          )}
                        </Grid>

                        {bankAccounts.selectedBankId && (
                          <>
                            <Grid size={{ xs: 12 }}>
                              <Typography
                                component="label"
                                sx={{
                                  display: 'block',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  color: '#ffffff',
                                  mb: 1,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                CBU/CVU
                              </Typography>
                              <Input
                                placeholder="0000000000000000000000"
                                value={bankAccounts.cbuCvu}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  bankAccounts.setCbuCvu(e.target.value);
                                }}
                                state="modern"
                                fullWidth
                                type="text"
                                inputProps={{
                                  maxLength: 22,
                                  inputMode: 'numeric',
                                  pattern: '[0-9]*',
                                }}
                              />
                              {bankAccounts.cbuCvuError && (
                                <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                                  {bankAccounts.cbuCvuError}
                                </Text>
                              )}
                              <Text variant="span" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                                Ingrese 22 dígitos numéricos (opcional si ingresa alias)
                              </Text>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography
                                    component="label"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: '#ffffff',
                                      mb: 1,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                    }}
                                  >
                                    Alias
                                  </Typography>
                                  <Input
                                    placeholder="mi.alias.bancario"
                                    value={bankAccounts.alias}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      bankAccounts.setAlias(e.target.value);
                                    }}
                                    state="modern"
                                    fullWidth
                                    type="text"
                                    inputProps={{
                                      maxLength: 50,
                                    }}
                                  />
                                  {bankAccounts.aliasError && (
                                    <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                                      {bankAccounts.aliasError}
                                    </Text>
                                  )}
                                  <Text variant="span" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                                    Ingrese alias bancario (opcional si ingresa CBU/CVU)
                                  </Text>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography
                                    component="label"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: '#ffffff',
                                      mb: 1,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                    }}
                                  >
                                    Tipo de Cuenta
                                  </Typography>
                                  <DropdownButton
                                    options={[
                                      { value: 'ARS', label: 'ARS', native: 'Peso Argentino' },
                                      { value: 'USD', label: 'USD', native: 'Dólar Estadounidense' },
                                    ]}
                                    value={bankAccounts.currency || 'ARS'}
                                    onChange={(option) => {
                                      bankAccounts.setCurrency(option.value);
                                    }}
                                    placeholder="Seleccionar moneda..."
                                    renderValue={(option) => option ? option.label : ''}
                                    fullWidth={true}
                                    searchable={true}
                                    sx={{
                                      width: '100%',
                                      '& button': {
                                        height: '56px',
                                        minHeight: '56px',
                                        alignItems: 'center',
                                        display: 'flex',
                                        '& .MuiTypography-root': {
                                          fontSize: '0.875rem !important',
                                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                          lineHeight: '1.5',
                                        }
                                      }
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography
                                    component="label"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: '#ffffff',
                                      mb: 1,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                    }}
                                  >
                                    Nombre del Titular
                                  </Typography>
                                  <Input
                                    placeholder="Juan"
                                    value={bankAccounts.accountHolderFirstName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      bankAccounts.setAccountHolderFirstName(e.target.value);
                                    }}
                                    state="modern"
                                    fullWidth
                                    type="text"
                                    inputProps={{
                                      maxLength: 50,
                                    }}
                                  />
                                  {bankAccounts.accountHolderFirstNameError && (
                                    <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                                      {bankAccounts.accountHolderFirstNameError}
                                    </Text>
                                  )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography
                                    component="label"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: '#ffffff',
                                      mb: 1,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                    }}
                                  >
                                    Apellido del Titular
                                  </Typography>
                                  <Input
                                    placeholder="Pérez"
                                    value={bankAccounts.accountHolderLastName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      bankAccounts.setAccountHolderLastName(e.target.value);
                                    }}
                                    state="modern"
                                    fullWidth
                                    type="text"
                                    inputProps={{
                                      maxLength: 50,
                                    }}
                                  />
                                  {bankAccounts.accountHolderLastNameError && (
                                    <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                                      {bankAccounts.accountHolderLastNameError}
                                    </Text>
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
                                <Button
                                  sx={{ px: 5 }}
                                  disabled={
                                    !accountId ||
                                    !bankAccounts.storeId ||
                                    !bankAccounts.selectedBankId ||
                                    (!bankAccounts.cbuCvu.trim() && !bankAccounts.alias.trim()) ||
                                    !bankAccounts.accountHolderFirstName.trim() ||
                                    !bankAccounts.accountHolderLastName.trim() ||
                                    bankAccounts.createMutation.isPending
                                  }
                                  onClick={async () => {
                                    if (accountId && bankAccounts.storeId) {
                                      await bankAccounts.handleAddBankAccount();
                                      await bankAccounts.bankAccountsQuery.refetch();
                                    }
                                  }}
                                >
                                  {bankAccounts.createMutation.isPending ? (
                                    <>
                                      <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                                      Agregando...
                                    </>
                                  ) : (
                                    'Agregar nueva cuenta'
                                  )}
                                </Button>
                              </Stack>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Card: Tabla de Cuentas Bancarias */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                        border: "2px solid rgba(41, 196, 128, 0.1)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                        "&:hover": {
                          backgroundColor: "rgba(41, 196, 128, 0.08)",
                          borderColor: "rgba(41, 196, 128, 0.4)",
                        },
                        padding: { xs: 3, md: 4 },
                        gap: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', md: 'center' },
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                            fontWeight: 700,
                            color: '#34d399',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Mis Cuentas Bancarias
                        </Typography>
                        <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                          <SearchInput
                            value={bankAccountSearchTerm}
                            onChange={setBankAccountSearchTerm}
                            placeholder="Buscar cuentas bancarias..."
                            debounceMs={0}
                          />
                        </Box>
                      </Box>

                      {(() => {
                        const bankAccountsData = (bankAccounts.bankAccountsQuery.data as Array<{
                          id: string;
                          bankName: string;
                          cbu?: string | null;
                          alias?: string | null;
                          accountHolderName?: string;
                          currency?: string;
                        }>)?.map?.((account) => ({
                          id: account.id,
                          bank: account.bankName || '-',
                          cbu: account.cbu || account.alias || '-',
                          holder: account.accountHolderName || '-',
                          currency: account.currency || 'ARS',
                          actions: account.id,
                          cbuValue: account.cbu || account.alias || '',
                        })) || [];

                        const filteredBankAccounts = bankAccountsData.filter((account) => {
                          const searchLower = bankAccountSearchTerm.toLowerCase();
                          return (
                            account.bank.toLowerCase().includes(searchLower) ||
                            account.cbu.toLowerCase().includes(searchLower) ||
                            account.holder.toLowerCase().includes(searchLower)
                          );
                        });

                        const bankAccountColumns: DataTableColumn[] = [
                          {
                            title: 'BANCO',
                            data: 'bank',
                            responsivePriority: 1,
                            searchable: true,
                          },
                          {
                            title: 'CBU/CVU o Alias',
                            data: 'cbu',
                            responsivePriority: 1,
                            searchable: true,
                          },
                          {
                            title: 'TITULAR',
                            data: 'holder',
                            responsivePriority: 2,
                            searchable: true,
                          },
                          {
                            title: 'MONEDA',
                            data: 'currency',
                            responsivePriority: 3,
                            searchable: true,
                          },
                          {
                            title: 'ACCIONES',
                            data: 'actions',
                            responsivePriority: 5,
                            type: 'html',
                            orderable: false,
                            searchable: false,
                            render: function(data: unknown, type: string, row: Record<string, unknown>) {
                              if (type === 'display') {
                                const bankAccountId = String(row.id || data || '');
                                const cbuValue = String(row.cbuValue || '');

                                if (!bankAccountId || bankAccountId.trim() === '') {
                                  return '<span style="color: #ef4444;">ID inválido</span>';
                                }

                                const escapedBankAccountId = bankAccountId.replace(/'/g, "\\'");
                                const escapedCbu = cbuValue.replace(/'/g, "\\'");
                                return `
                                  <button
                                    onclick="if (window.handleDeleteBankAccountClick) { window.handleDeleteBankAccountClick('${escapedBankAccountId}', '${escapedCbu}'); }"
                                    data-icon="Delete"
                                    style="
                                      padding: 6px 16px;
                                      border-radius: 8px;
                                      background-color: transparent;
                                      border: 1px solid #ef4444;
                                      color: #ef4444;
                                      font-size: 0.875rem;
                                      font-weight: 600;
                                      font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                      cursor: pointer;
                                      transition: all 0.3s ease;
                                      min-width: 90px;
                                    "
                                    onmouseover="this.style.backgroundColor='rgba(239, 68, 68, 0.1)'; this.style.borderColor='#dc2626'; this.style.color='#dc2626';"
                                    onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='#ef4444'; this.style.color='#ef4444';"
                                  >
                                    Eliminar
                                  </button>
                                `;
                              }
                              return data as string;
                            },
                          },
                        ];

                        return (
                          <>
                            {filteredBankAccounts.length === 0 ? (
                              <EmptyState
                                title="No hay cuentas bancarias configuradas"
                                message={bankAccountSearchTerm ? "No se encontraron cuentas bancarias que coincidan con tu búsqueda." : "Cuando agregues cuentas bancarias, aparecerán aquí."}
                              />
                            ) : (
                              <DataTable
                                id="bank-accounts-table"
                                columns={bankAccountColumns}
                                data={filteredBankAccounts as Record<string, unknown>[]}
                                className="shadow-lg"
                                searching={false}
                                externalSearchTerm={bankAccountSearchTerm}
                                isLoading={bankAccounts.bankAccountsQuery.isLoading}
                              />
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  </Grid>
                </>
              )}

              {/* Tab 2: Wallets */}
              {tabs.find(tab => tab.id === '2')?.isActive && (
                <>
                  {/* Card: Configuración de Wallet */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                        border: "2px solid rgba(41, 196, 128, 0.1)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                        "&:hover": {
                          backgroundColor: "rgba(41, 196, 128, 0.08)",
                          borderColor: "rgba(41, 196, 128, 0.4)",
                        },
                        padding: { xs: 3, md: 4 },
                        gap: 3,
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          fontWeight: 700,
                          color: '#34d399',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Configuración de Wallet
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#ffffff',
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Selección de red
                          </Typography>
                          <DropdownButton
                            options={[
                              { value: '', label: 'Seleccione una Red', native: 'Seleccione una Red' },
                              ...wallets.cryptoNetworks.map((network) => ({
                                value: network,
                                label: network,
                                native: network
                              })),
                            ]}
                            value={wallets.selectedNetwork || ''}
                            onChange={(option) => {
                              wallets.setSelectedNetwork(option.value);
                            }}
                            placeholder={t.admin?.selectNetwork || "Seleccionar red..."}
                            renderValue={(option) => option ? option.label : ''}
                            fullWidth={true}
                            searchable={true}
                            sx={{
                              width: '100%',
                              '& button': {
                                height: '56px',
                                minHeight: '56px',
                                alignItems: 'center',
                                display: 'flex',
                                '& .MuiTypography-root': {
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  lineHeight: '1.5',
                                }
                              }
                            }}
                          />
                        </Grid>

                        {wallets.selectedNetwork && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              component="label"
                              sx={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#ffffff',
                                mb: 1,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Moneda
                            </Typography>
                            <DropdownButton
                              options={[
                                { value: '', label: 'Seleccione una Moneda', native: 'Seleccione una Moneda' },
                                ...wallets.getCurrenciesByNetwork(wallets.selectedNetwork).map((currency) => ({
                                  value: currency.code,
                                  label: `${currency.symbol} - ${currency.name}`,
                                  native: `${currency.symbol} - ${currency.name}`
                                })),
                              ]}
                              value={wallets.selectedCurrency || ''}
                              onChange={(option) => {
                                wallets.setSelectedCurrency(option.value);
                              }}
                              placeholder={t.admin?.selectCurrency || "Seleccionar moneda..."}
                              renderValue={(option) => option ? option.label : ''}
                              fullWidth={true}
                              searchable={true}
                              sx={{
                                width: '100%',
                                '& button': {
                                  height: '56px',
                                  minHeight: '56px',
                                  alignItems: 'center',
                                  display: 'flex',
                                  '& .MuiTypography-root': {
                                    fontSize: '0.875rem !important',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    lineHeight: '1.5',
                                  }
                                }
                              }}
                            />
                          </Grid>
                        )}

                        {wallets.selectedCurrency && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              component="label"
                              sx={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#ffffff',
                                mb: 1,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Dirección de la Wallet
                            </Typography>
                            <Input
                              placeholder="0x..."
                              value={wallets.walletAddress}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                wallets.setWalletAddress(e.target.value);
                              }}
                              state="modern"
                              fullWidth
                            />
                            {wallets.walletError && (
                              <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                                {wallets.walletError}
                              </Text>
                            )}
                          </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
                            <Button
                              sx={{ px: 5 }}
                              disabled={!accountId || !wallets.selectedNetwork || !wallets.selectedCurrency || !wallets.walletAddress || !!wallets.walletError}
                              onClick={async () => {
                                if (accountId) {
                                  await wallets.handleAddWallet(accountId);
                                  await wallets.walletsQuery.refetch();
                                }
                              }}
                            >
                              Guardar cambios
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Card: Tabla de Wallets */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                        border: "2px solid rgba(41, 196, 128, 0.1)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                        "&:hover": {
                          backgroundColor: "rgba(41, 196, 128, 0.08)",
                          borderColor: "rgba(41, 196, 128, 0.4)",
                        },
                        padding: { xs: 3, md: 4 },
                        gap: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', md: 'center' },
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                            fontWeight: 700,
                            color: '#34d399',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Mis Wallets
                        </Typography>
                        <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                          <SearchInput
                            value={walletSearchTerm}
                            onChange={setWalletSearchTerm}
                            placeholder={t.admin?.searchWallets || "Buscar wallets..."}
                            debounceMs={0}
                          />
                        </Box>
                      </Box>

                      {(() => {
                        const walletsData = (wallets.walletsQuery.data as Array<{ id: string; data?: Record<string, Record<string, { Img?: string; Wallet?: string }>>; address?: string; network?: string; token?: string }>)?.map?.((w) => {
                          let walletAddress = w?.address || '-';
                          let walletNetwork = w?.network || '-';
                          let walletToken = w?.token || '-';

                          if (w.data) {
                            const networks = Object.keys(w.data);
                            if (networks.length > 0) {
                              walletNetwork = networks[0];
                              const tokens = Object.keys(w.data[networks[0]]);
                              if (tokens.length > 0) {
                                walletToken = tokens[0];
                                walletAddress = w.data[networks[0]][tokens[0]]?.Wallet || '-';
                              }
                            }
                          }

                          return {
                            id: w.id,
                            wallet: walletAddress,
                            network: walletNetwork,
                            currency: walletToken,
                            actions: w.id,
                            walletAddress: walletAddress,
                          };
                        }) || [];

                        const filteredWallets = walletsData.filter((w) => {
                          const searchLower = walletSearchTerm.toLowerCase();
                          return (
                            w.wallet.toLowerCase().includes(searchLower) ||
                            w.network.toLowerCase().includes(searchLower) ||
                            w.currency.toLowerCase().includes(searchLower)
                          );
                        });

                        const walletColumns: DataTableColumn[] = [
                          {
                            title: 'WALLET',
                            data: 'wallet',
                            responsivePriority: 1,
                            searchable: true,
                          },
                          {
                            title: 'RED',
                            data: 'network',
                            responsivePriority: 1,
                            searchable: true,
                          },
                          {
                            title: 'MONEDA',
                            data: 'currency',
                            responsivePriority: 1,
                            searchable: true,
                          },
                          {
                            title: 'ACCIONES',
                            data: 'actions',
                            responsivePriority: 5,
                            type: 'html',
                            orderable: false,
                            searchable: false,
                            render: function(data: unknown, type: string, row: Record<string, unknown>) {
                              if (type === 'display') {
                                const walletId = String(row.id || data || '');
                                const walletAddress = String(row.walletAddress || '');

                                if (!walletId || walletId.trim() === '') {
                                  return '<span style="color: #ef4444;">ID inválido</span>';
                                }

                                const escapedWalletId = walletId.replace(/'/g, "\\'");
                                const escapedWalletAddress = walletAddress.replace(/'/g, "\\'");
                                return `
                                  <button
                                    onclick="if (window.handleDeleteWalletClick) { window.handleDeleteWalletClick('${escapedWalletId}', '${escapedWalletAddress}'); }"
                                    data-icon="Delete"
                                    style="
                                      padding: 6px 16px;
                                      border-radius: 8px;
                                      background-color: transparent;
                                      border: 1px solid #ef4444;
                                      color: #ef4444;
                                      font-size: 0.875rem;
                                      font-weight: 600;
                                      font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                      cursor: pointer;
                                      transition: all 0.3s ease;
                                      min-width: 90px;
                                    "
                                    onmouseover="this.style.backgroundColor='rgba(239, 68, 68, 0.1)'; this.style.borderColor='#dc2626'; this.style.color='#dc2626';"
                                    onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='#ef4444'; this.style.color='#ef4444';"
                                  >
                                    Eliminar
                                  </button>
                                `;
                              }
                              return data as string;
                            },
                          },
                        ];

                        return (
                          <>
                            {filteredWallets.length === 0 ? (
                              <EmptyState
                                title={t.admin?.noWalletsConfigured || "No hay wallets configuradas"}
                                message={walletSearchTerm ? (t.admin?.noWalletsFound || "No se encontraron wallets que coincidan con tu búsqueda.") : (t.admin?.walletsWillAppearHere || "Cuando agregues wallets, aparecerán aquí.")}
                              />
                            ) : (
                              <DataTable
                                id="wallets-table"
                                columns={walletColumns}
                                data={filteredWallets as Record<string, unknown>[]}
                                className="shadow-lg"
                                searching={false}
                                externalSearchTerm={walletSearchTerm}
                                isLoading={wallets.walletsQuery.isLoading}
                              />
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  </Grid>
                </>
              )}

              {/* Tab 3: MercadoPago */}
              {tabs.find(tab => tab.id === '3')?.isActive && (
                <Grid size={{ xs: 12 }}>
                  <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Configuración de MercadoPago
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Link de Pago de MercadoPago
                      </Typography>
                      <Input
                        placeholder="https://mpago.la/..."
                        value={paymentMethods.mercadoPagoLink}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          paymentMethods.setMercadoPagoLink(e.target.value);
                        }}
                        state="modern"
                        fullWidth
                        type="url"
                        inputProps={{
                          maxLength: 500,
                        }}
                      />
                      {paymentMethods.mercadoPagoLinkError && (
                        <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                          {paymentMethods.mercadoPagoLinkError}
                        </Text>
                      )}
                      <Text variant="span" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                        Ingrese el link de pago de MercadoPago para recibir pagos
                      </Text>
                    </Grid>
                  </Grid>

                  {/* Botón de guardar */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
                    <Button
                      onClick={paymentMethods.handleUpdateMercadoPagoLink}
                      disabled={
                        paymentMethods.updateMercadoPagoLinkMutation.isPending ||
                        !paymentMethods.storeId ||
                        paymentMethods.integrationsQuery.isLoading
                      }
                      variant="success"
                      sx={{
                        backgroundColor: '#29C480',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#22a36b',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(41, 196, 128, 0.5)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      {paymentMethods.updateMercadoPagoLinkMutation.isPending ? (
                        <>
                          <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                          Guardando...
                        </>
                      ) : (
                        paymentMethods.currentLink ? 'Actualizar Link' : 'Guardar Link'
                      )}
                    </Button>
                  </Box>

                  {/* Mostrar link actual si existe */}
                  {paymentMethods.currentLink && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: 'rgba(41, 196, 128, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(41, 196, 128, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Text variant="span" color="textSecondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                          Link actual configurado:
                        </Text>
                        <Text
                          variant="span"
                          sx={{
                            fontSize: '0.875rem',
                            color: '#34d399',
                            wordBreak: 'break-all',
                            display: 'block',
                          }}
                        >
                          {paymentMethods.currentLink}
                        </Text>
                      </Box>
                      <Button
                        onClick={paymentMethods.handleDeleteMercadoPagoLink}
                        disabled={paymentMethods.deleteMercadoPagoLinkMutation.isPending}
                        variant="danger"
                        sx={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          textTransform: 'none',
                          minWidth: '120px',
                          '&:hover': {
                            backgroundColor: '#dc2626',
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        }}
                      >
                        {paymentMethods.deleteMercadoPagoLinkMutation.isPending ? (
                          <>
                            <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar Link'
                        )}
                      </Button>
                    </Box>
                  )}
                  </Box>
                </Grid>
              )}

              {/* Tab 4: Efectivo en puntos físicos */}
              {tabs.find(tab => tab.id === '4')?.isActive && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        borderColor: "rgba(41, 196, 128, 0.4)",
                      },
                      padding: { xs: 3, md: 4 },
                      gap: 3,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Configuración de Efectivo en Puntos Físicos
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 2,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Seleccionar medios de pago
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          {/* Rapipago */}
                          <Box
                            onClick={() => handlePhysicalPaymentMethodToggle('rapipago')}
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              flex: 1,
                              minHeight: '56px',
                              py: 1.5,
                              px: 2,
                              borderRadius: '4px',
                              background: physicalPaymentMethods.includes('rapipago')
                                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: physicalPaymentMethods.includes('rapipago')
                                ? '1px solid #34d399'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              overflow: 'hidden',
                              '&:hover': {
                                background: physicalPaymentMethods.includes('rapipago')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                  : 'rgba(255, 255, 255, 0.08)',
                                borderColor: physicalPaymentMethods.includes('rapipago') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                          >
                            {/* Imagen de fondo grande rotada */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(10deg)',
                                width: '300px',
                                height: '300px',
                                opacity: 0.5,
                                zIndex: 0,
                                pointerEvents: 'none',
                              }}
                            >
                              <Box
                                component="img"
                                src="/images/means-of-payment/rapipago.svg"
                                alt=""
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>

                            {/* Contenido */}
                            <Box
                              sx={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  color: physicalPaymentMethods.includes('rapipago') ? '#34d399' : '#ffffff',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  transition: 'color 0.3s ease',
                                  flex: 1,
                                }}
                              >
                                Rapipago
                              </Typography>
                              {physicalPaymentMethods.includes('rapipago') && (
                                <CheckCircle
                                  sx={{
                                    fontSize: '1.125rem',
                                    color: '#34d399',
                                    ml: 1,
                                    flexShrink: 0,
                                    filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Pago Fácil */}
                          <Box
                            onClick={() => handlePhysicalPaymentMethodToggle('pago-facil')}
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              flex: 1,
                              minHeight: '56px',
                              py: 1.5,
                              px: 2,
                              borderRadius: '4px',
                              background: physicalPaymentMethods.includes('pago-facil')
                                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: physicalPaymentMethods.includes('pago-facil')
                                ? '1px solid #34d399'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              overflow: 'hidden',
                              '&:hover': {
                                background: physicalPaymentMethods.includes('pago-facil')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                  : 'rgba(255, 255, 255, 0.08)',
                                borderColor: physicalPaymentMethods.includes('pago-facil') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                          >
                            {/* Imagen de fondo grande rotada */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(10deg)',
                                width: '300px',
                                height: '300px',
                                opacity: 0.5,
                                zIndex: 0,
                                pointerEvents: 'none',
                              }}
                            >
                              <Box
                                component="img"
                                src="/images/means-of-payment/pago-facil.svg"
                                alt=""
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>

                            {/* Contenido */}
                            <Box
                              sx={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  color: physicalPaymentMethods.includes('pago-facil') ? '#34d399' : '#ffffff',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  transition: 'color 0.3s ease',
                                  flex: 1,
                                }}
                              >
                                Pago Fácil
                              </Typography>
                              {physicalPaymentMethods.includes('pago-facil') && (
                                <CheckCircle
                                  sx={{
                                    fontSize: '1.125rem',
                                    color: '#34d399',
                                    ml: 1,
                                    flexShrink: 0,
                                    filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Stack>

                        {/* Botón de guardar */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3 }}>
                            <Button
                              onClick={handleUpdatePhysicalPayments}
                              disabled={
                                updatePhysicalPaymentsMutation.isPending ||
                                !paymentMethods.storeId ||
                                paymentMethods.integrationsQuery.isLoading
                              }
                              variant="success"
                              sx={{
                                backgroundColor: '#29C480',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: '#22a36b',
                                },
                                '&:disabled': {
                                  backgroundColor: 'rgba(41, 196, 128, 0.5)',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                },
                              }}
                            >
                              {updatePhysicalPaymentsMutation.isPending ? (
                                <>
                                  <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                                  Guardando...
                                </>
                              ) : (
                                'Guardar cambios'
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* Tab 5: Billeteras virtuales */}
              {tabs.find(tab => tab.id === '5')?.isActive && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        borderColor: "rgba(41, 196, 128, 0.4)",
                      },
                      padding: { xs: 3, md: 4 },
                      gap: 3,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Configuración de Billeteras Virtuales
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 2,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Seleccionar billeteras virtuales
                        </Typography>
                        <Grid container spacing={2}>
                          {/* MercadoPago */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box
                              onClick={() => handleVirtualWalletToggle('mercado-pago')}
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                minHeight: '56px',
                                py: 1.5,
                                px: 2,
                                borderRadius: '4px',
                                background: virtualWallets.includes('mercado-pago')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: virtualWallets.includes('mercado-pago')
                                  ? '1px solid #34d399'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: virtualWallets.includes('mercado-pago')
                                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  borderColor: virtualWallets.includes('mercado-pago') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                                },
                              }}
                            >
                              {/* Imagen de fondo grande rotada */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%) rotate(10deg)',
                                  width: '300px',
                                  height: '300px',
                                  opacity: 0.5,
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Box
                                  component="img"
                                  src="/images/means-of-payment/mp-rgb-handshake-pluma-horizontal-1.svg"
                                  alt=""
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Contenido */}
                              <Box
                                sx={{
                                  position: 'relative',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: virtualWallets.includes('mercado-pago') ? '#34d399' : '#ffffff',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    transition: 'color 0.3s ease',
                                    flex: 1,
                                  }}
                                >
                                  MercadoPago
                                </Typography>
                                {virtualWallets.includes('mercado-pago') && (
                                  <CheckCircle
                                    sx={{
                                      fontSize: '1.125rem',
                                      color: '#34d399',
                                      ml: 1,
                                      flexShrink: 0,
                                      filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>

                          {/* Ualá */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box
                              onClick={() => handleVirtualWalletToggle('uala')}
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                minHeight: '56px',
                                py: 1.5,
                                px: 2,
                                borderRadius: '4px',
                                background: virtualWallets.includes('uala')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: virtualWallets.includes('uala')
                                  ? '1px solid #34d399'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: virtualWallets.includes('uala')
                                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  borderColor: virtualWallets.includes('uala') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                                },
                              }}
                            >
                              {/* Imagen de fondo grande rotada */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%) rotate(10deg)',
                                  width: '300px',
                                  height: '300px',
                                  opacity: 0.5,
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Box
                                  component="img"
                                  src="/images/means-of-payment/uala.svg"
                                  alt=""
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Contenido */}
                              <Box
                                sx={{
                                  position: 'relative',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: virtualWallets.includes('uala') ? '#34d399' : '#ffffff',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    transition: 'color 0.3s ease',
                                    flex: 1,
                                  }}
                                >
                                  Ualá
                                </Typography>
                                {virtualWallets.includes('uala') && (
                                  <CheckCircle
                                    sx={{
                                      fontSize: '1.125rem',
                                      color: '#34d399',
                                      ml: 1,
                                      flexShrink: 0,
                                      filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>

                          {/* Brubank */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box
                              onClick={() => handleVirtualWalletToggle('brubank')}
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                minHeight: '56px',
                                py: 1.5,
                                px: 2,
                                borderRadius: '4px',
                                background: virtualWallets.includes('brubank')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: virtualWallets.includes('brubank')
                                  ? '1px solid #34d399'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: virtualWallets.includes('brubank')
                                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  borderColor: virtualWallets.includes('brubank') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                                },
                              }}
                            >
                              {/* Imagen de fondo grande rotada */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%) rotate(10deg)',
                                  width: '300px',
                                  height: '300px',
                                  opacity: 0.5,
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Box
                                  component="img"
                                  src="/images/means-of-payment/brubank.svg"
                                  alt=""
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Contenido */}
                              <Box
                                sx={{
                                  position: 'relative',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: virtualWallets.includes('brubank') ? '#34d399' : '#ffffff',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    transition: 'color 0.3s ease',
                                    flex: 1,
                                  }}
                                >
                                  Brubank
                                </Typography>
                                {virtualWallets.includes('brubank') && (
                                  <CheckCircle
                                    sx={{
                                      fontSize: '1.125rem',
                                      color: '#34d399',
                                      ml: 1,
                                      flexShrink: 0,
                                      filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>

                          {/* Lemon */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box
                              onClick={() => handleVirtualWalletToggle('lemon')}
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                minHeight: '56px',
                                py: 1.5,
                                px: 2,
                                borderRadius: '4px',
                                background: virtualWallets.includes('lemon')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: virtualWallets.includes('lemon')
                                  ? '1px solid #34d399'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: virtualWallets.includes('lemon')
                                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  borderColor: virtualWallets.includes('lemon') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                                },
                              }}
                            >
                              {/* Imagen de fondo grande rotada */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%) rotate(10deg)',
                                  width: '300px',
                                  height: '300px',
                                  opacity: 0.5,
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Box
                                  component="img"
                                  src="/images/means-of-payment/lemon.svg"
                                  alt=""
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Contenido */}
                              <Box
                                sx={{
                                  position: 'relative',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: virtualWallets.includes('lemon') ? '#34d399' : '#ffffff',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    transition: 'color 0.3s ease',
                                    flex: 1,
                                  }}
                                >
                                  Lemon
                                </Typography>
                                {virtualWallets.includes('lemon') && (
                                  <CheckCircle
                                    sx={{
                                      fontSize: '1.125rem',
                                      color: '#34d399',
                                      ml: 1,
                                      flexShrink: 0,
                                      filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>

                          {/* Naranja X */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box
                              onClick={() => handleVirtualWalletToggle('naranja-x')}
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                minHeight: '56px',
                                py: 1.5,
                                px: 2,
                                borderRadius: '4px',
                                background: virtualWallets.includes('naranja-x')
                                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: virtualWallets.includes('naranja-x')
                                  ? '1px solid #34d399'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: virtualWallets.includes('naranja-x')
                                    ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                  borderColor: virtualWallets.includes('naranja-x') ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                                },
                              }}
                            >
                              {/* Imagen de fondo grande rotada */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%) rotate(10deg)',
                                  width: '300px',
                                  height: '300px',
                                  opacity: 0.5,
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Box
                                  component="img"
                                  src="/images/means-of-payment/naranjax.svg"
                                  alt=""
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>

                              {/* Contenido */}
                              <Box
                                sx={{
                                  position: 'relative',
                                  zIndex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: virtualWallets.includes('naranja-x') ? '#34d399' : '#ffffff',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    transition: 'color 0.3s ease',
                                    flex: 1,
                                  }}
                                >
                                  Naranja X
                                </Typography>
                                {virtualWallets.includes('naranja-x') && (
                                  <CheckCircle
                                    sx={{
                                      fontSize: '1.125rem',
                                      color: '#34d399',
                                      ml: 1,
                                      flexShrink: 0,
                                      filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Botón de guardar */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3 }}>
                            <Button
                              onClick={handleUpdateVirtualWallets}
                              disabled={
                                updateVirtualWalletsMutation.isPending ||
                                !paymentMethods.storeId ||
                                paymentMethods.integrationsQuery.isLoading
                              }
                              variant="success"
                              sx={{
                                backgroundColor: '#29C480',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: '#22a36b',
                                },
                                '&:disabled': {
                                  backgroundColor: 'rgba(41, 196, 128, 0.5)',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                },
                              }}
                            >
                              {updateVirtualWalletsMutation.isPending ? (
                                <>
                                  <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                                  Guardando...
                                </>
                              ) : (
                                'Guardar cambios'
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

// Componente RenderTabs (copiado y adaptado de upload-product-page)
const RenderTabs = ({ id, label, isActive, disabled, onClick, isFirst, isLast, isMobile }: { id: string, label: string, isActive: boolean, disabled: boolean, onClick: () => void; isFirst?: boolean; isLast?: boolean; isMobile?: boolean; }) => {
  // Mapear iconos según el id del tab
  const getIcon = () => {
    const iconSize = isMobile ? '1.75rem' : '1.25rem';
    if (id === '1') return <AccountBalance sx={{ fontSize: iconSize }} />; // Cuentas Bancarias
    if (id === '2') return <AccountBalanceWallet sx={{ fontSize: iconSize }} />; // Wallets
    if (id === '3') return <Payment sx={{ fontSize: iconSize }} />; // MercadoPago
    if (id === '4') return <LocalAtm sx={{ fontSize: iconSize }} />; // Efectivo en puntos físicos
    if (id === '5') return <Wallet sx={{ fontSize: iconSize }} />; // Billeteras virtuales
    return null;
  };

  // Calcular border-radius para que los botones estén pegados
  const getBorderRadius = () => {
    // En mobile, cada tab tiene border-radius completo
    if (isMobile) {
      return '12px';
    }
    // En desktop, mantener la lógica original
    if (isActive) {
      if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
      if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
      return '0';
    }
    if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
    if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
    return '0';
  };

  // Calcular bordes para que se vean pegados
  const getBorderStyles = () => {
    const baseBorder = isActive
      ? "2px solid rgba(41, 196, 128, 0.4)"
      : "2px solid rgba(71, 85, 105, 0.3)";

    // En mobile, cada tab tiene todos los bordes
    if (isMobile) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }

    // En desktop, mantener la lógica original
    if (isActive) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }

    if (isFirst) {
      return {
        borderTop: baseBorder,
        borderRight: 'none',
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }
    if (isLast) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: 'none',
      };
    }
    return {
      borderTop: baseBorder,
      borderRight: 'none',
      borderBottom: baseBorder,
      borderLeft: 'none',
    };
  };

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? (isActive ? 'space-between' : 'center') : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        borderRadius: getBorderRadius(),
        ...getBorderStyles(),
        // Efecto acordeón horizontal en mobile
        ...(isMobile
          ? {
              width: isActive ? 'auto' : '56px',
              minWidth: isActive ? '180px' : '56px',
              minHeight: '56px',
              padding: isActive ? '1rem 1.5rem' : '1rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: isActive ? 1 : 0,
              flexGrow: isActive ? 1 : 0,
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      marginLeft: 'auto',
                      flexShrink: 0,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      transform: 'scale(1.05)',
                      '& svg': {
                        color: '#cbd5e1',
                        transform: 'scale(1.1)',
                      },
                    },
                  }),
            }
          : {
              // Desktop: mantener comportamiento original
              width: 'auto',
              minHeight: 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      ml: 1,
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      ml: 1,
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      color: '#cbd5e1',
                      '& svg': {
                        color: '#cbd5e1',
                      },
                    },
                  }),
            }),
        ...(disabled && {
          opacity: 0.5,
        }),
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          flex: isMobile && isActive ? 1 : 'none',
          textAlign: isMobile && isActive ? 'left' : 'inherit',
          ...(isMobile && {
            opacity: isActive ? 1 : 0,
            width: isActive ? 'auto' : 0,
            overflow: 'hidden',
            transition: isActive
              ? 'opacity 0.3s ease-in 0.1s, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'opacity 0.2s ease-out, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }),
        }}
      >
        {label}
      </Typography>
      {getIcon()}
    </Box>
  );
};

export default PaymentMethodsPage;

