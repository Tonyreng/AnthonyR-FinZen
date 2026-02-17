import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import {
    Controller,
    ControllerRenderProps,
    FieldValues,
    useFormContext,
} from 'react-hook-form';
import { AccountTypeValue } from '../types';

type Props = {
    name: string;
    rules?: object;
    label?: string;
    type: string;
    styleInput?: object;
    options?: Record<AccountTypeValue, string>;
};

const FormInput = ({
    name,
    rules,
    label,
    type,
    styleInput,
    options,
}: Props) => {
    const { control, formState, getFieldState } = useFormContext();
    const { error } = getFieldState(name, formState);

    const getFieldType = (
        type: string,
        field: ControllerRenderProps<FieldValues, string>
    ) => {
        switch (type) {
            case 'textfield':
                return (
                    <TextField
                        {...field}
                        label={label}
                        variant="outlined"
                        type={type}
                        fullWidth
                        error={!!error}
                        helperText={error && error?.message}
                    />
                );
            case 'checkbox':
                return (
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
                );
            case 'select':
                return (
                    <FormControl fullWidth error={!!error} sx={styleInput}>
                        {label && (
                            <InputLabel id={`${name}-label`}>
                                {label}
                            </InputLabel>
                        )}
                        <Select
                            {...field}
                            labelId={`${name}-label`}
                            label={label}
                            value={field.value ?? ''}
                        >
                            {Object.entries(options ?? {}).map(
                                ([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                        <FormHelperText>
                            {error?.message as string}
                        </FormHelperText>
                    </FormControl>
                );
            case 'number':
                return (
                    <TextField
                        {...field}
                        label={label}
                        variant="outlined"
                        type="number"
                        fullWidth
                        sx={styleInput}
                        inputProps={{ min: 0, step: 'any' }}
                        value={field.value ?? ''}
                        onChange={event => {
                            const value = event.target.value;

                            if (value === '') {
                                field.onChange('');
                                return;
                            }

                            const parsedValue = Number(value);

                            if (
                                !Number.isNaN(parsedValue) &&
                                parsedValue >= 0
                            ) {
                                field.onChange(parsedValue);
                            }
                        }}
                        error={!!error}
                        helperText={error && error?.message}
                    />
                );
            default:
                return (
                    <TextField
                        {...field}
                        label={label}
                        variant="outlined"
                        type={type}
                        fullWidth
                        error={!!error}
                        helperText={error && error?.message}
                    />
                );
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules && { ...rules }}
            render={({ field }) => getFieldType(type, field)}
        />
    );
};

export default FormInput;
