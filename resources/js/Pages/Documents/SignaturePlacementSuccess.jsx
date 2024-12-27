import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowBack, Check, Checklist, SaveAlt } from "@mui/icons-material";
import { Box, Button, Card, Container, Stack, Typography } from "@mui/material";

export default function SignaturePlacementSuccess({ surat }) {
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
                                Tanda Tangan Dokumen Selesai
                            </Typography>
                        </Stack>
                        <Button variant="contained" startIcon={<SaveAlt/>} component="a" href={`/${surat.file_edited}`} download>Unduh Dokumen</Button>
                        <Button startIcon={<ArrowBack/>} LinkComponent={Link} href={route("submitDocument")}>Kembali ke halaman utama</Button>
                    </Stack>
                </Card>
            </Stack>
        </MainLayout>
    )
} 