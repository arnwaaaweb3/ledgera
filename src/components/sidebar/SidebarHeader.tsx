"use client";

import { X } from "lucide-react";

interface SidebarHeaderProps {
  onClose: () => void;
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-pink to-brand-light-pink" />
      <div className="flex items-center justify-between p-6 pt-7">
        <h2 className="text-2xl font-heading font-bold text-brand-dark tracking-tight">
          Menu
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-surface transition-all duration-200 cursor-pointer group"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5 text-brand-dark/60 group-hover:text-brand-dark transition-colors" />
        </button>
      </div>
    </div>
  );
}