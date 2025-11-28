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
    const loginMutation = useLogin(navigate);

    const onSubmit = (data: LoginFormInputs) => {
        loginMutation.mutate(data);
        methods.reset();
    };

    return <UserForm onSubmit={onSubmit} methods={methods} />;
}

export default Login;
