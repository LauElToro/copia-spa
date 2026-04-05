"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { Box, Container, Grid, Typography, Button as MuiButton, CircularProgress } from "@mui/material";

import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { IconButton } from '@/presentation/@shared/components/ui/atoms/icon-button';
import { Close as CloseIcon } from '@mui/icons-material';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import { useConfigurationBankAccounts } from '../hooks/use-configuration-bank-accounts';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { useConfigurationForm } from '@/presentation/@shared/hooks/use-configuration-form';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

const BankAccountsPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const { openModal, closeModal } = useModal();
  const [bankAccountSearchTerm, setBankAccountSearchTerm] = useState('');
  const [isDeletingBankAccount, setIsDeletingBankAccount] = useState(false);
  
  // Obtener accountId del hook de configuración
  const { accountId } = useConfigurationForm(toast);
  
  // Hook para cuentas bancarias
  const bankAccounts = useConfigurationBankAccounts(toast);

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
          {/* Close Button */}
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

          {/* Título */}
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

          {/* CBU/CVU Section */}
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

          {/* Mensaje de confirmación */}
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

          {/* Action Buttons Section */}
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

  // Exponer la función globalmente para que DataTable pueda llamarla
  useEffect(() => {
    const windowWithHandler = window as Window & {
      handleDeleteBankAccountClick?: (bankAccountId: string, cbu: string) => void;
    };
    windowWithHandler.handleDeleteBankAccountClick = handleDeleteBankAccount;
    return () => {
      delete windowWithHandler.handleDeleteBankAccountClick;
    };
  }, [handleDeleteBankAccount]);

  // Preparar opciones de bancos para el select
  const bankOptions = React.useMemo(() => {
    const banks = bankAccounts.banksQuery.data || [];
    return [
      { value: '', label: 'Seleccione un Banco', native: 'Seleccione un Banco' },
      ...banks.map((bank) => ({
        value: bank.id,
        label: bank.bcra.name,
        native: bank.bcra.name,
      })),
    ];
  }, [bankAccounts.banksQuery.data]);

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
                { label: 'Mis Cuentas Bancarias' }
              ]}
            />

            {/* Content */}
            <Grid container spacing={4}>
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
                      </>
                    )}

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
                              // Forzar refetch de la query para actualizar la tabla
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
                  </Grid>
                </Box>
              </Grid>

              {/* Card: Mis Cuentas Bancarias */}
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
                  {/* Título y buscador */}
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

                  {/* Tabla de cuentas bancarias */}
                  {(() => {
                    // Transformar datos de cuentas bancarias para la tabla
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

                    // Filtrar por término de búsqueda
                    const filteredBankAccounts = bankAccountsData.filter((account) => {
                      const searchLower = bankAccountSearchTerm.toLowerCase();
                      return (
                        account.bank.toLowerCase().includes(searchLower) ||
                        account.cbu.toLowerCase().includes(searchLower) ||
                        account.holder.toLowerCase().includes(searchLower)
                      );
                    });

                    // Columnas de la tabla
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
            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default BankAccountsPage;

