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

    const formatToColombianAmount = (rawValue: string): string => {
        const cleanedValue = rawValue
            .replace(/[^\d,.-]/g, '')
            .replace(/-/g, '');

        if (cleanedValue === '') {
            return '';
        }

        const hasComma = cleanedValue.includes(',');

        let integerPart = '';
        let decimalPart = '';
        let hasTrailingDecimalSeparator = false;

        if (hasComma) {
            const [integerCandidate, ...decimalCandidates] = cleanedValue
                .replace(/\./g, '')
                .split(',');

            integerPart = integerCandidate.replace(/\D/g, '');
            decimalPart = decimalCandidates.join('').replace(/\D/g, '');
            hasTrailingDecimalSeparator = cleanedValue.endsWith(',');
        } else {
            integerPart = cleanedValue.replace(/\D/g, '');
        }

        const normalizedInteger = (integerPart || '0').replace(/^0+(?=\d)/, '');
        const groupedInteger = normalizedInteger.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            '.'
        );

        if (decimalPart !== '' || hasTrailingDecimalSeparator) {
            return `${groupedInteger},${decimalPart}`;
        }

        return groupedInteger;
    };

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
                        type="text"
                        fullWidth
                        sx={styleInput}
                        inputProps={{
                            inputMode: 'decimal',
                            pattern: '[0-9.,]*',
                        }}
                        value={
                            typeof field.value === 'number'
                                ? formatToColombianAmount(
                                      field.value.toString()
                                  )
                                : (field.value ?? '')
                        }
                        onChange={event => {
                            field.onChange(
                                formatToColombianAmount(event.target.value)
                            );
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
