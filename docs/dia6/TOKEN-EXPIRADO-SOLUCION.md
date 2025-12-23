# 🔐 Solución al Problema de Token Expirado

Este documento explica el problema encontrado con tokens expirados, los intentos de solución y la solución final que funcionó.

---

## 📋 Problema Original

### Síntomas
- Cuando el token JWT expiraba, el usuario **seguía pudiendo acceder al dashboard**
- Las peticiones GraphQL fallaban con error "Error al cargar cursos"
- El backend devolvía errores 401: `JWT validation failed: Token has expired`
- **No se redirigía automáticamente al login** para reautenticarse

### Logs del Backend
```
2025-12-20T17:35:14.937Z ERROR c.a.a.security.JwtAuthenticationFilter : JWT validation failed: Token has expired
2025-12-20T17:35:16.133Z ERROR c.a.a.security.JwtAuthenticationFilter : JWT validation failed: Token has expired
```

### Flujo Problemático
1. Usuario tiene token expirado en `localStorage` y cookie
2. Middleware verifica existencia de token (no validez) → ✅ Permite acceso
3. Dashboard carga → ❌ Peticiones GraphQL fallan con 401
4. Interceptor detecta error pero NO redirige → ❌ Usuario ve error pero sigue en dashboard

---

## 🔍 Análisis del Problema

### Arquitectura de Autenticación

**REST API (Login/Register):**
- Usa `axios` con interceptor en `src/shared/lib/api/client.ts`
- Endpoints: `/api/auth/login`, `/api/auth/register`

**GraphQL (Datos):**
- Usa `graphql-request` con cliente en `src/shared/lib/graphql/client.ts`
- Endpoints: `/graphql`

**Middleware de Next.js:**
- Verifica existencia de token en cookies
- **NO valida expiración** (solo verifica existencia)

### Problemas Identificados

1. **Middleware demasiado permisivo**: Solo verifica existencia de token, no validez
2. **Interceptores no manejaban 401 correctamente**: Detectaban el error pero no redirigían
3. **Diferentes formas de exponer status code en GraphQL**: `ClientError` puede tener el status en diferentes propiedades según la versión

---

## ❌ Intentos de Solución que NO Funcionaron

### Intento 1: Crear utilidad separada (`auth.utils.ts`)

**Enfoque:**
- Crear función utilitaria `handleAuthError()` fuera del contexto React
- Llamarla desde los interceptors

**Problema:**
- Se creó el archivo pero el usuario lo eliminó
- Los cambios en los interceptors fueron rechazados
- No se integró correctamente con el flujo existente

**Razón del fallo:**
- Sobrecarga de abstracción innecesaria
- No se probó completamente antes de implementar

---

### Intento 2: Solo verificar status code HTTP

**Enfoque:**
```typescript
if (error instanceof ClientError) {
  const statusCode = error.response?.status;
  if (statusCode === 401) {
    handleAuthError();
  }
}
```

**Problema:**
- `ClientError` de `graphql-request` v7.3.5 no expone siempre `response.status`
- El status code puede estar en diferentes propiedades según el tipo de error
- Algunos errores de GraphQL devuelven 200 con errores en el body

**Razón del fallo:**
- No se verificaron múltiples formas de acceder al status code
- No se consideraron errores de GraphQL en el body de la respuesta

---

### Intento 3: Solo verificar mensaje de error

**Enfoque:**
```typescript
if (error.message.includes('expired')) {
  handleAuthError();
}
```

**Problema:**
- No todos los errores exponen el mensaje directamente
- Dependía de que el mensaje estuviera en el formato esperado
- No cubría todos los casos posibles

**Razón del fallo:**
- Solución demasiado específica
- No contemplaba variaciones en mensajes de error

---

## ✅ Solución Final que SÍ Funcionó

### Cambios Implementados

#### 1. Detección Multi-Método en GraphQL Client

Se implementaron **3 métodos diferentes** para detectar token expirado:

**Método 1: Status Code HTTP**
```typescript
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
}
```

**Método 2: Mensaje de Error Directo**
```typescript
const errorMessage = error.message?.toLowerCase() || '';
if (
  errorMessage.includes('expired') ||
  errorMessage.includes('invalid token') ||
  errorMessage.includes('unauthorized') ||
  errorMessage.includes('jwt validation failed') ||
  errorMessage.includes('token has expired')
) {
  shouldRedirect = true;
}
```

**Método 3: Errores de GraphQL en el Body**
```typescript
if (error.response && typeof error.response === 'object') {
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
  }
}
```

#### 2. Función `handleTokenExpired()` Mejorada

```typescript
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
```

**Mejoras clave:**
- ✅ Usa `window.location.replace()` en lugar de `window.location.href`
- ✅ Limpia cookies con múltiples métodos (asegura eliminación)
- ✅ Logging para debugging
- ✅ Limpia tanto `localStorage` como cookies (sincronización completa)

#### 3. Interceptor de Axios Actualizado

```typescript
case 401:
  const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register');
  
  if (!isAuthEndpoint && typeof window !== 'undefined') {
    console.warn('[Axios] Token expirado detectado (401), redirigiendo a login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    
    // Redirigir usando replace para evitar que el usuario pueda volver atrás
    window.location.replace('/login');
  }
  
  return Promise.reject(new Error(data?.message || 'No autorizado'));
```

**Mejoras clave:**
- ✅ Excepción para endpoints de login/register (401 esperado)
- ✅ Usa `window.location.replace()` para consistencia
- ✅ Limpieza completa de datos de autenticación

---

## 🎯 ¿Por Qué Funcionó la Solución Final?

### 1. Detección Robusta

