'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, MenuItem, TextField } from '@mui/material';
import { authService } from '../services/auth.service';
import type { RegisterRequest } from '../types/auth.types';

const ROLE_VALUES = ['PROFESOR', 'ALUMNO', 'ADMINISTRATIVO'] as const;

type RoleValue = (typeof ROLE_VALUES)[number];

const ROLE_OPTIONS: ReadonlyArray<{ value: RoleValue; label: string }> = [
  { value: 'PROFESOR', label: 'Profesor' },
  { value: 'ALUMNO', label: 'Alumno' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
];

const registerSchema = z.object({
  email: z.email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
  nombre: z.string().min(2, { message: 'Mínimo 2 caracteres' }),
  apellidos: z.string().min(2, { message: 'Mínimo 2 caracteres' }),
  rol: z.enum(ROLE_VALUES).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Form used to create a new account with the required profile fields.
 */
export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { rol: undefined },
  });

  const handleRegister = async (formData: RegisterFormData) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await authService.register(formData as RegisterRequest);
      setSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.');
      reset();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo completar el registro. Intenta nuevamente.';
      setError(message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleRegister)} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        autoComplete="email"
        autoFocus
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="new-password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="nombre"
        label="Nombre"
        autoComplete="given-name"
        {...register('nombre')}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="apellidos"
        label="Apellidos"
        autoComplete="family-name"
        {...register('apellidos')}
        error={!!errors.apellidos}
        helperText={errors.apellidos?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        select
        id="rol"
        label="Rol (opcional)"
        {...register('rol', {
          setValueAs: (value) => (value === '' ? undefined : value),
        })}
        error={!!errors.rol}
        helperText={errors.rol?.message}
        slotProps={{
          select: { displayEmpty: true },
        }}
      >
        <MenuItem value="">
          <em>Selecciona un rol</em>
        </MenuItem>
        {ROLE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registrando...' : 'Registrarse'}
      </Button>
    </Box>
  );
}

