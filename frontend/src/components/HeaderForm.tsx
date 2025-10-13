import { Box, Typography } from '@mui/material';

type Props = {
    title: string;
    paragraph: string;
};

function HeaderForm({ title, paragraph }: Props) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }} variant="h2">
                {title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
                {paragraph}
            </Typography>
        </Box>
    );
}

export default HeaderForm;
