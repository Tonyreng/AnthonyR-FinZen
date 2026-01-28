import { Box, Card, CardContent, Typography } from '@mui/material';
import { TrendGraph } from './TrendGraph';

type Props = {
    title?: string;
    subHeader?: string;
    children?: React.ReactNode;
};

export const SummaryCard = ({ title, subHeader, children }: Props) => {
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
                                      'en-CO',
                                      {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      }
                                  )
                                : '$0,00'}
                        </Typography>
                    )}
                </Box>
                <Box>{children}</Box>
            </CardContent>
        </Card>
    );
};
