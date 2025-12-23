'use client';

import { Navbar } from '@/shared/components/layout/navbar';
import { Sidebar } from '@/shared/components/layout/sidebar';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: {xs: 2, sm: 3},
          mt: 8,
          ml: {md: "240px"},
        }}
      >
        {children}
      </Box>
    </>
  );
}
