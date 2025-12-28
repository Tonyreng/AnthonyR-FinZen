import { api } from '../api/axiosInstance';

export const initAuthServices = async (): Promise<boolean> => {
    try {
        const { data } = await api.post('api/user/refresh_token');
        window.__ACCESS_TOKEN__ = data.access_token;
        return true;
    } catch {
        console.error('Failed to initialize auth services');
        return false;
    }
};
