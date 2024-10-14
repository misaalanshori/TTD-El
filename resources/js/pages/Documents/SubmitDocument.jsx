import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout/MainLayout";
import { FileUpload } from "@mui/icons-material";

export default function SubmitDocument() {
    return (
        <MainLayout>
            <Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
                <Card sx={{ maxWidth: "70vw", width: "400px", p: 2 }} elevation={2}>
                    <CardContent>
                        <Stack sx={{ alignItems: "center" }} gap={2}>
                            <Box sx={{ p: 1, border: 2, borderColor: "lightgray", borderRadius: "16px" }}>
                                <FileUpload sx={{ color: "gray", fontSize: "72px" }} />
                            </Box>
                            <Typography sx={{ width: "70%", px: 2 }} align="center">
                                Tarik file atau tekan untuk mengunggah dokumen (*.pdf)
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </MainLayout>
    )
}