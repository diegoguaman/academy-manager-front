import { GraphQLClient, ClientError } from 'graphql-request';
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
 * Limpiar datos de autenticación y redirigir a login
 * Se ejecuta cuando se detecta un token expirado (401)
 */
function handleTokenExpired(): void {
  if (typeof window === 'undefined') return;

  console.warn('[Auth] Token expirado detectado, limpiando sesión y redirigiendo a login');

  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Limpiar cookie - múltiples formas para asegurar que se elimine
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  
  // Forzar recarga y redirección
  // Usar replace en lugar de href para evitar que el usuario pueda volver atrás
  window.location.replace('/login');
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
 * Maneja automáticamente tokens expirados (401) limpiando la sesión y redirigiendo
 */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    // Verificar si es un error de autorización (401) - token expirado
    if (error instanceof ClientError) {
      let shouldRedirect = false;
      
      // Método 1: Verificar status code HTTP
      let statusCode: number | undefined;
      
      // Forma 1: propiedad directa statusCode
      if ('statusCode' in error && typeof (error as { statusCode?: number }).statusCode === 'number') {
        statusCode = (error as { statusCode: number }).statusCode;
      }
      // Forma 2: response.status (Response object de fetch)
      else if ('response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as { status?: number };
        statusCode = response.status;
      }
      
      if (statusCode === 401) {
        shouldRedirect = true;
        console.warn('[GraphQL] Token expirado detectado (401 status code), redirigiendo a login');
      }
      
      // Método 2: Verificar mensaje de error (el backend puede devolver el error en el mensaje)
      const errorMessage = error.message?.toLowerCase() || '';
      if (!shouldRedirect && (
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid token') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('jwt validation failed') ||
        errorMessage.includes('token has expired')
      )) {
        shouldRedirect = true;
        console.warn('[GraphQL] Token expirado detectado en mensaje de error, redirigiendo a login');
      }
      
      // Método 3: Verificar errores de GraphQL que indiquen autenticación fallida
      if (!shouldRedirect && error.response && typeof error.response === 'object') {
        const errors = (error.response as { errors?: unknown[] }).errors || [];
        const hasAuthError = errors.some((err: unknown) => {
          if (err && typeof err === 'object') {
            const message = ((err as { message?: string }).message || '').toLowerCase();
            const extensions = (err as { extensions?: { code?: string } }).extensions;
            const code = extensions?.code || '';
            return message.includes('expired') || 
                   message.includes('invalid token') || 
                   message.includes('unauthorized') ||
                   message.includes('jwt validation failed') ||
                   message.includes('token has expired') ||
                   code === 'UNAUTHENTICATED' ||
                   code === 'UNAUTHORIZED';
          }
          return false;
        });
        
        if (hasAuthError) {
          shouldRedirect = true;
          console.warn('[GraphQL] Error de autenticación detectado en errores de GraphQL, redirigiendo a login');
        }
      }
      
      // Si detectamos que el token expiró, limpiar sesión y redirigir
      if (shouldRedirect) {
        handleTokenExpired();
        return Promise.reject(new Error('Token expirado'));
      }
    }
    
    // Para otros errores, relanzar el error original
    throw error;
  }
}