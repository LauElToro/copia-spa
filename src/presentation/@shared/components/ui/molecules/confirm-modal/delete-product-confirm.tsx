"use client";

import React from 'react';
import ConfirmModal from './confirm-modal';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface DeleteProductConfirmProps {
  isOpen: boolean;
  productName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const DeleteProductConfirm: React.FC<DeleteProductConfirmProps> = ({
  isOpen,
  productName,
  loading,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Eliminar"
      confirmVariant="danger"
      loading={loading}
    >
      <Text variant="h5" weight="bold" className="mb-2">Eliminar producto</Text>
      <Text variant="p">Esta acción es irreversible. Se eliminará &ldquo;{productName ?? ''}&rdquo; de forma permanente.</Text>
    </ConfirmModal>
  );
};

export default DeleteProductConfirm;


