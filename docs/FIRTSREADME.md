# 🎓 Sistema de Gestión Académica Multi-Centro - Frontend

Frontend moderno desarrollado con Next.js, TypeScript, Material UI, Zustand y React Query para gestionar una academia multi-centro.

## 📚 Documentación

Este proyecto incluye documentación completa para aprender y desarrollar:

1. **[GUIA-DESARROLLO-FRONTEND.md](./GUIA-DESARROLLO-FRONTEND.md)**: Guía completa de desarrollo
   - Estudio de arquitectura y stack tecnológico
   - Plan de desarrollo de 7 días
   - Estructura del proyecto
   - Principios SOLID aplicados

2. **[docs/MANEJO-ESTADO-DETALLADO.md](./docs/MANEJO-ESTADO-DETALLADO.md)**: Guía detallada de manejo de estado
   - Context API - Profundización
   - Zustand - Guía completa
   - React Query - Data Fetching
   - Cuándo usar cada herramienta
   - Ejemplos prácticos

3. **[PLAN-COMMITS-DETALLADO.md](./PLAN-COMMITS-DETALLADO.md)**: Plan de commits atómicos
   - Cada commit explicado paso a paso
   - Comandos exactos a ejecutar
   - Archivos a crear/modificar
   - Verificaciones después de cada commit

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Backend corriendo en `http://localhost:8080`

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Stack Tecnológico

### Core
- **Next.js 14** (App Router) - Framework React con SSR
- **React 18** - Biblioteca UI
- **TypeScript 5.x** - Type-safety

### Estado
- **Zustand** - Estado global de UI (notificaciones, modales, sidebar)
- **Context API** - Autenticación (estado realmente global)
- **React Query (TanStack Query)** - Data fetching y caché

### UI
- **Material UI (MUI)** - Componentes profesionales
- **Emotion** - CSS-in-JS
- **React Hook Form** - Formularios performantes
- **Zod** - Validación type-safe

### GraphQL
- **graphql-request** - Cliente GraphQL ligero
- **GraphQL Codegen** - Generación automática de tipos

### Testing
- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes

### Calidad
- **ESLint** - Linter
- **Prettier** - Formateo automático
- **Husky** - Git hooks

### Docker
- **Multi-stage build** - Imagen optimizada
- **Nginx** - Servidor web para producción

## 📁 Estructura del Proyecto

```
front-academy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas del dashboard
│   │   └── api/               # API Routes (BFF)
│   │
│   ├── features/              # Módulos funcionales
│   │   ├── auth/
│   │   ├── cursos/
│   │   ├── alumnos/
│   │   └── matriculas/
│   │
│   └── shared/                # Código compartido
│       ├── components/        # Componentes reutilizables
│       ├── hooks/             # Hooks personalizados
│       ├── lib/               # Utilidades
│       ├── stores/            # Zustand stores
│       ├── contexts/          # React Contexts
│       └── types/             # Tipos compartidos
│
├── docs/                      # Documentación
├── docker/                    # Configuración Docker
└── tests/                     # Tests E2E
```

## 🎯 Principios de Diseño

### Arquitectura
- **Feature-based**: Cada feature es independiente
- **SOLID**: Principios aplicados en todo el código
- **Type-safety**: TypeScript estricto, sin `any`
- **Separación de responsabilidades**: Service layer, hooks, componentes

### UI/UX
- **Claridad visual**: Espaciado generoso, tipografía legible
- **Jerarquía de información**: Información importante destacada
- **Feedback al usuario**: Loading states, mensajes claros
- **Navegación intuitiva**: Sidebar siempre visible, breadcrumbs

## 🔐 Autenticación

El sistema usa JWT para autenticación:

- **REST API**: `/api/auth/login` y `/api/auth/register`
- **Token**: Guardado en localStorage
- **Roles**: ADMIN, PROFESOR, ALUMNO, ADMINISTRATIVO
- **Rutas protegidas**: Middleware de Next.js

## 📡 API

### REST (Solo autenticación)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse

### GraphQL (Todo lo demás)
- **Endpoint**: `/graphql`
- **Playground**: `/graphiql`
- **Queries**: cursos, alumnos, matriculas, etc.
- **Mutations**: create, update, delete para todas las entidades

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up
```

### Producción
```bash
docker build -t front-academy -f docker/Dockerfile .
docker run -p 3000:80 front-academy
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Tests
npm run codegen      # Generar tipos GraphQL
```

## 🎓 Aprendizaje

Este proyecto está diseñado para enseñar:

1. **Manejo de estado moderno**:
   - Cuándo usar Context API vs Zustand vs React Query
   - Patrones y mejores prácticas
   - Optimización de re-renders

2. **Arquitectura escalable**:
   - Feature-based architecture
   - Separación de responsabilidades
   - Principios SOLID

3. **Tecnologías empresariales**:
   - Next.js con App Router
   - TypeScript estricto
   - Material UI
   - GraphQL con type-safety
   - Docker para producción

## 🤝 Contribuir

1. Leer la documentación completa en `GUIA-DESARROLLO-FRONTEND.md`
2. Seguir el plan de commits en `PLAN-COMMITS-DETALLADO.md`
3. Mantener commits atómicos
4. Escribir tests para nueva funcionalidad
5. Seguir convenciones de código (ESLint, Prettier)

## 📄 Licencia

Este proyecto es parte de un sistema académico multi-centro.

---

**Desarrollado con ❤️ para aprender y enseñar desarrollo frontend moderno**

