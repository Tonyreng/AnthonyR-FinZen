import { useMutation } from '@tanstack/react-query';
import { LoginFormInputs, LoginResponse } from '../types';
import { api } from '../api/axiosInstance';
import { UseFormReturn } from 'react-hook-form';
import { NavigateFunction } from 'react-router-dom';
import useGlobalReducer from './useGlobalReducer';

type useLoginProps = {
    navigate: NavigateFunction;
    methods: UseFormReturn<LoginFormInputs>;
};

export const useLogin = ({ navigate, methods }: useLoginProps) => {
    const { dispatch } = useGlobalReducer();
    return useMutation({
        mutationFn: (data: LoginFormInputs) =>
            api
                .post<LoginResponse>('/api/user/login', data)
                .then(response => response.data),
        onSuccess: data => {
            methods.reset();
            window.__ACCESS_TOKEN__ = data.access_token;
            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
            navigate('/dashboard');
        },
        onError: error => {
            console.error(error.message, error || 'Login failed');
        },
    });
};
