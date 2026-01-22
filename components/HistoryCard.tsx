'use client';

import { useHistory } from '../hooks/useHistory';
import { ExternalLink, History, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryCard() {
    const { transactions, clearHistory } = useHistory();

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const truncateHash = (hash: string) => {
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    };

    return (
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative backdrop-blur-xl h-fit">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <History className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Transaction History</h3>
                </div>
                {transactions.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 active:scale-90 active:-rotate-12 cursor-pointer"
                        title="Clear History"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                        No transactions found.
                    </div>
                ) : (
                    transactions.map((tx, index) => (
                        <div key={`${tx.hash}-${index}`} className="group bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium text-zinc-400">
                                    {formatDate(tx.timestamp)}
                                </div>
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    {truncateHash(tx.hash)}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-zinc-900 dark:text-white text-lg">
                                        {tx.fromAmount} <span className="text-sm text-zinc-500">{tx.fromSymbol}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                                    <div className="font-bold text-zinc-900 dark:text-white text-lg">
                                        {tx.toAmount} <span className="text-sm text-zinc-500">{tx.toSymbol}</span>
                                    </div>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
