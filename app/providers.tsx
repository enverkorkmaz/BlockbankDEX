'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
    getDefaultWallets,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
    sepolia,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { ThemeProvider } from 'next-themes';

const { wallets } = getDefaultWallets({
    appName: 'BlockBankDex',
    projectId: 'YOUR_PROJECT_ID',
});

const config = getDefaultConfig({
    appName: 'BlockBankDex',
    projectId: 'YOUR_PROJECT_ID',
    wallets: [
        ...wallets,
        {
            groupName: 'Popular',
            wallets: [metaMaskWallet, argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [
        sepolia,
    ],
    transports: {
        [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/3MJBP8kZnzeoi1zg-NiBsE9QtKMjj0km'),
    },
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider initialChain={sepolia}>
                    <ThemeProvider attribute="class" defaultTheme="blockbank" enableSystem={false} themes={['light', 'dark']}>
                        {children}
                    </ThemeProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
