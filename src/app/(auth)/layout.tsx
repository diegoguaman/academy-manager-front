import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación - Academia Multi-Centro',
  description: 'Inicia sesión en Academia Multi-Centro',
};

/**
 * Layout para rutas de autenticación (login, register)
 * Este layout no incluye el sidebar ni elementos del dashboard
 * Las rutas dentro de (auth) heredan este layout
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
