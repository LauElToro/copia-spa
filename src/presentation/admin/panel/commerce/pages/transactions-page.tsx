"use client";

import React, { useMemo } from 'react';
import { Box, Container, Stack } from '@mui/material';
import TransactionsSection from '@/presentation/@shared/components/ui/molecules/transactions-section';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { useTransactions } from '@/presentation/@shared/hooks/use-transactions';
import { usePaymentOrders } from '@/presentation/@shared/hooks/use-payment-orders';
import { TransactionEntity, TransactionStatus, PurchaseTransaction } from '@/presentation/@shared/types/transaction';
import { formatPrice } from '@/presentation/@shared/utils/format-price';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

// Función para obtener el variant del badge según el estado
const getStatusVariant = (status: string): 'pending' | 'completed' | 'cancelled' | 'failed' | 'refunded' | 'approved' | 'paused' => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('pendiente') || statusLower.includes('proceso')) return 'pending';
  if (statusLower.includes('aprobada') || statusLower.includes('completada')) return 'completed';
  if (statusLower.includes('cancelada')) return 'cancelled';
  if (statusLower.includes('fallida')) return 'failed';
  if (statusLower.includes('reembolsada')) return 'refunded';
  if (statusLower.includes('pausada')) return 'paused';
  return 'pending';
};

// Función para obtener los estilos del badge
const getBadgeStyles = (variant: string) => {
  const styles: Record<string, { bg: string; border: string; text: string }> = {
    pending: {
      bg: 'rgba(101, 116, 45, 0.3)',
      border: '#D4AF37',
      text: '#D4AF37',
    },
    completed: {
      bg: 'rgba(41, 196, 128, 0.2)',
      border: '#29C480',
      text: '#29C480',
    },
    approved: {
      bg: 'rgba(41, 196, 128, 0.2)',
      border: '#29C480',
      text: '#29C480',
    },
    cancelled: {
      bg: 'rgba(239, 68, 68, 0.2)',
      border: '#EF4444',
      text: '#EF4444',
    },
    failed: {
      bg: 'rgba(239, 68, 68, 0.2)',
      border: '#EF4444',
      text: '#EF4444',
    },
    refunded: {
      bg: 'rgba(251, 191, 36, 0.2)',
      border: '#FBBF24',
      text: '#FBBF24',
    },
    paused: {
      bg: 'rgba(107, 114, 128, 0.2)',
      border: '#6B7280',
      text: '#6B7280',
    },
  };
  return styles[variant] || styles.pending;
};

