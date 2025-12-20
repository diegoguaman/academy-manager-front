# Caso de Estudio: Problema de Persistencia de Sesión en React Context API

## 📋 Resumen Ejecutivo

Este documento describe un bug crítico encontrado en un sistema de autenticación basado en React Context API, donde los datos del usuario se perdían al recargar la página o navegar entre rutas. El problema se resolvió implementando persistencia de datos en `localStorage`.

**Tecnologías involucradas**: React, Next.js, TypeScript, Context API, localStorage

---

## 🐛 Descripción del Problema

### Síntomas Observados

1. **Al hacer login por primera vez**: Todo funciona correctamente
   - El nombre del usuario aparece en el navbar
   - El menú de navegación se muestra con los items filtrados por rol
   - La aplicación funciona normalmente

2. **Al recargar la página (F5)**: Los datos desaparecen
   - El navbar no muestra el nombre del usuario
   - El menú de navegación no aparece (retorna `null`)
   - La aplicación parece "deslogueada" aunque el token sigue existiendo

3. **Al navegar a otra pantalla**: Mismo comportamiento que al recargar

### Impacto en el Usuario

- **Experiencia de usuario degradada**: El usuario debe volver a hacer login constantemente
- **Pérdida de confianza**: La aplicación parece inestable
- **Problemas de productividad**: Interrupciones constantes en el flujo de trabajo

---

## 🔍 Análisis del Problema

### Código Problemático (Antes)

```typescript
// src/shared/contexts/auth-context.tsx

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken(); // ✅ Carga el token desde localStorage
    if (storedToken) {
      setToken(storedToken);
      // ❌ PROBLEMA: Solo se carga el token, NO los datos del usuario
      // TODO: Validar token con backend y cargar datos de usuario
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // ... código de login ...
    
    // ✅ Guarda token en localStorage
    setAuthToken(authToken);
    
    // ❌ PROBLEMA: Solo guarda en estado React, NO en localStorage
    setUser(userData);
    
    // Al recargar la página, el estado React se resetea
    // El token existe, pero user es null
  }, [router]);
}
```

### Causa Raíz

El problema tiene dos causas principales:

1. **Estado React es efímero**: Cuando se recarga la página, todo el estado de React se resetea. Solo se estaba persistiendo el token, pero no los datos del usuario.

2. **Falta de sincronización**: El `useEffect` de inicialización solo restauraba el token desde `localStorage`, pero no los datos del usuario, dejando el estado inconsistente:
   - `token` existe → `isAuthenticated = true`
   - `user` es `null` → El navbar no puede mostrar el nombre ni filtrar el menú

### Flujo del Bug

```
1. Usuario hace login
   ├─ Token guardado en localStorage ✅
   ├─ User guardado en estado React ✅
   └─ Navbar muestra nombre y menú ✅

2. Usuario recarga página (F5)
   ├─ React se reinicia (estado se pierde)
   ├─ useEffect ejecuta:
   │  ├─ Carga token desde localStorage ✅
   │  └─ NO carga user desde localStorage ❌
   ├─ Estado resultante:
   │  ├─ token: "abc123" ✅
   │  └─ user: null ❌
   └─ Navbar:
      ├─ isAuthenticated = true (porque token existe)
      ├─ user = null
      ├─ No muestra nombre ❌
      └─ filteredMenuItems = [] (porque user?.rol es undefined) ❌
```

### Código del Navbar (Afectado)

```typescript
// src/shared/components/layout/navbar.tsx

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  
  // ❌ Si user es null, filteredMenuItems será un array vacío
  const filteredMenuItems = menuItems.filter((item) =>
    user?.rol ? item.roles.includes(user.rol) : false
  );

  // ❌ Si user es null, no se muestra el nombre
  <Typography variant="body2">
    {user?.nombre || user?.email} {/* Siempre vacío si user es null */}
  </Typography>

  // ✅ El navbar se oculta si no está autenticado
  if (!isAuthenticated) {
    return null;
  }
}
```

---

## ✅ Solución Implementada

### Cambios Realizados

#### 1. Funciones Helper para Persistencia de Usuario

```typescript
/**
 * Helper para guardar datos del usuario en localStorage
 */
function setUserData(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

/**
 * Helper para obtener datos del usuario desde localStorage
 */
function getUserData(): User | null {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}
```

**Características importantes**:
- ✅ Verifica `typeof window` para evitar errores en SSR (Next.js)
- ✅ Maneja errores de parsing JSON con try-catch
- ✅ Retorna `null` si no hay datos o si hay error

#### 2. Modificación del useEffect de Inicialización

