'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useIntegrations } from '@/presentation/@shared/hooks/use-integrations';
import { useConfiguration } from '@/presentation/@shared/hooks/use-configuration';
import type { ToastContextType } from '@/presentation/@shared/components/ui/molecules/toast';

/**
 * Valida que el link sea una URL válida
 */
const validateUrl = (value: string): boolean => {
  if (!value.trim()) return false;
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
};

export const useConfigurationPaymentMethods = (toast?: ToastContextType) => {
  const { storeQuery } = useConfiguration();
  // Asegurar que storeId sea siempre un string válido o undefined
  const storeId = useMemo(() => {
    const id = storeQuery.data?.id;
    if (!id) return undefined;
    // Convertir a string si es un número
    const idString = typeof id === 'string' ? id : String(id);
    // Validar que no sea 'null' o 'undefined' como string
    if (idString === 'null' || idString === 'undefined' || idString.trim() === '') {
      return undefined;
    }
    return idString;
  }, [storeQuery.data?.id]);

  const { integrationsQuery, updateMercadoPagoLinkMutation, deleteMercadoPagoLinkMutation, updatePhysicalPaymentsMutation, updateVirtualWalletsMutation } = useIntegrations(storeId);

  const [mercadoPagoLink, setMercadoPagoLink] = useState<string>('');
  const [mercadoPagoLinkError, setMercadoPagoLinkError] = useState<string>('');

  // Estado para medios de pago físico - se sincroniza con el backend
  const [physicalPaymentMethods, setPhysicalPaymentMethods] = useState<string[]>([]);

  // Estado para billeteras virtuales - se sincroniza con el backend
  const [virtualWallets, setVirtualWallets] = useState<string[]>([]);

  // Cargar el link actual si existe (NO se autocompleta en el input)
  const currentLink = useMemo(() => {
    return integrationsQuery.data?.integrations?.mercadoPago?.link || '';
  }, [integrationsQuery.data]);

  // Cargar medios de pago físico desde las integraciones y sincronizar el estado
  useEffect(() => {
    const physicalPayments = integrationsQuery.data?.integrations?.physicalPayments;
    if (physicalPayments?.methods) {
      const enabledMethods: string[] = [];
      if (physicalPayments.methods.rapipago === true) {
        enabledMethods.push('rapipago');
      }
      if (physicalPayments.methods.pagoFacil === true) {
        enabledMethods.push('pago-facil');
      }
      setPhysicalPaymentMethods(enabledMethods);
    }
  }, [integrationsQuery.data]);

  // Cargar billeteras virtuales desde las integraciones y sincronizar el estado
  useEffect(() => {
    const virtualWalletsData = integrationsQuery.data?.integrations?.virtualWallets;
    if (virtualWalletsData?.methods) {
      const enabledMethods: string[] = [];
      if (virtualWalletsData.methods.mercadoPago === true) {
        enabledMethods.push('mercado-pago');
      }
      if (virtualWalletsData.methods.uala === true) {
        enabledMethods.push('uala');
      }
      if (virtualWalletsData.methods.brubank === true) {
        enabledMethods.push('brubank');
      }
      if (virtualWalletsData.methods.lemon === true) {
        enabledMethods.push('lemon');
      }
      if (virtualWalletsData.methods.naranjaX === true) {
        enabledMethods.push('naranja-x');
      }
      setVirtualWallets(enabledMethods);
    }
  }, [integrationsQuery.data]);

  const handleMercadoPagoLinkChange = useCallback((value: string) => {
    setMercadoPagoLink(value);
    setMercadoPagoLinkError('');
  }, []);

  const handleUpdateMercadoPagoLink = useCallback(async () => {
    if (!storeId || (typeof storeId !== 'string' && typeof storeId !== 'number')) {
      toast?.error('No se pudo identificar la tienda');
      return;
    }

    const storeIdString = typeof storeId === 'string' ? storeId : String(storeId);

    // Validaciones
    if (!mercadoPagoLink.trim()) {
      setMercadoPagoLinkError('El link de MercadoPago es requerido');
      toast?.error('Por favor ingrese un link de MercadoPago');
      return;
    }

    if (!validateUrl(mercadoPagoLink.trim())) {
      setMercadoPagoLinkError('El link proporcionado no es una URL válida');
      toast?.error('Por favor ingrese una URL válida');
      return;
    }

    try {
      await updateMercadoPagoLinkMutation.mutateAsync({
        storeId: storeIdString,
        link: mercadoPagoLink.trim(),
      });

      toast?.success('Link de MercadoPago actualizado exitosamente');
      // No limpiar el campo ya que es el mismo link actualizado
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      let errorMessage = 'Error al actualizar el link de MercadoPago';
      let specificLinkError = '';

      if (axiosError?.response?.data?.message) {
        const messages = Array.isArray(axiosError.response.data.message)
          ? axiosError.response.data.message
          : [axiosError.response.data.message];

        if (messages.some(msg => msg.includes('link'))) {
          specificLinkError = messages.find(msg => msg.includes('link')) || '';
        }

        errorMessage = messages.join(', ');
      }

      setMercadoPagoLinkError(specificLinkError);
      toast?.error(errorMessage);
    }
  }, [storeId, mercadoPagoLink, updateMercadoPagoLinkMutation, toast]);

  const handleDeleteMercadoPagoLink = useCallback(async () => {
    if (!storeId || (typeof storeId !== 'string' && typeof storeId !== 'number')) {
      toast?.error('No se pudo identificar la tienda');
      return;
    }

    if (!currentLink) {
      toast?.error('No hay un link de MercadoPago configurado para eliminar');
      return;
    }

    const storeIdString = typeof storeId === 'string' ? storeId : String(storeId);

    try {
      await deleteMercadoPagoLinkMutation.mutateAsync({
        storeId: storeIdString,
      });

      // Limpiar el input después de eliminar
      setMercadoPagoLink('');
      toast?.success('Link de MercadoPago eliminado exitosamente');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      let errorMessage = 'Error al eliminar el link de MercadoPago';

      if (axiosError?.response?.data?.message) {
        const messages = Array.isArray(axiosError.response.data.message)
          ? axiosError.response.data.message
          : [axiosError.response.data.message];
        errorMessage = messages.join(', ');
      }

      toast?.error(errorMessage);
    }
  }, [storeId, currentLink, deleteMercadoPagoLinkMutation, toast]);

  // Handler para actualizar medios de pago físico
  const handleUpdatePhysicalPayments = useCallback(async () => {
    if (!storeId || (typeof storeId !== 'string' && typeof storeId !== 'number')) {
      toast?.error('No se pudo identificar la tienda');
      return;
    }

    const storeIdString = typeof storeId === 'string' ? storeId : String(storeId);

    try {
      await updatePhysicalPaymentsMutation.mutateAsync({
        storeId: storeIdString,
        rapipago: physicalPaymentMethods.includes('rapipago'),
        pagoFacil: physicalPaymentMethods.includes('pago-facil'),
      });

      toast?.success('Medios de pago físicos actualizados exitosamente');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      let errorMessage = 'Error al actualizar los medios de pago físicos';

      if (axiosError?.response?.data?.message) {
        const messages = Array.isArray(axiosError.response.data.message)
          ? axiosError.response.data.message
          : [axiosError.response.data.message];
        errorMessage = messages.join(', ');
      }

      toast?.error(errorMessage);
    }
  }, [storeId, physicalPaymentMethods, updatePhysicalPaymentsMutation, toast]);

  // Handler para toggle de métodos de pago físico
  const handlePhysicalPaymentMethodToggle = useCallback((methodId: string) => {
    setPhysicalPaymentMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  }, []);

  // Handler para actualizar billeteras virtuales
  const handleUpdateVirtualWallets = useCallback(async () => {
    if (!storeId || (typeof storeId !== 'string' && typeof storeId !== 'number')) {
      toast?.error('No se pudo identificar la tienda');
      return;
    }

    const storeIdString = typeof storeId === 'string' ? storeId : String(storeId);

    try {
      await updateVirtualWalletsMutation.mutateAsync({
        storeId: storeIdString,
        mercadoPago: virtualWallets.includes('mercado-pago'),
        uala: virtualWallets.includes('uala'),
        brubank: virtualWallets.includes('brubank'),
        lemon: virtualWallets.includes('lemon'),
        naranjaX: virtualWallets.includes('naranja-x'),
      });

      toast?.success('Billeteras virtuales actualizadas exitosamente');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      let errorMessage = 'Error al actualizar las billeteras virtuales';

      if (axiosError?.response?.data?.message) {
        const messages = Array.isArray(axiosError.response.data.message)
          ? axiosError.response.data.message
          : [axiosError.response.data.message];
        errorMessage = messages.join(', ');
      }

      toast?.error(errorMessage);
    }
  }, [storeId, virtualWallets, updateVirtualWalletsMutation, toast]);

  // Handler para toggle de billeteras virtuales
  const handleVirtualWalletToggle = useCallback((walletId: string) => {
    setVirtualWallets(prev => 
      prev.includes(walletId) 
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    );
  }, []);

  return {
    storeQuery,
    storeId,
    integrationsQuery,
    updateMercadoPagoLinkMutation,
    deleteMercadoPagoLinkMutation,
    updatePhysicalPaymentsMutation,
    updateVirtualWalletsMutation,
    mercadoPagoLink,
    setMercadoPagoLink: handleMercadoPagoLinkChange,
    mercadoPagoLinkError,
    handleUpdateMercadoPagoLink,
    handleDeleteMercadoPagoLink,
    currentLink,
    physicalPaymentMethods,
    handlePhysicalPaymentMethodToggle,
    handleUpdatePhysicalPayments,
    virtualWallets,
    handleVirtualWalletToggle,
    handleUpdateVirtualWallets,
  };
};

