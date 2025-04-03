import '@/../css/app.css';
import { Typography, Stack, Card } from '@mui/material';

export default function AuthWrapper({ title, children }) {
    return (
        <Stack sx={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Card sx={{ p: 2, maxWidth: "80vw", width: "500px" }}>
                <Stack gap={2}>
                    <h2 className="block text-sm font-medium text-gray-700 text-xl">{title}</h2>
                    {children}
                </Stack>
            </Card>
        </Stack>
    )
}
