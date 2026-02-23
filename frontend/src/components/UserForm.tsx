import { FormProvider, UseFormReturn } from 'react-hook-form';
import { LoginFormInputs } from '../types';
import { Box } from '@mui/material';
import FormInput from './FormInput';
import FormHeader from './FormHeader';
import FormButton from './FormButton';
import { useTranslation } from 'react-i18next';

type Props = {
    onSubmit: (data: LoginFormInputs) => void;
    methods: UseFormReturn<LoginFormInputs>;
    isPending?: boolean;
};

const UserForm = ({ onSubmit, methods, isPending }: Props) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                margin: 'auto',
                width: { md: '500px' },
                textAlign: 'center',
            }}
        >
            <FormHeader
                title={t('login.header.title')}
                paragraph={t('login.header.paragraph')}
                styles={{ mb: 3 }}
            />
            <FormProvider {...methods}>
                <Box
                    component="form"
                    onSubmit={methods.handleSubmit(onSubmit)}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <FormInput
                        name="email"
                        label={t('login.fields.email')}
                        type="textfield"
                        rules={{
                            required: t('login.validation.emailRequired'),
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: t('login.validation.emailInvalid'),
                            },
                        }}
                    />

                    <FormInput
                        name="password"
                        label={t('login.fields.password')}
                        type="password"
                        rules={{
                            required: t('login.validation.passwordRequired'),
                            minLength: {
                                value: 4,
                                message: t('login.validation.passwordMinLength'),
                            },
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
                            label={t('login.fields.rememberMe')}
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
                            text={t('login.actions.forgotPassword')}
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
                            disabled={isPending}
                            text={
                                isPending
                                    ? t('login.actions.submitting')
                                    : t('login.actions.submit')
                            }
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
