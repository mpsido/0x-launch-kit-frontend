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
    submitted: false,
};

export function user(state: UserState = initialUserState, action: RootAction): UserState {
    switch (action.type) {
        case getType(actions.setLoginCredentials):
            console.log(action.payload);
            return { ...state, token: action.payload.authorization, userId: action.payload.userId };
        default:
            return state;
    }
}
