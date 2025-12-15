export interface Curso {
  idCurso: string;
  nombre: string;
  activo: boolean;
  materia?: {
    idMateria: string;
    nombre: string;
  };
  formato?: {
    idFormato: string;
    nombre: string;
  };
}

export interface CursoInput {
  nombre: string;
  descripcion?: string;
  activo: boolean;
  idMateria?: string;
  idFormato?: string;
}