import { useMutation } from '@tanstack/react-query';
import { LoginFormInputs, SmallUser } from '../types';
import { api } from '../api/axiosInstance';
import { UseFormReturn } from 'react-hook-form';
import { NavigateFunction } from 'react-router-dom';

type LoginResponse = {
    access_token: string;
    user: SmallUser;
    msg: string;
};

type useLoginProps = {
    navigate: NavigateFunction;
    methods: UseFormReturn<LoginFormInputs>;
};

export const useLogin = ({ navigate, methods }: useLoginProps) => {
    return useMutation({
        mutationFn: (data: LoginFormInputs) =>
            api
                .post<LoginResponse>('/api/user/login', data)
                .then(response => response.data),
        onSuccess: data => {
            methods.reset();
            console.log(data.msg, data);
            window.__ACCESS_TOKEN__ = data.access_token;
            navigate('/dashboard');
        },
        onError: error => {
            console.error(error.message, error);
        },
    });
};
