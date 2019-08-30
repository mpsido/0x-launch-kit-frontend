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

export class UserLoginError {
    public status: number;
    public message: string;

    constructor(status: number, responseObject: string) {
        this.status = status;
        let responseText = '';
        try {
            responseText = JSON.parse(responseObject)['message'];
        } finally {
            this.message = responseText;
        }
    }
}

const logger = getLogger('Services::UserAuth');

export class UserAuthService {
    private _userToken: UserToken = new UserToken();
    public static async sendLoginData(email: string, password: string): Promise<UserToken | UserLoginError> {
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
                    reject(new UserLoginError(xhr.status, xhr.responseText));
                }
            };
            xhr.send(
                JSON.stringify({
                    email,
                    password,
                }),
            );
        });
    }

    public static async sendSignupData(name: string, email: string, password: string): Promise<void | UserLoginError> {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${RELAYER_URL}signup`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {
                if (xhr.status === 200) {
                    logger.debug('Received login answer:', xhr.response);
                    const jsonResponse = JSON.parse(xhr.response);
                    logger.debug(jsonResponse);
                    resolve();
                } else {
                    reject(new UserLoginError(xhr.status, xhr.responseText));
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

    public getAuthOpts(): AuthOpts | any {
        if (this.hasCredentials() === false) {
            return {};
        }
        const requestOpts = {
            authorization: `Bearer ${this._userToken.token}`,
            userId: this._userToken.userId,
        };
        return requestOpts;
    }

    public async getToken(email: string, password: string): Promise<AuthOpts> {
        const userToken = await UserAuthService.sendLoginData(email, password);
        this._userToken = userToken as UserToken;
        logger.debug('Caught token', this._userToken);
        return this.getAuthOpts();
    }

    public async signup(name: string, email: string, password: string): Promise<void> {
        await UserAuthService.sendSignupData(name, email, password);
        logger.debug('Signup complete');
    }

    public hasCredentials(): boolean {
        return this._userToken.userId !== 0;
    }

    public logout(): void {
        this._userToken = new UserToken();
    }
}

let userAuth: UserAuthService;
export const getUserAuth = (): UserAuthService => {
    if (!userAuth) {
        userAuth = new UserAuthService();
    }
    return userAuth;
};
