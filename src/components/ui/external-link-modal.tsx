"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { getDomainTrust } from "@/lib/security";
import { ExternalLink, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

type ExternalLinkModalProps = {
  url: string | null;
  open: boolean;
  onClose: () => void;
};

export function ExternalLinkModal({ url, open, onClose }: ExternalLinkModalProps) {
  if (!open || !url) return null;

  const { isTrusted, domain } = getDomainTrust(url);

  const handleProceed = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-gray-900">
          <ShieldAlert size={20} className="text-amber-500" />
          <span>Leaving DriveGo</span>
        </span>
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Destination Box with Trust Badge */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Destination URL
          </span>
          <p className="mt-1 text-sm font-semibold text-gray-900 break-all leading-snug">
            {url}
          </p>

          <div className="mt-3 flex items-center">
            {isTrusted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Trusted Platform ({domain})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>External Unverified Domain — Proceed with caution</span>
              </span>
            )}
          </div>
        </div>

        {/* Advisory Caution Text */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold text-amber-950 mb-0.5">Security Notice:</p>
          DriveGo does not host or verify external files. Never download unknown executable files or enter your account passwords on external websites.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleProceed}
            className="rounded-full px-5 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <span>Proceed to External Site</span>
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
