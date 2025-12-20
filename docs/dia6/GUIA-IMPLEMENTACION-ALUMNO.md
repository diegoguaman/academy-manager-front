# 📘 Guía Completa: Implementación de Alumno (CRUD)

Esta guía te muestra paso a paso cómo implementar un CRUD completo siguiendo el patrón establecido en el proyecto. Usaremos **Alumno** como ejemplo, pero este mismo patrón se aplica a todas las entidades.

---

## 🎯 Objetivo

Crear un CRUD completo para la entidad **Alumno** (Usuario con rol ALUMNO) que incluya:
- ✅ Tipos TypeScript
- ✅ Servicio GraphQL
- ✅ Hooks de React Query
- ✅ Componentes de UI (Lista y Formulario)
- ✅ Página de dashboard
- ✅ Manejo de errores
- ✅ Notificaciones

---

## 📋 Paso 1: Analizar el Schema GraphQL

Primero, revisamos qué campos tiene `Usuario` en el schema:

```graphql
type Usuario {
    idUsuario: ID!
    email: String!
    rol: Rol!
    activo: Boolean!
    fechaCreacion: DateTime!
    datosPersonales: DatosPersonales
}

type DatosPersonales {
    idDatosPersonales: ID!
    nombre: String!
    apellidos: String!
    dni: String
    telefono: String
    direccion: String
    discapacidadPorcentaje: BigDecimal
}

input UsuarioInput {
    email: String!
    password: String
    rol: Rol!
    activo: Boolean
}
```

**Observaciones importantes**:
- `Usuario` tiene relación opcional con `DatosPersonales`
- Para crear un alumno, necesitamos `UsuarioInput` con `rol: ALUMNO`
- El backend probablemente crea `DatosPersonales` automáticamente o en un paso separado

---

## 📝 Paso 2: Crear Tipos TypeScript

**Archivo**: `src/features/alumnos/types/alumno.types.ts`

```typescript
/**
 * Alumno: Usuario con rol ALUMNO y sus datos personales
 * Mapea la respuesta de GraphQL a tipos TypeScript
 */
export interface Alumno {
  idUsuario: string;
  email: string;
  rol: 'ALUMNO';
  activo: boolean;
  fechaCreacion: string;
  datosPersonales?: DatosPersonales;
}

/**
 * Datos personales del alumno
 */
export interface DatosPersonales {
  idDatosPersonales: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  discapacidadPorcentaje?: number;
}

/**
 * Input para crear un nuevo alumno
 * Mapea UsuarioInput del schema GraphQL
 */
export interface AlumnoInput {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

/**
 * Input para actualizar un alumno existente
 */
export interface AlumnoUpdateInput {
  email?: string;
  password?: string;
  nombre?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

/**
 * Respuesta de creación de alumno
 */
export interface AlumnoCreated {
  idUsuario: string;
  email: string;
  rol: 'ALUMNO';
  activo: boolean;
  fechaCreacion: string;
}
```

**Explicación**:
- Separamos `AlumnoInput` (para crear) de `AlumnoUpdateInput` (para actualizar)
- `AlumnoInput` incluye campos de `DatosPersonales` porque el backend probablemente los crea juntos
- Usamos tipos literales (`'ALUMNO'`) para type-safety

---

## 🔧 Paso 3: Crear Servicio GraphQL

**Archivo**: `src/features/alumnos/services/alumno-service.ts`

```typescript
import { graphqlRequest } from '@/shared/lib/graphql/client';
import type {
  Alumno,
  AlumnoInput,
  AlumnoUpdateInput,
  AlumnoCreated,
} from '../types/alumno.types';

/**
 * Query para obtener todos los alumnos
 * Filtra por rol: ALUMNO
 */
const GET_ALUMNOS_QUERY = `
  query GetAlumnos($activo: Boolean) {
    usuarios(rol: ALUMNO) {
      idUsuario
      email
      rol
      activo
      fechaCreacion
      datosPersonales {
        idDatosPersonales
        nombre
        apellidos
        dni
        telefono
        direccion
        discapacidadPorcentaje
      }
    }
  }
`;

/**
 * Query para obtener un alumno por ID
 */
const GET_ALUMNO_QUERY = `
  query GetAlumno($id: ID!) {
    usuario(id: $id) {
      idUsuario
      email
      rol
      activo
      fechaCreacion
      datosPersonales {
        idDatosPersonales
        nombre
        apellidos
        dni
        telefono
        direccion
        discapacidadPorcentaje
      }
    }
  }
