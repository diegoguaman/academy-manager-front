'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

/**
 * Tema de Material UI
 * Puedes personalizar colores, tipografía, etc. aquí
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Crear cache de Emotion una sola vez (singleton pattern)
 * Esto previene errores de hidratación al asegurar que el mismo cache
 * se use entre servidor y cliente
 */
function createEmotionCache() {
  return createCache({
    key: 'mui',
    prepend: true,
  });
}

// Cache singleton para evitar recrear en cada render
const clientSideEmotionCache = createEmotionCache();

/**
 * Provider de Material UI configurado para SSR
 * Necesario para evitar errores de hidratación
 * 
 * Incluye:
 * - CacheProvider: Asegura cache consistente entre SSR y cliente
 * - ThemeProvider: Proporciona tema a todos los componentes
 * - CssBaseline: Normaliza estilos base
 */
export function MaterialUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
