# 🛡️ Manejo Centralizado de Errores

Este documento explica cómo implementar un sistema centralizado de manejo de errores que integra con las notificaciones de Zustand.

---

## 🎯 Objetivo

Crear un sistema que:
- ✅ Capture errores de GraphQL y REST
- ✅ Convierta errores técnicos en mensajes user-friendly
- ✅ Integre automáticamente con notificaciones
- ✅ Maneje diferentes tipos de errores (autenticación, validación, servidor, etc.)

---

## 📁 Estructura de Archivos

```
src/shared/lib/errors/
  ├── error-handler.ts      # Función principal para manejar errores
  ├── error-types.ts        # Tipos de errores
  └── error-messages.ts    # Mensajes user-friendly
```

---

## 🔧 Paso 1: Crear Tipos de Errores

**Archivo**: `src/shared/lib/errors/error-types.ts`

```typescript
/**
 * Tipos de errores que puede devolver el sistema
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error de GraphQL con estructura estándar
 */
export interface GraphQLError {
  message: string;
  extensions?: {
    classification?: string;
    code?: string;
    exception?: {
      message?: string;
    };
  };
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

/**
 * Respuesta de error de GraphQL
 */
export interface GraphQLErrorResponse {
  errors?: GraphQLError[];
  data?: null;
}

/**
 * Error personalizado con tipo y mensaje
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

---

## 📝 Paso 2: Crear Mensajes User-Friendly

**Archivo**: `src/shared/lib/errors/error-messages.ts`

```typescript
import { ErrorType } from './error-types';

/**
 * Mensajes de error user-friendly en español
 * Estos mensajes se muestran al usuario final
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]:
    'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  [ErrorType.AUTHENTICATION]:
    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ErrorType.AUTHORIZATION]:
    'No tienes permisos para realizar esta acción. Contacta al administrador.',
  [ErrorType.VALIDATION]:
    'Los datos ingresados no son válidos. Por favor, revisa el formulario.',
  [ErrorType.NOT_FOUND]:
    'El recurso solicitado no fue encontrado.',
  [ErrorType.SERVER_ERROR]:
    'Error interno del servidor. Por favor, intenta más tarde.',
  [ErrorType.UNKNOWN]:
    'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
};

/**
 * Obtener mensaje de error según el tipo
 */
export function getErrorMessage(type: ErrorType): string {
  return ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN];
}

/**
 * Mensajes específicos para errores comunes de GraphQL
 */
export const GRAPHQL_ERROR_MESSAGES: Record<string, string> = {
  'FORBIDDEN': 'No tienes permisos para realizar esta acción.',
  'UNAUTHENTICATED': 'Tu sesión ha expirado. Por favor, inicia sesión.',
  'BAD_USER_INPUT': 'Los datos ingresados no son válidos.',
  'INTERNAL_SERVER_ERROR': 'Error interno del servidor. Intenta más tarde.',
  'NOT_FOUND': 'El recurso solicitado no fue encontrado.',
};
```

---

## 🛠️ Paso 3: Crear Error Handler Principal

**Archivo**: `src/shared/lib/errors/error-handler.ts`

```typescript
import { ErrorType, GraphQLError, GraphQLErrorResponse, AppError } from './error-types';
import { getErrorMessage, GRAPHQL_ERROR_MESSAGES } from './error-messages';

/**
 * Detectar tipo de error basado en el error original
 */
function detectErrorType(error: unknown): ErrorType {
  // Error de red (sin conexión, timeout, etc.)
  if (
    error instanceof Error &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch'))
  ) {
    return ErrorType.NETWORK;
  }

  // Error de GraphQL
  if (isGraphQLError(error)) {
    const graphqlError = extractGraphQLError(error);
    const classification = graphqlError?.extensions?.classification;

    if (classification === 'FORBIDDEN' || classification === 'UNAUTHORIZED') {
      return ErrorType.AUTHORIZATION;
    }

    if (classification === 'UNAUTHENTICATED') {
      return ErrorType.AUTHENTICATION;
    }

    if (classification === 'BAD_USER_INPUT' || classification === 'VALIDATION_ERROR') {
      return ErrorType.VALIDATION;
    }

    if (classification === 'NOT_FOUND') {
      return ErrorType.NOT_FOUND;
    }

    if (classification === 'INTERNAL_SERVER_ERROR') {
      return ErrorType.SERVER_ERROR;
    }
  }

  // Error de HTTP (REST API)
  if (isHttpError(error)) {
    const status = (error as { response?: { status?: number } }).response?.status;

    if (status === 401) {
      return ErrorType.AUTHENTICATION;
    }

    if (status === 403) {
      return ErrorType.AUTHORIZATION;
    }

    if (status === 404) {
      return ErrorType.NOT_FOUND;
    }

    if (status === 422) {
      return ErrorType.VALIDATION;
    }

    if (status >= 500) {
      return ErrorType.SERVER_ERROR;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Verificar si el error es de GraphQL
 */
function isGraphQLError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  // Error de graphql-request
  if ('response' in error) {
    const response = (error as { response?: GraphQLErrorResponse }).response;
    return !!response?.errors;
  }

  // Error directo con estructura GraphQL
  if ('errors' in error) {
    return Array.isArray((error as GraphQLErrorResponse).errors);
  }

  return false;
}

/**
 * Extraer error de GraphQL del objeto de error
 */
function extractGraphQLError(error: unknown): GraphQLError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  // Error de graphql-request
  if ('response' in error) {
    const response = (error as { response?: GraphQLErrorResponse }).response;
    const errors = response?.errors;
    return errors && errors.length > 0 ? errors[0] : null;
  }

  // Error directo
  if ('errors' in error) {
    const errors = (error as GraphQLErrorResponse).errors;
    return errors && errors.length > 0 ? errors[0] : null;
  }

  return null;
}

/**
 * Verificar si el error es de HTTP (REST API)
 */
function isHttpError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'response' in error && typeof (error as { response?: unknown }).response === 'object';
}

