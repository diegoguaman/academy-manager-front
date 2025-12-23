'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '../types/auth.types';
import { authService } from '@/features/auth/services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper para sincronizar token entre localStorage y cookies
 * Esto permite que el middleware (que lee cookies) y el cliente (que lee localStorage) estén sincronizados
 */
function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem('token', token);
    // Establecer cookie para que el middleware pueda leerla
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    localStorage.removeItem('token');
    // Eliminar cookie
    document.cookie = 'token=; path=/; max-age=0';
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Helper para guardar datos del usuario en localStorage
 */
function setUserData(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

/**
 * Helper para obtener datos del usuario desde localStorage
 */
function getUserData(): User | null {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getUserData();
    
    if (storedToken && storedUser) {
      // Restaurar sesión desde localStorage
      setToken(storedToken);
      setUser(storedUser);
    } else if (storedToken && !storedUser) {
      // Token existe pero no hay datos de usuario (sesión inconsistente)
      // Limpiar token inválido
      setAuthToken(null);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        // 1. Llamar al servicio de autenticación
        const response = await authService.login({ email, password });

        // 2. Validar que la respuesta tenga la estructura esperada
        if (!response) {
          throw new Error('Respuesta vacía del servidor');
        }

        if (!response.token) {
          throw new Error('No se recibió token de autenticación');
        }

        if (!response.email || !response.rol || !response.nombre) {
          throw new Error('Datos de usuario incompletos en la respuesta');
        }

        const authToken = response.token;

        // 3. Mapear respuesta del backend al tipo User interno de la aplicación
        // El backend devuelve estructura plana: { token, email, rol, nombre }
        // Lo convertimos a: { id, email, nombre, rol } para el contexto
        const userData: User = {
          // El backend no envía ID, usamos el email como identificador temporal
          // En producción, el backend debería enviar un ID único
          id: response.email, // TODO: Usar ID real cuando el backend lo proporcione
          email: response.email,
          nombre: response.nombre,
          rol: response.rol as User['rol'], // Type assertion porque sabemos que es válido
        };

        // 4. Guardar token y datos de usuario en el estado
        setToken(authToken);
        setUser(userData);

        // 5. Persistir token y datos de usuario en localStorage
        // Esto permite restaurar la sesión al recargar la página
        setAuthToken(authToken);
        setUserData(userData);

        // 6. Redirigir al dashboard después de login exitoso
        router.push('/dashboard');
      } catch (error) {
        // Si hay error, limpiar estado de autenticación
        setToken(null);
        setUser(null);
        setAuthToken(null);

        // Extraer mensaje de error apropiado
        let errorMessage = 'Error al iniciar sesión';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          // Intentar extraer mensaje de error de Axios
          const axiosError = error as { response?: { data?: { message?: string } } };
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }

        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setUserData(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading,
    }),
    [user, token, login, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}