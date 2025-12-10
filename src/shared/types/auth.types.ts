export type Rol = 'ADMIN' | 'PROFESOR' | 'ALUMNO' | 'ADMINISTRATIVO';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
