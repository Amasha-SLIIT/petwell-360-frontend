import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "@fontsource/poppins";
import Reviews from "./pages/Reviews";
import Login from './pages/Login.js';
import AdminDashboard from './pages/AdminDashboard.js'
import Articles from './pages/Articles.js'
import DoctorDashboard from './pages/DoctorDashboard.js'
import Register from './pages/Register.js'
import Profile from './pages/Profile.js'
import Apoinments from './pages/Apoinments.js'
//import Navbar from "./Components/Navbar"; 

function App() {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Apoinments />} />
      </Routes>
      
    </>
  );
}

export default App;
