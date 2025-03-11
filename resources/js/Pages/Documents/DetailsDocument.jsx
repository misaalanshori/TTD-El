import { Autocomplete, Avatar, Box, Button, ButtonBase, ButtonGroup, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { ArrowForward, BookmarkBorder, Clear, MoreVert, Save, SaveAlt, Search, Warning } from "@mui/icons-material";
import { useState } from "react";
import MenuButton from "@/Components/MenuButton";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useMemo } from "react";
import signDocument from "@/Utils/signDocument";

export default function DetailsDocument({ surat, kategori }) {
    const suratData = useMemo(() => ({
        ...surat,
        signature: surat.signature.map(v => ({
            ...v,
            jabatan: v.jabatan_ref || { jabatan: v.jabatan, nip: v.nip, user: { name: v.nama } }
        }))
    }), [surat])

    const auth = usePage().props.auth
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [isEditingKategori, setIsEditingKategori] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const formattedDate = new Date(suratData.created_at).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const missingSignedDocument = !suratData.file_edited && suratData.state?.state == 'approved';

    const isCreator = surat.user_id == auth.user.id;
    
    const handleSave = () => {
        setIsLoading(true);
        router.patch(
            route("updateDocumentKategori", {surat: suratData.id}),
            {kategori_id: selectedKategori?.id},
            {
                onFinish: () => {
                    setIsEditingKategori(false);
                    setIsLoading(false);
                },
                onError: (e) => {
                    console.log("err", e)
                    enqueueSnackbar("Terjadi Kesalahan", { variant: 'error', autoHideDuration: 5000 });
                },
                onSuccess: () => {
                    enqueueSnackbar("Kategori berhasil diperbarui", { variant: 'success', autoHideDuration: 5000 });
                }
            }
        );
    }

    const handleSignDocument = () => {
        signDocument(suratData, {
            onSuccess: () => {
                enqueueSnackbar("Dokumen bertandatangan berhasil dibuat", { variant: 'success', autoHideDuration: 5000 });
            },
            onError: (e) => {
                console.log("err", e)
                enqueueSnackbar("Terjadi Kesalahan", { variant: 'error', autoHideDuration: 5000 });
            }
        })
    }

    useEffect(() => {
        suratData.kategori && setSelectedKategori({
            id: suratData.kategori.id,
            label: suratData.kategori.kategori,
        })
    }, [surat])

    
    return (
        <MainLayout>
            <Head title={suratData.judul_surat} />
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h5">{suratData.judul_surat}</Typography>
                        <Stack sx={{ width:{ xs: "100%", md: "auto" }, justifyContent: { xs: "center ", md: "space-between" }, flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }} gap={1}>
                            <Paper sx={{ bgcolor: suratData.file_edited ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                <Typography sx={{ textWrap: "nowrap" }} align="center">{suratData.file_edited ? "Sudah Ditandatangan" : "Belum Ditandatangan"}</Typography>
                            </Paper>
                            <MenuButton button={<Button sx={{ textWrap: "nowrap", px: 4, width: "100%" }} variant="contained" color={missingSignedDocument ? "warning" : "primary"} endIcon={missingSignedDocument ? <Warning/> : <SaveAlt />}>Unduh Dokumen</Button>}>
                                <MenuItem component="a" href={`/${suratData.file_asli}`} download >Unduh Dokumen Asli</MenuItem>
                                {
                                    suratData.file_edited ?
                                        <MenuItem component="a" href={`/${suratData.file_edited}`} download >Unduh Dokumen Tertandatangan</MenuItem> :
                                        suratData.state?.state == "approved" ?
                                            <MenuItem sx={{fontWeight: "bold"}} onClick={handleSignDocument}>Buat PDF Bertanda tangan</MenuItem> : null
                                }
                            </MenuButton>
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={2}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            <Stack sx={{ width: "100%", alignItems: "stretch"}} gap={1}>
                                <Box>
                                    <Typography variant="subtitle2">Nomor Surat</Typography>
                                    <Typography variant="body1">{suratData.nomor_surat}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Deskripsi</Typography>
                                    <Typography variant="body1">{suratData.keterangan}</Typography>
                                </Box>
                                <Box>
                                    <Stack sx={{ alignItems: "center" }} direction="row" gap={0.5}>
                                        <Typography variant="subtitle2">Kategori</Typography>
                                        {!isEditingKategori && isCreator ?
                                            <ButtonBase sx={{ borderRadius: "8px", px: "2px" }} onClick={() => setIsEditingKategori(true)}>
                                                <Typography variant="caption" sx={{ color: "GrayText" }}>(Edit)</Typography>
                                            </ButtonBase> : null
                                        }
                                    </Stack>

                                    {!isEditingKategori ?
                                        <Typography variant="body1">{suratData.kategori?.kategori || "Tidak Berkategori"}</Typography> :
                                        <Stack sx={{ width: "100%", alignItems: "center", flexDirection: { xs: "column", md: "row" }, mt: "4px" }} gap={1}>
                                            <Autocomplete
                                                fullWidth
                                                disablePortal
                                                value={selectedKategori}
                                                onChange={(e, v) => setSelectedKategori(v)}
                                                options={kategori}
                                                sx={{ flexGrow: 1 }}
                                                renderInput={(params) => <TextField  {...params} label="Kategori (Opsional)" />}
                                            />
                                            <Button disabled={isLoading} variant="contained" onClick={handleSave}>Simpan</Button>
                                        </Stack>
                                    }
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Diajukan Oleh</Typography>
                                    <Typography variant="body1">{suratData.pengaju}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Ditambahkan Oleh</Typography>
                                    <Typography variant="body1">{suratData.user.name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Tanggal Pengajuan</Typography>
                                    <Typography variant="body1">{formattedDate}</Typography>
                                </Box>
                            </Stack>


                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                            <List sx={{ width: "100%" }}>
                                {suratData.signature.map((v, i) =>
                                    <ListItem key={v.id} divider>
                                        <ListItemAvatar><Avatar /></ListItemAvatar>
                                        <ListItemText primary={v.jabatan.user.name} secondary={<span>{`${v.jabatan.jabatan} (${v.jabatan.nip})`} {v.approval?.message && v.approval?.status === "rejected" ? (<><br/>{`Alasan Penolakan: ${v.approval?.message}`}</>) : null}</span>} />
                                        {
                                            v.approval ? 
                                                <Paper sx={{ px: 1, py: 0.2, borderRadius: 16, textTransform: "capitalize", color: "white", bgcolor: { approved: theme.palette.success.light, rejected: theme.palette.error.light, pending: theme.palette.primary.light }[v.approval.status] }}>
                                                    <Typography sx={{ fontSize: 12, textWrap: "nowrap" }}>{v.approval.status}</Typography>
                                                </Paper> : null
                                        }
                                    </ListItem>
                                )}
                            </List>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </MainLayout>
    )
}