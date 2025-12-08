# 🧠 Guía Detallada: Manejo de Estado en React/Next.js

## 📖 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Context API - Profundización](#context-api)
3. [Zustand - Guía Completa](#zustand)
4. [React Query - Data Fetching](#react-query)
5. [Cuándo Usar Cada Uno](#cuándo-usar)
6. [Patrones y Mejores Prácticas](#patrones)
7. [Ejemplos Prácticos](#ejemplos)

---

## 🎯 Introducción

En aplicaciones React modernas, el manejo de estado es crucial. En este proyecto usamos **tres herramientas complementarias**:

1. **Context API**: Para estado realmente global (autenticación)
2. **Zustand**: Para estado de UI compartido (notificaciones, modales, sidebar)
3. **React Query**: Para datos del servidor (caché, sincronización)

### ¿Por qué no solo una herramienta?

Cada herramienta tiene su propósito:
- **Context API**: Simple, nativo, perfecto para auth
- **Zustand**: Ligero, sin Providers, ideal para UI state
- **React Query**: Especializado en data fetching, maneja caché automáticamente

---

## 🔵 Context API - Profundización

### ¿Qué es Context API?

Context API es una característica nativa de React que permite compartir datos entre componentes sin pasar props manualmente (prop drilling).

### Estructura Básica

```typescript
// 1. Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Crear el Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    // Lógica de login
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Crear hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### ¿Por qué este patrón?

1. **Error handling**: Si usas el hook fuera del Provider, lanza error
2. **Type safety**: TypeScript sabe que context no es undefined
3. **Encapsulación**: La lógica está dentro del Provider

### Problemas de Context API

**Re-renders innecesarios**:
```typescript
// ❌ MAL: Cualquier cambio en value causa re-render de todos los consumers
const value = { user, token, login, logout };

// ✅ BIEN: Memoizar el value
const value = useMemo(
  () => ({ user, token, login, logout }),
  [user, token]
);
```

**Solución**: Usar `useMemo` para el value del Provider.

### Cuándo Usar Context API

✅ **SÍ usar para**:
- Autenticación (user, token)
- Tema (dark/light mode)
- Idioma (i18n)
- Estado que necesita estar en TODA la app

❌ **NO usar para**:
- Estado de UI local (modales, sidebars)
- Datos del servidor
- Estado que cambia frecuentemente

---

## 🟢 Zustand - Guía Completa

### ¿Qué es Zustand?

Zustand es una librería minimalista (1KB) para manejo de estado global. Es más simple que Redux pero más poderoso que Context API para ciertos casos.

### Conceptos Clave

#### 1. Store

Un store es un objeto que contiene:
- **Estado**: Los datos
- **Actions**: Funciones que modifican el estado

```typescript
import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface NotificationStore {
  // Estado
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  // Estado inicial
  notifications: [],
  
  // Actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
}));
```

#### 2. Selectors

Los selectors permiten obtener solo parte del estado, evitando re-renders innecesarios:

```typescript
// ❌ MAL: Re-render cuando CUALQUIER parte del store cambia
const notifications = useNotificationStore((state) => state.notifications);

// ✅ BIEN: Re-render solo cuando notifications cambia
const notifications = useNotificationStore((state) => state.notifications);

// ✅ MEJOR: Selector específico
const successNotifications = useNotificationStore(
  (state) => state.notifications.filter((n) => n.type === 'success')
);
```

#### 3. Acciones Asíncronas

Zustand maneja acciones asíncronas de forma natural:

```typescript
interface UiStore {
  isLoading: boolean;
  data: string | null;
  fetchData: () => Promise<void>;
}

export const useUiStore = create<UiStore>((set) => ({
  isLoading: false,
  data: null,
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await api.fetchData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
```

### Middleware de Zustand

Zustand tiene middleware útil:

#### 1. Persist (Guardar en localStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage', // Clave en localStorage
    }
  )
);
```

#### 2. DevTools (Redux DevTools)

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<StoreType>()(
  devtools(
    (set) => ({
      // ... tu store
    }),
    { name: 'MyStore' } // Nombre en DevTools
  )
);
```

### Ejemplo Completo: Store de UI

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UiState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modales
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Loading global
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        // Sidebar
        isSidebarOpen: true,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),
        
        // Modales
        activeModal: null,
        openModal: (modalId) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),
        
        // Loading
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }), // Solo persistir sidebar
      }
    ),
    { name: 'UiStore' }
  )
);
```

### Ventajas de Zustand

1. **Sin Providers**: No necesitas envolver la app
2. **TypeScript-first**: Excelente soporte de tipos
3. **Ligero**: Solo 1KB
4. **Simple**: Menos boilerplate que Redux
5. **Performante**: Selectors optimizados

### Cuándo Usar Zustand

✅ **SÍ usar para**:
- Estado de UI compartido (sidebar, modales)
- Notificaciones globales
- Carrito de compra
- Filtros globales
- Cualquier estado que no sea del servidor

❌ **NO usar para**:
- Datos del servidor (usa React Query)
- Estado realmente global simple (usa Context)

---

## 🟡 React Query - Data Fetching

### ¿Qué es React Query?

React Query (TanStack Query) es una librería especializada en **data fetching**. Maneja automáticamente:
- Caché
- Sincronización
- Invalidación
- Loading states
- Error handling

### Conceptos Fundamentales

#### 1. Query (Lectura de Datos)

```typescript
import { useQuery } from '@tanstack/react-query';

function CursosList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cursos'],
    queryFn: () => fetchCursos(),
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((curso) => (
        <div key={curso.id}>{curso.nombre}</div>
      ))}
    </div>
  );
}
```

**Conceptos**:
- **queryKey**: Identificador único para la caché
- **queryFn**: Función que hace la petición
- **data**: Datos cacheados
- **isLoading**: Estado de carga inicial
- **isFetching**: Estado de carga (incluye refetch)

#### 2. Query con Parámetros

```typescript
function CursoDetail({ cursoId }: { cursoId: string }) {
  const { data } = useQuery({
    queryKey: ['curso', cursoId], // Incluir parámetros en la key
    queryFn: () => fetchCurso(cursoId),
    enabled: !!cursoId, // Solo ejecutar si cursoId existe
  });

  return <div>{data?.nombre}</div>;
}
```

#### 3. Mutation (Modificación de Datos)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateCursoForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CursoInput) => createCurso(data),
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });

  const handleSubmit = (data: CursoInput) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      {mutation.isPending && <div>Guardando...</div>}
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>¡Curso creado!</div>}
    </form>
  );
}
```

#### 4. Optimistic Updates

Actualizar la UI antes de que el servidor responda:

```typescript
const mutation = useMutation({
  mutationFn: updateCurso,
  onMutate: async (newCurso) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries({ queryKey: ['cursos'] });

    // Snapshot del estado anterior
    const previousCursos = queryClient.getQueryData(['cursos']);

    // Actualizar optimísticamente
    queryClient.setQueryData(['cursos'], (old: Curso[]) =>
      old.map((curso) =>
        curso.id === newCurso.id ? { ...curso, ...newCurso } : curso
      )
    );

    return { previousCursos };
  },
  onError: (err, newCurso, context) => {
    // Revertir en caso de error
    queryClient.setQueryData(['cursos'], context?.previousCursos);
  },
  onSettled: () => {
    // Refrescar datos del servidor
    queryClient.invalidateQueries({ queryKey: ['cursos'] });
  },
});
```

### Hooks Personalizados con React Query

Encapsular lógica en hooks reutilizables:

```typescript
// src/features/cursos/hooks/use-cursos.ts
export function useCursos(activo?: boolean) {
  return useQuery({
    queryKey: ['cursos', activo],
    queryFn: () => cursoService.getCursos(activo),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCurso(id: string) {
  return useQuery({
    queryKey: ['curso', id],
    queryFn: () => cursoService.getCurso(id),
    enabled: !!id,
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cursoService.createCurso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });
}
```

### Configuración Global

```typescript
// src/shared/lib/react-query/provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
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

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Ventajas de React Query

1. **Caché automática**: No necesitas manejar caché manualmente
2. **Sincronización**: Actualiza datos automáticamente
3. **Loading states**: Maneja loading/error automáticamente
4. **Invalidación inteligente**: Refresca datos cuando es necesario
5. **Optimistic updates**: Mejora UX

---

## 🎯 Cuándo Usar Cada Uno

### Decisión Tree

```
¿Es dato del servidor?
├─ SÍ → React Query
└─ NO → ¿Es estado realmente global (auth, tema)?
    ├─ SÍ → Context API
    └─ NO → ¿Es estado de UI compartido?
        ├─ SÍ → Zustand
        └─ NO → useState (estado local)
```

### Ejemplos Prácticos

| Caso de Uso | Herramienta | Razón |
|-------------|-------------|-------|
| Datos de cursos del servidor | React Query | Caché, sincronización |
| Token JWT del usuario | Context API | Estado realmente global |
| Estado del sidebar (abierto/cerrado) | Zustand | UI state compartido |
| Notificaciones toast | Zustand | UI state compartido |
| Tema dark/light | Context API o Zustand | Preferencia global |
| Formulario local | useState | Estado local |
| Filtros de búsqueda | useState o Zustand | Depende del alcance |

---

## 🏗️ Patrones y Mejores Prácticas

### 1. Separación de Responsabilidades

```typescript
// ❌ MAL: Todo mezclado
function Component() {
  const [user, setUser] = useState(null); // Debería ser Context
  const [notifications, setNotifications] = useState([]); // Debería ser Zustand
  const [cursos, setCursos] = useState([]); // Debería ser React Query
}

// ✅ BIEN: Separado
function Component() {
  const { user } = useAuth(); // Context
  const notifications = useNotificationStore(); // Zustand
  const { data: cursos } = useCursos(); // React Query
}
```

### 2. Hooks Personalizados

Siempre encapsular lógica en hooks:

```typescript
// ✅ BIEN: Lógica encapsulada
function useCursoForm(cursoId?: string) {
  const { data: curso } = useCurso(cursoId || '');
  const createMutation = useCreateCurso();
  const updateMutation = useUpdateCurso();

  const handleSubmit = (data: CursoInput) => {
    if (cursoId) {
      updateMutation.mutate({ id: cursoId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    curso,
    handleSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
  };
}
```

### 3. Type Safety

Siempre definir tipos:

```typescript
// ✅ BIEN: Tipos explícitos
interface Curso {
  id: string;
  nombre: string;
  activo: boolean;
}

interface CursoStore {
  cursos: Curso[];
  addCurso: (curso: Curso) => void;
}

export const useCursoStore = create<CursoStore>((set) => ({
  cursos: [],
  addCurso: (curso) => set((state) => ({ cursos: [...state.cursos, curso] })),
}));
```

### 4. Evitar Re-renders Innecesarios

```typescript
// ❌ MAL: Re-render en cada cambio del store
const store = useUiStore();

// ✅ BIEN: Selector específico
const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Autenticación con Context

```typescript
// src/shared/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authService } from '@/features/auth/services/auth-service';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'PROFESOR' | 'ALUMNO' | 'ADMINISTRATIVO';
}

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

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Validar token y cargar usuario
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

### Ejemplo 2: Notificaciones con Zustand

```typescript
// src/shared/stores/notification-store.ts
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

    // Auto-remover después de duration
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

// Helper hook para facilitar uso
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

### Ejemplo 3: Data Fetching con React Query

```typescript
// src/features/cursos/hooks/use-cursos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cursoService } from '../services/curso-service';
import { useNotifications } from '@/shared/stores/notification-store';

export function useCursos(activo?: boolean) {
  return useQuery({
    queryKey: ['cursos', activo],
    queryFn: () => cursoService.getCursos(activo),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurso(id: string) {
  return useQuery({
    queryKey: ['curso', id],
    queryFn: () => cursoService.getCurso(id),
    enabled: !!id,
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: cursoService.createCurso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.success('Curso creado exitosamente');
    },
    onError: (error) => {
      notifications.error('Error al crear curso');
    },
  });
}

export function useUpdateCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CursoInput }) =>
      cursoService.updateCurso(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['curso', variables.id] });
      notifications.success('Curso actualizado exitosamente');
    },
    onError: () => {
      notifications.error('Error al actualizar curso');
    },
  });
}

export function useDeleteCurso() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (id: string) => cursoService.deleteCurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      notifications.success('Curso eliminado exitosamente');
    },
    onError: () => {
      notifications.error('Error al eliminar curso');
    },
  });
}
```

---

## 🎓 Resumen

### Context API
- **Para**: Estado realmente global (auth, tema)
- **Ventaja**: Nativo, simple
- **Desventaja**: Puede causar re-renders

### Zustand
- **Para**: Estado de UI compartido
- **Ventaja**: Ligero, sin Providers, TypeScript-first
- **Desventaja**: Librería externa (aunque pequeña)

### React Query
- **Para**: Datos del servidor
- **Ventaja**: Caché automática, sincronización
- **Desventaja**: Curva de aprendizaje inicial

### Regla de Oro

> **"Usa la herramienta más simple que resuelva tu problema"**

1. ¿Es estado local? → `useState`
2. ¿Es dato del servidor? → React Query
3. ¿Es estado global simple? → Context API
4. ¿Es estado de UI compartido? → Zustand

---

**¡Ahora tienes todo el conocimiento para manejar estado como un experto! 🚀**

