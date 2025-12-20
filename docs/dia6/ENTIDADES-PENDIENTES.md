# 📋 Entidades Pendientes y Queries Complejas

Este documento lista todas las entidades que faltan implementar y las queries complejas recomendadas para aprovechar GraphQL.

---

## 🎯 Entidades que Faltan Implementar

Basado en el schema GraphQL, estas son las entidades que necesitan CRUD completo:

### ✅ Ya Implementadas
- [x] **Cursos** - CRUD básico (falta update/delete)
- [x] **Alumnos** - Ver guía completa en `GUIA-IMPLEMENTACION-ALUMNO.md`

### ⏳ Pendientes de Implementar

#### 1. **Convocatorias** (Prioridad: ALTA)
**Razón**: Relación central con Cursos, Alumnos y Matrículas

**Campos principales**:
- `idConvocatoria`, `codigo`, `fechaInicio`, `fechaFin`, `activo`
- Relaciones: `curso`, `profesor`, `centro`, `matriculas`

**Complejidad**: Media-Alta
- Validación de fechas (fechaInicio < fechaFin)
- Relación con múltiples entidades
- Código único generado automáticamente

**Queries recomendadas**:
```graphql
# Obtener convocatorias con relaciones completas
query GetConvocatoriasCompletas($activo: Boolean) {
  convocatorias(activo: $activo) {
    idConvocatoria
    codigo
    fechaInicio
    fechaFin
    activo
    curso {
      idCurso
      nombre
      precioBase
    }
    profesor {
      idUsuario
      email
      datosPersonales {
        nombre
        apellidos
      }
    }
    centro {
      idCentro
      nombre
      empresa {
        nombreLegal
      }
    }
    matriculas {
      idMatricula
      codigo
      estadoPago
    }
  }
}
```

---

#### 2. **Matrículas** (Prioridad: ALTA)
**Razón**: Entidad de negocio principal, relaciona Alumnos con Convocatorias

**Campos principales**:
- `idMatricula`, `codigo`, `fechaMatricula`, `precioBruto`, `descuentoAplicado`, `precioFinal`, `estadoPago`
- Relaciones: `convocatoria`, `alumno`, `entidadSubvencionadora`, `calificaciones`, `facturas`

**Complejidad**: Alta
- Cálculos de precios (precioBruto, descuento, subvención, precioFinal)
- Estados de pago (PENDIENTE, PAGADO, CANCELADO)
- Relaciones complejas con múltiples entidades

**Queries recomendadas**:
```graphql
# Obtener matrículas con todas las relaciones
query GetMatriculasCompletas($estadoPago: EstadoPago, $idAlumno: ID) {
  matriculas(estadoPago: $estadoPago, idAlumno: $idAlumno) {
    idMatricula
    codigo
    fechaMatricula
    precioBruto
    descuentoAplicado
    motivoDescuento
    importeSubvencionado
    precioFinal
    estadoPago
    convocatoria {
      idConvocatoria
      codigo
      fechaInicio
      fechaFin
      curso {
        nombre
        precioBase
      }
    }
    alumno {
      idUsuario
      email
      datosPersonales {
        nombre
        apellidos
      }
    }
    entidadSubvencionadora {
      nombre
    }
    calificaciones {
      nota
      fechaCalificacion
      materia {
        nombre
      }
    }
    facturas {
      numeroFactura
      fechaEmision
      importeTotal
      estado
    }
  }
}
```

---

#### 3. **Centros** (Prioridad: MEDIA)
**Razón**: Necesarios para Convocatorias

**Campos principales**:
- `idCentro`, `codigoCentro`, `nombre`, `capacidadMaxima`, `activo`
- Relaciones: `empresa`, `comunidad`

**Complejidad**: Media
- Relación con Empresa y Comunidad
- Validación de capacidad máxima

**Queries recomendadas**:
```graphql
query GetCentrosCompletos($activo: Boolean) {
  centros(activo: $activo) {
    idCentro
    codigoCentro
    nombre
    capacidadMaxima
    activo
    empresa {
      idEmpresa
      nombreLegal
      cif
    }
    comunidad {
      codigo
      nombre
      capital
    }
  }
}
```

---

#### 4. **Empresas** (Prioridad: MEDIA)
**Razón**: Relación con Centros

**Campos principales**:
- `idEmpresa`, `cif`, `nombreLegal`, `direccionFiscal`, `activo`

**Complejidad**: Baja
- CRUD simple
- Validación de CIF

---

#### 5. **Materias** (Prioridad: MEDIA)
**Razón**: Relación con Cursos

**Campos principales**:
- `idMateria`, `nombre`, `descripcion`, `activo`

**Complejidad**: Baja
- CRUD simple

**Nota**: Ya existe query `getMaterias` en `curso-service.ts`, solo falta CRUD completo.

---

#### 6. **Formatos** (Prioridad: MEDIA)
**Razón**: Relación con Cursos

**Campos principales**:
- `idFormato`, `nombre`, `descripcion`, `activo`

**Complejidad**: Baja
- CRUD simple

**Nota**: Ya existe query `getFormatos` en `curso-service.ts`, solo falta CRUD completo.

---

#### 7. **Profesores** (Prioridad: MEDIA)
**Razón**: Necesarios para Convocatorias

**Complejidad**: Baja
- Similar a Alumnos, pero con `rol: PROFESOR`
- Reutilizar estructura de Alumnos

---

