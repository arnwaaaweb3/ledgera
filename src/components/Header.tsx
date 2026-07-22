// src/components/Header.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import Sidebar from "@/src/components/Sidebar";

export default function Header() {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <header className="w-full bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Kiri: Logo */}
                    <div className="flex items-center select-none gap-2">
                        <Image
                            src="/images/logo/logolux1.png"
                            alt="Ledgera Logo"
                            width={50}
                            height={20}
                            className="object-contain pointer-events-none"
                            priority
                            draggable={false}
                        />
                        <Image
                            src="/images/logo/logotxt-blue.png"
                            alt="Ledgera Text"
                            width={120}
                            height={60}
                            className="object-contain pointer-events-none"
                            priority
                            draggable={false}
                        />
                    </div>

                    {/* Kanan: Search Bar + Language Switch + Hamburger */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <div
                                className={`
                                    flex items-center rounded-lg border-2 transition-all duration-200
                                    ${isSearchFocused
                                        ? "bg-white border-brand-dark"
                                        : "bg-white border-brand-dark"
                                    }
                                `}
                            >
                                <svg
                                    className="w-4 h-4 text-brand-dark ml-3 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search projects here..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="w-48 lg:w-64 px-3 py-2 bg-transparent text-sm text-brand-dark placeholder-brand-dark/50 outline-none"
                                />
                                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="text-brand-dark/50 hover:text-brand-dark transition-colors"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Language Switch */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-brand-dark/70 hover:text-brand-dark cursor-pointer"
                                aria-label="Switch Language"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </button>

                            {isLanguageOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                    <button className="w-full px-4 py-2 text-left text-sm text-brand-dark hover:bg-gray-50 transition-colors">
                                        🇮🇩 Indonesia
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-brand-dark hover:bg-gray-50 transition-colors">
                                        🇬🇧 English
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Icon */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-brand-dark/70 hover:text-brand-dark cursor-pointer"
                            aria-label="Menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </>
    );
}