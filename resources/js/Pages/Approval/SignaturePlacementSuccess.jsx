import MainLayout from "@/Layouts/MainLayout/MainLayout";
import signDocument from "@/Utils/signDocument";
import { Head, Link } from "@inertiajs/react";
import { ArrowBack, Check, Checklist, PublishedWithChanges, SaveAlt } from "@mui/icons-material";
import { Box, Button, Card, Container, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

export default function SignaturePlacementSuccess({ surat }) {
    const { enqueueSnackbar } = useSnackbar();
    const [isGenerating, setIsGenerating] = useState(false);
    const handleSignDocument = () => {
            setIsGenerating(true);
            signDocument(surat, {
                onSuccess: () => {
                    enqueueSnackbar("Dokumen bertandatangan berhasil dibuat", { variant: 'success', autoHideDuration: 5000 });
                },
                onError: (e) => {
                    console.log("err", e)
                    enqueueSnackbar("Terjadi Kesalahan", { variant: 'error', autoHideDuration: 5000 });
                },
                onFinish: (v) => {
                    setIsGenerating(false);
                },
            })
        }

    useEffect(() => {
        if (!surat.file_edited && surat.state.state === "approved") {
            handleSignDocument()
        }
    }, [surat])

    return (
        <MainLayout noSidebar>
            <Head title="Penandatanganan Berhasil!" />
            <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
                <Card sx={{ py: 1, px: 4 }} elevation={2}>
                    <Stack sx={{ alignItems: "center" }} gap={1}>
                        <Box sx={{ mb:1, p: 1, border: 2, borderColor: "lightgray", borderRadius: "16px" }}>
                            <Check sx={{ color: "gray", fontSize: "72px" }} />
                        </Box>
                        <Stack>
                            <Typography sx={{textAlign: "center", fontWeight: "bold"}}>
                                {surat.judul_surat}
                            </Typography>
                            <Typography sx={{textAlign: "center"}}>
                                Nomor Surat: {surat.nomor_surat}
                            </Typography>
                            <Typography sx={{textAlign: "center" }}>
                                Tanda tangan anda telah disimpan
                            </Typography>
                        </Stack>
                        <Button disabled={isGenerating} startIcon={isGenerating ? <PublishedWithChanges/> : <ArrowBack/>} LinkComponent={Link} href={route("detailsDocument", {id: surat.id})}>{isGenerating ? "Membuat Dokumen PDF..." : "Kembali Ke Dokumen"}</Button>
                    </Stack>
                </Card>
            </Stack>
        </MainLayout>
    )
} 