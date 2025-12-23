'use client';

import { useCursos } from "@/features/cursos/hooks/use-cursos";
import { useAuth } from "@/shared/contexts/auth-context";
import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: cursos} = useCursos(true);

  const stats = [
    {
      title: 'Cursos Activos',
      value: cursos?.length || 0,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
  ]
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido, {user?.nombre || user?.email}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
        Panel de control - {user?.rol}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Sección de acciones rápidas */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Acciones rápidas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Nuevo curso
          </Button>
        </Box>
      </Box>
    </Container>
  );
}