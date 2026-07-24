// src/components/sidebar/LogoutConfirmModal.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

// Helper untuk mengecek apakah kode sedang berjalan di browser (Client-side)
const emptySubscribe = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: LogoutConfirmModalProps) {
  const isClient = useIsClient();

  if (!isOpen || !isClient) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-brand-dark/10 text-center space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-heading font-bold text-brand-dark">
            Sign Out?
          </h3>
          <p className="text-xs font-body text-brand-dark/60 mt-1">
            Do you want to log out from your account?
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-surface text-brand-dark rounded-xl text-xs font-semibold hover:bg-surface/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}