/**
 * Extraer mensaje de error user-friendly
 */
function extractErrorMessage(error: unknown, errorType: ErrorType): string {
  // Intentar obtener mensaje específico de GraphQL
  if (isGraphQLError(error)) {
    const graphqlError = extractGraphQLError(error);
    if (graphqlError) {
      const classification = graphqlError.extensions?.classification;
      
      // Si hay mensaje específico en nuestro mapa, usarlo
      if (classification && GRAPHQL_ERROR_MESSAGES[classification]) {
        return GRAPHQL_ERROR_MESSAGES[classification];
      }

      // Si el mensaje de GraphQL es user-friendly, usarlo
      const message = graphqlError.message;
      if (message && !message.includes('GraphQL') && !message.includes('Unexpected')) {
        return message;
      }
    }
  }

  // Intentar obtener mensaje de Error estándar
  if (error instanceof Error) {
    const message = error.message;
    
    // Si el mensaje es técnico, usar mensaje genérico
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('GraphQL') ||
      message.includes('Unexpected')
    ) {
      return getErrorMessage(errorType);
    }

    return message;
  }

  // Mensaje genérico según tipo
  return getErrorMessage(errorType);
}

/**
 * Función principal para manejar errores
 * Convierte cualquier error en un mensaje user-friendly
 * 
 * @param error - Error original (puede ser de GraphQL, HTTP, Error, etc.)
 * @returns Mensaje de error user-friendly en español
 * 
 * @example
 * ```typescript
 * try {
 *   await cursoService.createCurso(data);
 * } catch (error) {
 *   const message = handleGraphQLError(error);
 *   notifications.error(message);
 * }
 * ```
 */
export function handleGraphQLError(error: unknown): string {
  const errorType = detectErrorType(error);
  const message = extractErrorMessage(error, errorType);

  // Log del error original para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error original:', error);
    console.error('Tipo detectado:', errorType);
    console.error('Mensaje user-friendly:', message);
  }

  return message;
}

/**
 * Crear AppError desde cualquier error
 * Útil para propagar errores con contexto
 */
export function createAppError(error: unknown): AppError {
  const errorType = detectErrorType(error);
  const message = extractErrorMessage(error, errorType);
  return new AppError(errorType, message, error);
}
```

---

## 🔌 Paso 4: Integrar con Cliente GraphQL

**Actualizar**: `src/shared/lib/graphql/client.ts`

```typescript
import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/lib/config/env';
import { handleGraphQLError } from '@/shared/lib/errors/error-handler';

// ... código existente ...

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
    // Convertir error técnico en mensaje user-friendly
    const userFriendlyMessage = handleGraphQLError(error);
    
    // Crear nuevo error con mensaje user-friendly
    const friendlyError = new Error(userFriendlyMessage);
    
    // Preservar error original para debugging
    (friendlyError as { originalError?: unknown }).originalError = error;
    
    throw friendlyError;
  }
}
```

---

## 🎣 Paso 5: Usar en Hooks de Mutations

**Ejemplo**: Actualizar `src/features/cursos/hooks/use-curso-mutations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';
import type { CursoInput } from '../types/curso.types';
import { useNotifications } from '@/shared/stores/notification-store';
import { handleGraphQLError } from '@/shared/lib/errors/error-handler';

export function useCreateCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (input: CursoInput) => cursoService.createCurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.success('Curso creado exitosamente');
    },
    onError: (error: unknown) => {
      // Usar error handler centralizado
      const errorMessage = handleGraphQLError(error);
      notifications.error(errorMessage);
    },
  });
}
```

---

## 🔄 Paso 6: Interceptor Global para REST API

**Actualizar**: `src/shared/lib/api/client.ts`

```typescript
import axios, { AxiosError } from 'axios';
import { env } from '@/shared/lib/config/env';
import { handleGraphQLError } from '@/shared/lib/errors/error-handler';

