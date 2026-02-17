import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import { AccountItem } from '../types';
import { accountTypeLabel } from './RenderAccountItem';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import FormInput from './FormInput';
import FormButton from './FormButton';

type Props = {
    open: boolean;
    handleClose: () => void;
    methods: UseFormReturn<AccountItem>;
    isPending?: boolean;
    handleSubmit: (data: AccountItem) => void;
};

export const CreateAccountDialog = ({
    open,
    handleClose,
    isPending,
    methods,
    handleSubmit,
}: Props) => {
    return (
        <FormProvider {...methods}>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Añadir cuenta</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <FormInput
                            name="name"
                            label="Nombre de la cuenta"
                            type="textfield"
                            rules={{
                                required: 'El nombre de la cuenta es requerido',
                                minLength: {
                                    value: 3,
                                    message:
                                        'El nombre de la cuenta debe tener al menos 3 caracteres',
                                },
                            }}
                        />
                        <FormInput
                            name="type"
                            label="Tipo de cuenta"
                            type="select"
                            options={accountTypeLabel}
                            rules={{
                                required: 'El tipo de cuenta es requerido',
                            }}
                        />
                        <FormInput
                            name="balance"
                            label="Balance inicial"
                            type="number"
                            rules={{
                                required: 'El balance inicial es requerido',
                                min: {
                                    value: 0,
                                    message:
                                        'El balance inicial no puede ser negativo',
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <FormButton
                        text="Cancelar"
                        onClick={handleClose}
                        disabled={isPending}
                    />
                    <FormButton
                        buttonVariant="contained"
                        ButtonType="submit"
                        disabled={isPending}
                        text={isPending ? 'Guardando...' : 'Guardar'}
                        onClick={methods.handleSubmit(handleSubmit)}
                    />
                </DialogActions>
            </Dialog>
        </FormProvider>
    );
};
