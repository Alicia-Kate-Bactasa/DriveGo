"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { SubmitDriveModal } from "./submit-drive-modal";

type SubmitModalContextType = {
  isSubmitModalOpen: boolean;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
};

const SubmitModalContext = createContext<SubmitModalContextType | undefined>(undefined);

export function SubmitModalProvider({ children }: { children: React.ReactNode }) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [pendingSubmitAfterAuth, setPendingSubmitAfterAuth] = useState(false);
  const { user, loading } = useUser();
  const { openAuthModal } = useAuthModal();

  const openSubmitModal = () => {
    if (!loading && !user) {
      // User is not signed in: open the EXACT same AuthModal as the home page
      setPendingSubmitAfterAuth(true);
      openAuthModal("login");
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setPendingSubmitAfterAuth(false);
  };

  // If user just signed in and had initiated "Submit a Drive", open the form immediately!
  useEffect(() => {
    if (user && pendingSubmitAfterAuth) {
      setPendingSubmitAfterAuth(false);
      setIsSubmitModalOpen(true);
    }
  }, [user, pendingSubmitAfterAuth]);

  return (
    <SubmitModalContext.Provider
      value={{
        isSubmitModalOpen,
        openSubmitModal,
        closeSubmitModal,
      }}
    >
      {children}
      {user && (
        <SubmitDriveModal open={isSubmitModalOpen} onClose={closeSubmitModal} />
      )}
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
