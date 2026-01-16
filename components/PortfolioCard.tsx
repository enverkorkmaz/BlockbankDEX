'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract, useBalance, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { SWAP_CONTRACT_ADDRESS, BBETH_ADDRESS, BBUSD_ADDRESS, ERC20_ABI, SWAP_ABI } from '../utils/contracts';
import clsx from 'clsx';

export default function PortfolioCard() {
    const { address, isConnected } = useAccount();

    // Fetch Balances
    const { data: bbusdBalance } = useReadContract({
        address: BBUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address },
    }) as { data: bigint | undefined };

    const { data: bbethBalance } = useReadContract({
        address: BBETH_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address },
    }) as { data: bigint | undefined };

    // Fetch ETH Price for Valuation
    const { data: ethPriceData } = useReadContract({
        address: SWAP_CONTRACT_ADDRESS,
        abi: SWAP_ABI,
        functionName: 'getEthUsdPrice',
    }) as { data: [bigint, number] | undefined };

    // Fetch Native ETH Balance (Sepolia)
    const { data: nativeBalance } = useBalance({
        address: address,
        query: { enabled: !!address },
    });

    const [ethPrice, ethPriceDecimals] = ethPriceData || [BigInt(0), 0];

    // Compact Number Formatter
    const formatCompactNumber = (number: number) => {
        if (number === 0) return '0';

        // Handle extremely large numbers
        if (number >= 1e12) {
            // If it's absurdly large (e.g. testing limit), use scientific
            if (number > 1e15) {
                return number.toExponential(2);
            }
            return (number / 1e12).toFixed(2) + 'T';
        }

        return new Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 2
        }).format(number);
    };

    // Write Contract for Faucet
    const { writeContract, isPending } = useWriteContract();

    const handleFaucet = (tokenAddress: string) => {
        writeContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'faucet',
            args: [],
        });
    };

    const addTokenToWallet = async (address: string, symbol: string, decimals: number) => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: {
                            address: address,
                            symbol: symbol,
                            decimals: decimals,
                            // image: 'OPTIONAL_IMAGE_URL', 
                        },
                    },
                });
            } catch (error) {
                console.error('Failed to add token', error);
            }
        }
    };

    // Process Data
    const data = useMemo(() => {
        if (!isConnected || !bbusdBalance || !bbethBalance) return [];

        const bbusd = parseFloat(formatUnits(bbusdBalance, 6)); // BBUSD is 6 decimals
        const bbeth = parseFloat(formatUnits(bbethBalance, 18));
        const eth = nativeBalance ? parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)) : 0;

        // Calculate USD Values
        // BBUSD = $1 (stable)
        const bbusdValue = bbusd * 1;

        // ETH Price (used for both BBETH and Native ETH)
        const ethPriceNum = ethPrice ? parseFloat(formatUnits(ethPrice, ethPriceDecimals)) : 0;

        const bbethValue = bbeth * ethPriceNum;
        const ethValue = eth * ethPriceNum;

        const items = [
            { name: 'Sepolia ETH', value: ethValue, amount: eth, color: '#627eea' }, // Ethereum Brand Color
            { name: 'BBETH', value: bbethValue, amount: bbeth, color: '#3b82f6' }, // Blue-500
            { name: 'BBUSD', value: bbusdValue, amount: bbusd, color: '#22c55e' }, // Green-500
        ];

        // Filter out zero items to keep chart clean
        return items.filter(item => item.amount > 0);
    }, [isConnected, bbusdBalance, bbethBalance, nativeBalance, ethPrice, ethPriceDecimals]);

    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    if (!isConnected) {
        return (
            <div className="w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative backdrop-blur-xl flex flex-col items-center justify-center text-center h-[420px]">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                    <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">My Portfolio</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Connect wallet to view your asset distribution.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative backdrop-blur-xl h-fit">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Portfolio</h3>
                </div>
                <div className="text-right">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Net Worth</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white flex items-center justify-end">
                        <DollarSign className="w-4 h-4 text-zinc-400" />
                        {formatCompactNumber(totalValue)}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => [`$${formatCompactNumber(value || 0)}`, 'Value']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-zinc-400 text-xs font-medium">Assets</span>
                    <span className="text-zinc-900 dark:text-white text-xl font-bold">{data.length}</span>
                </div>
            </div>

            {/* Legend / List */}
            <div className="mt-6 space-y-3">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-zinc-900 dark:text-white">{item.name}</div>
                                {['BBETH', 'BBUSD'].includes(item.name) && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                if (item.name === 'BBUSD') handleFaucet(BBUSD_ADDRESS);
                                                else handleFaucet(BBETH_ADDRESS);
                                            }}
                                            disabled={isPending}
                                            className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all text-[10px] uppercase font-bold tracking-wide hover:scale-105 active:scale-95 cursor-pointer"
                                            title="Get Free Test Tokens"
                                        >
                                            Faucet
                                        </button>
                                        <button
                                            onClick={() => addTokenToWallet(
                                                item.name === 'BBUSD' ? BBUSD_ADDRESS : BBETH_ADDRESS,
                                                item.name,
                                                item.name === 'BBUSD' ? 6 : 18
                                            )}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all text-[10px] uppercase font-bold tracking-wide hover:scale-105 active:scale-95 cursor-pointer"
                                            title="Add to Wallet"
                                        >
                                            <Wallet className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{formatCompactNumber(item.amount)} Tokens</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-zinc-900 dark:text-white">${formatCompactNumber(item.value)}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {(() => {
                                    if (totalValue === 0) return '0%';
                                    const pct = (item.value / totalValue) * 100;
                                    if (pct < 0.1 && pct > 0) return '<0.1%';
                                    return pct.toFixed(1) + '%';
                                })()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
