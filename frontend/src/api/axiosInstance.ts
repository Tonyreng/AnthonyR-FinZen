import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(config => {
    const accesstoken = window.__ACCESS_TOKEN__;

    if (accesstoken) {
        config.headers.Authorization = `Bearer ${accesstoken}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            error.response.data?.message === 'Token has expired'
        ) {
            originalRequest._retry = true;
            try {
                const { data } = await api.post('/api/refresh-token');
                window.__ACCESS_TOKEN__ = data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
