'use client';

import { Container, Box, Typography, Paper } from '@mui/material';
import { LoginForm } from '@/features/auth/components/login-form';

/**
 * Página de login
 * Componente cliente necesario porque usa hooks y formularios interactivos
 * El layout (auth) maneja la metadata y estructura básica
 */
export default function LoginPage() {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
}
