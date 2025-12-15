# 🚀 Post LinkedIn: Resolviendo Errores GraphQL Complejos

## Versión Corta para LinkedIn (300-400 palabras)

---

### Post 1: Aprendizaje sobre GraphQL

**🔧 Resolviendo errores GraphQL: Schema vs Realidad del Backend**

Recientemente enfrenté **4 errores complejos de GraphQL** al implementar un CRUD de cursos. Cada error enseñó algo valioso sobre cómo trabajar con APIs GraphQL en producción.

**El problema principal:**
Inconsistencias entre el **schema GraphQL declarado** y el **comportamiento real del backend**. El schema decía que ciertos campos eran "no-nullables" (`Materia!`, `Formato!`), pero el backend devolvía `null` para estos campos.

**Errores enfrentados:**
1. ❌ `NullValueInNonNullableField` - Campos declarados como requeridos devolviendo null
2. ❌ `FORBIDDEN` - Problemas de autenticación/autorización
3. ❌ Mutations devolviendo menos campos que las queries
4. ❌ Validación estricta de GraphQL rechazando respuestas válidas

**Soluciones implementadas:**
✅ **Queries defensivas**: Solicitar solo campos que el backend puede garantizar
✅ **Tipos específicos**: `CursoCreated` vs `Curso` para diferentes respuestas
✅ **Cliente SSR-safe**: Manejo correcto de tokens en Server-Side Rendering
✅ **Error handling robusto**: Mensajes específicos basados en `error.extensions.classification`

**Aprendizajes clave:**
1. GraphQL es estricto con el schema - los campos `!` NO pueden ser null
2. Mutations pueden devolver menos campos que queries
3. TypeScript debe reflejar la realidad del sistema, no el schema ideal
4. A veces debemos ser pragmáticos y trabajar alrededor de limitaciones del backend

**Resultado:** App funcionando sin errores, manejo de errores mejorado, y código más robusto.

¿Has enfrentado inconsistencias entre schema y backend? ¿Cómo las resolviste?

#GraphQL #TypeScript #React #WebDevelopment #BackendIntegration #ErrorHandling

---

## Versión Extendida (800-1000 palabras)

### Post 2: Historia Completa con Detalles Técnicos

**🎯 De Schema a Realidad: Resolviendo Inconsistencias GraphQL en Producción**

Como desarrollador frontend, a veces enfrentamos situaciones donde el **schema GraphQL ideal** no coincide con la **realidad del backend**. Comparto mi experiencia resolviendo 4 errores complejos que me enseñaron mucho sobre trabajar con GraphQL en producción.

**El Contexto:**
Estaba implementando un CRUD completo de cursos usando GraphQL. El backend proporcionaba un schema que declaraba todos los campos necesarios, pero en la práctica, el comportamiento era diferente.

**Error 1: Campos Null en Formato**
El primer error apareció al cargar formatos para un select:
```
NullValueInNonNullableField: activo was declared as Boolean! but returned null
```
**Investigación:** El schema decía `activo: Boolean!`, pero algunos registros tenían null.
**Solución:** Eliminé el campo de la query (no era crítico) y proporcioné un valor por defecto en el servicio.

**Error 2: Forbidden en Mutations**
Al intentar crear un curso, recibía:
```
Forbidden - The field at path '/createCurso'
```
**Investigación:** El token JWT no se estaba enviando correctamente debido a problemas de SSR.
**Solución:** Implementé un cliente GraphQL SSR-safe que verifica `typeof window` antes de acceder a `localStorage`, y mejoré el manejo de errores para detectar específicamente errores `FORBIDDEN`.

**Error 3: Campos Faltantes en Mutations**
La mutation `createCurso` solicitaba relaciones que el backend no devolvía:
```
NullValueInNonNullableField: materia and formato not returned
```
**Investigación:** Las mutations devuelven menos campos que las queries.
**Solución:** Creé un tipo `CursoCreated` específico para respuestas de creación, eliminando campos de relaciones de la mutation.

**Error 4: La Inconsistencia Fundamental**
El error más crítico: el schema declaraba `materia: Materia!` y `formato: Formato!` (no-nullables), pero el backend devolvía null para múltiples cursos.
**Solución:** Implementé queries defensivas que no solicitan estos campos donde no son críticos, y actualicé los tipos TypeScript para reflejar que son opcionales.

**Lecciones Aprendidas:**

1. **GraphQL Schema Validation es Estricta**
   - Los campos con `!` NO pueden ser null
   - GraphQL valida cada respuesta contra el schema
   - Errores son claros y específicos

2. **Backend-Frontend Desincronización**
   - Inconsistencias entre schema y realidad son comunes
   - Debemos ser pragmáticos y trabajar alrededor
   - Documentar bugs del backend para corrección futura

3. **Type Safety como Documentación**
   - TypeScript debe reflejar la realidad, no el ideal
   - Crear tipos específicos para diferentes casos de uso
   - Tipos opcionales cuando el backend no garantiza valores

