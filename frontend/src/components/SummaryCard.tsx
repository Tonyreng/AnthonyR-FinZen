import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
    title?: string;
    subHeader?: string;
    children?: React.ReactNode;
};

export const SummaryCard = ({ title, subHeader, children }: Props) => {
    const { i18n } = useTranslation();
    const currencyLocale = i18n.language.startsWith('en') ? 'en-US' : 'es-CO';

    return (
        <Card variant="outlined" sx={{ backgroundColor: 'background.default' }}>
            <CardContent>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {title}
                    </Typography>
                    {subHeader && (
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {subHeader
                                ? '$' +
                                  parseFloat(subHeader).toLocaleString(
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
                    )}
                </Box>
                <Box>{children}</Box>
            </CardContent>
        </Card>
    );
};
