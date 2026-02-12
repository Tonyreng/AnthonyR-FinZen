import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import { DashboardResponse } from '../types';

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboardData'],
        queryFn: () =>
            api
                .get<DashboardResponse>('/api/user/dashboard')
                .then(response => response.data),
    });
};
