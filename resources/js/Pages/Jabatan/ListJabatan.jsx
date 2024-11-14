import { Button, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import MainLayout from "@/Layouts/MainLayout/MainLayout";
import { Add, MoreVert } from "@mui/icons-material";
import { useState } from "react";
import CreateJabatan from "./partials/CreateJabatan";
import { useSnackbar } from "notistack";
import MenuButton from "@/Components/MenuButton";
import { useConfirm } from "material-ui-confirm";
import { router } from "@inertiajs/react";

export default function ListJabatan({ jabatan }) {
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [selectedJabatan, setSelectedJabatan] = useState(null)
    const handleOpenCreateModal = (item) => {
        if (item) {
            setSelectedJabatan(item);
        }
        setCreateModalOpen(true);
    }
    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setSelectedJabatan(null);
    }


    return (
        <MainLayout>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", justifyContent: { xs: "center", md: "space-between" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Jabatan</Typography>
                        <Button variant="contained" endIcon={<Add />} onClick={() => handleOpenCreateModal()}>Tambah Jabatan</Button>
                    </Stack>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Nama Jabatan</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Nomor Induk</TableCell>
                                    {/* <TableCell></TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jabatan.map((v, i) =>
                                    <TableRow key={i}>
                                        <TableCell>{v.jabatan}</TableCell>
                                        <TableCell>{v.nip}</TableCell>
                                        {/* <TableCell align="right">
                                            <MenuButton button={<IconButton><MoreVert /></IconButton>}>
                                                <MenuItem onClick={() => handleOpenCreateModal(v)}>Ubah</MenuItem>
                                                <MenuItem onClick={() => {
                                                    confirm({ title: "Hapus Jabatan?", description: `Ini akan menghapus jabatan ${v.jabatan}` })
                                                        .then(() => router.delete(route("deleteJabatan", { surat: v.id }), {
                                                            onFinish: () => enqueueSnackbar("Jabatan Berhasil Dihapus", { variant: 'success', autoHideDuration: 5000 }),
                                                        })).catch(()=>0)
                                                }}>Hapus</MenuItem>
                                            </MenuButton>
                                        </TableCell> */}
                                    </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </Stack>
            <CreateJabatan jabatan={selectedJabatan} open={createModalOpen} onClose={handleCloseCreateModal} />
        </MainLayout>
    )
}