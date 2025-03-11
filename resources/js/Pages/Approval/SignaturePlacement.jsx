import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, ArrowBack, Check, ChevronLeft, ChevronRight, Clear, GroupAdd, TypeSpecimen } from "@mui/icons-material";
import { AppBar, Avatar, Box, Button, Container, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import PDFEditor from "@/Components/PDFEditor";
import { Head, router, usePage } from "@inertiajs/react";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";

export default function SignaturePlacement({ surat }) {
    const auth = usePage().props.auth
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
                    id: data.id,
                    width: 0.1,
                    x: 0.5,
                    y: 0.5,
                    page: currentPage,
                    label: data.approval.user.name,
                    image: qrBlobs[data.id],
                    editable: true,
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
        await Promise.all(surat.signature.map(async (v) => {
            const resp = await fetch(`/${v.qrcode_file}`);
            imgblobs[v.id] = await resp.blob();
        }))
        setQrBlobs(imgblobs)

        const existingSignatures = surat.signature.filter(v => v.approval.status == "approved");
        setObjects(
            existingSignatures.map(v => {
                const signature_transform = JSON.parse(v.approval.signature_transform)
                return {
                    id: v.id,
                    width: signature_transform.width,
                    x: signature_transform.x,
                    y: signature_transform.y,
                    page:  signature_transform.page,
                    label: v.approval.user.name,
                    image: imgblobs[v.id],
                    editable: false,
                    data: v
                }
            }
        ))
    }

    const changePage = (change)=>{
        const newCurrentPage = currentPage + change;
        if (newCurrentPage < 1) return;
        if (newCurrentPage > totalPage) return;
        setCurrentPage(newCurrentPage);
    }

    const handleSave = async () => {
        const signatureObject = objects.find(o => o.data.approval.user.id == auth.user.id);
        if (!signatureObject) {
            enqueueSnackbar(`Pastikan semua tandatangan telah ditempatkan!`, { variant: 'error', autoHideDuration: 5000 });
            return;
        }
        try {
            await confirm({ title: "Simpan Tanda Tangan?", description: "Dokumen yang sudah ditandatangani tidak dapat dimodifikasi kembali!" })
        } catch {
            return;
        }
        router.post(route("approveDocument", {signature: signatureObject.id}), {signature_transform: {
            width: signatureObject.width,
            x: signatureObject.x,
            y: signatureObject.y,
            page: signatureObject.page
        }}, {
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
                    {surat.signature.filter(v => v.approval.user.id == auth.user.id).map(v => (
                        <ListItem key={v.id} divider>
                            <ListItemAvatar><Avatar /></ListItemAvatar>
                            <ListItemText primary={v.approval.user.name} secondary={v.jabatan_ref.jabatan} />
                            {
                                checkQR(v.id) ?
                                    <ListItemButton sx={{ flexGrow: 0 }} onClick={() => removeQR(v.id)}><Check /></ListItemButton> :
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
            <Head title="Penandatanganan"/>
            <AppBar sx={{ bgcolor: "primary.dark", position: "sticky", zIndex: 50 }}>
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