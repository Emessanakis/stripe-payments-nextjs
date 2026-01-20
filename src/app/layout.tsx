import type { Metadata } from 'next';
import Sidebar from './components/Sidebar/Sidebar';
import { Box, CssBaseline } from '@mui/material';

export const metadata: Metadata = {
  icons: {
    icon: '/stripe-app-icon.ico',
  },
};

export default function RootLayout({ children } : {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: '#f5f5f5',
              minHeight: '100vh',
            }}
          >
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}
