import { describe, expect, it } from 'vitest';
import storeReducer, { initialStore } from './store';

describe('storeReducer', () => {
    it('initializes authentication state without authenticating the user', () => {
        const state = storeReducer(initialStore(), { type: 'AUTH_INITIALIZED' });

        expect(state.authInitialized).toBe(true);
        expect(state.isAuthenticated).toBe(false);
    });

    it('stores and clears the authenticated user', () => {
        const user = {
            id: 1,
            full_name: 'FinZen User',
            email: 'user@example.test',
            currency: 'USD',
            created_at: '2026-01-01T00:00:00+00:00',
        };
        const loggedIn = storeReducer(initialStore(), {
            type: 'LOGIN_SUCCESS',
            payload: user,
        });

        expect(loggedIn.user).toEqual(user);
        expect(loggedIn.isAuthenticated).toBe(true);
        expect(storeReducer(loggedIn, { type: 'LOGOUT' })).toMatchObject({
            user: null,
            isAuthenticated: false,
        });
    });
});
