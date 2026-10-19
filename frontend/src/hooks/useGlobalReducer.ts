import { useContext } from 'react';
import { StoreContext } from './storeContext';

export default function useGlobalReducer() {
    const context = useContext(StoreContext);

    if (!context) {
        throw new Error('useGlobalReducer must be used within StoreProvider');
    }

    return context;
}
