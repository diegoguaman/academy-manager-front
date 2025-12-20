# 👥 Plan de Trabajo para Equipo de 3 Desarrolladores Junior

Este documento divide el trabajo del Día 6 entre 3 desarrolladores junior, con explicaciones detalladas y directrices claras.

---

## 🎯 Objetivo del Día 6

Completar:
1. ✅ Utilidades responsive
2. ✅ Manejo centralizado de errores
3. ✅ Home y Navbar
4. ✅ CRUD completo de Alumnos (ejemplo)
5. ✅ Identificar entidades pendientes

---

## 👤 Asignación de Tareas

### 👨‍💻 Desarrollador 1: "Infraestructura y Utilidades"
**Nivel**: Junior con experiencia básica en React

**Tareas**:
1. Crear utilidades responsive
2. Implementar manejo centralizado de errores
3. Crear componentes base reutilizables

**Tiempo estimado**: 4-6 horas

---

### 👨‍💻 Desarrollador 2: "UI y Navegación"
**Nivel**: Junior con experiencia en Material UI

**Tareas**:
1. Crear Navbar responsive
2. Crear página Home/Dashboard
3. Integrar con sistema de autenticación

**Tiempo estimado**: 4-6 horas

---

### 👨‍💻 Desarrollador 3: "Features y CRUD"
**Nivel**: Junior con experiencia en React Query

**Tareas**:
1. Implementar CRUD completo de Alumnos (siguiendo guía)
2. Documentar entidades pendientes
3. Crear queries complejas recomendadas

**Tiempo estimado**: 6-8 horas

---

## 📋 Tareas Detalladas

---

## 👨‍💻 DESARROLLADOR 1: Infraestructura y Utilidades

### Tarea 1.1: Crear Hook useResponsive
**Archivo**: `src/shared/hooks/use-responsive.ts`

**Pasos**:
1. Leer `docs/dia6/RESPONSIVE-UTILITIES.md`
2. Crear hook que detecte breakpoints de Material UI
3. Exportar helpers: `useIsMobile`, `useIsTablet`, `useIsDesktop`

**Código base**:
```typescript
import { useTheme, useMediaQuery } from '@mui/material';

export function useResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // ... completar según documentación
}
```

**Verificación**:
- [ ] Hook funciona en componente de prueba
- [ ] Detecta correctamente móvil/tablet/desktop
- [ ] TypeScript no muestra errores

**¿Por qué es importante?**
- Evita repetir código de media queries
- Centraliza lógica de responsive
- Facilita mantenimiento

---

### Tarea 1.2: Crear Componentes Responsive
**Archivos**:
- `src/shared/components/responsive/responsive-container.tsx`
- `src/shared/components/responsive/responsive-grid.tsx`
- `src/shared/components/responsive/responsive-show.tsx`

**Pasos**:
1. Leer `docs/dia6/RESPONSIVE-UTILITIES.md`
2. Crear cada componente según documentación
3. Exportar desde `index.ts`

**Verificación**:
- [ ] Componentes se renderizan correctamente
- [ ] Se adaptan a diferentes tamaños de pantalla
- [ ] No hay errores de TypeScript

**¿Por qué es importante?**
- Componentes reutilizables
- Consistencia en diseño responsive
- Menos código duplicado

---

### Tarea 1.3: Implementar Manejo de Errores
**Archivos**:
- `src/shared/lib/errors/error-types.ts`
- `src/shared/lib/errors/error-messages.ts`
- `src/shared/lib/errors/error-handler.ts`

**Pasos**:
1. Leer `docs/dia6/MANEJO-ERRORES.md`
2. Crear tipos de errores
3. Crear mensajes user-friendly
4. Implementar función `handleGraphQLError`

**Verificación**:
- [ ] Error handler convierte errores técnicos en mensajes claros
- [ ] Funciona con errores de GraphQL
- [ ] Funciona con errores de REST
- [ ] Mensajes están en español

**¿Por qué es importante?**
- Experiencia de usuario mejorada
- Mensajes claros en vez de errores técnicos
- Centralización facilita mantenimiento

---

### Tarea 1.4: Integrar Error Handler con Clientes
**Archivos**:
- `src/shared/lib/graphql/client.ts` (actualizar)
- `src/shared/lib/api/client.ts` (actualizar)

**Pasos**:
1. Importar `handleGraphQLError`
2. Usar en catch blocks
3. Probar con errores simulados

**Verificación**:
- [ ] Errores de GraphQL se convierten correctamente
- [ ] Errores de REST se convierten correctamente
- [ ] No rompe funcionalidad existente

---

**Checklist Final Desarrollador 1**:
- [ ] Hook useResponsive creado y funcionando
- [ ] Componentes responsive creados
- [ ] Error handler implementado
- [ ] Integración con clientes completada
- [ ] Código compila sin errores
- [ ] ESLint pasa sin errores

