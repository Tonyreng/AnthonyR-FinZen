import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
    Box,
    ButtonBase,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
    CreateTransactionFormValues,
    TransactionCategoryItem,
    CategoryTypeValue,
} from '../types';
import FormButton from './FormButton';
import FormInput from './FormInput';

type Props = {
    open: boolean;
    handleClose: () => void;
    methods: UseFormReturn<CreateTransactionFormValues>;
    categories: TransactionCategoryItem[];
    isPending?: boolean;
    handleSubmit: (data: CreateTransactionFormValues) => void;
};

const categoryTypeOptions: CategoryTypeValue[] = ['expense', 'income'];

export const CreateTransactionDialog = ({
    open,
    handleClose,
    methods,
    categories,
    isPending,
    handleSubmit,
}: Props) => {
    const { t } = useTranslation();

    const selectedType = methods.watch('category_type');
    const selectedCategoryId = methods.watch('category_id');

    const filteredCategories = useMemo(
        () => categories.filter(category => category.type === selectedType),
        [categories, selectedType]
    );

    const categoryOptions = useMemo(
        () =>
            filteredCategories.reduce<Record<string, string>>((acc, category) => {
                acc[String(category.id)] = category.name;
                return acc;
            }, {}),
        [filteredCategories]
    );

    useEffect(() => {
        const hasSelectedCategory = filteredCategories.some(
            category => String(category.id) === selectedCategoryId
        );

        if (!hasSelectedCategory) {
            methods.setValue('category_id', '');
        }
    }, [filteredCategories, methods, selectedCategoryId]);

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
                    sx: { borderRadius: 2 },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5">
                            {t('transactions.dialog.title')}
                        </Typography>
                        <IconButton
                            onClick={handleClose}
                            disabled={isPending}
                            size="small"
                            aria-label={t('transactions.dialog.aria.closeDialog')}
                        >
                            <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box
                            sx={{
                                p: 0.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: 0.5,
                            }}
                        >
                            {categoryTypeOptions.map(typeOption => {
                                const isSelected = selectedType === typeOption;

                                return (
                                    <ButtonBase
                                        key={typeOption}
                                        onClick={() => methods.setValue('category_type', typeOption)}
                                        sx={{
                                            borderRadius: 1.5,
                                            py: 1,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: isSelected ? 'text.primary' : 'text.secondary',
                                            backgroundColor: isSelected
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'transparent',
                                        }}
                                    >
                                        {t(`transactions.types.${typeOption}`)}
                                    </ButtonBase>
                                );
                            })}
                        </Box>

                        <FormInput
                            name="amount"
                            type="number"
                            label={t('transactions.dialog.fields.amount')}
                            rules={{
                                required: t('transactions.dialog.validation.amountRequired'),
                            }}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <FormInput
                                name="category_id"
                                type="select"
                                label={t('transactions.dialog.fields.category')}
                                options={categoryOptions}
                                rules={{
                                    required: t('transactions.dialog.validation.categoryRequired'),
                                }}
                                styleInput={{ flex: 1 }}
                            />

                            <FormInput
                                name="date"
                                type="date"
                                label={t('transactions.dialog.fields.date')}
                                rules={{
                                    required: t('transactions.dialog.validation.dateRequired'),
                                }}
                                styleInput={{ flex: 1 }}
                            />
                        </Stack>

                        <FormInput
                            name="description"
                            type="textfield"
                            label={t('transactions.dialog.fields.description')}
                            rules={{
                                required: t('transactions.dialog.validation.descriptionRequired'),
                                minLength: {
                                    value: 3,
                                    message: t('transactions.dialog.validation.descriptionMinLength'),
                                },
                            }}
                        />

                        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 1 }}>
                            <FormButton
                                text={t('common.cancel')}
                                onClick={handleClose}
                                disabled={isPending}
                                buttonVariant="outlined"
                            />
                            <FormButton
                                text={
                                    isPending
                                        ? t('transactions.dialog.actions.creating')
                                        : t('transactions.dialog.actions.create')
                                }
                                ButtonType="submit"
                                disabled={isPending}
                                buttonVariant="contained"
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </FormProvider>
    );
};
