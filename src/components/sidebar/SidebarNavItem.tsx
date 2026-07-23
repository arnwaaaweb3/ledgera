"use client";

import { ChevronRight } from "lucide-react";

export interface MenuItem {
  title: string;
  icon: React.ElementType;
  items?: { title: string; url: string }[];
  url?: string;
}

interface SidebarNavItemProps {
  item: MenuItem;
  activeItem: string;
  expandedItems: string[];
  onToggleExpand: (title: string) => void;
  onItemClick: (title: string) => void;
}

export default function SidebarNavItem({
  item,
  activeItem,
  expandedItems,
  onToggleExpand,
  onItemClick,
}: SidebarNavItemProps) {
  const isExpanded = expandedItems.includes(item.title);
  const isActive = activeItem === item.title;

  if (item.items) {
    return (
      <div>
        <button
          onClick={() => onToggleExpand(item.title)}
          className={`
            flex items-center justify-between w-full px-4 py-3 
            text-left rounded-xl transition-all duration-200 group cursor-pointer
            ${isActive ? "bg-brand-pink/10 text-brand-dark" : "hover:bg-surface text-brand-dark/80 hover:text-brand-dark"}
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                ${isActive ? "bg-brand-pink text-white" : "bg-surface text-brand-dark/60 group-hover:text-brand-dark"}
              `}
            >
              <item.icon className="w-4 h-4" />
            </div>
            <span className="font-body font-medium">{item.title}</span>
          </div>
          <ChevronRight
            className={`
              w-4 h-4 transition-all duration-300
              ${isExpanded ? "rotate-90 text-brand-pink" : "text-brand-dark/40"}
            `}
          />
        </button>

        {isExpanded && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-brand-pink/20 pl-4">
            {item.items.map((subItem) => (
              <a
                key={subItem.title}
                href={subItem.url}
                className="block px-4 py-2 text-sm font-body text-brand-dark/60 rounded-lg hover:bg-surface hover:text-brand-dark transition-all duration-200"
              >
                {subItem.title}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={item.url}
      onClick={() => onItemClick(item.title)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive ? "bg-brand-pink/10 text-brand-dark" : "text-brand-dark/80 hover:bg-surface hover:text-brand-dark"}
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
          ${isActive ? "bg-brand-pink text-white" : "bg-surface text-brand-dark/60 group-hover:text-brand-dark"}
        `}
      >
        <item.icon className="w-4 h-4" />
      </div>
      <span className="font-body font-medium">{item.title}</span>
      {isActive && <div className="ml-auto w-1.5 h-6 rounded-full bg-brand-pink" />}
    </a>
  );
}