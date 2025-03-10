import { Autocomplete, Button, ButtonBase, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Check, Clear, MoreVert, Search } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { Head, Link, router } from '@inertiajs/react'
import MenuButton from "@/Components/MenuButton";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";
import { useDebounce } from "use-debounce";
import { NonFullScreenPageMode } from "pdf-lib";
import { useMemo } from "react";


export default function ApprovedDocuments({ surat }) {
    const daftarSurat = useMemo(() => 
        surat.data.map(v => ({
            ...v,
            signature: v.signature.map(s => ({
                ...s,
                jabatan: s.jabatan || { jabatan: s.jabatan, nip: s.nip, user: { name: s.nama } }
            }))
        })), 
    [surat]);
    
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();


    const handlePageChange = (e, v) => {
        router.get(route("listRequests", { page: v }), {}, { preserveState: true })
    }

    console.log(daftarSurat)
    return (
        <MainLayout>
            <Head title="Daftar Dokumen Bertanda Tangan"/>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", lg: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Dokumen Bertanda Tangan</Typography>
                    </Stack>
                    {
                        daftarSurat.length ?
                            <>
                                <Stack sx={{ width: "100%" }} gap={1}>
                                    {daftarSurat.map((v, i) => (
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
                                                                v.signature.map((s, i) => (
                                                                    <Paper key={i} sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{s.approval.user.name} ({s.jabatan.jabatan})</Typography>
                                                                    </Paper>
                                                                ))
                                                            }
                                                        </Stack>
                                                        <Typography sx={{ width: { xs: "70vw", md: "100%" }, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{v.keterangan}</Typography>
                                                    </Stack>
                                                    <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "end", alignItems: "center" }} direction="row" gap={1}>
                                                        <Button variant="contained" color="success" >Terima</Button>
                                                        <Button variant="contained" color="error" >Tolak</Button>
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