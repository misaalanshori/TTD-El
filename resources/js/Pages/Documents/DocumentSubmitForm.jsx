import { Autocomplete, Avatar, Box, Button, ButtonBase, Card, CardContent, Checkbox, Collapse, Fab, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, ArrowForward, AutoAwesome, BookmarkBorder, BookmarkOutlined, Cancel, Clear, MoreVert, Replay, Save, SaveAlt, Search } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import UploadCard from "./partials/UploadCard";
import { TransitionGroup } from "react-transition-group";
import { useSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";
import LLMProcessingButton from "@/Components/LLMProcessingButton";

export default function DocumentSubmitForm({ surat, users, kategori }) {
    const auth = usePage().props.auth;
    const confirm = useConfirm();
    const { enqueueSnackbar } = useSnackbar()
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableJabatan, setAvailableJabatan] = useState(null);
    const [selectedJabatan, setSelectedJabatan] = useState(null);
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [signers, setSigners] = useState([]);
    const [signersChanged, setSignersChanged] = useState(false);
    const [identifiedUsers, setIdentifiedUsers] = useState([]);
    const [personalSubmission, setPersonalSubmission] = useState(false);


    const usersList = [...identifiedUsers, ...(users.filter(user => !identifiedUsers.some(v => v.id == user.id)))]


    const canSave = signers.length > 0;
    const signersContainSelf = signers.some(v => v.id === auth.user.id);
    const isSelfSigning = selectedUser?.id === auth.user.id || signersContainSelf;

    const { data, setData, post, processing, errors, clearErrors, hasErrors } = useForm(
        {
            pengaju: "",
            judul_surat: "",
            nomor_surat: "",
            keterangan: "",
            jabatan: null,
            file_asli: null,
            kategori_id: null,
        }
    )

    const handlePersonalSubmissionChange = (e) => {
        setPersonalSubmission(e.target.checked);
        if (e.target.checked) {
            setData("pengaju", auth.user.name)
        } else {
            setData("pengaju", "")
        }
    }

    const handleUpdateSelectedKategori = (e, v) => {
        setSelectedKategori(v);
        setData("kategori_id", v.id);
    }

    const handleAddSigner = () => {
        signersChanged || setSignersChanged(true);
        if (!selectedJabatan) return;
        if (signers.some(v => v.id === selectedJabatan.id)) {
            enqueueSnackbar("Penandatangan sudah ada!", { variant: 'error', autoHideDuration: 5000 });
            return
        }
        clearErrors("jabatan")
        setSigners([...signers, selectedJabatan]);
        handleUpdateSelectedUser(null, null);
    }

    const handleUpdateSelectedUser = async (e, v) => {
        setAvailableJabatan(null)
        setSelectedUser(v);
    }

    useEffect(() => {
        const updateAvailableJabatan = async () => {
            if (selectedUser) {
                const response = await fetch(route("getJabatanByUserId", { id: selectedUser.id }))
                if (response.status == 200) {
                    const json = await response.json()
                    setAvailableJabatan(json.map(j => ({ id: j.id, label: j.jabatan, data: j })))
                }

            } else {
                setAvailableJabatan(null)
            }
            setSelectedJabatan(null)
        }
        updateAvailableJabatan();
    }, [selectedUser])

    const handleRemoveSigner = (id) => {
        signersChanged || setSignersChanged(true);
        setSigners(signers.filter(v => v.id != id));
    }

    const handleUpdateForm = (e) => {
        clearErrors(e.target.name)
        setData(e.target.name, e.target.value)
    }

    const resetSigners = () => {
        setSigners(surat.signature.map(j => ({
            id: j.jabatan_ref.id, label: j.jabatan_ref.jabatan, data: {
                jabatan: j.jabatan_ref.jabatan,
                nip: j.jabatan_ref.nip,
                user: j.jabatan_ref.user,
                approval: j.approval,
            }
        })));
        setSignersChanged(false);
    }

    const resetForm = () => {
        setData({
            pengaju: surat.pengaju,
            judul_surat: surat.judul_surat,
            nomor_surat: surat.nomor_surat,
            keterangan: surat.keterangan,
            file_asli: null,
            jabatan: null,
            kategori_id: surat.kategori?.id,
        });
        surat.kategori && setSelectedKategori({
            "id": surat.kategori.id,
            "label": surat.kategori.kategori
        });
        resetSigners();
    }

    const submitForm = (continue_sign = false) => {
        post(route("updateDocument", { surat: surat.id, continue_sign, _method: "put" }), {
            onError: (e) => {
                console.log("err", e)
                enqueueSnackbar("Terjadi Kesalahan", { variant: 'error', autoHideDuration: 5000 });
            },
            onSuccess: () => {
                enqueueSnackbar("Surat berhasil diperbarui", { variant: 'success', autoHideDuration: 5000 });
                if (!continue_sign) {
                    router.visit(route('showDocuments'));
                }
            }
        })
    }
    
    const cancelForm = async () => {
        try {
            await confirm({ title: "Batalkan Penambahan Dokumen?", description: "Dokumen akan dihapus dari sistem!" })
        } catch {
            return;
        }
        router.delete(route("deleteDocument", { surat: surat.id, redirect_home: 'true' }), {
            onSuccess: () => {
                enqueueSnackbar(`Penambahan dokumen dibatalkan`, { variant: 'success', autoHideDuration: 5000 });
            },
        })
    }
    
    const onProcessingSuccess = (result) => {
        console.log("AI Autofill Results: ", result);
        if (!data.judul_surat) setData("judul_surat", result.judul);
        if (!data.nomor_surat) setData("nomor_surat", result.nomor_surat);
        if (!data.keterangan) setData("keterangan", result.keterangan);
        setIdentifiedUsers(result.users.map(v => ({id: v.id, label: v.name, priority: true})));
    }

    const handleAddSelfSigner = () => {
        setSelectedUser(users.find(v => v.id === auth.user.id));
    }

    useEffect(() => {
        setData({ ...data, jabatan: signersChanged ? signers.map(v => v.id) : null });
    }, [signers])

    useEffect(() => {
        resetForm();
    }, [surat])

    const theme = useTheme();

    return (
        <MainLayout>
            <LLMProcessingButton surat={surat} onSuccess={onProcessingSuccess}/>
            <Head title="Submit Dokumen" />
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2, pb: "20vh" }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", justifyContent: "space-between", flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500, textAlign: 'center' }} variant="h4">Tambah Dokumen</Typography>
                    </Stack>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }}>
                            <TextField fullWidth disabled={personalSubmission} error={!!errors?.pengaju} helperText={errors?.pengaju} value={data.pengaju || ""} name="pengaju" onChange={handleUpdateForm} label="Nama Pengaju" />
                            <FormGroup sx={{ alignSelf: "flex-start" }}>
                                <FormControlLabel control={<Checkbox checked={personalSubmission} onChange={handlePersonalSubmissionChange} />} label="Pengajuan pribadi" />
                            </FormGroup>
                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={2}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            {/* <TextField fullWidth error={!!errors?.pengaju} helperText={errors?.pengaju} value={data.pengaju || ""} name="pengaju" onChange={handleUpdateForm} label="Nama Pengaju" /> */}
                            <TextField fullWidth error={!!errors?.judul_surat} helperText={errors?.judul_surat} value={data.judul_surat || ""} name="judul_surat" onChange={handleUpdateForm} label="Judul Dokumen" />
                            <TextField fullWidth error={!!errors?.nomor_surat} helperText={errors?.nomor_surat} value={data.nomor_surat || ""} name="nomor_surat" onChange={handleUpdateForm} label="Nomor Surat" />
                            <TextField fullWidth error={!!errors?.keterangan} helperText={errors?.keterangan} value={data.keterangan || ""} name="keterangan" onChange={handleUpdateForm} multiline label="Deskripsi" />
                            <Autocomplete
                                fullWidth
                                disablePortal
                                value={selectedKategori}
                                onChange={handleUpdateSelectedKategori}
                                options={kategori}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => <TextField  {...params} label="Kategori (Opsional)" />}
                            />

                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Stack sx={{ justifyContent: "center", alignItems: "center" }} direction="row" gap={1}>
                                <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                                {signersChanged ? <IconButton sx={{ p: 0 }} onClick={resetSigners}><Replay /></IconButton> : null}
                            </Stack>
                            {!!errors?.jabatan ? <Typography variant="body2" color="error">Pilih minimal 1 penandatangan</Typography> : null}
                            <List sx={{ width: "100%" }}>
                                <TransitionGroup>
                                    {signers.map((v, i) =>
                                        <Collapse key={v.id}>
                                            <ListItem divider>
                                                <ListItemAvatar><Avatar /></ListItemAvatar>
                                                <ListItemText primary={v.data.user.name} secondary={`${v.label} (${v.data.nip})`} />
                                                {
                                                    v.data.approval ?
                                                        <Paper sx={{ px: 1, py: 0.2, borderRadius: 16, textTransform: "capitalize", color: "white", bgcolor: { approved: theme.palette.success.light, rejected: theme.palette.error.light, pending: theme.palette.primary.light }[v.data.approval.status] }}>
                                                            <Typography sx={{ fontSize: 12, textWrap: "nowrap" }}>{v.data.approval.status}</Typography>
                                                        </Paper> : null
                                                }
                                                <ListItemButton sx={{ flexGrow: 0 }} onClick={() => handleRemoveSigner(v.id)}><Clear /></ListItemButton>
                                            </ListItem>
                                        </Collapse>

                                    )}
                                </TransitionGroup>

                            </List>
                            {isSelfSigning ? null : <Button variant="outlined" size="small" startIcon={<Add />} onClick={handleAddSelfSigner}>Tambahkan saya sebagai penandatangan</Button>}
                            <Stack sx={{ width: "100%", alignItems: "center", flexDirection: { xs: "column", md: "row" } }} gap={1}>
                                <Stack sx={{ width: "100%" }} gap={1}>
                                    <Autocomplete
                                        fullWidth
                                        disablePortal
                                        value={selectedUser}
                                        onChange={handleUpdateSelectedUser}
                                        options={usersList}
                                        sx={{ flexGrow: 1 }}
                                        getOptionLabel={option=>option.label}
                                        getOptionKey={option=>option.label + `${option.id}`}
                                        renderInput={(params) => <TextField  {...params} label="Penandatangan" />}
                                        renderOption={(props, option) => {
                                            const { key, ...optionProps } = props;
                                            return (
                                              <Stack
                                                key={key}
                                                component="li"
                                                sx={{flexDirection: "row"}}
                                                {...optionProps}
                                              >
                                                <Typography sx={{flexGrow: 1}}>{option.label}</Typography>
                                                {option.priority ? <AutoAwesome/> : null}
                                              </Stack>
                                            );
                                          }}
                                    />
                                    {availableJabatan ?
                                        <Autocomplete
                                            fullWidth
                                            disablePortal
                                            value={selectedJabatan}
                                            onChange={(e, v) => setSelectedJabatan(v)}
                                            options={availableJabatan}
                                            sx={{ flexGrow: 1 }}
                                            renderInput={(params) => <TextField  {...params} label="Jabatan" />}
                                        /> :
                                        null}
                                </Stack>
                                <Button disabled={!selectedJabatan} variant="contained" startIcon={<Add />} onClick={handleAddSigner}>Tambah</Button>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "100%", justifyContent: "end", py: 2, flexDirection: { xs: "column-reverse", md: "row" }, gap: { xs: 1, md: 2 } }}>
                        <Button sx={{ textWrap: "nowrap" }} color="error" variant="text" endIcon={<Cancel />} onClick={() => cancelForm()}>Batal & Hapus</Button>
                        <Button disabled={processing || !canSave} sx={{ textWrap: "nowrap" }} variant={(signersContainSelf) ? "text" : "contained"} endIcon={<BookmarkOutlined />} onClick={() => submitForm(false)}>Simpan</Button>
                        {(signersContainSelf) ? <Button disabled={processing || !canSave} sx={{ textWrap: "nowrap" }} variant="contained" endIcon={<ArrowForward />} onClick={() => submitForm(true)}>Lanjutkan Tanda Tangan</Button> : null}
                    </Stack>
                </Stack>
            </Stack>
        </MainLayout>
    )
}