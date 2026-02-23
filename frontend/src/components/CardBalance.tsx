import { Box, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
    styles?: object;
    totalBalance?: string;
};

export const CardBalance = ({ styles, totalBalance }: Props) => {
    const { t, i18n } = useTranslation();
    const currencyLocale = i18n.language.startsWith('en') ? 'en-US' : 'es-CO';

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
                        {t('dashboard.cards.totalBalance')}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        $
                        {totalBalance
                            ? parseFloat(totalBalance).toLocaleString(
                                  currencyLocale,
                                  {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }
                              )
                            : currencyLocale === 'es-CO'
                              ? '0,00'
                              : '0.00'}
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
};
