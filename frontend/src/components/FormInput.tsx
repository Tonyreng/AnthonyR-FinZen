import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    rules?: object;
    label?: string;
    type?: string;
    styleInput?: object;
};

const FormInput = ({ name, rules, label, type, styleInput }: Props) => {
    const { control, formState, getFieldState } = useFormContext();
    const { error } = getFieldState(name, formState);

    return (
        <Controller
            name={name}
            control={control}
            rules={rules && { ...rules }}
            render={({ field }) =>
                type !== 'checkbox' ? (
                    <TextField
                        {...field}
                        label={label}
                        variant="outlined"
                        type={type}
                        fullWidth
                        error={!!error}
                        helperText={error && error?.message}
                    />
                ) : (
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...field}
                                size="small"
                                sx={{ color: 'primary.main' }}
                                checked={field.value}
                            />
                        }
                        label={label}
                        sx={styleInput}
                    />
                )
            }
        />
    );
};

export default FormInput;
