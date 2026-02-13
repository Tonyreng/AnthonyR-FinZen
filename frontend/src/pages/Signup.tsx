import { Box, Typography } from '@mui/material';

const Signup = () => {
    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                    Sign up
                </Typography>
                <Typography color="text.secondary">
                    Registration form coming soon.
                </Typography>
            </Box>
        </Box>
    );
};

export default Signup;
