import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import type {
    CategoriesResponse,
    CreateTransactionPayload,
    TransactionFilters,
    TransactionItem,
    TransactionsResponse,
} from '../types';

export const useTransactions = (filters: TransactionFilters) => {
    return useQuery({
        queryKey: ['transactionsData', filters.search, filters.categoryId, filters.date, filters.type],
        queryFn: () =>
            api
                .get<TransactionsResponse>('/api/user/transactions', {
                    params: {
                        ...(filters.search && { search: filters.search }),
                        ...(filters.categoryId && { category_id: filters.categoryId }),
                        ...(filters.date && { date: filters.date }),
                        ...(filters.type !== 'all' && { type: filters.type }),
                    },
                })
                .then(response => response.data.transactions),
    });
};

export const useTransactionCategories = () => {
    return useQuery({
        queryKey: ['transactionCategories'],
        queryFn: () =>
            api
                .get<CategoriesResponse>('/api/user/categories')
                .then(response => response.data.categories),
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTransactionPayload) =>
            api
                .post<{
                    msg: string;
                    transaction: TransactionItem;
                }>('/api/user/transactions', payload)
                .then(response => response.data.transaction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactionsData'] });
            queryClient.invalidateQueries({ queryKey: ['accountsData'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        },
    });
};
