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

export default function CreateKategori({ kategori, open, onClose }) {
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isModifying = !!kategori
    
    const handleSave = () => {
        setLoading(true)
        const callbacks = {
            onError: (e) => {
                setErrors(e);
                setLoading(false)
            },
            onSuccess: () => {
                onClose();
                enqueueSnackbar("Kategori Berhasil " + (isModifying ? "Diubah" : "Ditambahkan"), { variant: 'success', autoHideDuration: 5000 });
                setLoading(false);
            }
        }
        if (isModifying) {
            router.put(route("updateKategori", {id: kategori.id}), formData, callbacks);
        } else {
            router.post(route("createKategori"), formData, callbacks);
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
            setFormData(kategori)
        } else {
            setFormData({
                kategori: "",
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
                        <Typography variant="h5">{isModifying ? "Ubah" : "Tambah"} Kategori{isModifying ? "" : " baru"}</Typography>
                        <TextField error={errors.kategori} helperText={errors.kategori} sx={{outline: "none !important"}} fullWidth value={formData?.kategori || ""} name="kategori" onChange={handleUpdateForm} label="Nama Kategori" />
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