import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "@fontsource/poppins";
import Reviews from "./pages/Reviews";
import Login from './pages/Login.js';
import Profile from "./pages/Profile";
import CrudTable from "./pages/CrudTable";
import Edit from "./pages/Edit";
import PetRegister from "./pages/PetRegister";
import Register from './pages/UserRegistration';
import { useState } from "react";
import { setTokenExpiredModalSetter } from "./axios";
import TokenExpiredModal from "./Components/TokenExpiredModal";
import StaffHeader from "./Components/StaffHeader";
import PetOwnerHeader from "./Components/PetOwnerHeader";

function App() {
  const [tokenExpiredModalOpen, setTokenExpiredModalOpen] = useState(false);
  const userRole = localStorage.getItem("userRole") || 'petowner'; // Default to petowner

  // Set the modal setter in axios
  setTokenExpiredModalSetter(setTokenExpiredModalOpen);

  // Select header based on role
  const renderHeader = () => {
    return (userRole === "staff" || userRole === "admin") 
      ? <StaffHeader /> 
      : <PetOwnerHeader />;
  };
  

  return (
    <>
      {renderHeader()}

      <Routes>
        {/* lenoras routes */}
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />

        {/* najiths routes */}
        <Route path='/registerpet' element={<PetRegister />} />

        <Route path='/CrudTable' element={
          userRole === "petowner" ? <CrudTable /> : <Home />
        } />
        <Route path='/Edit/:id' element={
          userRole === "petowner" ? <Edit /> : <Home />
        } />

        {/* Fallback for invalid routes */}
        <Route path="*" element={<Home />} />
      </Routes>

      <TokenExpiredModal 
        open={tokenExpiredModalOpen} 
        onClose={() => setTokenExpiredModalOpen(false)} 
      />
    </>
  );
}

export default App;