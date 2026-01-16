'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export const CustomConnectButton = () => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} type="button" className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black font-semibold rounded-xl px-4 py-2 hover:opacity-80 transition-opacity text-sm">
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} type="button" className="bg-red-500 text-white font-semibold rounded-xl px-4 py-2 hover:bg-red-600 transition text-sm">
                                        Wrong Network
                                    </button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-sm flex items-center gap-2"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 18, height: 18 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </button>

                                    <button onClick={openAccountModal} type="button" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700/50">
                                        {account.displayName}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
