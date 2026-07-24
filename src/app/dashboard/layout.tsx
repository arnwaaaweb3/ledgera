// src/app/dashboard/layout.tsx
import React from "react";
import NameRegistrationModal from "@/src/components/auth/NameRegistrationModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      {children}
      {/* Modal registrasi nama & auto-wallet hanya dipanggil di area Dashboard */}
      <NameRegistrationModal />
    </div>
  );
}