import MenuButton from "@/Components/MenuButton";
import { Link, usePage } from "@inertiajs/react";
import { AccountCircle, Add, FolderOutlined, Menu as MenuIcon, WorkOutline } from "@mui/icons-material";
import { AppBar, Box, ButtonBase, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useState } from "react";

function SidebarContents() {
    const theme = useTheme()
    const contents = [
        {
            icon: <Add />,
            text: "Submit Dokumen",
            route: "submitDocument",
        },
        {
            icon: <FolderOutlined />,
            text: "Daftar Dokumen",
            route: "showDocuments",
        },
        {
            icon: <WorkOutline />,
            text: "Daftar Jabatan",
            route: "showJabatan",
        },
    ]

    return (
        <List>
            {contents.map((v, i) => {
                const isActive = route().current(v.route);
                return (
                    <ListItem
                        key={i}
                        disablePadding
                        sx={{
                            backgroundColor: isActive ? `${theme.palette.primary.main}1f` : 'transparent',
                            color: isActive ? theme.palette.primary.main : 'inherit',
                        }}
                    >
                        <ListItemButton sx={{ px: 3, py: 2 }} component={Link} method="get" href={route(v.route)}>
                            <ListItemIcon>
                                <span style={{ color: isActive ? theme.palette.primary.main : 'inherit', }}>
                                    {v.icon}
                                </span>
                            </ListItemIcon>
                            <ListItemText primary={v.text} />
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    )

}

export default function MainLayout({ children, title = "Tanda Tangan Elektronik", noSidebar = false, sidebarContents = null, sidebarIcon = null, appbarActions = null }) {
    const auth = usePage().props.auth
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <Stack sx={{ height: "100vh", width: "100vw" }} direction="column">
            <AppBar sx={{ zIndex: 100 }} position="static">
                <Toolbar>
                    {noSidebar ? null :
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2, display: { md: "none" } }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            {sidebarIcon ?? <MenuIcon />}
                        </IconButton>}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    {
                        appbarActions ?? (auth?.user ?
                            <div>

                                <MenuButton
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    button={
                                        <ButtonBase sx={{ p: 1, borderRadius: "24px" }}>
                                            <Stack gap={1} direction="row">
                                                <Typography sx={{ display: { xs: "none", sm: "block" } }}>{auth.user.name}</Typography>
                                                <AccountCircle />
                                            </Stack>
                                        </ButtonBase>
                                    }
                                >
                                    <MenuItem component={Link} href={route('profile.edit')}>Profile</MenuItem>
                                    <MenuItem component={Link} method="post" href={route('logout')}>Log Out</MenuItem>
                                </MenuButton>
                            </div>
                            : null)
                    }
                </Toolbar>
            </AppBar>
            {noSidebar ? null :
                <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: 300 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                        <Typography sx={{ p: 2 }} align="center" variant="h6">
                            Tanda Tangan Elektronik
                        </Typography>
                        <Divider />
                        {sidebarContents ?? <SidebarContents />}
                    </Box>
                </Drawer>}

            <Stack sx={{ flexGrow: 1, overflow: "hidden" }} direction="row">
                {noSidebar ? null :
                    <Paper sx={{ width: 300, display: { xs: "none", md: "block" } }} elevation={4}>
                        {sidebarContents ?? <SidebarContents />}
                    </Paper>}
                <Box sx={{ flexGrow: 1, overflow: "auto", height: "100%" }}>
                    {children}
                </Box>
            </Stack>
        </Stack>
    )
}