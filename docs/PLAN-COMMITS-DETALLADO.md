# 📝 Plan de Commits Detallado - 7 Días

Este documento contiene el plan exacto de commits atómicos para desarrollar el proyecto frontend. Cada commit es independiente y funcional.

---

## 📅 Día 1: Configuración Inicial y Estructura Base

### Commit 1.1: Inicializar proyecto Next.js con TypeScript
**Mensaje**: `chore: inicializar proyecto Next.js con TypeScript y App Router`

**Comando**:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**Archivos creados/modificados**:
- Estructura base de Next.js
- `package.json`
- `tsconfig.json`
- `next.config.js`

**Explicación**:
- `--typescript`: TypeScript es estándar en empresas, proporciona type-safety
- `--app`: Usa App Router (más moderno que Pages Router)
- `--src-dir`: Organiza código en carpeta `src/`
- `--import-alias "@/*"`: Permite imports como `@/components` en vez de rutas relativas

**Verificación**:
```bash
npm run dev
# Debe abrir http://localhost:3000
```

---

### Commit 1.2: Configurar ESLint y Prettier con reglas estrictas
**Mensaje**: `chore: configurar ESLint y Prettier con reglas estrictas`

**Instalación**:
```bash
npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks eslint-plugin-react
```

**Archivos a crear**:

**.eslintrc.json**:
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**.prettierrc**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

**.prettierignore**:
```
node_modules
.next
out
dist
build
```

**package.json** (agregar scripts):
```json
{
  "scripts": {
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Explicación**:
- ESLint detecta errores y problemas de código
- Prettier formatea código automáticamente
- Reglas estrictas aseguran calidad de código

---

### Commit 1.3: Configurar estructura de carpetas feature-based
**Mensaje**: `chore: crear estructura de carpetas feature-based`

**Carpetas a crear**:
```bash
mkdir -p src/features
mkdir -p src/shared/components
mkdir -p src/shared/hooks
mkdir -p src/shared/lib
mkdir -p src/shared/stores
mkdir -p src/shared/contexts
mkdir -p src/shared/types
mkdir -p src/styles
```

**Archivos base a crear**:

**src/shared/types/index.ts**:
```typescript
export type {};

