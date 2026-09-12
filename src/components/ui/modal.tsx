"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
};

function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`modal-content relative w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-[36px] bg-white shadow-2xl border border-gray-100 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-5 bg-white shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 shrink-0 ml-4"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 modal-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export { Modal };
