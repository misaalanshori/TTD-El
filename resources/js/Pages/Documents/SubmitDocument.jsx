import { Autocomplete, Avatar, Button, Checkbox, Collapse, Fade, FormControlLabel, FormGroup, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, ArrowForward, Clear, TurnedInNot } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import UploadCard from "./partials/UploadCard";
import { useSnackbar } from "notistack";
import { Head, router, usePage } from "@inertiajs/react";



export default function SubmitDocument({ users, kategori }) {
    const auth = usePage().props.auth;
    const { enqueueSnackbar } = useSnackbar();
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [formData, setFormdata] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableJabatan, setAvailableJabatan] = useState(null);
    const [selectedJabatan, setSelectedJabatan] = useState(null)
    const [selectedKategori, setSelectedKategori] = useState(null)
    const [signers, setSigners] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [personalSubmission, setPersonalSubmission] = useState(false);

    const signersContainSelf = signers.some(v => v.data.user_id === auth.user.id);
    const isSelfSigning = selectedUser?.id === auth.user.id || signersContainSelf;

    const handleAddSigner = () => {
        if (!selectedJabatan) return;
        if (signers.some(v => v.id === selectedJabatan.id)) {
            enqueueSnackbar("Penandatangan sudah ada!", { variant: 'error', autoHideDuration: 5000 });
            return
        }
        setErrors({
            ...errors,
            jabatan: null,
        })
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
        setSigners(signers.filter(v => v.id != id));
    }

    const handleUpdateForm = (e) => {
        setErrors({
            ...errors,
            [e.target.name]: null,
        })
        setFormdata({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const collectFormData = () => {
        return {
            ...formData,
            file_asli: selectedDocument,
            jabatan: signers.map(v => v.id),
            kategori_id: selectedKategori?.id,
        }
    }

    const handleSave = (continue_sign = false) => {
        setLoading(true)
        const callbacks = {
            onError: (e) => {
                setErrors(e);
                setLoading(false)
                console.log("Errors:", e)
            },
            onSuccess: () => {
                // onClose();
                enqueueSnackbar("Dokumen berhasil ditambahkan", { variant: 'success', autoHideDuration: 5000 });
                setLoading(false);
            }
        }
        router.post(route("createDocument", { continue_sign }), collectFormData(), callbacks);
    }

    const handlePersonalSubmissionChange = (e) => {
        setPersonalSubmission(e.target.checked);
        if (e.target.checked) {
            setFormdata({
                ...formData,
                pengaju: auth.user.name,
            })
        } else {
            setFormdata({
                ...formData,
                pengaju: "",
            })
        }
    }

    const handleAddSelfSigner = () => {
        setSelectedUser(users.find(v => v.id === auth.user.id));
    }

    const resetForm = () => {
        setFormdata(
            {
                pengaju: "",
                judul_surat: "",
                nomor_surat: "",
                tujuan_surat: "",
                keterangan: "",
            }
        );
    }

    useEffect(() => {
        resetForm();
    }, [])

    return (
        <MainLayout>
            <Head title="Submit Dokumen" />
            <Stack sx={{ minHeight: "100%", justifyContent: "center", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <UploadCard document={selectedDocument} onDocumentChanged={setSelectedDocument} />
                <Fade in={!!selectedDocument} unmountOnExit>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }}>
                            <TextField fullWidth disabled={personalSubmission} error={!!errors?.pengaju} helperText={errors?.pengaju} value={formData?.pengaju || ""} name="pengaju" onChange={handleUpdateForm} label="Nama Pengaju" />
                            <FormGroup sx={{ alignSelf: "flex-start" }}>
                                <FormControlLabel control={<Checkbox checked={personalSubmission} onChange={handlePersonalSubmissionChange} />} label="Pengajuan pribadi" />
                            </FormGroup>
                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            <TextField fullWidth error={!!errors?.judul_surat} helperText={errors?.judul_surat} value={formData?.judul_surat || ""} name="judul_surat" onChange={handleUpdateForm} label="Judul Dokumen" />
                            <TextField fullWidth error={!!errors?.nomor_surat} helperText={errors?.nomor_surat} value={formData?.nomor_surat || ""} name="nomor_surat" onChange={handleUpdateForm} label="Nomor Surat" />
                            <TextField fullWidth error={!!errors?.keterangan} helperText={errors?.keterangan} value={formData?.keterangan || ""} name="keterangan" onChange={handleUpdateForm} multiline label="Deskripsi" />
                            <Autocomplete
                                fullWidth
                                disablePortal
                                value={selectedKategori}
                                onChange={(e, v) => setSelectedKategori(v)}
                                options={kategori}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => <TextField  {...params} label="Kategori (Opsional)" />}
                            />
                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                            {!!errors?.jabatan ? <Typography variant="body2" color="error">Pilih minimal 1 penandatangan</Typography> : null}
                            <List sx={{ width: "100%" }}>
                                <TransitionGroup>
                                    {signers.map((v, i) =>
                                        <Collapse key={v.id}>
                                            <ListItem divider>
                                                <ListItemAvatar><Avatar /></ListItemAvatar>
                                                <ListItemText primary={v.data.user.name} secondary={`${v.label} (${v.data.nip})`} />
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
                                        options={users}
                                        sx={{ flexGrow: 1 }}
                                        renderInput={(params) => <TextField  {...params} label="Penandatangan" />}
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
                        <Stack sx={{ width: "100%", alignItems: "end", py: 2 }} direction="row-reverse" gap={2}>
                            {signersContainSelf ? <Button disabled={loading} variant="contained" startIcon={<ArrowForward />} onClick={() => handleSave(true)}> Lanjutkan</Button> : null}
                            <Button disabled={loading} variant={signersContainSelf ? "outlined" : "contained"} startIcon={<TurnedInNot />} onClick={() => handleSave(false)}> Simpan</Button>
                        </Stack>
                    </Stack>
                </Fade>
            </Stack>
        </MainLayout>
    )
}