import { Box, Typography, Stack, CircularProgress } from '@mui/material';
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
    return 'calendar';
};

const formatPaymentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays < 0) return 'Vencido';
    return `Vence en ${diffDays} días`;
};

type props = {
    payments?: UpcomingPaymentsTypes[];
};

export const UpcomingPaymentsCard = ({ payments }: props) => {
    return (
        <Box sx={{ p: 1, mt: 3 }}>
            {payments?.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                    No hay pagos próximos
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {payments?.map(payment => (
                        <UpcomingPaymentItem
                            key={payment.id}
                            title={payment.name}
                            due={formatPaymentDate(payment.paymentDate)}
                            amount={parseFloat(payment.price)}
                            icon={getIconForPayment(payment.name)}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};
