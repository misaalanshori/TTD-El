import { Autocomplete, Button, ButtonBase, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Check, Clear, Close, MoreVert, Search } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { Head, Link, router, usePage } from '@inertiajs/react'
import { useSnackbar } from "notistack";

export default function ApprovalRequests({ surat }) {
    const auth = usePage().props.auth;
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const [rejectingDocument, setRejectingDocument] = useState(null);
    const [rejectingReason, setRejectingReason] = useState("");
    const [rejectingLoading, setRejectingLoading] = useState(false);
    const openRejectDialog = (doc) => {
        setRejectingDocument(doc);
    }
    const closeRejectDialog = () => {
        setRejectingDocument(null);
        setRejectingReason("");
        rejectingLoading(false);
    }


    const handlePageChange = (e, v) => {
        router.get(route("listRequests", { page: v }), {}, { preserveState: true })
    }

    const handleApprove = (id) => {
        router.visit(route("placeDocumentSignature", { surat: id }));
    }

    const handleReject = (signature_id) => {
        setRejectingLoading(true);
        router.post(route("rejectDocument", { signature: signature_id }), {message: rejectingReason}, {
            preserveState: true,
            onSuccess: () => {
                enqueueSnackbar("Dokumen berhasil ditolak", { variant: "success" });
                closeRejectDialog();
            },
            onFinish: () => {
                setRejectingLoading(false);
            },
            onError: (e) => {
                setRejectingLoading(false);
            }
            });
    }

    return (
        <MainLayout>
            <Head title="Daftar Permintaan Tanda Tangan"/>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", lg: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Permintaan Tanda Tangan</Typography>
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
                                                                    {v.state.state === "rejected" ? <Paper
                                                                        sx={{
                                                                            bgcolor: theme.palette.error.light,
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
                                                                        <Close />
                                                                    </Paper> : null}
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
                                                                            color: s.approval.status === "pending" ? 'black' : "white",
                                                                            bgcolor: {approved: theme.palette.success.light, rejected: theme.palette.error.light, pending: 'white'}[s.approval.status]
                                                                        }}>
                                                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{s.approval.user.name} ({s.jabatan.jabatan})</Typography>
                                                                    </Paper>
                                                                ))
                                                            }
                                                        </Stack>
                                                        <Typography sx={{ width: { xs: "70vw", md: "100%" }, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{v.keterangan}</Typography>
                                                    </Stack>
                                                    <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "end", alignItems: "center" }} direction="row" gap={1}>
                                                        <Button variant="contained" color="success" onClick={() => handleApprove(v.id)}>Terima</Button>
                                                        <Button variant="contained" color="error" onClick={() => openRejectDialog(v)} >Tolak</Button>
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
            <Dialog open={!!rejectingDocument} onClose={closeRejectDialog}>
                <DialogTitle>Tolak Permintaan Dokumen: "{rejectingDocument?.judul_surat}"</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Apakah anda yakin ingin menolak permintaan dokumen ini?
                    </DialogContentText>
                    <TextField
                        multiline
                        fullWidth
                        variant="standard"
                        label="Alasan Penolakan (Opsional)"
                        value={rejectingReason}
                        onChange={(e) => setRejectingReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={rejectingLoading} onClick={closeRejectDialog}>Batal</Button>
                    <Button disabled={rejectingLoading} variant="contained" color="error" onClick={() => handleReject(rejectingDocument.signature.find(v => v.approval.user.id === auth.user.id).id)} >Tolak</Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    )
}   