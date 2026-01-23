'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Toolbar,
  Box,
  Typography,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import stripeIcon from '../../../assets/stripe-icon-blue-background.webp';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 70;

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Payments', path: '/payments', icon: <PaymentIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isSmallScreen = useMediaQuery('(max-width:1200px)');
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCollapsed(isSmallScreen);
    }
  }, [isSmallScreen, mounted]);

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
          color: 'white',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar sx={{ px: collapsed ? 1.5 : 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          marginLeft: collapsed ? 0 : -1.5,
          gap: 1, 
          width: '100%',
        }}>
          <Image src={stripeIcon} alt="Stripe Logo" width={50} height={50} />
          {!collapsed && (
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: 16, minWidth:300, backgroundColor: 'inherit' }}>
              Stripe-Dashboard
            </Typography>
          )}
        </Box>
      </Toolbar>
      
      <List sx={{ px: collapsed ? 0 : 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                px: collapsed ? 2 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 91, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 91, 255, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                alignContent: 'center',
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
