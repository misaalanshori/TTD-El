import { Avatar, Box, Button, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { ArrowForward, BookmarkBorder, Clear, MoreVert, Save, SaveAlt, Search } from "@mui/icons-material";
import { useState } from "react";

export default function DetailsDocument({ users }) {
    const theme = useTheme();
    const surat = {
        id: "uuid-value",                  // UUID, primary key
        file_asli: "original_file_name",   // string, required
        file_edited: null,                 // string, optional (nullable)
        pengaju: "applicant_name",         // string, required
        nomor_surat: "surat/12312",                 // string, optional (nullable)
        judul_surat: "letter_title",       // string, required
        keterangan: "Ini adalah Keterangan",                  // text, optional (nullable)
        status: "WAITING",                      // string, optional (nullable)
        jabatan: [
            {
                id: "UUID",
                jabatan: "nama jabatan",
                nip: "1123412123123",
                user: {
                    id: "UUID",
                    nama: "Muhammad Isa Al Anshori"
                }
            },
            {
                id: "UUID",
                jabatan: "nama jabatan2",
                nip: "1123412123123",
                user: {
                    id: "UUID",
                    nama: "Muhammad Isa Al Anshori2"
                }
            },
        ]
        // deleted_at: null,                  // timestamp, optional (nullable)
        // created_at: "timestamp_here",      // timestamp, required
        // updated_at: "timestamp_here"       // timestamp, required
    };



    return (
        <MainLayout>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Sebuah Dokumen</Typography>
                        <Paper sx={{ bgcolor: theme.palette.success.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                            <Typography sx={{ textWrap: "nowrap" }} align="center">{surat.status}</Typography>
                        </Paper>
                        <Button sx={{ml:"auto"}} variant="contained" endIcon={<SaveAlt />}>Unduh Dokumen</Button>
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
                                    <Typography variant="subtitle2">Judul Surat</Typography>
                                    <Typography variant="body1">{surat.judul_surat}</Typography>
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
                                    <ListItem divider>
                                        <ListItemAvatar><Avatar /></ListItemAvatar>
                                        <ListItemText primary={v.user.nama} secondary={v.jabatan} />
                                        {/* <ListItemButton sx={{ flexGrow: 0 }} onClick={() => handleRemoveSigner(v.id)}><Clear /></ListItemButton> */}
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