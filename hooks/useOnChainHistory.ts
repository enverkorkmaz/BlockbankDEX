import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { SWAP_CONTRACT_ADDRESS } from '../utils/contracts';

export interface OnChainTransaction {
    hash: string;
    fromSymbol: string;
    toSymbol: string;
    fromAmount: string;
    toAmount: string;
    timestamp: number;
    status: 'success';
}

export function useOnChainHistory() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [transactions, setTransactions] = useState<OnChainTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!address || !publicClient) return;
        setIsLoading(true);
        try {
            // BBUSD -> BBETH Events
            // event SwappedBbusdToBbeth(address indexed user, uint256 bbusdIn, uint256 bbethOut);
            const logs1 = await publicClient.getLogs({
                address: SWAP_CONTRACT_ADDRESS,
                event: parseAbiItem('event SwappedBbusdToBbeth(address indexed user, uint256 bbusdIn, uint256 bbethOut)'),
                args: { user: address },
                fromBlock: 'earliest'
            });

            // BBETH -> BBUSD Events
            // event SwappedBbethToBbusd(address indexed user, uint256 bbethIn, uint256 bbusdOut);
            const logs2 = await publicClient.getLogs({
                address: SWAP_CONTRACT_ADDRESS,
                event: parseAbiItem('event SwappedBbethToBbusd(address indexed user, uint256 bbethIn, uint256 bbusdOut)'),
                args: { user: address },
                fromBlock: 'earliest'
            });

            // Process logs
            const txs1 = await Promise.all(logs1.map(async (log) => {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                return {
                    hash: log.transactionHash,
                    fromSymbol: 'BBUSD',
                    toSymbol: 'BBETH',
                    fromAmount: formatUnits(log.args.bbusdIn!, 6),
                    toAmount: formatUnits(log.args.bbethOut!, 18),
                    timestamp: Number(block.timestamp) * 1000,
                    status: 'success' as const
                };
            }));

            const txs2 = await Promise.all(logs2.map(async (log) => {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                return {
                    hash: log.transactionHash,
                    fromSymbol: 'BBETH',
                    toSymbol: 'BBUSD',
                    fromAmount: formatUnits(log.args.bbethIn!, 18),
                    toAmount: formatUnits(log.args.bbusdOut!, 6),
                    timestamp: Number(block.timestamp) * 1000,
                    status: 'success' as const
                };
            }));

            // Merge and sort
            const allTxs = [...txs1, ...txs2].sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(allTxs);

        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsLoading(false);
        }
    }, [address, publicClient]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { transactions, isLoading, refetch: fetchHistory };
}
