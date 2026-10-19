export type LoginFormInputs = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export type SmallUser = {
    id: number;
    full_name: string;
    email: string;
    currency: string;
    created_at: string;
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

export type AccountTypeValue =
    | 'bank'
    | 'cash'
    | 'credit_card'
    | 'savings'
    | 'virtual_wallet'
    | 'investment'
    | 'pension'
    | 'other';

export type AccountItem = {
    id: number;
    user_id: number;
    name: string;
    balance: string;
    type: AccountTypeValue;
    created_at: string;
};

export type AccountsResponse = {
    accounts: AccountItem[];
};

export type CategoryTypeValue = 'income' | 'expense';

export type TransactionCategoryItem = {
    id: number;
    user_id: number;
    name: string;
    type: CategoryTypeValue;
};

export type TransactionItem = {
    id: number;
    account_id: number;
    user_id: number;
    category_id: number;
    subscription_id: number | null;
    type: 'general' | 'subscription' | 'debt_payment' | 'loan_payment';
    amount: string;
    description: string | null;
    date: string;
    is_recurring: boolean;
    account?: AccountItem;
    category?: TransactionCategoryItem;
};

export type TransactionsResponse = {
    transactions: TransactionItem[];
};

export type CategoriesResponse = {
    categories: TransactionCategoryItem[];
};

export type TransactionFilterType = 'all' | CategoryTypeValue;

export type TransactionFilters = {
    search: string;
    categoryId: string;
    date: string;
    type: TransactionFilterType;
};

export type CreateTransactionFormValues = {
    category_type: CategoryTypeValue;
    amount: string;
    category_id: string;
    date: string;
    description: string;
};

export type CreateTransactionPayload = {
    amount: string;
    category_id: number;
    date: string;
    description?: string;
    category_type: CategoryTypeValue;
    account_id: number;
};

export type DashboardErrorResponse = {
    msg?: string;
};
