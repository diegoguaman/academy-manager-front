import { useQuery } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';

export function useCursos(activo?: boolean) {
  return useQuery({
    queryKey: ['cursos', activo],
    queryFn: () => cursoService.getCursos(activo),
  });
}