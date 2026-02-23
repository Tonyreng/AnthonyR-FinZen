type TranslateFunction = (
    key: string,
    options?: Record<string, string | number>
) => string;

const normalizeCategoryName = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[+]/g, 'plus')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');

const categoryTranslationKeyByNormalizedName: Record<string, string> = {
    salario: 'salary',
    salary: 'salary',
    freelance: 'freelance',
    'intereses cdt': 'cdtInterest',
    'cdt interest': 'cdtInterest',
    reembolsos: 'refunds',
    refunds: 'refunds',
    ventas: 'sales',
    sales: 'sales',
    bonificaciones: 'bonuses',
    bonuses: 'bonuses',
    alimentacion: 'food',
    food: 'food',
    transporte: 'transport',
    transport: 'transport',
    transportation: 'transport',
    entretenimiento: 'entertainment',
    entertainment: 'entertainment',
    servicios: 'utilities',
    utilities: 'utilities',
    salud: 'health',
    health: 'health',
    educacion: 'education',
    education: 'education',
    hogar: 'home',
    home: 'home',
    ropa: 'clothing',
    clothing: 'clothing',
    tecnologia: 'technology',
    technology: 'technology',
    restaurantes: 'restaurants',
    restaurants: 'restaurants',
    suscripciones: 'subscriptions',
    subscriptions: 'subscriptions',
    'otros gastos': 'otherExpenses',
    'other expenses': 'otherExpenses',
};

const translateCategoryName = (category: string, t: TranslateFunction) => {
    const normalized = normalizeCategoryName(category);
    const key = categoryTranslationKeyByNormalizedName[normalized];

    if (!key) {
        return category;
    }

    return t(`dashboard.ai.categories.${key}`);
};

export const translateAiAlert = (alert: string, t: TranslateFunction) => {
    if (
        alert ===
        'Your spending trend, percentage-wise, has been increasing over the last 3 months.'
    ) {
        return t('dashboard.ai.alerts.spendingTrend3Months');
    }

    if (
        alert ===
        'This month, percentage-wise, you are spending more money than last month.'
    ) {
        return t('dashboard.ai.alerts.spendingMoreThanLastMonth');
    }

    if (alert === 'You are spending more than you earn.') {
        return t('dashboard.ai.alerts.spendingMoreThanEarning');
    }

    if (
        alert === 'Your subscriptions make up a large portion of your expenses.'
    ) {
        return t('dashboard.ai.alerts.subscriptionsHigh');
    }

    if (
        alert ===
        'Your subscription expenses are under control compared to your total expenses.'
    ) {
        return t('dashboard.ai.alerts.subscriptionsControlled');
    }

    const netBalanceMatch = alert.match(
        /^You are managing your money well month after month, your net balance is (.+)$/
    );

    if (netBalanceMatch) {
        return t('dashboard.ai.alerts.netBalance', {
            netBalance: netBalanceMatch[1],
        });
    }

    const savingsRateLowMatch = alert.match(
        /^Your savings rate is low, you are saving (.+)% of your income\.$/
    );
    if (savingsRateLowMatch) {
        return t('dashboard.ai.alerts.savingsRateLow', {
            rate: savingsRateLowMatch[1],
        });
    }

    const savingsRateAcceptableMatch = alert.match(
        /^Your savings rate is acceptable; you are saving (.+)% of your income\.$/
    );
    if (savingsRateAcceptableMatch) {
        return t('dashboard.ai.alerts.savingsRateAcceptable', {
            rate: savingsRateAcceptableMatch[1],
        });
    }

    const savingsRateExcellentMatch = alert.match(
        /^Your savings rate is excellent; you are saving (.+)% of your income\.$/
    );
    if (savingsRateExcellentMatch) {
        return t('dashboard.ai.alerts.savingsRateExcellent', {
            rate: savingsRateExcellentMatch[1],
        });
    }

    const highCategoryMatch = alert.match(
        /^High concentration of spending in (.+)\.$/
    );
    if (highCategoryMatch) {
        const localizedCategory = translateCategoryName(
            highCategoryMatch[1],
            t
        );
        return t('dashboard.ai.alerts.highSpendingCategory', {
            category: localizedCategory,
        });
    }

    return alert;
};

export const translateAiRecommendation = (
    recommendation: string,
    t: TranslateFunction
) => {
    if (
        recommendation ===
        'Keep tracking your expenses and try to maintain or increase your net balance.'
    ) {
        return t('dashboard.ai.recommendations.trackExpenses');
    }

    if (recommendation === 'Reduce expenses or increase income.') {
        return t('dashboard.ai.recommendations.reduceExpenses');
    }

    if (recommendation === 'Aim to save at least 15%.') {
        return t('dashboard.ai.recommendations.saveAtLeast15');
    }

    if (recommendation === 'Ideally, you should always save 20%.') {
        return t('dashboard.ai.recommendations.saveAtLeast20');
    }

    if (recommendation === 'Keep up the good work saving money.') {
        return t('dashboard.ai.recommendations.keepSaving');
    }

    if (recommendation === 'Cancel non-essential subscriptions.') {
        return t('dashboard.ai.recommendations.cancelSubscriptions');
    }

    if (
        recommendation ===
        'Review your subscriptions regularly to ensure they still provide value.'
    ) {
        return t('dashboard.ai.recommendations.reviewSubscriptions');
    }

    const reduceCategoryMatch = recommendation.match(
        /^Consider reducing expenses in (.+)\.$/
    );
    if (reduceCategoryMatch) {
        const localizedCategory = translateCategoryName(
            reduceCategoryMatch[1],
            t
        );
        return t('dashboard.ai.recommendations.reduceCategoryExpenses', {
            category: localizedCategory,
        });
    }

    return recommendation;
};
