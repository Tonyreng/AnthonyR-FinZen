import { Box, Typography } from '@mui/material';

type Props = {
    title: string;
    paragraph: string;
    styles?: object;
};

function FormHeader({ title, paragraph, styles }: Props) {
    return (
        <Box sx={styles}>
            <Typography sx={{ mb: 1 }} variant="h2">
                {title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
                {paragraph}
            </Typography>
        </Box>
    );
}

export default FormHeader;
