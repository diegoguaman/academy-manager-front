'use client';

import { Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useUiStore } from '@/shared/stores/ui-store';

export function Sidebar() {
  const isOpen = useUiStore((state) => state.isSidebarOpen);
  const setOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)}>
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Cursos" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Cursos" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Cursos" />
          </ListItemButton>
        </ListItem>
        {/* Más items */}
      </List>
    </Drawer>
  );
}