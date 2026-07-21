"use client";

interface WalletOptionProps {
  name: string;
  icon: React.ReactNode;
  isInstalled: boolean;
  onClick: () => void;
  loading?: boolean;
  installUrl?: string;
  description?: string; // Optional description text
}

export default function WalletOption({
  name,
  icon,
  isInstalled,
  onClick,
  loading = false,
  installUrl,
  description,
}: WalletOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isInstalled || loading}
      className="w-full flex items-center gap-4 p-4 rounded-xl
                 border-2 border-gray-200 hover:border-brand-pink
                 transition-all duration-200 hover:shadow-md
                 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50">
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p className="font-semibold text-brand-dark">{name}</p>
        <div className="flex items-center gap-2">
          {description ? (
            <p className="text-xs text-gray-500">{description}</p>
          ) : (
            <p className="text-xs text-gray-500">
              {isInstalled ? "Ready to connect" : "Not installed"}
            </p>
          )}
          {!isInstalled && installUrl && (
            <a
              href={installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-pink hover:text-brand-pink/80 underline
                         cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              Install Here →
            </a>
          )}
        </div>
      </div>

      {/* Loading / Status */}
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-brand-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}