// Tipos compartidos se agregarán aquí
```

**src/shared/lib/utils/index.ts**:
```typescript
/**
 * Utilidades compartidas
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

**Explicación**:
- Feature-based: Cada feature es independiente
- Shared: Código reutilizable
- Facilita escalabilidad y mantenimiento

---

### Commit 1.4: Configurar variables de entorno y tipos
**Mensaje**: `chore: configurar variables de entorno y tipos TypeScript`

**Archivos a crear**:

**.env.example**:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql

# App Configuration
NEXT_PUBLIC_APP_NAME=Academia Multi-Centro
```

**.env.local** (no commitear, agregar a .gitignore):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_APP_NAME=Academia Multi-Centro
```

**src/shared/types/env.d.ts**:
```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_GRAPHQL_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
  }
}
```

**src/shared/lib/config/env.ts**:
```typescript
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  graphqlUrl:
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Academia Multi-Centro',
} as const;
```

**Explicación**:
- `.env.example`: Template para otros desarrolladores
- `env.d.ts`: TypeScript conoce las variables de entorno
- `env.ts`: Acceso type-safe a variables de entorno

---

## 📅 Día 2: Configuración de Estado Global (Zustand + Context)

### Commit 2.1: Instalar y configurar Zustand
**Mensaje**: `feat: instalar y configurar Zustand para estado global de UI`

**Instalación**:
```bash
npm install zustand
```

**Archivo a crear**: `src/shared/stores/ui-store.ts`

```typescript
import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
```

**Explicación**:
- Zustand es una librería minimalista para estado global
- No requiere Providers (a diferencia de Context)
- TypeScript-first
- Perfecto para estado de UI compartido

**Verificación**:
Crear un componente de prueba que use el store.

---

### Commit 2.2: Crear store de notificaciones con Zustand
**Mensaje**: `feat: implementar store de notificaciones global con Zustand`

**Archivo**: `src/shared/stores/notification-store.ts`

```typescript
import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    if (newNotification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, newNotification.duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

export function useNotifications() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  return {
    success: (message: string) =>
      addNotification({ message, type: 'success' }),
    error: (message: string) => addNotification({ message, type: 'error' }),
    warning: (message: string) =>
      addNotification({ message, type: 'warning' }),
    info: (message: string) => addNotification({ message, type: 'info' }),
  };
}
```

**Explicación**:
- Store para notificaciones globales
- Auto-remover después de X segundos
- Helper hook para facilitar uso

---

### Commit 2.3: Crear Context API para autenticación
**Mensaje**: `feat: implementar Context API para autenticación de usuario`

**Archivos**:

**src/shared/types/auth.types.ts**:
```typescript
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
```

**src/shared/contexts/auth-context.tsx**:
```typescript
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: Validar token y cargar usuario
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Llamar al servicio de autenticación
      const response = await authService.login({ email, password });
      
      // 2. Validar respuesta
      if (!response.token) {
        throw new Error('No se recibió token de autenticación');
      }
      if (!response.email || !response.rol || !response.nombre) {
        throw new Error('Datos de usuario incompletos en la respuesta');
      }
      
      // 3. Mapear respuesta del backend (estructura plana) a User interno
      const userData: User = {
        id: response.email, // Backend no envía ID, usamos email temporalmente
        email: response.email,
        nombre: response.nombre,
        rol: response.rol as User['rol'],
      };
      
      // 4. Guardar en estado React
      setToken(response.token);
      setUser(userData);
      
      // 5. Sincronizar localStorage + cookies (para middleware SSR)
      setAuthToken(response.token);
      
      // 6. Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      // Limpiar estado y relanzar error
      setToken(null);
      setUser(null);
      setAuthToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

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
```

**Explicación**:
- Context API para estado realmente global (auth)
- useMemo para evitar re-renders innecesarios
- Hook personalizado para type-safety

---

### Commit 2.4: Integrar Context de auth en layout principal
**Mensaje**: `feat: integrar AuthProvider en layout principal de la aplicación`

**Archivo**: `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/shared/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Explicación**:
- Provider envuelve toda la app
- Todos los componentes pueden acceder al contexto

---

## 📅 Día 3: Configuración de GraphQL y React Query

### Commit 3.1: Instalar y configurar React Query
**Mensaje**: `feat: instalar y configurar TanStack Query para data fetching`

**Instalación**:
```bash
npm install @tanstack/react-query
```

**Archivos**:

**src/shared/lib/react-query/config.ts**:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**src/shared/lib/react-query/provider.tsx**:
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config';

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Integrar en layout**: `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/shared/contexts/auth-context';
import { ReactQueryProvider } from '@/shared/lib/react-query/provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

**Explicación**:
- React Query maneja caché y sincronización automáticamente
- Configuración global para todas las queries

---

### Commit 3.2: Configurar cliente GraphQL
**Mensaje**: `feat: configurar cliente GraphQL con interceptors para JWT`

**Instalación**:
```bash
npm install graphql graphql-request
```

**Archivos**:

**src/shared/lib/graphql/client.ts**:
```typescript
import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/lib/config/env';

export const graphqlClient = new GraphQLClient(env.graphqlUrl, {
  headers: () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
});

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return graphqlClient.request<T>(query, variables);
}
```

**Explicación**:
- Cliente GraphQL configurado
- Interceptor para agregar JWT automáticamente
- Helper function para type-safety

---

### Commit 3.3: Crear tipos TypeScript desde schema GraphQL
**Mensaje**: `feat: configurar GraphQL Codegen para generar tipos TypeScript`

**Instalación**:
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

**Archivos**:

**codegen.yml**:
```yaml
schema: http://localhost:8080/graphql
documents: 'src/**/*.graphql'
generates:
  src/shared/types/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
    config:
      skipTypename: false
      withHooks: true
```

**package.json** (agregar script):
```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch"
  }
}
```

**Nota**: Este commit requiere que el backend esté corriendo para generar tipos.

**Explicación**:
- Generación automática de tipos desde schema GraphQL
- Type-safety completo
- Autocompletado en IDE

---

### Commit 3.4: Crear hooks personalizados para queries GraphQL
**Mensaje**: `feat: crear hooks personalizados para queries GraphQL`

**Archivo**: `src/shared/hooks/use-graphql-query.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { graphqlRequest } from '@/shared/lib/graphql/client';