---

## 👨‍💻 DESARROLLADOR 2: UI y Navegación

### Tarea 2.1: Crear Navbar Responsive
**Archivo**: `src/shared/components/layout/navbar.tsx`

**Pasos**:
1. Leer `docs/dia6/HOME-NAVBAR.md`
2. Crear componente Navbar con Material UI AppBar
3. Implementar sidebar para desktop
4. Implementar drawer para móvil
5. Filtrar menú según rol del usuario

**Código base**:
```typescript
import { AppBar, Toolbar, Drawer } from '@mui/material';
import { useAuth } from '@/shared/contexts/auth-context';
import { useResponsive } from '@/shared/hooks/use-responsive';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();
  // ... completar según documentación
}
```

**Verificación**:
- [ ] Navbar se muestra correctamente
- [ ] Sidebar funciona en desktop
- [ ] Drawer funciona en móvil
- [ ] Menú se filtra según rol
- [ ] Logout funciona correctamente

**¿Por qué es importante?**
- Navegación principal de la aplicación
- Primera impresión del usuario
- Responsive es esencial para UX

---

### Tarea 2.2: Crear Página Home
**Archivo**: `src/app/page.tsx`

**Pasos**:
1. Crear página que redirija según autenticación
2. Mostrar loading mientras verifica

**Verificación**:
- [ ] Redirige a login si no autenticado
- [ ] Redirige a dashboard si autenticado
- [ ] Muestra loading durante verificación

---

### Tarea 2.3: Crear Dashboard Home
**Archivo**: `src/app/dashboard/page.tsx`

**Pasos**:
1. Leer `docs/dia6/HOME-NAVBAR.md`
2. Crear página con estadísticas básicas
3. Usar hooks existentes (useCursos, useAlumnos)
4. Mostrar cards con información

**Verificación**:
- [ ] Muestra bienvenida con nombre de usuario
- [ ] Cards de estadísticas se muestran
- [ ] Responsive en móvil y desktop
- [ ] Integración con datos funciona

**¿Por qué es importante?**
- Primera vista después de login
- Da contexto al usuario
- Muestra información relevante

---

### Tarea 2.4: Actualizar Layout del Dashboard
**Archivo**: `src/app/dashboard/layout.tsx`

**Pasos**:
1. Integrar Navbar en layout
2. Ajustar spacing para sidebar
3. Hacer responsive

**Verificación**:
- [ ] Layout funciona correctamente
- [ ] Navbar visible en todas las páginas del dashboard
- [ ] Spacing correcto en desktop y móvil

---

**Checklist Final Desarrollador 2**:
- [ ] Navbar creado y funcionando
- [ ] Página home redirige correctamente
- [ ] Dashboard home muestra estadísticas
- [ ] Layout del dashboard integrado
- [ ] Todo es responsive
- [ ] Integración con auth funciona

---

## 👨‍💻 DESARROLLADOR 3: Features y CRUD

### Tarea 3.1: Implementar CRUD de Alumnos
**Archivos**:
- `src/features/alumnos/types/alumno.types.ts`
- `src/features/alumnos/services/alumno-service.ts`
- `src/features/alumnos/hooks/use-alumnos.ts`
- `src/features/alumnos/hooks/use-alumno-mutations.ts`
- `src/features/alumnos/components/alumno-list.tsx`
- `src/features/alumnos/components/alumno-form.tsx`
- `src/app/dashboard/alumno/page.tsx`

**Pasos**:
1. **Leer completamente** `docs/dia6/GUIA-IMPLEMENTACION-ALUMNO.md`
2. Seguir cada paso de la guía en orden
3. Probar cada componente después de crearlo
4. Integrar manejo de errores (usar `handleGraphQLError`)

**Orden de implementación**:
1. Tipos TypeScript
2. Servicio GraphQL
3. Hooks de queries
4. Hooks de mutations
5. Componente de lista
6. Componente de formulario
7. Página del dashboard

**Verificación después de cada paso**:
- [ ] Código compila sin errores TypeScript
- [ ] No hay errores de ESLint
- [ ] Funcionalidad probada manualmente

**¿Por qué seguir la guía?**
- Patrón probado y consistente
- Facilita mantenimiento futuro
- Aprendizaje estructurado

---

### Tarea 3.2: Documentar Entidades Pendientes
**Archivo**: `docs/dia6/ENTIDADES-PENDIENTES.md` (ya existe, revisar y completar)

**Pasos**:
1. Revisar schema GraphQL
2. Identificar entidades que faltan
3. Priorizar según importancia de negocio
4. Documentar complejidad de cada una

**Entidades a documentar**:
- Convocatorias
- Matrículas
- Centros
- Empresas
- Materias (completar CRUD)
- Formatos (completar CRUD)
- Profesores
- Usuarios Administrativos