const TransactionsPage: React.FC = () => {
  const { t } = useLanguage();
  // Leer el perfil directamente del localStorage
  const userStr = globalThis.window?.localStorage?.getItem("user");
  const profile = userStr ? JSON.parse(userStr) : null;

  const isCommerce = profile?.accountType === 'commerce' || profile?.accountType === 'seller';
  const accountId = profile?.id;

  // Obtener transacciones del usuario actual (compras)
  const { getTransactions } = useTransactions(accountId);
  const { data: transactions, isLoading, isError, error } = getTransactions;

  // Obtener payment orders para mapear productos
  const { getPaymentOrders } = usePaymentOrders(accountId);
  const { data: paymentOrders } = getPaymentOrders;

  // Crear un mapa de transactionId -> productos
  const transactionProductsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!paymentOrders) return map;

    paymentOrders.forEach((order) => {
      order.transactions?.forEach((transaction) => {
        // Obtener el primer producto o concatenar todos los nombres
        if (transaction.items && transaction.items.length > 0) {
          const productNames = transaction.items.map((item) => item.name);
          map.set(transaction.transactionId, productNames.join(', '));
        }
      });
    });

    return map;
  }, [paymentOrders]);

  // Columnas para ventas
  const salesColumns: DataTableColumn[] = useMemo(() => [
        {
          title: 'ID',
          data: 'id',
          responsivePriority: 1},
        {
          title: 'PRODUCTO',
          data: 'product',
          responsivePriority: 1,
          searchable: true},
        {
          title: 'MONTO',
          data: 'amount',
          responsivePriority: 1},
        {
          title: 'COMPRADOR',
          data: 'buyer',
          responsivePriority: 1,
          searchable: true},
        {
          title: 'MEDIO',
          data: 'method',
          responsivePriority: 1,
          searchable: true},
        {
          title: 'ESTADO',
          data: 'status',
          responsivePriority: 5,
          type: 'html',
          render: function(data: unknown, type: string) {
            if (type === 'display') {
              const status = String(data || '');
              const variant = getStatusVariant(status);
              const badgeStyles = getBadgeStyles(variant);
              return `
                <div style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 4px 12px;
                  border-radius: 8px;
                  background-color: ${badgeStyles.bg};
                  border: 1px solid ${badgeStyles.border};
                  color: ${badgeStyles.text};
                  font-size: 0.875rem;
                  font-weight: 600;
                  font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  white-space: nowrap;
                ">
                  ${status}
                </div>
              `;
            }
            return data as string;
          },
          searchable: true},
        {
          title: 'EMAIL COMPRADOR',
          data: 'email',
          responsivePriority: 1,
          searchable: true},
        {
          title: 'FECHA',
          data: 'date',
          responsivePriority: 1,
          searchable: true},
        {
          title: 'ACCIONES',
          data: 'id',
          orderable: false,
          searchable: false,
          type: 'html',
          render: function (data: unknown, type: string, row: Record<string, unknown>) {
            if (type === 'display') {
              const transactionId = row.id as string;
            return `
                <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                <a 
                    href="/admin/panel/transactions/${transactionId}"
                    style="
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      padding: 12px 32px;
                      background-color: #29C480;
                      color: #1e293b;
                      font-weight: 600;
                      border-radius: 8px;
                      text-transform: none;
                      font-size: 1rem;
                      text-decoration: none;
                      transition: background-color 0.3s ease, color 0.3s ease;
                      min-width: 100px;
                    "
                    onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                    onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
                >
                  Detalles
                </a>
                <a 
                    href="/admin/panel/transactions/${transactionId}/review"
                    style="
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      padding: 12px 32px;
                      background-color: #29C480;
                      color: #1e293b;
                      font-weight: 600;
                      border-radius: 8px;
                      text-transform: none;
                      font-size: 1rem;
                      text-decoration: none;
                      transition: background-color 0.3s ease, color 0.3s ease;
                      min-width: 100px;
                    "
                    onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                    onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
                >
                  Opinión
                </a>
              </div>
            `;
            }
            return data as string;
          },
          responsivePriority: 1}
  ], []);

  const purchasesColumns: DataTableColumn[] = useMemo(() => [
      { title: "ID", data: "id", responsivePriority: 1 },
      { title: "PRODUCTO", data: "product", responsivePriority: 1, searchable: true },
      { 
        title: "VENDEDOR", 
        data: "seller", 
        responsivePriority: 1,
        type: 'html',
        render: function(data: unknown, type: string, row: Record<string, unknown>) {
          if (type === 'display') {
            const seller = String(data || 'N/A');
            const email = String(row.email || 'N/A');
            return `
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span>${seller}</span>
                ${email !== 'N/A' ? `<span style="color: #29C480; font-size: 0.75rem;">${email}</span>` : ''}
              </div>
            `;
          }
          return data as string;
        },
      },
    {
      title: "ESTADO",
      data: "status",
      responsivePriority: 1,
      type: 'html',
      render: function (data: unknown, type: string) {
        if (type === 'display') {
          const status = String(data || '');
          const variant = getStatusVariant(status);
          const badgeStyles = getBadgeStyles(variant);
          return `
            <div style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 4px 12px;
              border-radius: 8px;
              background-color: ${badgeStyles.bg};
              border: 1px solid ${badgeStyles.border};
              color: ${badgeStyles.text};
              font-size: 0.875rem;
              font-weight: 600;
              font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              white-space: nowrap;
            ">
              ${status}
            </div>
          `;
        }
        return data as string;
      },
    },
      { title: "MONTO", data: "amount", responsivePriority: 1 },
      { title: "FECHA", data: "date", responsivePriority: 1, searchable: true },
      {
        title: 'ACCIONES',
        data: 'id',
        orderable: false,
        searchable: false,
        type: 'html',
        render: function (data: unknown, type: string, row: Record<string, unknown>) {
          if (type === 'display') {
            const transactionId = row.id as string;
          return `
            <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
              <a 
                  href="/admin/panel/transactions/${transactionId}"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 12px 32px;
                  background-color: #29C480;
                  color: #1e293b;
                  font-weight: 600;
                  border-radius: 8px;
                  text-transform: none;
                  font-size: 1rem;
                  text-decoration: none;
                  transition: background-color 0.3s ease, color 0.3s ease;
                  min-width: 100px;
                "
                onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
              >
                Detalles
              </a>
              <a 
                  href="/admin/panel/transactions/${transactionId}/review"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 12px 32px;
                  background-color: #29C480;
                  color: #1e293b;
                  font-weight: 600;
                  border-radius: 8px;
                  text-transform: none;
                  font-size: 1rem;
                  text-decoration: none;
                  transition: background-color 0.3s ease, color 0.3s ease;
                  min-width: 100px;
                "
                onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
              >
                Opinar
              </a>
            </div>
          `;
          }
          return data as string;
        },
      responsivePriority: 1
    }
  ], []);

  // Mapear transacciones al formato esperado por la tabla de compras
  const purchasesData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    return transactions.map((transaction: TransactionEntity): PurchaseTransaction => {
      // Formatear fecha
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'});

      // Formatear monto con moneda usando el helper
      const formattedAmount = formatPrice(transaction.totalAmount, transaction.currency);

      // Mapear estado
      const statusMap: Record<TransactionStatus, string> = {
        [TransactionStatus.COMPLETED]: 'Aprobada',
        [TransactionStatus.PENDING]: 'Pendiente',
        [TransactionStatus.CANCELLED]: 'Cancelada',
        [TransactionStatus.FAILED]: 'Fallida',
        [TransactionStatus.REFUNDED]: 'Reembolsada'};
      const status = statusMap[transaction.status] || transaction.status;

      // Obtener nombre del producto desde el mapa
      const productName = transactionProductsMap.get(transaction.transactionId) || transaction.transactionId || 'N/A';

      // Obtener información del vendedor desde payment orders
      let sellerName = 'N/A';
      let sellerEmail = 'N/A';
      
      if (paymentOrders) {
        for (const order of paymentOrders) {
          const paymentTransaction = order.transactions?.find(
            (t) => t.transactionId === transaction.transactionId
          );
          if (paymentTransaction?.store) {
            sellerName = paymentTransaction.store.name || 'N/A';
            sellerEmail = paymentTransaction.store.contactEmail || 'N/A';
            break;
          }
        }
      }

      return {
        id: transaction.id,
        product: productName,
        seller: sellerName,
        email: sellerEmail,
        status,
        amount: formattedAmount,
        date: formattedDate};
    });
  }, [transactions, transactionProductsMap, paymentOrders]);

  // Datos mock para ventas (se mantienen hasta integrar con API)
  const salesData = useMemo(() => [], []);

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
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.transactions || 'Transacciones' }
              ]}
            />
            <TransactionsSection
              title={t.admin?.transactions || "Transacciones"}
              isLoading={isLoading}
              isError={isError}
              error={error}
              purchasesData={purchasesData}
              salesData={salesData}
              purchasesColumns={purchasesColumns}
              salesColumns={salesColumns}
              isCommerce={isCommerce}
              onRetry={() => getTransactions.refetch()}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default TransactionsPage;
