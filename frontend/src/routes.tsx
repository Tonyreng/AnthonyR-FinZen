import { lazy } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';
import { Layout } from './pages/Layout';
import { ErrorDetail } from './pages/ErrorDetail';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { PublicRoute } from './pages/PublicRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() =>
    import('./pages/Dashboard').then(({ Dashboard }) => ({ default: Dashboard }))
);
const Accounts = lazy(() =>
    import('./pages/Accounts').then(({ Accounts }) => ({ default: Accounts }))
);
const Transactions = lazy(() =>
    import('./pages/Transactions').then(({ Transactions }) => ({ default: Transactions }))
);

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<ErrorDetail />}>
            <Route path="/" element={<Home />} />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <Signup />
                    </PublicRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/accounts"
                element={
                    <ProtectedRoute>
                        <Accounts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/transactions"
                element={
                    <ProtectedRoute>
                        <Transactions />
                    </ProtectedRoute>
                }
            />
        </Route>
    )
);
