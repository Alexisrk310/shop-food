'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isAuthPage || isDashboard) {
        return <>{children}</>;
    }

    return (
        <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <WhatsAppButton />
            <Footer />
        </div>
    );
}