```typescript
useEffect(() => {
  const storedToken = getAuthToken();
  const storedUser = getUserData(); // ✅ Ahora también carga el usuario
  
  if (storedToken && storedUser) {
    // ✅ Restaurar sesión completa desde localStorage
    setToken(storedToken);
    setUser(storedUser);
  } else if (storedToken && !storedUser) {
    // ✅ Manejo de sesión inconsistente (token sin usuario)
    // Limpiar token inválido para evitar estados inconsistentes
    setAuthToken(null);
  }
  
  setIsLoading(false);
}, []);
```

**Mejoras**:
- ✅ Restaura tanto token como usuario
- ✅ Maneja casos edge (token sin usuario)
- ✅ Limpia sesiones inconsistentes

#### 3. Modificación de la Función login

```typescript
const login = useCallback(async (email: string, password: string) => {
  // ... código de autenticación ...
  
  // ✅ Guardar en estado React
  setToken(authToken);
  setUser(userData);

  // ✅ Persistir en localStorage (ANTES solo se guardaba el token)
  setAuthToken(authToken);
  setUserData(userData); // ✅ NUEVO: Guardar usuario en localStorage
}, [router]);
```

#### 4. Modificación de la Función logout

```typescript
const logout = useCallback(() => {
  setToken(null);
  setUser(null);
  setAuthToken(null);
  setUserData(null); // ✅ NUEVO: Limpiar usuario de localStorage
  router.push('/login');
}, [router]);
```

---

## 🎯 Resultado

### Flujo Corregido

```
1. Usuario hace login
   ├─ Token guardado en localStorage ✅
   ├─ User guardado en localStorage ✅
   ├─ Token guardado en estado React ✅
   ├─ User guardado en estado React ✅
   └─ Navbar muestra nombre y menú ✅

2. Usuario recarga página (F5)
   ├─ React se reinicia (estado se pierde)
   ├─ useEffect ejecuta:
   │  ├─ Carga token desde localStorage ✅
   │  └─ Carga user desde localStorage ✅
   ├─ Estado resultante:
   │  ├─ token: "abc123" ✅
   │  └─ user: { id, email, nombre, rol } ✅
   └─ Navbar:
      ├─ isAuthenticated = true ✅
      ├─ user = { ... } ✅
      ├─ Muestra nombre ✅
      └─ filteredMenuItems = [items filtrados] ✅
```

### Beneficios

1. **Persistencia de sesión**: Los datos del usuario persisten entre recargas
2. **Consistencia**: Token y usuario siempre están sincronizados
3. **Manejo de errores**: Limpia sesiones inconsistentes automáticamente
4. **UX mejorada**: El usuario no necesita volver a hacer login constantemente

---

## 📚 Conceptos Técnicos Aplicados

### 1. Persistencia de Estado en React

**Problema**: El estado de React se pierde al recargar la página.

**Solución**: Usar `localStorage` para persistir datos críticos.

**Cuándo usar**:
- ✅ Datos de autenticación (token, usuario)
- ✅ Preferencias del usuario
- ❌ NO usar para datos sensibles (mejor usar cookies httpOnly)
- ❌ NO usar para datos grandes (límite ~5-10MB)

### 2. Sincronización Estado ↔ Persistencia

**Patrón aplicado**:
```typescript
// Al guardar
setState(data);        // Estado React
persistData(data);    // localStorage

// Al cargar
const persisted = loadPersistedData(); // localStorage
if (persisted) {
  setState(persisted); // Estado React
}
```

### 3. Manejo de SSR (Server-Side Rendering)

**Problema**: `localStorage` no existe en el servidor (Next.js).

**Solución**: Verificar `typeof window !== 'undefined'` antes de usar.

```typescript
function getUserData(): User | null {
  if (typeof window === 'undefined') return null; // ✅ SSR-safe
  // ... resto del código
}
```

### 4. Validación y Manejo de Errores

**Problema**: Datos corruptos en localStorage pueden romper la app.

**Solución**: Try-catch al parsear JSON.

```typescript
try {
  return JSON.parse(storedUser) as User;
} catch {
  return null; // ✅ Fallback seguro
}
```

---

## 🎤 Respuestas para Entrevistas

### Pregunta: "Cuéntame sobre un bug complejo que resolviste"

**Respuesta estructurada**:

> "En un proyecto con Next.js y React, implementé un sistema de autenticación usando Context API. El problema era que al recargar la página, el navbar desaparecía aunque el usuario seguía autenticado.
>
> **Diagnóstico**: Analicé el flujo de datos y descubrí que solo se estaba persistiendo el token JWT en localStorage, pero no los datos del usuario. Al recargar, React resetea todo el estado, entonces el token existía pero el objeto `user` era `null`, causando que el navbar no pudiera mostrar el nombre ni filtrar el menú por rol.
>
> **Solución**: Implementé funciones helper para persistir y restaurar los datos del usuario en localStorage, sincronizándolos con el estado de React. También agregué validación para manejar sesiones inconsistentes (token sin usuario).
>
> **Resultado**: La sesión ahora persiste correctamente entre recargas, mejorando significativamente la experiencia del usuario."

