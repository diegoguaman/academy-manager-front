'use client';

import { Container, Box, Typography, Paper } from '@mui/material';
import { RegisterForm } from '@/features/auth/components/register-form';

/**
 * Register page that redirects to login after successful sign up.
 */
export default function RegisterPage() {
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
            Crear cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Completa los datos para registrarte
          </Typography>
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  );
}

