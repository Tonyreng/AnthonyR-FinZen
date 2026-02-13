import { Outlet } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { initAuthServices } from '../services/auth.services';
import { useEffect, useState } from 'react';
import { FullScreenLoader } from './FullScreenLoader';
import { Navbar } from '../components/Navbar';

type Props = {
    children?: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
    const { dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            const user = await initAuthServices();

            if (user) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            }

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
            <Navbar />
            <Outlet />
        </div>
    );
};
