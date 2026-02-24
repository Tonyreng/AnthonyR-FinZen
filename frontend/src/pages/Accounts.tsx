import {
    Box,
    Button,
    Card,
    Divider,
    List,
    Stack,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useMemo, useState } from 'react';
import { useAccounts, useCreateAccount } from '../hooks/useAccounts';
import { AccountItem } from '../types';
import { renderAccountItem } from '../components/RenderAccountItem';
import { useForm } from 'react-hook-form';
import { CreateAccountDialog } from '../components/CreateAccountDialog';
import { useTranslation } from 'react-i18next';

export const Accounts = () => {
    const { t, i18n } = useTranslation();

    const methods = useForm<AccountItem>({
        defaultValues: {
            id: 1,
            user_id: 1,
            name: '',
            type: 'bank',
            balance: '0',
            created_at: 'today,',
        },
    });

    const parseColombianAmountToNumber = (
        formattedValue: string
    ): number | '' => {
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

    const { data: accounts, isLoading } = useAccounts();

    const createAccount = useCreateAccount({ methods });

    const [open, setOpen] = useState(false);

    const sortedAccounts = useMemo(
        () => (accounts ? [...accounts] : []),
        [accounts]
    );

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        if (!createAccount.isPending) {
            setOpen(false);
        }
    };

    const handleCreateAccount = (data: AccountItem) => {
        data.balance = parseColombianAmountToNumber(data.balance).toString();

        createAccount.mutate(data);
        setOpen(false);
    };

    return (
        <Box
            sx={{
                px: { xs: 2, md: 4 },
                py: 4,
                width: { md: '80%' },
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
                <Typography variant="h2">{t('accounts.page.title')}</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpen}
                >
                    {t('accounts.page.addAccount')}
                </Button>
            </Stack>

            <Card
                variant="outlined"
                sx={{
                    backgroundColor: 'transparent',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
                    <Typography variant="h4">
                        {t('accounts.page.listTitle')}
                    </Typography>
                </Box>
                <Divider />

                {isLoading ? (
                    <Typography sx={{ px: 3, py: 4 }} color="text.secondary">
                        {t('accounts.page.loading')}
                    </Typography>
                ) : sortedAccounts.length === 0 ? (
                    <Typography sx={{ px: 3, py: 4 }} color="text.secondary">
                        {t('accounts.page.empty')}
                    </Typography>
                ) : (
                    <List disablePadding>
                        {sortedAccounts.map((account, index) =>
                            renderAccountItem({
                                account,
                                index,
                                sortedAccounts,
                                t,
                                i18n,
                            })
                        )}
                    </List>
                )}
            </Card>

            <CreateAccountDialog
                open={open}
                handleClose={handleClose}
                isPending={createAccount.isPending}
                methods={methods}
                handleSubmit={handleCreateAccount}
            />
        </Box>
    );
};
