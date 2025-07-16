import { AutoAwesome } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useSnackbar } from "notistack"
import { useEffect, useRef, useState } from "react";

export default function LLMProcessingButton({ surat, onSuccess, preloadedData = null}) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [isLoading, setIsLoading] = useState(false);
    const latestSnackbarKey = useRef(null);

    const handleProcess = async () => {

        if (preloadedData) {
            console.log("AI Autofill: Using preloaded data");
            latestSnackbarKey.current = enqueueSnackbar("AI Autofill selesai!", { variant: 'success', autoHideDuration: 5000 });
            onSuccess(preloadedData);
            return;
        }

        setIsLoading(true)
        const eventSource = new EventSource(route('processDocument', { surat: surat.id }));

        eventSource.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);

            if (newMessage.message == "done") {
                eventSource.close();
                latestSnackbarKey.current = enqueueSnackbar("AI Autofill selesai!", { variant: 'success', autoHideDuration: null });
                onSuccess(newMessage.value);
                setIsLoading(false);
            } else if (newMessage.message == "error") {
                eventSource.close();
                latestSnackbarKey.current = enqueueSnackbar("AI Autofill: " + newMessage.value.error, { variant: 'error', autoHideDuration: 5000 });
                setIsLoading(false);
            } else {
                latestSnackbarKey.current = enqueueSnackbar("AI Autofill: " + newMessage.message, { variant: 'info', autoHideDuration: 2000 });
            }
            console.log("AI Autofill: ", newMessage);

        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            if (latestSnackbarKey.current) closeSnackbar(latestSnackbarKey.current);
            latestSnackbarKey.current = enqueueSnackbar("AI Autofill: Terjadi Kesalahan...", { variant: 'error', autoHideDuration: 5000 });
            eventSource.close();
            setIsLoading(false);
        };

        return () => {
            eventSource.close();
            setIsLoading(false);
        };

    }

    useEffect(() => {
        if (surat.created_at === surat.updated_at && !isLoading) {
            handleProcess();
        }
    }, [])

    return (
        <Fab sx={{ position: "fixed", bottom: "16px", right: "16px" }} disabled={isLoading} variant="extended" size="medium" color="secondary" onClick={handleProcess}>
            <AutoAwesome />
            {isLoading ? " AI Processing..." : " AI Autofill"}
        </Fab>
    )
}