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

        const isExpired =
            error.response?.status === 401 &&
            error.response.data?.msg === 'Token has expired';

        if (isExpired && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    `${backendUrl}/api/user/refresh_token`,
                    {},
                    { withCredentials: true }
                );
                window.__ACCESS_TOKEN__ = data.access_token;
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