export function useGraphQLQuery<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData>({
    queryKey: [query, variables],
    queryFn: () => graphqlRequest<TData>(query, variables),
    ...options,
  });
}
```

**Explicación**:
- Hook genérico para queries GraphQL
- Encapsula lógica de React Query
- Reutilizable para todas las queries

---

## 📅 Día 4: Autenticación y Rutas Protegidas

### Commit 4.1: Crear servicio de autenticación (REST)
**Mensaje**: `feat: implementar servicio de autenticación con REST API`

**Instalación**:
```bash
npm install axios
```

**Archivos**:

**.env.local** (crear este archivo en la raíz del proyecto):
```env
# URL base del backend REST API
NEXT_PUBLIC_API_URL=http://localhost:8080

# GraphQL URL (opcional)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql

# Nombre de la aplicación
NEXT_PUBLIC_APP_NAME=Academia Multi-Centro
```

**Nota**: El prefijo `NEXT_PUBLIC_` es obligatorio. Next.js solo expone variables con este prefijo al cliente (browser).

**src/shared/lib/config/env.ts**:
```typescript
/**
 * Configuración de variables de entorno
 * Lee de process.env (configuradas en .env.local)
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  graphqlUrl:
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Academia Multi-Centro',
} as const;
```

**src/shared/lib/api/client.ts**:
```typescript
import axios, { AxiosError } from 'axios';
import { env } from '@/shared/lib/config/env';

/**
 * Cliente HTTP configurado con Axios
 * baseURL se lee de .env.local (NEXT_PUBLIC_API_URL)
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl, // http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request: Agrega token a todas las peticiones
 * Lee el token de localStorage y lo agrega como Bearer token
 */
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

/**
 * Interceptor de response: Maneja errores HTTP de forma centralizada
 * Convierte errores de Axios en Error con mensajes claros
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(
        new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
      );
    }

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
        return Promise.reject(new Error(data?.message || `Error: ${status}`));
    }
  }
);
```

**src/features/auth/types/auth.types.ts**:
```typescript
/**
 * Request para login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Request para registro
 */
export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  rol?: string;
}

/**
 * Respuesta del backend al hacer login
 * IMPORTANTE: El backend devuelve estructura plana, NO tiene objeto 'user' anidado
 * 
 * Respuesta real del backend:
 * {
 *   "token": "eyJhbGci...",
 *   "tokenType": "Bearer",
 *   "expiresIn": 86400000,
 *   "email": "user@example.com",
 *   "rol": "ADMIN",
 *   "nombre": "Nombre Completo"
 * }
 */
export interface AuthResponse {
  token: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // Tiempo de expiración en milisegundos
  email: string;
  rol: string; // "ADMIN" | "PROFESOR" | "ALUMNO" | "ADMINISTRATIVO"
  nombre: string; // Nombre completo del usuario
}
```

**src/features/auth/services/auth-service.ts**:
```typescript
import { apiClient } from '@/shared/lib/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

/**
 * Servicio de autenticación
 * Encapsula todas las llamadas HTTP relacionadas con auth
 */
export const authService = {
  /**
   * Login: POST /api/auth/login
   * @param data - Email y password
   * @returns AuthResponse con token y datos del usuario
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // POST http://localhost:8080/api/auth/login
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      
      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return response.data;
    } catch (error) {
      // Manejo específico de errores HTTP
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

  /**
   * Register: POST /api/auth/register
   * @param data - Datos del nuevo usuario
   * @returns AuthResponse con token y datos del usuario
   */
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
```

**Explicación**:
- **Variable de entorno**: `NEXT_PUBLIC_API_URL` en `.env.local` contiene la URL base
- **Cliente HTTP**: Axios configurado con baseURL y interceptors
- **Interceptors**: Agregan token automáticamente a requests y manejan errores
- **Type-safe**: TypeScript garantiza que los tipos coincidan
- **Estructura real**: El backend devuelve estructura plana, no objeto `user` anidado

**Flujo de la petición**:
1. `authService.login()` llama a `apiClient.post('/api/auth/login', data)`
2. `apiClient` construye URL: `baseURL + '/api/auth/login'` = `http://localhost:8080/api/auth/login`
3. Interceptor agrega token si existe en localStorage
4. Backend responde con `{ token, email, rol, nombre }`
5. `authService` devuelve solo `response.data`

---

### Commit 4.1.5: Configurar Material UI para SSR (Opcional pero recomendado)
**Mensaje**: `fix: configurar Material UI con ThemeProvider para evitar errores de hidratación`

**Problema**: Material UI puede causar errores de hidratación en Next.js App Router debido a diferencias entre SSR y cliente.

**Solución**:

**src/shared/providers/material-ui-provider.tsx**:
```typescript
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export function MaterialUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

**Integrar en `src/app/layout.tsx`**:
```typescript
import { MaterialUIProvider } from '@/shared/providers/material-ui-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MaterialUIProvider>
          {/* otros providers */}
          {children}
        </MaterialUIProvider>
      </body>
    </html>
  );
}
```

**next.config.ts**:
```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material'],
};
```

**Explicación**:
- `ThemeProvider` asegura contexto de tema consistente entre servidor y cliente
- `CssBaseline` normaliza estilos base
- `transpilePackages` permite que Next.js transpile correctamente Material UI v7
- Ver documentación completa en `docs/ERROR-HIDRATACION-MATERIAL-UI.md`

---

### Commit 4.2: Crear componentes de Login y Register
**Mensaje**: `feat: crear formularios de login y register con Material UI`

**Instalación**:
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-hook-form @hookform/resolvers zod
```

