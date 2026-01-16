export const SWAP_CONTRACT_ADDRESS = '0x1113997E5491012dF8BD1402C8e67465905cB3C7';
export const BBETH_ADDRESS = '0xaDcCCF2eA5bF1069FC14c01505c928d357b171ee';
export const BBUSD_ADDRESS = '0x7297075a92D2b3144119889ef4f991726A3afFE4';

export const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
    {
        constant: false,
        inputs: [],
        name: 'faucet',
        outputs: [],
        type: 'function',
    }
] as const;

export const SWAP_ABI = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "user", type: "address" },
            { indexed: false, internalType: "uint256", name: "bbusdIn", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "bbethOut", type: "uint256" }
        ],
        name: "SwappedBbusdToBbeth",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "user", type: "address" },
            { indexed: false, internalType: "uint256", name: "bbethIn", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "bbusdOut", type: "uint256" }
        ],
        name: "SwappedBbethToBbusd",
        type: "event"
    },
    {
        inputs: [
            { internalType: "uint256", name: "bbusdAmount", type: "uint256" },
            { internalType: "uint256", name: "minBbethOut", type: "uint256" }
        ],
        name: "swapBbusdToBbeth",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "bbethAmount", type: "uint256" },
            { internalType: "uint256", name: "minBbusdOut", type: "uint256" }
        ],
        name: "swapBbethToBbusd",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "bbusdAmount", type: "uint256" }
        ],
        name: "getEstimatedBbethForBbusd",
        outputs: [
            { internalType: "uint256", name: "", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "bbethAmount", type: "uint256" }
        ],
        name: "getEstimatedBbusdForBbeth",
        outputs: [
            { internalType: "uint256", name: "", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getEthUsdPrice",
        outputs: [
            { internalType: "uint256", name: "price", type: "uint256" },
            { internalType: "uint8", name: "decimals", type: "uint8" }
        ],
        stateMutability: "view",
        type: "function"
    }
] as const;
