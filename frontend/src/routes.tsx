import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from 'react-router-dom';
import { Layout } from './pages/Layout';
import Home from './pages/Home';
import { ErrorDetail } from './pages/ErrorDetail';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<ErrorDetail />}>
            <Route path="/" element={<Home />} />
        </Route>
    )
);
