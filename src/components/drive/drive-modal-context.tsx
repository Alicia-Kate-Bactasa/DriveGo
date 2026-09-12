"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DriveModal, DriveModalData } from "./drive-modal";

type DriveModalContextType = {
  openDriveModal: (drive: DriveModalData) => void;
  closeDriveModal: () => void;
  isDriveModalOpen: boolean;
};

const DriveModalContext = createContext<DriveModalContextType | undefined>(undefined);

export function DriveModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedDrive, setSelectedDrive] = useState<DriveModalData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDriveModal = (drive: DriveModalData) => {
    setSelectedDrive(drive);
    setIsOpen(true);
  };

  const closeDriveModal = () => {
    setIsOpen(false);
    setSelectedDrive(null);
  };

  // Auto-open modal if driveId is present in URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const driveId = params.get("driveId");
    if (!driveId) return;

    fetch(`/api/drives/${driveId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          openDriveModal(data);
          // Remove driveId query param from URL cleanly
          const url = new URL(window.location.href);
          url.searchParams.delete("driveId");
          window.history.replaceState({}, "", url.toString());
        }
      })
      .catch((err) => {
        console.error("Failed to fetch drive for modal:", err);
      });
  }, []);

  return (
    <DriveModalContext.Provider
      value={{
        openDriveModal,
        closeDriveModal,
        isDriveModalOpen: isOpen,
      }}
    >
      {children}
      <DriveModal
        open={isOpen}
        onClose={closeDriveModal}
        drive={selectedDrive}
      />
    </DriveModalContext.Provider>
  );
}

export function useDriveModal() {
  const context = useContext(DriveModalContext);
  if (!context) {
    return {
      openDriveModal: () => {},
      closeDriveModal: () => {},
      isDriveModalOpen: false,
    };
  }
  return context;
}
