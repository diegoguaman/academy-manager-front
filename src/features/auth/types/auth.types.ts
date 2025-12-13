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

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellidos: string;
    rol: string;
  };
}