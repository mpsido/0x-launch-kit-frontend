import { createAction } from 'typesafe-actions';

import { AuthOpts, getUserAuth } from '../../services/userAuth';
import { ThunkCreator } from '../../util/types';

export const login: ThunkCreator = (name: string, email: string, password: string) => {
    return async (dispatch, getState) => {
        const state = getState();
        const credentials = await getUserAuth().getToken(state.user.name, email, password);
        dispatch(setLoginCredentials(credentials));
    };
};

export const setLoginCredentials = createAction('user/LOGIN', resolve => {
    return (credentials: AuthOpts) => resolve(credentials);
});

export const logout = () => {
    getUserAuth().logout();
    return { type: 'user/LOGOUT', ...getUserAuth().getAuthOpts() };
};

export const userActions = {
    login,
    logout,
};
