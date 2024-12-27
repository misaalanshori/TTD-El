import { Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Check, Clear, MoreVert, Search } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { Head, Link, router } from '@inertiajs/react'
import MenuButton from "@/Components/MenuButton";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";
import { useDebounce } from "use-debounce";
import { NonFullScreenPageMode } from "pdf-lib";


export default function ListDocuments({ surat }) {
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearchValue] = useDebounce(searchValue, 500);
    const filterChanged = useRef(false);
    const theme = useTheme();

    const handleSelectedFilterChange = (e) => {
        setSelectedFilter(e.target.value);
        filterChanged.current = true;
    }

    const handleSearchValueChange = (e) => {
        setSearchValue(e.target.value);
        filterChanged.current = true;
    }
    
    const handleSearchValueClear = () => {
        setSearchValue("");
    }

    const handlePageChange = (e, v) => {
        router.get(route("showDocuments", { page: v }), {}, { preserveState: true })
    }

    useEffect(() => {
        if (filterChanged.current) {
            const hasSign = { all: null, signed: true, notSigned: false }[selectedFilter];
            router.get(route("showDocuments", { hasSign, search: debouncedSearchValue || null }), {}, {
                preserveState: true,
                replace: true,
            });
        }
    }, [selectedFilter, debouncedSearchValue])

    return (
        <MainLayout>
            <Head title="Daftar Dokumen"/>
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
                                    onChange={handleSelectedFilterChange}
                                >
                                    <MenuItem value={"all"}>Semua</MenuItem>
                                    <MenuItem value={"signed"}>Tertandatangan</MenuItem>
                                    <MenuItem value={"notSigned"}>Belum Ditandatangan</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                sx={{ width: { xs: "100%", sm: "auto" }, alignSelf: "end" }}
                                label="Pencarian"
                                placeholder="Cari Dokumen"
                                value={searchValue}
                                onChange={handleSearchValueChange}
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 90 },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchValue ? (
                                            <InputAdornment position="start">
                                                <IconButton onClick={handleSearchValueClear}>
                                                    <Clear />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null
                                    },
                                }}
                            />
                        </Stack>
                    </Stack>
                    {
                        surat.data.length ?
                            <>
                                <Stack sx={{ width: "100%" }} gap={1}>
                                    {surat.data.map((v, i) => (
                                        <Card key={i} elevation={2}>
                                            <CardContent sx={{ pb: "16px !important" }}>
                                                <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                                                    <Stack sx={{ flexGrow: 1, overflow: "hidden" }} gap={0.5}>
                                                        <Link style={{ textDecoration: 'none', color: 'inherit' }} href={route("detailsDocument", { id: v.id })}>
                                                            <Stack sx={{ alignItems: { xs: "start", sm: "center" }, flexDirection: { xs: "column", sm: "row" } }} gap={1}>
                                                                <Typography variant="h6" sx={{ fontWeight: 500 }}>{v.judul_surat}</Typography>
                                                                <Stack sx={{ alignItems: "center" }} direction="row" gap={1}>
                                                                    <Paper sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                                        <Typography sx={{ fontSize: 12, textWrap: "nowrap" }}>{v.nomor_surat}</Typography>
                                                                    </Paper>
                                                                    {v.file_edited ? <Paper
                                                                        sx={{
                                                                            bgcolor: theme.palette.success.light,
                                                                            color: "white",
                                                                            p: 0.5, // Adjust padding for size
                                                                            borderRadius: "50%",
                                                                            width: 32, // Fixed width for a circular shape
                                                                            height: 32, // Fixed height to match width
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}
                                                                    >
                                                                        <Check fontSize="small" />
                                                                    </Paper> : null}
                                                                </Stack>
                                                            </Stack>
                                                        </Link>
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
                                                    <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "end" }} direction="row" gap={1}>

                                                        {
                                                            v.file_edited ?
                                                                <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                                    <MenuItem component="a" href={`/${v.file_asli}`} download >Unduh Dokumen Asli</MenuItem>
                                                                    <MenuItem component="a" href={`/${v.file_edited}`} download >Unduh Dokumen Tertandatangan</MenuItem>
                                                                </MenuButton> :
                                                                <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                                    <MenuItem component={Link} href={route("signDocument", { id: v.id })} download>Lanjutkan Tanda Tangan</MenuItem>
                                                                    <MenuItem component="a" href={`/${v.file_asli}`} download>Unduh Dokumen Asli</MenuItem>
                                                                    <MenuItem onClick={() => {
                                                                        confirm({ title: "Hapus Dokumen?", description: `Ini akan menghapus dokumen ${v.judul_surat}` })
                                                                            .then(() => router.delete(route("deleteDocument", { surat: v.id }), {
                                                                                onSuccess: () => enqueueSnackbar(`Dokumen ${v.judul_surat} Berhasil Dihapus`, { variant: 'success', autoHideDuration: 5000 }),
                                                                            })).catch(() => 0)
                                                                    }}>Hapus</MenuItem>
                                                                </MenuButton>
                                                        }
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                                <Pagination page={surat.current_page} count={surat.last_page} onChange={handlePageChange} />
                            </> :
                            <Typography align="center" variant="h6" color="textDisabled">Daftar Dokumen Kosong</Typography>
                    }
                </Stack>
            </Stack>
        </MainLayout>
    )
}   