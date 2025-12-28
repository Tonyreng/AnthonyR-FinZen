import { Outlet } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { initAuthServices } from '../services/auth.services';
import { useEffect, useState } from 'react';
import FullScreenLoader from './FullScreenLoader';

type Props = {
    children?: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
    const { dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            await initAuthServices();

            dispatch({ type: 'AUTH_INITIALIZED' });

            setLoading(false);
        };
        bootstrapAsync();
    }, []);

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Outlet />
        </div>
    );
};
