// src/components/Sidebar.tsx
"use client";

import * as React from "react";
import {
  ChevronRight,
  Home,
  BarChart,
  FileText,
  Users,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  items?: { title: string; url: string }[];
  url?: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    url: "#",
  },
  {
    title: "Analytics",
    icon: BarChart,
    url: "#",
  },
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

  // Animasi mount/unmount
  React.useEffect(() => {
    let frame: number | null = null;
    let timer: number | null = null;

    if (isOpen) {
      frame = window.requestAnimationFrame(() => {
        setRenderSidebar(true);
      });
    } else {
      timer = window.setTimeout(() => {
        setRenderSidebar(false);
      }, 300);
    }

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [isOpen]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleItemClick = (title: string) => {
    setActiveItem(title);
  };

  if (!renderSidebar) return null;

  return (
    <>
      {/* Overlay dengan blur lebih halus */}
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0"}
        `}
        onClick={onClose}
      />

      {/* Sidebar Panel - White dengan shadow besar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header - dengan brand accent line */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-pink to-brand-light-pink" />
          <div className="flex items-center justify-between p-6 pt-7">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-heading font-bold text-brand-dark tracking-tight">
                Menu
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface transition-all duration-200 cursor-pointer group"
            >
              <X className="w-5 h-5 text-brand-dark/60 group-hover:text-brand-dark transition-colors" />
            </button>
          </div>
        </div>

        {/* Content - dengan spacing lebih modern */}
        <div className="px-3 py-2 overflow-y-auto h-[calc(100vh-180px)]">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.items ? (
                  // Menu dengan sub-item (accordion)
                  <div>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={`
                        flex items-center justify-between w-full px-4 py-3 
                        text-left rounded-xl transition-all duration-200 group
                        ${
                          activeItem === item.title
                            ? "bg-brand-pink/10 text-brand-dark"
                            : "hover:bg-surface text-brand-dark/80 hover:text-brand-dark"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            transition-all duration-200
                            ${
                              activeItem === item.title
                                ? "bg-brand-pink text-white"
                                : "bg-surface text-brand-dark/60 group-hover:text-brand-dark"
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-body font-medium">
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight
                        className={`
                          w-4 h-4 transition-all duration-300
                          ${
                            expandedItems.includes(item.title)
                              ? "rotate-90 text-brand-pink"
                              : "text-brand-dark/40"
                          }
                        `}
                      />
                    </button>
                    {expandedItems.includes(item.title) && (
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
                ) : (
                  // Menu tanpa sub-item
                  <a
                    href={item.url}
                    onClick={() => handleItemClick(item.title)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${
                        activeItem === item.title
                          ? "bg-brand-pink/10 text-brand-dark"
                          : "text-brand-dark/80 hover:bg-surface hover:text-brand-dark"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        transition-all duration-200
                        ${
                          activeItem === item.title
                            ? "bg-brand-pink text-white"
                            : "bg-surface text-brand-dark/60 group-hover:text-brand-dark"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-body font-medium">{item.title}</span>
                    {activeItem === item.title && (
                      <div className="ml-auto w-1.5 h-6 rounded-full bg-brand-pink" />
                    )}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer - minimalis dengan hover effect */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-surface">
          <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-surface/50 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-brand-pink to-brand-light-pink flex items-center justify-center text-white font-heading font-semibold text-sm shadow-md shadow-brand-pink/20">
                  S
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-heading font-semibold text-brand-dark">
                  Skyleen
                </p>
                <p className="text-xs font-body text-brand-dark/50">
                  skyleen@example.com
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-surface transition-all duration-200">
              <LogOut className="w-5 h-5 text-brand-dark/50 hover:text-brand-dark transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}