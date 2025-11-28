import { useMutation } from '@tanstack/react-query';
import { LoginFormInputs, SmallUser } from '../types';
import { api } from '../api/axiosInstance';

type LoginResponse = {
    access_token: string;
    user: SmallUser;
    msg: string;
};

export const useLogin = (navigate: (path: string) => void) => {
    return useMutation({
        mutationFn: (data: LoginFormInputs) =>
            api
                .post<LoginResponse>('/api/user/login', data)
                .then(response => response.data),
        onSuccess: data => {
            console.log(data.msg, data);
            window.__ACCESS_TOKEN__ = data.access_token;
            navigate('/dashboard');
        },
        onError: error => {
            console.error('Login failed', error);
        },
    });
};
