import { useForm } from 'react-hook-form';
import UserForm from '../components/UserForm';
import { LoginFormInputs } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Box } from '@mui/material';

function Login() {
    const methods = useForm<LoginFormInputs>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const navigate = useNavigate();

    const { mutate, isPending } = useLogin({ navigate, methods });
    const onSubmit = (data: LoginFormInputs) => {
        mutate(data);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <UserForm
                onSubmit={onSubmit}
                methods={methods}
                isPending={isPending}
            />
        </Box>
    );
}

export default Login;
