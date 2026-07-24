"use client";

import * as React from "react";
import { Home, LayoutDashboard, Link, Wallet } from "lucide-react";

import SidebarHeader from "@/src/components/sidebar/SidebarHeader";
import SidebarWallet from "@/src/components/sidebar/SidebarWallet";
import SidebarWalletBalance from "@/src/components/sidebar/wallets/WalletBalance";
import SidebarNavItem, { MenuItem } from "@/src/components/sidebar/SidebarNavItem";
import SidebarUserProfile from "@/src/components/sidebar/SidebarUserProfile";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string | null;
  walletAddress?: string | null;
}

// 💥 MENU YANG DISEDERHANAKAN - Hanya 4 item
const menuItems: MenuItem[] = [
  { 
    title: "Dashboard", 
    icon: Home, 
    url: "/dashboard" 
  },
  { 
    title: "Workspace", 
    icon: LayoutDashboard, 
    url: "/workspace" 
  },
  { 
    title: "Connection", 
    icon: Link, 
    url: "/connection" 
  },
  { 
    title: "Wallet", 
    icon: Wallet, 
    url: "/wallet" 
  },
];

// Subscriber store untuk membaca localStorage secara reaktif
const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [renderSidebar, setRenderSidebar] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]); // 💥 Kosongkan karena ga ada submenu
  const [activeItem, setActiveItem] = React.useState<string>("Dashboard");
  const [isWalletBalanceOpen, setIsWalletBalanceOpen] = React.useState(false);

  // Ambil data user secara reaktif dari localStorage
  const storedUserRaw = React.useSyncExternalStore(
    subscribeUserStore,
    getUserSnapshot,
    getUserServerSnapshot
  );

  // Parsing data user & ekstrak wallet address
  const walletAddress = React.useMemo(() => {
    if (!storedUserRaw) return null;
    try {
      const parsedUser: UserProfile = JSON.parse(storedUserRaw);
      return parsedUser.walletAddress || null;
    } catch {
      return null;
    }
  }, [storedUserRaw]);

  React.useEffect(() => {
    let frame: number | null = null;
    let timer: number | null = null;

    if (isOpen) {
      frame = window.requestAnimationFrame(() => setRenderSidebar(true));
    } else {
      timer = window.setTimeout(() => setRenderSidebar(false), 300);
    }

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [isOpen]);

  // Derived State: Popup balance wallet HANYA muncul jika:
  // 1. Sidebar terbuka (isOpen)
  // 2. User mengklik wallet (isWalletBalanceOpen)
  // 3. Wallet address tersedia (connected)
  const showWalletBalance = isOpen && isWalletBalanceOpen && !!walletAddress;

  if (!renderSidebar) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Main Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SidebarHeader onClose={onClose} />

        <SidebarWallet 
          onWalletClick={() => {
            // Hanya buka popup jika wallet connected
            if (walletAddress) {
              setIsWalletBalanceOpen(true);
            }
          }}
        />

        {/* Menu Items Container */}
        <div className="px-3 py-2 overflow-y-auto h-[calc(100vh-180px)]">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.title}
                item={item}
                activeItem={activeItem}
                expandedItems={expandedItems}
                onToggleExpand={(title) =>
                  setExpandedItems((prev) =>
                    prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title]
                  )
                }
                onItemClick={setActiveItem}
              />
            ))}
          </nav>
        </div>

        <SidebarUserProfile />
      </div>

      {showWalletBalance && (
        <SidebarWalletBalance
          isOpen={showWalletBalance}
          onClose={() => setIsWalletBalanceOpen(false)}
        />
      )}
    </>
  );
}