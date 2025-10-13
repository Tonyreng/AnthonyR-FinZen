import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer.tsx';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';

const Main = () => (
    <StrictMode>
        <StoreProvider>
            <RouterProvider router={router} />
        </StoreProvider>
    </StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Main />
);
