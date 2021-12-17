"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoterContractAbi = exports.quoterContractAddress = void 0;
exports.quoterContractAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
exports.quoterContractAbi = [
    {
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' }
        ],
        name: 'quoteExactInput',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenIn', type: 'address' },
            { internalType: 'address', name: 'tokenOut', type: 'address' },
            { internalType: 'uint24', name: 'fee', type: 'uint24' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'quoteExactInputSingle',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
//# sourceMappingURL=quoter-contract-data.js.map