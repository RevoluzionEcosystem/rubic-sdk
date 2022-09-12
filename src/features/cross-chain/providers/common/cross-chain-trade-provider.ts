import { AbiItem } from 'web3-utils';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { parseError } from 'src/common/utils/errors';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CrossChainIsUnavailableError, RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';

export abstract class CrossChainTradeProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    protected get walletAddress(): string {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
    }

    /**
     * Gets fee information.
     * @param _fromBlockchain Source network blockchain.
     * @param _providerAddress Integrator address.
     * @param _percentFeeToken Protocol fee token.
     * @protected
     * @internal
     */
    protected async getFeeInfo(
        _fromBlockchain: Partial<BlockchainName>,
        _providerAddress: string,
        _percentFeeToken: PriceToken
    ): Promise<FeeInfo> {
        return {
            fixedFee: null,
            platformFee: null,
            cryptoFee: null
        };
    }

    /**
     * Gets fixed fee information.
     * @param fromBlockchain Source network blockchain.
     * @param providerAddress Integrator address.
     * @param contractAddress Contract address.
     * @param contractAbi Contract ABI.
     * @protected
     * @internal
     */
    protected async getFixedFee(
        fromBlockchain: EvmBlockchainName,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<BigNumber> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (!EvmWeb3Pure.isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3PublicService.callContractMethod<
                [boolean, number, number, number, number]
            >(contractAddress, contractAbi, 'integratorToFeeInfo', {
                methodArguments: [providerAddress]
            });
            if (integratorInfo[0]) {
                return Web3Pure.fromWei(integratorInfo[4]);
            }
        }

        return Web3Pure.fromWei(
            await web3PublicService.callContractMethod<number>(
                contractAddress,
                contractAbi,
                'fixedCryptoFee'
            )
        );
    }

    /**
     * Gets percent fee.
     * @param fromBlockchain Source network blockchain.
     * @param providerAddress Integrator address.
     * @param contractAddress Contract address.
     * @param contractAbi Contract ABI.
     * @protected
     * @internal
     */
    protected async getFeePercent(
        fromBlockchain: EvmBlockchainName,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (!EvmWeb3Pure.isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3PublicService.callContractMethod<[boolean, number]>(
                contractAddress,
                contractAbi,
                'integratorToFeeInfo',
                {
                    methodArguments: [providerAddress]
                }
            );
            if (integratorInfo[0]) {
                return integratorInfo[1] / 10_000;
            }
        }

        return (
            (await web3PublicService.callContractMethod<number>(
                contractAddress,
                contractAbi,
                'RubicPlatformFee'
            )) / 10_000
        );
    }

    protected async checkContractState(
        fromBlockchain: EvmBlockchainName,
        rubicRouter: string
    ): Promise<void> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            rubicRouter,
            commonCrossChainAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    public abstract isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean;

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null>;
}
