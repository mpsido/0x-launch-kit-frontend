import { RELAYER_URL } from '../common/constants';
import { getLogger } from '../util/logger';

export class UserToken {
    public userId: number = 0;
    public token: string = '';
}

export class AuthOpts {
    public authorization: string = '';
    public userId: number = 0;
}

const logger = getLogger('Services::UserAuth');

export class UserAuthService {
    private _userToken: UserToken = new UserToken();

    public getAuthOpts(): AuthOpts {
        const requestOpts = {
            authorization: `Bearer ${this._userToken.token}`,
            userId: this._userToken.userId,
        };
        return requestOpts;
    }

    public async getToken(name: string, email: string, password: string): Promise<void> {
        const userToken = await this.sendLoginData(name, email, password);
        this._userToken = userToken;
        logger.debug('Caught token', this._userToken);
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
}

let userAuth: UserAuthService;
export const getUserAuth = (): UserAuthService => {
    if (!userAuth) {
        userAuth = new UserAuthService();
    }
    return userAuth;
};