### Pregunta: "¿Cómo manejas la persistencia de estado en React?"

**Respuesta**:

> "Depende del tipo de estado:
>
> - **Estado local**: `useState` es suficiente
> - **Estado global de UI**: Context API o Zustand
> - **Estado que debe persistir**: Combinar estado React + localStorage/cookies
> - **Datos del servidor**: React Query con caché
>
> En este caso, usé localStorage para datos de autenticación porque:
> 1. Son datos necesarios inmediatamente al cargar la app
> 2. No son extremadamente sensibles (el token JWT ya está en localStorage)
> 3. Mejoran la UX al evitar re-autenticaciones constantes
>
> **Consideraciones importantes**:
> - Verificar `typeof window` para SSR
> - Validar datos al parsear JSON
> - Limpiar datos inconsistentes
> - No guardar datos sensibles (mejor cookies httpOnly)"

### Pregunta: "¿Cómo debuggeas problemas de estado en React?"

**Respuesta**:

> "Sigo un proceso sistemático:
>
> 1. **Reproducir el bug**: Identificar pasos exactos (login → recargar → bug)
> 2. **Trazar el flujo de datos**: Usar React DevTools para ver el estado
> 3. **Verificar persistencia**: Revisar localStorage en DevTools
> 4. **Analizar dependencias**: Revisar useEffect y sus dependencias
> 5. **Probar hipótesis**: Hacer cambios incrementales y probar
>
> En este caso, usé:
> - React DevTools para ver el estado del contexto
> - Chrome DevTools → Application → Local Storage
> - Console.log estratégicos para rastrear el flujo
> - Análisis del código del navbar para entender qué datos necesitaba"

---

## 🔄 Alternativas Consideradas

### Opción 1: Validar Token con Backend (Rechazada)

**Idea**: Hacer una petición al backend para validar el token y obtener los datos del usuario.

**Pros**:
- ✅ Datos siempre actualizados
- ✅ Valida que el token sigue siendo válido

**Contras**:
- ❌ Requiere petición HTTP en cada carga
- ❌ Más lento (latencia de red)
- ❌ Más complejo (manejo de errores, loading states)
- ❌ Requiere endpoint adicional en backend

**Decisión**: Rechazada porque los datos del usuario no cambian frecuentemente y la mejora de UX (carga instantánea) es más importante.

### Opción 2: Usar Cookies en lugar de localStorage (Rechazada)

**Idea**: Guardar datos del usuario en cookies httpOnly.

**Pros**:
- ✅ Más seguro (no accesible desde JavaScript)
- ✅ Se envía automáticamente en requests

**Contras**:
- ❌ Límite de tamaño (4KB)
- ❌ Más complejo de implementar
- ❌ Requiere configuración en backend

**Decisión**: Rechazada porque localStorage es más simple para este caso y los datos no son extremadamente sensibles.

### Opción 3: Usar Zustand con Persist Middleware (Considerada)

**Idea**: Migrar de Context API a Zustand con persistencia automática.

**Pros**:
- ✅ Persistencia automática
- ✅ Menos código boilerplate

**Contras**:
- ❌ Cambio arquitectónico grande
- ❌ Requiere migrar todo el código existente
- ❌ Overkill para este problema específico

**Decisión**: Considerada pero no implementada porque la solución actual es suficiente y no justifica el refactor.

---

## 📝 Lecciones Aprendidas

1. **Siempre persistir datos críticos**: Si un dato es necesario para renderizar la UI, debe persistirse.

2. **Sincronizar estado y persistencia**: No basta con guardar, también hay que restaurar.

3. **Manejar casos edge**: Sesiones inconsistentes (token sin usuario) deben limpiarse.

4. **Pensar en SSR**: Verificar `typeof window` antes de usar APIs del navegador.

5. **Validar datos parseados**: Siempre usar try-catch al parsear JSON desde localStorage.

---

## 🔗 Referencias

- [React Context API Documentation](https://react.dev/reference/react/useContext)
- [localStorage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React State Management Best Practices](https://react.dev/learn/choosing-the-state-structure)

---

## 📅 Información del Caso

- **Fecha**: 2024
- **Proyecto**: Academia Multi-Centro (Frontend)
- **Tecnologías**: React, Next.js, TypeScript, Material-UI
- **Severidad**: Alta (afecta UX crítica)
- **Tiempo de resolución**: ~2 horas (diagnóstico + implementación + testing)

---

**Autor**: Equipo de Desarrollo  
**Versión**: 1.0  
**Última actualización**: 2024

