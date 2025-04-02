import React, { useState } from "react";
import '../styles/login.css';
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent page reload
  
    console.log(" Sending login request with:", { email, password });
    try {

      const response = await axios.post('http://localhost:5000/auth/login', { email, password });
      console.log("Login successful:", response.data);
  
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        console.log("Stored Token:", localStorage.getItem('authToken')); // Check if token is stored
      } else {
        console.error("No token received from backend");
      }
  
      window.location.href = '/'; 
  
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };
  

  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <Header />
      <br /><br /><br /><br />
      <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ background: "#fff", borderRadius: "20px", padding: 6, width: "80%", boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1565C0", mb: 2, textAlign: "center" }}>
            Welcome Back!
          </Typography>
          {error && <Typography color="error" sx={{ textAlign: "center" }}>{error}</Typography>}
          <br />
          {/* Styled TextFields */}
          <TextField
            variant="outlined"
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.6)",
              borderRadius: "10px",
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: "10px",
                },
              },
            }}
          />
          <TextField
            variant="outlined"
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.6)",
              borderRadius: "10px",
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: "10px",
                },
              },
            }}
          />
          <br /><br />
          {/* Styled Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              background: "linear-gradient(135deg, #1565C0, #0D47A1)",
              color: "#fff",
              width: "200px",
              display: "block",
              alignItems: "center",
              borderRadius: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "12px",
              transition: "0.3s",
              margin: "0 auto",
              "&:hover": { background: "#0D47A1", transform: "scale(1.05)" },
            }}
          >
            Log In
          </Button>
        </Box>
      </Container>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </Box>
  );
};

export default Login;
