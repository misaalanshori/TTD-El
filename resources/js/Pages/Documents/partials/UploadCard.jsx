import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { FileUpload } from "@mui/icons-material";
import FilePickerWrapper from "@/Components/FilePickerWrapper";
import { useState } from "react";
import { filesize } from "filesize";
import { Document, Page } from "react-pdf";
import { useSnackbar } from "notistack";

export default function UploadCard({ document, onDocumentChanged }) {
    const { enqueueSnackbar } = useSnackbar()
    const [documentPageCount, setDocumentPageCount] = useState(0);

    const handleFileChanged = (file) => {
        if (!file) {
            onDocumentChanged(null);
            return;
        }
        if (file?.type !== "application/pdf") {
            enqueueSnackbar("Dokumen harus berupa PDF", { variant: 'error', autoHideDuration: 5000 });
            onDocumentChanged(null);
            return;
        }
        onDocumentChanged(file);
        console.log('Selected file:', file);
    };

    const handleDocumentLoaded = (pdf) => {
        setDocumentPageCount(pdf.numPages)
    }

    const handleDocumentError = (error) => {
        enqueueSnackbar("PDF yang dipilih tidak valid!", { variant: 'error', autoHideDuration: 5000 });
        console.log("PDF Load Error: ", error);
        handleFileChanged(null);
    }

    return (
        <Card sx={{ maxWidth: "85vw", width: "400px", p: 2 }} elevation={2}>
            <CardContent>
                <FilePickerWrapper disabled={document} onFileChanged={handleFileChanged}>
                    {document ?
                        <Stack sx={{ alignItems: "center" }} gap={2}>
                            <Stack sx={{ width: "100%" }} direction="row">
                                <Box sx={{ border: 1, borderRadius: "16px", borderColor: "lightgray", overflow: "clip", p: 1 }}>
                                    <Document
                                        file={document}
                                        loading={<CircularProgress />}
                                        onLoadError={handleDocumentError}
                                        onLoadSuccess={handleDocumentLoaded}
                                    >
                                        <Page
                                            pageNumber={1}
                                            width={100}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                            loading={<CircularProgress />}
                                            onLoadError={handleDocumentError} />
                                    </Document>
                                </Box>
                                <Typography sx={{ flexGrow: 1, px: 2, textOverflow: "ellipsis", overflow: "hidden" }}>
                                    {document?.name}<br />
                                    {documentPageCount} Halaman<br />
                                    {filesize(document.size, { standard: "jedec" })}
                                </Typography>
                            </Stack>
                            <Button variant="outlined" onClick={() => handleFileChanged(null)}>
                                Ubah File
                            </Button>
                        </Stack>
                        :
                        <Stack sx={{ alignItems: "center" }} gap={2}>
                            <Box sx={{ p: 1, border: 2, borderColor: "lightgray", borderRadius: "16px" }}>
                                <FileUpload sx={{ color: "gray", fontSize: "72px" }} />
                            </Box>
                            <Typography sx={{ width: "70%", px: 2 }} align="center">
                                Tarik file atau tekan untuk mengunggah dokumen (*.pdf)
                            </Typography>
                        </Stack>}
                </FilePickerWrapper>
            </CardContent>
        </Card>
    )

}
