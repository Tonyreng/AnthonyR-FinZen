import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1173d4', // azul principal
            light: '#1173d4cc', // hover
            dark: '#1E3A8A', // variantes más oscuras
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#101922', // fondo general
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
        body1: { color: '#ffffffff' },
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
                        backgroundColor: 'rgb(16, 25, 34)',
                        '& fieldset': { borderColor: '#153053ff' },
                        '&:hover fieldset': { borderColor: '#2563EB' },
                        '&.Mui-focused fieldset': { borderColor: '#436cddff' },
                    },
                    '& input': { color: '#ffffffff' },
                    '& label': { color: '#9CA3AF' },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& input': { height: '1em' },
                },
            },
        },
    },
});
