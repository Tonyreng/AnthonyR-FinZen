import { storeType, actionType } from './types';

export const initialStore = (): storeType => {
    return {
        user: null,
        isAuthenticated: false,
        authInitialized: false,
    };
};

export default function storeReducer(
    store: storeType,
    action: actionType
): storeType {
    switch (action.type) {
        case 'AUTH_INITIALIZED':
            return {
                ...store,
                authInitialized: true,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...store,
                user: action.payload,
                isAuthenticated: true,
            };
        case 'LOGOUT':
            return {
                ...store,
                user: null,
                isAuthenticated: false,
            };
        default:
            return store;
    }
}