`;

/**
 * Mutation para crear un nuevo alumno
 * IMPORTANTE: El backend espera UsuarioInput, pero probablemente
 * crea DatosPersonales automáticamente con nombre/apellidos del input
 */
const CREATE_ALUMNO_MUTATION = `
  mutation CreateAlumno($input: UsuarioInput!) {
    createUsuario(input: $input) {
      idUsuario
      email
      rol
      activo
      fechaCreacion
    }
  }
`;

/**
 * Mutation para actualizar un alumno
 */
const UPDATE_ALUMNO_MUTATION = `
  mutation UpdateAlumno($id: ID!, $input: UsuarioInput!) {
    updateUsuario(id: $id, input: $input) {
      idUsuario
      email
      rol
      activo
      datosPersonales {
        idDatosPersonales
        nombre
        apellidos
        dni
        telefono
        direccion
      }
    }
  }
`;

/**
 * Mutation para eliminar (desactivar) un alumno
 */
const DELETE_ALUMNO_MUTATION = `
  mutation DeleteAlumno($id: ID!) {
    deleteUsuario(id: $id)
  }
`;

/**
 * Servicio de alumnos
 * Encapsula todas las operaciones GraphQL relacionadas con alumnos
 */
export const alumnoService = {
  /**
   * Obtener todos los alumnos
   * @param activo - Filtrar por estado activo/inactivo
   */
  async getAlumnos(activo?: boolean): Promise<Alumno[]> {
    const data = await graphqlRequest<{ usuarios: Alumno[] }>(
      GET_ALUMNOS_QUERY,
      { activo }
    );
    return data.usuarios;
  },

  /**
   * Obtener un alumno por ID
   */
  async getAlumno(id: string): Promise<Alumno> {
    const data = await graphqlRequest<{ usuario: Alumno }>(
      GET_ALUMNO_QUERY,
      { id }
    );
    return data.usuario;
  },

  /**
   * Crear un nuevo alumno
   * NOTA: El backend puede requerir crear Usuario primero y luego DatosPersonales
   * Ajusta según la implementación real del backend
   */
  async createAlumno(input: AlumnoInput): Promise<AlumnoCreated> {
    // Mapear AlumnoInput a UsuarioInput del schema
    const usuarioInput = {
      email: input.email,
      password: input.password,
      rol: 'ALUMNO' as const,
      activo: input.activo ?? true,
    };

    const data = await graphqlRequest<{ createUsuario: AlumnoCreated }>(
      CREATE_ALUMNO_MUTATION,
      { input: usuarioInput }
    );
    return data.createUsuario;
  },

  /**
   * Actualizar un alumno existente
   */
  async updateAlumno(
    id: string,
    input: AlumnoUpdateInput
  ): Promise<Alumno> {
    const usuarioInput: {
      email?: string;
      password?: string;
      rol: 'ALUMNO';
      activo?: boolean;
    } = {
      rol: 'ALUMNO',
      ...(input.email && { email: input.email }),
      ...(input.password && { password: input.password }),
      ...(input.activo !== undefined && { activo: input.activo }),
    };

    const data = await graphqlRequest<{ updateUsuario: Alumno }>(
      UPDATE_ALUMNO_MUTATION,
      { id, input: usuarioInput }
    );
    return data.updateUsuario;
  },

  /**
   * Eliminar (desactivar) un alumno
   */
  async deleteAlumno(id: string): Promise<boolean> {
    const data = await graphqlRequest<{ deleteUsuario: boolean }>(
      DELETE_ALUMNO_MUTATION,
      { id }
    );
    return data.deleteUsuario;
  },
};
```

**Explicación**:
- Cada operación tiene su query/mutation GraphQL
- El servicio mapea entre tipos TypeScript y el schema GraphQL
- Maneja la transformación de `AlumnoInput` a `UsuarioInput`

---

## 🎣 Paso 4: Crear Hooks de React Query

**Archivo**: `src/features/alumnos/hooks/use-alumnos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { alumnoService } from '../services/alumno-service';

/**
 * Hook para obtener todos los alumnos
 * @param activo - Filtrar por estado activo/inactivo
 */
export function useAlumnos(activo?: boolean) {
  return useQuery({
    queryKey: ['alumnos', activo],
    queryFn: () => alumnoService.getAlumnos(activo),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener un alumno por ID
 */
export function useAlumno(id: string) {
  return useQuery({
    queryKey: ['alumno', id],
    queryFn: () => alumnoService.getAlumno(id),
    enabled: !!id, // Solo ejecutar si hay ID
  });
}
```

