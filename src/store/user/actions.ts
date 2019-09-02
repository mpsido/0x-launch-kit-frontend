import { createAction } from 'typesafe-actions';

import { AuthOpts, getUserAuth, UserAuthService, UserLoginError } from '../../services/userAuth';
import { getLogger } from '../../util/logger';
import { ThunkCreator } from '../../util/types';

const logger = getLogger('Services::UserAuth');

export const userActions = {
    login: 'user/LOGIN',
    loginError: 'user/LOGIN_ERROR',
    logout: 'user/LOGOUT',
    signup: 'user/SIGNUP',
};

export const login: ThunkCreator = (email: string, password: string) => {
    return async (dispatch, getState) => {
        try {
            const credentials = await getUserAuth().getToken(email, password);
            dispatch(setLoginCredentials(credentials));
        } catch (e) {
            logger.debug('Login failed', e);
            dispatch(loginErrorAction(e));
            return null;
        }
    };
};

export const signup: ThunkCreator = (name: string, email: string, password: string) => {
    return async (dispatch, getState) => {
        UserAuthService.signup(name, email, password)
            .then(() => {
                dispatch({ type: userActions.signup });
            })
            .catch(e => {
                logger.debug('Signup failed', e);
                dispatch(loginErrorAction(e));
            });
    };
};

export const loginErrorAction = createAction(userActions.loginError, resolve => {
    return (loginError: UserLoginError) => resolve(loginError);
});

export const setLoginCredentials = createAction(userActions.login, resolve => {
    return (credentials: AuthOpts) => resolve(credentials);
});

export const logout: ThunkCreator = () => {
    getUserAuth().logout();
    return { type: userActions.logout, ...getUserAuth().getAuthOpts() };
};
