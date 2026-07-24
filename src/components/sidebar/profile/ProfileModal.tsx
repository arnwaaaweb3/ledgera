// src/components/sidebar/profile/ProfileModal.tsx
"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Image from "next/image";
import axios from "axios";
import { X, Camera, Check, Loader2 } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    email?: string;
    displayName?: string | null;
    walletAddress?: string;
    avatarSeed?: string;
  } | null;
  onAvatarChange?: (seed: string) => void;
}

const AVATAR_SEEDS = [
  "Felix", "Aria", "Leo", "Mia", "Oscar", "Luna", "Jasper", "Zara",
  "Max", "Nova", "Finn", "Ivy", "Rex", "Sage", "Atlas", "Lyra",
  "Willow", "Pixel", "Onyx", "Kai", "River", "Storm"
];

export default function ProfileModal({ isOpen, onClose, user, onAvatarChange }: ProfileModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(
    user?.avatarSeed || "Felix"
  );
  const [saving, setSaving] = React.useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);

  // Sync prop avatarSeed jika props user berubah
  const [prevAvatarSeed, setPrevAvatarSeed] = React.useState<string | undefined>(user?.avatarSeed);
  if (user?.avatarSeed !== prevAvatarSeed) {
    setPrevAvatarSeed(user?.avatarSeed);
    setSelectedAvatar(user?.avatarSeed || "Felix");
  }

  const handleCloseModal = React.useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleCloseModal]);

  // Handle Click Outside
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-modal-card")) {
        handleCloseModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleCloseModal]);

  // Lock scroll
  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 🔥 PILIH & SIMPAN AVATAR LANGSUNG KE DATABASE + LOCALSTORAGE
  const handleAvatarSelect = async (seed: string) => {
    setSelectedAvatar(seed);
    onAvatarChange?.(seed);

    const storedUserRaw = localStorage.getItem("user");
    let currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : user;

    // 1. Update ke LocalStorage terlebih dahulu (responsif instan)
    if (currentUser) {
      currentUser = { ...currentUser, avatarSeed: seed };
      localStorage.setItem("user", JSON.stringify(currentUser));
      window.dispatchEvent(new Event("storage"));
    }

    // 2. Kirim dan simpan secara permanen di Database via API
    if (user?.id) {
      setSaving(true);
      try {
        const response = await axios.post("/api/user/profile", {
          userId: user.id,
          avatarSeed: seed,
        });

        if (response.data.success) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.error("Failed to save avatar to database:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const getAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/10.x/notionists/svg?seed=${seed}`;

  if (!isOpen || !mounted) return null;

  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleCloseModal}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="profile-modal-card relative w-110 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-brand-dark/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/5">
          <h3 className="text-lg font-heading font-semibold text-brand-dark">
            User Profile
          </h3>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-brand-dark/60 hover:text-brand-dark transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 bg-surface/50 rounded-xl border border-brand-dark/5">
            <div className="relative shrink-0 p-1">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-dark/10 shadow-md bg-surface flex items-center justify-center">
                <Image
                  src={getAvatarUrl(selectedAvatar)}
                  alt={`${displayName}'s avatar`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {saving && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 z-10 w-7 h-7 bg-brand-dark rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="overflow-hidden pl-1">
              <h4 className="font-heading font-semibold text-base text-brand-dark truncate">
                {displayName}
              </h4>
              <p className="text-xs font-body text-brand-dark/50 truncate">
                {user?.email || "No Email"}
              </p>
            </div>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && (
            <div className="mt-4 p-4 bg-surface/50 rounded-xl border border-brand-dark/5">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-heading font-semibold text-brand-dark">
                  Choose Avatar
                </h5>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-brand-purple hover:text-brand-dark transition-colors cursor-pointer font-medium"
                >
                  Done
                </button>
              </div>

              <div className="relative">
                <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-2 pb-1">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => handleAvatarSelect(seed)}
                      disabled={saving}
                      className={`
                        relative w-12 h-12 rounded-xl overflow-hidden transition-all cursor-pointer shrink-0 disabled:opacity-50
                        ${selectedAvatar === seed
                          ? "ring-2 ring-brand-purple ring-offset-2 scale-105"
                          : "hover:scale-105 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={getAvatarUrl(seed)}
                          alt={seed}
                          fill
                          className="object-cover bg-surface"
                          unoptimized
                        />
                      </div>
                      {selectedAvatar === seed && (
                        <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-brand-purple bg-white rounded-full p-0.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-surface/50 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}