**Archivo**: `src/features/alumnos/hooks/use-alumno-mutations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnoService } from '../services/alumno-service';
import type { AlumnoInput, AlumnoUpdateInput } from '../types/alumno.types';
import { useNotifications } from '@/shared/stores/notification-store';
import { handleGraphQLError } from '@/shared/lib/errors/error-handler';

/**
 * Hook para crear un nuevo alumno
 */
export function useCreateAlumno() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (input: AlumnoInput) => alumnoService.createAlumno(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      notifications.success('Alumno creado exitosamente');
    },
    onError: (error: unknown) => {
      const errorMessage = handleGraphQLError(error);
      notifications.error(errorMessage);
    },
  });
}

/**
 * Hook para actualizar un alumno
 */
export function useUpdateAlumno() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: AlumnoUpdateInput;
    }) => alumnoService.updateAlumno(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['alumno'] });
      notifications.success('Alumno actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const errorMessage = handleGraphQLError(error);
      notifications.error(errorMessage);
    },
  });
}

/**
 * Hook para eliminar un alumno
 */
export function useDeleteAlumno() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (id: string) => alumnoService.deleteAlumno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      notifications.success('Alumno eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const errorMessage = handleGraphQLError(error);
      notifications.error(errorMessage);
    },
  });
}
```

**Explicación**:
- `useAlumnos` y `useAlumno` para queries (lectura)
- `useCreateAlumno`, `useUpdateAlumno`, `useDeleteAlumno` para mutations (escritura)
- Invalidación de cache después de mutations
- Manejo de errores centralizado con `handleGraphQLError`

---

## 🎨 Paso 5: Crear Componente de Lista

**Archivo**: `src/features/alumnos/components/alumno-list.tsx`

```typescript
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
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAlumnos } from '../hooks/use-alumnos';
import { useDeleteAlumno } from '../hooks/use-alumno-mutations';
import type { Alumno } from '../types/alumno.types';

interface AlumnoListProps {
  onEdit?: (alumno: Alumno) => void;
  showActions?: boolean;
}

export function AlumnoList({ onEdit, showActions = true }: AlumnoListProps) {
  const { data: alumnos, isLoading, error } = useAlumnos();
  const deleteMutation = useDeleteAlumno();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar alumnos</Alert>;
  }

  if (!alumnos || alumnos.length === 0) {
    return <Alert severity="info">No hay alumnos registrados</Alert>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>DNI</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Estado</TableCell>
            {showActions && <TableCell align="right">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {alumnos.map((alumno) => (
            <TableRow key={alumno.idUsuario}>
              <TableCell>
                {alumno.datosPersonales
                  ? `${alumno.datosPersonales.nombre} ${alumno.datosPersonales.apellidos}`
                  : 'Sin datos personales'}
              </TableCell>
              <TableCell>{alumno.email}</TableCell>
              <TableCell>{alumno.datosPersonales?.dni || '-'}</TableCell>
              <TableCell>{alumno.datosPersonales?.telefono || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={alumno.activo ? 'Activo' : 'Inactivo'}
                  color={alumno.activo ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              {showActions && (
                <TableCell align="right">
                  {onEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(alumno)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(alumno.idUsuario)}
                    color="error"
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

**Explicación**:
- Muestra lista de alumnos en tabla Material UI
- Estados de loading, error y vacío
- Acciones de editar y eliminar
- Chips para estado activo/inactivo

---

## 📝 Paso 6: Crear Componente de Formulario

**Archivo**: `src/features/alumnos/components/alumno-form.tsx`

```typescript
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
  Grid,
} from '@mui/material';
import type { Alumno, AlumnoInput, AlumnoUpdateInput } from '../types/alumno.types';

/**
 * Schema de validación para crear alumno
 */
const createAlumnoSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  activo: z.boolean().default(true),
});

/**
 * Schema de validación para actualizar alumno
 */
const updateAlumnoSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  nombre: z.string().min(1, 'Nombre requerido').optional(),
  apellidos: z.string().min(1, 'Apellidos requeridos').optional(),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  activo: z.boolean().optional(),
});

type CreateAlumnoFormData = z.infer<typeof createAlumnoSchema>;
type UpdateAlumnoFormData = z.infer<typeof updateAlumnoSchema>;

