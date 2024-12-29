import { Autocomplete, Avatar, Box, Button, Card, CardContent, Collapse, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, ArrowForward, BookmarkBorder, BookmarkOutlined, Clear, MoreVert, Replay, Save, SaveAlt, Search } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import UploadCard from "./partials/UploadCard";
import { TransitionGroup } from "react-transition-group";
import { useSnackbar } from "notistack";

export default function EditDocument({ surat, users, kategori }) {
    const { enqueueSnackbar } = useSnackbar()
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableJabatan, setAvailableJabatan] = useState(null);
    const [selectedJabatan, setSelectedJabatan] = useState(null);
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [signers, setSigners] = useState([]);
    const [signersChanged, setSignersChanged] = useState(false);

    const canSave = signers.length > 0;

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
        if (v) {
            const response = await fetch(route("getJabatanByUserId", { id: v.id }))
            if (response.status == 200) {
                const json = await response.json()
                setAvailableJabatan(json.map(j => ({ id: j.id, label: j.jabatan, data: j })))
            }

        } else {
            setAvailableJabatan(null)
        }
        setSelectedJabatan(null)
    }

    const handleRemoveSigner = (id) => {
        signersChanged || setSignersChanged(true);
        setSigners(signers.filter(v => v.id != id));
    }

    const handleUpdateForm = (e) => {
        clearErrors(e.target.name)
        setData(e.target.name, e.target.value)
    }

    const resetSigners = () => {
        setSigners(surat.jabatan.map(j => ({ id: j.id, label: j.jabatan, data: j })));
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
        post(route("updateDocument", {surat: surat.id, continue_sign, _method: "put"}), {
            onError: (e) => {
                console.log("err", e)
                enqueueSnackbar("Terjadi Kesalahan", { variant: 'error', autoHideDuration: 5000 });
            },
            onSuccess: () => {
                enqueueSnackbar("Surat berhasil diperbarui", { variant: 'success', autoHideDuration: 5000 });
            }
        })
    }

    useEffect(() => {
        setData({...data, jabatan: signersChanged ? signers.map(v => v.id) : null});
    }, [signers])

    useEffect(() => {
        resetForm();
    }, [surat])

    const theme = useTheme();
    return (
        <MainLayout>
            <Head title={data.judul_surat || surat.judul_surat} />
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2, pb: "20vh" }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h5">{surat.judul_surat}</Typography>
                        <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: { xs: "center ", md: "space-between" }, flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }} gap={1}>
                            <Paper sx={{ bgcolor: surat.file_edited ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                <Typography sx={{ textWrap: "nowrap" }} align="center">{surat.file_edited ? "Sudah Ditandatangan" : "Belum Ditandatangan"}</Typography>
                            </Paper>
                            <Stack sx={{ justifyContent: { xs: "center ", md: "space-between" }, flexDirection: { xs: "column-reverse", md: "row" }}} gap={1}>
                                <Stack sx={{justifyContent: "center"}} flexDirection="row">
                                    <IconButton onClick={resetForm} ><Replay/></IconButton>
                                    <Button disabled={processing || !canSave} sx={{ textWrap: "nowrap" }} variant="text" endIcon={<BookmarkOutlined />} onClick={() => submitForm(false)}>Simpan</Button>
                                </Stack>
                                <Button disabled={processing || !canSave} sx={{ textWrap: "nowrap" }} variant="contained" endIcon={<ArrowForward />} onClick={() => submitForm(true)}>Lanjutkan Tanda Tangan</Button>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "85%", maxWidth: 600, justifyContent: "center", alignItems: "center" }} gap={2}>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={2}>
                            <Typography variant="h5" sx={{ fontWeight: "500" }}>Detail Dokumen</Typography>
                            <TextField fullWidth error={!!errors?.pengaju} helperText={errors?.pengaju} value={data.pengaju || ""} name="pengaju" onChange={handleUpdateForm} label="Nama Pengaju" />
                            <TextField fullWidth error={!!errors?.judul_surat} helperText={errors?.judul_surat} value={data.judul_surat || ""} name="judul_surat" onChange={handleUpdateForm} label="Judul Dokumen" />
                            <TextField fullWidth error={!!errors?.nomor_surat} helperText={errors?.nomor_surat} value={data.nomor_surat || ""} name="nomor_surat" onChange={handleUpdateForm} label="Nomor Surat" />
                            <TextField fullWidth error={!!errors?.keterangan} helperText={errors?.keterangan} value={data.keterangan || ""} name="keterangan" onChange={handleUpdateForm} multiline label="Keterangan" />
                            <Autocomplete
                                fullWidth
                                disablePortal
                                value={selectedKategori}
                                onChange={handleUpdateSelectedKategori}
                                options={kategori}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => <TextField  {...params} label="Kategori (Opsional)" />}
                            />
                            <UploadCard document={data.file_asli} onDocumentChanged={(file) => setData("file_asli", file)} replaceInstructions="Tarik file atau tekan untuk mengunggah dokumen pengganti (opsional)" />

                        </Stack>
                        <Stack sx={{ width: "100%", alignItems: "center" }} gap={1}>
                            <Stack sx={{justifyContent: "center", alignItems: "center"}} direction="row" gap={1}>
                                <Typography variant="h5" sx={{ fontWeight: "500" }}>Penandatangan</Typography>
                                {signersChanged ? <IconButton sx={{p:0}} onClick={resetSigners}><Replay/></IconButton> : null}
                            </Stack>
                            {!!errors?.jabatan ? <Typography variant="body2" color="error">Pilih minimal 1 penandatangan</Typography> : null}
                            <List sx={{ width: "100%" }}>
                                <TransitionGroup>
                                    {signers.map((v, i) =>
                                        <Collapse key={v.id}>
                                            <ListItem divider>
                                                <ListItemAvatar><Avatar /></ListItemAvatar>
                                                <ListItemText primary={v.data.user.name} secondary={v.label} />
                                                <ListItemButton sx={{ flexGrow: 0 }} onClick={() => handleRemoveSigner(v.id)}><Clear /></ListItemButton>
                                            </ListItem>
                                        </Collapse>

                                    )}
                                </TransitionGroup>

                            </List>
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
                    </Stack>
                </Stack>
            </Stack>
        </MainLayout>
    )
}