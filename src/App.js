import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "@fontsource/poppins";
import Reviews from "./pages/Reviews";
import Login from './pages/Login.js';
//import Navbar from "./Components/Navbar"; 

function App() {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      
    </>
  );
}

export default App;
