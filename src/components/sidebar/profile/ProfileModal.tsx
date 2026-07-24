"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Image from "next/image";
import axios from "axios";
import { X, Camera, Check, Loader2, AtSign } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    email?: string;
    displayName?: string | null;
    username?: string | null;
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

  // Ambil data user paling fresh dari LocalStorage jika ada (reaktif terhadap LocalStorage)
  const [currentUser, setCurrentUser] = React.useState(user);

  React.useEffect(() => {
    const readStorage = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }
    };

    readStorage();

    window.addEventListener("storage", readStorage);
    return () => window.removeEventListener("storage", readStorage);
  }, [user, isOpen]);

  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(
    currentUser?.avatarSeed || user?.avatarSeed || "Felix"
  );
  const [saving, setSaving] = React.useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);

  // Sync prop avatarSeed jika props/state berubah
  const activeAvatarSeed = currentUser?.avatarSeed || user?.avatarSeed;
  const [prevAvatarSeed, setPrevAvatarSeed] = React.useState<string | undefined>(activeAvatarSeed);
  
  if (activeAvatarSeed !== prevAvatarSeed) {
    setPrevAvatarSeed(activeAvatarSeed);
    setSelectedAvatar(activeAvatarSeed || "Felix");
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

  // PILIH & SIMPAN AVATAR LANGSUNG KE DATABASE + LOCALSTORAGE
  const handleAvatarSelect = async (seed: string) => {
    setSelectedAvatar(seed);
    onAvatarChange?.(seed);

    const storedUserRaw = localStorage.getItem("user");
    let activeUserData = storedUserRaw ? JSON.parse(storedUserRaw) : currentUser || user;

    if (activeUserData) {
      activeUserData = { ...activeUserData, avatarSeed: seed };
      localStorage.setItem("user", JSON.stringify(activeUserData));
      setCurrentUser(activeUserData);
      window.dispatchEvent(new Event("storage"));
    }

    const userIdToUse = activeUserData?.id || user?.id;

    if (userIdToUse) {
      setSaving(true);
      try {
        const response = await axios.post("/api/user/profile", {
          userId: userIdToUse,
          avatarSeed: seed,
        });

        if (response.data.success) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setCurrentUser(response.data.user);
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

  // Hirarki penentuan Display Name & Username yang konsisten
  const activeUser = currentUser || user;
  const displayName =
    activeUser?.displayName || (activeUser?.email ? activeUser.email.split("@")[0] : "User");

  // Penentuan username: prioritas ke `username`, lalu `displayName` yang dibersihkan, baru ke `email`
  const rawUsername =
    activeUser?.username ||
    (activeUser?.displayName
      ? activeUser.displayName.toLowerCase().replace(/\s+/g, "")
      : activeUser?.email
      ? activeUser.email.split("@")[0]
      : "user");

  const formattedUsername = rawUsername.replace(/^@/, "");

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

            <div className="overflow-hidden pl-1 space-y-1">
              <h4 className="font-heading font-semibold text-base text-brand-dark truncate leading-tight">
                {displayName}
              </h4>

              {/* TAMPILKAN USERNAME TAG DENGAN ICON AtSign */}
              <div className="inline-flex items-center gap-1 text-xs font-body font-medium text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-md">
                <AtSign className="w-3 h-3 shrink-0" />
                <span className="truncate">{formattedUsername}</span>
              </div>

              <p className="text-xs font-body text-brand-dark/50 truncate">
                {activeUser?.email || "No Email"}
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