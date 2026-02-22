import {
    Box,
    ButtonBase,
    Dialog,
    DialogContent,
    DialogTitle,
    FormHelperText,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { AccountItem, AccountTypeValue } from '../types';
import { accountTypeLabel, getAccountIcon } from './RenderAccountItem';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { useRef } from 'react';
import FormInput from './FormInput';
import FormButton from './FormButton';

type Props = {
    open: boolean;
    handleClose: () => void;
    methods: UseFormReturn<AccountItem>;
    isPending?: boolean;
    handleSubmit: (data: AccountItem) => void;
};

const accountTypeOptions: AccountTypeValue[] = [
    'bank',
    'credit_card',
    'cash',
    'investment',
    'savings',
    'virtual_wallet',
    'pension',
    'other',
];

export const CreateAccountDialog = ({
    open,
    handleClose,
    isPending,
    methods,
    handleSubmit,
}: Props) => {
    const accountTypeCarouselRef = useRef<HTMLDivElement | null>(null);

    const handleScrollTypes = (direction: 'left' | 'right') => {
        if (!accountTypeCarouselRef.current) {
            return;
        }

        const scrollAmount = 180;

        accountTypeCarouselRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <FormProvider {...methods}>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    component: 'form',
                    onSubmit: methods.handleSubmit(handleSubmit),
                    sx: { borderRadius: 1 },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h5" sx={{ mb: 0.5 }}>
                                Nueva Cuenta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Selecciona el tipo y completa los datos
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={handleClose}
                            disabled={isPending}
                            size="small"
                            aria-label="Cerrar diálogo"
                        >
                            <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 1.25 }}
                            >
                                Tipo de cuenta
                            </Typography>
                            <Controller
                                name="type"
                                control={methods.control}
                                rules={{
                                    required: 'El tipo de cuenta es requerido',
                                }}
                                render={({ field }) => (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >
                                        <IconButton
                                            sx={{
                                                ':focus': {
                                                    outline: 'none',
                                                },
                                            }}
                                            size="small"
                                            onClick={() =>
                                                handleScrollTypes('left')
                                            }
                                            aria-label="Mover tipos de cuenta a la izquierda"
                                        >
                                            <ChevronLeftRoundedIcon fontSize="small" />
                                        </IconButton>

                                        <Box
                                            ref={accountTypeCarouselRef}
                                            sx={{
                                                display: 'flex',
                                                gap: 0.4,
                                                overflowX: 'auto',
                                                overflowY: 'hidden',
                                                flexWrap: 'nowrap',
                                                scrollSnapType: 'x mandatory',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none',
                                                '&::-webkit-scrollbar': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            {accountTypeOptions.map(
                                                typeOption => {
                                                    const isSelected =
                                                        field.value ===
                                                        typeOption;

                                                    return (
                                                        <Stack
                                                            key={typeOption}
                                                            spacing={0.6}
                                                            alignItems="center"
                                                            sx={{
                                                                minWidth: 56,
                                                                scrollSnapAlign:
                                                                    'start',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <ButtonBase
                                                                onClick={() =>
                                                                    field.onChange(
                                                                        typeOption
                                                                    )
                                                                }
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: 1.5,
                                                                    border: 1,
                                                                    borderColor:
                                                                        isSelected
                                                                            ? 'primary.main'
                                                                            : 'divider',
                                                                    color: isSelected
                                                                        ? 'primary.main'
                                                                        : 'text.secondary',
                                                                    backgroundColor:
                                                                        'transparent',
                                                                    ':focus': {
                                                                        outline:
                                                                            'none',
                                                                    },
                                                                    ':hover': {
                                                                        backgroundColor:
                                                                            'transparent',
                                                                    },
                                                                }}
                                                            >
                                                                {getAccountIcon(
                                                                    typeOption
                                                                )}
                                                            </ButtonBase>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    textAlign:
                                                                        'center',
                                                                    lineHeight: 1.2,
                                                                }}
                                                            >
                                                                {
                                                                    accountTypeLabel[
                                                                        typeOption
                                                                    ]
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    );
                                                }
                                            )}
                                        </Box>

                                        <IconButton
                                            sx={{
                                                ':focus': {
                                                    outline: 'none',
                                                },
                                            }}
                                            size="small"
                                            onClick={() =>
                                                handleScrollTypes('right')
                                            }
                                            aria-label="Mover tipos de cuenta a la derecha"
                                        >
                                            <ChevronRightRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                            />
                            {methods.formState.errors.type && (
                                <FormHelperText error>
                                    {
                                        methods.formState.errors.type
                                            .message as string
                                    }
                                </FormHelperText>
                            )}
                        </Box>
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
                        <FormButton
                            buttonVariant="contained"
                            ButtonType="submit"
                            disabled={isPending}
                            text={isPending ? 'Guardando...' : 'Crear Cuenta'}
                            buttonStyle={{ mt: 1, py: 1.1 }}
                        />
                    </Stack>
                </DialogContent>
            </Dialog>
        </FormProvider>
    );
};