interface AlumnoFormProps {
  initialData?: Alumno;
  onSubmit: (data: AlumnoInput | AlumnoUpdateInput) => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function AlumnoForm({
  initialData,
  onSubmit,
  isLoading,
  mode = 'create',
}: AlumnoFormProps) {
  const isEditMode = mode === 'edit';
  const schema = isEditMode ? updateAlumnoSchema : createAlumnoSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateAlumnoFormData | UpdateAlumnoFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          email: initialData.email,
          nombre: initialData.datosPersonales?.nombre || '',
          apellidos: initialData.datosPersonales?.apellidos || '',
          dni: initialData.datosPersonales?.dni || '',
          telefono: initialData.datosPersonales?.telefono || '',
          direccion: initialData.datosPersonales?.direccion || '',
          activo: initialData.activo,
        }
      : {
          activo: true,
        },
  });

  const activo = watch('activo');

  const onSubmitForm = (data: CreateAlumnoFormData | UpdateAlumnoFormData) => {
    // Si es modo edición y password está vacío, no lo incluimos
    if (isEditMode && 'password' in data && !data.password) {
      const { password, ...rest } = data;
      onSubmit(rest);
    } else {
      onSubmit(data as AlumnoInput | AlumnoUpdateInput);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            required
            disabled={isEditMode} // Email no se puede cambiar
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={
              errors.password?.message ||
              (isEditMode ? 'Dejar vacío para no cambiar' : '')
            }
            required={!isEditMode}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre"
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Apellidos"
            {...register('apellidos')}
            error={!!errors.apellidos}
            helperText={errors.apellidos?.message}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="DNI"
            {...register('dni')}
            error={!!errors.dni}
            helperText={errors.dni?.message}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Teléfono"
            {...register('telefono')}
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            multiline
            rows={2}
            {...register('direccion')}
            error={!!errors.direccion}
            helperText={errors.direccion?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={activo ?? true}
                onChange={(e) => setValue('activo', e.target.checked)}
              />
            }
            label="Activo"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isLoading
              ? 'Guardando...'
              : isEditMode
              ? 'Actualizar Alumno'
              : 'Crear Alumno'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
```

**Explicación**:
- Formulario con validación Zod
- Modo create/edit
- Password opcional en modo edición
- Grid responsive de Material UI

---

## 📄 Paso 7: Crear Página del Dashboard

**Archivo**: `src/app/dashboard/alumno/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AlumnoList } from '@/features/alumnos/components/alumno-list';
import { AlumnoForm } from '@/features/alumnos/components/alumno-form';
import { useCreateAlumno, useUpdateAlumno } from '@/features/alumnos/hooks/use-alumno-mutations';
import type { Alumno, AlumnoInput, AlumnoUpdateInput } from '@/features/alumnos/types/alumno.types';

export default function AlumnoPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

  const createMutation = useCreateAlumno();
  const updateMutation = useUpdateAlumno();

  const handleCreate = async (data: AlumnoInput | AlumnoUpdateInput) => {
    if (editingAlumno) {
      await updateMutation.mutateAsync({
        id: editingAlumno.idUsuario,
        input: data as AlumnoUpdateInput,
      });
    } else {
      await createMutation.mutateAsync(data as AlumnoInput);
    }
    setOpenDialog(false);
    setEditingAlumno(null);
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingAlumno(null);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Alumnos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingAlumno(null);
            setOpenDialog(true);
          }}
        >
          Nuevo Alumno
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <AlumnoList onEdit={handleEdit} />
      </Paper>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
        </DialogTitle>
        <DialogContent>
          <AlumnoForm
            initialData={editingAlumno || undefined}
            onSubmit={handleCreate}
            isLoading={isLoading}
            mode={editingAlumno ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
```

**Explicación**:
- Página completa con lista y formulario
- Dialog para crear/editar
- Integración con mutations

---

## ✅ Checklist de Verificación

Después de implementar, verifica:

- [ ] Los tipos TypeScript coinciden con el schema GraphQL
- [ ] Las queries/mutations funcionan en GraphiQL
- [ ] El formulario valida correctamente
- [ ] Las notificaciones aparecen al crear/editar/eliminar
- [ ] Los errores se muestran correctamente
- [ ] La lista se actualiza después de mutations
- [ ] El código compila sin errores TypeScript
- [ ] No hay errores de ESLint

---

## 🎓 Aprendizajes Clave

1. **Patrón Feature-Based**: Cada feature es independiente
2. **Separación de responsabilidades**: Types → Service → Hooks → Components
3. **Type-Safety**: TypeScript en cada capa
4. **React Query**: Cache y sincronización automática
5. **Manejo de errores**: Centralizado y user-friendly

---

## 🔄 Siguiente Paso

Una vez completado Alumno, aplica el mismo patrón a:
- Convocatorias
- Matrículas
- Centros
- Empresas
- Materias
- Formatos

Ver `docs/dia6/ENTIDADES-PENDIENTES.md` para la lista completa.

