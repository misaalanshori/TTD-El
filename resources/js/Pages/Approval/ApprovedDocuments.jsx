import { Autocomplete, Button, ButtonBase, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Check, Clear, Close, MoreHoriz, MoreVert, Search, Warning } from "@mui/icons-material";
import { Head, Link, router } from '@inertiajs/react'
import MenuButton from "@/Components/MenuButton";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";


export default function ApprovedDocuments({ surat }) {
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const theme = useTheme();


    const handlePageChange = (e, v) => {
        router.get(route("listApproved", { page: v }), {}, { preserveState: true })
    }

    return (
        <MainLayout>
            <Head title="Daftar Dokumen Disetujui"/>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", lg: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Dokumen Disetujui</Typography>
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
                                                                    <Paper
                                                                        sx={{
                                                                            bgcolor: { approved: v.file_edited ? theme.palette.success.light : theme.palette.warning.main, rejected: theme.palette.error.light, pending: theme.palette.grey[400] }[v.state?.state ?? (v.file_edited ? "approved" : "pending")],
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
                                                                        {{ approved: v.file_edited ? <Check fontSize="small" /> : <Warning fontSize="small" />, rejected: <Close fontSize="small" />, pending: <MoreHoriz fontSize="small" /> }[v.state?.state ?? (v.file_edited ? "approved" : "pending")]}
                                                                    </Paper>
                                                                </Stack>
                                                            </Stack>
                                                        </Link>
                                                        <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" gap={1}>
                                                            {
                                                                v.signature.map((s, i) => (
                                                                    <Paper
                                                                        key={i}
                                                                        sx={{
                                                                            px: 1,
                                                                            py: 0.2,
                                                                            borderRadius: 16,
                                                                            color: s.approval.status === "pending" || v.file_edited ? 'black' : "white",
                                                                            bgcolor: v.file_edited ? 'white' : { approved: theme.palette.success.light, rejected: theme.palette.error.light, pending: 'white' }[s.approval.status]
                                                                        }}>
                                                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{s.approval.user.name} ({s.jabatan.jabatan})</Typography>
                                                                    </Paper>
                                                                ))
                                                            }
                                                        </Stack>
                                                        <Typography sx={{ width: { xs: "70vw", md: "100%" }, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{v.keterangan}</Typography>
                                                    </Stack>
                                                    <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "end", alignItems: "center" }} direction="row" gap={1}>
                                                        {
                                                            v.file_edited ?
                                                                <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                                    <MenuItem component="a" href={`/${v.file_asli}`} download >Unduh Dokumen Asli</MenuItem>
                                                                    <MenuItem component="a" href={`/${v.file_edited}`} download >Unduh Dokumen Tertandatangan</MenuItem>
                                                                </MenuButton> :
                                                                <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                                    <MenuItem component="a" href={`/${v.file_asli}`} download>Unduh Dokumen Asli</MenuItem>
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