**Para cada entidad**:
- Campos principales
- Relaciones
- Complejidad (Baja/Media/Alta)
- Prioridad (Alta/Media/Baja)

---

### Tarea 3.3: Crear Queries Complejas Recomendadas
**Archivo**: `docs/dia6/ENTIDADES-PENDIENTES.md` (sección de queries)

**Pasos**:
1. Identificar casos de uso comunes
2. Crear queries GraphQL que aprovechen relaciones
3. Documentar propósito de cada query
4. Incluir ejemplos de uso

**Queries a crear**:
- Dashboard de Alumno (con matrículas y calificaciones)
- Dashboard de Convocatoria (con alumnos matriculados)
- Estadísticas de Centro
- Reporte de Facturación
- Calificaciones por Materia

**Formato**:
```graphql
# Propósito: [Descripción]
query NombreQuery($variables: Type) {
  # Query aquí
}
```

---

**Checklist Final Desarrollador 3**:
- [ ] CRUD de Alumnos completo y funcionando
- [ ] Entidades pendientes documentadas
- [ ] Queries complejas documentadas
- [ ] Código sigue el patrón establecido
- [ ] Manejo de errores integrado
- [ ] Notificaciones funcionan

---

## 🔄 Flujo de Trabajo en Equipo

### 1. Setup Inicial (Todos)
- [ ] Hacer `git pull` para tener código actualizado
- [ ] Crear rama desde `main`: `git checkout -b feature/dia6-[nombre]`
- [ ] Leer documentación asignada

### 2. Desarrollo
- [ ] Trabajar en rama propia
- [ ] Hacer commits frecuentes y atómicos
- [ ] Probar después de cada cambio
- [ ] Pedir ayuda si hay bloqueos

### 3. Integración
- [ ] Hacer `git pull` antes de push
- [ ] Resolver conflictos si hay
- [ ] Push a rama propia
- [ ] Crear Pull Request

### 4. Code Review
- [ ] Revisar PRs de compañeros
- [ ] Aprobar si está correcto
- [ ] Solicitar cambios si hay problemas

### 5. Merge
- [ ] Merge a `main` después de aprobación
- [ ] Verificar que todo funciona en `main`

---

## 🆘 Resolución de Problemas

### Problema: Error de TypeScript
**Solución**:
1. Leer el error completo
2. Verificar tipos en el código
3. Consultar documentación de TypeScript
4. Preguntar al equipo si persiste

### Problema: Error de GraphQL
**Solución**:
1. Probar query en GraphiQL
2. Verificar schema GraphQL
3. Revisar tipos TypeScript
4. Verificar variables enviadas

### Problema: Componente no se renderiza
**Solución**:
1. Verificar que está exportado correctamente
2. Revisar consola del navegador
3. Verificar que está importado correctamente
4. Revisar errores de React

### Problema: No entiendo la documentación
**Solución**:
1. Leer nuevamente con calma
2. Buscar ejemplos en código existente
3. Preguntar al equipo
4. Revisar documentación oficial

---

## 📚 Recursos de Aprendizaje

### Para Desarrollador 1 (Infraestructura)
- [Material UI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Para Desarrollador 2 (UI)
- [Material UI Components](https://mui.com/material-ui/getting-started/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Context API](https://react.dev/reference/react/useContext)

### Para Desarrollador 3 (Features)
- [React Query Docs](https://tanstack.com/query/latest)
- [GraphQL Basics](https://graphql.org/learn/)
- [React Hook Form](https://react-hook-form.com/)

---

## ✅ Checklist Final del Equipo

### Infraestructura
- [ ] Utilidades responsive funcionando
- [ ] Manejo de errores implementado
- [ ] Integración con clientes completada

### UI
- [ ] Navbar responsive funcionando
- [ ] Home/Dashboard creado
- [ ] Layout integrado

### Features
- [ ] CRUD de Alumnos completo
- [ ] Entidades pendientes documentadas
- [ ] Queries complejas documentadas

### General
- [ ] Código compila sin errores
- [ ] ESLint pasa sin errores
- [ ] Funcionalidad probada
- [ ] Documentación actualizada

---

## 🎓 Objetivos de Aprendizaje

Al finalizar el Día 6, cada desarrollador debería:

1. **Entender** la arquitectura feature-based
2. **Saber crear** componentes responsive
3. **Implementar** manejo de errores centralizado
4. **Seguir** el patrón establecido para CRUDs
5. **Documentar** trabajo realizado

---

## 🚀 Siguiente Paso

Después del Día 6, el equipo puede:
- Implementar entidades pendientes siguiendo el patrón de Alumnos
- Crear queries complejas documentadas
- Mejorar UI/UX basado en feedback
- Agregar tests (Día 7)

---

**¡Éxito en el desarrollo! 🎉**

