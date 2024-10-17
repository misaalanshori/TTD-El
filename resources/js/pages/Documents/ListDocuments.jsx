import { Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import MainLayout from "../../layouts/MainLayout/MainLayout";
import { MoreVert, Search } from "@mui/icons-material";
import { useState } from "react";

export default function ListDocuments() {
    const [selectedFilter, setSelectedFilter] = useState(0);
    const theme = useTheme()

    const data = [
        {
            title: "Sebuah Dokumen",
            identifier: "Caatis/xxxx/abc/123",
            signer: [
                { id: 2, name: "Isa Insan Mulia" },
                { id: 6, name: "Rahmat Yasirandi" },
            ],
            description: "Deskripsi Keterangan yang diberikan saat sebuah dokumen ditandatangan",
            isSigned: true
        },
        {
            title: "Ini adalah judul dokumen",
            identifier: "Caatis/yyyy/def/456",
            signer: [
                { id: 2, name: "Isa Insan Mulia" },
                { id: 6, name: "Rahmat Yasirandi" },
                { id: 7, name: "Sheina Fathur" },
            ],
            description: "Dokumen ini belum diberikan tandatangan maka masih perlu untuk diproses oleh penandatangan",
            isSigned: false
        },
        {
            title: "Proposal Proyek Sistem Informasi",
            identifier: "Caatis/zzzz/ghi/789",
            signer: [
                { id: 3, name: "Muhammad Isa Al Anshori" },
                { id: 4, name: "Novian Anggis" },
            ],
            description: "Proposal ini memerlukan persetujuan dua pihak.",
            isSigned: true
        },
        {
            title: "Laporan Keuangan Semester 1",
            identifier: "Caatis/aaaa/jkl/101",
            signer: [
                { id: 1, name: "Adam Rafif Faqih" },
                { id: 5, name: "Rahma Sakti Rahardian" },
            ],
            description: "Laporan keuangan semester pertama tahun ini.",
            isSigned: false
        },
        {
            title: "Perjanjian Kerja Sama",
            identifier: "Caatis/bbbb/mno/112",
            signer: [
                { id: 6, name: "Rahmat Yasirandi" },
                { id: 7, name: "Sheina Fathur" },
            ],
            description: "Perjanjian kerja sama antara dua perusahaan.",
            isSigned: true
        },
        {
            title: "Surat Konfirmasi Pembayaran",
            identifier: "Caatis/cccc/pqr/113",
            signer: [
                { id: 1, name: "Adam Rafif Faqih" },
            ],
            description: "Dokumen konfirmasi pembayaran yang memerlukan satu tandatangan.",
            isSigned: false
        },
        {
            title: "Surat Tugas Karyawan",
            identifier: "Caatis/dddd/stu/114",
            signer: [
                { id: 3, name: "Muhammad Isa Al Anshori" },
                { id: 2, name: "Isa Insan Mulia" },
            ],
            description: "Surat tugas untuk penugasan proyek baru.",
            isSigned: true
        },
        {
            title: "Surat Pengajuan Cuti Tahunan",
            identifier: "Caatis/eeee/vwx/115",
            signer: [
                { id: 4, name: "Novian Anggis" },
                { id: 5, name: "Rahma Sakti Rahardian" },
            ],
            description: "Pengajuan cuti tahunan karyawan.",
            isSigned: false
        }
    ];

    const filter = [
        a => a,
        a => a.filter(v => v.isSigned),
        a => a.filter(v => !v.isSigned),
    ][selectedFilter]


    return (
        <MainLayout>
            <Stack sx={{ minHeight: "100%", alignItems: "center", p: 2 }} direction="column" gap={4}>
                <Stack sx={{ width: "95%", maxWidth: 1000, justifyContent: "center", alignItems: "center" }} gap={2}>
                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                        <Typography sx={{ fontWeight: 500 }} variant="h4">Daftar Dokumen</Typography>
                        <Stack sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", md: "end" }, flexGrow: 1, flexDirection: { xs: "column", sm: "row" } }} gap={1}>
                            <FormControl>
                                <InputLabel id="filter-select-label">Filter</InputLabel>
                                <Select
                                    sx={{ width: { xs: "100%", sm: "auto" }, borderRadius: 90 }}
                                    labelId="filter-select-label"
                                    id="filter-select"
                                    value={selectedFilter}
                                    label="Filter"
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                >
                                    <MenuItem value={0}>Semua</MenuItem>
                                    <MenuItem value={1}>Tertandatangan</MenuItem>
                                    <MenuItem value={2}>Belum Ditandatangani</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                sx={{ width: { xs: "100%", sm: "auto" }, alignSelf: "end" }}
                                label="Pencarian"
                                placeholder="Cari Dokumen"
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 90 },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Stack>
                    </Stack>
                    <Stack sx={{ width: "100%" }} gap={1}>
                        {filter(data).map((v, i) => (
                            <Card key={i} elevation={2}>
                                <CardContent sx={{ pb: "16px !important" }}>
                                    <Stack sx={{ width: "100%", alignItems: { xs: "start", md: "center" }, flexDirection: { xs: "column", md: "row" } }} gap={1}>
                                        <Stack sx={{ flexGrow: 1, overflow: "hidden" }} gap={0.5}>
                                            <Stack sx={{ alignItems: "center" }} direction="row" gap={1}>
                                                <Typography sx={{ fontWeight: 500 }}>{v.title}</Typography>
                                                <Paper sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                    <Typography sx={{ fontSize: 12 }}>{v.identifier}</Typography>
                                                </Paper>
                                            </Stack>
                                            <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" gap={1}>
                                                {
                                                    v.signer.map((s, i) => (
                                                        <Paper key={i} sx={{ px: 1, py: 0.2, borderRadius: 16 }}>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{s.name}</Typography>
                                                        </Paper>
                                                    ))
                                                }
                                            </Stack>
                                            <Typography sx={{ width: { xs: "70vw", md: "100%" }, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{v.description}</Typography>
                                        </Stack>
                                        <Stack sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "space-between" }} direction="row" gap={1}>
                                            <Paper sx={{ bgcolor: v.isSigned ? theme.palette.success.light : theme.palette.error.light, color: "white", px: 2, py: 1, borderRadius: 16 }}>
                                                <Typography sx={{ textWrap: "nowrap" }} align="center">{v.isSigned ? "Tertandatangan" : "Belum Ditandatangani"}</Typography>
                                            </Paper>
                                            <IconButton><MoreVert /></IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                    <Pagination></Pagination>
                </Stack>
            </Stack>
        </MainLayout>
    )
}   