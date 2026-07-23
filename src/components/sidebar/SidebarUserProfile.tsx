// src/components/sidebar/SidebarUserProfile.tsx
"use client";

import * as React from "react";
import { LogOut } from "lucide-react";

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string | null;
  walletAddress?: string;
}

// Custom subscriber agar mendengarkan event 'storage' lokal & tab ganda
const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function SidebarUserProfile() {
  const storedUserRaw = React.useSyncExternalStore(
    subscribeUserStore,
    getUserSnapshot,
    getUserServerSnapshot
  );

  const user = React.useMemo<UserProfile | null>(() => {
    if (!storedUserRaw) return null;
    try {
      return JSON.parse(storedUserRaw);
    } catch {
      return null;
    }
  }, [storedUserRaw]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    document.cookie = "auth_token=; path=/; max-age=0;";
    window.location.replace("/login");
  };

  const initial = user?.displayName
    ? user.displayName.charAt(0)
    : user?.email
    ? user.email.charAt(0)
    : "U";

  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-surface">
      <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-surface/50 transition-all duration-200 group">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-brand-pink to-brand-light-pink flex items-center justify-center text-white font-heading font-semibold text-sm shadow-md shadow-brand-pink/20 uppercase">
              {initial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="truncate">
            <p className="text-sm font-heading font-semibold text-brand-dark truncate">
              {displayName}
            </p>
            <p className="text-xs font-body text-brand-dark/50 truncate">
              {user?.email || "Guest"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-surface transition-all duration-200 cursor-pointer shrink-0"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-brand-dark/50 hover:text-brand-dark transition-colors" />
        </button>
      </div>
    </div>
  );
}