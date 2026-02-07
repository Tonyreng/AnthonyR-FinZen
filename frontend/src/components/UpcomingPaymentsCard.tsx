import { Box, Typography, Stack } from '@mui/material';
import { UpcomingPaymentsTypes } from '../types';
import { UpcomingPaymentItem } from './UpcomingPaymentItem';

const getIconForPayment = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (
        nameLower.includes('gym') ||
        nameLower.includes('fitness') ||
        nameLower.includes('smartfit')
    )
        return 'gym';
    if (nameLower.includes('card') || nameLower.includes('credit'))
        return 'card';
    if (
        nameLower.includes('video') ||
        nameLower.includes('prime') ||
        nameLower.includes('hbo') ||
        nameLower.includes('netflix') ||
        nameLower.includes('disney')
    )
        return 'video';
    if (nameLower.includes('youtube')) return 'youtube';
    if (nameLower.includes('spotify') || nameLower.includes('music'))
        return 'music';
    return 'calendar';
};

const formatPaymentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return 'Overdue';
    return `Due in ${diffDays} days`;
};

type props = {
    payments?: UpcomingPaymentsTypes[];
};

export const UpcomingPaymentsCard = ({ payments }: props) => {
    return (
        <Box sx={{ p: 1, mt: 3 }}>
            {payments?.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                    No upcoming payments
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {payments?.map(payment => (
                        <UpcomingPaymentItem
                            key={payment.id}
                            title={payment.name}
                            due={formatPaymentDate(payment.payment_date)}
                            amount={parseFloat(payment.price)}
                            icon={getIconForPayment(payment.name)}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};
