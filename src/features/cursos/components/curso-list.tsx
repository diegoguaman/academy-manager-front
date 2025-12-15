'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCursos } from '../hooks/use-cursos';

export function CursoList() {
  const { data: cursos, isLoading, error } = useCursos();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error al cargar cursos</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cursos?.map((curso) => (
            <TableRow key={curso.idCurso}>
              <TableCell>{curso.nombre}</TableCell>
              <TableCell>{curso.activo ? 'Activo' : 'Inactivo'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}