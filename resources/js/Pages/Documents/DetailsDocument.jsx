import { Autocomplete, Avatar, Box, Button, ButtonBase, ButtonGroup, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { ArrowForward, BookmarkBorder, Clear, MoreVert, Save, SaveAlt, Search } from "@mui/icons-material";
import { useState } from "react";
import MenuButton from "@/Components/MenuButton";
import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";

export default function DetailsDocument({ surat, kategori }) {
    const theme = useTheme();
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [isEditingKategori, setIsEditingKategori] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setIsLoading(true);
        router.patch(
            route("updateDocumentKategori", {surat: surat.id}),
            {kategori_id: selectedKategori?.id},
            {
                onFinish: () => {
                    setIsEditingKategori(false);
                    setIsLoading(false);
                }
            }
        );
    }

    useEffect(() => {
        surat.kategori && setSelectedKategori({
            id: surat.kategori.id,
            label: surat.kategori.kategori,
        })
    }, [surat])

    return (
        <MainLayout>
            <Head title={surat.judul_surat} />
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h5">{surat.judul_surat}</Typography>
                        <Stack sx={{ width:{ xs: "100%", md: "auto" }, justifyContent: { xs: "center ", md: "space-between" }, flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }} gap={1}>
                            <Paper sx={{ bgcolor: surat.file_edited ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                <Typography sx={{ textWrap: "nowrap" }} align="center">{surat.file_edited ? "Sudah Ditandatangan" : "Belum Ditandatangan"}</Typography>
                            </Paper>
                            <MenuButton button={<Button sx={{ textWrap: "nowrap", px: 4, width: "100%" }} variant="contained" endIcon={<SaveAlt />}>Unduh Dokumen</Button>}>
                                <MenuItem component="a" href={`/${surat.file_asli}`} download >Unduh Dokumen Asli</MenuItem>
                                <MenuItem component="a" href={`/${surat.file_edited}`} download >Unduh Dokumen Tertandatangan</MenuItem>
                            </MenuButton>
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={2}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            <Stack sx={{ width: "100%", alignItems: "stretch"}} gap={1}>
                                <Box>
                                    <Typography variant="subtitle2">Nomor Surat</Typography>
                                    <Typography variant="body1">{surat.nomor_surat}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Nama Pengaju</Typography>
                                    <Typography variant="body1">{surat.pengaju}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Keterangan</Typography>
                                    <Typography variant="body1">{surat.keterangan}</Typography>
                                </Box>
                                <Box>
                                    <Stack sx={{ alignItems: "center" }} direction="row" gap={0.5}>
                                        <Typography variant="subtitle2">Kategori</Typography>
                                        {!isEditingKategori ?
                                            <ButtonBase sx={{ borderRadius: "8px", px: "2px" }} onClick={() => setIsEditingKategori(true)}>
                                                <Typography variant="caption" sx={{ color: "GrayText" }}>(Edit)</Typography>
                                            </ButtonBase> : null
                                        }
                                    </Stack>

                                    {!isEditingKategori ?
                                        <Typography variant="body1">{surat.kategori?.kategori || "Tidak Berkategori"}</Typography> :
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
                            </Stack>


                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                            <List sx={{ width: "100%" }}>
                                {surat.jabatan.map((v, i) =>
                                    <ListItem key={v.pivot.id} divider>
                                        <ListItemAvatar><Avatar /></ListItemAvatar>
                                        <ListItemText primary={v.user.name} secondary={v.jabatan} />
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