import { useForm } from 'react-hook-form';
import UserForm from '../components/UserForm';

export type LoginFormInputs = {
    email: string;
    password: string;
    rememberMe: boolean;
};

type Props = {};

function Login(props: Props) {
    const methods = useForm<LoginFormInputs>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = (data: LoginFormInputs) => {
        console.log(data);
    };

    return <UserForm onSubmit={onSubmit} methods={methods} />;
}

export default Login;
