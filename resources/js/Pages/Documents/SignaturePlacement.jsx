import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, ArrowBack, Check, ChevronLeft, ChevronRight, Clear, GroupAdd, TypeSpecimen } from "@mui/icons-material";
import { AppBar, Avatar, Box, Button, Container, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import PDFEditor from "./partials/PDFEditor";
import { error, PDFDocument } from "pdf-lib";
import { router } from "@inertiajs/react";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";

async function generatePDF(pdfBlob, objects) {
    const pdfBytes = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfPages = pdfDoc.getPages();
    await Promise.all(objects.map(async (v) => {
        const page = pdfPages[v.page-1];
        const imgBytes = await v.image.arrayBuffer();
        const img = await pdfDoc.embedPng(imgBytes);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        page.drawImage(img, {
            x: v.x * pageWidth,
            y: pageHeight - (v.y * pageHeight) - (v.width * pageWidth),
            width: v.width * pageWidth,
            height: v.width * pageWidth,
        })
    }))
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    return modifiedPdfBlob;
}

export default function SignaturePlacement({ surat }) {
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const [pdfBlob, setPdfBlob] = useState(null);
    const [qrBlobs, setQrBlobs] = useState(null);
    const [objects, setObjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const addQR = (data) => {
        setObjects(
            [
                ...objects,
                {
                    id: data.pivot.id,
                    width: 0.1,
                    x: 0.5,
                    y: 0.5,
                    page: currentPage,
                    label: data.user.name,
                    image: qrBlobs[data.pivot.id],
                    data: data
                }
            ]
        )
    }

    const removeQR = (id) => {
        setObjects(objects.filter(o => o.id !== id))
    }

    const checkQR = (id) => {
        return objects.some(o => o.id === id)
    }

    const loadFiles = async () => {
        // Fetch PDF
        const pdfRes = await fetch(`/${surat.file_asli}`);
        const blob = await pdfRes.blob()
        setPdfBlob(blob);

        const imgblobs = {}
        await Promise.all(surat.jabatan.map(async (v) => {
            const resp = await fetch(`/${v.pivot.qrcode_file}`);
            imgblobs[v.pivot.id] = await resp.blob();
        }))
        setQrBlobs(imgblobs)
    }

    const changePage = (change)=>{
        const newCurrentPage = currentPage + change;
        if (newCurrentPage < 1) return;
        if (newCurrentPage > totalPage) return;
        setCurrentPage(newCurrentPage);
    }

    const handleSave = async () => {
        if (objects.length != surat.jabatan.length) {
            enqueueSnackbar(`Pastikan semua tandatangan telah ditempatkan!`, { variant: 'error', autoHideDuration: 5000 });
            return;
        }
        try {
            await confirm({ title: "Simpan Tanda Tangan?", description: "Dokumen yang sudah ditandatangani tidak dapat dimodifikasi kembali!" })
        } catch {
            return;
        }
        const newPDF = await generatePDF(pdfBlob, objects);
        router.post(route("saveSignedDocument", {surat: surat.id, _method: "patch"}), {file_edited: newPDF}, {
            onError: console.error,
        });
    }

    const handleExit = async () => {
        if (objects.length > 0) {
            try {
                await confirm({ title: "Keluar?", description: "Tanda tangan anda tidak tersimpan!" })
            } catch {
                return;
            }
        }
        window.history.back()
    }

    useEffect(() => {
        loadFiles();    
    }, [surat])


    



    return (
        <MainLayout
            title="Penandatanganan Elektronik"
            sidebarContents={
                <List sx={{ width: "100%" }}>
                    <ListItem>
                        <Typography sx={{m:"auto"}}>{objects.length}/{surat.jabatan.length} Tandatangan</Typography>
                    </ListItem>
                    {surat.jabatan.map(v => (
                        <ListItem key={v.pivot.id} divider>
                            <ListItemAvatar><Avatar /></ListItemAvatar>
                            <ListItemText primary={v.user.name} secondary={v.jabatan} />
                            {
                                checkQR(v.pivot.id) ?
                                    <ListItemButton sx={{ flexGrow: 0 }} onClick={() => removeQR(v.pivot.id)}><Check /></ListItemButton> :
                                    <ListItemButton sx={{ flexGrow: 0 }} onClick={() => addQR(v)}><Add /></ListItemButton>

                            }
                        </ListItem>
                    ))}
                </List>
            }
            sidebarIcon={<GroupAdd />}
            appbarActions={
                <Stack direction="row" gap={1}>
                    <Button sx={{ fontSize: { xs: 0, sm: "14px" } }} color="error" variant="contained" startIcon={<ArrowBack />} onClick={handleExit}>Keluar</Button>
                    <Button sx={{ fontSize: { xs: 0, sm: "14px" } }} color="success" variant="contained" startIcon={<Check />} onClick={handleSave}>Simpan</Button>
                </Stack>
            }
        >
            <AppBar sx={{ bgcolor: "primary.dark", position: "sticky", zIndex: 0 }}>
                <Stack sx={{mx: "auto", my:0.2, alignItems: "center"}} direction="row">
                    <IconButton sx={{ color: "primary.contrastText" }} onClick={() => changePage(-1)}><ChevronLeft/></IconButton>
                    <Typography>{currentPage}/{totalPage}</Typography>
                    <IconButton sx={{ color: "primary.contrastText" }} onClick={() => changePage(1)}><ChevronRight/></IconButton>
                </Stack>
            </AppBar>
            <Stack alignItems="center">
                {
                    pdfBlob ?
                        <Box sx={{ width: "fit-content" }}>
                            <PDFEditor
                                pdf={pdfBlob}
                                page={currentPage}
                                onPageChange={setCurrentPage}
                                onLoadedPdfChange={(pdf) => setTotalPage(pdf?.numPages ?? 1)}
                                objects={objects}
                                onObjectsChange={setObjects}
                            />
                        </Box> : null
                }
            </Stack>
        </MainLayout>
    )
}