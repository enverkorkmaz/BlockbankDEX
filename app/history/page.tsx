'use client';

import Navbar from '../../components/Navbar';
import ThreeBackground from '../../components/ThreeBackground';
import HistoryCard from '../../components/HistoryCard';

export default function HistoryPage() {
    return (
        <main className="min-h-screen text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-start p-4 relative z-0 animate-in fade-in duration-500">
            <ThreeBackground />
            <Navbar />
            <div className="pt-24 w-full flex justify-center">
                <HistoryCard />
            </div>
        </main>
    );
}
