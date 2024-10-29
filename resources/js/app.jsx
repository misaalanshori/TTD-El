import '../css/app.css';
import './bootstrap';

import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { pdfjs } from 'react-pdf';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { Button, createTheme, CssBaseline } from '@mui/material';
import AuthContext from "@/Contexts/AuthContext";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <CssBaseline />
                <AuthContext.Provider value={props.initialPage.props.auth}>
                    <SnackbarProvider
                        action={(snackbarId) => (
                            <Button color='white' onClick={() => closeSnackbar(snackbarId)}>
                                OK
                            </Button>
                        )}
                    >
                        <App {...props} />
                    </SnackbarProvider>
                </AuthContext.Provider>

            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
