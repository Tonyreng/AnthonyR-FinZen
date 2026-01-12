import FormHeader from '../components/FormHeader';
import { CardBalance } from '../components/CardBalance';
import { SummaryCardGroup } from '../components/SummaryCardGroup';
import { useDashboard } from '../hooks/useDashboard';

export const Dashboard = () => {
    const { data, error, isLoading } = useDashboard();
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
            <SummaryCardGroup />
        </>
    );
};
