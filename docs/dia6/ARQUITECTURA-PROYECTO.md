# 🏗️ Arquitectura del Proyecto - Documentación para Entrevistas

Este documento explica la arquitectura del proyecto frontend, diseñado para responder preguntas técnicas en entrevistas.

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Gestión de Estado](#gestión-de-estado)
6. [Flujo de Datos](#flujo-de-datos)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Manejo de Errores](#manejo-de-errores)
9. [Testing](#testing)
10. [Preguntas Frecuentes en Entrevistas](#preguntas-frecuentes-en-entrevistas)

---

## 🎯 Visión General

### ¿Qué es este proyecto?

Sistema de gestión académica multi-centro desarrollado con **Next.js 14 (App Router)**, **TypeScript**, **GraphQL**, y **Material UI**.

### Principios Arquitectónicos

1. **Feature-Based Architecture**: Cada feature es independiente y autocontenida
2. **Separation of Concerns**: Separación clara de responsabilidades
3. **Type-Safety First**: TypeScript en todas las capas
4. **Reusabilidad**: Componentes y utilidades compartidas
5. **Escalabilidad**: Fácil agregar nuevas features sin afectar existentes

---

## 🛠️ Stack Tecnológico

### Core
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Type-safety en todo el código
- **React 18**: Biblioteca UI con hooks modernos

### Estado y Datos
- **TanStack Query (React Query)**: Gestión de estado del servidor y caché
- **Zustand**: Estado global de UI (sidebar, notificaciones)
- **Context API**: Estado de autenticación

### UI
- **Material UI (MUI)**: Componentes UI profesionales
- **React Hook Form**: Manejo de formularios performante
- **Zod**: Validación de esquemas type-safe

### Comunicación
- **GraphQL**: API principal (graphql-request)
- **Axios**: API REST para autenticación

### Herramientas
- **ESLint**: Linting de código
- **Prettier**: Formateo automático

---

## 📁 Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: rutas públicas
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Rutas protegidas
│   │   ├── curso/
│   │   ├── alumno/
│   │   └── layout.tsx     # Layout con Navbar
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Home (redirige según auth)
│
├── features/              # Features independientes (Feature-Based)
│   ├── auth/
│   │   ├── components/    # Componentes específicos de auth
│   │   ├── services/      # Llamadas a API
│   │   └── types/         # Tipos TypeScript
│   ├── cursos/
│   │   ├── components/
│   │   ├── hooks/         # Hooks de React Query
│   │   ├── services/
│   │   └── types/
│   └── alumnos/
│       └── ...
│
└── shared/                # Código compartido
    ├── components/        # Componentes reutilizables
    │   ├── layout/
    │   └── notification/
    ├── contexts/           # Context API (Auth)
    ├── hooks/             # Hooks compartidos
    ├── lib/               # Librerías y configuraciones
    │   ├── api/           # Cliente REST (Axios)
    │   ├── graphql/       # Cliente GraphQL
    │   ├── react-query/   # Configuración React Query
    │   └── errors/        # Manejo de errores
    ├── stores/            # Zustand stores
    ├── providers/         # Providers de librerías
    └── types/             # Tipos compartidos
```

### ¿Por qué Feature-Based?

**Ventajas**:
- ✅ Cada feature es independiente
- ✅ Fácil encontrar código relacionado
- ✅ Escalable: agregar features no afecta otras
- ✅ Equipos pueden trabajar en paralelo

**Ejemplo**: Si necesitas modificar algo de "Cursos", todo está en `src/features/cursos/`

---

## 🎨 Patrones de Diseño

### 1. Service Layer Pattern

**Separación entre lógica de negocio y componentes**

```
Component → Hook → Service → API
```

**Ejemplo**:
```typescript
// Service: src/features/cursos/services/curso-service.ts
export const cursoService = {
  async getCursos(): Promise<Curso[]> {
    return graphqlRequest(GET_CURSOS_QUERY);
  }
};

// Hook: src/features/cursos/hooks/use-cursos.ts
export function useCursos() {
  return useQuery({
    queryKey: ['cursos'],
    queryFn: () => cursoService.getCursos(),
  });
}

// Component: src/features/cursos/components/curso-list.tsx
export function CursoList() {
  const { data } = useCursos();
  return <Table>{/* ... */}</Table>;
}
```

**¿Por qué?**
- Reutilización: El service puede usarse fuera de React
- Testeable: Fácil mockear services
- Separación de responsabilidades

---

### 2. Custom Hooks Pattern

**Encapsular lógica de React Query en hooks personalizados**

```typescript
// En vez de usar useQuery directamente en componentes
export function useCursos() {
  return useQuery({
    queryKey: ['cursos'],
    queryFn: cursoService.getCursos,
  });
}
```

**Ventajas**:
- Reutilización
- Type-safety
- Lógica centralizada

---

### 3. Container/Presentational Pattern

**Separar lógica de presentación**

```typescript
// Presentational: Solo UI
export function CursoList({ cursos }: { cursos: Curso[] }) {
  return <Table>{/* ... */}</Table>;
}

// Container: Lógica y datos
export function CursoListContainer() {
  const { data } = useCursos();
  return <CursoList cursos={data} />;
}
```

---

## 🔄 Gestión de Estado

### Tres Niveles de Estado

#### 1. Estado Local (useState)
**Cuándo usar**: Estado que solo afecta a un componente

```typescript
const [isOpen, setIsOpen] = useState(false);
```

#### 2. Estado Global de UI (Zustand)
**Cuándo usar**: Estado compartido de UI (sidebar, notificaciones)

```typescript
// Store: src/shared/stores/ui-store.ts
export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

**¿Por qué Zustand?**
- ✅ Más simple que Redux
- ✅ No requiere Providers
- ✅ TypeScript-first
- ✅ Menos boilerplate

#### 3. Estado del Servidor (React Query)
**Cuándo usar**: Datos que vienen del servidor

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['cursos'],
  queryFn: cursoService.getCursos,
});
```

**¿Por qué React Query?**
- ✅ Caché automático
- ✅ Sincronización
- ✅ Loading/error states
- ✅ Invalidación inteligente

#### 4. Estado de Autenticación (Context API)
**Cuándo usar**: Estado realmente global que necesita Providers

```typescript
// Context: src/shared/contexts/auth-context.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
```

**¿Por qué Context para Auth?**
- Necesita Provider en layout raíz
- Accesible desde cualquier componente
- Integración con middleware de Next.js

---

## 📊 Flujo de Datos

### Flujo Completo: Crear un Curso

```
1. Usuario llena formulario
   ↓
2. CursoForm valida con Zod
   ↓
3. onSubmit → handleCreate
   ↓
4. useCreateCurso().mutateAsync(data)
   ↓
5. React Query ejecuta mutationFn
   ↓
6. cursoService.createCurso(input)
   ↓
7. graphqlRequest(CREATE_CURSO_MUTATION, { input })
   ↓
8. graphqlClient.request() → Backend GraphQL
   ↓
9. Backend responde con nuevo curso
   ↓
10. onSuccess: invalidateQueries(['cursos'])
   ↓
11. React Query refetch automático
   ↓
12. CursoList se actualiza con nuevo curso
   ↓
13. Notificación de éxito (Zustand)
```

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

```
1. Usuario ingresa email/password
   ↓
2. authService.login() → POST /api/auth/login
   ↓
3. Backend valida y devuelve JWT
   ↓
4. AuthContext guarda token y user
   ↓
5. Token se guarda en localStorage + cookie
   ↓
6. Middleware de Next.js verifica cookie
   ↓
7. Redirige a /dashboard si autenticado
```

### Middleware de Protección

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token && !isPublicPath) {
    return NextResponse.redirect('/login');
  }
}
```

### Autorización por Roles

```typescript
// En Navbar: filtrar menú según rol
const filteredMenuItems = menuItems.filter((item) =>
  item.roles.includes(user?.rol)
);
```

---

## 🛡️ Manejo de Errores

### Estrategia de Tres Capas

#### 1. Error Handler Centralizado
```typescript
// src/shared/lib/errors/error-handler.ts
export function handleGraphQLError(error: unknown): string {
  // Convierte error técnico en mensaje user-friendly
}
```

#### 2. Integración en Services
```typescript
// Cliente GraphQL convierte errores automáticamente
export async function graphqlRequest<T>(query: string) {
  try {
    return await graphqlClient.request<T>(query);
  } catch (error) {
    throw new Error(handleGraphQLError(error));
  }
}
```

#### 3. Notificaciones al Usuario
```typescript
// En hooks de mutations
onError: (error) => {
  notifications.error(handleGraphQLError(error));
}
```

---

## 🧪 Testing

### Estrategia (Pendiente de implementar)

1. **Unit Tests**: Services y utilidades
2. **Integration Tests**: Hooks y componentes
3. **E2E Tests**: Flujos completos

---

## ❓ Preguntas Frecuentes en Entrevistas

### 1. ¿Por qué Next.js App Router vs Pages Router?

**Respuesta**:
- App Router es más moderno (Next.js 13+)
- Mejor soporte para React Server Components
- Layouts anidados más flexibles
- Mejor performance con streaming

### 2. ¿Por qué GraphQL vs REST?

**Respuesta**:
- **Over-fetching**: REST trae datos innecesarios
- **Under-fetching**: REST requiere múltiples requests
- **Type-safety**: GraphQL Codegen genera tipos automáticamente
- **Queries complejas**: Una query puede traer datos relacionados

**Ejemplo**:
```graphql
# Una query trae todo
query GetConvocatoria {
  convocatoria(id: "1") {
    curso { nombre }
    profesor { nombre }
    matriculas { alumno { nombre } }
  }
}
```

### 3. ¿Por qué Zustand vs Redux?

**Respuesta**:
- **Simplicidad**: Menos boilerplate
- **No requiere Providers**: Más flexible
- **TypeScript-first**: Mejor type-safety
- **Bundle size**: Más pequeño

**Ejemplo**:
```typescript
// Zustand: 3 líneas
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Redux: ~50 líneas (actions, reducers, store, etc.)
```

### 4. ¿Cómo manejas el estado del servidor?

**Respuesta**:
- **React Query** para datos del servidor
- **Caché automático**: Evita requests duplicados
- **Invalidación inteligente**: Actualiza datos después de mutations
- **Optimistic updates**: Actualiza UI antes de respuesta del servidor

### 5. ¿Cómo aseguras type-safety end-to-end?

**Respuesta**:
1. **TypeScript** en frontend
2. **GraphQL Codegen** genera tipos desde schema
3. **Zod** valida datos en runtime
4. **Type guards** para validaciones

### 6. ¿Cómo escalas el proyecto?

**Respuesta**:
- **Feature-Based**: Cada feature es independiente
- **Shared folder**: Código reutilizable centralizado
- **Service Layer**: Lógica de negocio separada
- **Custom Hooks**: Lógica reutilizable

### 7. ¿Cómo manejas errores de red?

**Respuesta**:
- **Error Handler centralizado**: Convierte errores técnicos en mensajes user-friendly
- **Retry automático**: React Query reintenta requests fallidos
- **Notificaciones**: Zustand muestra errores al usuario
- **Error Boundary**: Captura errores de renderizado

### 8. ¿Cómo optimizas performance?

**Respuesta**:
- **React Query**: Caché y deduplicación de requests
- **Code splitting**: Next.js automático
- **Lazy loading**: Componentes pesados
- **Memoization**: useMemo/useCallback donde sea necesario
- **Image optimization**: Next.js Image component

---

## 📚 Recursos Adicionales

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Material UI Docs](https://mui.com/)

---

## 🎓 Conclusión

Esta arquitectura está diseñada para:
- ✅ **Escalabilidad**: Fácil agregar nuevas features
- ✅ **Mantenibilidad**: Código organizado y claro
- ✅ **Type-Safety**: TypeScript en todas las capas
- ✅ **Performance**: Optimizaciones automáticas
- ✅ **Developer Experience**: Herramientas modernas

