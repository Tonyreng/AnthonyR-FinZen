import { Outlet } from 'react-router-dom';

type Props = {
    children?: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Outlet />
        </div>
    );
};
