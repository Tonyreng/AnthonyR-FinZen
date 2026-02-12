import { Box, Card, Typography } from '@mui/material';

type Props = {
    styles?: object;
    totalBalance?: string;
};

export const CardBalance = ({ styles, totalBalance }: Props) => {
    return (
        <Box sx={styles}>
            <Card
                sx={{
                    marginY: 2,
                    backgroundColor: '#1173d433',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 3,
                    }}
                >
                    <Typography sx={{ color: 'primary.main' }}>
                        Total Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        $
                        {totalBalance
                            ? parseFloat(totalBalance).toLocaleString('en-CO', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })
                            : '0,00'}
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
};
