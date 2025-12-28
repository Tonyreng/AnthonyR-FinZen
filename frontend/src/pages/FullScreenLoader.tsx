import { Box, CircularProgress } from '@mui/material';

const FullScreenLoader = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default FullScreenLoader;
