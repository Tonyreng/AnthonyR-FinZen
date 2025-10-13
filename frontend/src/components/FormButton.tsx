import { Button } from '@mui/material';

type Props = {
    buttonStyle?: object;
    onClick?: () => void;
    text: string;
    buttonSize?: 'small' | 'medium' | 'large';
    buttonVariant?: 'text' | 'outlined' | 'contained';
    ripple?: boolean;
    ButtonType?: 'submit' | 'button' | 'reset';
};

function FormButton({
    buttonStyle,
    onClick,
    text,
    buttonSize,
    buttonVariant,
    ripple = false,
    ButtonType = 'button',
}: Props) {
    return (
        <Button
            sx={buttonStyle && { ...buttonStyle }}
            variant={buttonVariant && buttonVariant}
            type={ButtonType && ButtonType}
            size={buttonSize && buttonSize}
            {...(!ripple && { disableRipple: true })}
        >
            {text}
        </Button>
    );
}

export default FormButton;
