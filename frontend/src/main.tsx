import { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './hooks/StoreProvider.tsx';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme.ts';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import { FullScreenLoader } from './pages/FullScreenLoader.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <StoreProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Suspense fallback={<FullScreenLoader />}>
                        <RouterProvider router={router} />
                    </Suspense>
                </ThemeProvider>
            </StoreProvider>
        </QueryClientProvider>
    </StrictMode>
);
