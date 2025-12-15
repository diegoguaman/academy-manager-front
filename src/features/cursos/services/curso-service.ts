import { graphqlRequest } from '@/shared/lib/graphql/client';
import type {
  Curso,
  CursoInput,
  CursoCreated,
  Materia,
  Formato,
} from '../types/curso.types';

const GET_CURSOS_QUERY = `
  query GetCursos($activo: Boolean) {
    cursos(activo: $activo) {
      idCurso
      nombre
      precioBase
      duracionHoras
      activo
    }
  }
`;

const GET_MATERIAS_QUERY = `
  query GetMaterias($activo: Boolean) {
    materias(activo: $activo) {
      idMateria
      nombre
      descripcion
      activo
    }
  }
`;

const GET_FORMATOS_QUERY = `
  query GetFormatos {
    formatos {
      idFormato
      nombre
      descripcion
    }
  }
`;

const CREATE_CURSO_MUTATION = `
  mutation CreateCurso($input: CursoInput!) {
    createCurso(input: $input) {
      idCurso
      nombre
      precioBase
      duracionHoras
      activo
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

  async getMaterias(activo?: boolean): Promise<Materia[]> {
    const data = await graphqlRequest<{ materias: Materia[] }>(
      GET_MATERIAS_QUERY,
      { activo }
    );
    return data.materias;
  },

  async getFormatos(): Promise<Formato[]> {
    const data = await graphqlRequest<{ formatos: Formato[] }>(
      GET_FORMATOS_QUERY
    );
    // Proporcionar valor por defecto para activo ya que no lo solicitamos en la query
    return data.formatos.map((formato) => ({
      ...formato,
      activo: true,
    }));
  },

  async createCurso(input: CursoInput): Promise<CursoCreated> {
    const data = await graphqlRequest<{ createCurso: CursoCreated }>(
      CREATE_CURSO_MUTATION,
      { input }
    );
    return data.createCurso;
  },
};