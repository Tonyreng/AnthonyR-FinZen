import { Box } from '@mui/material';
import FormHeader from '../components/FormHeader';

export const Dashboard = () => {
    return (
        <Box
            sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                marginY: 2,
            }}
        >
            <FormHeader
                title="Dashboard Overview"
                paragraph="Here's a snapshot of your financial health."
            />
        </Box>
    );
};
