import { Navigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { FullScreenLoader } from './FullScreenLoader';
import type { JSX, ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export const PublicRoute = ({ children }: Props): JSX.Element => {
    const { store } = useGlobalReducer();
    const { isAuthenticated, authInitialized } = store;

    if (!authInitialized) {
        return <FullScreenLoader />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