// ... código existente ...

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Usar error handler centralizado
    const userFriendlyMessage = handleGraphQLError(error);
    
    // Crear nuevo error con mensaje user-friendly
    const friendlyError = new Error(userFriendlyMessage);
    (friendlyError as { originalError?: unknown }).originalError = error;
    
    return Promise.reject(friendlyError);
  }
);
```

---

## 📊 Paso 7: Error Boundary (Opcional pero Recomendado)

**Archivo**: `src/shared/components/error-boundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { handleGraphQLError } from '@/shared/lib/errors/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error
        ? handleGraphQLError(this.state.error)
        : 'Ocurrió un error inesperado';

      return (
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error
            </Typography>
            <Typography>{errorMessage}</Typography>
          </Alert>
          <Button variant="contained" onClick={this.handleReset}>
            Intentar nuevamente
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

**Usar en layout**: `src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/shared/components/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundary>
          {/* ... providers ... */}
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## ✅ Checklist de Verificación

- [ ] Error handler creado y funcionando
- [ ] Mensajes user-friendly en español
- [ ] Integración con cliente GraphQL
- [ ] Integración con cliente REST
- [ ] Uso en hooks de mutations
- [ ] Error Boundary implementado (opcional)
- [ ] Errores se muestran en notificaciones
- [ ] Logs de debugging en desarrollo

---

## 🎓 Aprendizajes Clave

1. **Centralización**: Un solo lugar para manejar todos los errores
2. **User-Friendly**: Mensajes claros para el usuario final
3. **Type-Safety**: TypeScript para detectar errores en tiempo de compilación
4. **Debugging**: Preservar error original para logs

---

---

## 🔐 Manejo de Token Expirado (401 Unauthorized)

Cuando el backend responde con un error 401 (token expirado o inválido), la aplicación debe:
1. Limpiar todos los datos de autenticación (token, usuario)
2. Redirigir automáticamente al usuario a la página de login

### Implementación

**Archivo**: `src/shared/lib/utils/auth.utils.ts`

Este módulo proporciona funciones utilitarias que pueden ser llamadas desde interceptors HTTP sin necesidad de acceso al contexto de React:

```typescript
/**
 * Limpia todos los datos de autenticación del cliente
 */
export function clearAuthData(): void {
  // Elimina token y usuario de localStorage
  // Elimina cookie de token
}

/**
 * Redirige al usuario a la página de login
 * Limpia los datos de autenticación antes de redirigir
 */
export function redirectToLogin(redirectPath = '/login'): void {
  clearAuthData();
  window.location.href = redirectPath;
}

/**
 * Maneja errores de autenticación (401 Unauthorized)
 * Limpia la sesión y redirige al login
 */
export function handleAuthError(errorMessage?: string): void {
  // Log del error si estamos en desarrollo
  // Limpiar datos y redirigir
  redirectToLogin();
}
```

### Integración en Axios Interceptor

**Archivo**: `src/shared/lib/api/client.ts`

El interceptor de respuesta de axios detecta errores 401 y automáticamente limpia la sesión y redirige:

```typescript
import { handleAuthError } from '@/shared/lib/utils/auth.utils';

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(/* error de conexión */);
    }

    const status = error.response.status;

    switch (status) {
      case 401:
        // Token expirado o inválido
        const errorMessage = data?.message || 'Token expirado o inválido';
        handleAuthError(errorMessage); // Limpia sesión y redirige a /login
        return Promise.reject(new Error(errorMessage));
      // ... otros casos
    }
  }
);
```

### Integración en GraphQL Client

**Archivo**: `src/shared/lib/graphql/client.ts`

El cliente GraphQL también maneja errores 401:

```typescript
import { handleAuthError } from '@/shared/lib/utils/auth.utils';

export async function graphqlRequest<T>(...): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    if (error instanceof ClientError) {
      const statusCode = error.response?.status;
      if (statusCode === 401) {
        handleAuthError(error.message);
        throw new Error('Token expirado o inválido');
      }
    }
    throw error;
  }
}
```

### Flujo Completo

1. **Usuario hace una petición** con token expirado
2. **Backend responde 401** con mensaje: "JWT validation failed: Token has expired"
3. **Interceptor detecta 401** en la respuesta
4. **Se llama `handleAuthError()`** que:
   - Limpia `localStorage` (token y usuario)
   - Elimina cookie de token
   - Redirige a `/login` usando `window.location.href`
5. **Usuario es redirigido** a la página de login
6. **Middleware detecta** que no hay token y permite el acceso a la ruta pública

### ¿Por qué no usar el router de Next.js?

Los interceptors HTTP (axios, GraphQL) se ejecutan en un contexto donde no tenemos acceso directo al router de Next.js. Por eso usamos `window.location.href` para la redirección.

### Logs del Backend

Cuando el token expira, verás logs como estos en el backend:

```
ERROR c.a.a.security.JwtAuthenticationFilter : JWT validation failed: Token has expired
```

El frontend maneja automáticamente estos errores sin necesidad de código adicional en los componentes.

---

---

## 📖 Documentación Relacionada

Para detalles completos sobre la solución implementada para manejar tokens expirados, ver:
- **[TOKEN-EXPIRADO-SOLUCION.md](./TOKEN-EXPIRADO-SOLUCION.md)**: Documentación completa del problema, intentos fallidos y solución final

---

## 📚 Referencias

- [GraphQL Error Handling](https://graphql.org/learn/validation/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

