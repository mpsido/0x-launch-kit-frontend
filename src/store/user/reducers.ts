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
};

export function user(state: UserState = initialUserState, action: RootAction): UserState {
    switch (action.type) {
        case getType(actions.setLoginCredentials): {
            const newState = {
                ...state,
                ...action.payload,
            };
            console.log('Rendering User reducer', newState);
            return newState;
        }
        case actions.userActions.loginError: {
            console.log('Dispatched error');
            return state;
        }
        case actions.userActions.logout: {
            const newState = {
                ...state,
                token: '',
                userId: 0,
            };
            return newState;
        }
        default:
            return state;
    }
}
