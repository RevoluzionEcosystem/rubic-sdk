import { Route } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import {
    SwapRequestError,
    LifiPairIsUnavailableError,
    RubicSdkError,
    UnsupportedReceiverAddressError
} from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

interface LifiTransactionRequest {
    to: string;
    data: string;
    gasLimit?: string;
    gasPrice?: string;
}

export class LifiTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        route: Route
    ): Promise<{
        gasLimit: BigNumber;
        gasPrice: BigNumber;
    } | null> {
        try {
            const transactionData = await new LifiTrade(
                {
                    from,
                    to,
                    gasFeeInfo: null,
                    slippageTolerance: NaN,
                    type: ON_CHAIN_TRADE_TYPE.ONE_INCH,
                    path: [],
                    route,
                    toTokenWeiAmountMin: new BigNumber(NaN)
                },
                false,
                EvmWeb3Pure.EMPTY_ADDRESS
            ).getTransactionData();

            if (!transactionData.gasLimit || !transactionData.gasPrice) {
                return null;
            }

            return {
                gasLimit: new BigNumber(transactionData.gasLimit),
                gasPrice: new BigNumber(transactionData.gasPrice)
            };
        } catch (_err) {
            return null;
        }
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly slippageTolerance: number;

    public readonly providerGateway: string;

    public readonly type: OnChainTradeType;

    public readonly path: ReadonlyArray<Token>;

    private readonly route: Route;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(
        tradeStruct: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasFeeInfo: GasFeeInfo | null;
            slippageTolerance: number;
            type: OnChainTradeType;
            path: ReadonlyArray<Token>;
            route: Route;
            toTokenWeiAmountMin: BigNumber;
        },
        useProxy: boolean,
        providerAddress: string
    ) {
        super(useProxy, providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.type = tradeStruct.type;
        this.path = tradeStruct.path;
        this.route = tradeStruct.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        if (options?.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }
        this.checkFromAddress(options.fromAddress, true);

        try {
            const transactionData = await this.getTransactionData(options.fromAddress);
            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gasLimit,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: this.from.isNative ? this.from.stringWeiAmount : '0',
                gas,
                gasPrice
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            if (err instanceof RubicSdkError) {
                throw err;
            }
            throw new LifiPairIsUnavailableError();
        }
    }

    private async getTransactionData(fromAddress?: string): Promise<LifiTransactionRequest> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: fromAddress || this.walletAddress,
                toAddress: fromAddress || this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing swap.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'SWAP'
                    }
                ]
            }
        };

        const swapResponse: {
            transactionRequest: LifiTransactionRequest;
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        const { transactionRequest } = swapResponse;
        const gasLimit =
            transactionRequest.gasLimit && parseInt(transactionRequest.gasLimit, 16).toString();
        const gasPrice =
            transactionRequest.gasPrice && parseInt(transactionRequest.gasPrice, 16).toString();

        return {
            to: transactionRequest.to,
            data: transactionRequest.data,
            gasLimit,
            gasPrice
        };
    }
}
