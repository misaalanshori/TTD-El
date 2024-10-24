import { Autocomplete, Avatar, Box, Button, Card, CardContent, CircularProgress, Collapse, Container, Fade, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout/MainLayout";
import { Add, ArrowForward, ArrowLeft, Clear, FileUpload, TurnedInNot, Upload } from "@mui/icons-material";
import FilePickerWrapper from "../../components/FilePickerWrapper";
import { useEffect, useState } from "react";
import { filesize } from "filesize";
import { Document, Page } from "react-pdf";
import { useSnackbar } from "notistack";
import { TransitionGroup } from "react-transition-group";


function UploadCard({ document, onDocumentChanged }) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
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
        <Card sx={{ maxWidth: "70vw", width: "400px", p: 2 }} elevation={2}>
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


export default function SubmitDocument() {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [formData, setFormdata] = useState(null)
    const [selectedSigner, setSelectedSigner] = useState(null);
    const [signers, setSigners] = useState([]);

    const signatureOptions = [
        { label: 'Adam Rafif Faqih', id: 1 },
        { label: 'Isa Insan Mulia', id: 2 },
        { label: 'Muhammad Isa Al Anshori', id: 3 },
        { label: 'Novian Anggis', id: 4 },
        { label: 'Rahma Sakti Rahardian', id: 5 },
        { label: 'Rahmat Yasirandi', id: 6 },
        { label: 'Sheina Fathur', id: 7 },
    ];

    const handleAddSigner = () => {
        if (!selectedSigner) return;
        if (signers.some(v => v.id === selectedSigner.id)) return;
        setSigners([...signers, selectedSigner]);
        setSelectedSigner(null);
    }

    const handleRemoveSigner = (id) => {
        setSigners(signers.filter(v => v.id != id));
    }

    const handleUpdateForm = (e) => {
        setFormdata({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const resetForm = () => {
        setFormdata(
            {
                namaPengaju: "",
                judulDokumen: "",
                nomorSurat: "",
                keterangan: "",
            }
        );
    }

    useEffect(() => {
        resetForm();
    }, [])

    return (
        <MainLayout>
            <Stack sx={{ minHeight: "100%", justifyContent: "center", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <UploadCard document={selectedDocument} onDocumentChanged={setSelectedDocument} />
                <Fade in={selectedDocument} unmountOnExit>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            <TextField fullWidth value={formData?.namaPengaju || ""} name="namaPengaju" onChange={handleUpdateForm} label="Nama Pengaju" />
                            <TextField fullWidth value={formData?.judulDokumen || ""} name="judulDokumen" onChange={handleUpdateForm} label="Judul Dokumen" />
                            <TextField fullWidth value={formData?.nomorSurat || ""} name="nomorSurat" onChange={handleUpdateForm} label="Nomor Surat" />
                            <TextField fullWidth value={formData?.keterangan || ""} name="keterangan" onChange={handleUpdateForm} multiline label="Keterangan" />

                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                            <List sx={{ width: "100%" }}>
                                <TransitionGroup>
                                    <ListItem divider>
                                        <ListItemAvatar><Avatar /></ListItemAvatar>
                                        <ListItemText>Isa Mulia Insan</ListItemText>
                                    </ListItem>
                                    {signers.map((v, i) =>
                                        <Collapse key={v.label}>
                                            <ListItem divider>
                                                <ListItemAvatar><Avatar /></ListItemAvatar>
                                                <ListItemText>{v.label}</ListItemText>
                                                <ListItemButton sx={{ flexGrow: 0 }} onClick={() => handleRemoveSigner(v.id)}><Clear /></ListItemButton>
                                            </ListItem>
                                        </Collapse>

                                    )}
                                </TransitionGroup>

                            </List>
                            <Stack sx={{ width: "100%", alignItems: "center" }} direction="row" gap={1}>
                                <Autocomplete
                                    disablePortal
                                    value={selectedSigner}
                                    onChange={(e, v) => setSelectedSigner(v)}
                                    options={signatureOptions}
                                    sx={{ flexGrow: 1 }}
                                    renderInput={(params) => <TextField  {...params} label="Penandatangan" />}
                                />
                                <Button variant="contained" startIcon={<Add />} onClick={handleAddSigner}>Tambah</Button>
                            </Stack>
                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "end", py: 2 }} direction="row-reverse" gap={2}>
                            <Button variant="contained" startIcon={<ArrowForward />}> Lanjutkan</Button>
                            <Button variant="outlined" startIcon={<TurnedInNot />}> Simpan</Button>
                        </Stack>
                    </Stack>
                </Fade>
            </Stack>
        </MainLayout>
    )
}