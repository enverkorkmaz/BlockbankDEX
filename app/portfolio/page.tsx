'use client';

import Navbar from '../../components/Navbar';
import ThreeBackground from '../../components/ThreeBackground';
import PortfolioCard from '../../components/PortfolioCard';

export default function PortfolioPage() {
    return (
        <main className="min-h-screen text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-4 relative z-0 animate-in fade-in duration-500">
            <ThreeBackground />
            <Navbar />
            <div className="pt-24 w-full flex justify-center">
                <PortfolioCard />
            </div>
        </main>
    );
}
