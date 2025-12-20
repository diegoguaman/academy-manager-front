# 🏠 Home y Navbar Responsive

Este documento explica cómo crear una página home y un navbar responsive con Material UI.

---

## 🎯 Objetivo

Crear:
- ✅ Navbar responsive con Material UI AppBar
- ✅ Navegación protegida por roles
- ✅ Página home con dashboard básico
- ✅ Integración con sistema de autenticación

---

## 📁 Estructura de Archivos

```
src/shared/components/layout/
  ├── navbar.tsx              # Componente Navbar
  └── home-stats.tsx          # Componente de estadísticas (opcional)

src/app/
  ├── page.tsx                # Página home
  └── dashboard/
      └── layout.tsx          # Layout con Navbar
```

---

## 🔧 Paso 1: Crear Navbar Responsive

**Archivo**: `src/shared/components/layout/navbar.tsx`

```typescript
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
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Academia Multi-Centro
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.nombre || user?.email}
            </Typography>
            
            <IconButton
              size="large"
              edge="end"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
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
```

---

## 🏠 Paso 2: Crear Página Home

**Archivo**: `src/app/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/auth-context';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}
```

---

## 📊 Paso 3: Crear Dashboard Home

**Archivo**: `src/app/dashboard/page.tsx`

```typescript
'use client';

import { Container, Typography, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import { useAuth } from '@/shared/contexts/auth-context';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import { useCursos } from '@/features/cursos/hooks/use-cursos';
import { useAlumnos } from '@/features/alumnos/hooks/use-alumnos';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: cursos } = useCursos(true);
  const { data: alumnos } = useAlumnos(true);

  const stats = [
    {
      title: 'Cursos Activos',
      value: cursos?.length || 0,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Alumnos Activos',
      value: alumnos?.length || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Convocatorias',
      value: 0, // TODO: Implementar cuando esté listo
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido, {user?.nombre || user?.email}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Panel de control - {user?.rol}
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sección de acciones rápidas */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">Nuevo Curso</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">Nuevo Alumno</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
```

---

## 🔧 Paso 4: Actualizar Layout del Dashboard

**Archivo**: `src/app/dashboard/layout.tsx`

```typescript
import { Box } from '@mui/material';
import { Navbar } from '@/shared/components/layout/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Altura del AppBar
          ml: { md: '240px' }, // Ancho del sidebar en desktop
        }}
      >
        {children}
      </Box>
    </>
  );
}
```

---

## 📱 Paso 5: Ajustar para Responsive

El Navbar ya es responsive usando `useMediaQuery` de Material UI. Para mejorar aún más:

**Actualizar**: `src/app/dashboard/layout.tsx`

```typescript
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Navbar } from '@/shared/components/layout/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8, // Altura del AppBar
          ml: { md: '240px' }, // Ancho del sidebar solo en desktop
        }}
      >
        {children}
      </Box>
    </>
  );
}
```

---

## ✅ Checklist de Verificación

- [ ] Navbar se muestra correctamente
- [ ] Menú se filtra según rol del usuario
- [ ] Sidebar funciona en desktop y móvil
- [ ] Navegación funciona correctamente
- [ ] Logout redirige a login
- [ ] Dashboard muestra estadísticas
- [ ] Responsive en móvil, tablet y desktop
- [ ] Integración con autenticación funciona

---

## 🎓 Aprendizajes Clave

1. **Material UI AppBar**: Componente estándar para navbar
2. **Drawer**: Sidebar responsive con Material UI
3. **useMediaQuery**: Hook para detectar breakpoints
4. **Navegación por roles**: Filtrar menú según permisos
5. **Layout anidado**: Next.js permite layouts por ruta

---

## 🔄 Mejoras Futuras

- [ ] Agregar breadcrumbs
- [ ] Notificaciones en navbar
- [ ] Búsqueda global
- [ ] Tema claro/oscuro
- [ ] Estadísticas en tiempo real

