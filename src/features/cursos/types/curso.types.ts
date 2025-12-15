/**
 * Curso básico (sin relaciones materia/formato)
 * El backend tiene un bug: devuelve null para materia y formato aunque el schema dice que son requeridos
 * Por ahora, no solicitamos estos campos para evitar el error de GraphQL
 */
export interface Curso {
  idCurso: string;
  nombre: string;
  precioBase: number;
  duracionHoras?: number;
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

/**
 * Curso completo con relaciones (para cuando el backend esté corregido)
 */
export interface CursoCompleto extends Curso {
  materia: {
    idMateria: string;
    nombre: string;
  };
  formato: {
    idFormato: string;
    nombre: string;
  };
}

export interface CursoInput {
  nombre: string;
  idMateria: string;
  idFormato: string;
  precioBase: number;
  duracionHoras?: number;
  activo?: boolean;
}

export interface Materia {
  idMateria: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Formato {
  idFormato: string;
  nombre: string;
  descripcion?: string;
  activo: boolean; // Siempre true por defecto en el servicio
}

/**
 * Respuesta de creación de curso (sin relaciones materia/formato)
 * El backend no devuelve las relaciones al crear, solo al consultar
 */
export interface CursoCreated {
  idCurso: string;
  nombre: string;
  precioBase: number;
  duracionHoras?: number;
  activo: boolean;
}