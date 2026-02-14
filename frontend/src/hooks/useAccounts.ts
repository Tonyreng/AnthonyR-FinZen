import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import { AccountsResponse, AccountItem } from '../types';

export const useAccounts = () => {
    return useQuery({
        queryKey: ['accountsData'],
        queryFn: () =>
            api
                .get<AccountsResponse>('/api/user/accounts')
                .then(response => response.data.accounts),
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AccountItem) =>
            api
                .post<{
                    msg: string;
                    account: AccountItem;
                }>('/api/user/accounts', payload)
                .then(response => response.data.account),
        onMutate: createdAccount => {
            queryClient.setQueryData<AccountItem[]>(
                ['accountsData'],
                (accounts = []) => [createdAccount, ...accounts]
            );
        },
        onSuccess: (savedAccount, createdAccount) => {
            queryClient.setQueryData<AccountItem[]>(
                ['accountsData'],
                (accounts = []) =>
                    accounts.map(acc =>
                        acc.id === createdAccount.id ? savedAccount : acc
                    )
            );
        },
    });
};
