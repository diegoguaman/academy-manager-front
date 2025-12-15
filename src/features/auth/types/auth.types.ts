export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  rol?: string;
}

/**
 * Respuesta del backend al hacer login
 * La estructura real del backend es plana, no tiene objeto 'user' anidado
 */
export interface AuthResponse {
  token: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // Tiempo de expiración en milisegundos
  email: string;
  rol: string; // "ADMIN" | "PROFESOR" | "ALUMNO" | "ADMINISTRATIVO"
  nombre: string; // Nombre completo del usuario
}