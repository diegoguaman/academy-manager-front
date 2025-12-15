import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/lib/config/env';

/**
 * Obtener token de autenticación desde localStorage
 * Maneja el caso cuando localStorage no está disponible (SSR)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
}

/**
 * Cliente GraphQL configurado con interceptors para JWT
 * El headers se evalúa en cada request para obtener el token actualizado
 */
export const graphqlClient = new GraphQLClient(env.graphqlUrl, {
  headers: () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  },
});

/**
 * Realizar request GraphQL con manejo de errores mejorado
 */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    // Si es un error de autorización, podríamos redirigir a login
    // Por ahora solo relanzamos el error para que el componente lo maneje
    throw error;
  }
}