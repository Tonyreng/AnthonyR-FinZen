import FormHeader from '../components/FormHeader';
import { CardBalance } from '../components/CardBalance';
import { useDashboard } from '../hooks/useDashboard';
import { Box } from '@mui/material';
import { SummaryCard } from '../components/SummaryCard';
import { TrendGraph } from '../components/TrendGraph';
import { UpcomingPaymentsCard } from '../components/UpcomingPaymentsCard';

export const Dashboard = () => {
    const { data, error, isLoading } = useDashboard();
    console.log(data);
    return (
        <>
            <FormHeader
                title="Dashboard Overview"
                paragraph="Here's a snapshot of your financial health."
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
                    gridTemplateColumns: 'repeat(3, 1fr)',
                }}
            >
                <SummaryCard title="Spending" subHeader={data?.expense_month}>
                    <TrendGraph trendChartData={data?.expense_trend} />
                </SummaryCard>
                <SummaryCard title="Income" subHeader={data?.income_month}>
                    <TrendGraph trendChartData={data?.income_trend} />
                </SummaryCard>
                <SummaryCard title="Upcoming Payments">
                    <UpcomingPaymentsCard payments={data?.upcoming_payments} />
                </SummaryCard>
            </Box>
        </>
    );
};
