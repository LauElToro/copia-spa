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
import { useConfigurationWallets } from '../hooks/use-configuration-wallets';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { useConfigurationForm } from '@/presentation/@shared/hooks/use-configuration-form';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

const WalletsPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const { openModal, closeModal } = useModal();
  const [walletSearchTerm, setWalletSearchTerm] = useState('');
  const [isDeletingWallet, setIsDeletingWallet] = useState(false);
  
  // Obtener accountId del hook de configuración
  const { accountId } = useConfigurationForm(toast);
  
  // Hook para wallets
  const wallets = useConfigurationWallets(toast);

  // Función para manejar la eliminación de wallet
  const handleDeleteWallet = useCallback((walletId: string, walletAddress: string) => {
    console.log('[handleDeleteWallet] walletId recibido en componente:', walletId);
    console.log('[handleDeleteWallet] walletAddress recibido en componente:', walletAddress);
    const handleConfirm = async () => {
      try {
        setIsDeletingWallet(true);
        if (!walletId || walletId.trim() === '') {
          console.error('[handleDeleteWallet] ID de wallet inválido en componente:', walletId);
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
            Eliminar Wallet
          </Typography>

          {/* Wallet Section */}
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
              ¿Desea eliminar esta Wallet: {walletAddress}? Esta acción no se puede deshacer.
            </Typography>
          </Box>

          {/* Action Buttons Section */}
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

  // Exponer la función globalmente para que DataTable pueda llamarla
  useEffect(() => {
    const windowWithHandler = window as Window & {
      handleDeleteWalletClick?: (walletId: string, walletAddress: string) => void;
    };
    windowWithHandler.handleDeleteWalletClick = handleDeleteWallet;
    return () => {
      delete windowWithHandler.handleDeleteWalletClick;
    };
  }, [handleDeleteWallet]);

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
                { label: 'Mis Wallets' }
              ]}
            />

            {/* Content */}
            <Grid container spacing={4}>
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
                              // Forzar refetch de la query para actualizar la tabla
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

              {/* Card: Mis Wallets */}
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

                  {/* Tabla de wallets */}
                  {(() => {
                    // Transformar datos de wallets para la tabla
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

                    // Filtrar por término de búsqueda
                    const filteredWallets = walletsData.filter((w) => {
                      const searchLower = walletSearchTerm.toLowerCase();
                      return (
                        w.wallet.toLowerCase().includes(searchLower) ||
                        w.network.toLowerCase().includes(searchLower) ||
                        w.currency.toLowerCase().includes(searchLower)
                      );
                    });

                    // Columnas de la tabla
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
                            // Obtener el ID desde el row.id directamente, ya que data puede no ser confiable
                            const walletId = String(row.id || data || '');
                            const walletAddress = String(row.wallet || '');
                            
                            // Validar que el ID no esté vacío
                            if (!walletId || walletId.trim() === '') {
                              return '<span style="color: #ef4444;">ID inválido</span>';
                            }
                            
                            // Escapar comillas simples para evitar problemas en el HTML
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
            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default WalletsPage;

