import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PangolinTrade } from './pangolin-trade';
export declare class PangolinProvider extends UniswapV2AbstractProvider<PangolinTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;
    readonly InstantTradeClass: typeof PangolinTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}