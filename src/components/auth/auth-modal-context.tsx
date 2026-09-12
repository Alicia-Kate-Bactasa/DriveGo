"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthModal } from "./auth-modal";

type AuthModalContextType = {
  isAuthModalOpen: boolean;
  authMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        open={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    return {
      isAuthModalOpen: false,
      authMode: "login" as const,
      openAuthModal: () => {},
      closeAuthModal: () => {},
    };
  }
  return context;
}
