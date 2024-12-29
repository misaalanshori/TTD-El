import { Button, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, MoreVert } from "@mui/icons-material";
import { useState } from "react";
import CreateKategori from "./partials/CreateKategori";
import { useSnackbar } from "notistack";
import MenuButton from "@/Components/MenuButton";
import { useConfirm } from "material-ui-confirm";
import { Head, router } from "@inertiajs/react";

export default function ListKategori({ kategori }) {
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [selectedKategori, setSelecteKategori] = useState(null)
    const handleOpenCreateModal = (item) => {
        if (item) {
            setSelecteKategori(item);
        }
        setCreateModalOpen(true);
    }
    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setSelecteKategori(null);
    }


    return (
        <MainLayout>
            <Head title="Daftar Kategori" />
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", justifyContent: { xs: "center", md: "space-between" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Kategori</Typography>
                        <Button variant="contained" endIcon={<Add />} onClick={() => handleOpenCreateModal()}>Tambah Kategori</Button>
                    </Stack>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Nama Kategori</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {kategori.map((v, i) =>
                                    <TableRow key={i}>
                                        <TableCell>{v.kategori}</TableCell>
                                        <TableCell>{v.slug}</TableCell>
                                        <TableCell align="right">
                                            <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                <MenuItem onClick={() => handleOpenCreateModal(v)}>Ubah</MenuItem>
                                                <MenuItem onClick={() => {
                                                    confirm({ title: "Hapus Kategori?", description: `Ini akan menghapus kategori ${v.kategori}` })
                                                        .then(() => router.delete(route("deleteKategori", { id: v.id }), {
                                                            onFinish: () => enqueueSnackbar("Kategori Berhasil Dihapus", { variant: 'success', autoHideDuration: 5000 }),
                                                        })).catch(()=>0)
                                                }}>Hapus</MenuItem>
                                            </MenuButton>
                                        </TableCell>
                                    </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </Stack>
            <CreateKategori kategori={selectedKategori} open={createModalOpen} onClose={handleCloseCreateModal} />
        </MainLayout>
    )
}