import { getType } from 'typesafe-actions';

import { UserState } from '../../util/types';
import * as actions from '../actions';
import { RootAction } from '../reducers';

const initialUserState: UserState = {
    token: '',
    email: '',
    userId: 0,
    password: '',
    name: '',
    loginError: '',
    signupSuccess: false,
};

export function user(state: UserState = initialUserState, action: RootAction): UserState {
    switch (action.type) {
        case getType(actions.setLoginCredentials): {
            const newState = {
                ...state,
                ...action.payload,
            };
            return newState;
        }
        case actions.userActions.loginError: {
            const newState = {
                ...state,
                loginError: action.payload.message,
            };
            return newState;
        }
        case actions.userActions.logout: {
            const newState = {
                ...state,
                token: '',
                userId: 0,
            };
            return newState;
        }
        case actions.userActions.signup: {
            return {
                ...state,
                signupSuccess: true,
            };
        }
        default:
            return state;
    }
}
