# 📱 Utilidades Responsive

Este documento explica cómo crear utilidades y componentes reutilizables para diseño responsive, evitando repetir código de media queries.

---

## 🎯 Objetivo

Crear:
- ✅ Hook `useResponsive` para detectar breakpoints
- ✅ Componente `ResponsiveContainer` para layouts adaptativos
- ✅ Utilidades para mostrar/ocultar elementos según tamaño
- ✅ Helpers para valores responsive

---

## 📁 Estructura de Archivos

```
src/shared/hooks/
  └── use-responsive.ts        # Hook principal

src/shared/components/
  └── responsive/
      ├── responsive-container.tsx
      ├── responsive-grid.tsx
      └── responsive-show.tsx
```

---

## 🔧 Paso 1: Crear Hook useResponsive

**Archivo**: `src/shared/hooks/use-responsive.ts`

```typescript
'use client';

import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Breakpoints de Material UI
 * xs: 0px
 * sm: 600px
 * md: 900px
 * lg: 1200px
 * xl: 1536px
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Hook para detectar breakpoints y estado responsive
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * return <DesktopView />;
 * ```
 */
export function useResponsive() {
  const theme = useTheme();

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isTabletOrDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Determinar breakpoint actual
  const getBreakpoint = (): Breakpoint => {
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
  };

  return {
    // Breakpoints específicos
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Agrupaciones comunes
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isTabletOrDesktop,
    
    // Breakpoint actual
    breakpoint: getBreakpoint(),
    
    // Helpers para comparaciones
    isUp: (bp: Breakpoint) => useMediaQuery(theme.breakpoints.up(bp)),
    isDown: (bp: Breakpoint) => useMediaQuery(theme.breakpoints.down(bp)),
    isBetween: (start: Breakpoint, end: Breakpoint) =>
      useMediaQuery(theme.breakpoints.between(start, end)),
  };
}

/**
 * Hook simplificado para casos comunes
 * 
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * ```
 */
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}

export function useIsTablet() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between('md', 'lg'));
}

export function useIsDesktop() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('lg'));
}
```

---

## 🎨 Paso 2: Crear Componente ResponsiveContainer

**Archivo**: `src/shared/components/responsive/responsive-container.tsx`

```typescript
'use client';

import { Container, ContainerProps } from '@mui/material';
import { useResponsive } from '@/shared/hooks/use-responsive';

interface ResponsiveContainerProps extends ContainerProps {
  /**
   * Padding horizontal en móvil (default: 2)
   */
  mobilePadding?: number;
  /**
   * Padding horizontal en desktop (default: 3)
   */
  desktopPadding?: number;
}

/**
 * Container responsive que ajusta padding según el tamaño de pantalla
 * 
 * @example
 * ```tsx
 * <ResponsiveContainer>
 *   <Typography>Contenido</Typography>
 * </ResponsiveContainer>
 * ```
 */