**Archivos**:

**src/features/auth/components/login-form.tsx**:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useAuth } from '@/shared/contexts/auth-context';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        autoComplete="email"
        autoFocus
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="current-password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </Box>
  );
}
```

**Similar para RegisterForm**

**Explicación**:
- React Hook Form para performance
- Zod para validación type-safe
- Material UI para UI profesional

---

### Commit 4.3: Implementar rutas protegidas con middleware
**Mensaje**: `feat: implementar middleware para proteger rutas por autenticación y roles`

**Archivo**: `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Rutas públicas
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si no hay token y no es ruta pública, redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Explicación**:
- Middleware de Next.js se ejecuta antes de renderizar
- Protege rutas automáticamente
- Redirige a login si no está autenticado

---

### Commit 4.4: Crear layout de dashboard con sidebar
**Mensaje**: `feat: crear layout de dashboard con sidebar usando Zustand`

**Archivos**:

**src/shared/components/layout/sidebar.tsx**:
```typescript
'use client';

import { Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useUiStore } from '@/shared/stores/ui-store';

export function Sidebar() {
  const isOpen = useUiStore((state) => state.isSidebarOpen);
  const setOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)}>
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Cursos" />
          </ListItemButton>
        </ListItem>
        {/* Más items */}
      </List>
    </Drawer>
  );
}
```

**src/app/(dashboard)/layout.tsx**:
```typescript
import { Sidebar } from '@/shared/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main>{children}</main>
    </>
  );
}
```

**Explicación**:
- Layout anidado en Next.js
- Sidebar controlado por Zustand
- Route group `(dashboard)` agrupa rutas

---

## 📅 Día 5: Feature de Cursos (CRUD completo)

### Commit 5.1: Crear tipos y queries GraphQL para Cursos
**Mensaje**: `feat: definir tipos y queries GraphQL para módulo de cursos`

**Archivos**:

**src/features/cursos/types/curso.types.ts**:
```typescript
export interface Curso {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  materia?: {
    id: string;
    nombre: string;
  };
  formato?: {
    id: string;
    nombre: string;
  };
}

export interface CursoInput {
  nombre: string;
  descripcion?: string;
  activo: boolean;
  idMateria?: string;
  idFormato?: string;
}
```

**src/features/cursos/services/curso-service.ts**:
```typescript
import { graphqlRequest } from '@/shared/lib/graphql/client';
import type { Curso, CursoInput } from '../types/curso.types';

const GET_CURSOS_QUERY = `
  query GetCursos($activo: Boolean) {
    cursos(activo: $activo) {
      id
      nombre
      descripcion
      activo
      materia {
        id
        nombre
      }
      formato {
        id
        nombre
      }
    }
  }
`;

export const cursoService = {
  async getCursos(activo?: boolean): Promise<Curso[]> {
    const data = await graphqlRequest<{ cursos: Curso[] }>(
      GET_CURSOS_QUERY,
      { activo }
    );
    return data.cursos;
  },
};
```

**src/features/cursos/hooks/use-cursos.ts**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';

