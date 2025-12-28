export type LoginFormInputs = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export type SmallUser = {
    id: number;
    fullName: string;
    email: string;
    currency: string;
    creaetedAt: string;
    updatedAt: string;
};

export type storeType = {
    user: SmallUser | null;
    isAuthenticated: boolean;
    authInitialized: boolean;
};

export type actionType =
    | { type: 'LOGIN_SUCCESS'; payload: SmallUser }
    | { type: 'LOGOUT' }
    | { type: 'AUTH_INITIALIZED' };
