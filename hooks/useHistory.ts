import { useState, useEffect } from 'react';

export interface Transaction {
    hash: string;
    fromSymbol: string;
    toSymbol: string;
    fromAmount: string;
    toAmount: string;
    timestamp: number;
    status: 'success' | 'failed';
}

const STORAGE_KEY = 'blockbank_transactions';

export function useHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setTransactions(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    const addTransaction = (tx: Transaction) => {
        setTransactions(prev => {
            const newHistory = [tx, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setTransactions([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { transactions, addTransaction, clearHistory };
}
