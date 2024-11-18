import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { SaveAlt } from "@mui/icons-material";
import { Avatar, Box, Button, Container, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Typography, useTheme } from "@mui/material";

export default function SignatureVerification({ info }) {
    const theme = useTheme();
    return (
        <MainLayout noSidebar>
            <Container sx={{ minHeight: "100%", p: 2 }}>
                <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h5">{info.surat.judul_surat}</Typography>
                        <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: { xs: "center ", md: "space-between" }, flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }} gap={1}>
                            <Paper sx={{ bgcolor: info.surat.file_edited ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                <Typography sx={{ textWrap: "nowrap" }} align="center">{info.surat.file_edited ? "Sudah Ditandatangan" : "Belum Ditandatangan"}</Typography>
                            </Paper>
                            <Button component="a" href={`/${info.surat.file_edited}`} download sx={{ textWrap: "nowrap", px: 4, ml: { xs: "", md: "auto" } }} variant="contained" endIcon={<SaveAlt />}>Unduh Dokumen</Button>
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                        <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                        <List sx={{ width: "100%" }}>
                            <ListItem divider>
                                <ListItemAvatar><Avatar /></ListItemAvatar>
                                <ListItemText primary={info.penandatangan.name} secondary={<span>{info.penandatangan.jabatan} ({info.penandatangan.nip})<br />{info.penandatangan.email}</span>} />
                            </ListItem>
                        </List>
                    </Stack>
                    <Stack sx={{ width: "100%", alignItems: "center" }} gap={2}>
                        <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                        <Stack sx={{ width: "100%", alignItems: "start" }} gap={1}>
                            <Box>
                                <Typography variant="subtitle2">Nomor Surat</Typography>
                                <Typography variant="body1">{info.surat.nomor_surat}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2">Nama Pengaju</Typography>
                                <Typography variant="body1">{info.surat.pengaju}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2">Keterangan</Typography>
                                <Typography variant="body1">{info.surat.keterangan}</Typography>
                            </Box>
                        </Stack>
                    </Stack>

                </Stack>
            </Container>
        </MainLayout>
    )
}