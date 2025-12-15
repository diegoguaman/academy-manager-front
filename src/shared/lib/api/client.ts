import axios, { AxiosError } from 'axios';
import { env } from '@/shared/lib/config/env';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Si no hay respuesta del servidor (conexión fallida, timeout, etc.)
    if (!error.response) {
      return Promise.reject(
        new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
      );
    }

    // Manejar diferentes códigos de estado
    const status = error.response.status;
    const data = error.response.data as { message?: string } | undefined;

    switch (status) {
      case 401:
        return Promise.reject(new Error(data?.message || 'No autorizado'));
      case 403:
        return Promise.reject(new Error(data?.message || 'Acceso denegado'));
      case 404:
        return Promise.reject(new Error(data?.message || 'Recurso no encontrado'));
      case 500:
        return Promise.reject(new Error(data?.message || 'Error interno del servidor'));
      default:
        return Promise.reject(
          new Error(data?.message || `Error: ${status}`)
        );
    }
  }
);