import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Header from './components/Header';
import Footer from './components/Footer';

import Appointment from './pages/Appointment';
import Reports from './pages/Reports';

import AddInventory from './components/addInventory';
import AllInventory from './components/AllInventory';
import UpdateInventory from './components/updateInventory';
import InventoryDashboard from './components/InventoryDashboard';

// MUI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header setOpenLogoutModal={setOpenLogoutModal} />
          <Box component="main" sx={{ flexGrow: 1, pt: 8, px: 2 }}>
            <Routes>
              {/* Appointment & Reports */}
              <Route path="/appointments" element={<Appointment />} />
              <Route path="/reports" element={<Reports />} />

              {/* Inventory Management */}
              <Route path="/" element={<InventoryDashboard />} />
              <Route path="/addInventory" element={<AddInventory />} />
              <Route path="/allInventory" element={<AllInventory />} />
              <Route path="/updateInventory/:id" element={<UpdateInventory />} />
              <Route path="/inventoryDashboard" element={<InventoryDashboard />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
