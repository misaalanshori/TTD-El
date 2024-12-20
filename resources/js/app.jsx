import '../css/app.css';

import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { pdfjs } from 'react-pdf';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { Button, createTheme, CssBaseline } from '@mui/material';
import { ConfirmProvider } from 'material-ui-confirm';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';


createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
        root.render(
            <>
                <CssBaseline />
                <ConfirmProvider>
                    <SnackbarProvider
                        action={(snackbarId) => (
                            <Button color='white' onClick={() => closeSnackbar(snackbarId)}>
                                OK
                            </Button>
                        )}
                    >
                        <App {...props} />
                    </SnackbarProvider>
                </ConfirmProvider>

            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
