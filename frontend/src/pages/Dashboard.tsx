import FormHeader from '../components/FormHeader';
import { CardBalance } from '../components/CardBalance';
import { useDashboard } from '../hooks/useDashboard';
import { Box } from '@mui/material';
import { SummaryCard } from '../components/SummaryCard';
import { TrendGraph } from '../components/TrendGraph';
import { UpcomingPaymentsCard } from '../components/UpcomingPaymentsCard';
import { AiRecommendationsCard } from '../components/AiRecommendationsCard';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

export const Dashboard = () => {
    const { data, error, isLoading } = useDashboard();

    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Box sx={{ px: 3, mt: 4 }}>
                <Typography color="text.secondary">
                    {t('dashboard.header.loading')}
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ px: 3, mt: 4 }}>
                <Typography color="error.main">
                    {t('dashboard.header.error')}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <FormHeader
                title={t('dashboard.header.title')}
                paragraph={t('dashboard.header.paragraph')}
                styles={{
                    px: 3,
                    mt: 4,
                }}
            />
            <CardBalance
                styles={{
                    px: 3,
                    mt: 3,
                }}
                totalBalance={data?.total_balance}
            />
            <Box
                sx={{
                    px: 3,
                    mt: 3,
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        md: 'repeat(3, 1fr)',
                        xs: 'repeat(1, 1fr)',
                    },
                }}
            >
                <SummaryCard
                    title={t('dashboard.cards.spending')}
                    subHeader={data?.expense_month}
                >
                    <TrendGraph trendChartData={data?.expense_trend} />
                </SummaryCard>
                <SummaryCard
                    title={t('dashboard.cards.income')}
                    subHeader={data?.income_month}
                >
                    <TrendGraph trendChartData={data?.income_trend} />
                </SummaryCard>
                <SummaryCard title={t('dashboard.cards.upcomingPayments')}>
                    <UpcomingPaymentsCard payments={data?.upcoming_payments} />
                </SummaryCard>
            </Box>
            <Box
                sx={{
                    px: 3,
                    mt: 3,
                }}
            >
                <SummaryCard title={t('dashboard.cards.recommendations')}>
                    <AiRecommendationsCard
                        alerts={data?.ai_recommendations?.alerts}
                        recommendations={
                            data?.ai_recommendations?.recommendations
                        }
                    />
                </SummaryCard>
            </Box>
        </>
    );
};
