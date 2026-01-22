'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CustomConnectButton } from './ConnectButton';
import ThemeToggle from './ThemeToggle';
import clsx from 'clsx';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Swap', href: '/' },
        { name: 'Portfolio', href: '/portfolio' },
        { name: 'History', href: '/history' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full transition-colors">
            <div className="flex items-center gap-8">
                <div className="flex flex-col">
                    <span className="text-3xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-[#000000] to-[#3f3f46] dark:from-[#ffffff] dark:to-[#71717a] drop-shadow-sm pr-4 pb-1">
                        BLOCKBANKSWAP
                    </span>
                </div>

                {/* Desktop Nav Links */}
                <div className="flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "text-lg font-bold transition-all hover:scale-110 active:scale-90",
                                pathname === item.href
                                    ? "text-indigo-900 dark:text-white"
                                    : "text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <CustomConnectButton />
            </div>
        </nav>
    );
}
