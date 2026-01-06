import FormHeader from '../components/FormHeader';
import { CardBalance } from '../components/CardBalance';

export const Dashboard = () => {
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
            />
        </>
    );
};
