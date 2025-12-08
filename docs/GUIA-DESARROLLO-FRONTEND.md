# 🎓 Guía Completa: Desarrollo Frontend - Sistema de Gestión Académica Multi-Centro

## 📋 Índice
1. [Estudio de Arquitectura y Stack Tecnológico](#estudio-de-arquitectura)
2. [Plan de Desarrollo - 7 Días](#plan-de-desarrollo)
3. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🏗️ Estudio de Arquitectura y Stack Tecnológico

### 1. Decisión: Next.js vs React puro

**¿Por qué Next.js?**

Las empresas serias valoran Next.js porque:
- **SSR (Server-Side Rendering)**: Mejora el SEO y la carga inicial (importante para dashboards administrativos)
- **API Routes**: Permite crear una capa BFF (Backend For Frontend) para manejar JWT de forma segura
- **File-based routing**: Sistema de rutas intuitivo y mantenible
- **Optimización automática**: Code splitting, optimización de imágenes, etc.
- **Producción-ready**: Usado por Netflix, TikTok, Hulu, etc.

**Alternativa considerada**: React con Vite
- Más rápido en desarrollo
- Menos "magia" (más control)
- Pero requiere más configuración manual

**Decisión**: Usaremos **Next.js 14** con App Router (la versión más moderna y recomendada por empresas)

---

### 2. Manejo de Estado: Zustand vs Redux vs Context API

#### Análisis de Requerimientos del Mercado

**Lo que piden las empresas:**
- TypeScript, React, Redux (mencionado frecuentemente)
- Conocimiento de patrones de estado global
- Experiencia con librerías modernas

#### Comparativa Técnica

| Característica | Redux | Zustand | Context API |
|---------------|-------|---------|-------------|
| **Curva de aprendizaje** | Alta | Baja | Media |
| **Boilerplate** | Mucho | Mínimo | Medio |
| **Bundle size** | ~12KB | ~1KB | 0KB (nativo) |
| **DevTools** | Excelente | Bueno | Limitado |
| **Uso en empresas** | Muy alto | Creciente | Universal |
| **TypeScript** | Excelente | Excelente | Bueno |

#### Decisión Estratégica: **Híbrido Zustand + Context API**

**¿Por qué esta combinación?**

1. **Zustand para estado de UI global**:
   - Notificaciones (toast messages)
   - Modales globales
   - Sidebar/drawer state
   - Tema (dark/light mode)
   - **Ventaja**: Menos código, más legible, TypeScript-first

2. **Context API para autenticación**:
   - Datos del usuario autenticado
   - Token JWT
   - **Por qué**: Es estado realmente global que necesita estar en toda la app, y Context es suficiente

3. **React Query (TanStack Query) para datos del servidor**:
   - Caché automática
   - Sincronización
   - Invalidación inteligente
   - **Por qué**: Es el estándar de facto para data fetching en 2024

**¿Y Redux?**
- Lo mencionaremos en el README como "conocimiento de patrones similares a Redux"
- Zustand usa conceptos similares (store, actions) pero más simples
- Si una empresa pregunta, puedes explicar que usaste Zustand por ser más moderno y eficiente

---

### 3. Stack Tecnológico Completo

#### Core Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript 5.x**

#### Gestión de Estado
- **Zustand** (estado UI global)
- **Context API** (autenticación)
- **React Query (TanStack Query)** (data fetching)

#### UI y Estilos
- **Material UI (MUI) v5/v6**: Componentes profesionales, accesibles, y con tema personalizable
- **Emotion** (viene con MUI): CSS-in-JS para estilos dinámicos
- **React Hook Form**: Formularios performantes y validación

#### GraphQL
- **@apollo/client** o **graphql-request**: Cliente GraphQL ligero
- **graphql-codegen**: Generación automática de tipos TypeScript desde schema GraphQL

#### Testing
- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **MSW (Mock Service Worker)**: Mocking de APIs para tests

#### Calidad de Código
- **ESLint**: Linter con reglas estrictas
- **Prettier**: Formateo automático
- **Husky**: Git hooks para pre-commit
- **lint-staged**: Lint solo archivos modificados

#### Docker
- **Multi-stage build**: Imagen optimizada para producción
- **Nginx**: Servidor web para servir la app estática

#### Desarrollo
- **dotenv**: Variables de entorno
- **axios**: Cliente HTTP (para REST auth)
- **date-fns**: Manejo de fechas

---

### 4. Arquitectura de Carpetas (Feature-Based)

```
front-academy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Route group para auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Route group para dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── cursos/
│   │   │   ├── alumnos/
│   │   │   └── ...
│   │   ├── api/               # API Routes (BFF)
│   │   │   └── auth/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home
│   │
│   ├── features/              # Módulos funcionales (Feature-based)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── cursos/
│   │   ├── alumnos/
│   │   ├── matriculas/
│   │   └── ...
│   │
│   ├── shared/                # Código compartido
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   └── ui/
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── lib/               # Utilidades
│   │   │   ├── graphql/
│   │   │   ├── api/
│   │   │   └── utils/
│   │   ├── stores/            # Zustand stores
│   │   ├── contexts/          # React Contexts
│   │   └── types/             # Tipos compartidos
│   │
│   └── styles/                # Estilos globales
│
├── public/                    # Assets estáticos
├── tests/                     # Tests E2E
├── docker/                    # Configuración Docker
│   ├── Dockerfile
│   └── nginx.conf
├── .github/                    # CI/CD
├── .husky/                     # Git hooks
├── .env.local                  # Variables de entorno (no commitear)
├── .env.example                # Ejemplo de variables
├── docker-compose.yml          # Para desarrollo local
├── jest.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

**¿Por qué esta estructura?**
- **Feature-based**: Cada feature es independiente (como microservicios)
- **Escalable**: Fácil agregar nuevas features
- **Mantenible**: Todo relacionado está junto
- **Estándar de la industria**: Similar a lo que usan empresas grandes

---

### 5. Principios SOLID Aplicados

#### Single Responsibility Principle (SRP)
- Cada componente tiene una responsabilidad única
- Hooks personalizados para lógica específica
- Servicios separados por dominio

#### Open/Closed Principle (OCP)
- Componentes extensibles mediante props
- Hooks reutilizables que aceptan configuraciones

#### Liskov Substitution Principle (LSP)
- Interfaces consistentes para componentes similares
- Tipos TypeScript bien definidos

#### Interface Segregation Principle (ISP)
- Interfaces pequeñas y específicas
- No forzar componentes a implementar lo que no necesitan

#### Dependency Inversion Principle (DIP)
- Depender de abstracciones (interfaces) no de implementaciones
- Inyección de dependencias en servicios

---

## 📅 Plan de Desarrollo - 7 Días

### Día 1: Configuración Inicial y Estructura Base

#### Commit 1.1: Inicializar proyecto Next.js con TypeScript
**Objetivo**: Crear la base del proyecto con todas las configuraciones iniciales.

**Comandos**:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**¿Por qué estos flags?**
- `--typescript`: TypeScript es estándar en empresas
- `--tailwind`: Lo incluimos pero usaremos principalmente MUI (puede ser útil para utilidades)
- `--eslint`: Linter desde el inicio
- `--app`: Usar App Router (más moderno)
- `--src-dir`: Organización con carpeta src/
- `--import-alias "@/*"`: Imports limpios (`@/components` en vez de `../../components`)

**Archivos creados**: Estructura base de Next.js

---

#### Commit 1.2: Configurar ESLint y Prettier con reglas estrictas
**Objetivo**: Establecer estándares de código desde el inicio.

**Instalación**:
```bash
npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks
```

**Archivos a crear/modificar**:
- `.eslintrc.json`: Reglas estrictas
- `.prettierrc`: Configuración de formato
- `.prettierignore`: Archivos a ignorar

**¿Por qué?**
- Código consistente en todo el equipo
- Menos bugs por errores de sintaxis
- Mejor legibilidad

---

#### Commit 1.3: Configurar estructura de carpetas feature-based
**Objetivo**: Crear la estructura de carpetas siguiendo arquitectura feature-based.

**Carpetas a crear**:
```
src/
├── features/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── contexts/
│   └── types/
└── styles/
```

**Archivos base**:
- `src/shared/types/index.ts`: Tipos base
- `src/shared/lib/utils/index.ts`: Utilidades

**¿Por qué esta estructura?**
- Separación clara de responsabilidades
- Fácil de escalar
- Estándar de la industria

---

#### Commit 1.4: Configurar variables de entorno y tipos
**Objetivo**: Establecer configuración de entorno y tipos TypeScript.

**Archivos**:
- `.env.example`: Template de variables
- `.env.local`: Variables locales (en .gitignore)
- `src/shared/types/env.d.ts`: Tipos para process.env

**Variables necesarias**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

**¿Por qué `NEXT_PUBLIC_`?**
- Next.js solo expone variables que empiezan con `NEXT_PUBLIC_` al cliente
- Seguridad: no exponer secretos

---

### Día 2: Configuración de Estado Global (Zustand + Context)

#### Commit 2.1: Instalar y configurar Zustand
**Objetivo**: Configurar Zustand para estado global de UI.

**Instalación**:
```bash
npm install zustand
```

**Archivo a crear**: `src/shared/stores/ui-store.ts`

**Conceptos a explicar**:
- **Store**: Un objeto que contiene estado y acciones
- **Selector**: Función para obtener parte del estado
- **Actions**: Funciones que modifican el estado

**Ejemplo básico**:
```typescript
import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

**¿Por qué Zustand?**
- Menos boilerplate que Redux
- TypeScript-first
- No necesita Providers (a diferencia de Context)
- Muy performante

---

#### Commit 2.2: Crear store de notificaciones con Zustand
**Objetivo**: Implementar sistema de notificaciones global.

**Archivo**: `src/shared/stores/notification-store.ts`

**Funcionalidades**:
- Agregar notificación
- Remover notificación
- Tipos: success, error, warning, info
- Auto-remover después de X segundos

**Conceptos**:
- **Inmutabilidad**: Zustand usa inmutabilidad automática
- **Middleware**: Podemos agregar persistencia, logging, etc.

---

#### Commit 2.3: Crear Context API para autenticación
**Objetivo**: Implementar Context para datos de usuario autenticado.

**Archivos**:
- `src/shared/contexts/auth-context.tsx`
- `src/shared/hooks/use-auth.ts`: Hook personalizado

**¿Por qué Context para auth y no Zustand?**
- Auth es estado que necesita estar en toda la app
- Context es suficiente para este caso
- Es el patrón estándar para auth en React
- Más fácil de entender para otros desarrolladores

**Conceptos a explicar**:
- **Provider**: Componente que envuelve la app y provee el contexto
- **Consumer**: Componente/hook que consume el contexto
- **useContext**: Hook para acceder al contexto

---

#### Commit 2.4: Integrar Context de auth en layout principal
**Objetivo**: Envolver la app con el AuthProvider.

**Archivo**: `src/app/layout.tsx`

**Conceptos**:
- **Provider pattern**: Envolver componentes hijos
- **Hydration**: Manejar estado inicial del servidor

---

### Día 3: Configuración de GraphQL y React Query

#### Commit 3.1: Instalar y configurar React Query
**Objetivo**: Configurar TanStack Query para data fetching.

**Instalación**:
```bash
npm install @tanstack/react-query
```

**Archivos**:
- `src/shared/lib/react-query/provider.tsx`: QueryClientProvider
- `src/shared/lib/react-query/config.ts`: Configuración del cliente

**Conceptos clave**:
- **QueryClient**: Cliente que maneja el estado de las queries
- **QueryClientProvider**: Provider que envuelve la app
- **useQuery**: Hook para hacer queries (GET)
- **useMutation**: Hook para hacer mutations (POST/PUT/DELETE)

**Configuración recomendada**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**¿Por qué React Query?**
- Caché automática
- Sincronización de datos
- Loading y error states automáticos
- Invalidación inteligente
- Optimistic updates

---

#### Commit 3.2: Configurar cliente GraphQL
**Objetivo**: Crear cliente GraphQL para comunicarse con el backend.

**Instalación**:
```bash
npm install graphql graphql-request
```

**Archivo**: `src/shared/lib/graphql/client.ts`

**Funcionalidades**:
- Cliente configurado con URL base
- Interceptor para agregar JWT token
- Manejo de errores

**Conceptos**:
- **GraphQL Request**: Librería ligera (vs Apollo Client que es más pesado)
- **Interceptors**: Modificar requests antes de enviarlos
- **Error handling**: Manejar errores de GraphQL

---

#### Commit 3.3: Crear tipos TypeScript desde schema GraphQL (opcional pero recomendado)
**Objetivo**: Generar tipos automáticamente desde el schema.

**Instalación**:
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

**Archivo**: `codegen.yml`

**¿Por qué?**
- Type-safety completo
- Autocompletado en IDE
- Detección de errores en tiempo de desarrollo
- Menos bugs

**Comando**:
```bash
npm run codegen
```

---

#### Commit 3.4: Crear hooks personalizados para queries GraphQL
**Objetivo**: Abstraer lógica de queries en hooks reutilizables.

**Archivo**: `src/shared/hooks/use-graphql-query.ts`

**Patrón**:
```typescript
export function useCursos(activo?: boolean) {
  return useQuery({
    queryKey: ['cursos', activo],
    queryFn: () => fetchCursos(activo),
  });
}
```

**Conceptos**:
- **Query Key**: Identificador único para la caché
- **Query Function**: Función que hace la petición
- **Custom Hooks**: Encapsular lógica reutilizable

---

### Día 4: Autenticación y Rutas Protegidas

#### Commit 4.1: Crear servicio de autenticación (REST)
**Objetivo**: Implementar login y register usando REST API.

**Archivos**:
- `src/features/auth/services/auth-service.ts`
- `src/features/auth/types/auth.types.ts`

**Instalación**:
```bash
npm install axios
```

**Funcionalidades**:
- `login(email, password)`: POST /api/auth/login
- `register(data)`: POST /api/auth/register
- `logout()`: Limpiar token
- Guardar token en localStorage

**Conceptos**:
- **REST vs GraphQL**: Auth usa REST (según backend)
- **JWT**: JSON Web Token, guardado en localStorage
- **Axios**: Cliente HTTP con interceptors

---

#### Commit 4.2: Crear componentes de Login y Register
**Objetivo**: UI para autenticación con Material UI.

**Instalación**:
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

**Archivos**:
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/register-form.tsx`

**Conceptos**:
- **React Hook Form**: Manejo de formularios
- **Validación**: Con yup o zod
- **Material UI**: Componentes profesionales

---

#### Commit 4.3: Implementar rutas protegidas con middleware
**Objetivo**: Proteger rutas según rol del usuario.

**Archivo**: `src/middleware.ts` (Next.js middleware)

**Funcionalidades**:
- Verificar JWT token
- Redirigir a login si no está autenticado
- Verificar roles para rutas específicas

**Conceptos**:
- **Middleware**: Se ejecuta antes de renderizar
- **Route protection**: Control de acceso
- **Role-based access**: Acceso por roles

---

#### Commit 4.4: Crear layout de dashboard con sidebar
**Objetivo**: Layout principal para usuarios autenticados.

**Archivos**:
- `src/app/(dashboard)/layout.tsx`
- `src/shared/components/layout/dashboard-layout.tsx`
- `src/shared/components/layout/sidebar.tsx`

**Funcionalidades**:
- Sidebar con navegación
- Header con usuario y logout
- Integrar Zustand para estado del sidebar

**Conceptos**:
- **Layouts anidados**: Next.js App Router
- **Route groups**: `(dashboard)` agrupa rutas
- **Componentes compartidos**: Reutilización

---

### Día 5: Feature de Cursos (CRUD completo)

#### Commit 5.1: Crear tipos y queries GraphQL para Cursos
**Objetivo**: Definir tipos y queries para el módulo de cursos.

**Archivos**:
- `src/features/cursos/types/curso.types.ts`
- `src/features/cursos/services/curso-service.ts`
- `src/features/cursos/hooks/use-cursos.ts`

**Queries GraphQL**:
- `cursos(activo?: Boolean)`: Listar cursos
- `curso(id: ID!)`: Obtener un curso

**Conceptos**:
- **TypeScript types**: Type-safety
- **Service layer**: Separar lógica de negocio
- **Custom hooks**: Encapsular React Query

---

#### Commit 5.2: Crear componente de lista de cursos
**Objetivo**: Mostrar cursos en una tabla con Material UI.

**Archivos**:
- `src/features/cursos/components/curso-list.tsx`
- `src/features/cursos/components/curso-table.tsx`

**Funcionalidades**:
- Tabla con paginación
- Filtros (activo/inactivo)
- Loading states
- Error handling

**Conceptos**:
- **Material UI Table**: Componente profesional
- **Paginación**: Manejo de datos grandes
- **Loading states**: UX mejorada

---

#### Commit 5.3: Crear formulario de curso (create/edit)
**Objetivo**: Formulario para crear y editar cursos.

**Archivos**:
- `src/features/cursos/components/curso-form.tsx`
- `src/features/cursos/components/curso-dialog.tsx`

**Instalación**:
```bash
npm install react-hook-form @hookform/resolvers zod
```

**Funcionalidades**:
- Validación con Zod
- Select para materias y formatos
- Manejo de errores

**Conceptos**:
- **React Hook Form**: Performance en formularios
- **Zod**: Validación type-safe
- **Controlled vs Uncontrolled**: React Hook Form usa uncontrolled

---

#### Commit 5.4: Implementar mutations (create, update, delete)
**Objetivo**: Conectar formularios con GraphQL mutations.

**Archivos**:
- `src/features/cursos/hooks/use-curso-mutations.ts`

**Mutations GraphQL**:
- `createCurso(input: CursoInput!)`
- `updateCurso(id: ID!, input: CursoInput!)`
- `deleteCurso(id: ID!)`

**Conceptos**:
- **useMutation**: Hook de React Query
- **Optimistic updates**: Actualizar UI antes de respuesta
- **Invalidation**: Refrescar queries después de mutations
- **Error handling**: Manejar errores de GraphQL

---

#### Commit 5.5: Integrar notificaciones con Zustand
**Objetivo**: Mostrar notificaciones al crear/editar/eliminar.

**Archivos**:
- `src/shared/components/notification/notification-container.tsx`

**Funcionalidades**:
- Toast notifications
- Integrar con mutations
- Auto-dismiss

**Conceptos**:
- **Zustand en acción**: Usar el store de notificaciones
- **Material UI Snackbar**: Componente de notificaciones

---

### Día 6: Más Features y Optimizaciones

#### Commit 6.1: Feature de Alumnos (similar a Cursos)
**Objetivo**: Implementar CRUD de alumnos siguiendo el mismo patrón.

**Estructura**:
- `src/features/alumnos/`
  - `components/`
  - `hooks/`
  - `services/`
  - `types/`

**Conceptos**:
- **Reutilización de patrones**: Mismo patrón que cursos
- **Feature independence**: Cada feature es independiente

---

#### Commit 6.2: Feature de Matrículas
**Objetivo**: Implementar gestión de matrículas.

**Complejidad adicional**:
- Relaciones: Alumno, Convocatoria
- Estados: EstadoPago enum
- Validaciones: Fechas, importes

**Conceptos**:
- **Relaciones en GraphQL**: Manejar entidades relacionadas
- **Enums**: Manejar tipos enumerados
- **Validaciones complejas**: Lógica de negocio

---

#### Commit 6.3: Optimizaciones de rendimiento
**Objetivo**: Mejorar performance de la aplicación.

**Optimizaciones**:
- **React.memo**: Memoizar componentes pesados
- **useMemo/useCallback**: Evitar re-renders innecesarios
- **Code splitting**: Lazy loading de rutas
- **Image optimization**: Next.js Image component

**Archivos**:
- Lazy imports en rutas
- Memoización de componentes

**Conceptos**:
- **Performance**: Optimización de React
- **Bundle size**: Reducir tamaño del bundle
- **Lazy loading**: Cargar código bajo demanda

---

#### Commit 6.4: Manejo de errores global
**Objetivo**: Sistema centralizado de manejo de errores.

**Archivos**:
- `src/shared/components/error-boundary.tsx`
- `src/shared/lib/error-handler.ts`

**Funcionalidades**:
- Error Boundary para errores de React
- Manejo de errores de GraphQL
- Página de error personalizada

**Conceptos**:
- **Error Boundary**: Capturar errores de React
- **Error handling**: Estrategias de manejo de errores

---

### Día 7: Testing, Docker y Documentación

#### Commit 7.1: Configurar Jest y React Testing Library
**Objetivo**: Setup de testing.

**Instalación**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Archivos**:
- `jest.config.js`
- `jest.setup.js`
- Tests de ejemplo

**Conceptos**:
- **Unit tests**: Probar funciones puras
- **Component tests**: Probar componentes
- **Testing Library**: Filosofía de testing

---

#### Commit 7.2: Escribir tests para componentes clave
**Objetivo**: Tests para componentes importantes.

**Tests a escribir**:
- Login form
- Curso form
- Hooks personalizados

**Conceptos**:
- **AAA pattern**: Arrange, Act, Assert
- **Mocking**: Simular dependencias
- **Coverage**: Cobertura de código

---

#### Commit 7.3: Crear Dockerfile multi-stage
**Objetivo**: Imagen Docker optimizada para producción.

**Archivo**: `docker/Dockerfile`

**Estructura multi-stage**:
1. **Stage 1 - Dependencies**: Instalar dependencias
2. **Stage 2 - Build**: Compilar la aplicación
3. **Stage 3 - Production**: Imagen final con Nginx

**Conceptos**:
- **Multi-stage build**: Reducir tamaño de imagen
- **Nginx**: Servidor web para servir archivos estáticos
- **Optimización**: Imagen pequeña y rápida

---

#### Commit 7.4: Configurar Nginx para producción
**Objetivo**: Configuración de Nginx para servir la app.

**Archivo**: `docker/nginx.conf`

**Configuración**:
- Servir archivos estáticos
- Routing para SPA (Next.js)
- Compresión gzip
- Headers de seguridad

**Conceptos**:
- **Reverse proxy**: Nginx como servidor web
- **SPA routing**: Manejar rutas del cliente
- **Performance**: Optimizaciones de Nginx

---

#### Commit 7.5: Crear docker-compose para desarrollo
**Objetivo**: Facilita desarrollo local con Docker.

**Archivo**: `docker-compose.yml`

**Servicios**:
- Frontend (desarrollo)
- Backend (referencia, si es necesario)

**Conceptos**:
- **Docker Compose**: Orquestación de contenedores
- **Volumes**: Persistencia de datos
- **Networks**: Comunicación entre servicios

---

#### Commit 7.6: Documentación completa
**Objetivo**: README detallado y documentación de código.

**Archivos**:
- `README.md`: Documentación principal
- `docs/`: Documentación adicional
  - `architecture.md`: Arquitectura del proyecto
  - `state-management.md`: Explicación de manejo de estado
  - `graphql.md`: Guía de GraphQL

**Contenido**:
- Setup del proyecto
- Estructura de carpetas
- Explicación de tecnologías
- Guía de contribución

---

## 📚 Conceptos Clave a Explicar en Cada Commit

### Zustand
- **Store**: Objeto que contiene estado y acciones
- **create**: Función para crear un store
- **Selector**: Función para obtener parte del estado
- **Actions**: Funciones que modifican el estado
- **Middleware**: Extender funcionalidad (persist, devtools)

### Context API
- **Provider**: Componente que provee el contexto
- **useContext**: Hook para consumir el contexto
- **Cuando usar**: Estado realmente global (auth, tema)
- **Rendimiento**: Puede causar re-renders si no se optimiza

### React Query
- **Query**: Petición de datos (GET)
- **Mutation**: Modificación de datos (POST/PUT/DELETE)
- **Cache**: Almacenamiento automático de datos
- **Stale**: Datos que pueden estar desactualizados
- **Invalidation**: Marcar queries como inválidas
- **Optimistic updates**: Actualizar UI antes de respuesta

### GraphQL
- **Query**: Obtener datos
- **Mutation**: Modificar datos
- **Schema**: Definición de tipos
- **Resolver**: Función que resuelve un campo
- **Variables**: Parámetros de queries/mutations

---

## 🎨 Consideraciones de Diseño

### Principios de Diseño para Interfaces Administrativas

1. **Claridad visual**:
   - Espaciado generoso (padding, margins)
   - Tipografía legible (tamaños adecuados)
   - Contraste suficiente

2. **Jerarquía de información**:
   - Información importante destacada
   - Agrupación lógica de elementos
   - Uso de cards y secciones

3. **Feedback al usuario**:
   - Loading states claros
   - Mensajes de error descriptivos
   - Confirmaciones para acciones destructivas

4. **Navegación intuitiva**:
   - Sidebar siempre visible
   - Breadcrumbs para rutas profundas
   - Búsqueda y filtros accesibles

5. **Responsive design**:
   - Funcional en móvil (aunque sea principalmente desktop)
   - Tablas con scroll horizontal si es necesario

### Tema Material UI

**Colores**:
- Primary: Azul profesional
- Secondary: Gris/verde complementario
- Background: Blanco/gris muy claro
- Text: Alto contraste

**Componentes**:
- Usar elevation (sombras) con moderación
- Bordes sutiles
- Iconos claros y reconocibles

---

## 🚀 Comandos Útiles

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npm run format       # Formatear con Prettier
```

### Testing
```bash
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Coverage de tests
```

### Docker
```bash
docker build -t front-academy -f docker/Dockerfile .
docker run -p 3000:80 front-academy
```

---

## 📝 Notas Finales

### Buenas Prácticas

1. **Commits atómicos**: Un commit = una funcionalidad completa
2. **Mensajes descriptivos**: "feat: agregar formulario de cursos" no "fix"
3. **TypeScript estricto**: No usar `any`, definir tipos siempre
4. **Componentes pequeños**: Máximo 200 líneas
5. **Hooks personalizados**: Reutilizar lógica
6. **Testing**: Probar lógica de negocio y componentes críticos

### Para Entrevistas

**Puntos a destacar**:
- Arquitectura feature-based escalable
- Manejo de estado moderno (Zustand + React Query)
- TypeScript estricto
- Testing con Jest
- Docker para producción
- Principios SOLID aplicados
- GraphQL con type-safety
- Material UI para UI profesional

**Preguntas comunes**:
- "¿Por qué Zustand y no Redux?": Menos boilerplate, más moderno, suficiente para nuestras necesidades
- "¿Cómo manejas el estado del servidor?": React Query para caché y sincronización automática
- "¿Cómo estructuras el proyecto?": Feature-based, cada feature es independiente como un microservicio

---

## ✅ Checklist Final

- [ ] Proyecto inicializado con Next.js
- [ ] TypeScript configurado
- [ ] ESLint y Prettier configurados
- [ ] Estructura de carpetas creada
- [ ] Zustand configurado
- [ ] Context API para auth
- [ ] React Query configurado
- [ ] Cliente GraphQL funcionando
- [ ] Autenticación implementada
- [ ] Rutas protegidas
- [ ] Al menos una feature completa (Cursos)
- [ ] Tests escritos
- [ ] Dockerfile creado
- [ ] Documentación completa

---

**¡Éxito con tu proyecto! 🚀**

