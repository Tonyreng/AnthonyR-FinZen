import { Box, Typography, Avatar } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { JSX } from 'react';

const iconMap: Record<string, JSX.Element> = {
    calendar: <CalendarMonthIcon />,
    gym: <FitnessCenterIcon />,
    card: <CreditCardIcon />,
};

type UpcomingPaymentItemProps = {
    title: string;
    due: string;
    amount: number;
    icon: string;
};

export const UpcomingPaymentItem = ({
    title,
    due,
    amount,
    icon,
}: UpcomingPaymentItemProps) => {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                    sx={{
                        bgcolor: '#0f2a44',
                        color: '#3b82f6',
                        width: 40,
                        height: 40,
                    }}
                >
                    {iconMap[icon]}
                </Avatar>

                <Box>
                    <Typography>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {due}
                    </Typography>
                </Box>
            </Box>

            <Typography color="primary" fontWeight={600}>
                $
                {amount.toLocaleString('es-CO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </Typography>
        </Box>
    );
};
