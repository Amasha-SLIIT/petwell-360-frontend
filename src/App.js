import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import "@fontsource/poppins";

// Common Components]
import Footer from './components/Footer';
import TokenExpiredModal from "./components/TokenExpiredModal";
import StaffHeader from "./components/StaffHeader";
import PetOwnerHeader from "./components/PetOwnerHeader";

// Pages from Lenora's work
import Home from "./pages/Home";
import Reviews from "./pages/Reviews";
import Login from './pages/Login.js';
import Profile from "./pages/Profile";
import CrudTable from "./pages/CrudTable";
import Edit from "./pages/Edit";
import PetRegister from "./pages/PetRegister";
import Register from './pages/UserRegistration';

// Pages from amasha's work
import Appointment from './pages/Appointment';
import Reports from './pages/Reports';
import DoctorAppointmentView from './pages/DoctorAppointmentView';

// Pages from Nileka's work
import AddInventory from './components/addInventory';
import AllInventory from './components/AllInventory';
import UpdateInventory from './components/updateInventory';
import InventoryDashboard from './components/InventoryDashboard';
import PetStore from './components/AllInventoryView';


import { setTokenExpiredModalSetter } from "./axios";

// MUI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Poppins, sans-serif',
  },
});

function App() {
  const [tokenExpiredModalOpen, setTokenExpiredModalOpen] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const userRole = localStorage.getItem("userRole") || 'petowner';
  setTokenExpiredModalSetter(setTokenExpiredModalOpen);

  const renderHeader = () => {
    return (userRole === "staff" || userRole === "admin")
      ? <StaffHeader />
      : <PetOwnerHeader />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {renderHeader()}
          <Box component="main" sx={{ flexGrow: 1, pt: 8, px: 2 }}>
            <Routes>
              {/* Lenora's Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />

              {/* najith's Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/registerpet" element={<PetRegister />} />
              <Route path="/CrudTable" element={userRole === "petowner" ? <CrudTable /> : <Home />} />
              <Route path="/Edit/:id" element={userRole === "petowner" ? <Edit /> : <Home />} />

              {/* amasha's Routes */}
              <Route path="/appointments" element={<Appointment />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/doctorAppointments" element={<DoctorAppointmentView />} />

              {/* Nileka's Routes */}
              <Route path="/addInventory" element={<AddInventory />} />
              <Route path="/allInventory" element={<AllInventory />} />
              <Route path="/updateInventory/:id" element={<UpdateInventory />} />
              <Route path="/inventoryDashboard" element={<InventoryDashboard />} />
              <Route path="/petStore" element={<PetStore />} />

              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
     

      <TokenExpiredModal
        open={tokenExpiredModalOpen}
        onClose={() => setTokenExpiredModalOpen(false)}
      />
    </ThemeProvider>
  );
}

export default App;
