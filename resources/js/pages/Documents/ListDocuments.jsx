import { Stack, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout/MainLayout";

export default function ListDocuments() {
    return (
        <MainLayout>
            <Stack sx={{ p: 2 }}>
                <Typography variant="h2">Daftar Dokumen</Typography>
            </Stack>
        </MainLayout>
    )
}   