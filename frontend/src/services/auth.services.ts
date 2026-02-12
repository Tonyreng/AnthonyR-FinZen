import { api } from '../api/axiosInstance';
import { SmallUser } from '../types';

type RefreshResponse = {
    access_token: string;
    user: SmallUser;
};

export const initAuthServices = async (): Promise<SmallUser | null> => {
    try {
        const { data } = await api.post<RefreshResponse>('api/user/refresh_token');
        window.__ACCESS_TOKEN__ = data.access_token;
        return data.user;
    } catch {
        console.error('Failed to initialize auth services');
        return null;
    }
};
