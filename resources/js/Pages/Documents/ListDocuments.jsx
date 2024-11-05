import { Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { MoreVert, Search } from "@mui/icons-material";
import { useState } from "react";
import { router } from '@inertiajs/react'
import MenuButton from "@/Components/MenuButton";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";


export default function ListDocuments({ surat }) {
    console.log(surat)
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const [selectedFilter, setSelectedFilter] = useState(0);
    const theme = useTheme()

    // TODO: Move client-side filtering (and search) to backend 
    const filter = [
        a => a,
        a => a.filter(v => v.isSigned),
        a => a.filter(v => !v.isSigned),
    ][selectedFilter]


    return (
        <MainLayout>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Dokumen</Typography>
                        <Stack sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", md: "end" }, flexGrow: 1, flexDirection: { xs: "column", sm: "row" } }} gap={1}>
                            <FormControl>
                                <InputLabel id="filter-select-label">Filter</InputLabel>
                                <Select
                                    sx={{ width: { xs: "100%", sm: "auto" }, borderRadius: 90 }}
                                    labelId="filter-select-label"
                                    id="filter-select"
                                    value={selectedFilter}
                                    label="Filter"
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                >
                                    <MenuItem value={0}>Semua</MenuItem>
                                    <MenuItem value={1}>Tertandatangan</MenuItem>
                                    <MenuItem value={2}>Belum Ditandatangani</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                sx={{ width: { xs: "100%", sm: "auto" }, alignSelf: "end" }}
                                label="Pencarian"
                                placeholder="Cari Dokumen"
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 90 },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Stack>
                    </Stack>
                    {
                        surat.data.length ?
                            <>
                                <Stack sx={{ width: "100%" }} gap={1}>
                                    {filter(surat.data).map((v, i) => (
                                        <Card key={i} elevation={2}>
                                            <CardContent sx={{ pb: "16px !important" }}>
                                                <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                                                    <Stack sx={{ flexGrow: 1, overflow: "hidden" }} gap={0.5}>
                                                        <Stack sx={{ alignItems: { xs: "start", sm: "center" }, flexDirection: { xs: "column", sm: "row" } }} gap={1}>
                                                            <Typography sx={{ fontWeight: 500 }}>{v.judul_surat}</Typography>
                                                            <Paper sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                                <Typography sx={{ fontSize: 12, textWrap: "nowrap" }}>{v.nomor_surat}</Typography>
                                                            </Paper>
                                                        </Stack>
                                                        <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" gap={1}>
                                                            {
                                                                v.jabatan.map((s, i) => (
                                                                    <Paper key={i} sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{s.user.name} ({s.jabatan})</Typography>
                                                                    </Paper>
                                                                ))
                                                            }
                                                        </Stack>
                                                        <Typography sx={{ width: { xs: "70vw", md: "100%" }, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{v.keterangan}</Typography>
                                                    </Stack>
                                                    <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "space-between" }} direction="row" gap={1}>
                                                        <Paper sx={{ bgcolor: v.file_edited ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                                            <Typography sx={{ textWrap: "nowrap" }} align="center">{v.file_edited ? "Sudah Ditandatangan" : "Belum Ditandatangan"}</Typography>
                                                        </Paper>
                                                        <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                            <MenuItem component="a" href={`/${v.file_asli}`} download>Unduh PDF Asli</MenuItem>
                                                            <MenuItem onClick={() => {
                                                                confirm({ title: "Hapus Dokumen?", description: `Ini akan menghapus dokumen ${v.judul_surat}` })
                                                                    .then(() => router.delete(route("deleteDocument", { surat: v.id }), {
                                                                        onSuccess: () => enqueueSnackbar(`Dokumen ${v.judul_surat} Berhasil Dihapus`, { variant: 'success', autoHideDuration: 5000 }),
                                                                    })).catch(() => 0)
                                                            }}>Hapus</MenuItem>
                                                        </MenuButton>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                                <Pagination page={surat.current_page} count={surat.last_page} onChange={(e, v) => router.get(route("showDocuments", { page: v }))} />
                            </> :
                            <Typography align="center" variant="h6" color="textDisabled">Daftar Dokumen Kosong</Typography>
                    }
                </Stack>
            </Stack>
        </MainLayout>
    )
}   