"use client";

import React, { createContext, useContext, useState } from "react";
import { SubmitDriveModal } from "./submit-drive-modal";

type SubmitModalContextType = {
  isSubmitModalOpen: boolean;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
};

const SubmitModalContext = createContext<SubmitModalContextType | undefined>(undefined);

export function SubmitModalProvider({ children }: { children: React.ReactNode }) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const openSubmitModal = () => setIsSubmitModalOpen(true);
  const closeSubmitModal = () => setIsSubmitModalOpen(false);

  return (
    <SubmitModalContext.Provider
      value={{
        isSubmitModalOpen,
        openSubmitModal,
        closeSubmitModal,
      }}
    >
      {children}
      <SubmitDriveModal open={isSubmitModalOpen} onClose={closeSubmitModal} />
    </SubmitModalContext.Provider>
  );
}

export function useSubmitModal() {
  const context = useContext(SubmitModalContext);
  if (!context) {
    return {
      isSubmitModalOpen: false,
      openSubmitModal: () => {},
      closeSubmitModal: () => {},
    };
  }
  return context;
}
