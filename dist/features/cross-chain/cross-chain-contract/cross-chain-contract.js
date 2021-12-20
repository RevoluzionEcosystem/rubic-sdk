"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainContract = void 0;
var injector_1 = require("../../../core/sdk/injector");
var cache_decorator_1 = require("../../../common/decorators/cache.decorator");
var token_1 = require("../../../core/blockchain/tokens/token");
var price_token_amount_1 = require("../../../core/blockchain/tokens/price-token-amount");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var blockchains_info_1 = require("../../../core/blockchain/blockchains-info");
var crossChainContractAbi_1 = require("../constants/crossChainContractAbi");
var CrossChainContract = /** @class */ (function () {
    function CrossChainContract(blockchain, address, uniswapV2Provider) {
        this.blockchain = blockchain;
        this.address = address;
        this.uniswapV2Provider = uniswapV2Provider;
        this.web3Public = injector_1.Injector.web3PublicService.getWeb3Public(blockchain);
    }
    CrossChainContract.prototype.getNumOfContract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var numOfContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'numOfThisBlockchain')];
                    case 1:
                        numOfContract = _a.sent();
                        return [2 /*return*/, parseInt(numOfContract)];
                }
            });
        });
    };
    CrossChainContract.prototype.getTransitToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var numOfContract, transitTokenAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNumOfContract()];
                    case 1:
                        numOfContract = _a.sent();
                        return [4 /*yield*/, this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'RubicAddresses', {
                                methodArguments: [numOfContract]
                            })];
                    case 2:
                        transitTokenAddress = _a.sent();
                        return [2 /*return*/, token_1.Token.createToken({
                                address: transitTokenAddress,
                                blockchain: this.blockchain
                            })];
                }
            });
        });
    };
    CrossChainContract.prototype.getFeeInPercents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var numOfContract, feeAbsolute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNumOfContract()];
                    case 1:
                        numOfContract = _a.sent();
                        return [4 /*yield*/, this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'feeAmountOfBlockchain', {
                                methodArguments: [numOfContract]
                            })];
                    case 2:
                        feeAbsolute = _a.sent();
                        return [2 /*return*/, parseInt(feeAbsolute) / 10000];
                }
            });
        });
    };
    CrossChainContract.prototype.getCryptoFeeToken = function (toContract) {
        return __awaiter(this, void 0, void 0, function () {
            var numOfToContract, feeAmount, _a, nativeToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, toContract.getNumOfContract()];
                    case 1:
                        numOfToContract = _b.sent();
                        _a = bignumber_js_1.default.bind;
                        return [4 /*yield*/, this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'blockchainCryptoFee', {
                                methodArguments: [numOfToContract]
                            })];
                    case 2:
                        feeAmount = new (_a.apply(bignumber_js_1.default, [void 0, _b.sent()]))();
                        nativeToken = blockchains_info_1.BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin;
                        return [2 /*return*/, price_token_amount_1.PriceTokenAmount.createFromToken(__assign(__assign({}, nativeToken), { weiAmount: feeAmount }))];
                }
            });
        });
    };
    CrossChainContract.prototype.getMinOrMaxTransitTokenAmount = function (type) {
        return this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount');
    };
    CrossChainContract.prototype.isContractPaused = function () {
        return this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'paused');
    };
    CrossChainContract.prototype.getMaxGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = bignumber_js_1.default.bind;
                        return [4 /*yield*/, this.web3Public.callContractMethod(this.address, crossChainContractAbi_1.crossChainContractAbi, 'maxGasPrice')];
                    case 1: return [2 /*return*/, new (_a.apply(bignumber_js_1.default, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    __decorate([
        cache_decorator_1.PCache
    ], CrossChainContract.prototype, "getNumOfContract", null);
    __decorate([
        cache_decorator_1.PCache
    ], CrossChainContract.prototype, "getTransitToken", null);
    return CrossChainContract;
}());
exports.CrossChainContract = CrossChainContract;
//# sourceMappingURL=cross-chain-contract.js.map