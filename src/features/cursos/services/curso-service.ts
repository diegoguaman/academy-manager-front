import { graphqlRequest } from '@/shared/lib/graphql/client';
import type { Curso, CursoInput } from '../types/curso.types';

const GET_CURSOS_QUERY = `
  query GetCursos($activo: Boolean) {
    cursos(activo: $activo) {
      idCurso
      nombre
      activo
      materia {
        idMateria
        nombre
      }
      formato {
        idFormato
        nombre
      }
    }
  }
`;

export const cursoService = {
  async getCursos(activo?: boolean): Promise<Curso[]> {
    const data = await graphqlRequest<{ cursos: Curso[] }>(
      GET_CURSOS_QUERY,
      { activo }
    );
    return data.cursos;
  },
};