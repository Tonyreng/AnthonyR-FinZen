import { useReducer } from 'react';
import type { ReactNode } from 'react';
import storeReducer, { initialStore } from '../store';
import { StoreContext } from './storeContext';

type Props = {
    children: ReactNode;
};

export function StoreProvider({ children }: Props) {
    const [store, dispatch] = useReducer(storeReducer, initialStore());

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}
