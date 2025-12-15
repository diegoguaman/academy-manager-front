# 🔄 Flujo Completo del Login - Explicación Detallada

Este documento explica paso a paso cómo funciona el sistema de login, desde que el usuario hace clic en el botón hasta que se redirige al dashboard.

---

## 📋 Índice

1. [Flujo Visual](#flujo-visual)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Flujo Paso a Paso](#flujo-paso-a-paso)
4. [Almacenamiento del Token](#almacenamiento-del-token)
5. [Estructura de Datos](#estructura-de-datos)

---

## 🎯 Flujo Visual

```
Usuario hace clic en "Iniciar Sesión"
    ↓
LoginForm valida datos (Zod)
    ↓
LoginForm llama a useAuth().login()
    ↓
AuthContext llama a authService.login()
    ↓
authService usa apiClient (Axios)
    ↓
apiClient lee NEXT_PUBLIC_API_URL del .env
    ↓
POST http://localhost:8080/api/auth/login
    ↓
Backend responde con { token, email, rol, nombre }
    ↓
authService devuelve la respuesta
    ↓
AuthContext mapea respuesta a User interno
    ↓
AuthContext guarda token en localStorage + cookies
    ↓
AuthContext redirige a /dashboard
    ↓
Middleware verifica cookie 'token' en próximas requests
```

---

## ⚙️ Configuración de Variables de Entorno

### ¿Dónde se configura la URL base?

**Archivo**: `.env.local` (crear si no existe)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**¿Por qué `NEXT_PUBLIC_`?**
- Next.js solo expone variables que empiezan con `NEXT_PUBLIC_` al cliente (browser)
- Sin este prefijo, la variable solo estaría disponible en el servidor

**¿De dónde sale el nombre?**
- El nombre es arbitrario, pero debe empezar con `NEXT_PUBLIC_`
- Lo creamos en `src/shared/lib/config/env.ts`:

```typescript
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  // ...
};
```

**Uso en el código**:
```typescript
// src/shared/lib/api/client.ts
export const apiClient = axios.create({
  baseURL: env.apiUrl, // Lee de .env.local
});
```

---

## 🔄 Flujo Paso a Paso

### 1. Usuario completa el formulario y hace clic en "Iniciar Sesión"

**Archivo**: `src/features/auth/components/login-form.tsx`

```typescript
const onSubmit = async (data: LoginFormData) => {
  setError(null);
  try {
    await login(data.email, data.password); // ← Llama al contexto
  } catch (err) {
    setError(err.message); // ← Muestra error si falla
  }
};
```

**Qué hace**:
- Valida que el email y password cumplan con Zod
- Llama a `useAuth().login()` del contexto
- Maneja errores y los muestra al usuario

---

### 2. AuthContext procesa el login

**Archivo**: `src/shared/contexts/auth-context.tsx`

```typescript
const login = useCallback(async (email: string, password: string) => {
  setIsLoading(true); // ← Muestra "Iniciando sesión..."
  try {
    // 2.1. Llama al servicio
    const response = await authService.login({ email, password });
    
    // 2.2. Valida respuesta
    if (!response.token) throw new Error('No se recibió token');
    
    // 2.3. Mapea respuesta del backend a User interno
    const userData: User = {
      id: response.email, // Backend no envía ID, usamos email
      email: response.email,
      nombre: response.nombre,
      rol: response.rol,
    };
    
    // 2.4. Guarda en estado React
    setToken(response.token);
    setUser(userData);
    
    // 2.5. Sincroniza localStorage + cookies
    setAuthToken(response.token);
    
    // 2.6. Redirige
    router.push('/dashboard');
  } catch (error) {
    // Limpia estado y relanza error
    setToken(null);
    setUser(null);
    setAuthToken(null);
    throw error; // ← El LoginForm lo captura y muestra
  } finally {
    setIsLoading(false);
  }
}, [router]);
```

---

### 3. authService hace la petición HTTP

**Archivo**: `src/features/auth/services/auth.service.ts`

```typescript
export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    // POST http://localhost:8080/api/auth/login
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data; // ← Extrae solo los datos, no toda la respuesta HTTP
  },
};
```

**Qué hace**:
- Usa `apiClient` (Axios configurado)
- Hace POST a `/api/auth/login`
- La URL completa es: `baseURL + /api/auth/login` = `http://localhost:8080/api/auth/login`
- Devuelve solo `response.data`, no toda la respuesta HTTP

---

### 4. apiClient configura Axios

**Archivo**: `src/shared/lib/api/client.ts`

```typescript
export const apiClient = axios.create({
  baseURL: env.apiUrl, // ← Lee de .env.local: http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Interceptores**:

**Request Interceptor** (antes de enviar):
```typescript
apiClient.interceptors.request.use((config) => {
  // Agrega token a todas las requests si existe
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor** (después de recibir):
```typescript
apiClient.interceptors.response.use(
  (response) => response, // ← Si todo bien, devuelve respuesta
  (error) => {
    // ← Si hay error, lo transforma en Error con mensaje claro
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Credenciales inválidas'));
    }
    // ...
  }
);
```

---

### 5. Backend responde

**Estructura de respuesta real del backend**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "email": "diengo@diego.com",
  "rol": "ADMIN",
  "nombre": "Diego Apellido Apodo"
}
```

**Tipo TypeScript esperado** (`AuthResponse`):
```typescript
export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  rol: string;
  nombre: string;
}
```

---

## 💾 Almacenamiento del Token

### ¿Dónde se guarda el token?

**Función**: `setAuthToken()` en `auth-context.tsx`

```typescript
function setAuthToken(token: string | null): void {
  if (token) {
    // 1. localStorage (para interceptores de Axios)
    localStorage.setItem('token', token);
    
    // 2. Cookie (para middleware de Next.js)
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    // Limpiar ambos si token es null
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
  }
}
```

### ¿Por qué ambos (localStorage + Cookie)?

| Almacenamiento | Accesible desde | Uso |
|----------------|-----------------|-----|
| **localStorage** | Solo JavaScript del cliente | Interceptores de Axios agregan token a requests |
| **Cookie** | Cliente + Servidor (middleware) | Middleware de Next.js verifica autenticación antes de renderizar |

**Ventaja**: Ambos están sincronizados, así que funciona tanto para requests HTTP como para protección SSR.

---

## 📊 Estructura de Datos

### Respuesta del Backend → Tipo Interno

**Backend devuelve** (estructura plana):
```typescript
{
  token: string;
  email: string;
  rol: string;
  nombre: string;
}
```

**Mapeo a User interno**:
```typescript
const userData: User = {
  id: response.email,        // Backend no envía ID, usamos email temporalmente
  email: response.email,     // Directo
  nombre: response.nombre,   // Directo
  rol: response.rol,         // Con type assertion
};
```

**Tipo User interno**:
```typescript
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'PROFESOR' | 'ALUMNO' | 'ADMINISTRATIVO';
}
```

---

## ✅ Checklist: ¿Está llamando al backend?

### Verificación paso a paso:

1. **¿Existe `.env.local` con la URL?**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

2. **¿El backend está corriendo en el puerto 8080?**
   - Verifica: `http://localhost:8080/api/auth/login`

3. **Abre DevTools (F12) → Network**:
   - Deberías ver una petición POST a `/api/auth/login`
   - Si no aparece, hay un error antes de la petición

4. **Revisa la consola del navegador**:
   - Errores de CORS?
   - Errores de conexión?
   - Errores de validación?

---

## 🔍 Debugging

### Si no se hace la petición:

1. **Verifica que el formulario llame a `onSubmit`**:
   ```typescript
   const onSubmit = async (data: LoginFormData) => {
     console.log('onSubmit llamado', data); // ← Agregar temporalmente
     await login(data.email, data.password);
   };
   ```

2. **Verifica que authService se llame**:
   ```typescript
   async login(data: LoginRequest): Promise<AuthResponse> {
     console.log('authService.login llamado', data); // ← Agregar
     const response = await apiClient.post(...);
     console.log('Respuesta recibida', response.data); // ← Agregar
     return response.data;
   }
   ```

3. **Verifica la URL base**:
   ```typescript
   console.log('API URL:', env.apiUrl); // Debería mostrar http://localhost:8080
   ```

---

## 📝 Resumen

1. **LoginForm** valida y llama al contexto
2. **AuthContext** llama al servicio
3. **authService** usa apiClient (Axios)
4. **apiClient** lee URL de `.env.local`
5. **Backend** responde con token y datos
6. **AuthContext** mapea y guarda token (localStorage + cookie)
7. **AuthContext** redirige a `/dashboard`
8. **Middleware** verifica cookie en próximas requests

---

**Última actualización**: Diciembre 2025
