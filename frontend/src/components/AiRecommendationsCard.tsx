import { Box, ButtonBase, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    translateAiAlert,
    translateAiRecommendation,
} from '../i18n/aiRecommendations';

type Props = {
    alerts?: string[];
    recommendations?: string[];
};

export const AiRecommendationsCard = ({ alerts, recommendations }: Props) => {
    const { t } = useTranslation();

    const pairCount = useMemo(() => {
        return Math.min(alerts?.length ?? 0, recommendations?.length ?? 0);
    }, [alerts, recommendations]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (pairCount === 0) {
            setIndex(0);
            return;
        }
        if (index >= pairCount) {
            setIndex(0);
        }
    }, [pairCount, index]);

    const handleNext = () => {
        if (pairCount > 1) {
            setIndex(prevIndex => (prevIndex + 1) % pairCount);
        }
    };

    const titleText =
        pairCount > 0 && alerts?.[index]
            ? translateAiAlert(alerts[index], t)
            : t('dashboard.ai.emptyTitle');
    const bodyText =
        pairCount > 0 && recommendations?.[index]
            ? translateAiRecommendation(recommendations[index], t)
            : t('dashboard.ai.emptyBody');

    return (
        <ButtonBase
            onClick={handleNext}
            disableRipple={pairCount <= 1}
            sx={{
                width: '100%',
                textAlign: 'left',
                borderRadius: '8px',
                display: 'block',
                ':focus': { outline: 'none' },
                ':hover': {
                    backgroundColor: 'transparent',
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderRadius: '8px',
                    background: '#1173d433',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
                    gap: 2,
                }}
            >
                <Box sx={{ pr: { md: 1 } }}>
                    <Typography variant="overline" color="primary.light">
                        {t('dashboard.ai.label')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {titleText}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {bodyText}
                    </Typography>
                    {pairCount > 1 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                        >
                            {t('dashboard.ai.nextInsight')}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        borderRadius: '8px',
                        minHeight: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                            'linear-gradient(135deg, rgba(246, 222, 204, 1) 0%, rgba(255, 198, 170, 1) 100%)',
                        color: '#2b1c1c',
                        fontWeight: 700,
                        letterSpacing: 2,
                    }}
                >
                    <Typography variant="h4">AI</Typography>
                </Box>
            </Box>
        </ButtonBase>
    );
};
