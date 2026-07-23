// src/components/Sidebar.tsx
"use client";

import * as React from "react";
import { Home, BarChart, FileText, Users } from "lucide-react";

import SidebarHeader from "@/src/components/sidebar/SidebarHeader";
import SidebarWallet from "@/src/components/sidebar/SidebarWallet"; 
import SidebarNavItem, { MenuItem } from "@/src/components/sidebar/SidebarNavItem";
import SidebarUserProfile from "@/src/components/sidebar/SidebarUserProfile";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", icon: Home, url: "#" },
  { title: "Analytics", icon: BarChart, url: "#" },
  {
    title: "Documents",
    icon: FileText,
    items: [
      { title: "Recent", url: "#" },
      { title: "Starred", url: "#" },
      { title: "Archived", url: "#" },
    ],
  },
  {
    title: "Team",
    icon: Users,
    items: [
      { title: "Members", url: "#" },
      { title: "Invites", url: "#" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [renderSidebar, setRenderSidebar] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Documents"]);
  const [activeItem, setActiveItem] = React.useState<string>("Dashboard");

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

        <SidebarWallet />

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
    </>
  );
}