import { useState } from "react";
import { Button, Card, CardActions, CardContent, Modal, Stack, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { router } from "@inertiajs/react";
import { useSnackbar } from "notistack";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "500px",
    maxWidth: "95vw",
    boxShadow: 24,
    p: 4,
};

export default function CreateJabatan({ jabatan, open, onClose }) {
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isModifying = !!jabatan
    
    const handleSave = () => {
        setLoading(true)
        const callbacks = {
            onError: (e) => {
                setErrors(e);
                setLoading(false)
            },
            onSuccess: () => {
                onClose();
                enqueueSnackbar("Jabatan Berhasil " + (isModifying ? "Diubah" : "Ditambahkan"), { variant: 'success', autoHideDuration: 5000 });
                setLoading(false);
            }
        }
        if (isModifying) {
            router.put(route("updateJabatan", {id: jabatan.id}), formData, callbacks);
        } else {
            router.post(route("createJabatan"), formData, callbacks);
        }
    }

    const handleUpdateForm = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const resetForm = () => {
        if (isModifying) {
            setFormData(jabatan)
        } else {
            setFormData({
                jabatan: "",
                nip: "",
            })
        }
    }

    useEffect(() => {
            setLoading(false);
            resetForm();
            setErrors({});
        }, [open]
    )

    return (
        <Modal open={open} onClose={onClose}>
            <Card sx={style}>
                <CardContent>
                    <Stack gap={1}>
                        <Typography variant="h5">{isModifying ? "Ubah" : "Tambah"} Jabatan{isModifying ? "" : " baru"}</Typography>
                        <TextField error={errors.jabatan} helperText={errors.jabatan} sx={{outline: "none !important"}} fullWidth value={formData?.jabatan || ""} name="jabatan" onChange={handleUpdateForm} label="Nama Jabatan" />
                        <TextField error={errors.nip} helperText={errors.nip} fullWidth value={formData?.nip || ""} name="nip" onChange={handleUpdateForm} label="Nomor Induk" />
                    </Stack>
                </CardContent>
                <CardActions >
                    <Stack sx={{ width: "100%" }} direction="row-reverse" gap={1}>
                        <Button disabled={loading} variant="contained" onClick={handleSave}>Simpan</Button>
                        <Button disabled={loading} variant="outlined" onClick={onClose}>Cancel</Button>
                    </Stack>
                </CardActions>
            </Card>
        </Modal>

        
    )
}