export function useCursos(activo?: boolean) {
  return useQuery({
    queryKey: ['cursos', activo],
    queryFn: () => cursoService.getCursos(activo),
  });
}
```

**Explicación**:
- Tipos TypeScript para type-safety
- Service layer separa lógica de negocio
- Hook personalizado encapsula React Query

---

### Commit 5.2: Crear componente de lista de cursos
**Mensaje**: `feat: crear componente de lista de cursos con tabla Material UI`

**Archivo**: `src/features/cursos/components/curso-list.tsx`

```typescript
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCursos } from '../hooks/use-cursos';

export function CursoList() {
  const { data: cursos, isLoading, error } = useCursos();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error al cargar cursos</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cursos?.map((curso) => (
            <TableRow key={curso.id}>
              <TableCell>{curso.nombre}</TableCell>
              <TableCell>{curso.descripcion}</TableCell>
              <TableCell>{curso.activo ? 'Activo' : 'Inactivo'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

**Explicación**:
- Material UI Table para UI profesional
- Loading y error states
- Integración con React Query

---

### Commit 5.3: Crear formulario de curso (create/edit)
**Mensaje**: `feat: crear formulario de curso con validación y Material UI`

**Archivo**: `src/features/cursos/components/curso-form.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Switch, FormControlLabel } from '@mui/material';

const cursoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  activo: z.boolean(),
});

type CursoFormData = z.infer<typeof cursoSchema>;

interface CursoFormProps {
  initialData?: CursoFormData;
  onSubmit: (data: CursoFormData) => void;
  isLoading?: boolean;
}

export function CursoForm({
  initialData,
  onSubmit,
  isLoading,
}: CursoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CursoFormData>({
    resolver: zodResolver(cursoSchema),
    defaultValues: initialData,
  });

  const activo = watch('activo');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        fullWidth
        label="Nombre"
        {...register('nombre')}
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Descripción"
        multiline
        rows={4}
        {...register('descripcion')}
        margin="normal"
      />
      <FormControlLabel
        control={
          <Switch
            checked={activo}
            onChange={(e) => setValue('activo', e.target.checked)}
          />
        }
        label="Activo"
      />
      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </Box>
  );
}
```

**Explicación**:
- React Hook Form para performance
- Zod para validación
- Material UI para UI

---

### Commit 5.4: Implementar mutations (create, update, delete)
**Mensaje**: `feat: implementar mutations GraphQL para CRUD de cursos`

**Archivos**:

**src/features/cursos/services/curso-service.ts** (agregar mutations):
```typescript
const CREATE_CURSO_MUTATION = `
  mutation CreateCurso($input: CursoInput!) {
    createCurso(input: $input) {
      id
      nombre
      descripcion
      activo
    }
  }
`;

export const cursoService = {
  // ... queries existentes

  async createCurso(input: CursoInput): Promise<Curso> {
    const data = await graphqlRequest<{ createCurso: Curso }>(
      CREATE_CURSO_MUTATION,
      { input }
    );
    return data.createCurso;
  },

  // Similar para update y delete
};
```

**src/features/cursos/hooks/use-curso-mutations.ts**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';
import type { CursoInput } from '../types/curso.types';
import { useNotifications } from '@/shared/stores/notification-store';

export function useCreateCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (input: CursoInput) => cursoService.createCurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.success('Curso creado exitosamente');
    },
    onError: () => {
      notifications.error('Error al crear curso');
    },
  });
}

// Similar para update y delete
```

**Explicación**:
- Mutations para modificar datos
- Invalidación de queries para refrescar datos
- Notificaciones con Zustand

---

### Commit 5.5: Integrar notificaciones con Zustand
**Mensaje**: `feat: crear componente de notificaciones y integrar con mutations`

**Archivo**: `src/shared/components/notification/notification-container.tsx`

```typescript
'use client';

import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@/shared/stores/notification-store';