La solución final usa **3 métodos diferentes** para detectar tokens expirados:
- ✅ Cubre diferentes versiones de `graphql-request`
- ✅ Maneja errores HTTP (401)
- ✅ Maneja errores de GraphQL en el body
- ✅ Verifica mensajes de error directamente

### 2. Redirección Forzada

Usar `window.location.replace()` en lugar de `window.location.href`:
- ✅ **Forza la navegación inmediatamente** (no se puede cancelar)
- ✅ **Reemplaza el historial** (usuario no puede volver atrás)
- ✅ **Más confiable** para redirecciones críticas de seguridad

### 3. Limpieza Completa

Limpieza de datos de autenticación:
- ✅ `localStorage` (token y usuario)
- ✅ Cookies (múltiples métodos para asegurar eliminación)
- ✅ Sincronización entre almacenamiento y middleware

### 4. Logging para Debugging

Agregamos `console.warn()` en puntos clave:
- ✅ Facilita debugging en desarrollo
- ✅ Permite rastrear el flujo de ejecución
- ✅ Identifica qué método detectó el token expirado

---

## 📊 Flujo Final (Solución Funcionando)

```
1. Usuario tiene token expirado
   ↓
2. Middleware verifica existencia de token → ✅ Permite acceso (solo verifica existencia)
   ↓
3. Dashboard carga y hace petición GraphQL
   ↓
4. Backend responde con 401: "JWT validation failed: Token has expired"
   ↓
5. Interceptor GraphQL detecta error usando 3 métodos:
   - Status code 401 → ✅ Detectado
   - Mensaje "expired" → ✅ Detectado  
   - Errores GraphQL → ✅ Detectado
   ↓
6. Se ejecuta handleTokenExpired():
   - Limpia localStorage (token, user)
   - Limpia cookies (múltiples métodos)
   - window.location.replace('/login') → ✅ Redirige forzadamente
   ↓
7. Usuario es redirigido a /login
   ↓
8. Usuario inicia sesión nuevamente → ✅ Token nuevo generado
```

---

## 🔑 Lecciones Aprendidas

### 1. Detección de Errores Multi-Método

Cuando trabajas con librerías que pueden tener diferentes estructuras de error según la versión, usa **múltiples métodos de detección**:
- ✅ Status code HTTP
- ✅ Mensajes de error
- ✅ Errores en el body (para GraphQL)
- ✅ Códigos de extensión

### 2. Redirección Forzada vs Navegación Normal

Para redirecciones críticas de seguridad:
- ✅ Usa `window.location.replace()` → Forza la navegación
- ❌ No uses `window.location.href` → Puede ser cancelada
- ❌ No uses `router.push()` → Puede fallar si hay errores de React

### 3. Limpieza Completa de Sesión

Cuando limpiar una sesión expirada:
- ✅ Limpia `localStorage` (token y datos de usuario)
- ✅ Limpia cookies (usando múltiples métodos para asegurar)
- ✅ Sincroniza ambos almacenamientos

### 4. Logging en Desarrollo

Agrega logging temporal para debugging:
- ✅ Facilita identificar qué método detectó el problema
- ✅ Permite rastrear el flujo de ejecución
- ✅ Útil para diagnosticar problemas en producción

### 5. Manejo de Errores en GraphQL vs REST

GraphQL puede devolver errores de diferentes formas:
- ✅ Status code HTTP (401)
- ✅ Errores en el body de la respuesta
- ✅ Mensajes de error en diferentes niveles
- ✅ Códigos de extensión en errores de GraphQL

---

## 📝 Archivos Modificados

### `src/shared/lib/graphql/client.ts`
- ✅ Detección multi-método de tokens expirados
- ✅ Función `handleTokenExpired()` mejorada
- ✅ Logging para debugging

### `src/shared/lib/api/client.ts`
- ✅ Manejo de 401 mejorado en interceptor
- ✅ Excepción para endpoints de autenticación
- ✅ Redirección forzada con `window.location.replace()`

---

## ✅ Verificación de la Solución

### Tests Manuales

1. **Token expirado en GraphQL:**
   - ✅ Usuario con token expirado accede al dashboard
   - ✅ Petición GraphQL falla con 401
   - ✅ Redirige automáticamente a `/login`

2. **Token expirado en REST (si aplica):**
   - ✅ Usuario con token expirado hace petición REST (no login/register)
   - ✅ Petición falla con 401
   - ✅ Redirige automáticamente a `/login`

3. **Login/Register con credenciales incorrectas:**
   - ✅ Petición a `/api/auth/login` con credenciales incorrectas → 401
   - ✅ NO redirige (comportamiento esperado)
   - ✅ Muestra error al usuario

4. **Limpieza de sesión:**
   - ✅ `localStorage` limpio después de redirección
   - ✅ Cookies limpias después de redirección
   - ✅ Usuario debe iniciar sesión nuevamente

---

## 🔮 Mejoras Futuras (Opcional)

1. **Middleware mejorado:**
   - Validar token antes de permitir acceso (requiere petición al backend)
   - Cachear resultado de validación para evitar peticiones innecesarias

2. **Refresh Token:**
   - Implementar refresh tokens para renovar automáticamente tokens expirados
   - Mejorar UX evitando redirecciones frecuentes

3. **Monitoring:**
   - Agregar métricas de tokens expirados
   - Alertas para detectar problemas de autenticación

4. **Tests Automatizados:**
   - Unit tests para `handleTokenExpired()`
   - Integration tests para flujo completo
   - E2E tests para verificar redirección

---

## 📚 Referencias

- [GraphQL Error Handling](https://graphql.org/learn/validation/)
- [graphql-request ClientError](https://github.com/jasonkuhrt/graphql-request)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Fecha de resolución:** 2025-12-20  
**Estado:** ✅ Resuelto y funcionando

