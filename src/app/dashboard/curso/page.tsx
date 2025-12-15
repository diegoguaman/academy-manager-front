'use client';

import { CursoForm } from '@/features/cursos/components/curso-form';
import { CursoList } from '@/features/cursos/components/curso-list';
import { useCreateCurso } from '@/features/cursos/hooks/use-curso-mutations';
import { Box, Typography, Paper } from '@mui/material';

export default function CursoPage() {
  const createCursoMutation = useCreateCurso();

  const handleSubmit = async (data: Parameters<typeof createCursoMutation.mutate>[0]) => {
    createCursoMutation.mutate(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Cursos
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Crear Nuevo Curso
        </Typography>
        <CursoForm
          onSubmit={handleSubmit}
          isLoading={createCursoMutation.isPending}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lista de Cursos
        </Typography>
        <CursoList />
      </Paper>
    </Box>
  );
}