import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';
import type { CursoInput } from '../types/curso.types';
import { useNotifications } from '@/shared/stores/notification-store';

export function useCreateCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (input: CursoInput) => cursoService.createCurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.success('Curso creado exitosamente');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Error al crear curso';
      
      // Manejar errores de GraphQL
      if (
        error &&
        typeof error === 'object' &&
        'response' in error
      ) {
        const graphqlError = error as {
          response?: {
            errors?: Array<{ message?: string; extensions?: { classification?: string } }>;
          };
        };
        
        const firstError = graphqlError.response?.errors?.[0];
        if (firstError) {
          if (firstError.extensions?.classification === 'FORBIDDEN') {
            errorMessage = 'No tienes permisos para crear cursos. Contacta al administrador.';
          } else {
            errorMessage = firstError.message || errorMessage;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      notifications.error(errorMessage);
    },
  });
}