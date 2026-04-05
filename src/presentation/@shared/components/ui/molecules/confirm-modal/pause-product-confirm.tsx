"use client";

import React from 'react';
import ConfirmModal from './confirm-modal';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface PauseProductConfirmProps {
  isOpen: boolean;
  paused: boolean; // estado actual
  productName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const PauseProductConfirm: React.FC<PauseProductConfirmProps> = ({
  isOpen,
  paused,
  productName,
  loading,
  onClose,
  onConfirm,
}) => {
  const confirmText = paused ? 'Publicar' : 'Pausar';
  const title = paused ? 'Publicar producto' : 'Pausar producto';

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText={confirmText}
      confirmVariant={paused ? 'success' : 'danger'}
      loading={loading}
    >
      <Text variant="h5" weight="bold" className="mb-2">{title}</Text>
      <Text variant="p">
        {paused
          ? `¿Deseas publicar el producto "${productName ?? ''}" para que vuelva a estar visible?`
          : `¿Deseas pausar el producto "${productName ?? ''}" para que deje de estar visible?`}
      </Text>
    </ConfirmModal>
  );
};

export default PauseProductConfirm;


