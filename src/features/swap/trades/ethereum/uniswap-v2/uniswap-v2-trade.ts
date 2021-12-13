import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { UNISWAP_ETHEREUM_CONTRACT_ADDRESS } from '@features/swap/trades/ethereum/uniswap-v2/constants';

export class UniswapV2Trade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = UNISWAP_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}