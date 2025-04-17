import { useState } from "react";
import UploadCard from "./partials/UploadCard";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Head, router } from "@inertiajs/react";
import { Box, Button, Fade, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

export default function DocumentUploadForm() {
    const { enqueueSnackbar } = useSnackbar();

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = () => {
        setLoading(true)
        const callbacks = {
            onError: (e) => {
                setErrors(e);
                setLoading(false)
                console.log("Errors:", e)
            },
            onSuccess: () => {
                enqueueSnackbar("Dokumen berhasil diunggah", { variant: 'success', autoHideDuration: 5000 });
                setLoading(false);
            }
        }
        router.post(route("createDocument"), { file_asli: selectedDocument }, callbacks)
    }

    return (
        <MainLayout>
            <Head title="Submit Dokumen" />
            <Stack sx={{ minHeight: "100%", justifyContent: "center", alignItems: "center", p: 2 }} direction="column" gap={1}>
                <Fade in={!loading} unmountOnExit>
                    <Box>
                    <UploadCard document={selectedDocument} onDocumentChanged={setSelectedDocument} />
                    </Box>
                </Fade>
                <Fade in={!!selectedDocument}>
                    <Button disabled={loading} sx={{width: "250px"}} variant="contained" onClick={handleUpload}>{loading ? "Mengunggah..." : "Unggah Dokumen"}</Button>
                </Fade>
            </Stack>
        </MainLayout>
    )
}