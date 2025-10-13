import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer.tsx';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme.ts';
import { CssBaseline } from '@mui/material';

const Main = () => (
    <StrictMode>
        <StoreProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </StoreProvider>
    </StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Main />
);
