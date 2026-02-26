import {
    AppBar,
    Avatar,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MouseEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { logoutService } from '../services/auth.services';

const protectedNavItems = [
    { key: 'overview', to: '/dashboard' },
    { key: 'accounts', to: '/accounts' },
    { key: 'transactions', to: '/transactions' },
    { key: 'subscriptions', to: '/' },
    { key: 'debts', to: '/' },
    { key: 'reports', to: '/' },
];

export const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const { isAuthenticated } = store;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isPublicAuthPage =
        location.pathname === '/login' || location.pathname === '/signup';

    const publicCta = useMemo(() => {
        if (location.pathname === '/signup') {
            return {
                helper: t('navbar.publicCta.alreadyHaveAccount'),
                actionLabel: t('navbar.publicCta.logIn'),
                actionTo: '/login',
            };
        }

        return {
            helper: t('navbar.publicCta.dontHaveAccount'),
            actionLabel: t('navbar.publicCta.signUp'),
            actionTo: '/signup',
        };
    }, [location.pathname, t]);

    const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleCloseMenu();
        await logoutService();
        window.__ACCESS_TOKEN__ = undefined;
        dispatch({ type: 'LOGOUT' });
        navigate('/login', { replace: true });
    };

    const userInitial = store.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

    const isActiveNavItem = (to: string) => {
        return location.pathname === to;
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
            }}
        >
            <Toolbar
                sx={{
                    minHeight: 64,
                    px: { xs: 2, md: 3 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Box
                        component={RouterLink}
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            textDecoration: 'none',
                            color: 'text.primary',
                        }}
                    >
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                backgroundColor: 'primary.main',
                                transform: 'rotate(45deg)',
                                borderRadius: '2px',
                                boxShadow: '0 0 0 2px rgba(17,115,212,0.2)',
                            }}
                        />
                        <Typography sx={{ fontWeight: 700 }}>FinZen</Typography>
                    </Box>
                </Box>
                {isAuthenticated ? (
                    <>
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                flex: 1,
                            }}
                        >
                            {protectedNavItems.map(item => (
                                <Button
                                    key={item.key}
                                    component={RouterLink}
                                    to={item.to}
                                    sx={{
                                        fontWeight: 500,
                                        px: 1.5,
                                        minWidth: 'auto',
                                        backgroundColor: isActiveNavItem(
                                            item.to
                                        )
                                            ? 'rgba(17, 115, 212, 0.25)'
                                            : 'transparent',
                                        color: isActiveNavItem(item.to)
                                            ? 'primary.main'
                                            : 'text.secondary',
                                        '&:hover': {
                                            backgroundColor:
                                                'rgba(17, 115, 212, 0.12)',
                                        },
                                    }}
                                >
                                    {t(`navbar.navItems.${item.key}`)}
                                </Button>
                            ))}
                        </Box>
                        <Box
                            sx={{
                                gap: 0.5,
                                flex: 1,
                                justifyContent: 'flex-end',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <IconButton sx={{ mr: 1 }}>
                                <NotificationsNoneRoundedIcon fontSize="small" />
                            </IconButton>

                            <Button
                                onClick={handleOpenMenu}
                                sx={{
                                    p: 0,
                                    minWidth: 0,
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    ':focus': { outline: 'none' },
                                    ':hover': {
                                        backgroundColor: 'transparent',
                                    },
                                }}
                                endIcon={<KeyboardArrowDownRoundedIcon />}
                            >
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        bgcolor: 'primary.main',
                                        fontSize: 14,
                                    }}
                                >
                                    {userInitial}
                                </Avatar>
                            </Button>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleCloseMenu}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={handleCloseMenu}>
                                    {t('navbar.menu.settings')}
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    {t('navbar.menu.logout')}
                                </MenuItem>
                            </Menu>
                        </Box>
                    </>
                ) : (
                    <>
                        {isPublicAuthPage && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: { xs: 'none', sm: 'block' },
                                    }}
                                >
                                    {publicCta.helper}
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to={publicCta.actionTo}
                                    variant="text"
                                    sx={{
                                        fontWeight: 700,
                                        px: 1,
                                        minWidth: 'auto',
                                    }}
                                >
                                    {publicCta.actionLabel}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};
