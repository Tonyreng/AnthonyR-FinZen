import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer.tsx';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme.ts';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';

const queryClient = new QueryClient();

const Main = () => (
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <StoreProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <RouterProvider router={router} />
                </ThemeProvider>
            </StoreProvider>
        </QueryClientProvider>
    </StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Main />
);
