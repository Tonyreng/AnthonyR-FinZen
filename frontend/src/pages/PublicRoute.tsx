import { Navigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { FullScreenLoader } from './FullScreenLoader';
import { JSX } from 'react';

type Props = {
    children: React.ReactNode;
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
