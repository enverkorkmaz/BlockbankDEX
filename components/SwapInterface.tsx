'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ArrowUpDown, Settings, Wallet, X, Check } from 'lucide-react';
import clsx from 'clsx';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { SWAP_CONTRACT_ADDRESS, BBETH_ADDRESS, BBUSD_ADDRESS, ERC20_ABI, SWAP_ABI } from '../utils/contracts';
import { useHistory } from '../hooks/useHistory';


export default function SwapInterface() {
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { addTransaction } = useHistory();

    // State
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');
    const [swapDirection, setSwapDirection] = useState<'BBUSD_TO_BBETH' | 'BBETH_TO_BBUSD'>('BBUSD_TO_BBETH');
    const [slippage, setSlippage] = useState(0.5);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showApproveSuccess, setShowApproveSuccess] = useState(false);
    const [showSwapSuccess, setShowSwapSuccess] = useState(false);

    const sellTokenAddress = swapDirection === 'BBUSD_TO_BBETH' ? BBUSD_ADDRESS : BBETH_ADDRESS;
    const buyTokenAddress = swapDirection === 'BBUSD_TO_BBETH' ? BBETH_ADDRESS : BBUSD_ADDRESS;
    const sellTokenSymbol = swapDirection === 'BBUSD_TO_BBETH' ? 'BBUSD' : 'BBETH';
    const buyTokenSymbol = swapDirection === 'BBUSD_TO_BBETH' ? 'BBETH' : 'BBUSD';

    // Decimals
    const sellTokenDecimals = swapDirection === 'BBUSD_TO_BBETH' ? 6 : 18;
    const buyTokenDecimals = swapDirection === 'BBUSD_TO_BBETH' ? 18 : 6;

    // Contract Reads
    const { data: sellBalance } = useReadContract({
        address: sellTokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address },
    }) as { data: bigint | undefined };

    const { data: buyBalance } = useReadContract({
        address: buyTokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address },
    }) as { data: bigint | undefined };

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: sellTokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, SWAP_CONTRACT_ADDRESS],
        query: { enabled: !!address },
    }) as { data: bigint | undefined, refetch: () => void };

    const { data: estimatedOut } = useReadContract({
        address: SWAP_CONTRACT_ADDRESS,
        abi: SWAP_ABI,
        functionName: swapDirection === 'BBUSD_TO_BBETH' ? 'getEstimatedBbethForBbusd' : 'getEstimatedBbusdForBbeth',
        args: [!isNaN(Number(sellAmount)) && Number(sellAmount) > 0 ? parseUnits(sellAmount, sellTokenDecimals) : BigInt(0)],
        query: { enabled: !!sellAmount && !isNaN(Number(sellAmount)) && Number(sellAmount) > 0 },
    }) as { data: bigint | undefined };

    const { data: ethPriceData } = useReadContract({
        address: SWAP_CONTRACT_ADDRESS,
        abi: SWAP_ABI,
        functionName: 'getEthUsdPrice',
        query: { refetchInterval: 60000 },
    }) as { data: [bigint, number] | undefined };

    const [ethPrice, ethPriceDecimals] = ethPriceData || [BigInt(0), 0];

    // Contract Writes
    const { writeContract: approve, isPending: isApproving, data: approveHash } = useWriteContract();
    const { writeContract: swap, isPending: isSwapping, data: swapHash } = useWriteContract();

    // Transaction Monitoring
    const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isSwapConfirming, isSuccess: isSwapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });

    // Effects
    useEffect(() => {
        if (estimatedOut) {
            const formatted = formatUnits(estimatedOut, buyTokenDecimals);
            // Truncate to 8 decimals for display to prevent overflow
            const [whole, fraction] = formatted.split('.');
            if (fraction && fraction.length > 8) {
                setBuyAmount(`${whole}.${fraction.substring(0, 8)}`);
            } else {
                setBuyAmount(formatted);
            }
        } else {
            setBuyAmount('');
        }
    }, [estimatedOut, buyTokenDecimals]);

    useEffect(() => {
        if (isSwapConfirmed && swapHash) {
            setShowSwapSuccess(true);

            // Add to History
            addTransaction({
                hash: swapHash,
                fromSymbol: sellTokenSymbol,
                toSymbol: buyTokenSymbol,
                fromAmount: sellAmount,
                toAmount: buyAmount,
                timestamp: Date.now(),
                status: 'success'
            });

            const timer = setTimeout(() => {
                // setSellAmount(''); // Removed per user request
                // setBuyAmount(''); // Removed per user request
                setShowSwapSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSwapConfirmed, swapHash]);

    useEffect(() => {
        if (isApproveConfirmed) {
            refetchAllowance(); // Immediately check for new allowance
            setShowApproveSuccess(true);
            const timer = setTimeout(() => {
                setShowApproveSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isApproveConfirmed, refetchAllowance]);

    // Format Balance Helper
    const formatBalance = (balance: bigint | undefined, decimals: number) => {
        if (!balance) return '0.00';
        const formatted = formatUnits(balance, decimals);
        // If it's a huge number (e.g. initial dev supply), format neatly
        if (formatted.includes('.')) {
            const [whole, fraction] = formatted.split('.');
            return `${whole.substring(0, 10)}${whole.length > 10 ? '...' : ''}.${fraction.substring(0, 4)}`;
        }
        return formatted.length > 10 ? `${formatted.substring(0, 10)}...` : formatted;
    };

    // Handlers
    const handleSwap = () => {
        if (!sellAmount || Number(sellAmount) <= 0 || !estimatedOut) return;
        const amountIn = parseUnits(sellAmount, sellTokenDecimals);

        // Calculate minAmountOut based on slippage
        // minAmountOut = estimatedOut * (1 - slippage / 100)
        const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 10000));
        const minAmountOut = (estimatedOut * slippageFactor) / BigInt(10000);

        if (swapDirection === 'BBUSD_TO_BBETH') {
            swap({
                address: SWAP_CONTRACT_ADDRESS,
                abi: SWAP_ABI,
                functionName: 'swapBbusdToBbeth',
                args: [amountIn, minAmountOut],
            });
        } else {
            swap({
                address: SWAP_CONTRACT_ADDRESS,
                abi: SWAP_ABI,
                functionName: 'swapBbethToBbusd',
                args: [amountIn, minAmountOut],
            });
        }
        setIsSettingsOpen(false);
    };

    const handleApprove = () => {
        if (!sellAmount || Number(sellAmount) <= 0) return;
        const amountIn = parseUnits(sellAmount, sellTokenDecimals);
        approve({
            address: sellTokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [SWAP_CONTRACT_ADDRESS, amountIn],
        });
    };

    const handleMax = () => {
        if (sellBalance) {
            setSellAmount(formatUnits(sellBalance, sellTokenDecimals));
        }
    };

    const switchTokens = () => {
        setSwapDirection(prev => prev === 'BBUSD_TO_BBETH' ? 'BBETH_TO_BBUSD' : 'BBUSD_TO_BBETH');
        // Swap values: New Sell Amount = Current Buy Amount
        // If buy amount exists, use it. Otherwise keep sell amount or clear? 
        // User asked to swap values.
        if (buyAmount && Number(buyAmount) > 0) {
            setSellAmount(buyAmount);
        } else if (sellAmount) {
            // If there is no buy amount yet (maybe loading), but there is sell amount,
            // we can't really "swap" accurately without the estimated output.
            // But usually keeping the sell amount is better than clearing if buy is 0.
            // Let's stick to the user's request "Values should swap places".
            // If buyAmount is 0/empty, setting sellAmount to it clears the input.
            // If the user meant "Keep the input value but change token", that's different.
            // "DEĞERLER DE YER DEĞİŞTİRMELİ" -> Values should swap places.
            // This implies A -> B becomes B -> A.
            setSellAmount(buyAmount);
        }
    };

    // Compact Number Formatter
    const formatCompactNumber = (number: number) => {
        if (number === 0) return '0';
        if (number >= 1e12) {
            if (number > 1e15) return number.toExponential(2);
            return (number / 1e12).toFixed(2) + 'T';
        }
        return new Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 2
        }).format(number);
    };

    // Calculate USD Value
    const getUsdValue = (amount: string, symbol: string) => {
        if (!amount || !ethPrice || ethPrice <= 0) return '0.00';
        const numAmount = Number(amount);

        // BBUSD is stable $1 (approx)
        if (symbol === 'BBUSD') {
            return numAmount > 100000 ? formatCompactNumber(numAmount) : numAmount.toLocaleString();
        }

        // BBETH Price = ETH Price
        const price = Number(formatUnits(ethPrice, ethPriceDecimals));
        const val = numAmount * price;
        return val > 100000 ? formatCompactNumber(val) : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    // Derived State
    const amountIn = !isNaN(Number(sellAmount)) && Number(sellAmount) > 0 ? parseUnits(sellAmount, sellTokenDecimals) : BigInt(0);
    const isApprovalNeeded = allowance !== undefined && allowance < amountIn;
    const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming;
    const isInsufficientBalance = sellBalance !== undefined && amountIn > sellBalance;

    return (
        <div className="min-h-screen text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-4 relative z-0 pt-24">

            {/* Content Container */}
            <div className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full max-w-6xl relative z-10">

                {/* Swap Card */}
                <div className="w-full max-w-[480px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 relative backdrop-blur-xl transition-colors duration-300 mx-auto xl:mx-0">

                    {/* Card Header */}
                    <div className="flex justify-between items-center p-4 pb-2">
                        <h2 className="text-zinc-900 dark:text-white font-medium">Swap</h2>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sell Input */}
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 transition-all hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700">
                        <div className="flex justify-between mb-2">
                            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">You pay</span>
                            <div className="bg-zinc-200 dark:bg-zinc-700/50 px-2 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                ERC20
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={sellAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (Number(value) >= 0) setSellAmount(value);
                                }}
                                onKeyDown={(e) => {
                                    if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
                                }}
                                placeholder="0"
                                className={clsx(
                                    "bg-transparent font-medium outline-none w-full placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-900 dark:text-white transition-all",
                                    sellAmount.length > 20 ? "text-xl" : sellAmount.length > 12 ? "text-2xl" : "text-4xl"
                                )}
                                disabled={isLoading}
                            />
                            <div className="bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 pl-2 pr-3 py-1 rounded-full flex items-center gap-2 shrink-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-600 transition">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${sellTokenSymbol === 'BBUSD' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {sellTokenSymbol[0]}
                                </div>
                                <span className="font-semibold text-lg">{sellTokenSymbol}</span>
                            </div>
                        </div>

                        <div className="flex justify-between mt-3 text-sm">
                            <div className="text-zinc-500 dark:text-zinc-400 font-medium">
                                ${getUsdValue(sellAmount, sellTokenSymbol)}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 flex flex-col items-end gap-1">
                                <span>Balance: {formatBalance(sellBalance, sellTokenDecimals)}</span>
                            </div>
                        </div>

                        {/* Percentage Buttons */}
                        <div className="flex justify-end gap-2 mt-2">
                            {[25, 50, 75, 100].map((pct) => (
                                <button
                                    key={pct}
                                    onClick={() => {
                                        if (!sellBalance) return;
                                        const amount = BigInt(sellBalance) * BigInt(pct) / BigInt(100);
                                        setSellAmount(formatUnits(amount, sellTokenDecimals));
                                    }}
                                    className="px-3 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700/50 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all border border-transparent hover:border-zinc-300 dark:hover:border-zinc-500 hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    {pct === 100 ? 'Max' : `${pct}%`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Switch Button */}
                    <div className="flex justify-center my-2 relative z-10">
                        <button
                            onClick={switchTokens}
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 rounded-xl shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all hover:scale-110 active:rotate-180 cursor-pointer"
                        >
                            <ArrowUpDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Buy Input */}
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mt-2 transition-all hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700">
                        <div className="flex justify-between mb-2">
                            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">You receive</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={buyAmount}
                                readOnly
                                placeholder="0"
                                className={clsx(
                                    "bg-transparent font-medium outline-none w-full placeholder-zinc-400 text-zinc-900 dark:text-white transition-all",
                                    buyAmount.length > 20 ? "text-xl" : buyAmount.length > 12 ? "text-2xl" : "text-4xl"
                                )}
                            />
                            <div className="bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 pl-2 pr-3 py-1 rounded-full flex items-center gap-2 shrink-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-600 transition">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${buyTokenSymbol === 'BBUSD' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {buyTokenSymbol[0]}
                                </div>
                                <span className="font-semibold text-lg">{buyTokenSymbol}</span>
                            </div>
                        </div>

                        <div className="flex justify-between mt-3 text-sm items-center">
                            <div className="text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[150px]" title={`$${getUsdValue(buyAmount, buyTokenSymbol)}`}>
                                ${getUsdValue(buyAmount, buyTokenSymbol)}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">
                                <span>Balance: {formatBalance(buyBalance, buyTokenDecimals)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Action Button */}
                    <div className="p-1 mt-2">
                        {!isConnected ? (
                            <button
                                onClick={openConnectModal}
                                type="button"
                                className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-900 hover:bg-indigo-950 text-white shadow-lg shadow-indigo-900/20 transition-all transform active:scale-[0.99]"
                            >
                                Connect Wallet
                            </button>
                        ) : (
                            <button
                                onClick={isApprovalNeeded ? handleApprove : handleSwap}
                                disabled={isLoading || !sellAmount || isInsufficientBalance}
                                className={clsx(
                                    "w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.99]",
                                    isInsufficientBalance
                                        ? "bg-red-500/10 text-red-500 border border-red-500/50 cursor-not-allowed"
                                        : isLoading || (isInsufficientBalance && !isApprovalNeeded)
                                            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
                                )}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></span>
                                        {isApproving || isApproveConfirming ? 'Approving...' : isSwapping || isSwapConfirming ? 'Swapping...' : 'Processing...'}
                                    </span>
                                ) : isInsufficientBalance ? (
                                    `Insufficient ${sellTokenSymbol} balance`
                                ) : isApprovalNeeded ? (
                                    `Approve ${sellTokenSymbol}`
                                ) : (
                                    'Swap'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Status Messages - Auto dismissing */}
                    {/* Toast Notifications */}
                </div>

                {/* Portfolio Card */}

            </div>

            <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
                {showApproveSuccess && (
                    <div className="bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-zinc-900 dark:text-white text-sm">Approval Successful</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Ready to swap.</div>
                        </div>
                    </div>
                )}
                {showSwapSuccess && (
                    <div className="bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-zinc-900 dark:text-white text-sm">Swap Successful</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Transaction completed.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {
                isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Settings</h3>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Slippage Tolerance</div>
                                <div className="flex gap-2">
                                    {[0.5, 1.0, 3.0].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setSlippage(val)}
                                            className={clsx(
                                                "flex-1 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                slippage === val
                                                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                                            )}
                                        >
                                            {val}%
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={slippage}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (val >= 0 && val <= 50) setSlippage(val);
                                        }}
                                        className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-right font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-500/20"
                                        placeholder="Custom"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">%</div>
                                </div>
                                {slippage > 5 && (
                                    <div className="text-red-500 text-xs font-medium">
                                        High slippage! Your transaction may be frontrun.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
