'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ModalState {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ModalContextType {
  modals: ModalState[];
  openModal: (id: string, onClose: () => void) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = useCallback((id: string, onClose: () => void) => {
    setModals(prev => {
      // Remove existing modal with same id if it exists
      const filtered = prev.filter(modal => modal.id !== id);
      // Add new modal
      return [...filtered, { id, isOpen: true, onClose }];
    });
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal) {
        modal.onClose();
        return prev.filter(m => m.id !== id);
      }
      return prev;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    modals.forEach(modal => {
      if (modal.isOpen) {
        modal.onClose();
      }
    });
    setModals([]);
  }, [modals]);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id && modal.isOpen);
  }, [modals]);

  // Global click handler for closing modals
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Check if any modal is open
      if (modals.length === 0) return;

      // Check if the click is on a modal element or its children
      const target = event.target as Element;
      const isModalElement = target.closest('[data-modal-content]');
      
      // If click is not on modal content, close all modals
      if (!isModalElement) {
        closeAllModals();
      }
    };

    if (modals.length > 0) {
      document.addEventListener('mousedown', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [modals, closeAllModals]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Hook for individual modal management
export const useModalState = (modalId: string) => {
  const { openModal, closeModal, isModalOpen } = useModal();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    openModal(modalId, () => {
      // Don't call setIsOpen here to avoid circular updates
      // The global modal system will handle the closing
    });
  }, [modalId, openModal]);

  const close = useCallback(() => {
    setIsOpen(false);
    closeModal(modalId);
  }, [modalId, closeModal]);

  // Use the global modal state as the source of truth
  const globalIsOpen = isModalOpen(modalId);

  return {
    isOpen: globalIsOpen || isOpen,
    open,
    close,
    isModalOpen: globalIsOpen,
  };
};
