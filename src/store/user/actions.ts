import { createAction } from 'typesafe-actions';
import { AuthOpts, getUserAuth, UserLoginError } from '../../services/userAuth';
import { ThunkCreator } from '../../util/types';

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
            console.log('Login failed', e);
            dispatch(loginErrorAction(e));
            return null;
        }
    };
};

export const signup: ThunkCreator = (name: string, email: string, password: string) => {
    return async (dispatch, getState) => {
        getUserAuth()
            .signup(name, email, password)
            .then(() => {
                dispatch({ type: userActions.signup });
            })
            .catch(e => {
                console.log('Signup failed', e);
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

export const logout = () => {
    getUserAuth().logout();
    return { type: userActions.logout, ...getUserAuth().getAuthOpts() };
};