4. **Error Handling Robusto**
   - Manejar errores específicos de GraphQL
   - Usar `error.extensions.classification` para detectar tipos
   - Mostrar mensajes útiles al usuario

**Resultado:**
✅ Aplicación funcionando sin errores
✅ Manejo de errores mejorado y específico
✅ Código más robusto y mantenible
✅ Mejor experiencia de usuario

**¿Has enfrentado inconsistencias similares? ¿Cómo las manejaste?**

#GraphQL #TypeScript #React #NextJS #WebDevelopment #BackendIntegration #ErrorHandling #FullStackDevelopment

---

## Thread para Twitter/X

### Thread: Resolviendo Errores GraphQL

🧵 Thread: Cómo resolví 4 errores complejos de GraphQL trabajando con inconsistencias entre schema y backend

1/12 🐛 **El Problema:**
Implementando CRUD con GraphQL, el schema declaraba campos como "no-nullables" pero el backend devolvía null. GraphQL rechazaba las respuestas.

2/12 🔍 **Error 1: NullValueInNonNullableField**
Schema: `activo: Boolean!`
Backend: devuelve `null`
Resultado: ❌ Error de validación

Solución: Eliminar campo de query si no es crítico + valor por defecto.

3/12 🔒 **Error 2: FORBIDDEN**
Token JWT no se enviaba correctamente en SSR.
`localStorage` no disponible en servidor.

Solución: Cliente SSR-safe con `typeof window` check.

4/12 🔄 **Error 3: Mutations vs Queries**
Mutation `createCurso` solicitaba relaciones que no devolvía.
Schema decía `materia: Materia!` pero mutation no la retornaba.

5/12 💡 **Solución Error 3:**
Crear tipo específico para respuestas de creación:
```typescript
interface CursoCreated {
  idCurso: string;
  nombre: string;
  // Sin relaciones
}
```

6/12 🎯 **Error 4: La Inconsistencia Fundamental**
Schema: `materia: Materia!`, `formato: Formato!`
Backend: devuelve null para múltiples registros
GraphQL: rechaza toda la respuesta

7/12 ✅ **Solución Error 4:**
Queries defensivas - no solicitar campos problemáticos:
```graphql
query GetCursos {
  cursos {
    idCurso
    nombre
    # materia y formato eliminados
  }
}
```

8/12 📚 **Aprendizajes Clave:**
1. GraphQL valida estrictamente contra schema
2. Mutations pueden devolver menos campos que queries
3. TypeScript debe reflejar realidad, no ideal
4. Ser pragmático cuando no controlamos todas las capas

9/12 🛠️ **Mejores Prácticas:**
- Queries "light" para listas
- Tipos específicos para diferentes casos
- Error handling con `extensions.classification`
- Documentar bugs del backend

10/12 📊 **Resultado:**
✅ 0 errores GraphQL en producción
✅ Manejo de errores específico
✅ Tipos que reflejan realidad
✅ UX mejorada

11/12 💭 **Reflexión:**
Como frontend, a veces debemos trabajar alrededor de limitaciones del backend. La clave es ser pragmático sin comprometer calidad del código.

12/12 🎓 **Conclusión:**
GraphQL es poderoso pero estricto. Entender la diferencia entre schema ideal y realidad del backend es crucial para desarrollar aplicaciones robustas.

¿Has enfrentado inconsistencias similares? ¿Cómo las resolviste?

#GraphQL #TypeScript #React #WebDevelopment

---

## Versión Técnica Profunda (para dev.to o Medium)

### Artículo: "GraphQL Schema Validation: Cuando la Realidad No Coincide con el Schema"

**Meta Description:** Aprende cómo resolver errores de GraphQL cuando el backend devuelve valores null para campos declarados como no-nullables. Guía completa con ejemplos reales.

**Title:** GraphQL Schema Validation: Working Around Backend Inconsistencies

---

### Introduction

GraphQL's strict schema validation is one of its greatest strengths—it catches errors early and provides clear feedback. However, when the backend implementation doesn't match the declared schema, this strictness becomes a challenge.

In this article, I'll walk through 4 real-world GraphQL errors I encountered and how I solved them, focusing on the gap between schema declarations and backend reality.

### Understanding GraphQL Nullability

In GraphQL, fields can be:
- **Nullable**: `materia: Materia` - can be null
- **Non-nullable**: `materia: Materia!` - cannot be null

When a field is marked with `!`, GraphQL will reject any response containing `null` for that field, even if the backend sends it.

### Error 1: Null Values in Non-Nullable Fields

**The Error:**
```json
{
  "errors": [{
    "message": "The field at path '/formatos[0]/activo' was declared as a non null type, but the code involved in retrieving data has wrongly returned a null value.",
    "extensions": {
      "classification": "NullValueInNonNullableField"
    }
  }]
}
```

**Analysis:**
The schema declared `activo: Boolean!`, but the backend returned `null` for some records. This could be due to:
- Legacy data in the database
- Backend bug
- Missing validation

