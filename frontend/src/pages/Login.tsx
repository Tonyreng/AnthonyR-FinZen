import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    TextField,
    Typography,
} from '@mui/material';

type Props = {};

function Login({}: Props) {
    return (
        <Box sx={{ width: { md: '500px' } }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1 }} variant="h2">
                    Log in to your account
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Welcome back! Please enter your details.
                </Typography>
            </Box>

            <FormGroup>
                <FormControl fullWidth>
                    <TextField
                        id="email"
                        label="Email address"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 2,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    sx={{ color: 'primary.main' }}
                                />
                            }
                            label="Remember me"
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    paddingTop: '3px',
                                    color: '#9CA3AF',
                                },
                            }}
                        />
                        <Button
                            sx={{
                                ':focus': { outline: 'none' },
                                ':hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                            variant="text"
                            size="small"
                            disableRipple
                        >
                            Forgot your Password?
                        </Button>
                    </Box>
                </FormControl>
            </FormGroup>
            <Box>
                <Button
                    sx={{
                        ':hover': {
                            backgroundColor: 'rgba(17, 115, 212, 0.9)',
                        },
                    }}
                    variant="contained"
                    fullWidth
                >
                    Log In
                </Button>
            </Box>
        </Box>
    );
}

export default Login;
