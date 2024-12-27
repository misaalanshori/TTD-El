import { Avatar, Box, Button, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { ArrowForward, BookmarkBorder, Clear, MoreVert, Save, SaveAlt, Search } from "@mui/icons-material";
import { useState } from "react";
import MenuButton from "@/Components/MenuButton";
import { Head } from "@inertiajs/react";

export default function DetailsDocument({ surat }) {
    const theme = useTheme();
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
                            <Stack sx={{ width: "100%", alignItems: "start" }} gap={1}>
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