**Solution:**
Since `activo` wasn't critical for the UI (just a select dropdown), we removed it from the query:

```graphql
# Before
query GetFormatos {
  formatos {
    idFormato
    nombre
    activo  # ❌ Causes error
  }
}

# After
query GetFormatos {
  formatos {
    idFormato
    nombre
    # activo removed
  }
}
```

**Key Learning:** Sometimes the pragmatic solution is to not request fields that aren't essential.

### Error 2: Authentication Issues

**The Error:**
```json
{
  "errors": [{
    "message": "Forbidden",
    "extensions": {
      "classification": "FORBIDDEN"
    }
  }]
}
```

**Analysis:**
The JWT token wasn't being sent correctly. The GraphQL client tried to access `localStorage` during SSR, where it's not available.

**Solution:**
Implemented an SSR-safe token getter:

```typescript
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // SSR-safe
  }
  return localStorage.getItem('token');
}

export const graphqlClient = new GraphQLClient(env.graphqlUrl, {
  headers: () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
});
```

**Key Learning:** Always check for `window` availability when accessing browser APIs in Next.js.

### Error 3: Mutations Returning Incomplete Data

**The Error:**
Mutations requested relationships that weren't returned:
```graphql
mutation CreateCurso($input: CursoInput!) {
  createCurso(input: $input) {
    materia { idMateria nombre }  # ❌ Not returned
    formato { idFormato nombre }  # ❌ Not returned
  }
}
```

**Solution:**
Created specific types for mutation responses:

```typescript
// Type for creation response (without relations)
export interface CursoCreated {
  idCurso: string;
  nombre: string;
  precioBase: number;
  activo: boolean;
}

// Full type for queries (with relations)
export interface Curso {
  idCurso: string;
  nombre: string;
  materia: { idMateria: string; nombre: string };
  formato: { idFormato: string; nombre: string };
}
```

**Key Learning:** Mutations and queries can return different shapes. Use specific types for each.

### Error 4: The Fundamental Inconsistency

**The Problem:**
The schema declared relationships as required:
```graphql
type Curso {
  materia: Materia!    # Required
  formato: Formato!    # Required
}
```

But the backend returned `null` for these fields in many cases.

**The Challenge:**
- Can't change the schema (backend-defined)
- Can't change the backend (separate team)
- Need the app to work now

**The Solution:**
Defensive query design - only request fields the backend can guarantee:

```typescript
// Defensive query
const GET_CURSOS_QUERY = `
  query GetCursos($activo: Boolean) {
    cursos(activo: $activo) {
      idCurso
      nombre
      precioBase
      activo
      # materia and formato removed
    }
  }
`;

// Type reflects reality
export interface Curso {
  idCurso: string;
  nombre: string;
  precioBase: number;
  activo: boolean;
  materia?: {  // Optional because backend doesn't guarantee it
    idMateria: string;
    nombre: string;
  };
  formato?: {  // Optional because backend doesn't guarantee it
    idFormato: string;
    nombre: string;
  };
}
```

**Key Learning:** TypeScript types should reflect system reality, not the ideal schema.

### Best Practices

1. **Validate Schema with Backend**
   - Test queries in GraphQL Playground before implementing
   - Verify which fields are actually returned

2. **Defensive Query Design**
   - Request only essential fields
   - Use "light" queries for lists
   - Use "full" queries for details

3. **Specific Types for Specific Cases**
   ```typescript
   interface CursoList {}      // Minimal fields
   interface CursoDetail {}    // Full fields
   interface CursoCreated {}   // Creation response
   ```

4. **Robust Error Handling**
   ```typescript
   if (error.extensions?.classification === 'FORBIDDEN') {
     // Handle authorization
   } else if (error.extensions?.classification === 'NullValueInNonNullableField') {
     // Handle null values
   }
   ```

### Conclusion

Working with GraphQL requires understanding that the schema is an ideal, but the backend is reality. When they don't match, we must be pragmatic:

- Remove non-essential fields from queries
- Create types that reflect reality
- Implement defensive query patterns
- Handle errors gracefully

The goal isn't perfect code, but working code that gracefully handles inconsistencies.

**What inconsistencies have you faced with GraphQL? How did you solve them?**

---

## Tips para Publicar

### LinkedIn
- Publica versión corta o extendida
- Agrega hashtags: #GraphQL #TypeScript #React #WebDevelopment
- Responde comentarios rápidamente
- Comparte aprendizaje específico

### Twitter/X
- Usa el thread de 12 tweets
- Incluye ejemplos de código cortos
- Usa emojis para hacer más visual
- Interactúa con desarrolladores que comenten

### Dev.to / Medium
- Publica versión técnica profunda
- Agrega diagramas si es posible
- Incluye ejemplos de código completos
- Categoriza correctamente (GraphQL, TypeScript, React)

---

**Notas finales:**
- Personaliza el tono según plataforma
- Enfócate en aprendizajes, no solo en errores
- Muestra progreso técnico y crecimiento
- Comparte conocimiento, no solo código