export function ResponsiveContainer({
  children,
  mobilePadding = 2,
  desktopPadding = 3,
  sx,
  ...props
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();

  return (
    <Container
      {...props}
      sx={{
        px: { xs: mobilePadding, md: desktopPadding },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
```

---

## 📐 Paso 3: Crear Componente ResponsiveGrid

**Archivo**: `src/shared/components/responsive/responsive-grid.tsx`

```typescript
'use client';

import { Grid, GridProps } from '@mui/material';

interface ResponsiveGridProps extends GridProps {
  /**
   * Columnas en móvil (default: 1)
   */
  mobileColumns?: number;
  /**
   * Columnas en tablet (default: 2)
   */
  tabletColumns?: number;
  /**
   * Columnas en desktop (default: 3)
   */
  desktopColumns?: number;
}

/**
 * Grid responsive que ajusta columnas según el tamaño de pantalla
 * 
 * @example
 * ```tsx
 * <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={4}>
 *   <Grid item>Item 1</Grid>
 *   <Grid item>Item 2</Grid>
 * </ResponsiveGrid>
 * ```
 */
export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  ...props
}: ResponsiveGridProps) {
  return (
    <Grid
      container
      spacing={2}
      {...props}
      sx={{
        ...props.sx,
      }}
    >
      {children}
    </Grid>
  );
}

/**
 * Grid item responsive
 */
export function ResponsiveGridItem({
  children,
  mobileColumns = 12,
  tabletColumns = 6,
  desktopColumns = 4,
  ...props
}: GridProps & {
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}) {
  return (
    <Grid
      item
      xs={mobileColumns}
      sm={tabletColumns}
      md={desktopColumns}
      {...props}
    >
      {children}
    </Grid>
  );
}
```

---

## 👁️ Paso 4: Crear Componente ResponsiveShow

**Archivo**: `src/shared/components/responsive/responsive-show.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useResponsive } from '@/shared/hooks/use-responsive';
import type { Breakpoint } from '@/shared/hooks/use-responsive';

interface ResponsiveShowProps {
  children: ReactNode;
  /**
   * Mostrar solo en móvil
   */
  mobileOnly?: boolean;
  /**
   * Mostrar solo en tablet
   */
  tabletOnly?: boolean;
  /**
   * Mostrar solo en desktop
   */
  desktopOnly?: boolean;
  /**
   * Mostrar desde este breakpoint hacia arriba
   */
  from?: Breakpoint;
  /**
   * Mostrar hasta este breakpoint
   */
  until?: Breakpoint;
  /**
   * Mostrar entre estos breakpoints
   */
  between?: [Breakpoint, Breakpoint];
}

/**
 * Componente que muestra/oculta contenido según el tamaño de pantalla
 * 
 * @example
 * ```tsx
 * <ResponsiveShow mobileOnly>
 *   <MobileMenu />
 * </ResponsiveShow>
 * 
 * <ResponsiveShow from="md">
 *   <DesktopMenu />
 * </ResponsiveShow>
 * ```
 */
export function ResponsiveShow({
  children,
  mobileOnly,
  tabletOnly,
  desktopOnly,
  from,
  until,
  between,
}: ResponsiveShowProps) {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isUp,
    isDown,
    isBetween,
  } = useResponsive();

  let shouldShow = true;

  if (mobileOnly) {
    shouldShow = isMobile;
  } else if (tabletOnly) {
    shouldShow = isTablet;
  } else if (desktopOnly) {
    shouldShow = isDesktop;
  } else if (from) {
    shouldShow = isUp(from);
  } else if (until) {
    shouldShow = isDown(until);
  } else if (between) {
    shouldShow = isBetween(between[0], between[1]);
  }

  if (!shouldShow) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🛠️ Paso 5: Crear Utilidades de Valores Responsive

**Archivo**: `src/shared/utils/responsive.ts`

```typescript
/**
 * Tipo para valores responsive
 * Permite definir valores diferentes según breakpoint
 */
export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

/**
 * Obtener valor responsive según breakpoint actual
 * 
 * @example
 * ```tsx
 * const spacing = getResponsiveValue('md', {
 *   xs: 1,
 *   md: 2,
 *   lg: 3,
 * }); // Retorna 2 si breakpoint es 'md'
 * ```
 */
export function getResponsiveValue<T>(
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  value: ResponsiveValue<T>
): T {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  // Buscar valor para el breakpoint actual o el más cercano hacia abajo
  const breakpoints: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpoints.indexOf(breakpoint);

  for (let i = currentIndex; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (value[bp] !== undefined) {
      return value[bp] as T;
    }
  }

  // Si no hay valor, retornar el primero disponible
  const firstValue = Object.values(value)[0];
  return firstValue as T;
}

/**
 * Helper para crear objetos de estilo responsive para Material UI
 * 
 * @example
 * ```tsx
 * const sx = responsive({
 *   fontSize: { xs: 14, md: 16, lg: 18 },
 *   padding: { xs: 1, md: 2 },
 * });
 * ```
 */
export function responsive<T extends Record<string, ResponsiveValue<unknown>>>(
  styles: T
): Record<string, unknown> {
  return styles as Record<string, unknown>;
}
```

---

## 📝 Paso 6: Exportar Todo

**Archivo**: `src/shared/components/responsive/index.ts`

```typescript
export { ResponsiveContainer } from './responsive-container';
export { ResponsiveGrid, ResponsiveGridItem } from './responsive-grid';
export { ResponsiveShow } from './responsive-show';
```

**Archivo**: `src/shared/hooks/index.ts` (o crear si no existe)

```typescript
export { useResponsive, useIsMobile, useIsTablet, useIsDesktop } from './use-responsive';
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Usar Hook en Componente

```typescript
'use client';

import { useResponsive } from '@/shared/hooks/use-responsive';
import { Button } from '@mui/material';

export function MyComponent() {
  const { isMobile, breakpoint } = useResponsive();

  return (
    <Button size={isMobile ? 'small' : 'medium'}>
      Click me ({breakpoint})
    </Button>
  );
}
```

### Ejemplo 2: Container Responsive

```typescript
import { ResponsiveContainer } from '@/shared/components/responsive';

export function MyPage() {
  return (
    <ResponsiveContainer>
      <Typography>Contenido</Typography>
    </ResponsiveContainer>
  );
}
```

### Ejemplo 3: Mostrar/Ocultar Según Tamaño

```typescript
import { ResponsiveShow } from '@/shared/components/responsive';

export function Navigation() {
  return (
    <>
      <ResponsiveShow mobileOnly>
        <MobileMenu />
      </ResponsiveShow>
      
      <ResponsiveShow from="md">
        <DesktopMenu />
      </ResponsiveShow>
    </>
  );
}
```

### Ejemplo 4: Grid Responsive

```typescript
import { ResponsiveGrid, ResponsiveGridItem } from '@/shared/components/responsive';

export function CardGrid() {
  return (
    <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={4}>
      <ResponsiveGridItem>
        <Card>Card 1</Card>
      </ResponsiveGridItem>
      <ResponsiveGridItem>
        <Card>Card 2</Card>
      </ResponsiveGridItem>
    </ResponsiveGrid>
  );
}
```

### Ejemplo 5: Valores Responsive

```typescript
import { useResponsive } from '@/shared/hooks/use-responsive';
import { getResponsiveValue } from '@/shared/utils/responsive';

export function MyComponent() {
  const { breakpoint } = useResponsive();
  
  const spacing = getResponsiveValue(breakpoint, {
    xs: 1,
    md: 2,
    lg: 3,
  });

  return <Box sx={{ p: spacing }}>Content</Box>;
}
```

---

## ✅ Checklist de Verificación

- [ ] Hook `useResponsive` funciona correctamente
- [ ] Componentes responsive se adaptan a diferentes tamaños
- [ ] No hay repetición de código de media queries
- [ ] Funciona en móvil, tablet y desktop
- [ ] TypeScript detecta errores correctamente

---

## 🎓 Aprendizajes Clave

1. **DRY (Don't Repeat Yourself)**: Centralizar lógica de responsive
2. **Hooks personalizados**: Reutilizar lógica entre componentes
3. **Componentes composables**: Crear componentes pequeños y reutilizables
4. **Type-Safety**: TypeScript para detectar errores

---

## 📚 Referencias

- [Material UI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [useMediaQuery Hook](https://mui.com/material-ui/react-use-media-query/)