export function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
```

**Integrar en layout**: Agregar `<NotificationContainer />` al layout principal.

**Explicación**:
- Componente que muestra notificaciones
- Integrado con Zustand store
- Material UI Snackbar para UI profesional

---

## 📅 Día 6: Más Features y Optimizaciones

> **📚 Documentación detallada**: Ver `docs/dia6/GUIA-IMPLEMENTACION-ALUMNO.md` para ejemplo completo paso a paso.

### Commit 6.1: Crear utilidades responsive
**Mensaje**: `feat: crear hook y utilidades para diseño responsive`

**Archivos**: Ver `docs/dia6/RESPONSIVE-UTILITIES.md`

**Explicación**:
- Hook `useResponsive` para detectar breakpoints
- Componente `ResponsiveContainer` para layouts adaptativos
- Evita repetir lógica de media queries

---

### Commit 6.2: Implementar manejo centralizado de errores
**Mensaje**: `feat: implementar sistema centralizado de manejo de errores con notificaciones`

**Archivos**: Ver `docs/dia6/MANEJO-ERRORES.md`

**Explicación**:
- Error handler para GraphQL
- Integración con notificaciones Zustand
- Mensajes de error user-friendly

---

### Commit 6.3: Crear Home y Navbar
**Mensaje**: `feat: crear página home y navbar responsive con navegación`

**Archivos**: Ver `docs/dia6/HOME-NAVBAR.md`

**Explicación**:
- Navbar con Material UI AppBar
- Home con dashboard básico
- Navegación protegida por roles

---

### Commit 6.4: Feature de Alumnos (CRUD completo)
**Mensaje**: `feat: implementar CRUD completo de alumnos siguiendo patrón de cursos`

**Estructura**:
- `src/features/alumnos/types/alumno.types.ts`
- `src/features/alumnos/services/alumno-service.ts`
- `src/features/alumnos/hooks/use-alumnos.ts`
- `src/features/alumnos/hooks/use-alumno-mutations.ts`
- `src/features/alumnos/components/alumno-list.tsx`
- `src/features/alumnos/components/alumno-form.tsx`
- `src/app/dashboard/alumno/page.tsx`

**Documentación completa**: Ver `docs/dia6/GUIA-IMPLEMENTACION-ALUMNO.md`

---

### Commit 6.5: Feature de Matrículas
**Mensaje**: `feat: implementar gestión de matrículas con relaciones complejas`

**Complejidad adicional**:
- Relaciones: Alumno, Convocatoria
- Estados: EstadoPago enum
- Validaciones: Fechas, importes

**Ver**: `docs/dia6/ENTIDADES-PENDIENTES.md` para detalles

---

### Commit 6.6: Optimizaciones de rendimiento
**Mensaje**: `perf: implementar optimizaciones de rendimiento (memo, lazy loading)`

**Optimizaciones**:
- React.memo para componentes pesados
- useMemo/useCallback donde sea necesario
- Lazy loading de rutas
- Next.js Image component

---

## 📅 Día 7: Testing, Docker y Documentación

### Commit 7.1: Configurar Jest y React Testing Library
**Mensaje**: `test: configurar Jest y React Testing Library para testing`

**Instalación**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Archivos**:
- `jest.config.js`
- `jest.setup.js`

---

### Commit 7.2: Escribir tests para componentes clave
**Mensaje**: `test: agregar tests unitarios para componentes y hooks principales`

**Tests**:
- Login form
- Curso form
- Hooks personalizados

---

### Commit 7.3: Crear Dockerfile multi-stage
**Mensaje**: `docker: crear Dockerfile multi-stage optimizado para producción`

**Archivo**: `docker/Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS runner
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Commit 7.4: Configurar Nginx para producción
**Mensaje**: `docker: configurar Nginx para servir aplicación Next.js`

**Archivo**: `docker/nginx.conf`

---

### Commit 7.5: Crear docker-compose para desarrollo
**Mensaje**: `docker: crear docker-compose.yml para desarrollo local`

**Archivo**: `docker-compose.yml`

---

### Commit 7.6: Documentación completa
**Mensaje**: `docs: agregar documentación completa del proyecto`

**Archivos**:
- README.md actualizado
- Documentación de arquitectura
- Guías de contribución

---

## 📋 Checklist de Verificación

Después de cada commit, verificar:

- [ ] El código compila sin errores
- [ ] No hay errores de TypeScript
- [ ] ESLint pasa sin errores
- [ ] La funcionalidad implementada funciona
- [ ] Los tests (si aplica) pasan

---

## 🎯 Notas Finales

- **Commits atómicos**: Cada commit debe ser independiente y funcional
- **Mensajes descriptivos**: Usar convención de commits (feat, fix, chore, etc.)
- **Testing continuo**: Probar después de cada commit
- **Documentación**: Comentar código complejo

---

**¡Sigue este plan paso a paso y tendrás un proyecto profesional! 🚀**

