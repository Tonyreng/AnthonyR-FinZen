import { AccountItem, AccountTypeValue } from '../types';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import WalletRoundedIcon from '@mui/icons-material/WalletRounded';
import CandlestickChartRoundedIcon from '@mui/icons-material/CandlestickChartRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { TFunction, i18n } from 'i18next';

export const accountTypeLabel: Record<
    AccountTypeValue,
    (t: TFunction) => string
> = {
    bank: t => t('accounts.types.bank'),
    cash: t => t('accounts.types.cash'),
    credit_card: t => t('accounts.types.credit_card'),
    savings: t => t('accounts.types.savings'),
    virtual_wallet: t => t('accounts.types.virtual_wallet'),
    investment: t => t('accounts.types.investment'),
    pension: t => t('accounts.types.pension'),
    other: t => t('accounts.types.other'),
};

export const getAccountIcon = (type: AccountTypeValue) => {
    switch (type) {
        case 'bank':
            return <AccountBalanceRoundedIcon fontSize="small" />;
        case 'savings':
            return <SavingsRoundedIcon fontSize="small" />;
        case 'credit_card':
            return <CreditCardRoundedIcon fontSize="small" />;
        case 'virtual_wallet':
            return <WalletRoundedIcon fontSize="small" />;
        case 'investment':
            return <CandlestickChartRoundedIcon fontSize="small" />;
        case 'pension':
            return <PaymentsRoundedIcon fontSize="small" />;
        case 'cash':
            return <AccountBalanceWalletRoundedIcon fontSize="small" />;
        default:
            return <AccountBalanceWalletRoundedIcon fontSize="small" />;
    }
};

type Props = {
    account: AccountItem;
    index: number;
    sortedAccounts: AccountItem[];
    t: TFunction;
    i18n: i18n;
};

export const renderAccountItem = ({
    account,
    index,
    sortedAccounts,
    t,
    i18n,
}: Props) => {
    const currencyLocale = i18n.language.startsWith('en') ? 'en-US' : 'es-CO';
    return (
        <Box key={account.id}>
            <ListItem
                sx={{
                    py: 2.5,
                    px: { xs: 2, md: 3 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 1.5,
                            backgroundColor: 'rgba(17,115,212,0.22)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {getAccountIcon(account.type)}
                    </Box>
                    <ListItemText
                        primary={
                            <Typography
                                variant="h6"
                                sx={{ fontSize: '1.45rem' }}
                            >
                                {account.name}
                            </Typography>
                        }
                        secondary={
                            <Typography color="text.secondary" variant="body2">
                                {accountTypeLabel[account.type](t)}
                            </Typography>
                        }
                    />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ${' '}
                    {parseFloat(account.balance).toLocaleString(
                        currencyLocale,
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }
                    )}
                </Typography>
            </ListItem>
            {index < sortedAccounts.length - 1 && <Divider />}
        </Box>
    );
};
