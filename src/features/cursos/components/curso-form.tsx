'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';
import type { CursoInput } from '../types/curso.types';

const cursoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  idMateria: z.string().min(1, 'Materia requerida'),
  idFormato: z.string().min(1, 'Formato requerido'),
  precioBase: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  duracionHoras: z.number().optional(),
  activo: z.boolean().optional(),
});

type CursoFormData = z.infer<typeof cursoSchema>;

interface CursoFormProps {
  initialData?: CursoFormData;
  onSubmit: (data: CursoInput) => void;
  isLoading?: boolean;
}

export function CursoForm({
  initialData,
  onSubmit,
  isLoading,
}: CursoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CursoFormData>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      activo: true,
      precioBase: 0,
      ...initialData,
    },
  });

  const { data: materias, isLoading: loadingMaterias } = useQuery({
    queryKey: ['materias', true],
    queryFn: () => cursoService.getMaterias(true),
  });

  const { data: formatos, isLoading: loadingFormatos } = useQuery({
    queryKey: ['formatos'],
    queryFn: () => cursoService.getFormatos(),
  });

  const activo = watch('activo', true);
  const idMateria = watch('idMateria');
  const idFormato = watch('idFormato');

  const handleFormSubmit = (data: CursoFormData) => {
    const cursoInput: CursoInput = {
      nombre: data.nombre,
      idMateria: data.idMateria,
      idFormato: data.idFormato,
      precioBase: data.precioBase,
      duracionHoras: data.duracionHoras,
      activo: data.activo ?? true,
    };
    onSubmit(cursoInput);
  };

  if (loadingMaterias || loadingFormatos) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ maxWidth: 600, mx: 'auto', p: 3 }}
    >
      <TextField
        fullWidth
        label="Nombre"
        {...register('nombre')}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        margin="normal"
        required
      />

      <FormControl
        fullWidth
        margin="normal"
        error={!!errors.idMateria}
        required
      >
        <InputLabel id="materia-label">Materia</InputLabel>
        <Select
          labelId="materia-label"
          id="materia"
          label="Materia"
          value={idMateria || ''}
          {...register('idMateria')}
          onChange={(e) => setValue('idMateria', e.target.value)}
        >
          {materias?.map((materia) => (
            <MenuItem key={materia.idMateria} value={materia.idMateria}>
              {materia.nombre}
            </MenuItem>
          ))}
        </Select>
        {errors.idMateria && (
          <FormHelperText>{errors.idMateria.message}</FormHelperText>
        )}
      </FormControl>

      <FormControl
        fullWidth
        margin="normal"
        error={!!errors.idFormato}
        required
      >
        <InputLabel id="formato-label">Formato</InputLabel>
        <Select
          labelId="formato-label"
          id="formato"
          label="Formato"
          value={idFormato || ''}
          {...register('idFormato')}
          onChange={(e) => setValue('idFormato', e.target.value)}
        >
          {formatos?.map((formato) => (
            <MenuItem key={formato.idFormato} value={formato.idFormato}>
              {formato.nombre}
            </MenuItem>
          ))}
        </Select>
        {errors.idFormato && (
          <FormHelperText>{errors.idFormato.message}</FormHelperText>
        )}
      </FormControl>

      <TextField
        fullWidth
        label="Precio Base"
        type="number"
        inputProps={{ step: '0.01', min: 0 }}
        {...register('precioBase', { valueAsNumber: true })}
        error={!!errors.precioBase}
        helperText={errors.precioBase?.message}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Duración (horas)"
        type="number"
        inputProps={{ min: 0 }}
        {...register('duracionHoras', { valueAsNumber: true })}
        error={!!errors.duracionHoras}
        helperText={errors.duracionHoras?.message}
        margin="normal"
      />

      <FormControlLabel
        control={
          <Switch
            checked={activo}
            onChange={(e) => setValue('activo', e.target.checked)}
          />
        }
        label="Activo"
        sx={{ mt: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        fullWidth
        sx={{ mt: 3 }}
      >
        {isLoading ? 'Guardando...' : 'Guardar Curso'}
      </Button>
    </Box>
  );
}