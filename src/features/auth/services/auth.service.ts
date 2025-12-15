import { apiClient } from '@/shared/lib/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      
      // Validar que la respuesta tenga data
      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return response.data;
    } catch (error) {
      // Re-lanzar el error con contexto adicional
      console.log('Error en login:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        if (axiosError.response?.status === 401) {
          throw new Error('Credenciales inválidas');
        }
        if (axiosError.response?.status === 404) {
          throw new Error('Endpoint de autenticación no encontrado');
        }
        if (axiosError.response?.status === 500) {
          throw new Error('Error interno del servidor');
        }
      }
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/register',
        data
      );

      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        if (axiosError.response?.status === 409) {
          throw new Error('El usuario ya existe');
        }
      }
      throw error;
    }
  },
};