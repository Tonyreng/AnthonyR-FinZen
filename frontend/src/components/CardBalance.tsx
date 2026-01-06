import { Box, Card, Typography } from '@mui/material';

type Props = {
    styles?: object;
};

export const CardBalance = ({ styles }: Props) => {
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
                        $12,345.67
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
};
