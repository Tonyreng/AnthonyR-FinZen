export type LoginFormInputs = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export type SmallUser = {
    id: number;
    fullName: string;
    email: string;
    currency: string;
    creaetedAt: string;
    updatedAt: string;
};

export type storeType = {
    user: SmallUser | null;
    isAuthenticated: boolean;
    authInitialized: boolean;
};

export type actionType =
    | { type: 'LOGIN_SUCCESS'; payload: SmallUser }
    | { type: 'LOGOUT' }
    | { type: 'AUTH_INITIALIZED' };

export type LoginResponse = {
    access_token: string;
    user: SmallUser;
    msg: string;
};

export type UpcomingPaymentsTypes = {
    id: number;
    name: string;
    price: string;
    payment_date: string;
};

export type TrendChartTypes = {
    month: string;
    total: string;
};

export type AiRecommendations = {
    health_score: number;
    status: string;
    alerts: string[];
    recommendations: string[];
};

export type DashboardResponse = {
    total_balance: string;
    income_month: string;
    income_trend: TrendChartTypes[];
    expense_month: string;
    expense_trend: TrendChartTypes[];
    upcoming_payments: UpcomingPaymentsTypes[];
    ai_recommendations: AiRecommendations;
};
