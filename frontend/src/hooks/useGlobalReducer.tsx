import {
    useContext,
    useReducer,
    createContext,
    ReactNode,
    Dispatch,
} from 'react';
import storeReducer, { initialStore } from '../store';
import { storeType, actionType } from '../types';

type StoreContextType = {
    store: storeType;
    dispatch: Dispatch<actionType>;
};

const StoreContext = createContext<StoreContextType>({} as StoreContextType);

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

export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext);
    return { dispatch, store };
}
