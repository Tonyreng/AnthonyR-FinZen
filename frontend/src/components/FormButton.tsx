import { Button } from '@mui/material';

type Props = {
    buttonStyle?: object;
    onClick?: () => void;
    text: string;
    buttonSize?: 'small' | 'medium' | 'large';
    buttonVariant?: 'text' | 'outlined' | 'contained';
    ripple?: boolean;
    ButtonType?: 'submit' | 'button' | 'reset';
    disabled?: boolean;
};

function FormButton({
    buttonStyle,
    onClick,
    text,
    buttonSize,
    buttonVariant,
    ripple = false,
    ButtonType = 'button',
    disabled,
}: Props) {
    return (
        <Button
            sx={buttonStyle && { ...buttonStyle }}
            variant={buttonVariant}
            type={ButtonType}
            size={buttonSize}
            {...(!ripple && { disableRipple: true })}
            disabled={disabled}
        >
            {text}
        </Button>
    );
}

export default FormButton;
