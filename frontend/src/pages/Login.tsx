import { useForm } from 'react-hook-form';
import UserForm from '../components/UserForm';
import { LoginFormInputs } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

type Props = {};

function Login(props: Props) {
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
        <UserForm onSubmit={onSubmit} methods={methods} isPending={isPending} />
    );
}

export default Login;
