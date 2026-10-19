import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
    Box,
    Button,
    Card,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CreateTransactionDialog } from '../components/CreateTransactionDialog';
import { useAccounts } from '../hooks/useAccounts';
import {
    useCreateTransaction,
    useTransactionCategories,
    useTransactions,
} from '../hooks/useTransactions';
import type {
    CreateTransactionFormValues,
    TransactionFilterType,
    TransactionFilters,
    TransactionItem,
} from '../types';

const formatTableDate = (value: string) => {
    if (!value) {
        return '-';
    }

    return value.slice(0, 10);
};

const parseColombianAmountToNumber = (formattedValue: string): number | '' => {
    const cleanedValue = formattedValue
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '');

    if (cleanedValue === '') {
        return '';
    }

    const parsedValue = Number(cleanedValue);

    return Number.isNaN(parsedValue) ? '' : parsedValue;
};

const formatTransactionAmount = (transaction: TransactionItem) => {
    const numericAmount = Number(transaction.amount || 0);
    const isIncome = transaction.category?.type === 'income';
    const signedAmount = isIncome ? numericAmount : -numericAmount;

    return signedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'USD',
    });
};

export const Transactions = () => {
    const { t } = useTranslation();

    const [openDialog, setOpenDialog] = useState(false);
    const [filters, setFilters] = useState<TransactionFilters>({
        search: '',
        categoryId: '',
        date: '',
        type: 'all',
    });

    const methods = useForm<CreateTransactionFormValues>({
        defaultValues: {
            category_type: 'expense',
            amount: '',
            category_id: '',
            date: new Date().toISOString().slice(0, 10),
            description: '',
        },
    });

    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useTransactionCategories();
    const { data: transactions = [], isLoading } = useTransactions(filters);
    const createTransaction = useCreateTransaction();

    const accountIdForCreation = accounts[0]?.id;

    const uniqueDateOptions = useMemo(() => {
        const dateSet = new Set(transactions.map(transaction => formatTableDate(transaction.date)));

        return [...dateSet].sort((a, b) => b.localeCompare(a));
    }, [transactions]);

    const categoryFilterOptions = useMemo(
        () => categories.map(category => ({ value: String(category.id), label: category.name })),
        [categories]
    );

    const handleOpenDialog = () => setOpenDialog(true);

    const handleCloseDialog = () => {
        if (!createTransaction.isPending) {
            setOpenDialog(false);
        }
    };

    const handleCreateTransaction = (formData: CreateTransactionFormValues) => {
        if (!accountIdForCreation) {
            return;
        }

        const amount = parseColombianAmountToNumber(formData.amount);

        if (amount === '') {
            return;
        }

        createTransaction.mutate(
            {
                amount: String(amount),
                category_id: Number(formData.category_id),
                date: formData.date,
                description: formData.description,
                category_type: formData.category_type,
                account_id: accountIdForCreation,
            },
            {
                onSuccess: () => {
                    methods.reset({
                        category_type: 'expense',
                        amount: '',
                        category_id: '',
                        date: new Date().toISOString().slice(0, 10),
                        description: '',
                    });
                    setOpenDialog(false);
                },
            }
        );
    };

    return (
        <Box
            sx={{
                px: { xs: 2, md: 4 },
                py: 4,
                width: { md: '95%' },
                margin: '0 auto',
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'start', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Typography variant="h2">{t('transactions.page.title')}</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenDialog}
                    disabled={!accountIdForCreation}
                >
                    {t('transactions.page.addTransaction')}
                </Button>
            </Stack>

            {!accountIdForCreation && (
                <Typography color="warning.main" sx={{ mb: 2 }}>
                    {t('transactions.page.requiresAccount')}
                </Typography>
            )}

            <Card
                variant="outlined"
                sx={{
                    backgroundColor: 'transparent',
                    borderColor: 'divider',
                    p: 2,
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                >
                    <TextField
                        fullWidth
                        placeholder={t('transactions.filters.searchPlaceholder')}
                        value={filters.search}
                        onChange={event =>
                            setFilters(prev => ({
                                ...prev,
                                search: event.target.value,
                            }))
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="transactions-category-filter-label">
                            {t('transactions.filters.category')}
                        </InputLabel>
                        <Select
                            labelId="transactions-category-filter-label"
                            value={filters.categoryId}
                            label={t('transactions.filters.category')}
                            onChange={event =>
                                setFilters(prev => ({
                                    ...prev,
                                    categoryId: event.target.value,
                                }))
                            }
                        >
                            <MenuItem value="">{t('transactions.filters.allCategories')}</MenuItem>
                            {categoryFilterOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="transactions-date-filter-label">
                            {t('transactions.filters.date')}
                        </InputLabel>
                        <Select
                            labelId="transactions-date-filter-label"
                            value={filters.date}
                            label={t('transactions.filters.date')}
                            onChange={event =>
                                setFilters(prev => ({
                                    ...prev,
                                    date: event.target.value,
                                }))
                            }
                        >
                            <MenuItem value="">{t('transactions.filters.allDates')}</MenuItem>
                            {uniqueDateOptions.map(dateValue => (
                                <MenuItem key={dateValue} value={dateValue}>
                                    {dateValue}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="transactions-type-filter-label">
                            {t('transactions.filters.type')}
                        </InputLabel>
                        <Select
                            labelId="transactions-type-filter-label"
                            value={filters.type}
                            label={t('transactions.filters.type')}
                            onChange={event =>
                                setFilters(prev => ({
                                    ...prev,
                                    type: event.target.value as TransactionFilterType,
                                }))
                            }
                        >
                            <MenuItem value="all">{t('transactions.filters.allTypes')}</MenuItem>
                            <MenuItem value="expense">{t('transactions.types.expense')}</MenuItem>
                            <MenuItem value="income">{t('transactions.types.income')}</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {isLoading ? (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        {t('transactions.page.loading')}
                    </Typography>
                ) : transactions.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        {t('transactions.page.empty')}
                    </Typography>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('transactions.table.date')}</TableCell>
                                    <TableCell>{t('transactions.table.description')}</TableCell>
                                    <TableCell align="right">
                                        {t('transactions.table.amount')}
                                    </TableCell>
                                    <TableCell>{t('transactions.table.category')}</TableCell>
                                    <TableCell>{t('transactions.table.account')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map(transaction => {
                                    const isIncome = transaction.category?.type === 'income';

                                    return (
                                        <TableRow key={transaction.id} hover>
                                            <TableCell>{formatTableDate(transaction.date)}</TableCell>
                                            <TableCell>{transaction.description || '-'}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color: isIncome ? 'success.main' : 'error.main',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {formatTransactionAmount(transaction)}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.category?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.account?.name || '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </Card>

            <CreateTransactionDialog
                open={openDialog}
                handleClose={handleCloseDialog}
                methods={methods}
                categories={categories}
                isPending={createTransaction.isPending}
                handleSubmit={handleCreateTransaction}
            />
        </Box>
    );
};
