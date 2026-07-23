"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Image from "next/image";
import { X, Camera, Check } from "lucide-react";

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
  // Mencegah error Hydration di Next.js saat Portal
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle Click Outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-modal-card")) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling ketika modal terbuka
  React.useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(
    user?.avatarSeed || "Felix"
  );
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);

  const handleAvatarSelect = (seed: string) => {
    setSelectedAvatar(seed);
    onAvatarChange?.(seed);
  };

  const getAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/10.x/notionists/svg?seed=${seed}`;

  if (!isOpen || !mounted) return null;

  // Hapus variable 'initial' yang tidak digunakan
  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");

  // Portal ke document.body agar berada tepat di tengah layar penuh
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop / Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container Card */}
      <div
        className={`
          profile-modal-card
          relative
          w-110 max-w-[90vw] 
          bg-white rounded-2xl shadow-2xl 
          border border-brand-dark/10 
          overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/5">
          <h3
            id="profile-modal-title"
            className="text-lg font-heading font-semibold text-brand-dark"
          >
            User Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5 text-brand-dark/60 hover:text-brand-dark transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar & Name Section */}
          <div className="flex items-center gap-4 p-4 bg-surface/50 rounded-xl border border-brand-dark/5">
            <div className="relative shrink-0">
              {/* Ganti img dengan Image dari Next.js */}
              <div className="relative w-14 h-14">
                <Image
                  src={getAvatarUrl(selectedAvatar)}
                  alt={`${displayName}'s avatar`}
                  fill
                  className="rounded-2xl bg-surface shadow-md border-2 border-brand-dark/10 object-cover"
                  unoptimized // Karena dari external URL
                />
              </div>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-purple rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                aria-label="Change avatar"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="overflow-hidden">
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
                  className="text-xs text-brand-purple hover:text-brand-dark transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {AVATAR_SEEDS.map((seed) => (
                  <button
                    key={seed}
                    onClick={() => handleAvatarSelect(seed)}
                    className={`
                      relative w-12 h-12 rounded-xl overflow-hidden transition-all cursor-pointer
                      ${selectedAvatar === seed
                        ? "ring-2 ring-brand-purple ring-offset-2 scale-105"
                        : "hover:scale-105 hover:shadow-md"
                      }
                    `}
                    aria-label={`Select avatar ${seed}`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={getAvatarUrl(seed)}
                        alt={seed}
                        fill
                        className="object-cover bg-surface"
                        unoptimized // Karena dari external URL
                      />
                    </div>
                    {selectedAvatar === seed && (
                      <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-brand-purple bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}