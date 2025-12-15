# 🗺️ Guía Completa: Routing en Next.js App Router

## 📚 Conceptos Fundamentales

### ¿Cómo funciona el File-Based Routing?

En Next.js App Router, **cada carpeta dentro de `app/` crea una ruta en tu aplicación**. La estructura de carpetas = la estructura de URLs.

### Reglas Básicas

| Estructura de Carpetas | URL Resultante | Explicación |
|------------------------|----------------|-------------|
| `app/page.tsx` | `/` | Página principal |
| `app/about/page.tsx` | `/about` | Ruta `/about` |
| `app/blog/page.tsx` | `/blog` | Ruta `/blog` |
| `app/products/[id]/page.tsx` | `/products/123` | Ruta dinámica |
| `app/(auth)/login/page.tsx` | `/login` | Route group (NO aparece en URL) |
| `app/auth/login/page.tsx` | `/auth/login` | Carpeta normal (SÍ aparece en URL) |

---

## 🎯 Tu Problema Actual

**Estructura actual**:
```
src/app/
  └── auth/
      └── login/
          └── page.tsx
```

**URL resultante**: `/auth/login` ❌

**Pero tu middleware y código esperan**: `/login` ✅

---

## ✅ Soluciones

### Opción 1: Route Groups (RECOMENDADO - Más Profesional)

**Route Groups** son carpetas con paréntesis `(nombre)` que **NO aparecen en la URL**. Solo organizan código.

**Estructura**:
```
src/app/
  ├── (auth)/              ← Route group (NO aparece en URL)
  │   ├── layout.tsx       ← Layout solo para auth
  │   ├── login/
  │   │   └── page.tsx     ← URL: /login ✅
  │   └── register/
  │       └── page.tsx     ← URL: /register ✅
  └── dashboard/
      └── page.tsx         ← URL: /dashboard ✅
```

**Ventajas**:
- ✅ URLs limpias (`/login`, no `/auth/login`)
- ✅ Organización lógica de código
- ✅ Layouts específicos por grupo
- ✅ SEO-friendly

**Cuándo usar**: Cuando quieres agrupar rutas lógicamente sin afectar URLs.

---

### Opción 2: Estructura Plana (Simple)

Si solo tienes pocas rutas, puedes ponerlas directamente:

**Estructura**:
```
src/app/
  ├── login/
  │   └── page.tsx         ← URL: /login ✅
  ├── register/
  │   └── page.tsx         ← URL: /register ✅
  └── dashboard/
      └── page.tsx         ← URL: /dashboard ✅
```

**Ventajas**:
- ✅ Simple y directo
- ✅ Fácil de entender

**Desventajas**:
- ❌ Puede desordenarse con muchas rutas
- ❌ No permite layouts específicos por grupo

---

### Opción 3: Carpeta Normal (NO RECOMENDADO para este caso)

**Estructura**:
```
src/app/
  └── auth/
      └── login/
          └── page.tsx     ← URL: /auth/login ❌
```

**Problema**: La URL sería `/auth/login`, no `/login`. Tendrías que cambiar middleware y redirecciones.

---

## 🏗️ Arquitectura Profesional Recomendada

### Estructura Completa para tu Proyecto

```
src/app/
├── layout.tsx                    # Root layout (providers globales)
├── page.tsx                      # Home (/)
│
├── (auth)/                       # Route group para autenticación
│   ├── layout.tsx                # Layout específico (sin sidebar)
│   ├── login/
│   │   └── page.tsx              # /login
│   └── register/
│       └── page.tsx              # /register
│
├── (dashboard)/                  # Route group para dashboard
│   ├── layout.tsx                # Layout con sidebar
│   ├── page.tsx                  # /dashboard (o mover a /dashboard)
│   ├── cursos/
│   │   └── page.tsx              # /cursos
│   └── alumnos/
│       └── page.tsx              # /alumnos
│
└── api/                          # API Routes
    └── auth/
        └── route.ts              # /api/auth/*
```

---

## 📋 Layouts Anidados

### ¿Qué son los Layouts?

Los layouts envuelven las páginas y **se comparten entre rutas**. Se anidan automáticamente.

**Jerarquía**:
```
app/layout.tsx              ← Root layout (envuelve TODO)
  └── (auth)/layout.tsx     ← Layout de auth (envuelve login/register)
      └── login/page.tsx    ← Página de login
```

**Código resultante**:
```tsx
// Lo que se renderiza para /login:
<RootLayout>
  <AuthLayout>
    <LoginPage />
  </AuthLayout>
</RootLayout>
```

---

## 🎨 Mejores Prácticas

### 1. Route Groups para Organización

✅ **USAR** cuando:
- Tienes múltiples rutas relacionadas (auth, dashboard, admin)
- Quieres layouts específicos por grupo
- Quieres URLs limpias

❌ **NO USAR** cuando:
- Solo tienes 1-2 rutas
- No necesitas organización especial

### 2. Nombres de Carpetas

- ✅ `login/` → URL: `/login`
- ✅ `(auth)/` → NO aparece en URL (route group)
- ✅ `[id]/` → Parámetro dinámico
- ❌ `_auth/` → NO es route group (solo `()` lo es)

### 3. Estructura de Carpetas

```
✅ BIEN:
app/
  (auth)/
    login/
      page.tsx
    layout.tsx

✅ BIEN:
app/
  login/
    page.tsx

❌ MAL (URL sería /auth/login):
app/
  auth/
    login/
      page.tsx
```

---

## 🔧 Solución para Tu Caso

**Tu problema**: Tienes `app/auth/login/page.tsx` pero necesitas URL `/login`

**Solución**: Mover a route group o estructura plana

### Opción A: Route Group (RECOMENDADO)

1. Renombrar `auth/` → `(auth)/`
2. Dejar todo igual

### Opción B: Estructura Plana

1. Mover `auth/login/page.tsx` → `login/page.tsx`
2. Eliminar carpeta `auth/`
3. Mover `auth/layout.tsx` → `login/layout.tsx` (opcional)

---

## 📝 Resumen Ejecutivo

1. **Carpetas normales** (`auth/`) = aparecen en URL (`/auth/login`)
2. **Route groups** (`(auth)/`) = NO aparecen en URL (`/login`)
3. **Layouts** = se anidan automáticamente
4. **Mejor práctica**: Usar route groups para organizar sin afectar URLs

---

**Última actualización**: Diciembre 2025
