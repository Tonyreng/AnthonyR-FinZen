import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: 'rgb(17, 115, 212)', // azul principal
            light: '#2563EB', // hover
            dark: '#1E3A8A', // variantes más oscuras
            contrastText: '#FFFFFF',
        },
        background: {
            default: 'rgb(16, 25, 34)', // fondo general
            paper: '#111827', // cards, modals, inputs
        },
        text: {
            primary: '#F9FAFB', // texto principal
            secondary: '#9CA3AF', // texto sutil
        },
        divider: '#1F2937',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem' },
        h2: { fontWeight: 600, fontSize: '2rem' },
        body1: { color: '#E5E7EB' },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 10, // bordes redondeados
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#111827',
                        '& fieldset': { borderColor: '#1F2937' },
                        '&:hover fieldset': { borderColor: '#2563EB' },
                        '&.Mui-focused fieldset': { borderColor: '#1D4ED8' },
                    },
                    '& input': { color: '#F9FAFB' },
                    '& label': { color: '#9CA3AF' },
                },
            },
        },
    },
});
