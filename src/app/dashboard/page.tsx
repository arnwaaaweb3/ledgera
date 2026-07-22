// src/app/dashboard/page.tsx
import Header from "@/src/components/Header";

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="container mx-auto px-6 py-8">
                {/* Konten dashboard di sini */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-surface rounded-xl p-8 border border-gray-100">
                        <p className="text-brand-dark/40 text-center">
                            Dashboard content coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}