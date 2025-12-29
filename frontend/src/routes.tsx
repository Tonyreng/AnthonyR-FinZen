import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';
import { Layout } from './pages/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import { ErrorDetail } from './pages/ErrorDetail';
import { Dashboard } from './pages/Dashboard';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<ErrorDetail />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
    )
);
