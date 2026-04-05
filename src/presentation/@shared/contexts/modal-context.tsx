"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Modal, ModalProps } from '@/presentation/@shared/components/ui/atoms/modal';

interface ModalState {
  isOpen: boolean;
  content: ReactNode | (() => ReactNode) | null;
  props: Omit<ModalProps, 'open' | 'children' | 'onClose'>;
}

interface ModalContextType {
  openModal: (content: ReactNode | (() => ReactNode), props?: Omit<ModalProps, 'open' | 'children' | 'onClose'>) => void;
  closeModal: () => void;
  updateModalContent: (content: ReactNode | (() => ReactNode)) => void;
  updateModalProps: (props: Partial<Omit<ModalProps, 'open' | 'children' | 'onClose'>>) => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    props: {},
  });

  const openModal = useCallback((content: ReactNode | (() => ReactNode), props?: Omit<ModalProps, 'open' | 'children' | 'onClose'>) => {
    setModalState({
      isOpen: true,
      content,
      props: props || {},
    });
  }, []);

  const updateModalContent = useCallback((content: ReactNode | (() => ReactNode)) => {
    setModalState((prev) => ({
      ...prev,
      content,
    }));
  }, []);

  const updateModalProps = useCallback((props: Partial<Omit<ModalProps, 'open' | 'children' | 'onClose'>>) => {
    setModalState((prev) => ({
      ...prev,
      props: { ...prev.props, ...props },
    }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    // Limpiar el contenido después de la animación de cierre
    setTimeout(() => {
      setModalState({
        isOpen: false,
        content: null,
        props: {},
      });
    }, 300);
  }, []);

  // Renderizar el contenido del modal dinámicamente
  const modalContent = useMemo(() => {
    if (!modalState.content) return null;
    if (typeof modalState.content === 'function') {
      return modalState.content();
    }
    return modalState.content;
  }, [modalState]);

  return (
    <ModalContext.Provider value={{ 
      openModal, 
      closeModal, 
      updateModalContent, 
      updateModalProps, 
      isOpen: modalState.isOpen 
    }}>
      {children}
      <Modal
        open={modalState.isOpen}
        onClose={closeModal}
        {...modalState.props}
      >
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

