'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '@/shared/contexts/auth-context';
import { useUiStore } from '@/shared/stores/ui-store';

const DRAWER_WIDTH = 240;

/**
 * Items del menú de navegación
 * Se filtran según el rol del usuario
 */
const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['ADMIN', 'PROFESOR', 'ALUMNO', 'ADMINISTRATIVO'],
  },
  {
    label: 'Cursos',
    path: '/dashboard/curso',
    icon: <SchoolIcon />,
    roles: ['ADMIN', 'PROFESOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Alumnos',
    path: '/dashboard/alumno',
    icon: <PeopleIcon />,
    roles: ['ADMIN', 'PROFESOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Convocatorias',
    path: '/dashboard/convocatoria',
    icon: <EventIcon />,
    roles: ['ADMIN', 'PROFESOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Centros',
    path: '/dashboard/centro',
    icon: <BusinessIcon />,
    roles: ['ADMIN', 'ADMINISTRATIVO'],
  },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user, logout, isAuthenticated } = useAuth();
  const { isSidebarOpen, setSidebarOpen } = useUiStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Filtrar items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) =>
    user?.rol ? item.roles.includes(user.rol) : false
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Academia Multi-Centro
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Typography variant="body2">
                {user?.nombre || user?.email}
              </Typography>
            )}

            <IconButton
              size="large"
              edge="end"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.nombre?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton> 
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar para desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              mt: 8, // Altura del AppBar
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {filteredMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Sidebar móvil (Drawer temporal) */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <Box sx={{ width: DRAWER_WIDTH, pt: 8 }}>
            <List>
              {filteredMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
}
