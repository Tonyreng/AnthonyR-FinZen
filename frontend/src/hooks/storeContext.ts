import { createContext } from 'react';
import type { Dispatch } from 'react';
import type { actionType, storeType } from '../types';

export type StoreContextValue = {
    store: storeType;
    dispatch: Dispatch<actionType>;
};

export const StoreContext = createContext<StoreContextValue | null>(null);
