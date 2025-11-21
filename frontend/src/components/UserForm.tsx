import { FormProvider, UseFormReturn } from 'react-hook-form';
import { LoginFormInputs } from '../pages/Login';
import { Box } from '@mui/material';
import FormInput from './FormInput';
import FormHeader from './FormHeader';
import FormButton from './FormButton';

type Props = {
    onSubmit: (data: LoginFormInputs) => void;
    methods: UseFormReturn<LoginFormInputs>;
};

const UserForm = ({ onSubmit, methods }: Props) => {
    return (
        <Box sx={{ width: { md: '500px' } }}>
            <FormHeader
                title="Log in to your account"
                paragraph="Welcome back! Please enter your details."
            />
            <FormProvider {...methods}>
                <Box
                    component="form"
                    onSubmit={methods.handleSubmit(onSubmit)}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <FormInput
                        name="email"
                        label="Email address"
                        type="textfield"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address',
                            },
                        }}
                    />

                    <FormInput
                        name="password"
                        label="Password"
                        type="textfield"
                        rules={{
                            required: 'Password is required',
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <FormInput
                            name="rememberMe"
                            label="Remember me"
                            type="checkbox"
                            styleInput={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    paddingTop: '3px',
                                    color: '#9CA3AF',
                                },
                            }}
                        />
                        <FormButton
                            text="Forgot your Password?"
                            buttonStyle={{
                                padding: 0,
                                ':focus': { outline: 'none' },
                                ':hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                            buttonVariant="text"
                            buttonSize="small"
                            ripple={false}
                        />
                    </Box>
                    <Box>
                        <FormButton
                            text="Log In"
                            buttonStyle={{
                                width: '100%',
                                ':hover': {
                                    backgroundColor: 'rgba(17, 115, 212, 0.9)',
                                },
                            }}
                            buttonVariant="contained"
                            buttonSize="large"
                            ButtonType="submit"
                        />
                    </Box>
                </Box>
            </FormProvider>
        </Box>
    );
};

export default UserForm;