#### 8. **Usuarios Administrativos** (Prioridad: BAJA)
**Razón**: Gestión de usuarios del sistema

**Complejidad**: Baja
- Similar a Alumnos, pero con `rol: ADMINISTRATIVO`

---

## 🔍 Queries Complejas Recomendadas

Estas queries aprovechan el poder de GraphQL para obtener datos relacionados en una sola petición:

### 1. Dashboard de Alumno
**Propósito**: Mostrar toda la información relevante de un alumno

```graphql
query GetDashboardAlumno($idAlumno: ID!) {
  usuario(id: $idAlumno) {
    idUsuario
    email
    datosPersonales {
      nombre
      apellidos
      dni
      telefono
    }
  }
  matriculas(idAlumno: $idAlumno) {
    idMatricula
    codigo
    fechaMatricula
    precioFinal
    estadoPago
    convocatoria {
      codigo
      fechaInicio
      fechaFin
      curso {
        nombre
        materia {
          nombre
        }
      }
      profesor {
        datosPersonales {
          nombre
          apellidos
        }
      }
    }
    calificaciones {
      nota
      materia {
        nombre
      }
      fechaCalificacion
    }
  }
}
```

**Uso**: Página de perfil del alumno con todas sus matrículas y calificaciones.

---

### 2. Dashboard de Convocatoria
**Propósito**: Vista completa de una convocatoria con estadísticas

```graphql
query GetDashboardConvocatoria($idConvocatoria: ID!) {
  convocatoria(id: $idConvocatoria) {
    idConvocatoria
    codigo
    fechaInicio
    fechaFin
    activo
    curso {
      nombre
      precioBase
      duracionHoras
      materia {
        nombre
      }
      formato {
        nombre
      }
    }
    profesor {
      datosPersonales {
        nombre
        apellidos
      }
      email
    }
    centro {
      nombre
      capacidadMaxima
      empresa {
        nombreLegal
      }
    }
    matriculas {
      idMatricula
      codigo
      estadoPago
      precioFinal
      alumno {
        datosPersonales {
          nombre
          apellidos
        }
        email
      }
    }
  }
}
```

**Uso**: Página de detalle de convocatoria con lista de alumnos matriculados.

---

### 3. Estadísticas de Centro
**Propósito**: Métricas de un centro educativo

```graphql
query GetEstadisticasCentro($idCentro: ID!) {
  centro(id: $idCentro) {
    idCentro
    nombre
    capacidadMaxima
    empresa {
      nombreLegal
    }
  }
  convocatorias(idCentro: $idCentro, activo: true) {
    idConvocatoria
    codigo
    curso {
      nombre
    }
    matriculas {
      idMatricula
      estadoPago
      precioFinal
    }
  }
}
```

**Uso**: Dashboard administrativo con métricas de ocupación y facturación.

---

### 4. Reporte de Facturación
**Propósito**: Análisis financiero de matrículas

```graphql
query GetReporteFacturacion($fechaInicio: DateTime!, $fechaFin: DateTime!) {
  matriculas {
    idMatricula
    codigo
    fechaMatricula
    precioBruto
    descuentoAplicado
    importeSubvencionado
    precioFinal
    estadoPago
    facturas {
      numeroFactura
      fechaEmision
      importeTotal
      estado
    }
    convocatoria {
      curso {
        nombre
      }
    }
    alumno {
      datosPersonales {
        nombre
        apellidos
      }
    }
  }
}
```

**Uso**: Reporte financiero con filtros por fecha.

---

### 5. Calificaciones por Materia
**Propósito**: Análisis académico

```graphql
query GetCalificacionesPorMateria($idMateria: ID!) {
  materia(id: $idMateria) {
    idMateria
    nombre
  }
  matriculas {
    calificaciones {
      nota
      fechaCalificacion
      observaciones
      materia {
        idMateria
        nombre
      }
      matricula {
        alumno {
          datosPersonales {
            nombre
            apellidos
          }
        }
        convocatoria {
          codigo
        }
      }
    }
  }
}
```

**Uso**: Vista de calificaciones agrupadas por materia.

---

## 📊 Priorización de Implementación

### Fase 1 (Crítico - Semana 1)
1. ✅ Cursos (completar update/delete)
2. ✅ Alumnos (CRUD completo)
3. ⏳ Convocatorias (CRUD completo)
4. ⏳ Matrículas (CRUD completo)

### Fase 2 (Importante - Semana 2)
5. ⏳ Centros (CRUD completo)
6. ⏳ Materias (completar CRUD)
7. ⏳ Formatos (completar CRUD)
8. ⏳ Profesores (CRUD completo)

### Fase 3 (Opcional - Semana 3)
9. ⏳ Empresas (CRUD completo)
10. ⏳ Usuarios Administrativos (CRUD completo)
11. ⏳ Queries complejas (dashboards y reportes)

---

## 🎯 Recomendaciones

1. **Reutilizar código**: Usar la guía de Alumno como template
2. **Implementar queries complejas gradualmente**: Empezar con CRUD básico, luego agregar queries complejas
3. **Testing**: Probar cada query en GraphiQL antes de implementar
4. **Documentación**: Documentar queries complejas con ejemplos de uso

---

## 📝 Notas Importantes

- **Calificaciones y Facturas**: Son entidades relacionadas que probablemente se crean automáticamente, no necesitan CRUD independiente
- **EntidadSubvencionadora**: Verificar si necesita CRUD o solo se referencia
- **Comunidad**: Verificar si necesita CRUD o solo se referencia

