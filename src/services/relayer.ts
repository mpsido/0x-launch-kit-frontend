import { assetDataUtils, AssetProxyId, BigNumber } from '0x.js';
import { HttpClient, OrderConfigRequest, OrderConfigResponse, SignedOrder } from '@0x/connect';
import { RateLimit } from 'async-sema';

import { RELAYER_URL } from '../common/constants';
import { tokenAmountInUnitsToBigNumber } from '../util/tokens';
import { Token } from '../util/types';
import { getLogger } from '../util/logger';

export class UserToken {
    public userId: number = 0;
    public token: string = '';
}

export class AuthOpts {
    public authorization: string = '';
    public userId: number = 0;
}

const logger = getLogger('Services::Relayer');

export class Relayer {
    private readonly _client: HttpClient;
    private readonly _rateLimit: () => Promise<void>;
    private _userToken: UserToken = new UserToken();

    constructor(client: HttpClient, options: { rps: number }) {
        this._client = client;
        this._rateLimit = RateLimit(options.rps); // requests per second
    }

    public getAuthOpts(): AuthOpts {
        const requestOpts = {
            authorization: `Bearer ${this._userToken.token}`,
            userId: this._userToken.userId,
        };
        return requestOpts;
    }

    public async sendLoginData(name: string, email: string, password: string): Promise<UserToken> {
        return new Promise<UserToken>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${RELAYER_URL}login`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const userToken = new UserToken();
                    logger.debug('Received login answer:', xhr.response);
                    const jsonResponse = JSON.parse(xhr.response);
                    userToken.userId = (jsonResponse as any).userId;
                    userToken.token = (jsonResponse as any).token;
                    logger.debug(jsonResponse);
                    resolve(userToken);
                } else {
                    reject(xhr.status);
                }
            };
            xhr.send(
                JSON.stringify({
                    name,
                    email,
                    password,
                }),
            );
        });
    }

    public async getAllOrdersAsync(baseTokenAssetData: string, quoteTokenAssetData: string): Promise<SignedOrder[]> {
        try {
            const [sellOrders, buyOrders] = await Promise.all([
                this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData),
                this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData),
            ]);

            return [...sellOrders, ...buyOrders];
        } catch (error) {
            logger.debug(error.constructor.name, (error as Error).message);
            if ((error as Error).message.search('401') !== -1) {
                const userToken = await this.sendLoginData(
                    '',
                    'test@test.com',
                    '$2b$10$4jpAS/RVa0drq2AdMaSJy.G0d0gNCPmYHz3xA/ZOe2z40mRFZZYda',
                );
                this._userToken = userToken;
                logger.debug('Caught token', this._userToken);
            }
            return [];
        }
    }

    public async getOrderConfigAsync(orderConfig: OrderConfigRequest): Promise<OrderConfigResponse> {
        await this._rateLimit();
        const requestOpts = this.getAuthOpts();
        return this._client.getOrderConfigAsync({ ...orderConfig, ...requestOpts });
    }

    public async getUserOrdersAsync(
        account: string,
        baseTokenAssetData: string,
        quoteTokenAssetData: string,
    ): Promise<SignedOrder[]> {
        try {
            const [sellOrders, buyOrders] = await Promise.all([
                this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData, account),
                this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData, account),
            ]);

            return [...sellOrders, ...buyOrders];
        } catch (error) {
            logger.debug(error.constructor.name, (error as Error).message);
            if ((error as Error).message.search('401') !== -1) {
                const userToken = await this.sendLoginData(
                    '',
                    'test@test.com',
                    '$2b$10$4jpAS/RVa0drq2AdMaSJy.G0d0gNCPmYHz3xA/ZOe2z40mRFZZYda',
                );
                this._userToken = userToken;
                logger.debug('Caught token', userToken);
            }
            return [];
        }
    }

    public async getCurrencyPairPriceAsync(baseToken: Token, quoteToken: Token): Promise<BigNumber | null> {
        await this._rateLimit();
        const requestOpts = this.getAuthOpts();
        const { asks } = await this._client.getOrderbookAsync({
            baseAssetData: assetDataUtils.encodeERC20AssetData(baseToken.address),
            quoteAssetData: assetDataUtils.encodeERC20AssetData(quoteToken.address),
            ...requestOpts,
        });

        if (asks.records.length) {
            const lowestPriceAsk = asks.records[0];

            const { makerAssetAmount, takerAssetAmount } = lowestPriceAsk.order;
            const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(takerAssetAmount, quoteToken.decimals);
            const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(makerAssetAmount, baseToken.decimals);
            return takerAssetAmountInUnits.div(makerAssetAmountInUnits);
        }

        return null;
    }

    public async getSellCollectibleOrdersAsync(
        collectibleAddress: string,
        wethAddress: string,
    ): Promise<SignedOrder[]> {
        await this._rateLimit();
        const requestOpts = this.getAuthOpts();
        const result = await this._client.getOrdersAsync({
            makerAssetProxyId: AssetProxyId.ERC721,
            takerAssetProxyId: AssetProxyId.ERC20,
            makerAssetAddress: collectibleAddress,
            takerAssetAddress: wethAddress,
            ...requestOpts,
        });

        return result.records.map(record => record.order);
    }

    public async submitOrderAsync(order: SignedOrder): Promise<void> {
        await this._rateLimit();
        const requestOpts = this.getAuthOpts();
        return this._client.submitOrderAsync({ ...order, ...requestOpts });
    }

    private async _getOrdersAsync(
        makerAssetData: string,
        takerAssetData: string,
        makerAddress?: string,
    ): Promise<SignedOrder[]> {
        let recordsToReturn: SignedOrder[] = [];
        const requestOpts = {
            makerAssetData,
            takerAssetData,
            makerAddress,
            ...this.getAuthOpts(),
        };
        logger.debug('_getOrdersAsync userToken:', this._userToken);

        let hasMorePages = true;
        let page = 1;

        while (hasMorePages) {
            await this._rateLimit();
            const { total, records, perPage } = await this._client.getOrdersAsync({
                ...requestOpts,
                page,
            });

            const recordsMapped = records.map(apiOrder => {
                return apiOrder.order;
            });
            recordsToReturn = [...recordsToReturn, ...recordsMapped];

            page += 1;
            const lastPage = Math.ceil(total / perPage);
            hasMorePages = page <= lastPage;
        }
        return recordsToReturn;
    }
}

let relayer: Relayer;
export const getRelayer = (): Relayer => {
    if (!relayer) {
        const client = new HttpClient(RELAYER_URL);
        relayer = new Relayer(client, { rps: 5 });
    }

    return relayer;
};
